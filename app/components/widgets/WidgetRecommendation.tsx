"use client";

import React from 'react';

interface WidgetRecommendationProps {
  onSelectWidget: (widget: 'business-planning' | 'finance-funding') => void;
  onDismiss: () => void;
  lastMessage?: string;
  recommendedWidget?: 'business-planning' | 'finance-funding' | null;
  countdown?: number | null;
}

export default function WidgetRecommendation({ onSelectWidget, onDismiss, lastMessage, recommendedWidget, countdown }: WidgetRecommendationProps) {
  const getRecommendationText = () => {
    if (recommendedWidget && countdown !== null) {
      const widgetName = recommendedWidget === 'business-planning' ? 'Business Planning Widget' : 'Finance & Funding Widget';
      return `Based on our conversation, I think the ${widgetName} would be perfect for you! I'll take you there in ${countdown} seconds, or you can choose a different option below.`;
    }
    
    if (lastMessage) {
      const lowerMessage = lastMessage.toLowerCase();
      
      if (lowerMessage.includes('business plan') || lowerMessage.includes('strategy') || lowerMessage.includes('market')) {
        return "Based on your question about business planning, would you like to dive deeper with our specialized Business Planning Widget?";
      } else if (lowerMessage.includes('funding') || lowerMessage.includes('finance') || lowerMessage.includes('money') || lowerMessage.includes('investment')) {
        return "I see you're interested in financial aspects. Would you like to explore our Finance & Funding Widget for more detailed assistance?";
      }
    }
    
    return "Would you like to explore one of our specialized widgets for more focused assistance?";
  };

  return (
    <div className="widget-recommendation">
      <div className="widget-recommendation-content">
        <div className="widget-recommendation-header">
          <h4>Continue with Specialized Tools</h4>
          <button onClick={onDismiss} className="widget-recommendation-close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <p className="widget-recommendation-text">
          {getRecommendationText()}
        </p>
        
        <div className="widget-recommendation-options">
          <button 
            className={`widget-recommendation-button business-planning ${recommendedWidget === 'business-planning' ? 'recommended' : ''}`}
            onClick={() => onSelectWidget('business-planning')}
          >
            <div className="widget-recommendation-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="widget-recommendation-info">
              <h5>Business Planning Widget {recommendedWidget === 'business-planning' && countdown !== null && <span className="countdown-badge">Recommended ({countdown}s)</span>}</h5>
              <p>Business overview, market analysis, and strategy development</p>
            </div>
          </button>
          
          <button 
            className={`widget-recommendation-button finance-funding ${recommendedWidget === 'finance-funding' ? 'recommended' : ''}`}
            onClick={() => onSelectWidget('finance-funding')}
          >
            <div className="widget-recommendation-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="widget-recommendation-info">
              <h5>Finance & Funding Widget {recommendedWidget === 'finance-funding' && countdown !== null && <span className="countdown-badge">Recommended ({countdown}s)</span>}</h5>
              <p>Financial projections, funding options, and budgeting</p>
            </div>
          </button>
        </div>
        
        <div className="widget-recommendation-footer">
          <button onClick={onDismiss} className="widget-recommendation-dismiss">
            Continue here instead
          </button>
        </div>
      </div>
    </div>
  );
}