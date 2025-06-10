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

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#8dd1e1'
];

export default function ChartRenderer({ chart, data, theme = 'light' }) {
  // Process data for the chart
  const processedData = processDataForChart(data, chart);

  const commonProps = {
    data: processedData,
    margin: { top: 20, right: 30, left: 20, bottom: 20 }
  };

  const axisProps = {
    tick: { fill: theme === 'dark' ? '#e5e7eb' : '#374151' },
    axisLine: { stroke: theme === 'dark' ? '#4b5563' : '#d1d5db' },
    tickLine: { stroke: theme === 'dark' ? '#4b5563' : '#d1d5db' }
  };

  const renderChart = () => {
    switch (chart.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={chart.xAxis} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip 
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                color: theme === 'dark' ? '#e5e7eb' : '#374151'
              }}
            />
            <Legend />
            <Bar 
              dataKey={chart.yAxis} 
              fill={COLORS[0]}
              name={chart.yAxis}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey={chart.xAxis} {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip 
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                color: theme === 'dark' ? '#e5e7eb' : '#374151'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke={COLORS[1]}
              strokeWidth={2}
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
            <Tooltip 
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                color: theme === 'dark' ? '#e5e7eb' : '#374151'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={chart.yAxis} 
              stroke={COLORS[2]}
              fill={COLORS[2]}
              fillOpacity={0.6}
              name={chart.yAxis}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={chart.yAxis}
              nameKey={chart.xAxis}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                color: theme === 'dark' ? '#e5e7eb' : '#374151'
              }}
            />
          </PieChart>
        );

      default:
        return <div>Unsupported chart type</div>;
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
    </div>
  );
}

function processDataForChart(data, chart) {
  if (!data || data.length === 0) return [];

  let processedData = [...data];

  // Handle grouping if specified
  if (chart.groupBy && chart.groupBy !== '') {
    const grouped = {};
    
    processedData.forEach(row => {
      const groupKey = row[chart.groupBy];
      const xValue = row[chart.xAxis];
      const yValue = parseFloat(row[chart.yAxis]) || 0;
      
      const key = `${xValue}_${groupKey}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          [chart.xAxis]: xValue,
          [chart.yAxis]: 0,
          [chart.groupBy]: groupKey
        };
      }
      
      grouped[key][chart.yAxis] += yValue;
    });
    
    processedData = Object.values(grouped);
  }

  // For pie charts, we might need to aggregate data
  if (chart.type === 'pie') {
    const aggregated = {};
    
    processedData.forEach(row => {
      const key = row[chart.xAxis];
      const value = parseFloat(row[chart.yAxis]) || 0;
      
      if (!aggregated[key]) {
        aggregated[key] = { [chart.xAxis]: key, [chart.yAxis]: 0 };
      }
      
      aggregated[key][chart.yAxis] += value;
    });
    
    processedData = Object.values(aggregated);
  }

  // Convert numeric values
  processedData = processedData.map(row => ({
    ...row,
    [chart.yAxis]: parseFloat(row[chart.yAxis]) || 0
  }));

  return processedData;
}
