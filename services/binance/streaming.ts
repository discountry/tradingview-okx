import { parseFullSymbol } from "./helpers";

export const BINANCE_RESOLUSION = {
  1: "1m",
  3: "3m",
  5: "5m",
  15: "15m",
  60: "1h",
  120: "2h",
  240: "4h",
  360: "6h",
  720: "12h",
  "1D": "1d",
  "2D": "2d",
  "3D": "3d",
  "1W": "1w",
  "1M": "1M",
};
export default class SocketClient {
  socket!: WebSocket;
  channelToSubscription!: Map<string, any>;

  constructor() {
    console.log("[SocketClient] init");
    this._createSocket();
  }

  _createSocket() {
    this.socket = new WebSocket("wss://data-stream.binance.vision/ws");

    this.channelToSubscription = new Map();

    this.socket.addEventListener("connect", () => {
      console.log("[socket] Connected");
    });

    this.socket.addEventListener("disconnect", (reason: any) => {
      console.log("[socket] Disconnected:", reason);
    });

    this.socket.addEventListener("error", (error: any) => {
      console.log("[socket] Error:", error);
    });

    this.socket.addEventListener("message", ({ data }) => {
      // console.log("[socket] Message:", data);
      const { E: time, k: kline } = JSON.parse(data);

      if (!kline) {
        // Skip all non-trading events
        return;
      }
      const tradePrice = parseFloat(kline.c);
      const tradeTime = parseInt(time);

      const channelString = `${kline.s.toLowerCase()}@kline_${kline.i}`;
      const subscriptionItem = this.channelToSubscription.get(channelString);
      if (subscriptionItem === undefined) {
        return;
      }
      const lastDailyBar = subscriptionItem.lastDailyBar;

      const nextDailyBarTime = this.getNextDailyBarTime(lastDailyBar.time);

      let bar: {
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
      };
      if (tradeTime > nextDailyBarTime) {
        bar = {
          time: nextDailyBarTime,
          open: tradePrice,
          high: tradePrice,
          low: tradePrice,
          close: tradePrice,
        };
        console.log("[socket] Generate new bar", bar);
      } else {
        bar = {
          ...lastDailyBar,
          high: Math.max(lastDailyBar.high, tradePrice),
          low: Math.min(lastDailyBar.low, tradePrice),
          close: tradePrice,
        };
        // console.log("[socket] Update the latest bar by", bar);
      }

      subscriptionItem.lastDailyBar = bar;

      // Send data to every subscriber of that symbol
      subscriptionItem.handlers.forEach(
        (handler: { callback: (arg0: any) => any }) => handler.callback(bar)
      );
    });
  }

  public subscribeOnStream(
    symbolInfo: TradingView.LibrarySymbolInfo,
    resolution: TradingView.ResolutionString,
    onRealtimeCallback: TradingView.SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void,
    lastDailyBar: TradingView.Bar | undefined
  ) {
    const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
    if (parsedSymbol) {
      const channelString = `${parsedSymbol.symbol.toLowerCase()}@kline_${
        BINANCE_RESOLUSION[resolution as keyof typeof BINANCE_RESOLUSION]
      }`;

      const handler = {
        id: subscriberUID,
        callback: onRealtimeCallback,
      };
      let subscriptionItem = this.channelToSubscription.get(channelString);
      if (subscriptionItem) {
        // Already subscribed to the channel, use the existing subscription
        subscriptionItem.handlers.push(handler);
        return;
      }
      subscriptionItem = {
        subscriberUID,
        resolution,
        lastDailyBar,
        handlers: [handler],
      };
      this.channelToSubscription.set(channelString, subscriptionItem);
      console.log(
        "[subscribeBars]: Subscribe to streaming. Channel:",
        channelString
      );

      this.emit("SUBSCRIBE", [channelString], 1);
    }
  }

  public unsubscribeFromStream(subscriberUID: string) {
    for (const channelString of this.channelToSubscription.keys()) {
      const subscriptionItem = this.channelToSubscription.get(channelString);
      const handlerIndex = subscriptionItem.handlers.findIndex(
        (handler: { id: string }) => handler.id === subscriberUID
      );

      if (handlerIndex !== -1) {
        // Remove from handlers
        subscriptionItem.handlers.splice(handlerIndex, 1);

        if (subscriptionItem.handlers.length === 0) {
          // Unsubscribe from the channel if it is the last handler
          console.log(
            "[unsubscribeBars]: Unsubscribe from streaming. Channel:",
            channelString
          );

          this.emit("UNSUBSCRIBE", [channelString], 2);
          this.channelToSubscription.delete(channelString);
          break;
        }
      }
    }
  }

  emit(method: string, params: any, id: number) {
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.log("[socket] Socket is not open, cannot subscribe");
      return;
    } else {
      this.socket.send(
        JSON.stringify({
          method,
          params,
          id,
        })
      );
    }
  }

  private getNextDailyBarTime(barTime: number) {
    const date = new Date(barTime);
    date.setDate(date.getDate() + 1);
    return date.getTime();
  }
}
