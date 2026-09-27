import React, { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, mono = false, className = '', id, name, ...props }, ref) => {
    const inputId = id || (label ? 'input-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined);
    const inputName = name || inputId;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            name={inputName}
            className={`w-full bg-slate-50 border rounded-lg py-2 text-xs text-slate-900 placeholder-slate-400 outline-none transition ${
              mono ? 'font-mono' : ''
            } ${leftIcon ? 'pl-9' : 'pl-3'} ${rightIcon ? 'pr-9' : 'pr-3'} ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:bg-white'
                : 'border-slate-300 focus:border-blue-500 focus:bg-white'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, children, className = '', id, name, ...props }, ref) => {
    const selectId = id || (label ? 'select-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined);
    const selectName = name || selectId;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          name={selectName}
          className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-slate-900 outline-none transition ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:bg-white'
              : 'border-slate-300 focus:border-blue-500 focus:bg-white'
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, name, ...props }, ref) => {
    const textareaId = id || (label ? 'textarea-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined);
    const textareaName = name || textareaId;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          name={textareaName}
          className={`w-full bg-slate-50 border rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:bg-white'
              : 'border-slate-300 focus:border-blue-500 focus:bg-white'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-slate-500">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  'aria-label'?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  id,
  name = 'search',
  'aria-label': ariaLabel,
}) => {
  const searchId = id || 'search-' + Math.random().toString(36).substring(2, 7);

  return (
    <div className={`relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs transition focus-within:border-blue-500 ${className}`}>
      <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
      <input
        id={searchId}
        name={name}
        aria-label={ariaLabel || placeholder}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search input"
          onClick={() => onChange('')}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
