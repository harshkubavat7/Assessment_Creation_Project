'use client';

import React from 'react';
import { useAssignmentStore } from '../../store/useAssignmentStore';

export default function SettingsPage() {
  const { user } = useAssignmentStore();

  const emailPrefix = user?.email ? user.email.split('@')[0] : 'Teacher';
  const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
          Settings
        </h2>
        <p className="text-xs text-[#8E8E93] font-semibold mt-1">Configure your profile, school roster details, and API integrations.</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E5E5EA] shadow-sm space-y-6 max-w-2xl">
        {/* Profile details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-[#F4F4F6] pb-2">Teacher Profile</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <span className="text-[#8E8E93] block mb-1">Full Name</span>
              <input type="text" className="w-full px-3 py-2 bg-[#F4F4F6] border border-[#E5E5EA] rounded-xl text-gray-800 focus:outline-none" value={displayName} readOnly />
            </div>
            <div>
              <span className="text-[#8E8E93] block mb-1">Email Address</span>
              <input type="text" className="w-full px-3 py-2 bg-[#F4F4F6] border border-[#E5E5EA] rounded-xl text-gray-800 focus:outline-none" value={user?.email || 'N/A'} readOnly />
            </div>
          </div>
        </div>

        {/* Institution Details */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-[#F4F4F6] pb-2">Institution Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
            <div>
              <span className="text-[#8E8E93] block mb-1">School Name</span>
              <input type="text" className="w-full px-3 py-2 bg-[#F4F4F6] border border-[#E5E5EA] rounded-xl text-gray-800 focus:outline-none" value={user?.schoolName || 'N/A'} readOnly />
            </div>
            <div>
              <span className="text-[#8E8E93] block mb-1">Campus / Location</span>
              <input type="text" className="w-full px-3 py-2 bg-[#F4F4F6] border border-[#E5E5EA] rounded-xl text-gray-800 focus:outline-none" value={user?.schoolLocation || 'N/A'} readOnly />
            </div>
          </div>
        </div>

        {/* API integration details */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-[#F4F4F6] pb-2">Integrations</h4>
          <div className="flex items-center justify-between text-xs font-semibold bg-[#F4F4F6] p-4 rounded-2xl border border-[#E5E5EA]">
            <div className="flex items-center space-x-3">
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </span>
              <div>
                <div className="text-gray-900 font-bold">Google Gemini API</div>
                <div className="text-[10px] text-[#8E8E93] font-semibold mt-0.5">Model: gemini-2.5-flash</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              Active Connection
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
