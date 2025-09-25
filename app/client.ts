import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { createAIHooks } from '@aws-amplify/ui-react-ai';

// Debug logging
console.log('Creating Amplify client...');

export const client = generateClient<Schema>({ authMode: "userPool" });

console.log('Client created:', client);

export const { useAIConversation } = createAIHooks(client);

console.log('AI hooks created');
