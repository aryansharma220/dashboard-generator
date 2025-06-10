'use client';

import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, Zap } from 'lucide-react';

export default function AIInsights({ analysis, insights, isAnalyzing, error }) {
  if (isAnalyzing) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
            <Brain className="h-5 w-5 text-white animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">AI Analysis in Progress</h3>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-700">Analyzing your data with Gemini 2.0 Flash...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
          <h3 className="text-lg font-bold text-red-800">Analysis Error</h3>
        </div>
        <p className="text-red-700">{error}</p>
        <p className="text-red-600 text-sm mt-2">Using fallback analysis instead.</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Dataset Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">AI Dataset Analysis</h3>
        </div>
        <p className="text-gray-800 font-medium">{analysis.datasetSummary}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white/60 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Numeric Columns</h4>
            <div className="flex flex-wrap gap-1">
              {analysis.columnAnalysis.numeric.map(col => (
                <span key={col} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium">
                  {col}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white/60 rounded-xl p-4">
            <h4 className="font-semibold text-green-800 mb-2">Categories</h4>
            <div className="flex flex-wrap gap-1">
              {analysis.columnAnalysis.categorical.map(col => (
                <span key={col} className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-medium">
                  {col}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white/60 rounded-xl p-4">
            <h4 className="font-semibold text-purple-800 mb-2">Time Columns</h4>
            <div className="flex flex-wrap gap-1">
              {analysis.columnAnalysis.temporal.map(col => (
                <span key={col} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-xs font-medium">
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Charts */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">AI Chart Recommendations</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.suggestedCharts.map((chart, index) => (
            <div key={index} className="bg-white/60 rounded-xl p-4 hover:bg-white/80 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900">{chart.title}</h4>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-medium">
                  {chart.type}
                </span>
              </div>
              <p className="text-gray-700 text-sm mb-3">{chart.reasoning}</p>
              <div className="text-xs space-y-1">
                <div><span className="font-medium">X-Axis:</span> {chart.xAxis}</div>
                <div><span className="font-medium">Y-Axis:</span> {chart.yAxis}</div>
                {chart.groupBy && <div><span className="font-medium">Group By:</span> {chart.groupBy}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-3">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Key Insights</h3>
        </div>
        
        <div className="space-y-2">
          {analysis.keyInsights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-800 font-medium">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Business Insights (if available) */}
      {insights && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Business Insights</h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Executive Summary
              </h4>
              <p className="text-gray-800 bg-white/60 rounded-lg p-3">{insights.executiveSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Trends</h4>
                <div className="space-y-1">
                  {insights.trends.map((trend, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-white/40 rounded-lg p-2">
                      • {trend}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-purple-800 mb-2">Recommendations</h4>
                <div className="space-y-1">
                  {insights.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-white/40 rounded-lg p-2">
                      • {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Filters */}
      {analysis.recommendedFilters && analysis.recommendedFilters.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Recommended Filters</h3>
          <div className="flex flex-wrap gap-2">
            {analysis.recommendedFilters.map(filter => (
              <span key={filter} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-sm font-medium">
                {filter}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
