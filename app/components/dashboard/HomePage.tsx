"use client";

import React from 'react';
import Header from './Header';
import WorkspaceGrid from './WorkspaceGrid';
import AIBusinessAssistant from './AIBusinessAssistant';

export default function HomePage() {
  const handleRecentClick = () => {
    console.log('Recent clicked');
    // Implement recent workspaces functionality
  };

  const handleCustomWorkspaceClick = () => {
    console.log('Custom workspace clicked');
    // Implement custom workspace creation
  };

  const handleToolClick = (toolId: string, toolName: string) => {
    console.log(`Tool clicked: ${toolId} - ${toolName}`);
    
    // Handle navigation to widgets
    if (toolId === 'business-planning') {
      window.location.href = '/business-planning';
    } else if (toolId === 'finance-funding') {
      window.location.href = '/finance-funding';
    }
  };

  const handleCreateWidget = () => {
    console.log('Create widget clicked');
    // Implement widget creation
  };

  const handleSendMessage = (message: string) => {
    console.log('AI Assistant message:', message);
    // Implement AI assistant functionality
  };

  return (
    <div className="authenticated-dashboard">
      <Header 
        onRecentClick={handleRecentClick}
        onCustomWorkspaceClick={handleCustomWorkspaceClick}
      />
      
      <main className="dashboard-main">
        <WorkspaceGrid 
          onToolClick={handleToolClick}
          onCreateWidget={handleCreateWidget}
        />
        
        <AIBusinessAssistant 
          onSendMessage={handleSendMessage}
        />
      </main>
    </div>
  );
}
