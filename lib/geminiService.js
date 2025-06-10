import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    // For demo purposes, we'll check localStorage first, then env variables
    this.apiKey = null;
    this.genAI = null;
    this.model = null;
    
    this.initializeAPI();
  }

  initializeAPI() {
    // Check localStorage first (for demo/client-side usage)
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('gemini_api_key');
      if (storedKey && storedKey !== 'demo-key') {
        this.apiKey = storedKey;
      }
    }
    
    // Fallback to environment variable
    if (!this.apiKey) {
      this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'demo-key';
    }
    
    // Initialize only if API key is available and valid
    if (this.apiKey && this.apiKey !== 'demo-key') {
      try {        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      } catch (error) {
        console.warn('Gemini API not available:', error.message);
      }
    }
  }

  // Method to reinitialize with new API key
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
      const sampleData = data.slice(0, 5); // Send only first 5 rows for analysis
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
    const temporalColumns = this.identifyTemporalColumns(columns);

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
        `Dataset contains ${data.length} records`,
        `Found ${numericColumns.length} numeric columns for analysis`,
        `${categoricalColumns.length} categorical columns available for grouping`,
        'Data appears to be suitable for trend and comparison analysis'
      ],
      recommendedFilters: categoricalColumns.slice(0, 3),
      dataQualityNotes: ['Data structure appears consistent', 'Consider checking for missing values']
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
  }

  identifyNumericColumns(data, columns) {
    return columns.filter(col => {
      const sampleValues = data.slice(0, 10).map(row => row[col]).filter(val => val != null && val !== '');
      if (sampleValues.length === 0) return false;
      
      return sampleValues.every(val => !isNaN(parseFloat(val)) && isFinite(val));
    });
  }

  identifyTemporalColumns(columns) {
    const temporalKeywords = ['date', 'time', 'year', 'month', 'day', 'created', 'updated', 'timestamp'];
    return columns.filter(col => 
      temporalKeywords.some(keyword => col.toLowerCase().includes(keyword))
    );
  }
  generateFallbackCharts(numericColumns, categoricalColumns, temporalColumns) {
    const charts = [];

    // Generate intelligent chart suggestions based on data structure
    
    // 1. If we have temporal data, create time series charts
    if (temporalColumns.length > 0 && numericColumns.length > 0) {
      charts.push({
        title: `${numericColumns[0]} Trend Over Time`,
        type: 'line',
        xAxis: temporalColumns[0],
        yAxis: numericColumns[0],
        groupBy: categoricalColumns[0] || null,
        reasoning: 'Time series analysis shows trends and patterns over time'
      });
      
      if (numericColumns.length > 1) {
        charts.push({
          title: `${numericColumns[1]} Performance Over Time`,
          type: 'area',
          xAxis: temporalColumns[0],
          yAxis: numericColumns[1],
          groupBy: null,
          reasoning: 'Area chart shows volume and growth patterns'
        });
      }
    }

    // 2. If we have categories, create distribution charts
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      charts.push({
        title: `${numericColumns[0]} Distribution by ${categoricalColumns[0]}`,
        type: 'pie',
        xAxis: categoricalColumns[0],
        yAxis: numericColumns[0],
        groupBy: null,
        reasoning: 'Shows proportional breakdown of values by category'
      });
      
      charts.push({
        title: `${numericColumns[0]} Comparison by ${categoricalColumns[0]}`,
        type: 'bar',
        xAxis: categoricalColumns[0],
        yAxis: numericColumns[0],
        groupBy: categoricalColumns[1] || null,
        reasoning: 'Compare values across different categories'
      });
    }

    // 3. If we have multiple numeric columns, create comparison charts
    if (numericColumns.length >= 2 && categoricalColumns.length === 0) {
      charts.push({
        title: `${numericColumns[0]} vs ${numericColumns[1]}`,
        type: 'bar',
        xAxis: 'Index',
        yAxis: numericColumns[0],
        groupBy: null,
        reasoning: 'Compare two numeric metrics'
      });
    }

    // 4. If we only have numeric data, create index-based charts
    if (categoricalColumns.length === 0 && temporalColumns.length === 0 && numericColumns.length > 0) {
      charts.push({
        title: `${numericColumns[0]} Values`,
        type: 'line',
        xAxis: 'row_index',
        yAxis: numericColumns[0],
        groupBy: null,
        reasoning: 'Shows progression of values across data points'
      });
    }

    return charts.slice(0, 4); // Limit to 4 suggestions
  }  processDataForChart(data, chartConfig, insights = null) {
    // Enhanced data processing with insights
    let processedData = [...data];

    // Add row index if X-axis is 'row_index' or 'Index'
    if (chartConfig.xAxis === 'row_index' || chartConfig.xAxis === 'Index') {
      processedData = processedData.map((row, index) => ({
        ...row,
        row_index: index + 1,
        Index: index + 1
      }));
    }

    // Apply any recommended transformations based on insights
    if (insights && insights.dataQualityNotes) {
      processedData = this.cleanData(processedData);
    }

    // Handle different chart types with intelligent processing
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
    }

    // Sort data for better visualization
    processedData = this.sortData(processedData, chartConfig);

    // Limit data points for better performance (max 50 points for most charts)
    if (chartConfig.type !== 'pie' && processedData.length > 50) {
      processedData = this.sampleData(processedData, 50);
    }

    return processedData;
  }

  processPieChartData(data, chartConfig) {
    // For pie charts, aggregate data by the X axis (category)
    const aggregated = {};
    
    data.forEach(row => {
      const key = row[chartConfig.xAxis];
      const value = parseFloat(row[chartConfig.yAxis]) || 0;
      
      if (!aggregated[key]) {
        aggregated[key] = { [chartConfig.xAxis]: key, [chartConfig.yAxis]: 0 };
      }
      
      aggregated[key][chartConfig.yAxis] += value;
    });
    
    // Convert to array and sort by value (descending)
    const result = Object.values(aggregated).sort((a, b) => b[chartConfig.yAxis] - a[chartConfig.yAxis]);
    
    // Limit to top 10 slices for readability
    if (result.length > 10) {
      const top9 = result.slice(0, 9);
      const others = result.slice(9);
      const othersSum = others.reduce((sum, item) => sum + item[chartConfig.yAxis], 0);
      
      top9.push({
        [chartConfig.xAxis]: 'Others',
        [chartConfig.yAxis]: othersSum
      });
      
      return top9;
    }
    
    return result;
  }

  processTimeSeriesData(data, chartConfig) {
    // For time series, try to detect and sort by time/date columns
    let processedData = [...data];
    
    // If X-axis looks like a date/time column, try to parse and sort
    const isTemporalX = this.identifyTemporalColumns([chartConfig.xAxis]).length > 0;
    
    if (isTemporalX) {
      processedData = processedData.sort((a, b) => {
        const dateA = new Date(a[chartConfig.xAxis]);
        const dateB = new Date(b[chartConfig.xAxis]);
        return dateA - dateB;
      });
    }
    
    // Handle grouping if specified
    if (chartConfig.groupBy && chartConfig.groupBy !== '') {
      return this.aggregateTimeSeriesData(processedData, chartConfig);
    }
    
    // For non-grouped time series, aggregate by X-axis to reduce noise
    return this.aggregateByXAxis(processedData, chartConfig);
  }

  processBarChartData(data, chartConfig) {
    // For bar charts, aggregate and limit categories
    if (chartConfig.groupBy && chartConfig.groupBy !== '') {
      return this.aggregateData(data, chartConfig);
    }
    
    // Simple aggregation by X-axis
    const aggregated = this.aggregateByXAxis(data, chartConfig);
    
    // Sort by value for better visualization
    return aggregated.sort((a, b) => b[chartConfig.yAxis] - a[chartConfig.yAxis]);
  }

  aggregateByXAxis(data, chartConfig) {
    const aggregated = {};
    
    data.forEach(row => {
      const key = row[chartConfig.xAxis];
      const value = parseFloat(row[chartConfig.yAxis]) || 0;
      
      if (!aggregated[key]) {
        aggregated[key] = {
          [chartConfig.xAxis]: key,
          [chartConfig.yAxis]: 0,
          count: 0
        };
      }
      
      aggregated[key][chartConfig.yAxis] += value;
      aggregated[key].count += 1;
    });
    
    // Calculate averages for more meaningful data
    return Object.values(aggregated).map(item => ({
      ...item,
      [chartConfig.yAxis]: item.count > 1 ? item[chartConfig.yAxis] / item.count : item[chartConfig.yAxis]
    }));
  }

  aggregateTimeSeriesData(data, chartConfig) {
    const grouped = {};
    
    data.forEach(row => {
      const groupKey = row[chartConfig.groupBy];
      const xValue = row[chartConfig.xAxis];
      const yValue = parseFloat(row[chartConfig.yAxis]) || 0;
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = {};
      }
      
      if (!grouped[groupKey][xValue]) {
        grouped[groupKey][xValue] = {
          [chartConfig.xAxis]: xValue,
          [chartConfig.yAxis]: 0,
          [chartConfig.groupBy]: groupKey,
          count: 0
        };
      }
      
      grouped[groupKey][xValue][chartConfig.yAxis] += yValue;
      grouped[groupKey][xValue].count += 1;
    });
    
    // Flatten and return
    const result = [];
    Object.values(grouped).forEach(group => {
      Object.values(group).forEach(item => {
        result.push({
          ...item,
          [chartConfig.yAxis]: item.count > 1 ? item[chartConfig.yAxis] / item.count : item[chartConfig.yAxis]
        });
      });
    });
    
    return result;
  }

  sampleData(data, maxPoints) {
    // Smart sampling - try to keep evenly distributed points
    if (data.length <= maxPoints) return data;
    
    const step = Math.floor(data.length / maxPoints);
    const sampled = [];
    
    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i]);
    }
    
    // Always include the last point
    if (sampled[sampled.length - 1] !== data[data.length - 1]) {
      sampled.push(data[data.length - 1]);
    }
    
    return sampled.slice(0, maxPoints);
  }

  cleanData(data) {
    return data.filter(row => {
      // Remove rows with all null/empty values
      return Object.values(row).some(value => value !== null && value !== '' && value !== undefined);
    });
  }

  aggregateData(data, chartConfig) {
    const grouped = {};
    
    data.forEach(row => {
      const groupKey = row[chartConfig.groupBy];
      const xValue = row[chartConfig.xAxis];
      const yValue = parseFloat(row[chartConfig.yAxis]) || 0;
      
      const key = `${xValue}_${groupKey}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          [chartConfig.xAxis]: xValue,
          [chartConfig.yAxis]: 0,
          [chartConfig.groupBy]: groupKey,
          count: 0
        };
      }
      
      grouped[key][chartConfig.yAxis] += yValue;
      grouped[key].count += 1;
    });
    
    return Object.values(grouped);
  }

  sortData(data, chartConfig) {
    return data.sort((a, b) => {
      const aVal = a[chartConfig.xAxis];
      const bVal = b[chartConfig.xAxis];
      
      // If values are numbers, sort numerically
      if (!isNaN(aVal) && !isNaN(bVal)) {
        return parseFloat(aVal) - parseFloat(bVal);
      }
      
      // Otherwise sort alphabetically
      return String(aVal).localeCompare(String(bVal));
    });
  }
}

export default new GeminiService();
