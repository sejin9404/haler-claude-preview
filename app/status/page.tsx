import HalerQuiz from '@/components/status/HalerQuiz';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Check Your Status | haler',
  description: 'A personalized diagnostic journey to understand your respiratory environment and health.',
};

export default function StatusPage() {
  return (
    <main className="bg-slate-50 min-h-[100dvh]">
      <HalerQuiz isStandalone={true} />
    </main>
  );
}
