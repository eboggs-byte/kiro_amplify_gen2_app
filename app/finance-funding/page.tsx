"use client";

import FinanceFundingWorkflow from '../components/workflows/FinanceFundingWorkflow';
import ListDynamoTables from '../components/ListDynamoTables';

export default function FinanceFundingPage() {
    return (
        <div className="space-y-6">
            {/* Real DynamoDB Tables List */}
            <ListDynamoTables />
            
            <FinanceFundingWorkflow />
        </div>
    );
}