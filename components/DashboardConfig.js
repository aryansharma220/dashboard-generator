'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, BarChart, LineChart, PieChart, AreaChart, Sparkles, Brain, Zap } from 'lucide-react';
import useAppStore from '../lib/store';
import GeminiService from '../lib/geminiService';
import LoadingSpinner from './LoadingSpinner';

const CHART_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart },
  { id: 'line', name: 'Line Chart', icon: LineChart },
  { id: 'area', name: 'Area Chart', icon: AreaChart },
  { id: 'pie', name: 'Pie Chart', icon: PieChart },
];

export default function DashboardConfig() {
  const {
    rawData,
    columns,
    filename,
    dashboardConfig,
    updateDashboardConfig,
    addChart,
    updateChart,
    removeChart,
    setCurrentStep
  } = useAppStore();

  const [currentChart, setCurrentChart] = useState({
    type: 'bar',
    title: '',
    xAxis: '',
    yAxis: '',
    groupBy: '',
    filterColumn: '',
    filterValues: []
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestedCharts, setSuggestedCharts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dataQuality, setDataQuality] = useState(null);
  const numericColumns = columns.filter(col => {
    if (rawData.length === 0) return false;
    const sample = rawData[0][col];
    return !isNaN(sample) && sample !== '';
  });

  const categoricalColumns = columns.filter(col => !numericColumns.includes(col));

  // AI Analysis Effect
  useEffect(() => {
    if (rawData.length > 0 && columns.length > 0 && !aiAnalysis) {
      performAIAnalysis();
    }
  }, [rawData, columns]);

  const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      console.log('Starting AI analysis...');
      const analysis = await GeminiService.analyzeDataStructure(rawData, filename);
      setAiAnalysis(analysis);
      setSuggestedCharts(analysis.suggestedCharts || []);
      
      // Assess data quality
      const quality = GeminiService.assessDataQuality(rawData, columns);
      setDataQuality(quality);
      
      console.log('AI Analysis completed:', analysis);
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applySuggestedChart = (suggestion) => {
    setCurrentChart({
      type: suggestion.type,
      title: suggestion.title,
      xAxis: suggestion.xAxis,
      yAxis: suggestion.yAxis,
      groupBy: suggestion.groupBy || '',
      filterColumn: '',
      filterValues: []
    });
    setShowSuggestions(false);
  };

  const addAISuggestedChart = (suggestion) => {
    addChart({
      ...suggestion,
      id: Date.now().toString(),
      groupBy: suggestion.groupBy || ''
    });
  };

  const addNewChart = () => {
    if (!currentChart.title || !currentChart.xAxis || !currentChart.yAxis) {
      alert('Please fill in all required fields');
      return;
    }

    addChart({
      ...currentChart,
      id: Date.now().toString()
    });

    setCurrentChart({
      type: 'bar',
      title: '',
      xAxis: '',
      yAxis: '',
      groupBy: '',
      filterColumn: '',
      filterValues: []
    });
  };

  const generateDashboard = () => {
    if (dashboardConfig.charts.length === 0) {
      alert('Please add at least one chart');
      return;
    }
    setCurrentStep('dashboard');
  };  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 animate-fadeInUp">
          <button
            onClick={() => setCurrentStep('upload')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 group transition-all duration-200 font-semibold"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Upload</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Configure Dashboard
                </h2>
                <p className="text-gray-700 mt-1 font-medium">File: <span className="font-bold text-indigo-600">{filename}</span></p>
              </div>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Dashboard Title
                </label>                <input
                  type="text"
                  value={dashboardConfig.title}
                  onChange={(e) => updateDashboardConfig({ title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 text-gray-900 placeholder:text-gray-500"
                  placeholder="My Awesome Dashboard"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Subtitle (Optional)
                </label>                <input
                  type="text"
                  value={dashboardConfig.subtitle}
                  onChange={(e) => updateDashboardConfig({ subtitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 text-gray-900 placeholder:text-gray-500"
                  placeholder="Insights and analytics overview"
                />              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        {(isAnalyzing || aiAnalysis) && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-xl border border-purple-200 p-8 mb-8 animate-fadeInUp">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">AI Data Analysis</h3>
                  <p className="text-purple-700 font-medium">Powered by Gemini AI</p>
                </div>
              </div>
              {!isAnalyzing && aiAnalysis && (
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {showSuggestions ? 'Hide' : 'Show'} AI Suggestions
                </button>
              )}
            </div>

            {isAnalyzing ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <div className="ml-4">
                  <p className="text-gray-700 font-semibold">Analyzing your data with AI...</p>
                  <p className="text-gray-600 text-sm">This may take a few moments</p>
                </div>
              </div>
            ) : aiAnalysis ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Summary */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-purple-600" />
                    Dataset Summary
                  </h4>
                  <p className="text-gray-700 mb-4">{aiAnalysis.datasetSummary}</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{aiAnalysis.columnAnalysis?.numeric?.length || 0}</div>
                      <div className="text-sm text-gray-600">Numeric</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{aiAnalysis.columnAnalysis?.categorical?.length || 0}</div>
                      <div className="text-sm text-gray-600">Categorical</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{aiAnalysis.columnAnalysis?.temporal?.length || 0}</div>
                      <div className="text-sm text-gray-600">Temporal</div>
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                    Key Insights
                  </h4>
                  <ul className="space-y-2">
                    {aiAnalysis.keyInsights?.map((insight, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}

            {/* AI Chart Suggestions */}
            {showSuggestions && suggestedCharts.length > 0 && (
              <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                  AI-Recommended Charts ({suggestedCharts.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestedCharts.map((suggestion, index) => (
                    <div key={index} className="border border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 group">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-bold text-gray-900">{suggestion.title}</h5>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => applySuggestedChart(suggestion)}
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                          >
                            Use
                          </button>
                          <button
                            onClick={() => addAISuggestedChart(suggestion)}
                            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">{suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} Chart:</span> {suggestion.xAxis} vs {suggestion.yAxis}
                        {suggestion.groupBy && <span className="text-purple-600"> (grouped by {suggestion.groupBy})</span>}
                      </div>
                      <p className="text-xs text-gray-500">{suggestion.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Chart Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 animate-slideInRight">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Add New Chart</h3>
            </div>
            
            <div className="space-y-4">              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Chart Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CHART_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (                      <button
                        key={type.id}
                        onClick={() => setCurrentChart({ ...currentChart, type: type.id })}
                        className={`p-4 border-2 rounded-xl flex flex-col items-center space-y-2 transition-all duration-200 hover:scale-105 ${
                          currentChart.type === type.id
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 text-purple-800 shadow-lg'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-semibold">{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Chart Title *
                </label>                <input
                  type="text"
                  value={currentChart.title}
                  onChange={(e) => setCurrentChart({ ...currentChart, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 text-gray-900 placeholder:text-gray-500"
                  placeholder="Revenue Analysis"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    X-Axis *
                  </label>                  <select
                    value={currentChart.xAxis}
                    onChange={(e) => setCurrentChart({ ...currentChart, xAxis: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 text-gray-900"
                  >
                    <option value="">Select column</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Y-Axis *
                  </label>                  <select
                    value={currentChart.yAxis}
                    onChange={(e) => setCurrentChart({ ...currentChart, yAxis: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 text-gray-900"
                  >
                    <option value="">Select column</option>
                    {numericColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Group By (Optional)
                </label>                <select
                  value={currentChart.groupBy}
                  onChange={(e) => setCurrentChart({ ...currentChart, groupBy: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 text-gray-900"
                >
                  <option value="">No grouping</option>
                  {categoricalColumns.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={addNewChart}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Chart to Dashboard
              </button>
            </div>
          </div>          {/* Chart List */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8 animate-slideInRight" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                  <BarChart className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Dashboard Charts
                </h3>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 rounded-full">
                <span className="text-sm font-semibold text-purple-700">
                  {dashboardConfig.charts.length} chart{dashboardConfig.charts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
              {dashboardConfig.charts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <BarChart className="h-10 w-10 text-gray-500" />
                </div>                <p className="text-gray-700 font-semibold mb-2">No charts added yet</p>
                <p className="text-gray-600 text-sm">Add your first chart to get started with your dashboard</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardConfig.charts.map((chart, index) => (
                  <div key={chart.id} className="border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-gray-50 to-white group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <h4 className="font-bold text-gray-900 text-lg">{chart.title}</h4>
                        </div>                        <div className="ml-11">
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-semibold">Type:</span> {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Data:</span> {chart.xAxis} vs {chart.yAxis}
                            {chart.groupBy && <span className="text-purple-700 font-medium"> (grouped by {chart.groupBy})</span>}
                          </p>
                        </div>
                      </div>                      <button
                        onClick={() => removeChart(index)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:shadow-md"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>        <div className="mt-8 text-center">
          <button
            onClick={generateDashboard}
            disabled={dashboardConfig.charts.length === 0}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-12 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 disabled:hover:scale-100"
          >
            <span className="flex items-center">
              {dashboardConfig.charts.length === 0 ? (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Add a chart to continue
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Dashboard ({dashboardConfig.charts.length} chart{dashboardConfig.charts.length !== 1 ? 's' : ''})
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
