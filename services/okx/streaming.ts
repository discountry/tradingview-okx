import { parseFullSymbol } from "./helpers";

export const OKX_RESOLUSION = {
  1: "1m",
  3: "3m",
  5: "5m",
  15: "15m",
  60: "1H",
  120: "2H",
  240: "4H",
  360: "6H",
  720: "12H",
  "1D": "1D",
  "2D": "2D",
  "3D": "3D",
  "1W": "1W",
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
    this.socket = new WebSocket("wss://ws.okx.com:8443/ws/v5/business");

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
      const { channel, instId } = JSON.parse(data).arg;
      const { data: kline } = JSON.parse(data);

      if (!kline) {
        // Skip all non-trading events
        return;
      }
      const tradePrice = parseFloat(kline[0][4]);
      const tradeTime = parseInt(kline[0][0]);
      const channelString = `${channel}~${instId}`;
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
      const channelString = `candle${
        OKX_RESOLUSION[resolution as keyof typeof OKX_RESOLUSION]
      }~${parsedSymbol.instId}`;
      console.log("channelString", channelString);
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

      this.emit("subscribe", [
        {
          channel: `candle${
            OKX_RESOLUSION[resolution as keyof typeof OKX_RESOLUSION]
          }`,
          instId: parsedSymbol.instId,
        },
      ]);
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
          const [channel, instId] = channelString.split("~");
          this.emit("unsubscribe", [
            {
              channel,
              instId,
            },
          ]);
          this.channelToSubscription.delete(channelString);
          break;
        }
      }
    }
  }

  emit(method: string, args: any) {
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.log("[socket] Socket is not open, cannot subscribe");
      return;
    } else {
      this.socket.send(
        JSON.stringify({
          op: method,
          args: args,
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
