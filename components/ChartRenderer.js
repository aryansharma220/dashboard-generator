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
  ResponsiveContainer
} from 'recharts';
import GeminiService from '../lib/geminiService';

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#8dd1e1'
];

export default function ChartRenderer({ chart, data, theme = 'light' }) {
  // Use AI-powered data processing for more accurate chart rendering
  const processedData = GeminiService.processDataForChart(data, chart);

  // Helper function to render sub-charts for combo charts
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
            <Tooltip contentStyle={tooltipStyle} />
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
            <Tooltip contentStyle={tooltipStyle} />
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

  const renderDefaultChart = () => (
    <BarChart {...commonProps}>
      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
      <XAxis dataKey={chart.xAxis} {...axisProps} />
      <YAxis {...axisProps} />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend />
      <Bar 
        dataKey={chart.yAxis} 
        fill={COLORS[0]}
        name={chart.yAxis}
        radius={[2, 2, 0, 0]}
      />
    </BarChart>
  );

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

  const renderChart = () => {
    switch (chart.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={chart.xAxis} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar 
              dataKey={chart.yAxis} 
              fill={COLORS[0]}
              name={chart.yAxis}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={chart.xAxis} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
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
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={chart.xAxis} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke={COLORS[2]}
              fill={COLORS[2]}
              fillOpacity={0.6}
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
              outerRadius={100}
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
            <Tooltip 
              contentStyle={tooltipStyle}
              formatter={(value, name) => [
                typeof value === 'number' ? value.toLocaleString() : value,
                name
              ]}
            />
            <Legend />
          </PieChart>
        );

      case 'combo':
        // Handle combo charts (multiple chart types in one)
        if (chart.charts && chart.charts.length > 0) {
          return (
            <div className="space-y-4">
              {chart.charts.map((subChart, index) => (
                <div key={index} className="h-60">
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
        return renderDefaultChart();

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                Unsupported chart type: {chart.type}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`backdrop-blur-xl rounded-2xl shadow-xl border transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
      theme === 'dark' 
        ? 'bg-gray-800/80 border-gray-700/50' 
        : 'bg-white/80 border-white/20'
    } p-8`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {chart.title}
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          theme === 'dark' 
            ? 'bg-gray-700 text-gray-300' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)}
        </div>
      </div>
      <div className="h-80 relative">
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>
      {/* AI Enhancement Badge */}
      <div className="mt-4 flex items-center justify-center">
        <div className={`px-2 py-1 rounded-lg text-xs flex items-center ${
          theme === 'dark' 
            ? 'bg-purple-900/30 text-purple-300' 
            : 'bg-purple-50 text-purple-600'
        }`}>
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
          </svg>
          AI-Enhanced
        </div>      </div>
    </div>
  );
}
