import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { stripe } from "../../stripe/client";

export const stripeRouter = createTRPCRouter({
  customer: publicProcedure
    .input(z.object({ appUserId: z.string() }))
    .query(async ({ input: { appUserId } }) => {
      const searchedCus = await stripe.customers.search({
        query: `name:"${appUserId}"`,
        expand: ["data.subscriptions"],
      });
      const customer = searchedCus.data[0];

      return {
        customer,
      };
    }),
  products: publicProcedure.query(async () => {
    const products = await stripe.products.list();

    return {
      products: products.data,
    };
  }),
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        appUserId: z.string(),
        priceId: z.string(),
      })
    )
    .mutation(async ({ input: { appUserId, priceId } }) => {
      const searchedCus = await stripe.customers.search({
        query: `name:"${appUserId}"`,
        expand: ["data.subscriptions"],
      });
      let customer = searchedCus.data[0];

      if (!customer) {
        customer = await stripe.customers.create({
          name: appUserId,
          metadata: {
            appUserId,
          },
        });
      }

      const subscription = customer.subscriptions?.data[0];
      if (subscription) {
        throw new Error(`Already has subscription:${subscription.id}`);
      }

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: "subscription",
        line_items: [
          {
            // 月額プラン
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          appUserId,
        },
        success_url:
          "http://localhost:3000/checkout-session/success?checkout_session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:3000/checkout-session/failure",
      });

      if (!session.url) {
        throw new Error("no url");
      }

      return {
        checkoutSessionUrl: session.url,
      };
    }),
  checkoutSession: publicProcedure
    .input(
      z.object({
        checkoutSessionId: z.string(),
      })
    )
    .query(async ({ input: { checkoutSessionId } }) => {
      const session = await stripe.checkout.sessions.retrieve(
        checkoutSessionId
      );
      const customer = await stripe.customers.retrieve(
        session.customer as string
      );

      return {
        session,
        customer,
      };
    }),
});
