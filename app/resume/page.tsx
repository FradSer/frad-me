import type { Metadata } from 'next';

import resumeData from '@/content/resume';
import ResumePageClient from './resume-page-client';

export const metadata: Metadata = {
  title: 'Resume - Frad Lee',
  description: resumeData.summary,
  alternates: { canonical: '/resume' },
  openGraph: {
    title: 'Resume - Frad Lee',
    description: resumeData.summary,
    url: '/resume',
  },
};

export default function ResumePage() {
  return <ResumePageClient />;
}
