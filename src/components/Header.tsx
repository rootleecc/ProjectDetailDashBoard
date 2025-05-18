import React from 'react';
import { FileSpreadsheet } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">Excel Viewer</span>
          </div>
          <div className="hidden md:block">
            <div className="text-sm text-gray-500">
              Upload, view and export Excel files seamlessly
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;