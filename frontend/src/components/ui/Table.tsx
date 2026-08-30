import React from 'react';
import { Loader2 } from 'lucide-react';

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children, className = '', ...props }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full text-left text-xs ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] ${className}`} {...props}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => {
  return (
    <tbody className={`divide-y divide-slate-100 text-slate-700 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = '', ...props }) => {
  return (
    <tr className={`hover:bg-slate-50 transition ${className}`} {...props}>
      {children}
    </tr>
  );
};

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => {
  return (
    <th className={`px-4 py-3 ${className}`} {...props}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => {
  return (
    <td className={`px-4 py-3.5 ${className}`} {...props}>
      {children}
    </td>
  );
};

export interface TableEmptyStateProps {
  message?: string;
  colSpan: number;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({ message = 'No data available', colSpan }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-12 text-slate-400 text-xs">
        {message}
      </td>
    </tr>
  );
};

export interface TableLoadingStateProps {
  message?: string;
  colSpan: number;
}

export const TableLoadingState: React.FC<TableLoadingStateProps> = ({ message = 'Loading data...', colSpan }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-12 text-slate-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
        <span>{message}</span>
      </td>
    </tr>
  );
};

