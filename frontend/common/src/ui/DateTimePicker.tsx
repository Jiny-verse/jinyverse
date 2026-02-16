'use client';

import React, { ChangeEvent } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DateTimePickerProps {
  value: string; // ISO string or empty
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  label,
  className = '',
}: DateTimePickerProps) {
  // Extract date and time from ISO string
  const dateValue = value ? value.split('T')[0] : '';
  const timeValue = value && value.includes('T') ? value.split('T')[1].substring(0, 5) : '';

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (!newDate) {
      onChange('');
      return;
    }
    const currentTime = timeValue || '00:00';
    onChange(`${newDate}T${currentTime}:00`);
  };

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    const currentDate = dateValue || new Date().toISOString().split('T')[0];
    onChange(`${currentDate}T${newTime}:00`);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="date"
            value={dateValue}
            onChange={handleDateChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="relative flex-1">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
