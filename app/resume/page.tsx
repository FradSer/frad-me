import type { Metadata } from 'next';

import ResumePageClient from './resume-page-client';

export const metadata: Metadata = {
  title: 'Resume - Frad Lee',
  description: 'Frad Lee - Product Designer & Developer Resume',
  openGraph: {
    title: 'Resume - Frad Lee',
    description: 'Frad Lee - Product Designer & Developer Resume',
  },
};

export default function ResumePage() {
  return <ResumePageClient />;
}
