import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FileUp, Download, Search, LayoutDashboard, Clock, Save } from 'lucide-react';
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

  useEffect(() => {
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
        console.error('Error parsing project data:', error);
        alert('Error parsing project data. Please check the file format.');
        setImportDateTime(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const saveDashboard = () => {
    if (!excelData || !selectedSheet || !fileName) return;

    const dashboardName = `${fileName.replace(/\.[^/.]+$/, '')}_${selectedSheet}`;
    const newDashboard: SavedDashboard = {
      name: dashboardName,
      data: excelData.sheets[selectedSheet],
      savedAt: new Date().toLocaleString(),
    };

    const updatedDashboards = [...savedDashboards.filter(d => d.name !== dashboardName), newDashboard];
    setSavedDashboards(updatedDashboards);
    localStorage.setItem('savedDashboards', JSON.stringify(updatedDashboards));
    alert('Project dashboard saved successfully!');
  };

  const loadDashboard = (dashboard: SavedDashboard) => {
    setExcelData({
      sheets: { [dashboard.name]: dashboard.data },
      sheetNames: [dashboard.name]
    });
    setSelectedSheet(dashboard.name);
    setFileName(dashboard.name);
    setImportDateTime(dashboard.savedAt);
  };

  const deleteDashboard = (dashboardName: string) => {
    if (confirm('Are you sure you want to delete this project dashboard?')) {
      const updatedDashboards = savedDashboards.filter(d => d.name !== dashboardName);
      setSavedDashboards(updatedDashboards);
      localStorage.setItem('savedDashboards', JSON.stringify(updatedDashboards));
      
      if (selectedSheet === dashboardName) {
        setExcelData(null);
        setSelectedSheet('');
        setFileName('');
        setImportDateTime(null);
      }
    }
  };

  const exportToExcel = () => {
    if (!excelData || !selectedSheet) return;
    
    const worksheet = XLSX.utils.aoa_to_sheet(excelData.sheets[selectedSheet]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedSheet);
    
    const exportFileName = fileName.replace(/\.[^/.]+$/, '') + '_project_details.xlsx';
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h2 className="text-2xl font-semibold text-gray-800">Project Analytics Dashboard</h2>
              
              {savedDashboards.length > 0 && (
                <div className="flex items-center gap-4">
                  <SheetSelector 
                    sheetNames={excelData?.sheetNames || []}
                    selectedSheet={selectedSheet}
                    onSelectSheet={setSelectedSheet}
                    savedDashboards={savedDashboards}
                    onLoadDashboard={loadDashboard}
                    onDeleteDashboard={deleteDashboard}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <label className="flex-none flex items-center px-6 py-3 bg-blue-50 text-blue-700 rounded-xl cursor-pointer hover:bg-blue-100 transition-all duration-300 shadow-sm hover:shadow">
                <FileUp className="h-5 w-5 mr-3" />
                <span className="font-medium">Import Project Data</span>
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
                    className="flex items-center px-6 py-3 bg-teal-50 text-teal-700 rounded-xl hover:bg-teal-100 transition-all duration-300 shadow-sm hover:shadow"
                  >
                    <Download className="h-5 w-5 mr-3" />
                    <span className="font-medium">Export Report</span>
                  </button>
                  
                  <button 
                    onClick={saveDashboard}
                    className="flex items-center px-6 py-3 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-all duration-300 shadow-sm hover:shadow"
                  >
                    <Save className="h-5 w-5 mr-3" />
                    <span className="font-medium">Save Dashboard</span>
                  </button>
                </>
              )}
            </div>

            {/* File Info */}
            {fileName && (
              <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <LayoutDashboard className="h-5 w-5 mr-3 text-orange-500" />
                  <span className="text-gray-600">Current project: <span className="font-medium text-gray-900">{fileName}</span></span>
                </div>
                {importDateTime && (
                  <div className="flex items-center md:ml-6">
                    <Clock className="h-5 w-5 mr-3 text-blue-500" />
                    <span className="text-gray-600">Last updated: <span className="font-medium text-gray-900">{importDateTime}</span></span>
                  </div>
                )}
              </div>
            )}

            {/* Search Bar */}
            {excelData && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            )}

            {/* Dashboard and Table */}
            {selectedSheet && excelData?.sheets[selectedSheet] && (
              <div className="space-y-8">
                <Dashboard data={excelData.sheets[selectedSheet]} />
                <DataTable data={filterData(excelData.sheets[selectedSheet])} />
              </div>
            )}

            {/* Empty State */}
            {!excelData && savedDashboards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-xl">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                  <LayoutDashboard className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">No Project Data Loaded</h3>
                <p className="text-gray-600 max-w-md">
                  Import your project data to view detailed analytics and insights.
                  <br />
                  Supported formats: .xlsx, .xls, and .csv
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelViewer;