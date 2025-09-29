// Chat.tsx
"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { BusinessIdeaData } from '../business/BusinessIdeaForm';
import SignOutButton from "./SignOutButton";

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

interface ChatProps {
  businessData?: BusinessIdeaData;
}

export default function Chat({ businessData }: ChatProps = {}) {
    const [inputMessage, setInputMessage] = useState("");
    const [debugInfo, setDebugInfo] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [testResult, setTestResult] = useState<string>('');
    const [isTesting, setIsTesting] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // 🗄️ CREATE OR LOAD CONVERSATION
    useEffect(() => {
        const initializeConversation = async () => {
            setIsLoadingHistory(true);
            try {
                const client = generateClient<Schema>({ authMode: 'userPool' });
                
                // Create a new conversation
                const conversationTitle = businessData?.businessIdea 
                    ? `Business: ${businessData.businessIdea.substring(0, 50)}${businessData.businessIdea.length > 50 ? '...' : ''}`
                    : `Chat Session ${new Date().toLocaleDateString()}`;

                const newConversation = await client.models.Conversation.create({
                    title: conversationTitle,
                    businessIdea: businessData?.businessIdea || '',
                    targetMarket: businessData?.targetMarket || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });

                if (newConversation.data?.id) {
                    setCurrentConversationId(newConversation.data.id);
                    console.log('✅ New conversation created:', newConversation.data.id);
                }
            } catch (error) {
                console.error('❌ Error creating conversation:', error);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        initializeConversation();
    }, []); // Only run once on mount

    // 💾 SAVE MESSAGE TO DATABASE
    const saveMessage = async (content: string, role: 'user' | 'assistant') => {
        if (!currentConversationId) return;

        try {
            const client = generateClient<Schema>({ authMode: 'userPool' });
            await client.models.Message.create({
                conversationId: currentConversationId,
                content: content,
                role: role,
                timestamp: new Date().toISOString(),
            });
            console.log(`✅ ${role} message saved to database`);
        } catch (error) {
            console.error(`❌ Error saving ${role} message:`, error);
        }
    };

    // 🎯 GENERATE CONTEXTUAL PROMPT
    const generateContextualPrompt = (userInput: string) => {
        if (!businessData?.businessIdea && !businessData?.targetMarket) {
            return userInput;
        }
        
        let context = "Business Context:\n";
        if (businessData.businessIdea) {
            context += `Business Idea: ${businessData.businessIdea}\n`;
        }
        if (businessData.targetMarket) {
            context += `Target Market: ${businessData.targetMarket}\n`;
        }
        context += `\nQuestion: ${userInput}\n\nPlease provide specific advice based on my business context.`;
        return context;
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        console.log('Attempting to send message:', inputMessage);
        setDebugInfo(`Sending: "${inputMessage}"`);
        setIsLoading(true);

        // Add user message immediately
        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputMessage,
            role: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        const currentInput = inputMessage;
        setInputMessage("");

        // 💾 Save user message to database
        await saveMessage(currentInput, 'user');

        try {
            // 🔧 CREATE FRESH CLIENT (Same as working test button)
            // This was the key fix - creating a new client each time instead of reusing a global one
            console.log('💬 Starting chat message...');
            const chatClient = generateClient<Schema>({ authMode: 'userPool' });
            console.log('✅ Chat client created');

            // 📊 LOG PROMPT DETAILS (For debugging)
            console.log('Original prompt:', currentInput);
            console.log('Prompt length:', currentInput.length);

            // 🎯 SEND FULL PROMPT (No character limits - use full context window)
            console.log('Sending full prompt to Claude 3.5 Sonnet');

            // 🚀 CALL BEDROCK API with full prompt (No truncation)
            const response = await chatClient.generations.generateResponse({
                prompt: currentInput
            });

            console.log('📥 Chat response:', response);

            // ✅ SUCCESS CASE - Claude returned a valid response
            if (response.data?.response) {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: response.data.response,
                    role: 'assistant',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, assistantMessage]);
                setDebugInfo(""); // Clear any debug info on success
                
                // 💾 Save assistant message to database
                await saveMessage(response.data.response, 'assistant');
            }
            // ⚠️ NULL RESPONSE CASE - Claude returned null (usually prompt too long/complex)
            else if (response.data?.response === null && response.data?.error === null) {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: `Claude returned null response. This might be due to prompt length (${currentInput.length} chars) or content. Try a shorter, simpler question like "Hello" or "What is AWS?"`,
                    role: 'assistant',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
            }
            // ❌ API ERROR CASE - Bedrock returned specific errors
            else if (response.errors && response.errors.length > 0) {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: `API ERROR: ${response.errors[0].message}`,
                    role: 'assistant',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, errorMessage]);
            }
            // 🤔 UNKNOWN RESPONSE CASE - Something unexpected happened
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
            // 💥 CONNECTION ERROR CASE - Network or authentication issues
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const testBedrockConnection = async () => {
        setIsTesting(true);
        setTestResult('🔄 Testing Bedrock connection...');

        try {
            console.log('🧪 Starting Bedrock test...');

            const testClient = generateClient<Schema>({ authMode: 'userPool' });
            console.log('✅ Test client created');

            const response = await testClient.generations.generateResponse({
                prompt: 'Say "Hello from Claude!" and nothing else.'
            });

            console.log('📥 Test response:', response);

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

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: 'white',
            overflow: 'hidden'
        }}>
            {/* Chat Header */}
            <div style={{
                padding: '20px 32px',
                background: 'linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}>
                        🤖
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                            Claude Haiku
                        </h3>
                        <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>
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
                    <button
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
                    </button>
                    <SignOutButton />
                </div>
            </div>

            {/* Test Result Area */}
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

            {/* Messages Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 32px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                position: 'relative'
            }}>
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(102, 126, 234, 0.1) 1px, transparent 0)',
                    backgroundSize: '30px 30px',
                    pointerEvents: 'none'
                }}></div>



                {debugInfo && (
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
                )}

                {messages.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        color: '#6b7280',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 32px',
                            fontSize: '40px',
                            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                            animation: 'float 3s ease-in-out infinite'
                        }}>
                            💬
                        </div>
                        <h3 style={{
                            margin: '0 0 12px 0',
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#1f2937',
                            background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Ready to Chat
                        </h3>
                        <p style={{
                            fontSize: '18px',
                            lineHeight: '1.6',
                            maxWidth: '500px',
                            margin: '0 auto 24px auto'
                        }}>
                            I'm Claude, your AWS and cloud computing assistant. Ask me about AWS services, architecture, and best practices!
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '16px',
                            flexWrap: 'wrap',
                            marginTop: '32px'
                        }}>
                            <div 
                                onClick={() => setInputMessage("What AWS services can I use?")}
                                style={{
                                    padding: '12px 20px',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    color: '#667eea',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                                }}
                            >
                                ☁️ AWS Services
                            </div>
                            <div 
                                onClick={() => setInputMessage("How do I deploy to AWS?")}
                                style={{
                                    padding: '12px 20px',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    color: '#667eea',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                                }}
                            >
                                🚀 Deployment
                            </div>
                            <div 
                                onClick={() => setInputMessage("What is serverless computing?")}
                                style={{
                                    padding: '12px 20px',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    color: '#667eea',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                                }}
                            >
                                ⚡ Serverless
                            </div>
                        </div>
                    </div>
                ) : (
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

            {/* Input Area */}
            <div style={{
                padding: '20px 32px 24px',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                position: 'relative'
            }}>
                {/* Subtle top border glow */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100px',
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, #667eea, transparent)',
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
                                border: '2px solid #e2e8f0',
                                borderRadius: '20px',
                                resize: 'none',
                                minHeight: '24px',
                                maxHeight: '300px',
                                fontFamily: 'inherit',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                background: 'white',
                                boxSizing: 'border-box',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#667eea';
                                e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08)';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                            rows={1}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        style={{
                            padding: '18px',
                            background: !inputMessage.trim() || isLoading
                                ? 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: !inputMessage.trim() || isLoading ? '#94a3b8' : 'white',
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
                            boxShadow: !inputMessage.trim() || isLoading
                                ? '0 2px 8px rgba(0, 0, 0, 0.04)'
                                : '0 4px 16px rgba(102, 126, 234, 0.4)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseOver={(e) => {
                            if (!(!inputMessage.trim() || isLoading)) {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.5)';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!(!inputMessage.trim() || isLoading)) {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
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
                <div style={{
                    marginTop: '16px',
                    fontSize: '13px',
                    color: '#64748b',
                    textAlign: 'center',
                    fontWeight: '500'
                }}>
                    Press <kbd style={{
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: '1px solid #e2e8f0'
                    }}>Enter</kbd> to send • <kbd style={{
                        background: '#f1f5f9',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        border: '1px solid #e2e8f0'
                    }}>Shift + Enter</kbd> for new line
                </div>
            </div>
        </div>
    );
}