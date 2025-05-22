import React from 'react';
import { Table, Trash2 } from 'lucide-react';

interface SavedDashboard {
  name: string;
  data: any[][];
  savedAt: string;
}

interface SheetSelectorProps {
  sheetNames: string[];
  selectedSheet: string;
  onSelectSheet: (sheetName: string) => void;
  savedDashboards?: SavedDashboard[];
  onLoadDashboard?: (dashboard: SavedDashboard) => void;
  onDeleteDashboard?: (dashboardName: string) => void;
}

const SheetSelector: React.FC<SheetSelectorProps> = ({ 
  sheetNames, 
  selectedSheet, 
  onSelectSheet,
  savedDashboards = [],
  onLoadDashboard,
  onDeleteDashboard
}) => {
  const handleChange = (value: string) => {
    const savedDashboard = savedDashboards.find(d => d.name === value);
    if (savedDashboard && onLoadDashboard) {
      onLoadDashboard(savedDashboard);
    } else {
      onSelectSheet(value);
    }
  };

  return (
    <div className="relative inline-block min-w-[300px]">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Table className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <select
            value={selectedSheet}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-lg pl-8 pr-8 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all duration-300"
          >
            <option value="">Select a dashboard...</option>
            {sheetNames.length > 0 && (
              <optgroup label="Current Sheets">
                {sheetNames.map((sheetName) => (
                  <option key={sheetName} value={sheetName}>
                    {sheetName}
                  </option>
                ))}
              </optgroup>
            )}
            
            {savedDashboards.length > 0 && (
              <optgroup label="Saved Dashboards">
                {savedDashboards.map((dashboard) => (
                  <option key={dashboard.name} value={dashboard.name}>
                    {dashboard.name} (Saved: {dashboard.savedAt})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        
        {onDeleteDashboard && selectedSheet && savedDashboards.some(d => d.name === selectedSheet) && (
          <button
            onClick={() => onDeleteDashboard(selectedSheet)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-300"
            title="Delete dashboard"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SheetSelector;