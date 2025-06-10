# Dashboard Generator

A frontend-only SaaS-style dashboard generator web app built with React, Next.js, Tailwind CSS, and Recharts. Create interactive dashboards from CSV and Excel data entirely in your browser!

## 🚀 Features

### Core Functionality
- **File Upload**: Support for CSV and Excel (.xlsx, .xls) files with drag-and-drop
- **Interactive Charts**: Bar, Line, Area, and Pie charts using Recharts
- **Dashboard Configuration**: Easy-to-use form for setting up charts with X/Y axes, grouping, and filtering
- **Multiple Export Options**:
  - PNG image export
  - PDF export
  - Standalone HTML file
  - Embeddable iframe code
- **Dark/Light Theme**: Toggle between themes with smooth transitions
- **Responsive Design**: Works on desktop and mobile
- **No Backend Required**: Everything runs in the browser
- **Data Privacy**: Your data never leaves your browser

### 🤖 AI-Powered Features (Gemini 2.0 Flash)
- **Intelligent Data Analysis**: Automatic analysis of uploaded datasets
- **Smart Chart Recommendations**: AI suggests the best chart types for your data
- **Column Classification**: Automatic detection of numeric, categorical, and temporal columns
- **Business Insights Generation**: AI-powered analysis of trends, anomalies, and recommendations
- **Data Quality Assessment**: Identifies potential data issues and suggests improvements
- **Predictive Insights**: AI-generated predictions and trend analysis

## 🛠️ Tech Stack

- **Frontend**: React 19, Next.js 15.3
- **Styling**: Tailwind CSS 4 with custom animations and glassmorphism effects
- **Charts**: Recharts with custom themes and responsive containers
- **AI Integration**: Google Gemini 2.0 Flash for intelligent data analysis
- **File Processing**: 
  - PapaParse for CSV parsing
  - SheetJS (xlsx) for Excel parsing
- **Export**: 
  - html2canvas for image capture
  - jsPDF for PDF generation
- **State Management**: Zustand with persistent storage
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) Gemini API key for AI features

## 🚀 Getting Started

### Basic Setup

1. **Clone or download the project**

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Start the development server**:
   ```powershell
   npm run dev
   # or use the PowerShell script
   .\start-dev.ps1
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### 🤖 AI Features Setup (Optional)

To enable AI-powered insights and chart recommendations:

1. **Get a Gemini API key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a free account and generate an API key

2. **Configure the API key** (choose one method):
   
   **Method 1: Environment File**
   ```powershell
   # Copy the example file
   cp .env.example .env.local
   # Edit .env.local and add your API key
   ```
   
   **Method 2: In-App Configuration**
   - Launch the app and go to the dashboard view
   - Click "AI Settings" in the top toolbar
   - Enter your API key and save

3. **Enjoy AI Features**:
   - Automatic data analysis on file upload
   - Smart chart suggestions based on your data
   - Business insights generation after dashboard creation

## 📖 Usage Guide

### Step 1: Upload Your Data
- Drag and drop a CSV or Excel file onto the upload area
- Or click to browse and select a file
- Supported formats: .csv, .xlsx, .xls
- The AI will automatically analyze your data structure (if API key is configured)

### Step 2: Configure Your Dashboard
- Set a dashboard title and optional subtitle
- Review AI-generated chart suggestions (if available)
- Add charts manually using the form:
  - Choose chart type (Bar, Line, Area, Pie)
  - Select X and Y axes from your data columns
  - Optionally group data by categorical columns
- Use "Add All Suggestions" to quickly add AI-recommended charts

### Step 3: View and Export Your Dashboard
- Review your interactive dashboard with all charts
- Toggle between light and dark themes
- View AI-generated business insights (if available)
- Export your dashboard:
  - **PNG**: High-quality image download
  - **PDF**: Professional document format
  - **HTML**: Standalone file that works offline
  - **Embed**: Copy code to embed in websites

## 🎯 AI Features Deep Dive

### Data Analysis
The AI automatically analyzes your uploaded data to:
- Identify column types (numeric, categorical, temporal)
- Assess data quality and completeness
- Suggest appropriate visualization types
- Recommend filters and grouping options

### Chart Recommendations
Based on your data structure, the AI suggests:
- Most effective chart types for your data relationships
- Optimal X/Y axis combinations
- Logical grouping strategies
- Reasoning behind each recommendation

### Business Insights
After dashboard creation, the AI generates:
- **Executive Summary**: High-level overview of key findings
- **Trends**: Notable patterns and trends in your data
- **Anomalies**: Unusual data points that deserve attention
- **Recommendations**: Actionable business suggestions
- **Predictive Insights**: Potential future trends and opportunities

## 🔧 Configuration & Troubleshooting

### Environment Variables
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### Common Issues

**AI features not working**
- Verify your Gemini API key is correctly configured
- Check browser console for API-related errors
- Ensure you have sufficient API quota remaining

**Charts not displaying properly**
- Ensure your data has appropriate numeric columns for Y-axis
- Check that column names don't contain special characters

**Export not working**
- Try disabling browser popup blockers
- Ensure sufficient disk space for downloads
- Check browser compatibility (modern browsers recommended)

## 🛡️ Privacy & Security

- **No Server Storage**: All processing happens in your browser
- **Local API Keys**: API keys stored in browser localStorage only
- **No Data Transmission**: Your data files never leave your device
- **Client-Side AI**: AI analysis runs through direct API calls from your browser

---

**Built with ❤️ using React, Next.js, Tailwind CSS, Recharts, and AI power from Google Gemini**
