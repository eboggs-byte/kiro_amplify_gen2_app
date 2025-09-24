import { generateClient } from 'aws-amplify/api';
import type { Schema } from '../amplify/data/resource';
import { createAIHooks } from '@aws-amplify/ui-react-ai';

export const client = generateClient<Schema>({ authMode: "userPool" });
export const { useAIConversation } = createAIHooks(client);
