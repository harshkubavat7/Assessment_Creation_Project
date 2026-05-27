import React from 'react';

export function StudentInfoBlock() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-dashed border-gray-300 pb-6 mb-8">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Student Name
        </label>
        <div className="border-b border-gray-400 h-8 mt-1" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Roll Number
        </label>
        <div className="border-b border-gray-400 h-8 mt-1" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Class / Section
        </label>
        <div className="border-b border-gray-400 h-8 mt-1" />
      </div>
    </div>
  );
}
export default StudentInfoBlock;
