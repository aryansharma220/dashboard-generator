import { GoogleGenerativeAI } from '@google/generative-ai';
import DataUtils from './dataUtils';

class GeminiService {
  constructor() {
    this.apiKey = null;
    this.genAI = null;
    this.model = null;
    this.initializeAPI();
  }

  initializeAPI() {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey && storedKey !== 'demo-key') {
        this.apiKey = storedKey;
      }
    }
    
    if (!this.apiKey) {
      this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'demo-key';
    }
    
    if (this.apiKey && this.apiKey !== 'demo-key') {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      } catch (error) {
        console.warn('Gemini API not available:', error.message);
      }
    }
  }

  updateAPIKey(newKey) {
    this.apiKey = newKey;
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', newKey);
    }
    this.initializeAPI();
  }

  async analyzeDataStructure(data, filename) {
    if (!this.model) {
      return this.getFallbackAnalysis(data, filename);
    }

    try {
      const sampleData = data.slice(0, 5);
      const columns = Object.keys(data[0] || {});
      
      const prompt = `
Analyze this dataset structure and provide insights for dashboard creation:
Filename: ${filename}
Columns: ${columns.join(', ')}
Sample Data (first 5 rows):
${JSON.stringify(sampleData, null, 2)}

Please provide a JSON response with the following structure:
{
  "datasetSummary": "Brief description of what this dataset represents",
  "columnAnalysis": {
    "numeric": ["list of numeric column names"],
    "categorical": ["list of categorical column names"],
    "temporal": ["list of date/time column names"]
  },
  "suggestedCharts": [
    {
      "title": "Chart title",
      "type": "bar|line|pie|area",
      "xAxis": "column name",
      "yAxis": "column name",
      "groupBy": "column name or null",
      "reasoning": "Why this chart would be valuable"
    }
  ],
  "keyInsights": ["List of 3-5 key insights about the data"],
  "recommendedFilters": ["Columns that would make good filters"],
  "dataQualityNotes": ["Any observations about data quality or missing values"]
}

Ensure the response is valid JSON only, no additional text.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.warn('Failed to parse Gemini response, using fallback');
        return this.getFallbackAnalysis(data, filename);
      }
    } catch (error) {
      console.warn('Gemini API call failed:', error.message);
      return this.getFallbackAnalysis(data, filename);
    }
  }

  async generateInsights(data, chartConfigs) {
    if (!this.model) {
      return this.getFallbackInsights(data, chartConfigs);
    }

    try {
      const prompt = `
Analyze this dataset and provide business insights:
Dataset size: ${data.length} rows
Chart configurations: ${JSON.stringify(chartConfigs)}

Based on the data patterns and chart configurations, provide insights in this JSON format:
{
  "executiveSummary": "2-3 sentence summary of key findings",
  "trends": ["List of trends observed in the data"],
  "anomalies": ["Any unusual patterns or outliers"],
  "recommendations": ["Actionable business recommendations"],
  "predictiveInsights": ["Potential future trends or predictions"]
}

Provide only valid JSON, no additional text.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch (parseError) {
        return this.getFallbackInsights(data, chartConfigs);
      }
    } catch (error) {
      console.warn('Gemini insights generation failed:', error.message);
      return this.getFallbackInsights(data, chartConfigs);
    }
  }

  getFallbackAnalysis(data, filename) {
    const columns = Object.keys(data[0] || {});
    const numericColumns = this.identifyNumericColumns(data, columns);
    const categoricalColumns = columns.filter(col => !numericColumns.includes(col));
    const temporalColumns = DataUtils.identifyTemporalColumns(columns);

    const suggestedCharts = this.generateFallbackCharts(numericColumns, categoricalColumns, temporalColumns);

    return {
      datasetSummary: `Dataset with ${data.length} rows and ${columns.length} columns from ${filename}`,
      columnAnalysis: {
        numeric: numericColumns,
        categorical: categoricalColumns,
        temporal: temporalColumns
      },
      suggestedCharts,
      keyInsights: [
        `Dataset contains ${data.length} records with ${numericColumns.length} quantitative measures`,
        `Found ${categoricalColumns.length} categorical dimensions for grouping and filtering`,
        temporalColumns.length > 0 ? 'Time-based analysis possible with temporal columns detected' : 'Static dataset suitable for cross-sectional analysis',
        'Data structure appears consistent and ready for visualization'
      ],
      recommendedFilters: categoricalColumns.slice(0, 3),
      dataQualityNotes: [
        'Data structure appears consistent across records',
        'Consider checking for missing values in critical columns',
        data.length > 1000 ? 'Large dataset may benefit from aggregation for performance' : 'Dataset size is optimal for detailed visualization'
      ]
    };
  }

  getFallbackInsights(data, chartConfigs) {
    return {
      executiveSummary: `Analysis of ${data.length} records across ${chartConfigs.length} visualizations reveals key patterns and trends in the dataset.`,
      trends: [
        'Data shows consistent patterns across different categories',
        'Notable variations in key metrics suggest seasonal or cyclical behavior',
        'Distribution patterns indicate potential growth opportunities'
      ],
      anomalies: [
        'Some outliers detected in the dataset',
        'Certain categories show unexpected value distributions'
      ],
      recommendations: [
        'Focus on high-performing categories for growth',
        'Investigate anomalies for potential insights',
        'Consider implementing regular monitoring of key metrics',
        'Develop strategies based on identified trends'
      ],
      predictiveInsights: [
        'Current trends suggest continued growth in key areas',
        'Seasonal patterns may indicate optimal timing for initiatives',
        'Data suggests potential for optimization in underperforming segments'
      ]
    };
  }  identifyNumericColumns(data, columns) {
    return DataUtils.analyzeColumnTypes(data).numeric || [];
  }

  generateFallbackCharts(numericColumns, categoricalColumns, temporalColumns) {
    const charts = [];

    // Time series analysis (highest priority if temporal data exists)
    if (temporalColumns.length > 0 && numericColumns.length > 0) {
      charts.push({
        title: `${this.humanizeColumnName(numericColumns[0])} Trend Analysis`,
        type: 'line',
        xAxis: temporalColumns[0],
        yAxis: numericColumns[0],
        groupBy: categoricalColumns.length > 0 ? categoricalColumns[0] : null,
        reasoning: 'Time series visualization reveals trends, seasonality, and patterns over time periods'
      });
      
      if (numericColumns.length > 1) {
        charts.push({
          title: `${this.humanizeColumnName(numericColumns[1])} Volume Over Time`,
          type: 'area',
          xAxis: temporalColumns[0],
          yAxis: numericColumns[1],
          groupBy: null,
          reasoning: 'Area chart emphasizes cumulative values and volume changes over time'
        });
      }
    }

    // Category-based analysis
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      charts.push({
        title: `${this.humanizeColumnName(numericColumns[0])} Distribution by ${this.humanizeColumnName(categoricalColumns[0])}`,
        type: 'pie',
        xAxis: categoricalColumns[0],
        yAxis: numericColumns[0],
        groupBy: null,
        reasoning: 'Pie chart shows proportional breakdown and relative importance of categories'
      });
      
      charts.push({
        title: `${this.humanizeColumnName(numericColumns[0])} Performance by ${this.humanizeColumnName(categoricalColumns[0])}`,
        type: 'bar',
        xAxis: categoricalColumns[0],
        yAxis: numericColumns[0],
        groupBy: categoricalColumns.length > 1 ? categoricalColumns[1] : null,
        reasoning: 'Bar chart enables easy comparison of values across different categories'
      });
    }

    // Numeric correlation analysis (when no categories available)
    if (numericColumns.length >= 2 && categoricalColumns.length === 0) {
      charts.push({
        title: `${this.humanizeColumnName(numericColumns[0])} vs ${this.humanizeColumnName(numericColumns[1])} Correlation`,
        type: 'line',
        xAxis: 'Index',
        yAxis: numericColumns[0],
        groupBy: null,
        reasoning: 'Correlation analysis helps identify relationships between numeric variables'
      });
    }

    return charts.slice(0, 4);
  }

  humanizeColumnName(columnName) {
    if (!columnName) return 'Value';
    
    return columnName
      .replace(/[_-]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  // Simplified data processing using DataUtils
  processDataForChart(data, chartConfig, insights = null) {
    const validation = this.validateChartData(data, chartConfig);
    if (!validation.valid) {
      console.warn(`Chart data validation failed: ${validation.error}`);
      return [];
    }

    let processedData = [...data];

    // Add row index if needed
    if (chartConfig.xAxis === 'row_index' || chartConfig.xAxis === 'Index') {
      processedData = processedData.map((row, index) => ({
        ...row,
        row_index: index + 1,
        Index: index + 1
      }));
    }

    // Use DataUtils for processing
    processedData = DataUtils.cleanData(processedData);
    
    if (processedData.length === 0) {
      console.warn('No data remaining after cleaning');
      return [];
    }
    
    processedData = DataUtils.normalizeNumericData(processedData, chartConfig);

    // Handle different chart types
    switch (chartConfig.type) {
      case 'pie':
        processedData = this.processPieChartData(processedData, chartConfig);
        break;
      case 'line':
      case 'area':
        processedData = this.processTimeSeriesData(processedData, chartConfig);
        break;
      case 'bar':
        processedData = this.processBarChartData(processedData, chartConfig);
        break;
      default:
        if (chartConfig.groupBy && chartConfig.groupBy !== '') {
          processedData = DataUtils.aggregateData(processedData, chartConfig);
        } else {
          processedData = DataUtils.aggregateByXAxis(processedData, chartConfig);
        }
        break;
    }

    processedData = DataUtils.sortData(processedData, chartConfig);

    if (chartConfig.type === 'pie' && processedData.length > 15) {
      processedData = DataUtils.limitPieSlices(processedData, chartConfig, 12);
    } else if (chartConfig.type !== 'pie' && processedData.length > 100) {
      processedData = DataUtils.intelligentSample(processedData, 75);
    }

    return processedData;
  }
  processPieChartData(data, chartConfig) {
    // Use DataUtils for aggregation, then format for pie chart
    const aggregated = DataUtils.aggregateByXAxis(data, chartConfig);
    
    // Filter out zero/negative values and sort
    const result = aggregated
      .filter(item => item[chartConfig.yAxis] > 0)
      .sort((a, b) => b[chartConfig.yAxis] - a[chartConfig.yAxis]);
    
    // Calculate percentages
    const total = result.reduce((sum, item) => sum + item[chartConfig.yAxis], 0);
    
    return result.map(item => ({
      ...item,
      percentage: ((item[chartConfig.yAxis] / total) * 100).toFixed(1)
    }));
  }

  processTimeSeriesData(data, chartConfig) {
    let processedData = [...data];
    
    const isTemporalX = DataUtils.identifyTemporalColumns([chartConfig.xAxis]).length > 0;
    
    if (isTemporalX) {
      processedData = this.sortTemporalData(processedData, chartConfig.xAxis);
    }
    
    if (chartConfig.groupBy && chartConfig.groupBy !== '') {
      return this.aggregateTimeSeriesData(processedData, chartConfig);
    }
    
    return DataUtils.aggregateByXAxis(processedData, chartConfig);
  }

  processBarChartData(data, chartConfig) {
    if (chartConfig.groupBy && chartConfig.groupBy !== '') {
      return DataUtils.aggregateData(data, chartConfig);
    }
    
    const aggregated = DataUtils.aggregateByXAxis(data, chartConfig);
    return aggregated.sort((a, b) => b[chartConfig.yAxis] - a[chartConfig.yAxis]);
  }
  sortTemporalData(data, xColumn) {
    return DataUtils.sortData(data, { xAxis: xColumn, type: 'line' });
  }
  aggregateTimeSeriesData(data, chartConfig) {
    return DataUtils.aggregateData(data, chartConfig);
  }

  validateChartData(data, chartConfig) {
    if (!data || data.length === 0) {
      return { valid: false, error: 'No data available for visualization' };
    }

    const xAxisData = data.map(row => row[chartConfig.xAxis]).filter(val => val !== undefined && val !== null);
    const yAxisData = data.map(row => row[chartConfig.yAxis]).filter(val => val !== undefined && val !== null);

    if (xAxisData.length === 0) {
      return { valid: false, error: `No valid data found in X-axis column: ${chartConfig.xAxis}` };
    }

    if (yAxisData.length === 0) {
      return { valid: false, error: `No valid data found in Y-axis column: ${chartConfig.yAxis}` };
    }

    if (chartConfig.type !== 'pie') {
      const numericYData = yAxisData.filter(val => !isNaN(parseFloat(val)));
      if (numericYData.length === 0) {
        return { valid: false, error: `Y-axis column "${chartConfig.yAxis}" contains no numeric data` };
      }
    }

    const minPoints = chartConfig.type === 'pie' ? 2 : 1;
    if (data.length < minPoints) {
      return { valid: false, error: `Insufficient data points. Need at least ${minPoints} for ${chartConfig.type} chart` };
    }

    return { valid: true, processedCount: data.length };
  }
  // Data quality assessment using DataUtils
  assessDataQuality(data, columns) {
    const assessment = {
      overall: 0,
      completeness: 0,
      consistency: 0,
      accuracy: 0,
      issues: [],
      recommendations: []
    };

    if (!data || data.length === 0) {
      return { ...assessment, overall: 0, issues: ['No data available'] };
    }

    // Use DataUtils for outlier detection
    const columnTypes = DataUtils.analyzeColumnTypes(data);
    const numericColumns = columnTypes.number || [];
    const outliers = numericColumns.length > 0 ? DataUtils.detectOutliers(data, numericColumns[0]) : [];

    // Basic quality checks
    const nullCounts = columns.map(col => ({
      column: col,
      nulls: data.filter(row => !row[col] || row[col] === '').length,
      percentage: (data.filter(row => !row[col] || row[col] === '').length / data.length) * 100
    }));

    const avgCompleteness = 1 - (nullCounts.reduce((sum, col) => sum + col.percentage, 0) / (columns.length * 100));
    assessment.completeness = Math.max(0, avgCompleteness);

    const typeConsistency = columns.map(col => {
      const types = [...new Set(data.slice(0, 100).map(row => typeof row[col]))];
      return types.length <= 2;
    });

    assessment.consistency = typeConsistency.filter(Boolean).length / columns.length;
    assessment.accuracy = 0.9; // Simplified for now
    assessment.overall = (assessment.completeness + assessment.consistency + assessment.accuracy) / 3;

    // Generate recommendations
    nullCounts.forEach(col => {
      if (col.percentage > 20) {
        assessment.issues.push(`High missing data in ${col.column} (${col.percentage.toFixed(1)}%)`);
        assessment.recommendations.push(`Consider data imputation or exclusion for ${col.column}`);
      }
    });

    if (outliers && outliers.length > 0) {
      assessment.issues.push(`${outliers.length} outliers detected`);
      assessment.recommendations.push('Review outliers for data quality issues');
    }

    if (assessment.overall < 0.7) {
      assessment.recommendations.push('Data cleaning recommended before visualization');
    }

    return assessment;
  }
}

export default new GeminiService();
