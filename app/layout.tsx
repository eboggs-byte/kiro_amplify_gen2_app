import React from "react";
import { ConfigureAmplify } from "./ConfigureAmplify";
import { Amplify } from "aws-amplify";
import "./app.css";
import AuthenticatorWrapper from "./components/auth/AuthenticatorWrapper";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";


Amplify.configure(outputs);


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthenticatorWrapper>
          {children}
        </AuthenticatorWrapper>
        <ConfigureAmplify />
      </body>
    </html>
  );
}