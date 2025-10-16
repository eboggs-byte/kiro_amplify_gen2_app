"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface WorkflowStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface BusinessPlanningWorkflowProps {
  onBack?: () => void;
}

export default function BusinessPlanningWorkflow({ onBack }: BusinessPlanningWorkflowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // Start with Business Overview
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'I can help you with business planning questions and provide guidance based on your answers.',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [aiMessage, setAiMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // Business form data - will be auto-populated from SmallBizAgentState
  const [formData, setFormData] = useState({
    // Business Overview fields
    business_name: '',
    business_idea: '',
    target_market: '',
    unique_value: '',
    business_model: '',
    
    // Market Analysis fields  
    market_size: '',
    competitors: '',
    competitive_advantage: ''
  });

  const steps: WorkflowStep[] = [
    { id: 'overview', title: 'Business Overview', status: currentStep === 0 ? 'current' : currentStep > 0 ? 'completed' : 'upcoming' },
    { id: 'market', title: 'Market Analysis', status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages]);

  // Auto-populate form data from SmallBizAgentState on component mount
  useEffect(() => {
    loadSmallBizAgentState();
  }, []);

  const loadSmallBizAgentState = async () => {
    try {
      setLoading(true);
      console.log('🚀 Loading SmallBizAgentState data for auto-population...');

      const response = await fetch('/api/smallbiz-state');
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        const agentData = result.data[0]; // Get the first record
        
        console.log('✅ Auto-populating form with SmallBizAgentState data:', agentData);

        // Auto-populate form fields
        setFormData(prev => ({
          ...prev,
          business_name: agentData.business_name || '',
          business_idea: agentData.idea || '',
          target_market: agentData.market || ''
        }));

        // Update AI assistant with context
        setAiMessages(prevMessages => [...prevMessages, {
          id: Date.now().toString(),
          content: `I can see you're working on "${agentData.business_name}" - ${agentData.idea}. I have access to your business information and can provide personalized guidance.`,
          sender: 'assistant',
          timestamp: new Date()
        }]);

        console.log('✅ Form auto-populated successfully');
      } else {
        console.log('📭 No SmallBizAgentState data found for auto-population');
      }
    } catch (error) {
      console.error('❌ Error loading SmallBizAgentState for auto-population:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aiMessage.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: aiMessage,
        sender: 'user',
        timestamp: new Date()
      };

      setAiMessages(prev => [...prev, userMessage]);
      setAiMessage('');
      setIsAiTyping(true);

      try {
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: `[Business Planning Workflow - ${steps[currentStep]?.title}] ${aiMessage}`,
            context: 'business_planning_workflow',
            section: steps[currentStep]?.id || 'business_overview'
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const agentData = await response.json();

        let responseContent = '';
        if (typeof agentData.response === 'string') {
          responseContent = agentData.response;
        } else if (agentData.response?.reply) {
          responseContent = agentData.response.reply;
        } else {
          responseContent = 'I\'m here to help with your business planning. Could you be more specific about what you need?';
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: responseContent,
          sender: 'assistant',
          timestamp: new Date()
        };

        setAiMessages(prev => [...prev, assistantMessage]);

      } catch (error: any) {
        console.error('AI Assistant error:', error);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: 'I\'m having trouble connecting right now. Let me help you with some business planning guidance.',
          sender: 'assistant',
          timestamp: new Date()
        };

        setAiMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  return (
    <div className="workflow-container">
      {/* Header */}
      <div className="workflow-header">
        <div className="workflow-header-left">
          <button onClick={handleBack} className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </button>
          <div className="workflow-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" />
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
            </svg>
            <span>PlanFlow</span>
          </div>
        </div>
        <div className="workflow-header-nav">
          <button className="nav-button active">Dashboard</button>
          <button className="nav-button">Templates</button>
          <button className="nav-button">Analytics</button>
          <button className="nav-button">Help</button>
        </div>
        <div className="workflow-header-right">
          <button className="notification-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>
          <div className="user-avatar">
            <img src="/api/placeholder/32/32" alt="User" />
          </div>
        </div>
      </div>

      <div className="workflow-content">
        {/* Sidebar */}
        <div className="workflow-sidebar">
          <div className="workflow-progress">
            <h3>Business Planning Workflow</h3>
            <div className="progress-info">
              <span>Progress</span>
              <span>Step {currentStep + 1} of 2</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentStep + 1) / 2) * 100}%` }}></div>
            </div>
          </div>

          <div className="workflow-steps">
            {steps.map((step, index) => (
              <div key={step.id} className={`workflow-step workflow-step--${step.status}`}>
                <div className="step-indicator">
                  {step.status === 'completed' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-title">{step.title}</div>
                  <div className="step-status">
                    {step.status === 'completed' ? 'Completed' : 
                     step.status === 'current' ? 'In Progress' : 'Upcoming'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="quick-tip">
            <div className="quick-tip-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Quick Tip
            </div>
            <p>Answer honestly and thoroughly. You can always revise your responses later.</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="workflow-main">
          <div className="workflow-question">
            <div className="question-header">
              <h1>{currentStep === 0 ? 'Business Overview' : 'Market Analysis'}</h1>
              <p>Step {currentStep + 1} of 2 - {currentStep === 0 ? 'Let\'s start with your business fundamentals' : 'Analyze your target market and competition'}</p>
              <div className="question-actions">
                <button className="save-draft-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17,21 17,13 7,13 7,21" />
                    <polyline points="7,3 7,8 15,8" />
                  </svg>
                  Save Draft
                </button>
                <button 
                  className="previous-button" 
                  onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Previous
                </button>
              </div>
            </div>

            <div className="question-content">
              {loading && (
                <div className="loading-indicator">
                  <div className="spinner"></div>
                  <p>Loading your business data...</p>
                </div>
              )}

              {currentStep === 0 && (
                <div className="question-section">
                  <div className="section-header">
                    <div className="section-number">1</div>
                    <div className="section-info">
                      <h2>Business Basics</h2>
                      <p>Tell us about your business concept</p>
                    </div>
                  </div>

                  <div className="business-form">
                    <div className="form-field">
                      <label>Business Name *</label>
                      <input
                        type="text"
                        value={formData.business_name}
                        onChange={(e) => handleInputChange('business_name', e.target.value)}
                        placeholder="What will you call your business?"
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label>Business Idea *</label>
                      <textarea
                        value={formData.business_idea}
                        onChange={(e) => handleInputChange('business_idea', e.target.value)}
                        placeholder="Describe your business concept, products, or services..."
                        rows={4}
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-field">
                      <label>Target Market *</label>
                      <textarea
                        value={formData.target_market}
                        onChange={(e) => handleInputChange('target_market', e.target.value)}
                        placeholder="Describe your ideal customers and target market..."
                        rows={3}
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-field">
                      <label>What makes your business unique?</label>
                      <textarea
                        value={formData.unique_value}
                        onChange={(e) => handleInputChange('unique_value', e.target.value)}
                        placeholder="What sets you apart from competitors?"
                        rows={3}
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-field">
                      <label>Business Model</label>
                      <select
                        value={formData.business_model}
                        onChange={(e) => handleInputChange('business_model', e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select a business model</option>
                        <option value="B2B">B2B (Business to Business)</option>
                        <option value="B2C">B2C (Business to Consumer)</option>
                        <option value="B2B2C">B2B2C (Business to Business to Consumer)</option>
                        <option value="Marketplace">Marketplace</option>
                        <option value="Subscription">Subscription</option>
                        <option value="Freemium">Freemium</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="question-section">
                  <div className="section-header">
                    <div className="section-number">2</div>
                    <div className="section-info">
                      <h2>Market Analysis</h2>
                      <p>Analyze your competition and market positioning</p>
                    </div>
                  </div>

                  <div className="business-form">
                    <div className="form-field">
                      <label>Market Size</label>
                      <select
                        value={formData.market_size}
                        onChange={(e) => handleInputChange('market_size', e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select market size</option>
                        <option value="Local">Local (City/Region)</option>
                        <option value="National">National</option>
                        <option value="International">International</option>
                        <option value="Global">Global</option>
                        <option value="Niche">Niche Market</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Who are your main competitors?</label>
                      <textarea
                        value={formData.competitors}
                        onChange={(e) => handleInputChange('competitors', e.target.value)}
                        placeholder="List and describe your direct and indirect competitors..."
                        rows={4}
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-field">
                      <label>Your Competitive Advantage</label>
                      <textarea
                        value={formData.competitive_advantage}
                        onChange={(e) => handleInputChange('competitive_advantage', e.target.value)}
                        placeholder="How will you compete and win against competitors?"
                        rows={4}
                        className="form-textarea"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="question-navigation">
                <button 
                  onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)} 
                  className="nav-button secondary"
                  disabled={currentStep === 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  Previous Step
                </button>
                <div className="question-info">
                  <span>Step {currentStep + 1} of 2</span>
                </div>
                <div className="nav-buttons-right">
                  <button 
                    onClick={() => currentStep < 1 && setCurrentStep(currentStep + 1)} 
                    className="nav-button primary"
                    disabled={currentStep === 1}
                  >
                    {currentStep === 1 ? 'Complete' : 'Next Step'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <div className="ai-assistant-sidebar">
          <div className="ai-assistant-header">
            <h3>Need Help?</h3>
            <div className="ai-assistant-info">
              <div className="ai-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <div className="ai-title">AI Assistant</div>
                <div className="ai-description">I can help you with business planning, market analysis, and strategic guidance.</div>
              </div>
            </div>
            <button 
              className="ask-ai-button"
              onClick={() => setShowAIAssistant(!showAIAssistant)}
            >
              Ask AI Assistant
            </button>
          </div>

          {showAIAssistant && (
            <div className="ai-chat-container">
              <div className="ai-messages">
                {aiMessages.map((msg) => (
                  <div key={msg.id} className={`ai-message ai-message--${msg.sender}`}>
                    <div className="ai-message-content">
                      <p>{msg.content}</p>
                      <span className="ai-message-time">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isAiTyping && (
                  <div className="ai-message ai-message--assistant">
                    <div className="ai-message-content ai-typing">
                      <div className="ai-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <form className="ai-input-form" onSubmit={handleAiSubmit}>
                <input
                  type="text"
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  placeholder="Ask about business planning..."
                  className="ai-input"
                  disabled={isAiTyping}
                />
                <button 
                  type="submit" 
                  className="ai-send-button"
                  disabled={!aiMessage.trim() || isAiTyping}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22,2 15,22 11,13 2,9 22,2" />
                  </svg>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}