import { Theme } from "@aws-amplify/ui-react";

export const authTheme: Theme = {
    name: 'chatbot-pro-theme',
    tokens: {
        components: {
            authenticator: {
                router: {
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'white',
                },
                form: {
                    padding: '32px',
                },
            },
            button: {
                primary: {
                    backgroundColor: '#667eea',
                    _hover: {
                        backgroundColor: '#5a67d8',
                    },
                    _active: {
                        backgroundColor: '#4c51bf',
                    },
                },
            },
            fieldcontrol: {
                _focus: {
                    borderColor: '#667eea',
                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                },
            },
        },
    },
};