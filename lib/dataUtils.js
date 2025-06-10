/**
 * DataUtils - Comprehensive data processing utilities for AI-enhanced dashboard generation
 * Handles data cleaning, transformation, analysis, and chart-specific processing
 */

class DataUtils {
  /**
   * Analyze column types in the dataset
   * @param {Array} data - Array of data objects
   * @returns {Object} - Object with arrays of column names by type
   */
  static analyzeColumnTypes(data) {
    if (!data || data.length === 0) {
      return { numeric: [], categorical: [], temporal: [], boolean: [] };
    }

    const columns = Object.keys(data[0]);
    const analysis = {
      numeric: [],
      categorical: [],
      temporal: [],
      boolean: []
    };

    columns.forEach(column => {
      const sample = data.slice(0, Math.min(100, data.length))
        .map(row => row[column])
        .filter(val => val !== null && val !== undefined && val !== '');

      if (sample.length === 0) {
        analysis.categorical.push(column);
        return;
      }

      // Check for temporal data
      if (this.isTemporalColumn(column, sample)) {
        analysis.temporal.push(column);
        return;
      }

      // Check for boolean data
      if (this.isBooleanColumn(sample)) {
        analysis.boolean.push(column);
        return;
      }

      // Check for numeric data
      const numericValues = sample.filter(val => !isNaN(parseFloat(val)));
      const numericRatio = numericValues.length / sample.length;

      if (numericRatio > 0.8) {
        analysis.numeric.push(column);
      } else {
        analysis.categorical.push(column);
      }
    });

    return analysis;
  }

  /**
   * Check if a column contains temporal (date/time) data
   * @param {string} columnName - Name of the column
   * @param {Array} sample - Sample values from the column
   * @returns {boolean}
   */
  static isTemporalColumn(columnName, sample) {
    // Check column name patterns
    const temporalKeywords = ['date', 'time', 'month', 'year', 'day', 'timestamp', 'created', 'updated'];
    const nameContainsTemporal = temporalKeywords.some(keyword => 
      columnName.toLowerCase().includes(keyword)
    );

    if (nameContainsTemporal) return true;

    // Check sample values
    const temporalCount = sample.filter(val => {
      if (typeof val !== 'string') return false;
      
      // Common date patterns
      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
        /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i, // Month names
        /^\d{4}$/, // Year only
      ];

      return datePatterns.some(pattern => pattern.test(val.toString().trim())) ||
             !isNaN(Date.parse(val));
    }).length;

    return temporalCount / sample.length > 0.5;
  }

  /**
   * Identify temporal columns from column names
   * @param {Array} columns - Array of column names
   * @returns {Array} - Array of temporal column names
   */
  static identifyTemporalColumns(columns) {
    const temporalKeywords = ['date', 'time', 'month', 'year', 'day', 'timestamp', 'created', 'updated'];
    return columns.filter(col => 
      temporalKeywords.some(keyword => 
        col.toLowerCase().includes(keyword)
      )
    );
  }

  /**
   * Check if a column contains boolean data
   * @param {Array} sample - Sample values from the column
   * @returns {boolean}
   */
  static isBooleanColumn(sample) {
    const uniqueValues = [...new Set(sample.map(val => 
      val.toString().toLowerCase().trim()
    ))];
    
    const booleanPatterns = [
      ['true', 'false'],
      ['yes', 'no'],
      ['1', '0'],
      ['y', 'n'],
      ['on', 'off'],
      ['active', 'inactive']
    ];

    return booleanPatterns.some(pattern => 
      uniqueValues.length === 2 && 
      pattern.every(val => uniqueValues.includes(val))
    );
  }

  /**
   * Clean and normalize data
   * @param {Array} data - Raw data array
   * @returns {Array} - Cleaned data array
   */
  static cleanData(data) {
    if (!data || data.length === 0) return [];

    return data.filter(row => {
      // Remove completely empty rows
      const values = Object.values(row);
      const nonEmptyValues = values.filter(val => 
        val !== null && val !== undefined && val !== ''
      );
      return nonEmptyValues.length > 0;
    }).map(row => {
      // Clean individual values
      const cleanedRow = {};
      Object.keys(row).forEach(key => {
        let value = row[key];
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          cleanedRow[key] = '';
          return;
        }

        // Convert to string and trim
        value = value.toString().trim();
        
        // Handle common string representations of null
        if (['null', 'undefined', 'n/a', 'na', '#n/a'].includes(value.toLowerCase())) {
          cleanedRow[key] = '';
          return;
        }

        cleanedRow[key] = value;
      });
      
      return cleanedRow;
    });
  }

  /**
   * Normalize numeric data for better chart representation
   * @param {Array} data - Data array
   * @param {Object} chartConfig - Chart configuration
   * @returns {Array} - Data with normalized numeric values
   */
  static normalizeNumericData(data, chartConfig) {
    if (!data || data.length === 0) return [];

    return data.map(row => {
      const normalizedRow = { ...row };
      
      // Normalize Y-axis values
      if (chartConfig.yAxis && row[chartConfig.yAxis] !== undefined) {
        const value = parseFloat(row[chartConfig.yAxis]);
        normalizedRow[chartConfig.yAxis] = isNaN(value) ? 0 : value;
      }

      return normalizedRow;
    });
  }

  /**
   * Aggregate data by X-axis values
   * @param {Array} data - Data array
   * @param {Object} chartConfig - Chart configuration
   * @returns {Array} - Aggregated data
   */
  static aggregateByXAxis(data, chartConfig) {
    if (!data || data.length === 0) return [];

    const aggregated = {};
    
    data.forEach(row => {
      const xValue = row[chartConfig.xAxis];
      const yValue = parseFloat(row[chartConfig.yAxis]) || 0;
      
      if (!aggregated[xValue]) {
        aggregated[xValue] = {
          [chartConfig.xAxis]: xValue,
          [chartConfig.yAxis]: 0,
          count: 0
        };
      }
      
      aggregated[xValue][chartConfig.yAxis] += yValue;
      aggregated[xValue].count += 1;
    });

    return Object.values(aggregated);
  }

  /**
   * Aggregate data with grouping
   * @param {Array} data - Data array
   * @param {Object} chartConfig - Chart configuration
   * @returns {Array} - Aggregated data with groups
   */
  static aggregateData(data, chartConfig) {
    if (!data || data.length === 0) return [];

    const aggregated = {};
    
    data.forEach(row => {
      const xValue = row[chartConfig.xAxis];
      const yValue = parseFloat(row[chartConfig.yAxis]) || 0;
      const groupValue = chartConfig.groupBy ? row[chartConfig.groupBy] : 'default';
      
      const key = `${xValue}_${groupValue}`;
      
      if (!aggregated[key]) {
        aggregated[key] = {
          [chartConfig.xAxis]: xValue,
          [chartConfig.yAxis]: 0,
          [chartConfig.groupBy]: groupValue,
          count: 0
        };
      }
      
      aggregated[key][chartConfig.yAxis] += yValue;
      aggregated[key].count += 1;
    });

    return Object.values(aggregated);
  }

  /**
   * Sort data based on chart type and configuration
   * @param {Array} data - Data array
   * @param {Object} chartConfig - Chart configuration
   * @returns {Array} - Sorted data
   */
  static sortData(data, chartConfig) {
    if (!data || data.length === 0) return [];

    const xAxis = chartConfig.xAxis;
    const yAxis = chartConfig.yAxis;

    return [...data].sort((a, b) => {
      // For temporal data, sort by date
      if (this.identifyTemporalColumns([xAxis]).length > 0) {
        const dateA = new Date(a[xAxis]);
        const dateB = new Date(b[xAxis]);
        return dateA - dateB;
      }

      // For numeric X-axis, sort numerically
      const numA = parseFloat(a[xAxis]);
      const numB = parseFloat(b[xAxis]);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }

      // For pie charts, sort by Y-axis value (descending)
      if (chartConfig.type === 'pie') {
        return parseFloat(b[yAxis]) - parseFloat(a[yAxis]);
      }

      // Default alphabetical sort
      return a[xAxis].toString().localeCompare(b[xAxis].toString());
    });
  }

  /**
   * Detect outliers in numeric data using IQR method
   * @param {Array} data - Data array
   * @param {string} column - Column to analyze
   * @returns {Array} - Array of outlier values
   */
  static detectOutliers(data, column) {
    if (!data || data.length === 0) return [];

    const values = data
      .map(row => parseFloat(row[column]))
      .filter(val => !isNaN(val))
      .sort((a, b) => a - b);

    if (values.length < 4) return [];

    const q1Index = Math.floor(values.length * 0.25);
    const q3Index = Math.floor(values.length * 0.75);
    const q1 = values[q1Index];
    const q3 = values[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.filter(row => {
      const value = parseFloat(row[column]);
      return !isNaN(value) && (value < lowerBound || value > upperBound);
    });
  }

  /**
   * Limit pie chart slices and group small ones
   * @param {Array} data - Data array
   * @param {Object} chartConfig - Chart configuration
   * @param {number} maxSlices - Maximum number of slices
   * @returns {Array} - Limited data with "Others" category
   */
  static limitPieSlices(data, chartConfig, maxSlices = 10) {
    if (!data || data.length <= maxSlices) return data;

    const sorted = this.sortData(data, chartConfig);
    const topSlices = sorted.slice(0, maxSlices - 1);
    const otherSlices = sorted.slice(maxSlices - 1);

    if (otherSlices.length === 0) return topSlices;

    const otherSum = otherSlices.reduce((sum, item) => 
      sum + (parseFloat(item[chartConfig.yAxis]) || 0), 0
    );

    const othersItem = {
      [chartConfig.xAxis]: 'Others',
      [chartConfig.yAxis]: otherSum
    };

    return [...topSlices, othersItem];
  }

  /**
   * Intelligent sampling for large datasets
   * @param {Array} data - Data array
   * @param {number} maxPoints - Maximum number of points to keep
   * @returns {Array} - Sampled data
   */
  static intelligentSample(data, maxPoints = 100) {
    if (!data || data.length <= maxPoints) return data;

    // For time series data, try to maintain temporal distribution
    const step = Math.ceil(data.length / maxPoints);
    const sampled = [];

    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i]);
    }

    // Always include the last item if not already included
    if (sampled[sampled.length - 1] !== data[data.length - 1]) {
      sampled.push(data[data.length - 1]);
    }

    return sampled;
  }

  /**
   * Calculate basic statistics for a numeric column
   * @param {Array} data - Data array
   * @param {string} column - Column name
   * @returns {Object} - Statistics object
   */
  static calculateStats(data, column) {
    if (!data || data.length === 0) return null;

    const values = data
      .map(row => parseFloat(row[column]))
      .filter(val => !isNaN(val));

    if (values.length === 0) return null;

    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    
    return {
      count: values.length,
      sum,
      mean,
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      stdDev: Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length)
    };
  }

  /**
   * Generate column summary for data quality assessment
   * @param {Array} data - Data array
   * @param {string} column - Column name
   * @returns {Object} - Column summary
   */
  static getColumnSummary(data, column) {
    if (!data || data.length === 0) return null;

    const values = data.map(row => row[column]);
    const nonNullValues = values.filter(val => val !== null && val !== undefined && val !== '');
    const uniqueValues = [...new Set(nonNullValues)];

    const summary = {
      totalRows: data.length,
      nonNullCount: nonNullValues.length,
      nullCount: data.length - nonNullValues.length,
      uniqueCount: uniqueValues.length,
      completeness: nonNullValues.length / data.length,
      cardinality: uniqueValues.length / data.length
    };

    // Add type-specific analysis
    const columnTypes = this.analyzeColumnTypes(data);
    if (columnTypes.numeric.includes(column)) {
      summary.stats = this.calculateStats(data, column);
      summary.type = 'numeric';
    } else if (columnTypes.temporal.includes(column)) {
      summary.type = 'temporal';
    } else if (columnTypes.boolean.includes(column)) {
      summary.type = 'boolean';
    } else {
      summary.type = 'categorical';
      summary.topValues = this.getTopValues(nonNullValues, 5);
    }

    return summary;
  }

  /**
   * Get top values for categorical data
   * @param {Array} values - Array of values
   * @param {number} limit - Number of top values to return
   * @returns {Array} - Array of {value, count} objects
   */
  static getTopValues(values, limit = 5) {
    const counts = {};
    values.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([value, count]) => ({ value, count }));
  }

  /**
   * Validate chart configuration against data
   * @param {Array} data - Data array
   * @param {Object} chartConfig - Chart configuration
   * @returns {Object} - Validation result
   */
  static validateChartConfig(data, chartConfig) {
    const errors = [];
    const warnings = [];

    if (!data || data.length === 0) {
      errors.push('No data available');
      return { valid: false, errors, warnings };
    }

    const columns = Object.keys(data[0]);
    const columnTypes = this.analyzeColumnTypes(data);

    // Validate X-axis
    if (!chartConfig.xAxis) {
      errors.push('X-axis column is required');
    } else if (!columns.includes(chartConfig.xAxis)) {
      errors.push(`X-axis column "${chartConfig.xAxis}" not found in data`);
    }

    // Validate Y-axis
    if (!chartConfig.yAxis) {
      errors.push('Y-axis column is required');
    } else if (!columns.includes(chartConfig.yAxis)) {
      errors.push(`Y-axis column "${chartConfig.yAxis}" not found in data`);
    } else if (!columnTypes.numeric.includes(chartConfig.yAxis) && chartConfig.type !== 'pie') {
      warnings.push(`Y-axis column "${chartConfig.yAxis}" is not numeric`);
    }

    // Validate groupBy if specified
    if (chartConfig.groupBy && !columns.includes(chartConfig.groupBy)) {
      errors.push(`Group by column "${chartConfig.groupBy}" not found in data`);
    }

    // Chart-specific validations
    if (chartConfig.type === 'pie' && data.length > 20) {
      warnings.push('Pie chart with many categories may be hard to read');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default DataUtils;
