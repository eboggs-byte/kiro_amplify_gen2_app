import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  chat: a
    .conversation({
      aiModel: a.ai.model("Claude 3.5 Haiku"),
      systemPrompt: "You are a helpful AI assistant.",
    })
    .authorization((allow) => allow.owner()),

  // Simple generation route
  generateResponse: a
    .generation({
      aiModel: a.ai.model("Claude 3.5 Haiku"),
      systemPrompt: "You are a helpful assistant. Always provide a response.",
    })
    .arguments({
      prompt: a.string().required(),
    })
    .returns(
      a.customType({
        response: a.string(),
        error: a.string(),
      })
    )
    .authorization((allow) => allow.authenticated()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});