import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WebMCP Integration - Frad Lee',
  description:
    "WebMCP agent integration demo for Frad Lee's portfolio. Explore AI-powered navigation and project discovery.",
  openGraph: {
    title: 'WebMCP Integration - Frad Lee',
    description:
      "WebMCP agent integration demo for Frad Lee's portfolio. Explore AI-powered navigation and project discovery.",
  },
};

export default function WebMCPLayout({ children }: { children: React.ReactNode }) {
  return children;
}
