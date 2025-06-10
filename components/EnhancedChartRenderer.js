'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart
} from 'recharts';
import { useState } from 'react';
import { TrendingUp, Filter, Download, Maximize2, BarChart3, Brain } from 'lucide-react';
import GeminiService from '../lib/geminiService';

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#8dd1e1',
  '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98fb98'
];

const CHART_GRADIENTS = [
  { id: 'gradient1', colors: ['#8884d8', '#82ca9d'] },
  { id: 'gradient2', colors: ['#ff7300', '#ffc658'] },
  { id: 'gradient3', colors: ['#00c49f', '#0088fe'] },
  { id: 'gradient4', colors: ['#ff8042', '#ffbb28'] }
];

export default function ChartRenderer({ chart, data, theme = 'light' }) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  // Use AI-powered data processing for more accurate chart rendering
  let processedData = GeminiService.processDataForChart(data, chart);

  // Apply filters if any
  if (Object.keys(filters).length > 0) {
    processedData = applyFilters(processedData, filters);
  }

  // Fallback if AI processing fails
  if (!processedData || processedData.length === 0) {
    return (
      <div className={`backdrop-blur-xl rounded-2xl shadow-xl border p-8 ${
        theme === 'dark' 
          ? 'bg-gray-800/80 border-gray-700/50' 
          : 'bg-white/80 border-white/20'
      }`}>
        <div className="flex items-center justify-center h-80">
          <div className="text-center">
            <div className={`text-6xl mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>
              📊
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No data available for this chart
            </p>
          </div>
        </div>
      </div>
    );
  }

  const applyFilters = (data, filters) => {
    return data.filter(row => {
      return Object.entries(filters).every(([column, value]) => {
        if (!value) return true;
        return row[column]?.toString().toLowerCase().includes(value.toLowerCase());
      });
    });
  };

  const downloadChart = () => {
    // Implement chart download functionality
    console.log('Downloading chart:', chart.title);
  };

  const commonProps = {
    data: processedData,
    margin: { top: 20, right: 30, left: 20, bottom: 20 }
  };

  const axisProps = {
    tick: { fill: theme === 'dark' ? '#e5e7eb' : '#374151', fontSize: 12 },
    axisLine: { stroke: theme === 'dark' ? '#4b5563' : '#d1d5db' },
    tickLine: { stroke: theme === 'dark' ? '#4b5563' : '#d1d5db' }
  };

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
    border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
    color: theme === 'dark' ? '#e5e7eb' : '#374151',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  };

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderSubChart = (subChart, index) => {
    const subChartData = GeminiService.processDataForChart(data, subChart);
    const colorIndex = index % COLORS.length;
    
    switch (subChart.type) {
      case 'bar':
        return (
          <BarChart data={subChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={subChart.xAxis} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={customTooltip} />
            <Bar 
              dataKey={subChart.yAxis} 
              fill={COLORS[colorIndex]}
              name={subChart.yAxis}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={subChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={subChart.xAxis} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={customTooltip} />
            <Line 
              type="monotone" 
              dataKey={subChart.yAxis} 
              stroke={COLORS[colorIndex]}
              strokeWidth={2}
              dot={{ fill: COLORS[colorIndex], strokeWidth: 2, r: 3 }}
              name={subChart.yAxis}
            />
          </LineChart>
        );
      default:
        return <div className="text-center text-gray-500">Unsupported sub-chart type</div>;
    }
  };

  const renderChart = () => {
    switch (chart.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={chart.xAxis} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={customTooltip} />
            <Legend />
            <Bar 
              dataKey={chart.yAxis} 
              fill="url(#barGradient)"
              name={chart.yAxis}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={chart.xAxis} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={customTooltip} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke={COLORS[1]}
              fill="url(#lineGradient)"
              strokeWidth={3}
              name={chart.yAxis}
            />
            <Line 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke={COLORS[1]}
              strokeWidth={3}
              dot={{ fill: COLORS[1], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: COLORS[1], strokeWidth: 2 }}
              name={chart.yAxis}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={chart.xAxis} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={customTooltip} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke={COLORS[2]}
              fill="url(#areaGradient)"
              strokeWidth={2}
              name={chart.yAxis}
            />
          </AreaChart>
        );

      case 'pie':
        const pieData = processedData.slice(0, 10); // Limit to 10 slices for readability
        return (
          <PieChart {...commonProps}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => 
                percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey={chart.yAxis}
              nameKey={chart.xAxis}
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke={theme === 'dark' ? '#1f2937' : '#ffffff'}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
            <Legend />
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey={chart.xAxis} 
              {...axisProps}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <YAxis 
              dataKey={chart.yAxis}
              {...axisProps}
              type="number"
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip content={customTooltip} />
            <Legend />
            <Scatter 
              dataKey={chart.yAxis} 
              fill={COLORS[3]}
              name={chart.yAxis}
            />
          </ScatterChart>
        );

      case 'combo':
        if (chart.charts && chart.charts.length > 0) {
          return (
            <div className="space-y-6">
              {chart.charts.map((subChart, index) => (
                <div key={index} className="h-64">
                  <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {subChart.title}
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    {renderSubChart(subChart, index)}
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          );
        }
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={chart.xAxis} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip content={customTooltip} />
            <Legend />
            <Bar dataKey={chart.yAxis} fill={COLORS[0]} radius={[2, 2, 0, 0]} />
            <Line type="monotone" dataKey={chart.yAxis} stroke={COLORS[1]} strokeWidth={2} />
          </ComposedChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Unsupported chart type: {chart.type}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`backdrop-blur-xl rounded-2xl shadow-xl border transition-all duration-300 hover:shadow-2xl ${
      isMaximized ? 'fixed inset-4 z-50' : 'hover:scale-[1.02]'
    } ${
      theme === 'dark' 
        ? 'bg-gray-800/90 border-gray-700/50' 
        : 'bg-white/90 border-white/30'
    } p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {chart.title}
          </h3>
          {chart.aiGenerated && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
              theme === 'dark' 
                ? 'bg-purple-900/50 text-purple-300' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              <Brain className="w-3 h-3 mr-1" />
              AI Enhanced
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' 
              ? 'bg-gray-700 text-gray-300' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title="Toggle filters"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          <button
            onClick={downloadChart}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title="Download chart"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title="Maximize chart"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={`mb-6 p-4 rounded-lg border ${
          theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Chart Filters
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.keys(data[0] || {}).slice(0, 4).map(column => (
              <div key={column}>
                <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {column}
                </label>
                <input
                  type="text"
                  value={filters[column] || ''}
                  onChange={(e) => setFilters({...filters, [column]: e.target.value})}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={`Filter by ${column}...`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className={`relative ${isMaximized ? 'h-full' : 'h-80'}`}>
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Info */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {processedData.length} data points • {chart.xAxis} vs {chart.yAxis}
        </div>
        {chart.confidence && (
          <div className={`flex items-center ${
            chart.confidence > 0.8 ? 'text-green-600' : 
            chart.confidence > 0.6 ? 'text-yellow-600' : 'text-orange-600'
          }`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {Math.round(chart.confidence * 100)}% relevance
          </div>
        )}
      </div>
    </div>
  );
}
