# Widget Interaction Flow

This document describes the new widget interaction flow that allows users to seamlessly transition from the main AI Business Assistant to specialized widget pages.

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

### 3. Widget Pages
Each widget page contains:
- **Navigation tabs** for different sections within the widget
- **Specialized chatbot** with context-aware responses
- **Back button** to return to the main dashboard

## Available Widgets

### Business Planning Widget
**Sections:**
1. **Business Overview** - Mission, vision, products/services, target customers
2. **Market Analysis** - Industry research, competitors, market opportunities  
3. **Strategy Development** - Business model, marketing plan, operational strategy

**URL:** `/business-planning`

### Finance & Funding Widget
**Sections:**
1. **Financial Projections** - Revenue forecasts, expense planning, P&L projections
2. **Funding Options** - Investment requirements, funding sources, strategies
3. **Budgeting & Cash Flow** - Cash flow management, budget planning, financial controls

**URL:** `/finance-funding`

## Technical Implementation

### Components Created
- `BusinessPlanningWidget.tsx` - Main business planning interface
- `FinanceFundingWidget.tsx` - Main finance & funding interface  
- `WidgetRecommendation.tsx` - Popup recommendation component

### API Integration
- Widget chatbots send contextual information to the `/api/agents` endpoint
- Context includes widget type and current section for better agent responses
- Maintains compatibility with existing Bedrock agent setup

### Navigation Flow
1. **Dashboard** → **Widget Recommendation** → **Widget Page**
2. **Widget Page** → **Back Button** → **Dashboard**
3. **Dashboard Grid** → **Direct Widget Access** → **Widget Page**

## Usage Examples

### Example 1: Business Planning Flow
1. User asks: "Help me create a business plan for my restaurant"
2. AI responds with business planning guidance
3. Widget recommendation appears: "Would you like to use our Business Planning Widget?"
4. User clicks "Business Planning Widget"
5. Navigates to `/business-planning` with specialized tools

### Example 2: Finance Flow  
1. User asks: "How much funding do I need for my startup?"
2. AI provides funding guidance
3. Widget recommendation appears: "Would you like to explore our Finance & Funding Widget?"
4. User clicks "Finance & Funding Widget"
5. Navigates to `/finance-funding` with financial planning tools

## Styling
- Consistent design language with the main dashboard
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Accessible color schemes and focus states

## Future Enhancements
- Additional widget types (Marketing, Legal, Operations)
- Widget-to-widget navigation
- Save/resume widget sessions
- Export widget outputs to documents
- Integration with external business tools