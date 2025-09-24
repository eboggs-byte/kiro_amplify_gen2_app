"use client";

import { useAuthenticator } from "@aws-amplify/ui-react";
import { useState } from "react";

export default function SignOutButton() {
    const { signOut } = useAuthenticator();
    const [isHovered, setIsHovered] = useState(false);

    const handleSignOut = () => {
        signOut();
    };

    return (
        <button
            onClick={handleSignOut}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                padding: '8px 16px',
                background: isHovered 
                    ? 'rgba(239, 68, 68, 0.1)' 
                    : 'rgba(255, 255, 255, 0.1)',
                color: isHovered ? '#ef4444' : '#94a3b8',
                border: `1px solid ${isHovered ? '#ef4444' : 'rgba(255, 255, 255, 0.2)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}
            title="Sign out of your account"
        >
            <span style={{ fontSize: '14px' }}>🚪</span>
            Sign Out
        </button>
    );
}