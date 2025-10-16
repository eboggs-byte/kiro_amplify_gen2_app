import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Fetching SmallBizAgentState from real DynamoDB table...');

    // First, get the list of tables to find the SmallBizAgentState table
    const tablesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/list-dynamo-tables`);
    const tablesData = await tablesResponse.json();

    if (!tablesData.success) {
      throw new Error('Failed to get table list: ' + tablesData.error);
    }

    // Find the SmallBizAgentState table (it might have a suffix like SmallBizAgentState-dev-abc123)
    const smallBizTable = tablesData.tables.find((table: string) => 
      table.includes('SmallBizAgentState') || table.toLowerCase().includes('smallbiz')
    );

    if (!smallBizTable) {
      return NextResponse.json({
        success: false,
        error: 'SmallBizAgentState table not found',
        availableTables: tablesData.tables
      }, { status: 404 });
    }

    console.log(`🎯 Found SmallBizAgentState table: ${smallBizTable}`);

    // Scan the actual table
    const scanResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/scan-smallbiz-table?table=${smallBizTable}`);
    const scanData = await scanResponse.json();

    if (!scanData.success) {
      throw new Error('Failed to scan table: ' + scanData.error);
    }

    console.log('✅ SmallBizAgentState Real Data:', scanData.data);

    return NextResponse.json({
      success: true,
      data: scanData.data || [],
      count: scanData.count || 0,
      tableName: smallBizTable,
      message: 'SmallBizAgentState data retrieved from real DynamoDB table'
    });

  } catch (error: any) {
    console.error('❌ Error fetching SmallBizAgentState data:', error);
    
    // Fallback to mock data if there's an error
    const fallbackData = [
      {
        pk: "USER#test-user-123",
        sk: "STATE#BUSINESS_IDEA",
        business_name: "FlowTrack",
        idea: "A social fitness tracking app that gamifies workouts and connects users with fitness communities",
        market: "Fitness enthusiasts and social media users aged 18-35",
        updated_at: "2025-10-16T13:01:21Z",
        id: "smallbiz-state-1",
        createdAt: "2025-10-16T13:01:21Z",
        updatedAt: "2025-10-16T13:01:21Z"
      }
    ];

    return NextResponse.json({
      success: true,
      data: fallbackData,
      count: fallbackData.length,
      message: 'Using fallback data due to error: ' + error.message,
      error: error.message
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 SmallBizAgentState API - Would create record:', body);
    
    return NextResponse.json({
      success: true,
      message: 'SmallBizAgentState record creation simulated',
      data: {
        ...body,
        id: `smallbiz-state-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error in SmallBizAgentState POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create SmallBizAgentState record: ' + error.message
    }, { status: 500 });
  }
}