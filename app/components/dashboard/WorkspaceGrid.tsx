"use client";

import React from 'react';

interface WorkspaceGridProps {
  onToolClick?: (toolId: string, toolName: string) => void;
  onCreateWidget?: () => void;
}

export default function WorkspaceGrid({ onToolClick, onCreateWidget }: WorkspaceGridProps) {
  const businessTools = [
    {
      id: 'business-planning',
      title: 'Business Planning',
      description: 'Business plan generator, market research, and strategy tools.',
      icon: '#8B5CF6',
      tools: [
        { name: 'Business Plan Builder', icon: 'document' },
        { name: 'Market Research', icon: 'search' },
        { name: 'Goal Setting', icon: 'target' }
      ]
    },
    {
      id: 'legal-compliance',
      title: 'Legal & Compliance',
      description: 'Business registration, contracts, and legal documentation.',
      icon: '#8B5CF6',
      tools: [
        { name: 'Entity Formation', icon: 'building' },
        { name: 'Contract Templates', icon: 'document' },
        { name: 'Compliance Tracker', icon: 'check' }
      ]
    },
    {
      id: 'finance-funding',
      title: 'Finance & Funding',
      description: 'Financial planning, investor pitch decks, and funding options.',
      icon: '#10B981',
      tools: [
        { name: 'Financial Projections', icon: 'dollar' },
        { name: 'Pitch Deck Builder', icon: 'presentation' },
        { name: 'Funding Finder', icon: 'search' }
      ]
    },
    {
      id: 'marketing-brand',
      title: 'Marketing & Brand',
      description: 'Logo design, marketing campaigns, and brand development.',
      icon: '#EF4444',
      tools: [
        { name: 'Logo Generator', icon: 'star' },
        { name: 'Social Media Kit', icon: 'share' },
        { name: 'Email Campaigns', icon: 'mail' }
      ]
    },
    {
      id: 'operations',
      title: 'Operations',
      description: 'Project management, inventory, and workflow automation.',
      icon: '#F59E0B',
      tools: [
        { name: 'Project Manager', icon: 'grid' },
        { name: 'Inventory Tracker', icon: 'package' },
        { name: 'Workflow Automation', icon: 'zap' }
      ]
    },
    {
      id: 'customer-relations',
      title: 'Customer Relations',
      description: 'CRM, customer support, and relationship management tools.',
      icon: '#3B82F6',
      tools: [
        { name: 'CRM System', icon: 'users' },
        { name: 'Support Desk', icon: 'headphones' },
        { name: 'Review Manager', icon: 'star' }
      ]
    },
    {
      id: 'technology',
      title: 'Technology',
      description: 'Website builder, e-commerce setup, and digital tools.',
      icon: '#06B6D4',
      tools: [
        { name: 'Website Builder', icon: 'monitor' },
        { name: 'E-commerce Setup', icon: 'shopping-cart' },
        { name: 'Mobile App', icon: 'smartphone' }
      ]
    }
  ];

  const getIconSVG = (iconName: string) => {
    const icons = {
      document: (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
        </>
      ),
      search: (
        <>
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
        </>
      ),
      target: <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>,
      building: <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>,
      check: <polyline points="20,6 9,17 4,12"/>,
      dollar: <line x1="12" y1="1" x2="12" y2="23"/>,
      presentation: <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>,
      star: <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>,
      share: <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>,
      mail: <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>,
      grid: <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>,
      package: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>,
      zap: <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>,
      users: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>,
      headphones: <path d="M3 14v3a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/>,
      monitor: <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>,
      'shopping-cart': (
        <>
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </>
      ),
      smartphone: <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
    };
    return icons[iconName as keyof typeof icons] || icons.document;
  };

  return (
    <div className="workspace-grid">
      <div className="workspace-grid-header">
        <h2 className="workspace-grid-title">
          Launch Your Dream <span className="highlight">Business</span>
        </h2>
        <p className="workspace-grid-subtitle">
          From idea to execution - access intelligent tools and expert guidance to build, grow, and scale your business with confidence.
        </p>
      </div>

      <div className="workspace-grid-content">
        {businessTools.map((tool) => (
          <div key={tool.id} className="business-tool-card">
            <div className="business-tool-card-header">
              <div 
                className="business-tool-card-icon" 
                style={{ backgroundColor: tool.icon }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {getIconSVG('document')}
                </svg>
              </div>
              <div className="business-tool-card-info">
                <h3 className="business-tool-card-title">{tool.title}</h3>
                <p className="business-tool-card-description">{tool.description}</p>
              </div>
            </div>
            <div className="business-tool-card-tools">
              {tool.tools.map((subTool, index) => (
                <button 
                  key={index}
                  className="business-tool-item"
                  onClick={() => onToolClick?.(tool.id, subTool.name)}
                >
                  <span className="business-tool-item-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {getIconSVG(subTool.icon)}
                    </svg>
                  </span>
                  <span className="business-tool-item-name">{subTool.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Custom Widget Card */}
        <div className="business-tool-card business-tool-card--custom">
          <div className="business-tool-card-header">
            <div className="business-tool-card-icon business-tool-card-icon--custom">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div className="business-tool-card-info">
              <h3 className="business-tool-card-title">Custom</h3>
              <p className="business-tool-card-description">
                Build your own widgets or import from our marketplace.
              </p>
            </div>
          </div>
          <div className="business-tool-card-actions">
            <button 
              className="business-tool-card-create-btn"
              onClick={onCreateWidget}
            >
              Create Widgets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}