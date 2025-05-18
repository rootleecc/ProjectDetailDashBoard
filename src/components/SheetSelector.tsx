import React from 'react';
import { Table } from 'lucide-react';

interface SheetSelectorProps {
  sheetNames: string[];
  selectedSheet: string;
  onSelectSheet: (sheetName: string) => void;
}

const SheetSelector: React.FC<SheetSelectorProps> = ({ 
  sheetNames, 
  selectedSheet, 
  onSelectSheet 
}) => {
  return (
    <div className="relative inline-block">
      <div className="flex items-center">
        <Table className="h-4 w-4 mr-2 text-gray-500" />
        <select
          value={selectedSheet}
          onChange={(e) => onSelectSheet(e.target.value)}
          className="appearance-none bg-white border border-gray-200 rounded-lg pl-2 pr-8 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all duration-300"
        >
          {sheetNames.map((sheetName) => (
            <option key={sheetName} value={sheetName}>
              {sheetName}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SheetSelector;