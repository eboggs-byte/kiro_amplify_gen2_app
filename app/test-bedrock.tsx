// "use client";

// import { useState } from 'react';
// import { generateClient } from 'aws-amplify/data';
// import { useAuthenticator } from '@aws-amplify/ui-react';
// import type { Schema } from '../amplify/data/resource';

// export default function TestBedrock() {
//     const { user, authStatus } = useAuthenticator();
//     const [result, setResult] = useState<string>('');
//     const [loading, setLoading] = useState(false);

//     const testConnection = async () => {
//         if (authStatus !== 'authenticated' || !user) {
//             setResult('❌ Not authenticated');
//             return;
//         }

//         setLoading(true);
//         setResult('🔄 Testing Bedrock connection...');

//         try {
//             const client = generateClient<Schema>({ authMode: 'userPool' });

//             setResult('🔄 Client created, testing API call...');

//             const response = await client.generations.generateResponse({
//                 prompt: 'Say hello'
//             });

//             if (response.data?.response) {
//                 setResult(`✅ SUCCESS: ${response.data.response}`);
//             } else if (response.errors) {
//                 setResult(`❌ ERROR: ${JSON.stringify(response.errors, null, 2)}`);
//             } else {
//                 setResult(`❌ EMPTY RESPONSE: ${JSON.stringify(response, null, 2)}`);
//             }
//         } catch (error: any) {
//             setResult(`❌ EXCEPTION: ${error.message}\n\nFull error: ${JSON.stringify(error, null, 2)}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (authStatus !== 'authenticated') {
//         return <div>Please authenticate first</div>;
//     }

//     return (
//         <div style={{ padding: '20px', maxWidth: '800px' }}>
//             <h2>Bedrock Connection Test</h2>
//             <button
//                 onClick={testConnection}
//                 disabled={loading}
//                 style={{
//                     padding: '10px 20px',
//                     background: loading ? '#ccc' : '#007bff',
//                     color: 'white',
//                     border: 'none',
//                     borderRadius: '5px',
//                     cursor: loading ? 'not-allowed' : 'pointer'
//                 }}
//             >
//                 {loading ? 'Testing...' : 'Test Bedrock Connection'}
//             </button>

//             {result && (
//                 <pre style={{
//                     marginTop: '20px',
//                     padding: '15px',
//                     background: '#f5f5f5',
//                     border: '1px solid #ddd',
//                     borderRadius: '5px',
//                     whiteSpace: 'pre-wrap',
//                     fontSize: '14px'
//                 }}>
//                     {result}
//                 </pre>
//             )}
//         </div>
//     );
// }