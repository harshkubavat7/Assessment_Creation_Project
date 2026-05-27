'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssignmentStore } from '../../../store/useAssignmentStore';
import { getAssignment, getPaper, regeneratePaper } from '../../../lib/api';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PaperPDF from '../../../components/PaperPDF';
import DifficultyBadge from '../../../components/DifficultyBadge';
import PaperHeader from '../../../components/PaperHeader';
import StudentInfoBlock from '../../../components/StudentInfoBlock';

export default function ExamPaperPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { paper, setPaper, resetJob, setJobStatus, user } = useAssignmentStore();
  const [assignment, setAssignment] = useState<any>(null);
  const [schoolName, setSchoolName] = useState(() => {
    if (user?.schoolName) {
      return `${user.schoolName}${user.schoolLocation ? `, ${user.schoolLocation}` : ''}`;
    }
    return 'Delhi Public School, Bokaro';
  });
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(!paper);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [includeAnswersInPrint, setIncludeAnswersInPrint] = useState(false);

  // Set mounted flag to safely render react-pdf client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update schoolName default dynamically when user finishes loading
  useEffect(() => {
    if (user?.schoolName) {
      setSchoolName(`${user.schoolName}${user.schoolLocation ? `, ${user.schoolLocation}` : ''}`);
    }
  }, [user]);

  // Fetch paper/assignment if missing from store (e.g. on page refresh)
  useEffect(() => {
    async function fetchData() {
      try {
        const assignmentData = await getAssignment(id);
        setAssignment(assignmentData);

        if (!paper) {
          const paperData = await getPaper(id);
          setPaper(paperData);
        }
      } catch (err) {
        console.error('Error fetching paper details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id, paper, setPaper]);

  const handleNew = () => {
    resetJob();
    router.push('/create');
  };

  const handleRegenerate = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      await regeneratePaper(id);
      setPaper(null);
      setJobStatus('pending', 'regenerating', 15);
      router.push(`/generating/${id}`);
    } catch (err) {
      console.error('Failed to regenerate paper:', err);
      setIsRegenerating(false);
    }
  };

  if (isLoading || !paper || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <span className="w-12 h-12 border-4 border-[#FF5A36] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 font-semibold">Loading your question paper...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F6] print:bg-white print:min-h-0 print:p-0 pb-16">
      
      {/* Action Bar (Hidden on print) */}
      <div className="bg-white border-b border-[#E5E5EA] shadow-sm sticky top-0 z-50 no-print print:hidden">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleNew}
              className="flex items-center space-x-1.5 px-3.5 py-2 border border-[#E5E5EA] rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>New Config</span>
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center space-x-1 px-3.5 py-2 border border-[#FF5A36]/20 bg-[#FF5A36]/5 rounded-xl text-xs font-bold text-[#FF5A36] hover:bg-[#FF5A36]/10 transition disabled:opacity-50"
            >
              {isRegenerating ? 'Queuing...' : 'Regenerate'}
            </button>
          </div>

          {/* Interactive controls */}
          <div className="flex items-center space-x-3 flex-1 justify-end max-w-2xl">
            {/* School Name editor */}
            <input
              type="text"
              className="px-3.5 py-2 border border-[#E5E5EA] rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#FF5A36] w-48 font-bold bg-[#F4F4F6] focus:bg-white transition"
              placeholder="Edit School Name"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
            />

            {/* Answer key checkbox print toggle */}
            <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAnswersInPrint}
                onChange={(e) => setIncludeAnswersInPrint(e.target.checked)}
                className="w-4 h-4 accent-[#FF5A36] rounded border-[#E5E5EA] cursor-pointer"
              />
              <span>Print with Answers</span>
            </label>

            {/* Dynamic PDF Download Link */}
            {isMounted ? (
              <PDFDownloadLink
                document={<PaperPDF paper={paper} meta={{ ...assignment, schoolName }} includeAnswers={includeAnswersInPrint} />}
                fileName={`${assignment.subject.replace(/\s+/g, '_')}_Exam_Paper.pdf`}
                className="px-5 py-2 bg-[#1C1C1E] hover:bg-black text-white rounded-full text-xs font-bold shadow-sm transition border border-[#FF5A36]"
              >
                {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
              </PDFDownloadLink>
            ) : (
              <button className="px-5 py-2 bg-gray-200 text-gray-400 rounded-full text-xs font-bold cursor-not-allowed">
                Loading PDF...
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Exam Paper Canvas */}
      <main className="max-w-4xl mx-auto px-4 py-8 print:py-0 print:px-0">
        <div className="bg-white p-12 sm:p-16 rounded-3xl shadow-sm border border-[#E5E5EA] print:border-none print:shadow-none print:p-0 relative">
          
          {/* Header */}
          <PaperHeader
            schoolName={schoolName}
            subject={assignment.subject}
            grade={assignment.grade}
            totalMarks={assignment.totalMarks}
            topic={assignment.topic}
          />

          {/* Student details */}
          <StudentInfoBlock />

          {/* Sections list */}
          <div className="space-y-10 mt-8">
            {paper.sections.map((sec, si) => (
              <section key={si} className="break-inside-avoid">
                <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-2 mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20">
                      {sec.title}
                    </span>
                    <span className="text-xs font-bold text-gray-900">{sec.type}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#8E8E93] italic">
                    Attempt all questions.
                  </span>
                </div>
                
                {sec.instruction && (
                  <p className="text-[10px] text-[#8E8E93] italic mb-6">
                    {sec.instruction}
                  </p>
                )}

                <div className="space-y-6">
                  {sec.questions.map((q, qi) => (
                    <div key={qi} className="flex items-start space-x-4 pl-1 break-inside-avoid">
                      <span className="text-xs font-bold text-gray-800 mt-0.5">
                        {qi + 1}.
                      </span>
                      <div className="flex-grow space-y-3">
                        <p className="text-xs text-gray-900 leading-relaxed font-bold">
                          {q.text}
                        </p>

                        {/* MCQ options */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 mt-2">
                            {q.options.map((o, oi) => (
                              <div key={oi} className="text-xs text-gray-700 font-semibold">
                                {o}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Marks & Difficulty badging (hidden on print) */}
                        <div className="flex items-center space-x-3 pt-1 no-print print:hidden">
                          <DifficultyBadge level={q.difficulty} />
                          <span className="text-[10px] font-bold text-[#8E8E93] bg-[#F4F4F6] px-2 py-0.5 rounded-lg border border-[#E5E5EA]">
                            {q.marks} mark{q.marks > 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {/* Printed marks indicator (visible on print only) */}
                        <div className="hidden print:block text-right text-[10px] font-bold text-gray-800">
                          [{q.marks} Mark{q.marks > 1 ? 's' : ''}]
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Answer Key Block (Screenshot 4) */}
          <div className={`mt-16 pt-8 border-t border-dashed border-[#E5E5EA] break-inside-avoid ${!includeAnswersInPrint ? 'no-print' : ''}`}>
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
              <svg className="w-4 h-4 text-[#FF5A36]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Answer Key
            </h3>

            <div className="space-y-6 bg-[#F4F4F6]/50 p-6 rounded-2xl border border-[#E5E5EA]">
              {paper.sections.map((sec, si) => (
                <div key={si} className="space-y-3">
                  <div className="text-xs font-bold text-gray-800 border-b border-[#E5E5EA] pb-1">
                    {sec.title} — {sec.type}
                  </div>
                  <div className="space-y-2 pl-2">
                    {sec.questions.map((q, qi) => (
                      <div key={qi} className="text-xs text-gray-700 leading-relaxed font-semibold">
                        <span className="font-bold text-gray-900 mr-2">{qi + 1}.</span>
                        {q.answer || 'No answer key provided for this question.'}
                        <span className="text-[10px] text-[#8E8E93] ml-2 font-normal">({q.difficulty})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exam bottom notice */}
          <div className="mt-16 pt-6 border-t border-[#E5E5EA] text-center text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider">
            Generated by VedaAI · Review before distribution
          </div>

        </div>
      </main>
    </div>
  );
}
