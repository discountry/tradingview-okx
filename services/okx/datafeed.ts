import {
  generateSymbol,
  makeApiRequest,
  parseFullSymbol,
  priceScale,
} from "./helpers";
import SocketClient, { OKX_RESOLUSION } from "./streaming";

const configurationData: TradingView.DatafeedConfiguration = {
  // Represents the resolutions for bars supported by your datafeed
  supported_resolutions: [
    "5",
    "15",
    "1H",
    "4H",
    "1D",
    "3D",
    "1W",
    "1M",
  ] as TradingView.ResolutionString[],
  // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
  exchanges: [{ value: "OKX", name: "OKX", desc: "OKX" }],
  // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
  symbols_types: [{ name: "crypto", value: "crypto" }],
};

export interface DataFeedOptions {
  SymbolInfo?: TradingView.LibrarySymbolInfo;
  DatafeedConfiguration?: TradingView.DatafeedConfiguration;
  getBars?: TradingView.IDatafeedChartApi["getBars"];
}

export default class DataFeed
  implements TradingView.IExternalDatafeed, TradingView.IDatafeedChartApi
{
  private options: DataFeedOptions;
  private lastBarsCache: Map<string, TradingView.Bar>;
  private socket!: SocketClient;

  constructor(options: DataFeedOptions) {
    this.options = options;
    this.lastBarsCache = new Map();
    if (!options) {
      this.options.DatafeedConfiguration = configurationData;
    }
  }
  public async onReady(callback: TradingView.OnReadyCallback) {
    console.log("[onReady]: Method call");
    setTimeout(() => callback(configurationData));
    this.socket = new SocketClient();
  }

  public async searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: TradingView.SearchSymbolsCallback
  ) {
    console.log("[searchSymbols]: Method call");
    const symbols = await this.getAllSymbols();
    const newSymbols = symbols.filter((symbol) => {
      const isExchangeValid = exchange === "" || symbol.exchange === exchange;
      const isFullSymbolContainsInput =
        symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
      return isExchangeValid && isFullSymbolContainsInput;
    });
    onResultReadyCallback(newSymbols);
  }

  private async getAllSymbols() {
    const data = await makeApiRequest(
      "api/v5/public/instruments?instType=SPOT"
    );

    let allSymbols: any[] = [];

    for (const exchange of configurationData.exchanges!) {
      const pairs = data.data;

      for (const pair of pairs) {
        const symbolInfo = generateSymbol(
          exchange.value,
          pair.baseCcy,
          pair.quoteCcy
        );
        const symbol = {
          symbol: symbolInfo.short,
          full_name: symbolInfo.full,
          description: symbolInfo.short,
          exchange: exchange.value,
          type: "crypto",
          tickSize: pair.tickSz,
        };
        allSymbols = [...allSymbols, symbol];
      }
    }

    return allSymbols;
  }

  public async resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: TradingView.ResolveCallback,
    onResolveErrorCallback: TradingView.ErrorCallback,
    extension: TradingView.SymbolResolveExtension
  ) {
    const symbols = await this.getAllSymbols();
    const symbolItem = symbols.find(
      ({ full_name }) => full_name === symbolName
    );
    if (!symbolItem) {
      console.log("[resolveSymbol]: Cannot resolve symbol", symbolName);
      onResolveErrorCallback("Cannot resolve symbol");
      return;
    }
    // Symbol information object
    const symbolInfo: Partial<TradingView.LibrarySymbolInfo> = {
      ticker: symbolItem.full_name,
      name: symbolItem.symbol,
      description: symbolItem.description,
      type: symbolItem.type,
      session: "24x7",
      timezone: "Etc/UTC",
      exchange: symbolItem.exchange,
      minmov: 1,
      pricescale: priceScale(symbolItem.tickSize),
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: false,
      visible_plots_set: "ohlcv",
      supported_resolutions: configurationData.supported_resolutions!,
      volume_precision: 2,
      data_status: "streaming",
    };
    console.log("[resolveSymbol]: Symbol resolved", symbolName);
    onSymbolResolvedCallback(symbolInfo as TradingView.LibrarySymbolInfo);
  }

  public async getBars(
    symbolInfo: TradingView.LibrarySymbolInfo,
    resolution: TradingView.ResolutionString,
    periodParams: TradingView.PeriodParams,
    onHistoryCallback: TradingView.HistoryCallback,
    onErrorCallback: TradingView.ErrorCallback
  ) {
    const { from, to, firstDataRequest } = periodParams;

    const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
    if (parsedSymbol) {
      const urlParameters = {
        instId: parsedSymbol.instId,
        bar: OKX_RESOLUSION[resolution as keyof typeof OKX_RESOLUSION],
        before: from * 1000,
        after: to * 1000,
        limit: 300,
      };
      const query = Object.keys(urlParameters)
        .map(
          (name) =>
            `${name}=${encodeURIComponent(
              urlParameters[name as keyof typeof urlParameters]
            )}`
        )
        .join("&");
      try {
        const data = await makeApiRequest(`api/v5/market/candles?${query}`);

        if ((data.msg !== "" && data.code !== "0") || data.data.length === 0) {
          // "noData" should be set if there is no data in the requested period
          onHistoryCallback([], { noData: true });
          return;
        }
        let bars: {
          time: number;
          low: any;
          high: any;
          open: any;
          close: any;
          volume: any;
        }[] = [];
        data.data.reverse().forEach((bar: string[]) => {
          if (parseInt(bar[0]) >= from * 1000 && parseInt(bar[0]) < to * 1000) {
            bars = [
              ...bars,
              {
                time: parseInt(bar[0]),
                open: parseFloat(bar[1]),
                high: parseFloat(bar[2]),
                low: parseFloat(bar[3]),
                close: parseFloat(bar[4]),
                volume: parseFloat(bar[5]),
              },
            ];
          }
        });
        if (firstDataRequest) {
          this.lastBarsCache.set(symbolInfo.full_name, {
            ...bars[bars.length - 1],
          });
        }
        console.log(`[getBars]: returned ${bars.length} bar(s)`);
        onHistoryCallback(bars, { noData: false });
      } catch (error) {
        console.log("[getBars]: Get error", error);
        onErrorCallback(error as string);
      }
    }
  }

  public async subscribeBars(
    symbolInfo: TradingView.LibrarySymbolInfo,
    resolution: TradingView.ResolutionString,
    onRealtimeCallback: TradingView.SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void
  ) {
    console.log(
      "[subscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
    this.socket.subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      this.lastBarsCache.get(symbolInfo.full_name)
    );
  }

  public async unsubscribeBars(subscriberUID: string) {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
    this.socket.unsubscribeFromStream(subscriberUID);
  }
}
