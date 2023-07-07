export default class DataFeed
  implements TradingView.IExternalDatafeed, TradingView.IDatafeedChartApi
{
  public async onReady(callback: TradingView.OnReadyCallback) {
    console.log("[onReady]: Method call");
  }
  public async searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: TradingView.SearchSymbolsCallback
  ) {
    console.log("[searchSymbols]: Method call");
  }
  public async resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: TradingView.ResolveCallback,
    onResolveErrorCallback: TradingView.ErrorCallback,
    extension: TradingView.SymbolResolveExtension
  ) {
    console.log("[resolveSymbol]: Method call", symbolName);
  }
  public async getBars(
    symbolInfo: TradingView.LibrarySymbolInfo,
    resolution: TradingView.ResolutionString,
    periodParams: TradingView.PeriodParams,
    onHistoryCallback: TradingView.HistoryCallback,
    onErrorCallback: TradingView.ErrorCallback
  ) {
    console.log("[getBars]: Method call", symbolInfo);
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
  }
  public async unsubscribeBars(subscriberUID: string) {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
  }
}
