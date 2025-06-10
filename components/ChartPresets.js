'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  AreaChart, 
  TrendingUp,
  Plus,
  Sparkles,
  Target,
  Eye,
  BarChart
} from 'lucide-react';

const CHART_TYPES = {
  bar: { icon: BarChart3, name: 'Bar Chart', color: 'from-blue-500 to-blue-600' },
  line: { icon: LineChart, name: 'Line Chart', color: 'from-green-500 to-green-600' },
  pie: { icon: PieChart, name: 'Pie Chart', color: 'from-purple-500 to-purple-600' },
  area: { icon: AreaChart, name: 'Area Chart', color: 'from-orange-500 to-orange-600' }
};

export default function ChartPresets({ data, columns, onAddChart, theme = 'light' }) {
  const [presets, setPresets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (data && data.length > 0 && columns && columns.length > 0) {
      generatePresets();
    }
  }, [data, columns]);

  const generatePresets = () => {
    const numericColumns = columns.filter(col => {
      if (data.length === 0) return false;
      const sample = data[0][col];
      return !isNaN(sample) && sample !== '' && sample !== null;
    });

    const categoricalColumns = columns.filter(col => !numericColumns.includes(col));
    const dateColumns = columns.filter(col => {
      if (data.length === 0) return false;
      const sample = data[0][col];
      return isDateColumn(sample);
    });

    const generatedPresets = [];

    // Generate comparative charts
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      generatedPresets.push({
        id: 'comparison-bar',
        title: `${numericColumns[0]} by ${categoricalColumns[0]}`,
        type: 'bar',
        xAxis: categoricalColumns[0],
        yAxis: numericColumns[0],
        category: 'comparison',
        description: `Compare ${numericColumns[0]} across different ${categoricalColumns[0]} categories`,
        benefits: ['Easy comparison', 'Clear rankings', 'Quick insights']
      });

      if (numericColumns.length > 1) {
        generatedPresets.push({
          id: 'multi-metric-comparison',
          title: `${numericColumns[0]} vs ${numericColumns[1]} by ${categoricalColumns[0]}`,
          type: 'bar',
          xAxis: categoricalColumns[0],
          yAxis: numericColumns[0],
          category: 'comparison',
          description: `Compare multiple metrics across ${categoricalColumns[0]}`,
          benefits: ['Multi-dimensional view', 'Performance analysis', 'Decision support']
        });
      }
    }

    // Generate distribution charts
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      generatedPresets.push({
        id: 'distribution-pie',
        title: `${categoricalColumns[0]} Distribution`,
        type: 'pie',
        xAxis: categoricalColumns[0],
        yAxis: numericColumns[0],
        category: 'distribution',
        description: `Show the proportional breakdown of ${categoricalColumns[0]}`,
        benefits: ['Part-to-whole view', 'Proportion analysis', 'Distribution clarity']
      });
    }

    // Generate trend charts (if date columns exist)
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      generatedPresets.push({
        id: 'trend-line',
        title: `${numericColumns[0]} Trend Over Time`,
        type: 'line',
        xAxis: dateColumns[0],
        yAxis: numericColumns[0],
        category: 'trending',
        description: `Track ${numericColumns[0]} changes over time`,
        benefits: ['Trend identification', 'Pattern recognition', 'Time-based analysis']
      });

      generatedPresets.push({
        id: 'trend-area',
        title: `${numericColumns[0]} Volume Analysis`,
        type: 'area',
        xAxis: dateColumns[0],
        yAxis: numericColumns[0],
        category: 'trending',
        description: `Visualize ${numericColumns[0]} volume over time`,
        benefits: ['Volume emphasis', 'Cumulative view', 'Trend magnitude']
      });
    }

    // Generate performance charts
    if (numericColumns.length >= 2) {
      generatedPresets.push({
        id: 'performance-overview',
        title: `Performance Overview: ${numericColumns[0]} & ${numericColumns[1]}`,
        type: 'bar',
        xAxis: categoricalColumns[0] || 'Index',
        yAxis: numericColumns[0],
        category: 'performance',
        description: `Key performance indicators overview`,
        benefits: ['KPI tracking', 'Performance metrics', 'Business insights']
      });
    }

    // Generate top/bottom analysis
    if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      generatedPresets.push({
        id: 'top-performers',
        title: `Top ${categoricalColumns[0]} by ${numericColumns[0]}`,
        type: 'bar',
        xAxis: categoricalColumns[0],
        yAxis: numericColumns[0],
        category: 'performance',
        description: `Identify top performers and key contributors`,
        benefits: ['Performance ranking', 'Success identification', 'Strategic focus']
      });
    }

    setPresets(generatedPresets);
  };

  const isDateColumn = (sample) => {
    if (!sample) return false;
    
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY
      /^\d{4}\/\d{2}\/\d{2}/ // YYYY/MM/DD
    ];
    
    return datePatterns.some(pattern => pattern.test(String(sample)));
  };

  const categories = {
    all: { name: 'All Presets', count: presets.length },
    comparison: { name: 'Comparison', count: presets.filter(p => p.category === 'comparison').length },
    distribution: { name: 'Distribution', count: presets.filter(p => p.category === 'distribution').length },
    trending: { name: 'Trending', count: presets.filter(p => p.category === 'trending').length },
    performance: { name: 'Performance', count: presets.filter(p => p.category === 'performance').length }
  };

  const filteredPresets = selectedCategory === 'all' 
    ? presets 
    : presets.filter(preset => preset.category === selectedCategory);

  const handleAddChart = (preset) => {
    const chart = {
      id: Date.now().toString(),
      title: preset.title,
      type: preset.type,
      xAxis: preset.xAxis,
      yAxis: preset.yAxis,
      groupBy: preset.groupBy || '',
      filterColumn: '',
      filterValues: [],
      presetGenerated: true,
      reasoning: preset.description
    };
    
    onAddChart(chart);
  };

  if (presets.length === 0) {
    return (
      <div className={`rounded-2xl shadow-xl border p-8 ${
        theme === 'dark' 
          ? 'bg-gray-800/80 border-gray-700/50' 
          : 'bg-white/80 border-white/20'
      }`}>
        <div className="text-center py-8">
          <BarChart className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No chart presets available for this data structure
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-xl border ${
      theme === 'dark' 
        ? 'bg-gray-800/80 border-gray-700/50' 
        : 'bg-white/80 border-white/20'
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Chart Presets
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Ready-to-use charts based on your data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([key, category]) => {
            if (category.count === 0 && key !== 'all') return null;
            
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === key
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Presets Grid */}
      <div className="p-6">
        {filteredPresets.length === 0 ? (
          <div className="text-center py-8">
            <Eye className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No presets available for this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPresets.map((preset) => {
              const ChartIcon = CHART_TYPES[preset.type]?.icon || BarChart3;
              const chartType = CHART_TYPES[preset.type];
              
              return (
                <div
                  key={preset.id}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer group ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-gradient-to-r ${chartType?.color || 'from-gray-500 to-gray-600'}`}>
                        <ChartIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {preset.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {chartType?.name || preset.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {preset.description}
                  </p>

                  {/* Data Mapping */}
                  <div className={`text-xs mb-3 p-2 rounded ${
                    theme === 'dark' ? 'bg-gray-600/50' : 'bg-blue-50'
                  }`}>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-blue-800'}>
                      <strong>X-Axis:</strong> {preset.xAxis}
                    </div>
                    <div className={theme === 'dark' ? 'text-gray-300' : 'text-blue-800'}>
                      <strong>Y-Axis:</strong> {preset.yAxis}
                    </div>
                  </div>

                  {/* Benefits */}
                  {preset.benefits && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {preset.benefits.slice(0, 2).map((benefit, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded-full ${
                              theme === 'dark'
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Button */}
                  <button
                    onClick={() => handleAddChart(preset)}
                    className={`w-full flex items-center justify-center py-2 px-3 rounded-lg transition-all text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    } group-hover:scale-105`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Dashboard
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
