"use client";

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';

interface HeaderProps {
  onRecentClick?: () => void;
  onCustomWorkspaceClick?: () => void;
}

export default function Header({ onRecentClick, onCustomWorkspaceClick }: HeaderProps) {
  const { user, signOut } = useAuthenticator();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-content">
        <div className="dashboard-header-left">
          <div className="dashboard-header-logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="4" fill="#8B5CF6"/>
                <path d="M8 8h8v8H8z" fill="white"/>
                <circle cx="12" cy="12" r="2" fill="#8B5CF6"/>
              </svg>
            </div>
            <div className="dashboard-header-brand">
              <h1 className="dashboard-header-title">AI Workspace</h1>
              <p className="dashboard-header-subtitle">Choose your tools and start creating.</p>
            </div>
          </div>
        </div>

        <div className="dashboard-header-right">
          <button 
            className="dashboard-header-recent-btn"
            onClick={onRecentClick}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23,4 23,10 17,10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Recent
          </button>
          
          <button 
            className="dashboard-header-custom-btn"
            onClick={onCustomWorkspaceClick}
          >
            + Custom Workspace
          </button>

          <div className="dashboard-header-user">
            <div className="dashboard-header-user-avatar">
              {user?.signInDetails?.loginId ? 
                user.signInDetails.loginId.charAt(0).toUpperCase() : 
                'U'
              }
            </div>
            <button 
              className="dashboard-header-signout-btn"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}