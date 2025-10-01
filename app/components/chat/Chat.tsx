// ============================================================================
// CHAT COMPONENT - AI-Powered Business Strategy Assistant
// ============================================================================
// This component provides the main chat interface for users to interact with
// Claude AI via Amazon Bedrock. It handles conversation management, message
// persistence, and real-time AI responses with business context integration.

"use client";

// ============================================================================
// IMPORTS AND DEPENDENCIES
// ============================================================================
// React hooks for state management and lifecycle
import { useState, useEffect } from "react";
// AWS Amplify client for GraphQL operations and AI generation
import { generateClient } from "aws-amplify/data";

import type { Schema } from "@/amplify/data/resource";
// Business idea data type from the form component
import { BusinessIdeaData } from '../business/BusinessIdeaForm';
// Sign out button component for user authentication
import SignOutButton from "./SignOutButton";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
// Message interface for individual chat messages
interface Message {
    id: string;                    // Unique identifier for the message
    content: string;               // The actual message text content
    role: 'user' | 'assistant';   // Who sent the message (user or AI)
    timestamp: Date;              // When the message was created
}

// Component props interface for business data integration
interface ChatProps {
  businessData?: BusinessIdeaData; // Optional business context from form
}

// ============================================================================
// MAIN CHAT COMPONENT
// ============================================================================
// Purpose: Provides AI chat interface with conversation management
// Features: Real-time messaging, AI responses, conversation persistence
// Integration: Connects to Amazon Bedrock via Amplify for AI capabilities

export default function Chat({ businessData }: ChatProps = {}) {
    // ============================================================================
    // STATE MANAGEMENT - Component State Variables
    // ============================================================================
    // Input state for the message textarea
    const [inputMessage, setInputMessage] = useState("");
    // Debug information for troubleshooting
    const [debugInfo, setDebugInfo] = useState("");
    // Array of all messages in the current conversation
    const [messages, setMessages] = useState<Message[]>([]);
    // Loading state for AI response generation
    const [isLoading, setIsLoading] = useState(false);
    // Test results for Bedrock connection testing
    const [testResult, setTestResult] = useState<string>('');
    // Loading state for Bedrock connection testing
    const [isTesting, setIsTesting] = useState(false);
    // Current conversation ID for database persistence
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    // Loading state for conversation initialization
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // ============================================================================
    // CONVERSATION INITIALIZATION - Database Setup
    // ============================================================================
    // Purpose: Creates a new conversation record in DynamoDB when component mounts
    // Trigger: Runs once when component is first rendered
    // Database: Creates Conversation record with business context
    // State: Sets currentConversationId for message persistence

    useEffect(() => {
        const initializeConversation = async () => {
            setIsLoadingHistory(true);
            try {
                // Create Amplify client with user authentication
                const client = generateClient<Schema>({ authMode: 'userPool' });
                
                // Generate conversation title based on business data
                const conversationTitle = businessData?.businessIdea 
                    ? `Business: ${businessData.businessIdea.substring(0, 50)}${businessData.businessIdea.length > 50 ? '...' : ''}`
                    : `Chat Session ${new Date().toLocaleDateString()}`;

                // Create new business session record in DynamoDB
                const newBusinessSession = await client.models.BusinessSession.create({
                    title: conversationTitle,                    // Display name for the session
                    businessIdea: businessData?.businessIdea || '', // Business context from form
                    targetMarket: businessData?.targetMarket || '', // Target market context
                    createdAt: new Date().toISOString(),         // Creation timestamp
                    updatedAt: new Date().toISOString(),         // Last update timestamp
                });

                // Store session ID for message persistence
                if (newBusinessSession.data?.id) {
                    setCurrentConversationId(newBusinessSession.data.id);
                    console.log('✅ New business session created:', newBusinessSession.data.id);
                }
            } catch (error) {
                console.error('❌ Error creating conversation:', error);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        initializeConversation();
    }, []); // Only run once on mount

    // ============================================================================
    // MESSAGE PERSISTENCE - Database Storage
    // ============================================================================
    // Purpose: Saves individual messages to DynamoDB for conversation history
    // Parameters: content (message text), role (user or assistant)
    // Database: Creates Message record linked to current conversation
    // Usage: Called after each user message and AI response

    const saveMessage = async (content: string, role: 'user' | 'assistant') => {
        if (!currentConversationId) return;

        try {
            // Create Amplify client for database operations
            const client = generateClient<Schema>({ authMode: 'userPool' });
            // Create analysis message record in DynamoDB
            await client.models.AnalysisMessage.create({
                sessionId: currentConversationId,        // Link to current business session
                content: content,                         // Message text content
                role: role,                              // Who sent the message
                timestamp: new Date().toISOString(),    // When message was sent
            });
            console.log(`✅ ${role} message saved to database`);
        } catch (error) {
            console.error(`❌ Error saving ${role} message:`, error);
        }
    };

    // ============================================================================
    // CONTEXTUAL PROMPT GENERATION - Business Context Integration
    // ============================================================================
    // Purpose: Enhances user prompts with business context for better AI responses
    // Input: User's original question
    // Output: Enhanced prompt with business idea and target market context
    // Usage: Provides AI with relevant business information for contextual advice

    const generateContextualPrompt = (userInput: string) => {
        // Return original input if no business context available
        if (!businessData?.businessIdea && !businessData?.targetMarket) {
            return userInput;
        }
        
        // Build contextual prompt with business information
        let context = "=== BUSINESS IDEA ANALYSIS CONTEXT ===\n\n";
        
        if (businessData.businessIdea) {
            context += `💡 BUSINESS IDEA:\n${businessData.businessIdea}\n\n`;
        }
        if (businessData.targetMarket) {
            context += `🎯 TARGET MARKET:\n${businessData.targetMarket}\n\n`;
        }
        
        context += `=== USER QUESTION ===\n${userInput}\n\n`;
        context += `=== INSTRUCTIONS ===\n`;
        context += `You are a business strategy consultant. Based on the business context provided above, please:\n\n`;
        context += `1. FIRST: Provide a brief summary of the business idea and target market\n`;
        context += `2. THEN: Analyze the business concept and identify potential strengths and weaknesses\n`;
        context += `3. FINALLY: Suggest 3-5 strategic questions that would help evaluate if this is a viable business idea\n\n`;
        context += `Focus on practical, actionable insights that help assess market viability, competitive positioning, and business potential.`;
        
        return context;
    };

    // ============================================================================
    // MESSAGE HANDLING - Send Message to AI
    // ============================================================================
    // Purpose: Handles sending user messages to Claude AI via Amazon Bedrock
    // Process: 1. Add user message to UI, 2. Save to database, 3. Get AI response
    // AI Integration: Uses Amplify's generateResponse function with Claude 3.5 Sonnet
    // Error Handling: Comprehensive error handling for different failure scenarios

    const handleSendMessage = async () => {
        // Prevent sending empty messages or while loading
        if (!inputMessage.trim() || isLoading) return;

        console.log('Attempting to send message:', inputMessage);
        setIsLoading(true);

        // Add user message to UI immediately for better UX
        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputMessage,
            role: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        // Store current input and clear textarea
        const currentInput = inputMessage;
        setInputMessage("");

        // Save user message to database for persistence
        await saveMessage(currentInput, 'user');

        try {
            // ============================================================================
            // AI RESPONSE GENERATION - Amazon Bedrock Integration
            // ============================================================================
            // Create fresh Amplify client for each request (prevents connection issues)
            console.log('💬 Starting chat message...');
            const chatClient = generateClient<Schema>({ authMode: 'userPool' });
            console.log('✅ Chat client created');

            // Log prompt details for debugging
            console.log('Original prompt:', currentInput);
            console.log('Prompt length:', currentInput.length);

            // Send prompt to Claude 3.5 Sonnet via Amazon Bedrock
            console.log('Sending full prompt to Claude 3.5 Sonnet');

            // Call Bedrock API with user prompt
            const contextualPrompt = generateContextualPrompt(currentInput);
            console.log('📝 Business analysis prompt:', contextualPrompt.substring(0, 200) + '...');
            
            const response = await chatClient.generations.generateResponse({
                prompt: contextualPrompt
            });

            console.log('📥 Chat response:', response);

            // ============================================================================
            // RESPONSE HANDLING - Process AI Response
            // ============================================================================
            // Handle different response scenarios from Claude AI

            // SUCCESS CASE - Claude returned a valid response
            if (response.data?.response) {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: response.data.response,
                    role: 'assistant',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, assistantMessage]);
                setDebugInfo(""); // Clear debug info on success
                
                // Save AI response to database
                await saveMessage(response.data.response, 'assistant');
            }
            // NULL RESPONSE CASE - Claude returned null (prompt too long/complex)
            else if (response.data?.response === null && response.data?.error === null) {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: `Claude returned null response. This might be due to prompt length (${currentInput.length} chars) or content. Try a shorter, simpler question like "Hello" or "What is AWS?"`,
                    role: 'assistant',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
            }
            // API ERROR CASE - Bedrock returned specific errors
            else if (response.errors && response.errors.length > 0) {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: `API ERROR: ${response.errors[0].message}`,
                    role: 'assistant',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
            }
            // UNKNOWN RESPONSE CASE - Unexpected response format
            else {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: `EMPTY RESPONSE: ${JSON.stringify(response, null, 2)}`,
                    role: 'assistant',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error: any) {
            // CONNECTION ERROR CASE - Network or authentication issues
            console.error('❌ Chat failed:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `CONNECTION FAILED: ${error.message || 'Unknown error'}`,
                role: 'assistant',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================================================
    // KEYBOARD EVENT HANDLING - User Input Shortcuts
    // ============================================================================
    // Purpose: Handles keyboard shortcuts for sending messages
    // Enter: Send message (without Shift)
    // Shift + Enter: New line in textarea

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // ============================================================================
    // BEDROCK CONNECTION TESTING - Debug Functionality
    // ============================================================================
    // Purpose: Tests the connection to Amazon Bedrock and Claude AI
    // Usage: Debug tool to verify AI integration is working
    // Output: Displays test results in the UI

    const testBedrockConnection = async () => {
        setIsTesting(true);
        setTestResult('🔄 Testing Bedrock connection...');

        try {
            console.log('🧪 Starting Bedrock test...');

            // Create test client for Bedrock connection
            const testClient = generateClient<Schema>({ authMode: 'userPool' });
            console.log('✅ Test client created');

            // Send simple test prompt to Claude
            const response = await testClient.generations.generateResponse({
                prompt: 'Say "Hello from Claude!" and nothing else.'
            });

            console.log('📥 Test response:', response);

            // Handle different test response scenarios
            if (response.data?.response) {
                setTestResult(`✅ SUCCESS!\nClaude responded: "${response.data.response}"`);
            } else if (response.errors && response.errors.length > 0) {
                setTestResult(`❌ API ERROR:\n${response.errors[0].message}`);
            } else {
                setTestResult(`❌ EMPTY RESPONSE:\n${JSON.stringify(response, null, 2)}`);
            }
        } catch (error: any) {
            console.error('❌ Test failed:', error);
            setTestResult(`❌ CONNECTION FAILED:\n${error.message || 'Unknown error'}`);
        } finally {
            setIsTesting(false);
        }
    };

  // ============================================================================
  // UI RENDERING - Chat Interface Layout
  // ============================================================================
  // Purpose: Renders the complete chat interface with header, messages, and input
  // Layout: Vertical flex layout with fixed header, scrollable messages, fixed input
  // Styling: Dark theme with modern design and smooth animations

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#1f2937',
      overflow: 'hidden'
    }}>
      {/* ============================================================================
          CHAT HEADER - Top Navigation Bar
          ============================================================================
          Purpose: Displays chat title, status, and user controls
          Features: Online status indicator, sign out button
          Styling: Dark background with subtle borders
      */}
      <div style={{
        padding: '24px 32px',
        background: '#1f2937',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #374151'
      }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: '#7c3aed',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                    }}>
                        💬
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: 'white' }}>
                            Ready to Chat
                        </h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#d1d5db' }}>
                            AI Assistant • Ready to help
                        </p>
                    </div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#94a3b8'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            background: '#10b981',
                            borderRadius: '50%',
                            animation: 'pulse 2s ease-in-out infinite'
                        }}></div>
                        Online
                    </div>
                    {/* <button
                        onClick={testBedrockConnection}
                        disabled={isTesting}
                        style={{
                            padding: '8px 16px',
                            background: isTesting ? '#6b7280' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: isTesting ? 'not-allowed' : 'pointer',
                            marginRight: '12px'
                        }}
                    >
                        {isTesting ? '🔄 Testing...' : '🧪 Test Bedrock'}
                    </button> */}
                    <SignOutButton />
                </div>
            </div>

            {/* ============================================================================
                TEST RESULT AREA - Debug Information Display
                ============================================================================
                Purpose: Shows Bedrock connection test results
                Styling: Green for success, red for errors
                Features: Dismissible with close button
            */}
            {testResult && (
                <div style={{
                    padding: '16px 32px',
                    background: testResult.includes('SUCCESS') ? '#dcfce7' : '#fef2f2',
                    borderBottom: '1px solid #e5e7eb',
                    color: testResult.includes('SUCCESS') ? '#166534' : '#dc2626',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{testResult}</pre>
                        <button
                            onClick={() => setTestResult('')}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer',
                                marginLeft: '16px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

      {/* ============================================================================
          MESSAGES AREA - Chat Conversation Display
          ============================================================================
          Purpose: Scrollable area containing all chat messages
          Features: Auto-scroll, background pattern, message bubbles
          Layout: Flex container with overflow handling
      */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
        background: '#1f2937',
        position: 'relative'
      }}>
        {/* ============================================================================
            BACKGROUND PATTERN - Subtle Visual Enhancement
            ============================================================================
            Purpose: Adds subtle dot pattern to messages area
            Styling: Radial gradient dots with low opacity
            Effect: Non-intrusive visual texture
        */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(124, 58, 237, 0.1) 1px, transparent 0)',
          backgroundSize: '30px 30px',
          pointerEvents: 'none'
        }}></div>



                {/* {debugInfo && (
                    <div style={{
                        margin: '16px 0',
                        padding: '12px 16px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#1d4ed8',
                        fontSize: '14px',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        Debug: {debugInfo}
                    </div>
                )} */}

        {/* ============================================================================
            EMPTY STATE - Welcome Screen When No Messages
            ============================================================================
            Purpose: Shows welcome message and suggestion buttons when chat is empty
            Features: Dynamic content based on business data availability
            Styling: Centered layout with large icon and call-to-action buttons
        */}
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            color: '#d1d5db',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              background: '#7c3aed',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
              fontSize: '40px'
            }}>
              💬
            </div>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '28px',
              fontWeight: '800',
              color: 'white'
            }}>
              Ready to Chat
            </h3>
            <p style={{
              fontSize: '18px',
              lineHeight: '1.6',
              maxWidth: '500px',
              margin: '0 auto 24px auto',
              color: '#9ca3af'
            }}>
              {businessData?.businessIdea || businessData?.targetMarket 
                  ? "I can analyze your business idea and provide strategic insights. Try asking: 'Analyze my business idea' or 'What questions should I consider?'"
                  : "I'm your business strategy assistant. Share your business idea and target market to get personalized analysis and strategic recommendations!"
              }
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '32px'
            }}>
            </div>
          </div>
                ) : (
                    /* ============================================================================
                        MESSAGE LIST - Chat Conversation Display
                        ============================================================================
                        Purpose: Renders all chat messages in conversation order
                        Features: User/assistant message bubbles with timestamps
                        Styling: Different styles for user vs assistant messages
                    */
                    messages.map((message) => (
                        <div key={message.id} style={{
                            marginBottom: '24px',
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                            alignItems: 'flex-start',
                            gap: '12px'
                        }}>
                            {message.role === 'assistant' && (
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    flexShrink: 0
                                }}>
                                    🤖
                                </div>
                            )}
                            <div style={{
                                maxWidth: '75%',
                                padding: '16px 20px',
                                borderRadius: message.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                background: message.role === 'user'
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : 'white',
                                color: message.role === 'user' ? 'white' : '#374151',
                                wordWrap: 'break-word',
                                boxShadow: message.role === 'user'
                                    ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                                    : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                border: message.role === 'assistant' ? '1px solid #e5e7eb' : 'none'
                            }}>
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    marginBottom: '8px',
                                    opacity: message.role === 'user' ? 0.9 : 0.7,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {message.role === 'user' ? 'You' : 'Claude'}
                                </div>
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.6',
                                    fontSize: '15px'
                                }}>
                                    {message.content}
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    marginTop: '8px',
                                    opacity: 0.6,
                                    textAlign: 'right'
                                }}>
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            {message.role === 'user' && (
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '16px',
                                    flexShrink: 0
                                }}>
                                    👤
                                </div>
                            )}
                        </div>
                    ))
                )}
                {/* ============================================================================
                    LOADING INDICATOR - AI Response Loading State
                    ============================================================================
                    Purpose: Shows animated loading indicator while AI is processing
                    Features: Pulsing dots animation with "Claude is thinking..." text
                    Styling: Matches assistant message bubble design
                */}
                {isLoading && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px'
                        }}>
                            🤖
                        </div>
                        <div style={{
                            padding: '16px 20px',
                            borderRadius: '20px 20px 20px 4px',
                            background: 'white',
                            color: '#6b7280',
                            fontStyle: 'italic',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                background: '#667eea',
                                borderRadius: '50%',
                                animation: 'pulse 1.5s ease-in-out infinite'
                            }}></div>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                background: '#667eea',
                                borderRadius: '50%',
                                animation: 'pulse 1.5s ease-in-out infinite 0.2s'
                            }}></div>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                background: '#667eea',
                                borderRadius: '50%',
                                animation: 'pulse 1.5s ease-in-out infinite 0.4s'
                            }}></div>
                            <span style={{ marginLeft: '8px' }}>Claude is thinking...</span>
                        </div>
                    </div>
                )}
            </div>

      {/* ============================================================================
          INPUT AREA - Message Composition Interface
          ============================================================================
          Purpose: Text input area for composing and sending messages
          Features: Auto-resize textarea, send button, keyboard shortcuts
          Styling: Fixed bottom position with subtle top border glow
      */}
      <div style={{
        padding: '20px 32px 24px',
        background: '#1f2937',
        borderTop: '1px solid #374151',
        position: 'relative'
      }}>
        {/* ============================================================================
            TOP BORDER GLOW - Subtle Visual Enhancement
            ============================================================================
            Purpose: Adds subtle purple glow to top of input area
            Styling: Linear gradient with transparency
            Effect: Visual separation between messages and input
        */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)',
          opacity: 0.5
        }}></div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-end',
                    maxWidth: '1000px',
                    margin: '0 auto'
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything... I'm here to help! 💭"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '18px 24px',
                border: 'none',
                borderRadius: '20px',
                resize: 'none',
                minHeight: '24px',
                maxHeight: '300px',
                fontFamily: 'inherit',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.3s ease',
                background: '#374151',
                color: 'white',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.background = '#4b5563';
              }}
              onBlur={(e) => {
                e.target.style.background = '#374151';
              }}
              rows={1}
            />
                    </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              padding: '18px',
              background: !inputMessage.trim() || isLoading ? '#6b7280' : '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              cursor: !inputMessage.trim() || isLoading ? 'not-allowed' : 'pointer',
              fontSize: '18px',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              if (!(!inputMessage.trim() || isLoading)) {
                e.currentTarget.style.background = '#6d28d9';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              }
            }}
            onMouseOut={(e) => {
              if (!(!inputMessage.trim() || isLoading)) {
                e.currentTarget.style.background = '#7c3aed';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }
            }}
          >
            {isLoading ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : '🚀'}
          </button>
                </div>
        {/* ============================================================================
            KEYBOARD SHORTCUTS HELP - User Interface Instructions
            ============================================================================
            Purpose: Shows keyboard shortcuts for message composition
            Features: Styled keyboard key indicators
            Styling: Centered text with monospace key styling
        */}
        <div style={{
          marginTop: '16px',
          fontSize: '13px',
          color: '#9ca3af',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          Press <kbd style={{
            background: '#374151',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            border: '1px solid #4b5563',
            color: 'white'
          }}>Enter</kbd> to send • <kbd style={{
            background: '#374151',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '12px',
            border: '1px solid #4b5563',
            color: 'white'
          }}>Shift + Enter</kbd> for new line
        </div>
            </div>
        </div>
    );
}