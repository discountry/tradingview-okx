# Tradingview OKX example

This is an example of how to use the [Tradingview Charting Library](https://github.com/tradingview/charting-library-examples/) with [Next.js](https://nextjs.org/) and [OKX API](https://www.okx.com/docs-v5/).

## Live Preview

Show case example:

* [RitMEX Trade](https://trade.ritmex.one/)

## Dependencies

- [Tradingview Charting Library](https://github.com/tradingview/charting-library-examples/)
- [Next.js v13](https://nextjs.org/)
- [OKX API](https://www.okx.com/docs-v5/)

## Project Structure

```bash

├── components
│   ├── TVChartContainer
│   │   ├── index.tsx
│   │   └── index.module.css
├── pages
│   ├── api
│   │   └── okx-api.ts
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.module.css
│   └── index.tsx
├── services
│   ├── okx
│   │   ├── datafeed.ts
│   │   └── streaming.ts
│   └── index.ts
├── styles
│   ├── global.css
│   └── index.ts

```

## Getting Started

1. Check that you can view <https://github.com/tradingview/charting_library/>. If you do not have access then you can [request access to this repository here](https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/).
2. Copy the charting library files
    1. If you are able to run bash scripts then the `copy_charting_library_files.sh` script can be used to copy the current stable version's files.
    2. If you are not able to run bash scripts then do the following:
        1. Copy `charting_library` folder from <https://github.com/tradingview/charting_library/> to `/public/static` folders.
        2. Copy `datafeeds` folder from <https://github.com/tradingview/charting_library/> to `/public/static`.

Then, run the development server:

```bash
npm install
npm run dev
# or
yarn
yarn dev
# or
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdiscountry%2Ftradingview-okx)
