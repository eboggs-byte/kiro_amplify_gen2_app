"use client";

export function SignUpHeader() {
  return (
    <div className="signup-header">
      <h2 className="signup-title">
        Create your account
      </h2>
      <p className="signup-description">
        Start chatting with Claude in seconds
      </p>
    </div>
  );
}

export function SignUpFooter() {
  return (
    <div className="signup-benefits">
      <p className="signup-benefits-title">
        🚀 Join thousands of users already chatting with AI
      </p>
      <div className="signup-benefits-grid">
        <div>✅ Free to start</div>
        <div>✅ No credit card required</div>
        <div>✅ Instant access</div>
      </div>
    </div>
  );
}