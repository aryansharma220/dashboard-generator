# 🤖 AI-Enhanced Dashboard Generator

**Transform your data into intelligent insights with AI-powered analysis and chart recommendations!**

A next-generation dashboard generator that combines the power of AI with beautiful data visualizations. Built with React, Next.js, Tailwind CSS, Recharts, and Google's Gemini AI.

## ✨ Key Features

### 🧠 **AI-Powered Analysis**
- **Smart Data Analysis**: Automatic column type detection and data quality assessment
- **Intelligent Chart Suggestions**: AI recommends optimal visualizations with explanations
- **Pattern Recognition**: Discovers trends, anomalies, and correlations automatically
- **Business Insights**: Generates executive summaries and actionable recommendations

### 📊 **Advanced Visualizations**
- **Multiple Chart Types**: Bar, Line, Area, and Pie charts with AI optimization
- **Smart Data Grouping**: AI determines optimal data aggregation strategies
- **Enhanced Rendering**: Beautiful, responsive charts with modern design
- **Theme Support**: Light and dark themes with smooth transitions

### 🚀 **Export & Sharing**
  - PNG image export
  - PDF export
  - Standalone HTML file
  - Embeddable iframe code
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile
- **No Backend Required**: Everything runs in the browser
- **Data Privacy**: Your data never leaves your browser

## 🛠️ Tech Stack

- **Frontend**: React 19, Next.js 15.3
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **File Processing**: 
  - PapaParse for CSV parsing
  - SheetJS (xlsx) for Excel parsing
- **Export**: 
  - html2canvas for image capture
  - jsPDF for PDF generation
- **State Management**: Zustand
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## 📊 How to Use

### Step 1: Upload Data
- Drag and drop a CSV or Excel file, or click to browse
- Supported formats: `.csv`, `.xlsx`, `.xls`
- Your data is processed entirely in the browser - no uploads to any server

### Step 2: Configure Dashboard
- Set your dashboard title and subtitle
- Add charts by selecting:
  - Chart type (Bar, Line, Area, Pie)
  - X-axis column (any column from your data)
  - Y-axis column (numeric columns only)
  - Optional grouping column for data segmentation
- Add multiple charts to create a comprehensive dashboard

### Step 3: View and Export
- View your interactive dashboard with all configured charts
- Toggle between light and dark themes
- Export options:
  - **PNG**: Download dashboard as image
  - **PDF**: Generate PDF report
  - **HTML**: Download standalone HTML file
  - **Embed**: Get iframe code to embed in websites

## 🎯 Example Use Cases

- **Sales Analytics**: Upload sales data → Create "Revenue by Month" bar chart → Group by Region → Export as PDF for presentation
- **Survey Results**: Upload survey responses → Create pie charts for different questions → Download as images for reports
- **Financial Data**: Upload transaction data → Create line charts for trends → Export as standalone HTML for sharing

---

**Built with ❤️ using React, Next.js, and Recharts**
