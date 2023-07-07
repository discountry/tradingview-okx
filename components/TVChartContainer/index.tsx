import {
  ChartingLibraryWidgetOptions,
  LanguageCode,
  ResolutionString,
  widget,
} from "@/public/static/charting_library";
import DataFeed from "@/services/okx/datafeed";
import { useEffect, useRef } from "react";
import styles from "./index.module.css";

export const TVChartContainer = (
  props: Partial<ChartingLibraryWidgetOptions>
) => {
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: props.symbol,
      theme: props.theme,
      // BEWARE: no trailing slash is expected in feed URL
      // datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(
      //   "https://demo_feed.tradingview.com",
      //   undefined,
      //   {
      //     maxResponseLength: 1000,
      //     expectedOrder: "latestFirst",
      //   }
      // ),
      datafeed: new DataFeed({}),
      interval: props.interval as ResolutionString,
      container: chartContainerRef.current,
      library_path: props.library_path,
      locale: props.locale as LanguageCode,
      disabled_features: ["use_localstorage_for_settings", "popup_hints"],
      // enabled_features: ["study_templates", "chart_crosshair_menu"],
      enabled_features: ["study_templates"],
      charts_storage_url: props.charts_storage_url,
      charts_storage_api_version: props.charts_storage_api_version,
      client_id: props.client_id,
      user_id: props.user_id,
      fullscreen: props.fullscreen,
      autosize: props.autosize,
      // overrides: {
      //   "mainSeriesProperties.priceAxisProperties.log": false,
      // },
    };

    const tvWidget = new widget(widgetOptions);

    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton();
        button.setAttribute("title", "Click to show a notification popup");
        button.classList.add("apply-common-tooltip");
        button.addEventListener("click", () =>
          tvWidget.showNoticeDialog({
            title: "Notification",
            body: "TradingView Charting Library API works correctly",
            callback: () => {
              console.log("Noticed!");
            },
          })
        );

        button.innerHTML = "Check API";

        const priceScale = tvWidget
          .activeChart()
          .getPanes()[0]
          .getRightPriceScales()[0];
        priceScale.setMode(1);

        // tvWidget.subscribe("onPlusClick", (params) => {
        //   // TODO: Add custom logic here
        //   tvWidget
        //     .activeChart()
        //     .createShape(
        //       { price: params.price, time: Date.now() },
        //       { shape: "horizontal_line" }
        //     );
        // });
      });
    });

    return () => {
      tvWidget.remove();
    };
  }, [props]);

  return (
    <>
      {/* <header className={styles.VersionHeader}>
        <h1>TradingView Charting Library and Next.js Integration Example</h1>
      </header> */}
      <div ref={chartContainerRef} className={styles.TVChartContainer} />
    </>
  );
};
