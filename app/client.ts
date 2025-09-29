"use client";

import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from '../amplify/data/resource';

export const useAmplifyAIClient = () => {
  const { user, authStatus } = useAuthenticator();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only create client when fully authenticated
    if (authStatus === 'authenticated' && user) {
      const timer = setTimeout(() => {
        try {
          console.log('🔧 Creating authenticated Amplify client...');
          
          const amplifyClient = generateClient<Schema>({ 
            authMode: 'userPool'
          });
          
          setClient(amplifyClient);
          setIsReady(true);
          setError(null);
          console.log('✅ Amplify AI client ready');
          
        } catch (err) {
          console.error('❌ Error creating Amplify client:', err);
          setError(err instanceof Error ? err.message : 'Failed to initialize AI client');
          setIsReady(false);
        }
      }, 500); // Small delay to ensure auth is fully settled

      return () => clearTimeout(timer);
    } else {
      setClient(null);
      setIsReady(false);
      setError(null);
    }
  }, [authStatus, user]);

  const sendMessage = useCallback(async (prompt: string) => {
    if (!client || !isReady || !prompt.trim()) {
      throw new Error('AI client not ready or empty message');
    }

    if (authStatus !== 'authenticated' || !user) {
      throw new Error('User not authenticated');
    }

    console.log('🚀 Sending message to Claude:', prompt);
    
    try {
      const response = await client.generations.generateResponse({
        prompt: prompt.trim(),
      });

      console.log('📥 Claude response received:', response);

      // Handle successful response
      if (response.data?.response && response.data.response.trim()) {
        console.log('✅ Valid response from Claude');
        return response.data.response.trim();
      }

      // Handle errors in response
      if (response.errors && response.errors.length > 0) {
        const errorMsg = response.errors[0].message;
        console.error('❌ Claude API error:', errorMsg);
        
        // Provide user-friendly error messages
        if (errorMsg.includes('mapping template')) {
          throw new Error('AI service configuration error. Please check Bedrock model access.');
        } else if (errorMsg.includes('Validation error')) {
          throw new Error('Backend service not properly deployed. Please redeploy.');
        } else if (errorMsg.includes('Unauthorized') || errorMsg.includes('Access')) {
          throw new Error('Authentication error. Please sign out and sign back in.');
        } else {
          throw new Error(`AI service error: ${errorMsg}`);
        }
      }

      // Handle empty response
      console.error('❌ Empty response from Claude');
      throw new Error('No response from AI service. Please try again.');

    } catch (error: any) {
      console.error('❌ Failed to get response from Claude:', error);
      
      // Re-throw with user-friendly message if it's already formatted
      if (error.message.includes('AI service') || 
          error.message.includes('Authentication') || 
          error.message.includes('Backend service')) {
        throw error;
      }
      
      // Handle network and other errors
      if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        throw new Error('Network connection error. Please check your internet connection.');
      }
      
      // Generic error fallback
      throw new Error('Failed to communicate with AI service. Please try again.');
    }
  }, [client, isReady, authStatus, user]);

  return {
    client,
    isReady,
    error,
    sendMessage,
    isAuthenticated: authStatus === 'authenticated'
  };
};
