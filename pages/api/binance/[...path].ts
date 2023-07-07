// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { makeBinanceRequest } from "@/services/binance/helpers";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const path = req.url?.replace("/api/binance/", "") || "";

  const data = await makeBinanceRequest(path);

  res.status(200).json(data);
}
