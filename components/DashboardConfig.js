'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, BarChart, LineChart, PieChart, AreaChart, Sparkles, Wand2 } from 'lucide-react';
import useAppStore from '../lib/store';
import AIInsights from './AIInsights';
import geminiService from '../lib/geminiService';

const CHART_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart },
  { id: 'line', name: 'Line Chart', icon: LineChart },
  { id: 'area', name: 'Area Chart', icon: AreaChart },
  { id: 'pie', name: 'Pie Chart', icon: PieChart },
];

export default function DashboardConfig() {  const {
    rawData,
    columns,
    filename,
    dashboardConfig,
    aiAnalysis,
    aiInsights,
    isAnalyzing,
    analysisError,
    updateDashboardConfig,
    addChart,
    updateChart,
    removeChart,
    setCurrentStep,
    setAiInsights
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

  const numericColumns = columns.filter(col => {
    if (rawData.length === 0) return false;
    const sample = rawData[0][col];
    return !isNaN(sample) && sample !== '';
  });

  const categoricalColumns = columns.filter(col => !numericColumns.includes(col));
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

  const addSuggestedChart = (suggestedChart) => {
    addChart({
      ...suggestedChart,
      id: Date.now().toString(),
      filterColumn: '',
      filterValues: []
    });
  };

  const addAllSuggestedCharts = () => {
    if (aiAnalysis && aiAnalysis.suggestedCharts) {
      aiAnalysis.suggestedCharts.forEach((chart, index) => {
        setTimeout(() => {
          addChart({
            ...chart,
            id: Date.now().toString() + index,
            filterColumn: '',
            filterValues: []
          });
        }, index * 100); // Stagger the additions for visual effect
      });
    }
  };

  const generateDashboard = () => {
    if (dashboardConfig.charts.length === 0) {
      alert('Please add at least one chart');
      return;
    }
    setCurrentStep('dashboard');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 animate-fadeInUp">
          <button
            onClick={() => setCurrentStep('upload')}
            className="flex items-center text-purple-600 hover:text-purple-800 mb-6 group transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Upload</span>
          </button>
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Configure Dashboard
                </h2>
                <p className="text-gray-700 mt-1 font-medium">File: <span className="font-bold text-purple-700">{filename}</span></p>
              </div>
            </div><div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  Dashboard Title
                </label>
                <input
                  type="text"
                  value={dashboardConfig.title}
                  onChange={(e) => updateDashboardConfig({ title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 text-gray-900"
                  placeholder="My Awesome Dashboard"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={dashboardConfig.subtitle}
                  onChange={(e) => updateDashboardConfig({ subtitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 text-gray-900"
                  placeholder="Insights and analytics overview"
                />
              </div>
            </div>
          </div>
        </div>        {/* AI Insights Section */}
        {aiAnalysis && (
          <div className="mb-8 animate-fadeInUp">
            <AIInsights />
            
            {/* AI Suggested Charts */}
            {aiAnalysis.suggestedCharts && aiAnalysis.suggestedCharts.length > 0 && (
              <div className="mt-6 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">AI Chart Suggestions</h3>
                  </div>
                  <button
                    onClick={addAllSuggestedCharts}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Add All Suggestions
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiAnalysis.suggestedCharts.map((chart, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-1">{chart.title}</h4>
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <div className="flex items-center mr-4">
                              <span className="font-medium">Type:</span>
                              <span className="ml-1 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                                {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-3">{chart.reasoning}</p>
                          <div className="text-xs text-gray-500">
                            <div>X: <span className="font-medium text-gray-700">{chart.xAxis}</span></div>
                            <div>Y: <span className="font-medium text-gray-700">{chart.yAxis}</span></div>
                            {chart.groupBy && <div>Group: <span className="font-medium text-gray-700">{chart.groupBy}</span></div>}
                          </div>
                        </div>
                        <button
                          onClick={() => addSuggestedChart(chart)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 opacity-0 group-hover:opacity-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">          {/* Add Chart Form */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8 animate-slideInRight">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Add New Chart</h3>
            </div>
            
            <div className="space-y-4">              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  Chart Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CHART_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setCurrentChart({ ...currentChart, type: type.id })}
                        className={`p-4 border-2 rounded-xl flex flex-col items-center space-y-2 transition-all duration-200 hover:scale-105 ${
                          currentChart.type === type.id
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 text-purple-800 shadow-lg'
                            : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-semibold">{type.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-800">
                  Chart Title *
                </label>
                <input
                  type="text"
                  value={currentChart.title}
                  onChange={(e) => setCurrentChart({ ...currentChart, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white hover:bg-gray-50 text-gray-900"
                  placeholder="Revenue Analysis"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    X-Axis *
                  </label>
                  <select
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
                  <label className="block text-sm font-bold text-gray-800">
                    Y-Axis *
                  </label>
                  <select
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
                <label className="block text-sm font-bold text-gray-800">
                  Group By (Optional)
                </label>
                <select
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
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-8 animate-slideInRight" style={{animationDelay: '0.2s'}}>
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
                <span className="text-sm font-bold text-purple-800">
                  {dashboardConfig.charts.length} chart{dashboardConfig.charts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            
            {dashboardConfig.charts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart className="h-10 w-10 text-gray-400" />
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
                      </div>
                      <button
                        onClick={() => removeChart(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
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
