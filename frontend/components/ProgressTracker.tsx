import React from 'react';

interface ProgressTrackerProps {
  progress: number;
  currentStep: string;
  errorMessage?: string;
}

export function ProgressTracker({ progress, currentStep, errorMessage }: ProgressTrackerProps) {
  // Steps matching checklist
  const steps = [
    { id: 'validate', label: 'Validating assignment config' },
    { id: 'queue', label: 'Queuing background job (BullMQ)' },
    { id: 'ai', label: 'AI generating structured questions' },
    { id: 'parse', label: 'Parsing & validating output' },
    { id: 'db', label: 'Saving to database' },
    { id: 'ws', label: 'WebSocket: notifying client' },
  ];

  // Determine completion of steps based on backend progress
  const getStepStatus = (stepId: string) => {
    if (errorMessage) return 'error';
    
    switch (stepId) {
      case 'validate':
        return 'done'; // Completed on submission
      case 'queue':
        return 'done'; // Enqueued once we load this page
      case 'ai':
        if (progress >= 70 || currentStep === 'parsing' || currentStep === 'complete') return 'done';
        if (progress >= 40 || currentStep === 'ai_generating') return 'processing';
        return 'pending';
      case 'parse':
        if (currentStep === 'complete' || progress === 100) return 'done';
        if (currentStep === 'parsing' || progress >= 70) return 'processing';
        return 'pending';
      case 'db':
        if (currentStep === 'complete' || progress === 100) return 'done';
        if (currentStep === 'parsing' && progress >= 75) return 'processing';
        return 'pending';
      case 'ws':
        if (currentStep === 'complete' || progress === 100) return 'done';
        return 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Visual Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-500 to-[#7F77DD] p-8 text-center text-white relative">
        <div className="absolute inset-0 bg-black opacity-10" />
        
        {/* Animated Custom Spinner */}
        {!errorMessage && progress < 100 ? (
          <div className="inline-flex relative mb-4 items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-white border-t-transparent animate-spin" />
            <div className="absolute text-xs font-bold">{Math.round(progress)}%</div>
          </div>
        ) : errorMessage ? (
          <div className="inline-flex mb-4 items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 border border-red-200">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ) : (
          <div className="inline-flex mb-4 items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 border border-green-200">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        <h2 className="text-xl font-bold tracking-tight mb-1 relative z-10">
          {errorMessage ? 'Generation Failed' : progress === 100 ? 'Paper Generated!' : 'Generating your question paper...'}
        </h2>
        <p className="text-sm text-indigo-100 relative z-10">
          {errorMessage ? 'An error was encountered during the process' : 'Please wait while VedaAI constructs your paper'}
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="p-8">
        <div className="w-full bg-gray-100 rounded-full h-3 mb-8 overflow-hidden relative border border-gray-200/50">
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${
              errorMessage ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-[#7F77DD]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps Checklist */}
        <div className="space-y-4">
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex items-center justify-between py-1 transition-all duration-300">
                <div className="flex items-center space-x-3.5">
                  {status === 'done' ? (
                    <span className="flex-shrink-0 w-5.5 h-5.5 rounded-full bg-green-100 text-green-600 flex items-center justify-center border border-green-200">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : status === 'processing' ? (
                    <span className="flex-shrink-0 w-5.5 h-5.5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  ) : status === 'error' ? (
                    <span className="flex-shrink-0 w-5.5 h-5.5 rounded-full bg-red-100 text-red-600 flex items-center justify-center border border-red-200">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  ) : (
                    <span className="flex-shrink-0 w-5.5 h-5.5 rounded-full border-2 border-gray-200 bg-white" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      status === 'done'
                        ? 'text-gray-900 font-semibold'
                        : status === 'processing'
                        ? 'text-indigo-600 font-semibold'
                        : status === 'error'
                        ? 'text-red-500 font-medium'
                        : 'text-gray-400 font-normal'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {status === 'done' && (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200 uppercase tracking-wider">
                    Success
                  </span>
                )}
                {status === 'processing' && (
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 uppercase tracking-wider animate-pulse">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}
      </div>
    </div>
  );
}
export default ProgressTracker;
