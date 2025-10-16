"use client";

import React, { useState } from 'react';

export default function ListDynamoTables() {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const listTables = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching actual DynamoDB tables...');
      
      const response = await fetch('/api/list-dynamo-tables');
      const data = await response.json();
      
      console.log('✅ DynamoDB Tables Response:', data);
      
      setResult(data);
      
      if (data.success) {
        setTables(data.tables || []);
      } else {
        setError(data.error || 'Failed to list tables');
      }
      
    } catch (err: any) {
      console.error('❌ Error fetching tables:', err);
      setError('Failed to fetch tables: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const scanTable = async (tableName: string) => {
    try {
      console.log(`🔍 Scanning table: ${tableName}`);
      
      const response = await fetch(`/api/scan-smallbiz-table?table=${tableName}`);
      const data = await response.json();
      
      console.log(`✅ ${tableName} Scan Results:`, data);
      
      if (data.success && data.data && data.data.length > 0) {
        console.log(`📊 ${tableName} Records:`, data.data);
        console.log(`🎯 Most Recent Record:`, data.data[0]);
        
        // Show the business data if it exists
        const firstRecord = data.data[0];
        if (firstRecord.business_name || firstRecord.idea) {
          console.log(`🏢 Business Name: ${firstRecord.business_name}`);
          console.log(`💡 Business Idea: ${firstRecord.idea}`);
          console.log(`🎯 Market: ${firstRecord.market}`);
        }
        
        alert(`✅ Found ${data.count} records in ${tableName}. Check console for details!`);
      } else {
        alert(`📭 No records found in ${tableName}`);
      }
      
    } catch (err: any) {
      console.error(`❌ Error scanning ${tableName}:`, err);
      alert(`❌ Error scanning ${tableName}: ${err.message}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Real DynamoDB Tables</h2>
      
      <button
        onClick={listTables}
        disabled={loading}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Loading...' : 'List All DynamoDB Tables'}
      </button>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm">
          <strong>Source:</strong> {result.source} | <strong>Count:</strong> {result.count || 0}
          <br />
          <strong>Message:</strong> {result.message}
        </div>
      )}
      
      {tables.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Found {tables.length} Tables:</h3>
          <div className="space-y-2">
            {tables.map((tableName) => (
              <div key={tableName} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <span className="font-medium">{tableName}</span>
                <button
                  onClick={() => scanTable(tableName)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Scan Table
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <p className="font-medium text-yellow-800 mb-1">📋 Next Steps:</p>
            <ol className="text-yellow-700 list-decimal list-inside space-y-1">
              <li>Check which table contains your SmallBizAgentState data</li>
              <li>Look for tables with names containing "SmallBiz" or similar</li>
              <li>We'll then create a scan function to read the actual data</li>
            </ol>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 text-blue-700 text-sm rounded">
        <p className="font-medium mb-1">💡 Check browser console for detailed logs!</p>
        <p>This will show us the exact table names in your AWS DynamoDB.</p>
      </div>
    </div>
  );
}