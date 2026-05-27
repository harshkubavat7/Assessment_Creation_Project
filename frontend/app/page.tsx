'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAssignments, deleteAssignment } from '../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Fetch all assignments on load
  const fetchAssignments = async () => {
    try {
      const data = await getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        await deleteAssignment(id);
        fetchAssignments();
      } catch (err) {
        console.error('Failed to delete assignment:', err);
      }
    }
    setActiveMenuId(null);
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <span className="w-10 h-10 border-4 border-[#FF5A36] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#8E8E93] font-semibold">Loading assignments...</p>
      </div>
    );
  }

  // View 1: Empty State Layout (Screenshot 1)
  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-lg bg-white border border-[#E5E5EA] rounded-3xl p-10 shadow-sm flex flex-col items-center text-center">
          {/* Custom vector graphic matching Figma design */}
          <div className="w-48 h-48 mb-8 relative flex items-center justify-center">
            {/* SVG Background illustration */}
            <svg viewBox="0 0 200 200" className="w-full h-full text-gray-100">
              <circle cx="100" cy="100" r="90" fill="#F4F4F6" />
              {/* Document sheet */}
              <path d="M70,40 L130,40 C135,40 140,45 140,50 L140,140 C140,145 135,150 130,150 L70,150 C65,150 60,145 60,140 L60,50 C60,45 65,40 70,40 Z" fill="#FFFFFF" stroke="#E5E5EA" strokeWidth="2.5" />
              {/* Document text lines */}
              <line x1="75" y1="65" x2="115" y2="65" stroke="#F4F4F6" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="75" y1="80" x2="125" y2="80" stroke="#F4F4F6" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="75" y1="95" x2="110" y2="95" stroke="#F4F4F6" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="75" y1="110" x2="120" y2="110" stroke="#F4F4F6" strokeWidth="3.5" strokeLinecap="round" />
              
              {/* Sparkle designs */}
              <path d="M150,60 L152,65 L157,67 L152,69 L150,74 L148,69 L143,67 L148,65 Z" fill="#4A90E2" opacity="0.6" />
              <path d="M45,120 L47,123 L52,125 L47,127 L45,132 L43,127 L38,125 L43,123 Z" fill="#4A90E2" opacity="0.6" />
              
              {/* Magnifying Glass with Red Cross */}
              <circle cx="100" cy="100" r="28" fill="white" stroke="#2C2C2C" strokeWidth="3.5" />
              <line x1="118" y1="118" x2="142" y2="142" stroke="#2C2C2C" strokeWidth="7" strokeLinecap="round" />
              {/* Red Circle + Cross indicator */}
              <circle cx="100" cy="100" r="16" fill="#FF4A4A" />
              <line x1="93" y1="93" x2="107" y2="107" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <line x1="107" y1="93" x2="93" y2="107" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2">No assignments yet</h3>
          <p className="text-xs text-[#8E8E93] leading-relaxed mb-8 max-w-sm font-medium">
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>

          <Link
            href="/create"
            className="px-6 py-3 bg-[#1C1C1E] hover:bg-black text-white rounded-full font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition"
          >
            <span className="font-bold">+</span>
            <span>Create Your First Assignment</span>
          </Link>
        </div>
      </div>
    );
  }

  // View 2: Active Assignments Grid (Screenshot 2)
  return (
    <div className="space-y-6 pb-24 md:pb-6 relative">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
            Assignments
          </h2>
          <p className="text-xs text-[#8E8E93] font-semibold mt-1">Manage and create assignments for your classes.</p>
        </div>
      </div>

      {/* Filter and search layout (Figma Mockup styling) */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-[#E5E5EA] shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#8E8E93] px-2 cursor-pointer hover:text-gray-900 transition">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filter By</span>
        </div>
        <div className="h-5 w-px bg-[#E5E5EA]" />
        <div className="flex-1 max-w-xs relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Search Assignment" 
            className="w-full bg-[#F4F4F6] border border-[#E5E5EA] rounded-full py-1.5 pl-8 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF5A36] focus:bg-white transition"
          />
        </div>
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {assignments.map((assignment) => {
          const assignDate = new Date(assignment.createdAt).toLocaleDateString('en-GB');
          const dueDate = new Date(assignment.dueDate).toLocaleDateString('en-GB');
          
          return (
            <div
              key={assignment._id}
              onClick={() => router.push(assignment.status === 'done' ? `/paper/${assignment._id}` : `/generating/${assignment._id}`)}
              className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm hover:border-[#FF5A36] transition relative flex flex-col justify-between min-h-[140px] cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-base font-bold text-[#1C1C1E] group-hover:text-[#FF5A36] transition">
                    {assignment.topic ? `Quiz on ${assignment.topic}` : `Quiz on ${assignment.subject}`}
                  </h4>
                  <span className="text-[10px] bg-[#F4F4F6] text-[#8E8E93] font-bold px-2 py-0.5 rounded-lg border border-[#E5E5EA] mt-2.5 inline-block">
                    {assignment.subject} · {assignment.grade}
                  </span>
                </div>

                {/* Context Menu Button */}
                <div className="relative">
                  <button
                    onClick={(e) => toggleMenu(assignment._id, e)}
                    className="w-7 h-7 hover:bg-[#F4F4F6] rounded-full text-[#8E8E93] hover:text-gray-900 transition flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {/* Dropdown Menu Popup */}
                  {activeMenuId === assignment._id && (
                    <div className="absolute right-0 mt-2 w-36 bg-white border border-[#E5E5EA] rounded-xl shadow-lg z-20 py-1.5 overflow-hidden">
                      <button
                        onClick={() => router.push(assignment.status === 'done' ? `/paper/${assignment._id}` : `/generating/${assignment._id}`)}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#F4F4F6] transition"
                      >
                        View Assignment
                      </button>
                      <button
                        onClick={(e) => handleDelete(assignment._id, e)}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition border-t border-[#E5E5EA]"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer row with status & dates */}
              <div className="mt-6 pt-3 border-t border-[#F4F4F6] flex items-center justify-between text-[10px] text-[#8E8E93] font-bold">
                <div>
                  <span className="font-semibold text-[#8E8E93]/70">Assigned on : </span>
                  <span className="text-[#2C2C2C]">{assignDate}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#8E8E93]/70">Due : </span>
                  <span className="text-[#2C2C2C]">{dueDate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Sticky Create Assignment Button (Screenshot 2) */}
      <div className="md:block hidden sticky bottom-4 left-1/2 -translate-x-1/2 max-w-xs mx-auto z-10">
        <Link
          href="/create"
          className="flex items-center justify-center space-x-2 bg-[#1C1C1E] hover:bg-black text-white py-2.5 px-6 rounded-full border border-[#FF5A36] font-bold text-xs shadow-md transition"
        >
          <span>+</span>
          <span>Create Assignment</span>
        </Link>
      </div>

    </div>
  );
}
