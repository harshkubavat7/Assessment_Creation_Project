import React from 'react';

const styles = {
  Easy: 'bg-green-50 text-green-800 border-green-300',
  Medium: 'bg-amber-50 text-amber-800 border-amber-300',
  Hard: 'bg-red-50 text-red-800 border-red-300',
};

export function DifficultyBadge({ level }: { level: 'Easy' | 'Medium' | 'Hard' }) {
  const styleClass = styles[level] || 'bg-gray-50 text-gray-800 border-gray-300';
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styleClass}`}>
      {level}
    </span>
  );
}
export default DifficultyBadge;
