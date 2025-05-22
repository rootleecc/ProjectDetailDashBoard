export interface ExcelData {
  sheets: Record<string, any[][]>;
  sheetNames: string[];
}