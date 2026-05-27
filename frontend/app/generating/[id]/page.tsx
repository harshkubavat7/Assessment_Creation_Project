'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useAssignmentStore } from '../../../store/useAssignmentStore';
import ProgressTracker from '../../../components/ProgressTracker';

export default function GeneratingPaperPage() {
  const params = useParams();
  const id = params.id as string;

  // Listen to background progress via websocket
  useWebSocket(id);

  const { jobProgress, jobStep, errorMessage } = useAssignmentStore();

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col justify-between">
      {/* Premium Navbar */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-[#7F77DD] flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-indigo-200">
              V
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              Veda<span className="text-[#7F77DD]">AI</span>
            </span>
          </div>

          {/* Step Progress Indicators */}
          <div className="hidden sm:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center space-x-2 text-gray-400">
              <span className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs">1</span>
              <span>Create Config</span>
            </div>
            <div className="w-8 h-px bg-gray-200" />
            <div className="flex items-center space-x-2 text-indigo-600">
              <span className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs">2</span>
              <span>Generate Paper</span>
            </div>
            <div className="w-8 h-px bg-gray-200" />
            <div className="flex items-center space-x-2 text-gray-400">
              <span className="w-6 h-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs">3</span>
              <span>Output Paper</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main progress content */}
      <main className="flex-grow flex items-center justify-center p-4 py-16">
        <ProgressTracker
          progress={jobProgress}
          currentStep={jobStep}
          errorMessage={errorMessage}
        />
      </main>

      {/* Footer warning */}
      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100 bg-white">
        Please do not close this window while AI is generating the paper.
      </footer>
    </div>
  );
}
