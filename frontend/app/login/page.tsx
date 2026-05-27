'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginTeacher } from '../../lib/api';
import { useAssignmentStore } from '../../store/useAssignmentStore';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setAuthStatus } = useAssignmentStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginTeacher({ email, password });
      setUser(response.user);
      setAuthStatus('authenticated');
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials or connection failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F6] flex flex-col justify-center items-center px-4 relative">
      {/* Background Graphic elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#FF5A36]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FF8C68]/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E5E5EA] shadow-xl space-y-6">
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5A36] to-[#FF8C68] flex items-center justify-center text-white font-extrabold text-3xl shadow-sm mb-4">
            V
          </div>
          <h2 className="text-xl font-bold text-gray-900">Sign in to VedaAI</h2>
          <p className="text-xs text-[#8E8E93] font-semibold mt-1">Access your AI assessment creation dashboard</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] focus:outline-none focus:border-[#FF5A36] focus:bg-white text-gray-900 transition font-medium"
              placeholder="e.g. teacher@dpsbokaro.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] focus:outline-none focus:border-[#FF5A36] focus:bg-white text-gray-900 transition font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#1C1C1E] hover:bg-black text-white rounded-xl border border-[#FF5A36] font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 mt-2"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer info link */}
        <div className="text-center text-xs text-[#8E8E93] font-semibold pt-2 border-t border-[#F4F4F6]">
          <span>New to VedaAI? </span>
          <Link href="/signup" className="text-[#FF5A36] hover:underline font-bold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
