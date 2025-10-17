"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WidgetRecommendation from '../widgets/WidgetRecommendation';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

interface AIBusinessAssistantProps {
  onSendMessage?: (message: string) => void;
}

export default function AIBusinessAssistant({ onSendMessage }: AIBusinessAssistantProps) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI Business Assistant. I can help you with business planning, market research, financial projections, and much more. What would you like to work on today?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWidgetRecommendation, setShowWidgetRecommendation] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [recommendedWidget, setRecommendedWidget] = useState<'business-planning' | 'finance-funding' | null>(null);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsTyping(true);

      try {
        console.log('🚀 Calling /api/agents with message:', message);
        
        // Call your existing agents API
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: message }),
        });
        
        console.log('📡 API response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const agentData = await response.json();
        console.log('📥 Agent response data:', agentData);

        if (agentData.error) {
          throw new Error(agentData.error);
        }

        // Handle different response formats from your agents
        let responseContent = '';
        
        if (typeof agentData.response === 'string') {
          responseContent = agentData.response;
        } else if (agentData.response && typeof agentData.response === 'object') {
          // Handle object responses like {reply, state}
          if (agentData.response.reply) {
            responseContent = agentData.response.reply;
          } else if (agentData.response.message) {
            responseContent = agentData.response.message;
          } else if (agentData.response.content) {
            responseContent = agentData.response.content;
          } else {
            // Fallback: stringify the object
            responseContent = JSON.stringify(agentData.response, null, 2);
          }
        } else {
          responseContent = agentData.response || 'No response from agents';
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        onSendMessage?.(message);

        // Check if we should show widget recommendation and auto-redirect
        const recommendedWidgetType = await analyzeForWidgetRecommendation(message, responseContent);
        if (recommendedWidgetType) {
          setLastUserMessage(message);
          setRecommendedWidget(recommendedWidgetType);
          setTimeout(() => {
            setShowWidgetRecommendation(true);
            startAutoRedirectCountdown(recommendedWidgetType);
          }, 2000); // Show recommendation after 2 seconds
        }

      } catch (error: any) {
        console.error('❌ Agent connection failed:', error);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `Connection failed: ${error.message}. Make sure your agents are running at http://localhost:8080/invoke`,
          sender: 'assistant',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }
  };

  // Use AI to analyze the conversation and determine the best widget recommendation
  const analyzeForWidgetRecommendation = async (userMessage: string, assistantResponse: string): Promise<'business-planning' | 'finance-funding' | null> => {
    try {
      // Create a prompt for the AI to analyze the conversation context
      const analysisPrompt = `
Analyze this conversation and determine if the user would benefit from a specialized widget:

User Question: "${userMessage}"
Assistant Response: "${assistantResponse}"

Available widgets:
1. Business Planning Widget - For comprehensive business strategy, market analysis, business model development, competitive analysis, and overall business planning
2. Finance & Funding Widget - For financial projections, funding requirements, cash flow planning, investment analysis, and financial modeling

Based on the conversation context, which widget would be MOST helpful for the user's specific needs right now? 

Respond with ONLY one of these options:
- "business-planning" if the Business Planning Widget would be most helpful
- "finance-funding" if the Finance & Funding Widget would be most helpful  
- "none" if neither widget is particularly relevant to this conversation

Consider the user's immediate needs and what they're trying to accomplish. Don't recommend a widget unless it would genuinely add significant value to their current question or goal.
      `;

      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: analysisPrompt,
          context: 'widget-analysis' // Add context to help the agent understand this is for analysis
        }),
      });

      if (!response.ok) {
        console.log('Widget analysis failed, falling back to keyword detection');
        return fallbackKeywordDetection(userMessage, assistantResponse);
      }

      const analysisData = await response.json();
      let analysisResult = '';
      
      if (typeof analysisData.response === 'string') {
        analysisResult = analysisData.response.toLowerCase().trim();
      } else if (analysisData.response && analysisData.response.reply) {
        analysisResult = analysisData.response.reply.toLowerCase().trim();
      }

      // Parse the AI's recommendation
      if (analysisResult.includes('business-planning')) {
        console.log('🎯 AI recommends: Business Planning Widget');
        return 'business-planning';
      } else if (analysisResult.includes('finance-funding')) {
        console.log('🎯 AI recommends: Finance & Funding Widget');
        return 'finance-funding';
      } else {
        console.log('🎯 AI recommends: No widget needed');
        return null;
      }

    } catch (error) {
      console.error('Widget analysis error:', error);
      // Fallback to simple keyword detection if AI analysis fails
      return fallbackKeywordDetection(userMessage, assistantResponse);
    }
  };

  // Fallback keyword detection (simpler logic as backup)
  const fallbackKeywordDetection = (userMessage: string, assistantResponse: string): 'business-planning' | 'finance-funding' | null => {
    const lowerUserMessage = userMessage.toLowerCase();
    const lowerAssistantResponse = assistantResponse.toLowerCase();
    
    // Strong finance indicators
    const strongFinanceKeywords = [
      'funding', 'investment', 'loan', 'capital', 'financial projection', 'budget',
      'cash flow', 'revenue', 'profit', 'expenses', 'startup costs', 'venture capital',
      'how much money', 'cost', 'price', 'financial', 'finance'
    ];
    
    // Strong business planning indicators  
    const strongBusinessKeywords = [
      'business plan', 'strategy', 'market analysis', 'competition', 'target market',
      'business model', 'mission', 'vision', 'swot', 'competitive advantage',
      'business idea', 'market research', 'business strategy'
    ];
    
    const hasStrongFinanceKeywords = strongFinanceKeywords.some(keyword => 
      lowerUserMessage.includes(keyword) || lowerAssistantResponse.includes(keyword)
    );
    
    const hasStrongBusinessKeywords = strongBusinessKeywords.some(keyword => 
      lowerUserMessage.includes(keyword) || lowerAssistantResponse.includes(keyword)
    );
    
    // Only recommend if there are strong indicators
    if (hasStrongFinanceKeywords && !hasStrongBusinessKeywords) {
      return 'finance-funding';
    } else if (hasStrongBusinessKeywords && !hasStrongFinanceKeywords) {
      return 'business-planning';
    }
    
    // If both or neither, don't recommend anything
    return null;
  };

  // Start the auto-redirect countdown
  const startAutoRedirectCountdown = (widgetType: 'business-planning' | 'finance-funding') => {
    setAutoRedirectCountdown(3);
    
    countdownIntervalRef.current = setInterval(() => {
      setAutoRedirectCountdown(prev => {
        if (prev === null || prev <= 1) {
          // Auto-redirect when countdown reaches 0
          clearInterval(countdownIntervalRef.current!);
          setShowWidgetRecommendation(false);
          setAutoRedirectCountdown(null);
          router.push(`/${widgetType}`);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clear countdown when component unmounts or recommendation is dismissed
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleWidgetSelection = (widget: 'business-planning' | 'finance-funding') => {
    // Clear countdown and redirect immediately
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setAutoRedirectCountdown(null);
    setShowWidgetRecommendation(false);
    router.push(`/${widget}`);
  };

  const handleDismissRecommendation = () => {
    // Clear countdown and dismiss
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setAutoRedirectCountdown(null);
    setShowWidgetRecommendation(false);
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const quickPrompts = [
    'Help me write a business plan',
    'What licenses do I need?',
    'Create a marketing strategy',
    'Calculate startup costs'
  ];

  return (
    <div className="ai-business-assistant">
      <div className="ai-business-assistant-header">
        <h3 className="ai-business-assistant-title">AI Business Assistant</h3>
        <p className="ai-business-assistant-subtitle">
          Describe your business idea or ask for help with any aspect of starting your business.
        </p>
      </div>

      {/* Widget Recommendation */}
      {showWidgetRecommendation && (
        <WidgetRecommendation
          onSelectWidget={handleWidgetSelection}
          onDismiss={handleDismissRecommendation}
          lastMessage={lastUserMessage}
          recommendedWidget={recommendedWidget}
          countdown={autoRedirectCountdown}
        />
      )}

      {/* Chat Messages Area */}
      <div className="ai-business-assistant-chat">
        <div className="ai-business-assistant-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-business-assistant-message ai-business-assistant-message--${msg.sender}`}>
              <div className="ai-business-assistant-message-avatar">
                {msg.sender === 'assistant' ? (
                  <div className="ai-business-assistant-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                ) : (
                  <div className="ai-business-assistant-user-avatar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="ai-business-assistant-message-content">
                <div className="ai-business-assistant-message-bubble">
                  <p>{msg.content}</p>
                  <span className="ai-business-assistant-message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="ai-business-assistant-message ai-business-assistant-message--assistant">
              <div className="ai-business-assistant-message-avatar">
                <div className="ai-business-assistant-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
              <div className="ai-business-assistant-message-content">
                <div className="ai-business-assistant-message-bubble ai-business-assistant-typing">
                  <div className="ai-business-assistant-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form className="ai-business-assistant-form" onSubmit={handleSubmit}>
        <div className="ai-business-assistant-input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell me about your business idea, or ask me anything about starting a business."
            className="ai-business-assistant-input"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            className="ai-business-assistant-send-btn"
            disabled={!message.trim() || isTyping}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9 22,2"/>
            </svg>
            Send
          </button>
        </div>
      </form>

      {/* Quick Prompts */}
      <div className="ai-business-assistant-quick-prompts">
        {quickPrompts.map((prompt, index) => (
          <button
            key={index}
            className="ai-business-assistant-quick-prompt"
            onClick={() => handleQuickPrompt(prompt)}
            disabled={isTyping}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}