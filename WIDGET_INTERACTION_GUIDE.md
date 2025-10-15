# Widget Interaction Flow

This document describes the new widget interaction flow that allows users to seamlessly transition from the main AI Business Assistant to specialized workflow-based planning tools.

## How It Works

### 1. Main Dashboard Interaction
- Users start by chatting with the AI Business Assistant on the main dashboard
- The assistant analyzes user messages for business planning or finance-related keywords
- After relevant conversations, a widget recommendation popup appears

### 2. Widget Recommendation System
The system automatically detects when to recommend widgets based on:

**Business Planning Keywords:**
- business plan, strategy, market analysis, competition, target market
- business model, mission, vision, swot, competitive advantage

**Finance & Funding Keywords:**
- funding, investment, loan, capital, financial projection, budget
- cash flow, revenue, profit, expenses, startup costs, venture capital

### 3. Workflow-Based Widget Pages
Each widget page now contains a comprehensive workflow interface with:
- **Step-by-step progress tracking** with visual indicators
- **Structured form-based questions** for systematic data collection
- **AI Assistant sidebar** for contextual help and guidance
- **Resource library** with calculators, benchmarks, and tutorials
- **Progress summary** showing completion status and time spent
- **Save/resume functionality** for long-form planning sessions

## Available Workflow Widgets

### Business Planning Workflow
**8-Step Comprehensive Process:**
1. **Business Overview** ✅ - Mission, vision, products/services, target customers
2. **Market Analysis** ✅ - Industry research, competitors, market opportunities  
3. **Financial Planning** 🔄 - Investment requirements, startup costs breakdown
4. **Operations Plan** - Operational processes, supply chain, staffing
5. **Marketing Strategy** - Marketing channels, customer acquisition, branding
6. **Risk Assessment** - Risk identification, mitigation strategies
7. **Implementation** - Timeline, milestones, action plans
8. **Review & Finalize** - Final review, document generation

**Current Focus:** Financial Planning step with investment requirement forms
**URL:** `/business-planning`

### Finance & Funding Workflow  
**5-Step Financial Planning Process:**
1. **Financial Projections** 🔄 - Revenue forecasts, growth projections
2. **Funding Requirements** - Capital needs, funding timeline
3. **Cash Flow Planning** - Monthly cash flow, break-even analysis
4. **Scenario Analysis** - Best/worst case scenarios, sensitivity analysis
5. **Key Metrics** - KPIs, financial ratios, performance indicators

**Current Focus:** Revenue projections with monthly forecasting forms
**URL:** `/finance-funding`

## Technical Implementation

### Components Created
- `BusinessPlanningWorkflow.tsx` - Comprehensive 8-step business planning workflow
- `FinanceFundingWorkflow.tsx` - 5-step financial planning workflow
- `WidgetRecommendation.tsx` - Popup recommendation component
- `workflow.css` - Complete styling for workflow interfaces

### Key Features
- **Progress Tracking:** Visual progress bars and step indicators
- **Form Validation:** Real-time validation and calculation
- **AI Integration:** Contextual AI assistant with workflow-specific prompts
- **Resource Library:** Built-in calculators, benchmarks, and tutorials
- **Responsive Design:** Mobile-friendly workflow interface
- **Save/Resume:** Automatic form state management

### API Integration
- Workflow AI assistants send contextual information to `/api/agents` endpoint
- Context includes workflow type, current step, and section for targeted responses
- Enhanced prompting with `[Workflow Name - Step] user_message` format
- Maintains compatibility with existing Bedrock agent setup

### Navigation Flow
1. **Dashboard** → **Widget Recommendation** → **Workflow Page**
2. **Workflow Page** → **Back Button** → **Dashboard**
3. **Dashboard Grid** → **Direct Workflow Access** → **Workflow Page**
4. **Within Workflow** → **Step Navigation** → **Progress Tracking**

## Usage Examples

### Example 1: Business Planning Workflow
1. User asks: "Help me create a business plan for my restaurant"
2. AI responds with business planning guidance
3. Widget recommendation appears: "Would you like to use our Business Planning Workflow?"
4. User clicks "Business Planning Widget"
5. Navigates to `/business-planning` showing:
   - Progress: Step 3 of 8 (Financial Planning)
   - Current question: "Initial Investment Requirements"
   - Form fields for equipment, inventory, marketing, working capital
   - AI assistant ready to help with financial planning questions
   - Resources: Startup cost calculator, industry benchmarks

### Example 2: Finance & Funding Workflow
1. User asks: "How much funding do I need for my startup?"
2. AI provides funding guidance  
3. Widget recommendation appears: "Would you like to explore our Finance & Funding Workflow?"
4. User clicks "Finance & Funding Widget"
5. Navigates to `/finance-funding` showing:
   - Progress: Step 1 of 5 (Financial Projections)
   - Current question: "Revenue Projections"
   - Form fields for monthly revenue forecasts and assumptions
   - AI assistant for projection guidance
   - Resources: Revenue calculator, industry benchmarks, modeling guides

## Styling
- Consistent design language with the main dashboard
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Accessible color schemes and focus states

## Interface Features

### Workflow Layout
- **Header:** Navigation breadcrumbs, save/previous buttons, branding
- **Left Sidebar:** Progress tracking, step overview, quick tips
- **Main Content:** Current question with structured forms
- **Right Sidebar:** AI assistant, resources, progress summary
- **Bottom Navigation:** Previous/Next question controls, skip options

### Form Types
- **Investment Breakdown:** Currency inputs with automatic totaling
- **Revenue Projections:** Monthly forecasting with growth calculations  
- **Text Areas:** Assumptions, notes, and detailed explanations
- **Dropdowns:** Predefined options for business models, categories
- **Progress Indicators:** Visual feedback on completion status

### AI Assistant Features
- **Contextual Help:** Workflow and step-specific guidance
- **Resource Suggestions:** Relevant calculators and benchmarks
- **Real-time Chat:** Immediate answers to planning questions
- **Progress Tracking:** Questions answered, time spent, estimated completion

## Future Enhancements
- Additional workflow types (Marketing, Legal, Operations)
- Cross-workflow navigation and data sharing
- Advanced save/resume with cloud sync
- Export workflows to PDF/Word documents
- Integration with external business tools and APIs
- Collaborative planning with team members
- Template library for different business types