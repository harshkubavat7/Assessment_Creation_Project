import { useEffect, useRef } from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { useRouter } from 'next/navigation';
import { getAssignment, getPaper } from '../lib/api';

export function useWebSocket(assignmentId: string | null) {
  const ws = useRef<WebSocket | null>(null);
  const { setJobStatus, setPaper, setError } = useAssignmentStore();
  const router = useRouter();

  useEffect(() => {
    if (!assignmentId) return;

    let wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      wsUrl = wsUrl.replace(/^ws:/i, 'wss:');
    }

    console.log(`Connecting to WebSocket: ${wsUrl}`);
    
    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onmessage = async (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.assignmentId !== assignmentId) return;

          if (msg.type === 'job_progress') {
            setJobStatus('processing', msg.step, msg.progress);
          }

          if (msg.type === 'paper_ready') {
            setJobStatus('done', 'complete', 100);
            const paperData = await getPaper(assignmentId);
            setPaper(paperData);
            router.push(`/paper/${assignmentId}`);
          }

          if (msg.type === 'job_error') {
            setError(msg.error || 'AI generation failed');
          }
        } catch (parseErr) {
          console.error('Error parsing WebSocket message:', parseErr);
        }
      };

      ws.current.onerror = (err) => {
        console.warn('WebSocket error encountered, falling back to polling.', err);
      };
    } catch (wsErr) {
      console.warn('Failed to initialize WebSocket client, falling back to polling.', wsErr);
    }

    // Polling fallback if WS disconnects or fails
    const interval = setInterval(async () => {
      try {
        const assignment = await getAssignment(assignmentId);
        if (assignment.status === 'processing') {
          // If websocket missed progress, update progress state
          setJobStatus('processing', 'ai_generating', 40);
        }
        if (assignment.status === 'done') {
          clearInterval(interval);
          setJobStatus('done', 'complete', 100);
          const paperData = await getPaper(assignmentId);
          setPaper(paperData);
          router.push(`/paper/${assignmentId}`);
        } else if (assignment.status === 'error') {
          clearInterval(interval);
          setError(assignment.errorMessage || 'AI generation failed');
        }
      } catch (err) {
        console.warn('Polling status fetch failed:', err);
      }
    }, 4000);

    return () => {
      ws.current?.close();
      clearInterval(interval);
    };
  }, [assignmentId, router, setJobStatus, setPaper, setError]);
}
