'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BarChart, 
  LineChart, 
  PieChart, 
  AreaChart, 
  TrendingUp, 
  Target, 
  Brain,
  Zap,
  Eye,
  Plus,
  RefreshCw
} from 'lucide-react';
import GeminiService from '../lib/geminiService';
import LoadingSpinner from './LoadingSpinner';

const CHART_ICONS = {
  bar: BarChart,
  line: LineChart,
  pie: PieChart,
  area: AreaChart
};

const PRESET_CATEGORIES = {
  trending: {
    name: 'Trending Analysis',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-600',
    description: 'Identify patterns and trends in your data'
  },
  comparison: {
    name: 'Comparative Analysis',
    icon: Target,
    color: 'from-blue-500 to-cyan-600',
    description: 'Compare different categories and segments'
  },
  distribution: {
    name: 'Distribution Analysis',
    icon: PieChart,
    color: 'from-purple-500 to-violet-600',
    description: 'Understand data distribution and proportions'
  },
  performance: {
    name: 'Performance Metrics',
    icon: BarChart,
    color: 'from-orange-500 to-red-600',
    description: 'Track KPIs and performance indicators'
  }
};

export default function AIChartPresets({ data, columns, onSelectPreset, theme = 'light' }) {
  const [presets, setPresets] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [aiInsights, setAiInsights] = useState(null);
  const [smartSuggestions, setSmartSuggestions] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      generateAIPresets();
    }
  }, [data]);

  const generateAIPresets = async () => {
    setIsGenerating(true);
    try {
      // Get AI analysis of the data
      const analysis = await GeminiService.analyzeDataStructure(data, 'dataset');
      setAiInsights(analysis);

      // Generate enhanced chart suggestions with categories
      const enhancedPresets = await generateEnhancedPresets(analysis);
      setPresets(enhancedPresets);

      // Generate smart suggestions based on data patterns
      const suggestions = await generateSmartSuggestions(analysis);
      setSmartSuggestions(suggestions);

    } catch (error) {
      console.error('Failed to generate AI presets:', error);
      // Fallback to basic presets
      const basicPresets = generateBasicPresets();
      setPresets(basicPresets);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateEnhancedPresets = async (analysis) => {
    const presets = [];
    const { suggestedCharts } = analysis;

    // Categorize suggested charts
    suggestedCharts.forEach((chart, index) => {
      const category = categorizeChart(chart);
      presets.push({
        id: `ai-preset-${index}`,
        ...chart,
        category,
        confidence: calculateConfidence(chart, analysis),
        aiGenerated: true,
        preview: generatePreviewData(chart, data.slice(0, 5)),
        benefits: generateBenefits(chart),
        difficulty: 'Easy'
      });
    });

    // Add advanced AI-generated combinations
    const advancedPresets = await generateAdvancedPresets(analysis);
    presets.push(...advancedPresets);

    return presets;
  };

  const generateAdvancedPresets = async (analysis) => {
    const advanced = [];
    const { columnAnalysis } = analysis;

    // Multi-dimensional analysis presets
    if (columnAnalysis.numeric.length >= 2 && columnAnalysis.categorical.length >= 1) {
      advanced.push({
        id: 'multi-metric-dashboard',
        title: 'Multi-Metric Performance Dashboard',
        type: 'combo',
        charts: [
          {
            type: 'bar',
            xAxis: columnAnalysis.categorical[0],
            yAxis: columnAnalysis.numeric[0],
            title: `${columnAnalysis.numeric[0]} by ${columnAnalysis.categorical[0]}`
          },
          {
            type: 'line',
            xAxis: columnAnalysis.categorical[0],
            yAxis: columnAnalysis.numeric[1],
            title: `${columnAnalysis.numeric[1]} Trend`
          }
        ],
        category: 'performance',
        confidence: 0.9,
        aiGenerated: true,
        reasoning: 'Comprehensive view combining key metrics for strategic decision making',
        benefits: ['360° view of performance', 'Identify correlations', 'Strategic insights'],
        difficulty: 'Advanced'
      });
    }

    // Predictive analysis preset
    if (columnAnalysis.temporal.length > 0 && columnAnalysis.numeric.length > 0) {
      advanced.push({
        id: 'predictive-analysis',
        title: 'Predictive Trend Analysis',
        type: 'area',
        xAxis: columnAnalysis.temporal[0],
        yAxis: columnAnalysis.numeric[0],
        category: 'trending',
        confidence: 0.85,
        aiGenerated: true,
        reasoning: 'Forecast future trends based on historical patterns',
        benefits: ['Future planning', 'Risk assessment', 'Growth prediction'],
        difficulty: 'Intermediate',
        features: ['Trend lines', 'Confidence intervals', 'Anomaly detection']
      });
    }

    return advanced;
  };

  const generateSmartSuggestions = async (analysis) => {
    const suggestions = [];

    // Data quality suggestions
    if (analysis.dataQualityNotes && analysis.dataQualityNotes.length > 0) {
      suggestions.push({
        type: 'quality',
        icon: Eye,
        title: 'Data Quality Insights',
        description: analysis.dataQualityNotes[0],
        action: 'Review data cleaning options'
      });
    }

    // Performance suggestions
    if (analysis.keyInsights && analysis.keyInsights.length > 0) {
      suggestions.push({
        type: 'insight',
        icon: Brain,
        title: 'Key Business Insight',
        description: analysis.keyInsights[0],
        action: 'Create focused visualization'
      });
    }

    return suggestions;
  };

  const categorizeChart = (chart) => {
    if (chart.type === 'line' || chart.type === 'area') return 'trending';
    if (chart.type === 'pie') return 'distribution';
    if (chart.type === 'bar') return 'comparison';
    return 'performance';
  };

  const calculateConfidence = (chart, analysis) => {
    let confidence = 0.7;
    
    // Higher confidence for temporal data with line charts
    if (chart.type === 'line' && analysis.columnAnalysis.temporal.length > 0) {
      confidence += 0.2;
    }
    
    // Higher confidence for categorical data with appropriate charts
    if ((chart.type === 'bar' || chart.type === 'pie') && analysis.columnAnalysis.categorical.length > 0) {
      confidence += 0.15;
    }
    
    return Math.min(confidence, 0.95);
  };

  const generatePreviewData = (chart, sampleData) => {
    return sampleData.slice(0, 3).map(row => ({
      x: row[chart.xAxis],
      y: row[chart.yAxis]
    }));
  };

  const generateBenefits = (chart) => {
    const benefits = {
      bar: ['Easy comparison', 'Clear rankings', 'Quick insights'],
      line: ['Trend identification', 'Pattern recognition', 'Time-based analysis'],
      pie: ['Proportion analysis', 'Part-to-whole view', 'Distribution clarity'],
      area: ['Volume emphasis', 'Cumulative view', 'Trend magnitude']
    };
    return benefits[chart.type] || ['Data visualization', 'Better insights', 'Clear presentation'];
  };

  const generateBasicPresets = () => {
    const numericCols = columns.filter(col => 
      data.length > 0 && !isNaN(data[0][col]) && data[0][col] !== ''
    );
    const categoricalCols = columns.filter(col => !numericCols.includes(col));

    const basicPresets = [];

    if (numericCols.length > 0 && categoricalCols.length > 0) {
      basicPresets.push({
        id: 'basic-comparison',
        title: `${categoricalCols[0]} Performance Analysis`,
        type: 'bar',
        xAxis: categoricalCols[0],
        yAxis: numericCols[0],
        category: 'comparison',
        confidence: 0.8,
        reasoning: 'Basic categorical comparison',
        benefits: ['Quick comparison', 'Clear visualization', 'Easy interpretation'],
        difficulty: 'Easy'
      });
    }

    return basicPresets;
  };

  const filteredPresets = selectedCategory === 'all' 
    ? presets 
    : presets.filter(preset => preset.category === selectedCategory);

  const handleSelectPreset = (preset) => {
    if (preset.type === 'combo') {
      // Handle multiple charts
      preset.charts.forEach(chart => {
        onSelectPreset({
          ...chart,
          id: Date.now().toString() + Math.random(),
          aiGenerated: true
        });
      });
    } else {
      onSelectPreset({
        ...preset,
        id: Date.now().toString(),
        aiGenerated: true
      });
    }
  };

  if (isGenerating) {
    return (
      <div className={`rounded-2xl shadow-xl border p-8 ${
        theme === 'dark' 
          ? 'bg-gray-800/80 border-gray-700/50' 
          : 'bg-white/80 border-white/20'
      }`}>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
          <div className="ml-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Generating AI Chart Presets
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Analyzing your data to create intelligent visualizations...
            </p>
          </div>
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
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-3">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                AI Chart Presets
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Intelligent chart recommendations based on your data
              </p>
            </div>
          </div>
          <button
            onClick={generateAIPresets}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
            title="Regenerate presets"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-lg'
                : theme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Presets ({presets.length})
          </button>
          {Object.entries(PRESET_CATEGORIES).map(([key, category]) => {
            const count = presets.filter(p => p.category === key).length;
            if (count === 0) return null;
            
            const Icon = category.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === key
                    ? 'bg-purple-600 text-white shadow-lg'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <div className="p-6 border-b border-gray-200/50">
          <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Smart Suggestions
          </h4>
          <div className="space-y-2">
            {smartSuggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start">
                    <Icon className={`w-4 h-4 mt-0.5 mr-3 ${
                      theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {suggestion.title}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preset Grid */}
      <div className="p-6">
        {filteredPresets.length === 0 ? (
          <div className="text-center py-8">
            <Brain className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No presets available for this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPresets.map((preset) => {
              const ChartIcon = CHART_ICONS[preset.type] || BarChart;
              const category = PRESET_CATEGORIES[preset.category];
              
              return (
                <div
                  key={preset.id}
                  className={`relative p-4 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer group ${
                    theme === 'dark'
                      ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  {/* AI Badge */}
                  {preset.aiGenerated && (
                    <div className="absolute top-2 right-2">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
                        theme === 'dark'
                          ? 'bg-purple-900/50 text-purple-300'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-gradient-to-r ${category?.color || 'from-gray-500 to-gray-600'}`}>
                      <ChartIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {preset.title}
                      </h4>
                      <div className="flex items-center mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {preset.type.charAt(0).toUpperCase() + preset.type.slice(1)}
                        </span>
                        {preset.confidence && (
                          <span className={`text-xs ml-2 ${
                            preset.confidence > 0.8
                              ? 'text-green-600'
                              : preset.confidence > 0.6
                              ? 'text-yellow-600'
                              : 'text-orange-600'
                          }`}>
                            {Math.round(preset.confidence * 100)}% match
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {preset.reasoning}
                  </p>

                  {/* Benefits */}
                  {preset.benefits && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {preset.benefits.slice(0, 3).map((benefit, index) => (
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
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {preset.difficulty || 'Easy'} • Click to add
                    </span>
                    <Plus className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
