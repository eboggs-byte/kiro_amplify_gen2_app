import React from "react";
import { ConfigureAmplify } from "./ConfigureAmplify";
import "./app.css";
import AuthenticatorWrapper from "./components/auth/AuthenticatorWrapper";
import "@aws-amplify/ui-react/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConfigureAmplify />
        <AuthenticatorWrapper>
          {children}
        </AuthenticatorWrapper>
      </body>
    </html>
  );
}