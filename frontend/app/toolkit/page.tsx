'use client';

import React, { useState } from 'react';
import { generateToolkitItem } from '../../lib/api';

export default function ToolkitPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [outputData, setOutputData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('Grade 8');
  const [totalMarks, setTotalMarks] = useState('20');
  const [durationDays, setDurationDays] = useState('3');
  const [studentName, setStudentName] = useState('');
  const [performance, setPerformance] = useState('Excellent');
  const [keywords, setKeywords] = useState('');

  const tools = [
    { 
      id: 'rubric',
      title: 'Rubric Generator', 
      desc: 'Auto-construct evaluation rubrics based on assignment criteria and marks.', 
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ), 
      ready: true 
    },
    { 
      id: 'lessonPlan',
      title: 'Lesson Planner', 
      desc: 'Create day-by-day curriculum schedules and classroom action plans.', 
      icon: (
        <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ), 
      ready: true 
    },
    { 
      id: 'reportCard',
      title: 'Report Card Helper', 
      desc: 'Draft constructive, personalized comments for student assessment profiles.', 
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ), 
      ready: true 
    },
    { 
      id: 'worksheet',
      title: 'Worksheet Builder', 
      desc: 'Build customizable homework templates from reference topics.', 
      icon: (
        <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ), 
      ready: false 
    }
  ];

  const handleLaunch = (toolId: string) => {
    setActiveTool(toolId);
    setOutputData(null);
    setErrorMsg('');
    // Clear forms
    setTopic('');
    setStudentName('');
    setKeywords('');
  };

  const handleBack = () => {
    setActiveTool(null);
    setOutputData(null);
    setErrorMsg('');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    let payload: any = {};
    if (activeTool === 'rubric') {
      if (!topic.trim()) {
        setErrorMsg('Assignment topic is required.');
        setIsLoading(false);
        return;
      }
      payload = { topic: topic.trim(), grade, totalMarks: Number(totalMarks) || 20 };
    } else if (activeTool === 'lessonPlan') {
      if (!topic.trim()) {
        setErrorMsg('Lesson topic is required.');
        setIsLoading(false);
        return;
      }
      payload = { topic: topic.trim(), grade, durationDays: Number(durationDays) || 3 };
    } else if (activeTool === 'reportCard') {
      if (!studentName.trim()) {
        setErrorMsg('Student name is required.');
        setIsLoading(false);
        return;
      }
      payload = { studentName: studentName.trim(), grade, performance, keywords: keywords.trim() };
    }

    try {
      const result = await generateToolkitItem(activeTool!, payload);
      if (result.success) {
        setOutputData(result.data);
      } else {
        setErrorMsg('Failed to generate results.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'AI generation request failed. Verify your server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard successfully!');
  };

  // 1. Tool Selection View
  if (activeTool === null) {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5A36]" />
            {"AI Teacher's Toolkit"}
          </h2>
          <p className="text-xs text-[#8E8E93] font-semibold mt-1">Utilize intelligent models to streamline lesson planning and student evaluation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tools.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm flex flex-col justify-between min-h-[150px] hover:border-[#FF5A36] transition relative group">
              <div>
                <div className="flex items-center space-x-3">
                  {t.icon}
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#FF5A36] transition">{t.title}</h4>
                </div>
                <p className="text-xs text-[#8E8E93] mt-2.5 leading-relaxed font-semibold">{t.desc}</p>
              </div>

              <div className="flex justify-between items-center border-t border-[#F4F4F6] pt-3 mt-4 text-[10px] text-[#8E8E93] font-bold">
                {t.ready ? (
                  <span className="text-[#34C759]">Ready to Use</span>
                ) : (
                  <span className="text-[#8E8E93]/60">Beta Wing</span>
                )}
                
                {t.ready ? (
                  <button 
                    onClick={() => handleLaunch(t.id)}
                    className="text-xs text-[#FF5A36] hover:text-orange-600 transition flex items-center space-x-1 font-bold"
                  >
                    <span>Launch Workspace</span>
                    <span>→</span>
                  </button>
                ) : (
                  <span className="text-xs text-gray-300 font-semibold cursor-not-allowed">Coming Soon</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Selected Tool Workspace View
  const selectedToolObj = tools.find(t => t.id === activeTool);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Workspace Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-4 flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleBack}
            className="w-8 h-8 bg-white border border-[#E5E5EA] text-[#8E8E93] hover:text-gray-900 transition flex items-center justify-center rounded-full shadow-sm"
          >
            ←
          </button>
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
              {selectedToolObj?.icon}
              {selectedToolObj?.title}
            </h2>
            <p className="text-[10px] text-[#8E8E93] font-semibold mt-0.5">{selectedToolObj?.desc}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Parameters Input Form */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E5EA] shadow-sm lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Configure Parameters</h3>
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            
            {/* Rubric Generator Inputs */}
            {activeTool === 'rubric' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Assignment Topic *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Persuasive Essay on Climate"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] text-gray-900 focus:outline-none focus:border-[#FF5A36] focus:bg-white transition"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Grade Level</label>
                  <select 
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] text-gray-900 focus:outline-none focus:border-[#FF5A36] focus:bg-white transition"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="Undergraduate">Undergraduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Total Marks</label>
                  <input 
                    type="number" 
                    min="5" 
                    max="100"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] text-gray-900 focus:outline-none focus:border-[#FF5A36] focus:bg-white transition"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Lesson Planner Inputs */}
            {activeTool === 'lessonPlan' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Lesson Topic *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Introduction to Friction"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] text-gray-900 focus:outline-none focus:border-[#FF5A36] focus:bg-white transition"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Grade Level</label>
                  <select 
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] text-gray-900 focus:outline-none focus:border-[#FF5A36] focus:bg-white transition"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Duration (Days)</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] text-gray-900 focus:outline-none focus:border-[#FF5A36] focus:bg-white transition"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Report Card Helper Inputs */}
            {activeTool === 'reportCard' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Student Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rahul Kumar"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] text-gray-900 focus:outline-none focus:border-[#FF5A36] focus:bg-white transition"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Performance Rank</label>
                  <select 
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] text-gray-900 focus:outline-none focus:border-[#FF5A36] focus:bg-white transition"
                    value={performance}
                    onChange={(e) => setPerformance(e.target.value)}
                  >
                    <option value="Excellent">Excellent (A Grade)</option>
                    <option value="Proficient">Proficient (B Grade)</option>
                    <option value="Needs Improvement">Needs Improvement (C/D Grade)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-600 mb-1.5">Strengths & Keywords</label>
                  <input 
                    type="text" 
                    placeholder="e.g. participation, logical reasoning, neatness"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] text-gray-900 focus:outline-none focus:border-[#FF5A36] focus:bg-white transition"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-[#1C1C1E] hover:bg-black text-white text-xs font-bold rounded-xl border border-[#FF5A36] transition shadow-md flex items-center justify-center space-x-1.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <span>Generate with AI</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Generated Output Preview Canvas */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-sm min-h-[350px] flex flex-col justify-between">
          
          {/* Header Actions */}
          <div className="flex justify-between items-center border-b border-[#F4F4F6] pb-3.5 mb-4">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">AI Generated Preview</h3>
            {outputData && (
              <button 
                onClick={() => handleCopyToClipboard(
                  activeTool === 'reportCard' ? outputData.comment : JSON.stringify(outputData, null, 2)
                )}
                className="text-[10px] font-bold text-[#FF5A36] hover:bg-orange-50 px-3 py-1.5 border border-[#FF5A36]/30 rounded-lg transition"
              >
                Copy Content
              </button>
            )}
          </div>

          {/* Body Loading/Empty/Content States */}
          <div className="flex-grow flex flex-col">
            {isLoading && (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-12">
                <span className="w-9 h-9 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-[#8E8E93]">VedaAI is building your materials...</p>
              </div>
            )}

            {!isLoading && !outputData && (
              <div className="flex-grow flex flex-col items-center justify-center text-center py-12 text-[#8E8E93] font-medium text-xs">
                <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span>Provide parameters on the left and click &quot;Generate&quot; to construct AI templates.</span>
              </div>
            )}

            {/* Rubric Output Render */}
            {!isLoading && outputData && activeTool === 'rubric' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800">{outputData.title}</h4>
                <div className="border border-[#E5E5EA] rounded-xl overflow-hidden shadow-xs bg-white text-left">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-[#F4F4F6] border-b border-[#E5E5EA] text-gray-700 font-bold uppercase">
                          <th className="py-2.5 px-3 w-1/4 border-r border-[#E5E5EA]">Criterion</th>
                          <th className="py-2.5 px-2 w-1/6 border-r border-[#E5E5EA]">Exemplary</th>
                          <th className="py-2.5 px-2 w-1/6 border-r border-[#E5E5EA]">Proficient</th>
                          <th className="py-2.5 px-2 w-1/6 border-r border-[#E5E5EA]">Developing</th>
                          <th className="py-2.5 px-2 w-1/6">Beginning</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {outputData.criteria.map((c: any, ci: number) => (
                          <tr key={ci} className="hover:bg-[#F9F9FB] transition font-semibold text-gray-700">
                            <td className="py-2.5 px-3 border-r border-[#E5E5EA] bg-[#F9F9FB] font-bold">
                              {c.name}
                              <span className="block text-[8px] text-[#FF5A36] mt-0.5">({c.maxMarks} marks max)</span>
                            </td>
                            <td className="py-2.5 px-2 border-r border-[#E5E5EA] text-gray-600 leading-normal">{c.achievementLevels.Exemplary}</td>
                            <td className="py-2.5 px-2 border-r border-[#E5E5EA] text-gray-600 leading-normal">{c.achievementLevels.Proficient}</td>
                            <td className="py-2.5 px-2 border-r border-[#E5E5EA] text-gray-600 leading-normal">{c.achievementLevels.Developing}</td>
                            <td className="py-2.5 px-2 text-gray-600 leading-normal">{c.achievementLevels.Beginning}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Lesson Plan Output Render */}
            {!isLoading && outputData && activeTool === 'lessonPlan' && (
              <div className="space-y-4 text-left">
                <h4 className="text-sm font-bold text-gray-800">{outputData.title}</h4>
                
                {/* Objectives */}
                <div className="bg-[#F4F4F6] p-4 rounded-xl border border-[#E5E5EA] space-y-2">
                  <div className="text-[10px] font-bold uppercase text-[#8E8E93] tracking-wider">Objectives roadmap</div>
                  <ul className="list-disc pl-4 text-xs font-semibold text-gray-700 space-y-1">
                    {outputData.objectives.map((o: string, oi: number) => (
                      <li key={oi}>{o}</li>
                    ))}
                  </ul>
                </div>

                {/* Day Blocks */}
                <div className="space-y-3.5 mt-2 max-h-[350px] overflow-y-auto pr-1">
                  {outputData.days.map((d: any, di: number) => (
                    <div key={di} className="p-4 bg-white border border-[#E5E5EA] rounded-xl shadow-xs space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-800">
                        <span>Day {d.day}</span>
                        <span className="text-[9px] bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-md font-bold uppercase">{d.title}</span>
                      </div>
                      <div className="text-[10px] text-gray-600 font-semibold space-y-1 mt-2.5">
                        <span className="font-bold text-gray-800 block text-[9px] uppercase tracking-wide text-gray-500">Activities :</span>
                        {d.activities.map((act: string, ai: number) => (
                          <div key={ai} className="pl-2 flex items-start space-x-1.5">
                            <span className="text-[#FF5A36] mt-0.5">•</span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-gray-600 font-semibold pt-1 border-t border-[#F4F4F6] mt-2">
                        <span className="font-bold text-gray-800">Homework : </span>
                        <span>{d.homework}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Card Output Render */}
            {!isLoading && outputData && activeTool === 'reportCard' && (
              <div className="space-y-4 text-left flex-grow flex flex-col justify-center max-w-xl mx-auto py-4">
                <div className="flex items-center space-x-2.5 border-b border-[#F4F4F6] pb-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">
                    {outputData.studentName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{outputData.studentName}</div>
                    <div className="text-[9px] font-bold text-[#8E8E93] uppercase">Rank descriptor: {outputData.performance}</div>
                  </div>
                </div>
                <div className="bg-[#F4F4F6]/75 p-5 rounded-2xl border border-[#E5E5EA] text-xs font-semibold text-gray-700 leading-relaxed italic shadow-xs">
                  &ldquo;{outputData.comment}&rdquo;
                </div>
              </div>
            )}

          </div>

          {/* Footer branding */}
          <div className="mt-6 pt-3.5 border-t border-[#F4F4F6] text-center text-[9px] font-bold text-[#8E8E93] uppercase tracking-wider">
            Powered by VedaAI Intelligent Engine
          </div>
        </div>

      </div>
    </div>
  );
}
