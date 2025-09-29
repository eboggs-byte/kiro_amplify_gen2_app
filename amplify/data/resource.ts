import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  // 🗄️ CONVERSATION MODEL - Stores chat sessions
  Conversation: a
    .model({
      title: a.string().required(),
      businessIdea: a.string(), // Optional: store business context
      targetMarket: a.string(), // Optional: store target market
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
      messages: a.hasMany('Message', 'conversationId'), // Add the hasMany relationship
    })
    .authorization((allow) => [allow.owner()]),

  // 💬 MESSAGE MODEL - Stores individual chat messages
  Message: a
    .model({
      conversationId: a.id().required(),
      content: a.string().required(),
      role: a.enum(['user', 'assistant']),
      timestamp: a.datetime().required(),
      conversation: a.belongsTo('Conversation', 'conversationId'),
    })
    .authorization((allow) => [allow.owner()]),

  // 🤖 AI GENERATION - Your existing Claude integration
  generateResponse: a
    .generation({
      aiModel: a.ai.model("Claude 3.5 Sonnet"),
      systemPrompt: `You are a knowledgeable AWS and cloud computing assistant with deep expertise. You can help with:

- AWS services and their use cases (EC2, S3, Lambda, RDS, DynamoDB, CloudFormation, etc.)
- Cloud architecture patterns and best practices
- AWS pricing, cost optimization, and billing
- DevOps, CI/CD, and deployment strategies
- Security, IAM, compliance, and governance on AWS
- Serverless computing and microservices
- Database solutions and data analytics
- Networking, VPC, CDN, and edge services
- Monitoring, logging, and observability
- Infrastructure as Code (CloudFormation, CDK, Terraform)
- Container services (ECS, EKS, Fargate)
- Machine Learning and AI services on AWS

Provide detailed, comprehensive answers with practical examples, code snippets when relevant, and step-by-step guidance. Feel free to give thorough explanations and multiple approaches to problems.`,
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