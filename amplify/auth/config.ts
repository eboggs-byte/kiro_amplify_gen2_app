/**
 * Authentication Configuration Constants
 * 
 * This file contains configuration constants for the Sage Business Idea Platform
 * authentication system. These constants help maintain consistency and make
 * configuration changes easier to manage.
 */

export const AUTH_CONFIG = {
  // Password requirements
  PASSWORD_POLICY: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialCharacters: true,
    requireUppercase: true,
    requireLowercase: true,
  },

  // User attributes configuration
  USER_ATTRIBUTES: {
    email: {
      required: true,
      mutable: true,
    },
    given_name: {
      required: false,
      mutable: true,
    },
    family_name: {
      required: false,
      mutable: true,
    },
  },

  // Account recovery settings
  ACCOUNT_RECOVERY: "EMAIL_ONLY" as const,

  // Multi-factor authentication settings
  MFA_CONFIG: {
    mode: "OPTIONAL" as const,
    sms: false,
    totp: true,
  },

  // Email verification settings
  EMAIL_VERIFICATION: {
    subject: "Welcome to Sage - Verify your email",
    message: "Thank you for signing up for Sage! Please verify your email to start evaluating your startup ideas.",
  },

  // Sign-up configuration
  SIGNUP_CONFIG: {
    allowedDomains: [], // Empty array means all domains are allowed
    autoConfirmUser: false, // Require email verification
  },
} as const;

export type AuthConfig = typeof AUTH_CONFIG;