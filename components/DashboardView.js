'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Share2, Moon, Sun, Edit, Copy, Check } from 'lucide-react';
import useAppStore from '../lib/store';
import ChartRenderer from './ChartRenderer';
import { exportAsPNG, exportAsPDF, exportAsHTML, generateEmbedCode } from '../lib/exportUtils';

export default function DashboardView() {
  const {
    rawData,
    dashboardConfig,
    updateDashboardConfig,
    setCurrentStep,
    toggleTheme
  } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(dashboardConfig.title);
  const [editSubtitle, setEditSubtitle] = useState(dashboardConfig.subtitle);
  const [exportLoading, setExportLoading] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [copied, setCopied] = useState(false);

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
      <div className="max-w-7xl mx-auto p-8">
        <div id="dashboard-container" className={`transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
          {dashboardConfig.charts.length === 0 ? (
            <div className="text-center py-20">
              <div className={`w-24 h-24 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl`}>
                <BarChart className={`h-12 w-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
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
          )}
        </div>
      </div>

      {/* Embed Code Modal */}
      {embedCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-2xl w-full rounded-lg shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Embed Code
              </h3>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Copy this code to embed your dashboard in any website:
              </p>
              <div className="relative">
                <textarea
                  value={embedCode}
                  readOnly
                  className={`w-full h-32 p-3 border rounded-lg font-mono text-sm ${
                    isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
                />
                <button
                  onClick={copyEmbedCode}
                  className={`absolute top-2 right-2 p-2 rounded transition-colors ${
                    copied ? 'bg-green-600 text-white' : isDark ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setEmbedCode('')}
                  className={`px-4 py-2 rounded transition-colors ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
