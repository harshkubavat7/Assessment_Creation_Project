'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { getDashboardStats } from '../../lib/api';

export default function HomeDashboardPage() {
  const { user } = useAssignmentStore();
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeGroups: 0,
    pendingGenerations: 0,
    aiCreditsUsed: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await getDashboardStats();
        setStats(data.stats);
        setActivities(data.activities);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const emailPrefix = user?.email ? user.email.split('@')[0] : 'Teacher';
  const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <span className="w-10 h-10 border-4 border-[#FF5A36] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#8E8E93] font-semibold">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1C1C1E] to-[#2C2C2E] p-6 md:p-8 rounded-3xl text-white border border-[#FF5A36]/20 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center">
          <svg className="w-48 h-48 text-[#FF5A36]" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        </div>
        <div className="max-w-xl space-y-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Welcome back, {displayName}!</h2>
          <p className="text-xs text-[#8E8E93] leading-relaxed font-semibold">
            Manage your classes, schedule assessments, and leverage VedaAI tools to auto-generate customized exams and grading rubrics.
          </p>
          <div className="pt-2">
            <Link
              href="/create"
              className="inline-flex items-center bg-[#FF5A36] hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Create New Exam</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { 
            label: 'Total Assignments', 
            val: stats.totalAssignments.toString(), 
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ), 
            color: 'bg-orange-50 text-[#FF5A36] border-orange-100' 
          },
          { 
            label: 'Active Groups', 
            val: stats.activeGroups.toString(), 
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ), 
            color: 'bg-blue-50 text-blue-600 border-blue-100' 
          },
          { 
            label: 'Generations Pending', 
            val: stats.pendingGenerations.toString(), 
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ), 
            color: 'bg-amber-50 text-amber-600 border-amber-100' 
          },
          { 
            label: 'AI Credits Used', 
            val: stats.aiCreditsUsed.toString(), 
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ), 
            color: 'bg-green-50 text-green-600 border-green-100' 
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm flex flex-col justify-between min-h-[110px]">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">{stat.label}</span>
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border ${stat.color}`}>
                {stat.icon}
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-900 mt-2">{stat.val}</span>
          </div>
        ))}
      </div>

      {/* Layout Split: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Recent Activity List */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-sm md:col-span-2 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Activity</h3>
            <p className="text-[10px] text-[#8E8E93] font-semibold">Updates from your VedaAI classroom logs</p>
          </div>
          <div className="divide-y divide-[#F4F4F6] text-xs">
            {activities.map((act, i) => (
              <div key={i} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start space-x-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A36] mt-1.5 shrink-0" />
                  <span className="font-semibold text-gray-700 leading-relaxed">{act.text}</span>
                </div>
                <span className="text-[9px] text-[#8E8E93] font-bold shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tools Panel */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5E5EA] shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Quick Tools</h3>
            <p className="text-[10px] text-[#8E8E93] font-semibold">Fast shortcut tools for teachers</p>
          </div>
          <div className="space-y-3 pt-1">
            {[
              { title: "Open AI Toolkit", path: "/toolkit", desc: "Access lesson planners & grading helpers" },
              { title: "Browse Library", path: "/library", desc: "Re-use previously generated assessments" },
              { title: "Classroom Groups", path: "/groups", desc: "Manage student rosters & departments" }
            ].map((tool, i) => (
              <Link
                key={i}
                href={tool.path}
                className="block p-3 rounded-2xl bg-[#F4F4F6] hover:bg-[#FF5A36]/5 hover:border-[#FF5A36]/20 border border-[#E5E5EA] transition text-left group"
              >
                <div className="text-xs font-bold text-gray-900 group-hover:text-[#FF5A36] transition">{tool.title}</div>
                <div className="text-[9px] text-[#8E8E93] font-semibold mt-0.5">{tool.desc}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
