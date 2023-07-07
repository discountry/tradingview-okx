// Makes requests to Binance API
export async function makeApiRequest(path: string) {
  try {
    const response = await fetch(`/api/binance/${path}`);
    return response.json();
  } catch (error) {
    throw new Error(`[Binance] request error: ${error}`);
  }
}

export async function makeBinanceRequest(path: string) {
  try {
    const response = await fetch(`https://api.binance.com/${path}`);
    return response.json();
  } catch (error) {
    throw new Error(`[Binance] request error: ${error}`);
  }
}

// Generates a symbol ID from a pair of the coins
export function generateSymbol(
  exchange: string,
  fromSymbol: string,
  toSymbol: string
) {
  const short = `${fromSymbol}/${toSymbol}`;
  return {
    short,
    full: `${exchange}:${short}`,
  };
}

export function parseFullSymbol(fullSymbol: string) {
  const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
  if (!match) {
    return null;
  }
  return { exchange: match[1], symbol: `${match[2]}${match[3]}` };
}

export function priceScale(tickSize: string | number) {
  if (Number(tickSize) >= 1) {
    return Math.pow(10, Number(tickSize));
  } else {
    return Math.round(1 / parseFloat(String(tickSize)));
  }
}
