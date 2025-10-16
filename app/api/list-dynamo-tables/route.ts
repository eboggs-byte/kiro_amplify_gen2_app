import { NextRequest, NextResponse } from 'next/server';

// We'll use AWS SDK v3 to list actual DynamoDB tables
// First, let's install the required packages if not already installed
// npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Attempting to list DynamoDB tables...');

    // Try to import AWS SDK - if not installed, we'll get a helpful error
    let DynamoDBClient, ListTablesCommand;
    
    try {
      const awsSdk = await import('@aws-sdk/client-dynamodb');
      DynamoDBClient = awsSdk.DynamoDBClient;
      ListTablesCommand = awsSdk.ListTablesCommand;
    } catch (importError) {
      console.log('📦 AWS SDK not installed, returning mock table list');
      
      // If AWS SDK isn't installed, return what we know exists based on your setup
      const knownTables = [
        'SmallBizAgentState',
        'BusinessSession',
        'AnalysisMessage',
        'User',
        'BusinessPlan'
      ];
      
      return NextResponse.json({
        success: true,
        tables: knownTables,
        source: 'known_amplify_tables',
        message: 'AWS SDK not installed - showing known Amplify tables. Install @aws-sdk/client-dynamodb to see actual tables.'
      });
    }

    // Try to create DynamoDB client
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      // Credentials will be automatically picked up from environment or IAM role
    });

    // List all tables
    const command = new ListTablesCommand({});
    const response = await client.send(command);

    console.log('✅ DynamoDB tables found:', response.TableNames);

    return NextResponse.json({
      success: true,
      tables: response.TableNames || [],
      count: response.TableNames?.length || 0,
      source: 'aws_sdk',
      message: 'Tables retrieved from AWS DynamoDB'
    });

  } catch (error: any) {
    console.error('❌ Error listing DynamoDB tables:', error);
    
    // If there's an AWS credentials or permissions error, return helpful info
    if (error.name === 'CredentialsProviderError' || error.name === 'UnauthorizedOperation') {
      return NextResponse.json({
        success: false,
        error: 'AWS credentials not configured or insufficient permissions',
        tables: [],
        suggestion: 'Check AWS credentials and DynamoDB permissions'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to list DynamoDB tables: ' + error.message,
      tables: []
    }, { status: 500 });
  }
}