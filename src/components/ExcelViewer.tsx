import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileUp, Download, Search, FileSpreadsheet, Clock } from 'lucide-react';
import Dashboard from './Dashboard';
import DataTable from './DataTable';
import SheetSelector from './SheetSelector';
import { ExcelData } from '../types/ExcelTypes';

const ExcelViewer: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [importTime, setImportTime] = useState<number | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const startTime = performance.now();
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
        
        const endTime = performance.now();
        setImportTime(endTime - startTime);
        
        setExcelData({ sheets, sheetNames: workbook.SheetNames });
        setSelectedSheet(workbook.SheetNames[0]);
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        alert('Error parsing Excel file. Please check the file format.');
        setImportTime(null);
      }
    };
    reader.readAsArrayBuffer(file);
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
            <button 
              onClick={exportToExcel}
              className="flex items-center justify-center px-4 py-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors duration-300"
            >
              <Download className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Export Modified</span>
            </button>
          )}
        </div>
        
        {fileName && (
          <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-2 text-orange-500" />
              <span>Current file: <span className="font-medium">{fileName}</span></span>
            </div>
            {importTime && (
              <div className="flex items-center md:ml-4">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                <span>Import time: <span className="font-medium">{importTime.toFixed(2)}ms</span></span>
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
        
        {!excelData && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <FileSpreadsheet className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Excel File Loaded</h3>
            <p className="text-gray-600 max-w-md">
              Upload an Excel file to view and edit its contents. Supported formats: .xlsx, .xls, and .csv
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelViewer;