// components/ResultsTable.tsx
'use client';

import React from 'react';

interface ResultsTableProps {
  records: any[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ records }) => {
  if (!records.length) {
    return <p className="mt-4">No results to display.</p>;
  }

  // Dynamically determine headers based on the first record
  const headers = Object.keys(records[0]);

  return (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="py-2 px-4 border-b border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {headers.map((header) => (
                <td key={header} className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                  {record[header] ? JSON.stringify(record[header]) : 'null'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
