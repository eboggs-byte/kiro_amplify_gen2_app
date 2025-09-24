"use client";

import { Authenticator, ThemeProvider } from "@aws-amplify/ui-react";
import { authTheme } from './authTheme';
import '../../styles/auth.css';

const components = {
  Header() {
    return null; // Hide default header
  },
  Footer() {
    return null; // Hide default footer
  },
  SignIn: {
    Header() {
      return (
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600', color: 'white' }}>
            Welcome to Chat
          </h2>
          <p style={{ margin: 0, fontSize: '16px', color: '#a0aec0' }}>
            Sign in to start chatting with Claude
          </p>
        </div>
      );
    },
    Footer() {
      return null;
    },
  },
  SignUp: {
    Header() {
      return (
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '600', color: 'white' }}>
            Create Account
          </h2>
          <p style={{ margin: 0, fontSize: '16px', color: '#a0aec0' }}>
            Join to start chatting with Claude
          </p>
        </div>
      );
    },
    Footer() {
      return null;
    },
  },
};

export default function AuthenticatorWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="modern-auth-container">
      {/* Hero Section */}
      <div className="modern-hero-section">
        <div className="modern-hero-content">
          <h1 className="modern-hero-title">
            Chat with Claude.<br />
            Intelligently.
          </h1>
          <p className="modern-hero-description">
            Your AI assistant powered by Claude Haiku.<br />
            Ask questions, get help, and explore ideas together.<br />
          </p>

          {/* Auth Form Container */}
          <div className="modern-auth-form">
            <ThemeProvider theme={authTheme}>
              <Authenticator components={components} hideSignUp={false}>
                {({ user }) => {
                  // If user is authenticated, render only the children (chat interface)
                  if (user) {
                    return (
                      <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'white',
                        zIndex: 9999
                      }}>
                        {children}
                      </div>
                    );
                  }
                  
                  // If not authenticated, return null so the auth form shows
                  return null;
                }}
              </Authenticator>
            </ThemeProvider>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="modern-features-section">
        <div className="modern-features-content">
          <h2 className="modern-features-title">Why Chat with Claude?</h2>
          <div className="modern-features-grid">
            <div className="modern-feature-card">
              <div className="modern-feature-icon">
                💬
              </div>
              <h3 className="modern-feature-title">Natural Conversations</h3>
              <p className="modern-feature-description">
                Have natural, flowing conversations with Claude about any topic that interests you.
              </p>
            </div>
            <div className="modern-feature-card">
              <div className="modern-feature-icon">
                🧠
              </div>
              <h3 className="modern-feature-title">Intelligent Assistance</h3>
              <p className="modern-feature-description">
                Get help with writing, analysis, coding, math, and creative projects.
              </p>
            </div>
            <div className="modern-feature-card">
              <div className="modern-feature-icon">
                ⚡
              </div>
              <h3 className="modern-feature-title">Instant Responses</h3>
              <p className="modern-feature-description">
                Receive thoughtful, detailed responses in seconds to keep your workflow smooth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}