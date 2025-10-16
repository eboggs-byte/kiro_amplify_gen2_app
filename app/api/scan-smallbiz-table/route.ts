import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get('table');

    if (!tableName) {
        return NextResponse.json({
            success: false,
            error: 'Table name is required'
        }, { status: 400 });
    }

    try {

        console.log(`🔍 Scanning DynamoDB table: ${tableName}`);

        // Import AWS SDK
        let DynamoDBClient, ScanCommand;

        try {
            const awsSdk = await import('@aws-sdk/client-dynamodb');
            const libDynamo = await import('@aws-sdk/lib-dynamodb');
            DynamoDBClient = awsSdk.DynamoDBClient;
            ScanCommand = libDynamo.ScanCommand;
        } catch (importError) {
            return NextResponse.json({
                success: false,
                error: 'AWS SDK not installed. Run: npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb'
            }, { status: 500 });
        }

        // Create DynamoDB client
        const client = new DynamoDBClient({
            region: process.env.AWS_REGION || 'us-east-1',
        });

        // Scan the table
        const command = new ScanCommand({
            TableName: tableName,
            Limit: 10 // Limit to first 10 records for testing
        });

        const response = await client.send(command);

        console.log(`✅ Scanned ${tableName}:`, response.Items);

        // Sort by updated_at or updatedAt to get most recent first
        let sortedItems = response.Items || [];
        if (sortedItems.length > 0) {
            sortedItems = sortedItems.sort((a, b) => {
                const dateA = new Date(a.updated_at || a.updatedAt || '').getTime();
                const dateB = new Date(b.updated_at || b.updatedAt || '').getTime();
                return dateB - dateA; // Most recent first
            });
        }

        return NextResponse.json({
            success: true,
            tableName,
            data: sortedItems,
            count: sortedItems.length,
            message: `Successfully scanned ${tableName}`
        });

    } catch (error: any) {
        console.error('❌ Error scanning DynamoDB table:', error);

        if (error.name === 'ResourceNotFoundException') {
            return NextResponse.json({
                success: false,
                error: `Table not found: ${tableName}`,
                suggestion: 'Check if the table name is correct'
            }, { status: 404 });
        }

        if (error.name === 'CredentialsProviderError' || error.name === 'UnauthorizedOperation') {
            return NextResponse.json({
                success: false,
                error: 'AWS credentials not configured or insufficient permissions',
                suggestion: 'Check AWS credentials and DynamoDB permissions'
            }, { status: 403 });
        }

        return NextResponse.json({
            success: false,
            error: 'Failed to scan table: ' + error.message
        }, { status: 500 });
    }
}