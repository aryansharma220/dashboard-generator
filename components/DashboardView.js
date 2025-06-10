'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Moon, 
  Sun, 
  Edit, 
  Copy, 
  Check, 
  TrendingUp, 
  BarChart3,
  Users,
  Zap,
  Settings,
  Activity,
  Filter,
  X,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Grid,
  List,
  Calendar,
  Clock,
  Bookmark,
  Star
} from 'lucide-react';
import useAppStore from '../lib/store';
import ChartRenderer from './ChartRenderer';
import EnhancedChartRenderer from './EnhancedChartRenderer';
// import AdvancedDashboard from './AdvancedDashboard';
import CollaborationPanel from './CollaborationPanel';
import DataValidationPanel from './DataValidationPanel';
// import AdvancedChartConfig from './AdvancedChartConfig';
// import DataTransformationPipeline from './DataTransformationPipeline';
// import PerformanceMonitor from './PerformanceMonitor';
import EnhancedSearchFilter from './EnhancedSearchFilter';
import { exportAsPNG, exportAsPDF, exportAsHTML, exportAsExcel, generateEmbedCode } from '../lib/exportUtils';
import GeminiService from '../lib/geminiService';
import LoadingSpinner from './LoadingSpinner';
import APIKeyConfig from './APIKeyConfig';

export default function DashboardView() {
  const {
    rawData,
    dashboardConfig,
    aiInsights,
    analyzing,
    favorites,
    savedDashboards,
    recentActivity,
    updateDashboardConfig,
    updateChart,
    setCurrentStep,
    toggleTheme,
    setAiInsights,
    setAnalyzing,
    addToFavorites,
    removeFromFavorites,
    saveDashboard,
    addActivity
  } = useAppStore();

  // UI state
  const [viewMode, setViewMode] = useState('grid');
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' or 'list'
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const [hiddenCharts, setHiddenCharts] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);
    // Panel states
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showActivityPanel, setShowActivityPanel] = useState(false);  const [showDataValidation, setShowDataValidation] = useState(false);
  const [showEnhancedSearch, setShowEnhancedSearch] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(dashboardConfig.title);
  const [editSubtitle, setEditSubtitle] = useState(dashboardConfig.subtitle);
  
  // Export states
  const [exportLoading, setExportLoading] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const dashboardRef = useRef(null);
  const isDark = dashboardConfig.theme === 'dark';  // Generate business insights when dashboard loads
  useEffect(() => {
    if (dashboardConfig.charts.length > 0 && !aiInsights && !analyzing) {
      generateAIInsights();
    }
  }, [dashboardConfig.charts.length]);

  const generateAIInsights = async () => {
    setAnalyzing(true);
    try {
      console.log('Generating AI insights...');
      const insights = await GeminiService.generateInsights(rawData, dashboardConfig.charts);
      setAiInsights(insights);
      addActivity({
        type: 'ai_insights',
        message: 'AI generated new business insights',
        timestamp: new Date().toISOString()
      });
      console.log('AI insights generated:', insights);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      // Fallback to mock insights if AI fails
      setAiInsights({
        executiveSummary: `Analysis of ${rawData.length} records across ${dashboardConfig.charts.length} visualizations reveals key patterns and trends.`,
        trends: [
          'Data shows consistent patterns across different categories',
          'Notable variations in key metrics suggest opportunities for optimization',
          'Performance indicators demonstrate stable growth trajectory'
        ],
        anomalies: [
          'Some outliers detected that may require investigation',
          'Certain data points show unexpected variations'
        ],
        recommendations: [
          'Focus on high-performing segments for growth',
          'Investigate anomalies for potential insights',
          'Consider implementing regular monitoring of key metrics'
        ],
        predictiveInsights: [
          'Current trends suggest continued positive momentum',
          'Data patterns indicate potential for strategic optimization'
        ]      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTitleSave = () => {
    updateDashboardConfig({ 
      title: editTitle, 
      subtitle: editSubtitle 
    });
    setIsEditing(false);
  };

  // Enhanced export function with AI insights
  const handleExport = async (type) => {
    setExportLoading(type);
    try {
      const filename = dashboardConfig.title.replace(/\s+/g, '_').toLowerCase();
      
      switch (type) {
        case 'png':
          await exportAsPNG('dashboard-container', filename);
          break;
        case 'pdf':
          await exportAsPDF('dashboard-container', filename, dashboardConfig, aiInsights);
          break;
        case 'excel':
          await exportAsExcel(rawData, dashboardConfig, aiInsights, filename);
          break;
        case 'html':
          exportAsHTML(dashboardConfig, rawData, aiInsights);
          break;
        case 'embed':
          const code = generateEmbedCode(dashboardConfig, { theme: dashboardConfig.theme });
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

  // Handle chart operations
  const toggleChartVisibility = (chartId) => {
    const newHiddenCharts = new Set(hiddenCharts);
    if (hiddenCharts.has(chartId)) {
      newHiddenCharts.delete(chartId);
    } else {
      newHiddenCharts.add(chartId);
    }
    setHiddenCharts(newHiddenCharts);
    addActivity({
      type: 'chart_toggled',
      description: `Chart ${hiddenCharts.has(chartId) ? 'shown' : 'hidden'}`
    });
  };

  const toggleFullscreen = (chartIndex) => {
    setFullscreenChart(fullscreenChart === chartIndex ? null : chartIndex);
  };
  const refreshDashboard = () => {
    setRefreshing(true);
    addActivity({
      type: 'dashboard_refreshed',
      description: 'Dashboard data refreshed'
    });
    // Also refresh AI insights
    generateAIInsights();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const refreshInsights = () => {
    setAiInsights(null);
    generateAIInsights();
    addActivity({
      type: 'insights_refreshed',
      description: 'AI insights regenerated'
    });
  };

  const handleSaveDashboard = () => {
    const savedConfig = {
      ...dashboardConfig,
      savedAt: new Date().toISOString()
    };
    saveDashboard(savedConfig);
    addActivity({
      type: 'dashboard_saved',
      description: `Dashboard "${dashboardConfig.title}" saved`
    });
  };

  const handleAddToFavorites = (chart) => {
    addToFavorites({
      type: 'chart',
      title: chart.title,
      chartType: chart.type,
      config: chart
    });
    addActivity({
      type: 'favorite_added',
      description: `Chart "${chart.title}" added to favorites`
    });
  };
  // Switch between standard and advanced view
  const getVisibleCharts = () => {
    return dashboardConfig.charts.filter(chart => !hiddenCharts.has(chart.id));
  };
  return (
    <div className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Enhanced Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setCurrentStep('configure')}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 group ${
                  isDark ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/30' : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50'
                }`}
              >
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Configure</span>
              </button>

              {/* Layout Toggle */}
              <div className={`flex items-center rounded-lg border ${
                isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-white/50'
              }`}>
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`p-2 rounded-l-lg transition-colors ${
                    layoutMode === 'grid'
                      ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`p-2 rounded-r-lg transition-colors ${
                    layoutMode === 'list'
                      ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              {isEditing ? (
                <div className="flex items-center justify-center space-x-3">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`text-xl font-bold border-2 rounded-lg px-3 py-1 transition-all duration-200 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    }`}
                  />
                  <button
                    onClick={() => {
                      updateDashboardConfig({ title: editTitle, subtitle: editSubtitle });
                      setIsEditing(false);
                    }}
                    className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardConfig.title}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`p-1 rounded transition-all duration-200 ${
                      isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2">
              {/* Refresh Button */}
              <button
                onClick={refreshDashboard}
                disabled={refreshing}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  refreshing 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isDark ? 'text-gray-400 hover:text-blue-300 hover:bg-blue-900/30' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Refresh Dashboard"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Save Dashboard */}
              <button
                onClick={handleSaveDashboard}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark ? 'text-gray-400 hover:text-green-300 hover:bg-green-900/30' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                title="Save Dashboard"
              >
                <Save className="h-4 w-4" />
              </button>

              {/* AI Insights Toggle */}
              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showAIPanel
                    ? isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                    : isDark ? 'text-gray-400 hover:text-yellow-300 hover:bg-yellow-900/30' : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                }`}
                title="AI Insights"
              >
                <Zap className="h-4 w-4" />
                {analyzing && <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>}
              </button>

              {/* Activity Panel */}
              <button
                onClick={() => setShowActivityPanel(!showActivityPanel)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showActivityPanel
                    ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                    : isDark ? 'text-gray-400 hover:text-purple-300 hover:bg-purple-900/30' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title="Recent Activity"
              >
                <Clock className="h-4 w-4" />
                {recentActivity.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full"></div>
                )}
              </button>

              {/* Share Button */}
              <button
                onClick={() => setShowCollaboration(true)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark ? 'text-gray-400 hover:text-blue-300 hover:bg-blue-900/30' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Share & Collaborate"
              >
                <Share2 className="h-4 w-4" />
              </button>

              {/* Data Validation Button */}
              <button
                onClick={() => setShowDataValidation(!showDataValidation)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showDataValidation
                    ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                    : isDark ? 'text-gray-400 hover:text-purple-300 hover:bg-purple-900/30' : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title="Data Validation & Quality"
              >
                <Filter className="h-4 w-4" />
              </button>

              {/* Enhanced Search Button */}
              <button
                onClick={() => setShowEnhancedSearch(!showEnhancedSearch)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showEnhancedSearch
                    ? isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-700'
                    : isDark ? 'text-gray-400 hover:text-orange-300 hover:bg-orange-900/30' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
                title="Enhanced Search & Filter"
              >
                <Settings className="h-4 w-4" />
              </button>

              {/* Sidebar Toggle */}
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showSidebar
                    ? isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                    : isDark ? 'text-gray-400 hover:text-indigo-300 hover:bg-indigo-900/30' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
                title="Favorites & Saved"
              >
                <Bookmark className="h-4 w-4" />
              </button>

              {/* Export Menu */}
              <div className="relative group">
                <button className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark ? 'text-gray-400 hover:text-green-300 hover:bg-green-900/30' : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`} title="Export Options">
                  <Download className="h-4 w-4" />
                </button>
                
                <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="p-2">
                    {['PNG', 'PDF', 'Excel', 'HTML'].map(format => (
                      <button
                        key={format}
                        onClick={() => handleExport(format.toLowerCase())}
                        disabled={exportLoading === format.toLowerCase()}
                        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                          exportLoading === format.toLowerCase()
                            ? 'opacity-50 cursor-not-allowed'
                            : isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {exportLoading === format.toLowerCase() ? 'Exporting...' : `Export as ${format}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isDark ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-900/30' : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
                title="Toggle Theme"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>      {/* Enhanced Sidebar */}
      {showSidebar && (
        <div className={`fixed right-0 top-16 h-full w-80 z-40 transform transition-transform duration-300 ${
          isDark ? 'bg-gray-800/95 backdrop-blur-lg border-l border-gray-700' : 'bg-white/95 backdrop-blur-lg border-l border-gray-200'
        }`}>
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Favorites & Saved
              </h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Favorites Section */}
            <div className="mb-8">
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Favorite Charts ({favorites.length})
              </h4>
              {favorites.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No favorites yet. Star charts to add them here.
                </p>
              ) : (
                <div className="space-y-2">
                  {favorites.map(fav => (
                    <div key={fav.id} className={`p-3 rounded-lg border ${
                      isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {fav.title}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {fav.chartType} chart
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromFavorites(fav.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Dashboards */}
            <div>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Saved Dashboards ({savedDashboards.length})
              </h4>
              {savedDashboards.length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No saved dashboards yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {savedDashboards.slice(0, 5).map(saved => (
                    <div key={saved.id} className={`p-3 rounded-lg border ${
                      isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {saved.title}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(saved.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Panel */}
      {showAIPanel && (
        <div className={`fixed right-4 top-20 w-80 max-h-96 overflow-y-auto rounded-xl border shadow-xl z-40 ${
          isDark ? 'bg-gray-800/95 backdrop-blur-lg border-gray-700' : 'bg-white/95 backdrop-blur-lg border-gray-200'
        }`}>
          <div className="p-4">            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <Zap className="w-4 h-4 mr-2 text-purple-500" />
                AI Insights
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refreshInsights}
                  disabled={analyzing}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    analyzing 
                      ? 'opacity-50 cursor-not-allowed' 
                      : isDark 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Refresh AI Insights"
                >
                  <RefreshCw className={`w-4 h-4 ${analyzing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {analyzing ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className={`ml-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Analyzing data...
                </span>
              </div>
            ) : aiInsights ? (
              <div className="space-y-4 text-sm">
                {aiInsights.executiveSummary && (
                  <div>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Executive Summary
                    </h4>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {aiInsights.executiveSummary}
                    </p>
                  </div>
                )}
                
                {aiInsights.trends && (
                  <div>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Key Trends
                    </h4>
                    <ul className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {aiInsights.trends.slice(0, 3).map((trend, index) => (
                        <li key={index} className="text-xs flex items-start">
                          <span className="text-blue-400 mr-2">•</span>
                          {trend}
                        </li>
                      ))}
                    </ul>
                  </div>                )}
                
                {aiInsights.anomalies && aiInsights.anomalies.length > 0 && (
                  <div>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Anomalies Detected
                    </h4>
                    <ul className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {aiInsights.anomalies.slice(0, 2).map((anomaly, index) => (
                        <li key={index} className="text-xs flex items-start">
                          <span className="text-orange-400 mr-2">⚠</span>
                          {anomaly}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {aiInsights.recommendations && (
                  <div>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Recommendations
                    </h4>
                    <ul className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {aiInsights.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="text-xs flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiInsights.predictiveInsights && aiInsights.predictiveInsights.length > 0 && (
                  <div>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Predictive Insights
                    </h4>
                    <ul className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {aiInsights.predictiveInsights.slice(0, 2).map((insight, index) => (
                        <li key={index} className="text-xs flex items-start">
                          <span className="text-purple-400 mr-2">🔮</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Add charts to generate AI insights
              </p>
            )}
          </div>
        </div>
      )}

      {/* Activity Panel */}
      {showActivityPanel && (
        <div className={`fixed right-4 top-20 w-80 max-h-96 overflow-y-auto rounded-xl border shadow-xl z-40 ${
          isDark ? 'bg-gray-800/95 backdrop-blur-lg border-gray-700' : 'bg-white/95 backdrop-blur-lg border-gray-200'
        }`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Recent Activity
              </h3>
              <button
                onClick={() => setShowActivityPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {recentActivity.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 10).map(activity => (
                  <div key={activity.id} className={`p-2 rounded-lg ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {activity.description}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}      {/* Main Dashboard Content */}
      <main className={`transition-all duration-300 ${showSidebar ? 'mr-80' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-8" id="dashboard-container" ref={dashboardRef}>
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
            }`}>
              <div className="flex items-center">
                <BarChart3 className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="ml-3">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Charts</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {dashboardConfig.charts.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
            }`}>
              <div className="flex items-center">
                <Eye className={`h-8 w-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <div className="ml-3">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Visible</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {getVisibleCharts().length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
            }`}>
              <div className="flex items-center">
                <Star className={`h-8 w-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div className="ml-3">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Favorites</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {favorites.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
            }`}>
              <div className="flex items-center">
                <Calendar className={`h-8 w-8 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <div className="ml-3">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Last Updated</p>
                  <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {analyzing && (
            <div className={`mb-8 p-6 rounded-2xl border ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
            }`}>
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Generating AI insights...
                </span>
              </div>
            </div>
          )}

          {/* Charts Section */}
          {dashboardConfig.charts.length === 0 ? (
            <div className={`text-center py-20 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Charts Available</h3>
              <p className="mb-6">Add some charts to your dashboard to get started</p>
              <button
                onClick={() => setCurrentStep('configure')}
                className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Add Charts
              </button>
            </div>
          ) : (
            <>
              {/* Chart Controls */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Charts ({getVisibleCharts().length}/{dashboardConfig.charts.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    View:
                  </span>
                  <button
                    onClick={() => setLayoutMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      layoutMode === 'grid'
                        ? isDark ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLayoutMode('list')}
                    className={`p-2 rounded transition-colors ${
                      layoutMode === 'list'
                        ? isDark ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                        : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Charts Grid/List */}
              <div className={`${
                layoutMode === 'grid' 
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' 
                  : 'space-y-6'
              }`}>
                {dashboardConfig.charts.map((chart, index) => {
                  const isHidden = hiddenCharts.has(chart.id);
                  const isFullscreen = fullscreenChart === index;
                  
                  if (isHidden && !isFullscreen) return null;
                  
                  return (
                    <div
                      key={chart.id}
                      className={`relative group transition-all duration-300 ${
                        isFullscreen 
                          ? 'fixed inset-4 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl' 
                          : layoutMode === 'list' 
                            ? `flex items-center space-x-6 p-6 rounded-xl border ${
                                isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-white/30 border-gray-200'
                              }`
                            : ''
                      }`}
                    >
                      {/* Chart Container */}
                      <div className={`${
                        layoutMode === 'list' && !isFullscreen ? 'flex-1' : 'w-full'
                      }`}>                        <EnhancedChartRenderer
                          chart={chart}
                          data={rawData}
                          theme={dashboardConfig.theme}
                        />
                      </div>

                      {/* Chart Controls */}
                      <div className={`absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isFullscreen ? 'opacity-100' : ''
                      }`}>
                        {/* Favorite Button */}
                        <button
                          onClick={() => handleAddToFavorites(chart)}
                          className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                            isDark 
                              ? 'bg-gray-800/80 text-yellow-400 hover:bg-gray-700 border border-gray-600' 
                              : 'bg-white/80 text-yellow-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                          title="Add to Favorites"
                        >
                          <Star className="w-4 h-4" />
                        </button>

                        {/* Visibility Toggle */}
                        <button
                          onClick={() => toggleChartVisibility(chart.id)}
                          className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                            isDark 
                              ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-gray-600' 
                              : 'bg-white/80 text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                          title="Hide Chart"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>

                        {/* Fullscreen Toggle */}
                        <button
                          onClick={() => toggleFullscreen(index)}
                          className={`p-2 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                            isDark 
                              ? 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-gray-600' 
                              : 'bg-white/80 text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Hidden Charts Summary */}
          {hiddenCharts.size > 0 && (
            <div className={`mt-8 p-4 rounded-xl border ${
              isDark ? 'bg-gray-800/30 border-gray-700' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <EyeOff className={`h-5 w-5 mr-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {hiddenCharts.size} chart{hiddenCharts.size > 1 ? 's' : ''} hidden
                  </span>
                </div>
                <button
                  onClick={() => setHiddenCharts(new Set())}
                  className={`text-sm px-3 py-1 rounded transition-colors ${
                    isDark 
                      ? 'text-yellow-400 hover:bg-yellow-900/30' 
                      : 'text-yellow-700 hover:bg-yellow-100'
                  }`}
                >
                  Show All
                </button>
              </div>
            </div>
          )}          {/* Enhanced AI Insights Section */}
          {aiInsights && !analyzing && (
            <div className={`mt-12 p-8 rounded-3xl backdrop-blur-xl border transition-all duration-300 ${
              isDark ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white/60 border-white/20'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${
                    isDark ? 'bg-purple-900/30' : 'bg-purple-100'
                  }`}>
                    <TrendingUp className={`h-6 w-6 ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <h2 className={`text-2xl font-bold ml-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    AI-Generated Insights
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                  }`}>
                    Generated
                  </span>
                  <button
                    onClick={() => {
                      setAiInsights(null);
                      setTimeout(() => {
                        setAnalyzing(true);
                        setTimeout(() => {
                          const mockInsights = {
                            executiveSummary: "Updated analysis reveals new patterns and opportunities.",
                            trends: ["Trend analysis refreshed", "New patterns identified"],
                            recommendations: ["Updated recommendations available", "Consider new strategies"]
                          };
                          setAiInsights(mockInsights);
                          setAnalyzing(false);
                        }, 2000);
                      }, 100);
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isDark ? 'text-gray-400 hover:text-blue-300 hover:bg-blue-900/30' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    title="Refresh Insights"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {aiInsights.executiveSummary && (
                <div className="mb-8">
                  <h3 className={`text-lg font-semibold mb-3 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Executive Summary
                  </h3>
                  <p className={`text-base leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {aiInsights.executiveSummary}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {aiInsights.trends && aiInsights.trends.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Key Trends
                    </h3>
                    <ul className="space-y-3">
                      {aiInsights.trends.map((trend, index) => (
                        <li key={index} className={`flex items-start ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 ${
                            isDark ? 'bg-blue-400' : 'bg-blue-500'
                          }`}></span>
                          <span className="flex-1">{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Recommendations
                    </h3>
                    <ul className="space-y-3">
                      {aiInsights.recommendations.map((recommendation, index) => (
                        <li key={index} className={`flex items-start ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 ${
                            isDark ? 'bg-green-400' : 'bg-green-500'
                          }`}></span>
                          <span className="flex-1">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Export Options */}
          {embedCode && (
            <div className={`mt-8 p-6 rounded-2xl border ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Embed Code
              </h3>
              <div className="relative">
                <textarea
                  value={embedCode}
                  readOnly
                  rows={4}
                  className={`w-full p-3 rounded-lg border text-sm font-mono resize-none ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={copyEmbedCode}
                  className={`absolute top-2 right-2 px-3 py-1 rounded text-sm transition-colors ${
                    copied
                      ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                      : isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}        </div>
      </main>

      {/* Enhanced Feature Panels */}
      
      {/* Data Validation Panel */}
      {showDataValidation && (
        <div className={`mt-8 mx-6 transition-all duration-300 ${showSidebar ? 'mr-86' : ''}`}>
          <DataValidationPanel />
        </div>
      )}

      {/* Enhanced Search & Filter */}
      {showEnhancedSearch && (
        <div className={`mt-8 mx-6 transition-all duration-300 ${showSidebar ? 'mr-86' : ''}`}>
          <EnhancedSearchFilter />        </div>
      )}

      {/* Collaboration Panel */}
      {showCollaboration && (
        <CollaborationPanel 
          isOpen={showCollaboration}
          onClose={() => setShowCollaboration(false)}
        />
      )}

      {/* API Key Configuration */}
      <APIKeyConfig />
    </div>
  );
}
