'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Download, Share2, Moon, Sun, Edit, Copy, Check, TrendingUp, BarChart3 } from 'lucide-react';
import useAppStore from '../lib/store';
import ChartRenderer from './ChartRenderer';
import { exportAsPNG, exportAsPDF, exportAsHTML, generateEmbedCode } from '../lib/exportUtils';
import geminiService from '../lib/geminiService';
import LoadingSpinner from './LoadingSpinner';
import APIKeyConfig from './APIKeyConfig';

export default function DashboardView() {  const {
    rawData,
    dashboardConfig,
    aiInsights,
    updateDashboardConfig,
    setCurrentStep,
    toggleTheme,
    setAiInsights,
    setAnalyzing
  } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(dashboardConfig.title);
  const [editSubtitle, setEditSubtitle] = useState(dashboardConfig.subtitle);
  const [exportLoading, setExportLoading] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Generate business insights when dashboard loads
  useEffect(() => {
    const generateInsights = async () => {      if (dashboardConfig.charts.length > 0 && !aiInsights && !insightsLoading) {
        setInsightsLoading(true);
        setAnalyzing(true);
        
        try {
          const insights = await geminiService.generateInsights(rawData, dashboardConfig.charts);
          setAiInsights(insights);
        } catch (error) {
          console.error('Failed to generate insights:', error);
        } finally {
          setInsightsLoading(false);
          setAnalyzing(false);
        }
      }
    };    generateInsights();
  }, [dashboardConfig.charts, rawData, aiInsights, insightsLoading, setAiInsights, setAnalyzing]);

  const handleTitleSave = () => {
    updateDashboardConfig({ 
      title: editTitle, 
      subtitle: editSubtitle 
    });
    setIsEditing(false);
  };

  const handleExport = async (type) => {
    setExportLoading(type);
    try {
      const filename = dashboardConfig.title.replace(/\s+/g, '_').toLowerCase();
      
      switch (type) {
        case 'png':
          await exportAsPNG('dashboard-container', filename);
          break;
        case 'pdf':
          await exportAsPDF('dashboard-container', filename);
          break;
        case 'html':
          exportAsHTML(dashboardConfig, rawData);
          break;
        case 'embed':
          const code = generateEmbedCode(dashboardConfig);
          setEmbedCode(code);
          break;
      }
    } catch (error) {
      alert('Export failed: ' + error.message);
    } finally {
      setExportLoading('');
    }
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = dashboardConfig.theme === 'dark';
  return (
    <div className={`min-h-screen transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Header */}
      <div className={`border-b transition-all duration-300 backdrop-blur-xl ${isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setCurrentStep('configure')}
                className={`flex items-center transition-all duration-200 group ${
                  isDark ? 'text-blue-400 hover:text-blue-300' : 'text-purple-600 hover:text-purple-800'
                }`}
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Configure</span>
              </button>
                <div className="flex items-center space-x-3">
                {isEditing ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={`text-2xl font-bold border-2 rounded-xl px-4 py-2 transition-all duration-200 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                      }`}
                    />
                    <button
                      onClick={handleTitleSave}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 group">
                    <h1 className={`text-3xl font-bold bg-gradient-to-r ${isDark ? 'from-white to-gray-300' : 'from-gray-900 to-gray-600'} bg-clip-text text-transparent`}>
                      {dashboardConfig.title}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                        isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      } rounded-lg`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>            <div className="flex items-center space-x-4">
              <APIKeyConfig />
              
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isDark ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600 shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'
                } hover:scale-105`}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleExport('png')}
                  disabled={exportLoading === 'png'}
                  className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportLoading === 'png' ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Exporting...
                    </div>
                  ) : 'PNG'}
                </button>

                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exportLoading === 'pdf'}
                  className="flex items-center px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportLoading === 'pdf' ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Exporting...
                    </div>
                  ) : 'PDF'}
                </button>

                <button
                  onClick={() => handleExport('html')}
                  disabled={exportLoading === 'html'}
                  className="flex items-center px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportLoading === 'html' ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Exporting...
                    </div>
                  ) : 'HTML'}
                </button>

                <button
                  onClick={() => handleExport('embed')}
                  className="flex items-center px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Embed
                </button>
              </div>
            </div>
          </div>          {dashboardConfig.subtitle && (
            <div className="mt-3">
              {isEditing ? (
                <input
                  type="text"
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
                  className={`border-2 rounded-xl px-4 py-2 transition-all duration-200 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-gray-300 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-600 focus:border-purple-500'
                  }`}
                  placeholder="Dashboard subtitle"
                />
              ) : (
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {dashboardConfig.subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      </div>      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto p-8">        <div id="dashboard-container" className={`transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
          {dashboardConfig.charts.length === 0 ? (
            <div className="text-center py-20">
              <div className={`w-24 h-24 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                <BarChart3 className={`h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              </div>
              <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                No Charts Added Yet
              </h3>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                Go back to configuration to add some charts to your dashboard
              </p>
              <button
                onClick={() => setCurrentStep('configure')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Add Charts
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Business Insights Section */}
              {(aiInsights || insightsLoading) && (
                <div className={`backdrop-blur-xl rounded-2xl shadow-xl border transition-all duration-300 ${
                  isDark ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-white/20'
                } p-8 animate-fadeInUp`}>
                  <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Business Insights
                    </h3>
                  </div>
                  
                  {insightsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <LoadingSpinner />
                      <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Generating insights...
                      </span>
                    </div>
                  ) : aiInsights && (
                    <div className="space-y-6">
                      {/* Executive Summary */}
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-blue-50'} border ${isDark ? 'border-gray-600' : 'border-blue-100'}`}>
                        <h4 className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                          Executive Summary
                        </h4>
                        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {aiInsights.executiveSummary}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Trends */}
                        {aiInsights.trends && aiInsights.trends.length > 0 && (
                          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-green-50'} border ${isDark ? 'border-gray-600' : 'border-green-100'}`}>
                            <h4 className={`font-semibold mb-3 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                              Key Trends
                            </h4>
                            <ul className="space-y-2">
                              {aiInsights.trends.slice(0, 3).map((trend, index) => (
                                <li key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start`}>
                                  <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-2 ${isDark ? 'bg-green-400' : 'bg-green-500'}`}></span>
                                  {trend}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recommendations */}
                        {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-purple-50'} border ${isDark ? 'border-gray-600' : 'border-purple-100'}`}>
                            <h4 className={`font-semibold mb-3 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                              Recommendations
                            </h4>
                            <ul className="space-y-2">
                              {aiInsights.recommendations.slice(0, 3).map((rec, index) => (
                                <li key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start`}>
                                  <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-2 ${isDark ? 'bg-purple-400' : 'bg-purple-500'}`}></span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Anomalies */}
                        {aiInsights.anomalies && aiInsights.anomalies.length > 0 && (
                          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-orange-50'} border ${isDark ? 'border-gray-600' : 'border-orange-100'}`}>
                            <h4 className={`font-semibold mb-3 ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>
                              Notable Anomalies
                            </h4>
                            <ul className="space-y-2">
                              {aiInsights.anomalies.slice(0, 3).map((anomaly, index) => (
                                <li key={index} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start`}>
                                  <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-2 ${isDark ? 'bg-orange-400' : 'bg-orange-500'}`}></span>
                                  {anomaly}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {dashboardConfig.charts.map((chart, index) => (
                  <div key={chart.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                    <ChartRenderer
                      chart={chart}
                      data={rawData}
                      theme={dashboardConfig.theme}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>      {/* Embed Code Modal */}
      {embedCode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeInUp">
          <div className={`max-w-2xl w-full rounded-2xl shadow-2xl border transition-all duration-300 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-4">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Embed Your Dashboard
                  </h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                    Copy this code to embed your dashboard anywhere
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  value={embedCode}
                  readOnly
                  className={`w-full h-40 p-4 border-2 rounded-xl font-mono text-sm transition-all duration-200 ${
                    isDark 
                      ? 'bg-gray-900 border-gray-600 text-gray-300 focus:border-blue-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-purple-500'
                  }`}
                />
                <button
                  onClick={copyEmbedCode}
                  className={`absolute top-3 right-3 p-3 rounded-lg transition-all duration-200 ${
                    copied 
                      ? 'bg-green-600 text-white' 
                      : isDark 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                  } shadow-lg hover:scale-105`}
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEmbedCode('')}
                  className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={copyEmbedCode}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
