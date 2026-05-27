'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAssignments } from '../../lib/api';

export default function LibraryPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLibraryItems() {
      try {
        const data = await getAssignments();
        // Only show assignments that have successfully generated papers
        const completed = data.filter((item: any) => item.status === 'done');
        setAssignments(completed);
      } catch (err) {
        console.error('Failed to load library items:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLibraryItems();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <span className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#8E8E93] font-semibold">Loading library...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          My Library
        </h2>
        <p className="text-xs text-[#8E8E93] font-semibold mt-1">Re-use previously generated assessments, reference documents, and question banks.</p>
      </div>

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white border border-[#E5E5EA] rounded-3xl p-8 text-center shadow-sm">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-purple-500 mb-4 border border-purple-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">No saved items</h3>
          <p className="text-xs text-[#8E8E93] max-w-xs mb-4 font-medium">Generate an exam assignment first to save it to your local library.</p>
          <button 
            onClick={() => router.push('/create')}
            className="px-4 py-2 bg-[#1C1C1E] hover:bg-black text-white text-xs font-bold rounded-xl border border-[#FF5A36] transition shadow-sm"
          >
            Create Assignment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E5E5EA] overflow-hidden shadow-sm">
          <div className="divide-y divide-[#F4F4F6] text-xs">
            {assignments.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleDateString('en-GB');
              return (
                <div key={item._id} className="p-4 flex items-center justify-between hover:bg-[#F9F9FB] transition">
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="font-bold text-gray-900 truncate">
                        {item.topic ? `Quiz on ${item.topic}` : `Quiz on ${item.subject}`}
                      </div>
                      <div className="text-[10px] text-[#8E8E93] font-semibold mt-0.5">
                        {item.grade} · {item.subject}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <span className="text-[10px] text-[#8E8E93] font-bold">{formattedDate}</span>
                    <button 
                      onClick={() => router.push(`/paper/${item._id}`)}
                      className="px-3 py-1.5 bg-[#F4F4F6] hover:bg-[#FF5A36] hover:text-white rounded-lg text-xs font-bold text-gray-700 transition"
                    >
                      Open
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
