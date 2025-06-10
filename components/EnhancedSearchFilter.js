'use client';

import { useState } from 'react';
import { Search, Filter, X, Calendar, Hash, Type } from 'lucide-react';
import useAppStore from '../lib/store';

export default function EnhancedSearchFilter() {
  const { rawData, columns, dashboardConfig, updateDashboardConfig } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [filterType, setFilterType] = useState('contains');
  const [activeFilters, setActiveFilters] = useState([]);

  const filterTypes = [
    { id: 'contains', name: 'Contains', icon: Type },
    { id: 'equals', name: 'Equals', icon: Hash },
    { id: 'greater', name: 'Greater than', icon: Hash },
    { id: 'less', name: 'Less than', icon: Hash }
  ];

  const addFilter = () => {
    if (searchTerm && selectedColumn) {
      const newFilter = {
        id: Date.now(),
        column: selectedColumn,
        type: filterType,
        value: searchTerm
      };
      setActiveFilters([...activeFilters, newFilter]);
      setSearchTerm('');
    }
  };

  const removeFilter = (filterId) => {
    setActiveFilters(activeFilters.filter(f => f.id !== filterId));
  };

  return (
    <div className={`rounded-xl border p-6 ${
      dashboardConfig.theme === 'dark' 
        ? 'bg-gray-800/50 border-gray-700' 
        : 'bg-white/50 border-gray-200'
    }`}>
      <div className="flex items-center mb-6">
        <div className={`p-2 rounded-lg ${
          dashboardConfig.theme === 'dark' ? 'bg-orange-900/30' : 'bg-orange-100'
        }`}>
          <Search className={`h-5 w-5 ${
            dashboardConfig.theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
          }`} />
        </div>
        <h3 className={`text-lg font-semibold ml-3 ${
          dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Enhanced Search & Filter
        </h3>
      </div>

      {/* Filter Builder */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            dashboardConfig.theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">Select column</option>
          {columns.map(col => (
            <option key={col} value={col}>{col}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${
            dashboardConfig.theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {filterTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter value..."
          className={`px-3 py-2 rounded-lg border ${
            dashboardConfig.theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />

        <button
          onClick={addFilter}
          disabled={!searchTerm || !selectedColumn}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          Add Filter
        </button>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <h4 className={`text-sm font-medium mb-2 ${
            dashboardConfig.theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Active Filters ({activeFilters.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <div
                key={filter.id}
                className={`flex items-center px-3 py-1 rounded-full text-sm border ${
                  dashboardConfig.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300'
                    : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                <span>{filter.column} {filter.type} "{filter.value}"</span>
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {rawData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg ${
            dashboardConfig.theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className={`text-xs ${
              dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total Rows
            </p>
            <p className={`text-lg font-bold ${
              dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {rawData.length.toLocaleString()}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${
            dashboardConfig.theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className={`text-xs ${
              dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Columns
            </p>
            <p className={`text-lg font-bold ${
              dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {columns.length}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${
            dashboardConfig.theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className={`text-xs ${
              dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Charts
            </p>
            <p className={`text-lg font-bold ${
              dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {dashboardConfig.charts.length}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${
            dashboardConfig.theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <p className={`text-xs ${
              dashboardConfig.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Filters
            </p>
            <p className={`text-lg font-bold ${
              dashboardConfig.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {activeFilters.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
