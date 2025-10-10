import { NextRequest, NextResponse } from 'next/server';

const AGENTS_BASE_URL = process.env.AGENTS_BASE_URL || 'http://127.0.0.1:8080';
const AGENTS_INVOKE_ENDPOINT = '/invoke';

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-actor-id',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Forwarding message to agents:', message);
    console.log('🌐 Agents URL:', `${AGENTS_BASE_URL}${AGENTS_INVOKE_ENDPOINT}`);
    console.log('🔍 Full request URL:', `${AGENTS_BASE_URL}${AGENTS_INVOKE_ENDPOINT}`);

    // Forward the message to your existing agents
    const response = await fetch(`${AGENTS_BASE_URL}${AGENTS_INVOKE_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-actor-id': 'test-user-123', // Required header for your agents
      },
      body: JSON.stringify({ message: message }),
    });

    console.log('📡 Agents response status:', response.status);
    console.log('📡 Agents response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Agents error response:', errorText);
      throw new Error(`Agents responded with status ${response.status}: ${response.statusText}. Error: ${errorText}`);
    }

    const agentData = await response.json();
    console.log('📥 Agent response data:', agentData);

    // Transform the response to a consistent format
    // Handle different response structures from your agents
    let responseContent = agentData.response || agentData.message || agentData.content || agentData.output;
    
    // If the response is an object with {reply, state} structure, extract the reply
    if (responseContent && typeof responseContent === 'object' && responseContent.reply) {
      responseContent = responseContent.reply;
    }
    
    return NextResponse.json({
      response: responseContent || 'No response from agents',
      agent_used: agentData.agent_used || agentData.agent || agentData.agent_type || 'Unknown Agent',
      confidence: agentData.confidence || agentData.confidence_score || agentData.score || 'Unknown',
      routing_info: agentData.routing_info || agentData.metadata || agentData.meta || {},
      error: agentData.error || null
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-actor-id',
      },
    });

  } catch (error: any) {
    console.error('❌ Agent connection failed:', error);
    
    // Return a helpful error message with more details
    return NextResponse.json(
      { 
        error: `Agent connection failed: ${error.message}. Make sure your agents are running at ${AGENTS_BASE_URL}${AGENTS_INVOKE_ENDPOINT}`,
        response: null,
        agent_used: null,
        confidence: null,
        debug_info: {
          agents_url: `${AGENTS_BASE_URL}${AGENTS_INVOKE_ENDPOINT}`,
          error_type: error.name,
          error_message: error.message
        }
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-actor-id',
        },
      }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Agents API proxy is running', 
    status: 'healthy',
    agents_url: `${process.env.AGENTS_BASE_URL || 'http://localhost:8080'}/invoke`
  });
}
