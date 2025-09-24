"use client";

export function SignInHeader() {
  return (
    <div className="signin-header">
      <h2 className="signin-title">
        Sign in to your account
      </h2>
      <p className="signin-description">
        Continue your conversation with Claude
      </p>
    </div>
  );
}

export function SignInFooter() {
  return (
    <div className="signin-features">
      <p className="signin-features-title">
        ✨ What you'll get:
      </p>
      <div className="signin-features-grid">
        <div>🤖 AI-powered conversations</div>
        <div>💾 Conversation history</div>
        <div>🔒 Secure & private</div>
        <div>⚡ Lightning fast responses</div>
      </div>
    </div>
  );
}