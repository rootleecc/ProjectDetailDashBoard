import React from 'react';

interface DataTableProps {
  data: any[][];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-gray-500">No data available</div>;
  }

  const headers = data[0] || [];
  const rows = data.slice(1);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {headers.map((header, index) => (
              <th 
                key={index} 
                className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header || `Column ${index + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex} 
                  className="py-2 px-4 text-sm text-gray-700 border-b border-gray-200 whitespace-nowrap"
                >
                  {cell !== undefined && cell !== null ? cell.toString() : ''}
                </td>
              ))}
              {headers.length > row.length && 
                Array(headers.length - row.length)
                  .fill(0)
                  .map((_, index) => (
                    <td 
                      key={`empty-${rowIndex}-${index}`} 
                      className="py-2 px-4 text-sm text-gray-400 border-b border-gray-200"
                    >
                      &mdash;
                    </td>
                  ))
              }
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td 
                colSpan={headers.length} 
                className="py-4 px-4 text-center text-sm text-gray-500"
              >
                No data rows found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;