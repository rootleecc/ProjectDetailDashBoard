import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FileUp, Download, Search, FileSpreadsheet, Clock, Save } from 'lucide-react';
import Dashboard from './Dashboard';
import DataTable from './DataTable';
import SheetSelector from './SheetSelector';
import { ExcelData } from '../types/ExcelTypes';

interface SavedDashboard {
  name: string;
  data: any[][];
  savedAt: string;
}

const ExcelViewer: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [importDateTime, setImportDateTime] = useState<string | null>(null);
  const [savedDashboards, setSavedDashboards] = useState<SavedDashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<SavedDashboard | null>(null);

  useEffect(() => {
    // Load saved dashboards from localStorage on component mount
    const saved = localStorage.getItem('savedDashboards');
    if (saved) {
      setSavedDashboards(JSON.parse(saved));
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportDateTime(new Date().toLocaleString());
    setSelectedDashboard(null);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets: Record<string, any[][]> = {};
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          sheets[sheetName] = jsonData as any[][];
        });
        
        setExcelData({ sheets, sheetNames: workbook.SheetNames });
        setSelectedSheet(workbook.SheetNames[0]);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing Excel file. Please check the file format.');
        setImportDateTime(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const saveDashboard = () => {
    if (!excelData || !selectedSheet || !fileName) return;

    const dashboardName = fileName.replace(/\.[^/.]+$/, '') + '_' + selectedSheet;
    const newDashboard: SavedDashboard = {
      name: dashboardName,
      data: excelData.sheets[selectedSheet],
      savedAt: new Date().toLocaleString(),
    };

    const updatedDashboards = [...savedDashboards.filter(d => d.name !== dashboardName), newDashboard];
    setSavedDashboards(updatedDashboards);
    localStorage.setItem('savedDashboards', JSON.stringify(updatedDashboards));
    alert('Dashboard saved successfully!');
  };

  const loadDashboard = (dashboard: SavedDashboard) => {
    setSelectedDashboard(dashboard);
    setExcelData({
      sheets: { [dashboard.name]: dashboard.data },
      sheetNames: [dashboard.name]
    });
    setSelectedSheet(dashboard.name);
    setFileName(dashboard.name);
    setImportDateTime(dashboard.savedAt);
  };

  const exportToExcel = () => {
    if (!excelData || !selectedSheet) return;
    
    const worksheet = XLSX.utils.aoa_to_sheet(excelData.sheets[selectedSheet]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedSheet);
    
    const exportFileName = fileName.replace(/\.[^/.]+$/, '') + '_modified.xlsx';
    XLSX.writeFile(workbook, exportFileName);
  };

  const filterData = (data: any[][]) => {
    if (!searchQuery) return data;
    
    return data.filter(row => 
      row.some(cell => 
        cell && cell.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:shadow-xl">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Excel File Viewer</h2>
        
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <label className="flex-1 flex flex-col md:flex-row items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors duration-300">
            <FileUp className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Upload Excel File</span>
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
          </label>
          
          {excelData && (
            <>
              <button 
                onClick={exportToExcel}
                className="flex items-center justify-center px-4 py-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors duration-300"
              >
                <Download className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Export Modified</span>
              </button>
              
              <button 
                onClick={saveDashboard}
                className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-300"
              >
                <Save className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Save Dashboard</span>
              </button>
            </>
          )}
        </div>

        {savedDashboards.length > 0 && !selectedDashboard && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Saved Dashboards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedDashboards.map((dashboard) => (
                <button
                  key={dashboard.name}
                  onClick={() => loadDashboard(dashboard)}
                  className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                >
                  <FileSpreadsheet className="h-5 w-5 text-blue-500 mr-3" />
                  <div className="text-left">
                    <div className="font-medium text-gray-800">{dashboard.name}</div>
                    <div className="text-sm text-gray-500">Saved: {dashboard.savedAt}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {fileName && (
          <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-orange-500" />
              <span>Current file: <span className="font-medium">{fileName}</span></span>
            </div>
            {importDateTime && (
              <div className="flex items-center md:ml-4">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span>Imported on: <span className="font-medium">{importDateTime}</span></span>
              </div>
            )}
          </div>
        )}
        
        {excelData && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <SheetSelector 
                sheetNames={excelData.sheetNames} 
                selectedSheet={selectedSheet} 
                onSelectSheet={setSelectedSheet} 
              />
              
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search in sheet..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>
            
            {selectedSheet && excelData.sheets[selectedSheet] && (
              <div className="overflow-auto">
                <Dashboard data={excelData.sheets[selectedSheet]} />
                <DataTable data={filterData(excelData.sheets[selectedSheet])} />
              </div>
            )}
          </>
        )}
        
        {!excelData && !selectedDashboard && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <FileSpreadsheet className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Excel File Loaded</h3>
            <p className="text-gray-600 max-w-md">
              Upload an Excel file to view and edit its contents, or select a saved dashboard above. Supported formats: .xlsx, .xls, and .csv
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelViewer;