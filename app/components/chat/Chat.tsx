// Chat.tsx
"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import SignOutButton from "./SignOutButton";

const client = generateClient<Schema>({ authMode: 'userPool' });

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

export default function Chat() {
    const [inputMessage, setInputMessage] = useState("");
    const [debugInfo, setDebugInfo] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

        try {
            // Use the generation API
            console.log('Calling generation API with prompt:', currentInput);
            const response = await client.generations.generateResponse({
                prompt: currentInput,
            });

            console.log('Full API response:', response);
            console.log('Response data:', response.data);
            console.log('Response errors:', response.errors);

            if (response.data?.response && response.data.response.trim()) {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: response.data.response,
                    role: 'assistant',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, assistantMessage]);
                setDebugInfo("");
            } else if (response.errors && response.errors.length > 0) {
                console.error('API returned errors:', response.errors);
                throw new Error(`API Error: ${response.errors[0].message}`);
            } else {
                console.error('AI returned empty response:', response);
                throw new Error("AI returned an empty response. Please try again.");
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            setDebugInfo(`Error: ${error?.message || 'Unknown error'}`);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "Sorry, there was an error processing your message. Please try again.",
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
                    <SignOutButton />
                </div>
            </div>

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
                            I'm Claude Haiku, your intelligent AI assistant. I can help with questions, analysis, creative tasks, and much more.
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '16px',
                            flexWrap: 'wrap',
                            marginTop: '32px'
                        }}>
                            <div style={{
                                padding: '12px 20px',
                                background: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: '20px',
                                fontSize: '14px',
                                color: '#667eea',
                                fontWeight: '500'
                            }}>
                                💡 Ask questions
                            </div>
                            <div style={{
                                padding: '12px 20px',
                                background: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: '20px',
                                fontSize: '14px',
                                color: '#667eea',
                                fontWeight: '500'
                            }}>
                                📝 Get help writing
                            </div>
                            <div style={{
                                padding: '12px 20px',
                                background: 'rgba(102, 126, 234, 0.1)',
                                borderRadius: '20px',
                                fontSize: '14px',
                                color: '#667eea',
                                fontWeight: '500'
                            }}>
                                🔍 Analyze ideas
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
                                maxHeight: '120px',
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