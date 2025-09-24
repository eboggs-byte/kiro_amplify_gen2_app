import { defineAuth } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource for Chat Application
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
  },
});
