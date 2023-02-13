import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { env } from "../../../env.mjs";

export const revenueCatRouter = createTRPCRouter({
  relations: publicProcedure
    .input(z.object({ appUserId: z.string() }))
    .query(async ({ input: { appUserId } }) => {
      const result = await fetch(
        `https://api.revenuecat.com/v1/subscribers/${appUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Platform": "stripe",
            Authorization: `Bearer ${env.REVENUECAT_STRIPE_APP_PUBLIC_API_KEY}`,
          },
        }
      );

      const data: unknown = await result.json();

      return {
        data,
      };
    }),
  relateSubscription: publicProcedure
    .input(
      z.object({
        appUserId: z.string(),
        subscriptionId: z.string(),
      })
    )
    .mutation(async ({ input: { appUserId, subscriptionId } }) => {
      /**
       * curl -X POST \
       *   https://api.revenuecat.com/v1/receipts \
       *   -H 'Content-Type: application/json' \
       *   -H 'X-Platform: stripe' \
       *   -H 'Authorization: Bearer YOUR_REVENUECAT_STRIPE_APP_PUBLIC_API_KEY' \
       *   -d '{ "app_user_id": "my_app_user_id",
       *   "fetch_token": "sub_xxxxxxxxxx"
       *   }'
       */
      const result = await fetch("https://api.revenuecat.com/v1/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Platform": "stripe",
          Authorization: `Bearer ${env.REVENUECAT_STRIPE_APP_PUBLIC_API_KEY}`,
        },
        body: JSON.stringify({
          app_user_id: appUserId,
          fetch_token: subscriptionId,
        }),
      });

      const data: unknown = await result.json();

      return {
        data,
      };
    }),
});
