import type { NextApiRequest, NextApiResponse } from "next";
// import { env } from "../../../env.mjs";
import { stripe } from "../../../server/stripe/client";

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const event = stripe.webhooks.constructEvent(
    req.body as string,
    req.headers["stripe-signature"] ?? "",
    "whsec_test"
  );

  console.log(event.type, event.id, event.data);

  res.status(200);
};

export default handler;
