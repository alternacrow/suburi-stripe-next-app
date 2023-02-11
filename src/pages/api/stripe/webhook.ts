import type { NextApiRequest, NextApiResponse } from "next";
import { env } from "../../../env.mjs";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  console.log(JSON.stringify({ req, res }, null, 2));
};

export default handler;
