import React from 'react';

interface PaperHeaderProps {
  schoolName: string;
  subject: string;
  grade: string;
  totalMarks: number;
  topic: string;
}

export function PaperHeader({ schoolName, subject, grade, totalMarks, topic }: PaperHeaderProps) {
  return (
    <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
      <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">
        {schoolName || 'Academic Assessment'}
      </h1>
      <div className="mt-3 flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-gray-700 font-medium">
        <div>
          <span className="text-gray-500 font-normal">Subject:</span> {subject}
        </div>
        <div>
          <span className="text-gray-500 font-normal">Class:</span> {grade}
        </div>
        {topic && (
          <div>
            <span className="text-gray-500 font-normal">Topic:</span> {topic}
          </div>
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-gray-700 font-medium">
        <div>
          <span className="text-gray-500 font-normal">Max Marks:</span> {totalMarks}
        </div>
        <div>
          <span className="text-gray-500 font-normal">Duration:</span> 3 Hours
        </div>
      </div>
    </div>
  );
}
export default PaperHeader;
