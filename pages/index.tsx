import dynamic from "next/dynamic";
import Head from "next/head";
import { useState } from "react";
// import Script from "next/script";

import {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from "@/public/static/charting_library/charting_library";
import { save_load_adapter } from "@/services/binance/saveLoadAdapter";

const defaultWidgetProps: Partial<ChartingLibraryWidgetOptions> = {
  symbol: "Binance:BTC/USDT",
  theme: "dark",
  timezone: "Asia/Hong_Kong",
  interval: "1D" as ResolutionString,
  library_path: "/static/charting_library/",
  locale: "en",
  charts_storage_url: "https://saveload.tradingview.com",
  charts_storage_api_version: "1.1",
  save_load_adapter: save_load_adapter,
  client_id: "tradingview.com",
  user_id: "public_user_id",
  fullscreen: false,
  autosize: true,
};

const TVChartContainer = dynamic(
  () =>
    import("@/components/TVChartContainer").then((mod) => mod.TVChartContainer),
  { ssr: false }
);

export default function Home() {
  const [isScriptReady, setIsScriptReady] = useState(false);
  return (
    <>
      <Head>
        <title>TradingView & Next.js v13</title>
      </Head>
      {/* <Script
        src="/static/datafeeds/udf/dist/bundle.js"
        strategy="lazyOnload"
        onReady={() => {
          setIsScriptReady(true);
        }}
      /> */}
      {/* {isScriptReady && <TVChartContainer {...defaultWidgetProps} />} */}
      <TVChartContainer {...defaultWidgetProps} />
    </>
  );
}
