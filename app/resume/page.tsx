import type { Metadata } from 'next';

import resumeData from '@/content/resume';
import ResumePageClient from './resume-page-client';

export const metadata: Metadata = {
  title: 'Resume - Frad Lee',
  description: `${resumeData.name} — ${resumeData.title}`,
  openGraph: {
    title: 'Resume - Frad Lee',
    description: `${resumeData.name} — ${resumeData.title}`,
  },
};

export default function ResumePage() {
  return <ResumePageClient />;
}
