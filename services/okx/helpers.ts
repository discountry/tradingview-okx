// Makes requests to OKX API
export async function makeApiRequest(path: string) {
  try {
    const response = await fetch(`/api/okx/${path}`);
    return response.json();
  } catch (error) {
    throw new Error(`OKX request error: ${error}`);
  }
}

export async function makeOKXRequest(path: string) {
  try {
    const response = await fetch(`https://www.okx.com/${path}`);
    return response.json();
  } catch (error) {
    throw new Error(`OKX request error: ${error}`);
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
  return { exchange: match[1], instId: `${match[2]}-${match[3]}` };
}

export function priceScale(tickSize: string) {
  return Math.round(1 / parseFloat(tickSize));
}
