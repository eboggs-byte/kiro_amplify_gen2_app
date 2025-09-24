import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  chat: a
    .conversation({
      aiModel: a.ai.model("Claude 3 Haiku"),
      systemPrompt:
        "You are a helpful AI assistant. Provide clear, concise, and helpful responses to user questions.",
    })
    .authorization((allow) => allow.owner()),

  // Add generation route for reliable AI responses
  generateResponse: a
    .generation({
      aiModel: a.ai.model("Claude 3 Haiku"),
      systemPrompt: "You are a helpful AI assistant. Provide clear, concise, and helpful responses to user questions.",
    })
    .arguments({
      prompt: a.string(),
    })
    .returns(
      a.customType({
        response: a.string(),
      })
    )
    .authorization((allow) => allow.authenticated()),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});