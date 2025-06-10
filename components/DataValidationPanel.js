'use client';

import { useState } from 'react';
import { Shield, CheckCircle, AlertTriangle, XCircle, Trash2, RefreshCw } from 'lucide-react';
import useAppStore from '../lib/store';

export default function DataValidationPanel() {
  const { rawData, columns, dashboardConfig } = useAppStore();
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateData = () => {
    setIsValidating(true);
    
    // Simulate validation process
    setTimeout(() => {
      const results = {
        totalRows: rawData?.length || 0,
        validRows: Math.floor((rawData?.length || 0) * 0.95),
        issues: [
          {
            type: 'missing_values',
            count: Math.floor((rawData?.length || 0) * 0.03),
            severity: 'warning',
            description: 'Rows with missing values detected'
          },
          {
            type: 'duplicate_rows',
            count: Math.floor((rawData?.length || 0) * 0.02),
            severity: 'error',
            description: 'Duplicate rows found'
          },
          {
            type: 'outliers',
            count: Math.floor((rawData?.length || 0) * 0.01),
            severity: 'info',
            description: 'Statistical outliers detected'
          }
        ],
        columnStats: columns?.map(col => ({
          name: col,
          completeness: Math.random() * 0.2 + 0.8,
          uniqueness: Math.random() * 0.5 + 0.5,
          dataType: Math.random() > 0.5 ? 'numeric' : 'text'
        })) || []
      };
      
      setValidationResults(results);
      setIsValidating(false);
    }, 2000);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    }
  };

  return (
    <div className={`rounded-xl border p-6 ${
      dashboardConfig.theme === 'dark' 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-white/50 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${
            dashboardConfig.theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'
          }`}>
            <Shield className={`h-5 w-5 ${
              dashboardConfig.theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
            }`} />
          </div>
          <h3 className={`text-lg font-semibold ml-3 ${
            dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Data Validation & Quality
          </h3>
        </div>
        
        <button
          onClick={validateData}
          disabled={isValidating || !rawData}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isValidating || !rawData
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
          {isValidating ? 'Validating...' : 'Run Validation'}
        </button>
      </div>

      {!rawData ? (
        <div className={`text-center py-8 ${
          dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No data available for validation</p>
        </div>
      ) : !validationResults ? (
        <div className={`text-center py-8 ${
          dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Click "Run Validation" to analyze your data quality</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border ${
              dashboardConfig.theme === 'dark' 
                ? 'bg-gray-700/50 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`text-sm ${
                dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Total Rows
              </p>
              <p className={`text-xl font-bold ${
                dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {validationResults.totalRows.toLocaleString()}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              dashboardConfig.theme === 'dark' 
                ? 'bg-gray-700/50 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`text-sm ${
                dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Valid Rows
              </p>
              <p className={`text-xl font-bold text-green-600`}>
                {validationResults.validRows.toLocaleString()}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              dashboardConfig.theme === 'dark' 
                ? 'bg-gray-700/50 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`text-sm ${
                dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Data Quality
              </p>
              <p className={`text-xl font-bold ${
                validationResults.validRows / validationResults.totalRows > 0.9 
                  ? 'text-green-600' 
                  : 'text-yellow-600'
              }`}>
                {Math.round((validationResults.validRows / validationResults.totalRows) * 100)}%
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              dashboardConfig.theme === 'dark' 
                ? 'bg-gray-700/50 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`text-sm ${
                dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Issues Found
              </p>
              <p className={`text-xl font-bold ${
                validationResults.issues.length === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {validationResults.issues.reduce((sum, issue) => sum + issue.count, 0)}
              </p>
            </div>
          </div>

          {/* Validation Issues */}
          <div>
            <h4 className={`text-md font-semibold mb-3 ${
              dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Data Quality Issues
            </h4>
            {validationResults.issues.length === 0 ? (
              <div className={`p-4 rounded-lg border border-green-200 bg-green-50 ${
                dashboardConfig.theme === 'dark' 
                  ? 'dark:border-green-800 dark:bg-green-900/20' 
                  : ''
              }`}>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className={`${
                    dashboardConfig.theme === 'dark' ? 'text-green-400' : 'text-green-700'
                  }`}>
                    No data quality issues detected
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {validationResults.issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getSeverityIcon(issue.severity)}
                        <div className="ml-3">
                          <p className={`font-medium ${
                            dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {issue.description}
                          </p>
                          <p className={`text-sm ${
                            dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Affected rows: {issue.count}
                          </p>
                        </div>
                      </div>
                      <button className={`p-2 rounded hover:bg-white/10 ${
                        dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column Statistics */}
          <div>
            <h4 className={`text-md font-semibold mb-3 ${
              dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Column Statistics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validationResults.columnStats.slice(0, 6).map((stat, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    dashboardConfig.theme === 'dark' 
                      ? 'bg-gray-700/30 border-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${
                      dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      stat.dataType === 'numeric'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    }`}>
                      {stat.dataType}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={`${
                        dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Completeness
                      </span>
                      <span className={`font-medium ${
                        stat.completeness > 0.9 ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {Math.round(stat.completeness * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`${
                        dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Uniqueness
                      </span>
                      <span className={`font-medium ${
                        dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {Math.round(stat.uniqueness * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
