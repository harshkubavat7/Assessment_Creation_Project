'use client';

import React, { useEffect, useState } from 'react';
import { getGroups, createGroup, deleteGroup } from '../../lib/api';

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Secondary Wing');
  const [students, setStudents] = useState('0');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      const data = await getGroups();
      setGroups(data);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('Group name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createGroup({
        name: name.trim(),
        department,
        students: Number(students) || 0
      });
      
      // Reset form & close modal
      setName('');
      setDepartment('Secondary Wing');
      setStudents('0');
      setIsModalOpen(false);
      
      // Refresh list
      fetchGroups();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.error || 'Failed to create student group.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(id);
        fetchGroups();
      } catch (err) {
        console.error('Failed to delete group:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <span className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#8E8E93] font-semibold">Loading groups...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            My Groups
          </h2>
          <p className="text-xs text-[#8E8E93] font-semibold mt-1">Manage student cohorts, classes, and grade levels.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1 bg-[#1C1C1E] text-white hover:bg-black py-2.5 px-4 rounded-xl border border-[#FF5A36] text-xs font-bold transition shadow-sm"
        >
          <span>+</span>
          <span>Add New Group</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] bg-white border border-[#E5E5EA] rounded-3xl p-8 text-center shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4 border border-blue-100">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">No groups yet</h3>
          <p className="text-xs text-[#8E8E93] max-w-xs mb-4 font-medium">Create your first class cohort to organize students and map assignments.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#1C1C1E] hover:bg-black text-white text-xs font-bold rounded-xl border border-[#FF5A36] transition shadow-sm"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {groups.map((group) => (
            <div key={group._id} className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm flex flex-col justify-between min-h-[140px] hover:border-[#FF5A36] transition relative group">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{group.name}</h4>
                  <span className="text-[10px] text-[#8E8E93] bg-[#F4F4F6] px-2 py-0.5 rounded-lg border border-[#E5E5EA] mt-1.5 inline-block font-bold">
                    {group.department}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold text-[#FF5A36] bg-[#FF5A36]/10 px-2 py-0.5 rounded-full border border-[#FF5A36]/10">
                    Avg: {group.average}
                  </span>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={(e) => handleDelete(group._id, e)}
                    className="text-[#8E8E93] hover:text-red-500 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50 transition"
                    title="Delete group"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-[#F4F4F6] pt-3 mt-4 text-[10px] text-[#8E8E93] font-bold">
                <span>{group.students} Registered Students</span>
                <span className="text-[10px] text-[#8E8E93]">Created on {new Date(group.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 md:p-8 border border-[#E5E5EA] shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Add Student Group</h3>
                <p className="text-[10px] text-[#8E8E93] font-semibold">Create a new class roster or cohort</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 bg-[#F4F4F6] hover:bg-[#E9E9EB] rounded-full text-[#8E8E93] hover:text-gray-900 transition flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Group / Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 8 - Science, Grade 12 - Physics"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] focus:outline-none focus:border-[#FF5A36] focus:bg-white text-gray-900 transition font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Department / Wing</label>
                <select
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] focus:outline-none focus:border-[#FF5A36] focus:bg-white text-gray-900 transition font-bold"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="Primary Wing">Primary Wing</option>
                  <option value="Junior Wing">Junior Wing</option>
                  <option value="Secondary Wing">Secondary Wing</option>
                  <option value="Senior Wing">Senior Wing</option>
                  <option value="Science Wing">Science Wing</option>
                  <option value="Arts Wing">Arts Wing</option>
                  <option value="Commerce Wing">Commerce Wing</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Number of Students</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 25"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] focus:outline-none focus:border-[#FF5A36] focus:bg-white text-gray-900 transition font-medium"
                  value={students}
                  onChange={(e) => setStudents(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#F4F4F6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#F4F4F6] hover:bg-[#E9E9EB] text-gray-700 text-xs font-semibold rounded-xl transition"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1C1C1E] hover:bg-black text-white text-xs font-bold rounded-xl border border-[#FF5A36] transition shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
