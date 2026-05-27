'use client';

import React from 'react';
import AssignmentForm from '../../components/AssignmentForm';

export default function CreateAssignmentPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Progress Indicators matching Screenshot 3 */}
      <div className="flex items-center mb-8 px-4">
        <div className="flex items-center space-x-2">
          <span className="w-4.5 h-4.5 rounded-full bg-[#FF5A36] border-2 border-white ring-2 ring-[#FF5A36] flex items-center justify-center text-white" />
          <span className="text-xs font-bold text-gray-900">Create Assignment</span>
        </div>
        <div className="flex-1 h-[3px] bg-gray-200 mx-4 rounded-full relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-[#FF5A36]" />
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <span className="text-xs font-semibold">Set up a new assignment for your students</span>
        </div>
      </div>

      {/* Form Card */}
      <AssignmentForm />
    </div>
  );
}
