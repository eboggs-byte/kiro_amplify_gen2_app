"use client";

import { Amplify } from "aws-amplify";
import { useEffect, useState } from "react";
import config from "@/amplify_outputs.json";

export const ConfigureAmplify = ({ children }: { children: React.ReactNode }) => {
    const [isConfigured, setIsConfigured] = useState(false);

    useEffect(() => {
        try {
            Amplify.configure(config);
            setIsConfigured(true);
        } catch (error) {
            console.error('Error configuring Amplify:', error);
        }
    }, []);

    if (!isConfigured) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '18px',
                fontWeight: '500'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTop: '3px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }}></div>
                    Initializing...
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
