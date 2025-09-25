import React from "react";
import "./app.css";
import AuthenticatorWrapper from "./components/auth/AuthenticatorWrapper";
import "@aws-amplify/ui-react/styles.css";
import { ConfigureAmplify } from "./ConfigureAmplify";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ConfigureAmplify>
          <AuthenticatorWrapper>
            {children}
          </AuthenticatorWrapper>
        </ConfigureAmplify>
      </body>
    </html>
  );
}