import { defineAuth } from "@aws-amplify/backend";
import { AUTH_CONFIG } from "./config";

/**
 * Define and configure your auth resource for Sage Business Idea Platform
 * 
 * Features:
 * - Email-based authentication with secure password requirements
 * - User verification via email for account security
 * - Optional multi-factor authentication with TOTP
 * - Account recovery via email only
 * - Optimized for startup idea evaluation platform
 * 
 * Configuration is centralized in ./config.ts for better maintainability
 * 
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: AUTH_CONFIG.USER_ATTRIBUTES,
  accountRecovery: AUTH_CONFIG.ACCOUNT_RECOVERY,
  multifactor: AUTH_CONFIG.MFA_CONFIG,
});
