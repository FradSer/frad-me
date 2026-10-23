'use client';

import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import resumeData from '@/content/resume';
import { GRID_CLASSES } from '@/utils/constants';

const gridClass = GRID_CLASSES.container;

type ContactKey = keyof typeof resumeData.contact;

const CONTACT_COLUMNS = [
  ['email', 'website'],
  ['github', 'twitter', 'huggingface'],
] as const satisfies readonly (readonly ContactKey[])[];

const CONTACT_LABELS: Record<ContactKey, string> = {
  email: 'Email',
  website: 'Website',
  github: 'GitHub',
  twitter: 'X (Twitter)',
  huggingface: 'Hugging Face',
};

function contactHref(key: ContactKey): string {
  const value = resumeData.contact[key];
  return key === 'email' ? `mailto:${value}` : value;
}

function contactDisplay(key: ContactKey): string {
  const value = resumeData.contact[key];
  if (key === 'email' || key === 'website') return value.replace(/^https?:\/\//, '');
  return `@${value.split('/').filter(Boolean).at(-1)}`;
}

// Function to calculate work duration
function calculateWorkDuration(startDate: string, endDate: string | undefined, now: Date): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : now;

  const diffInMs = end.getTime() - start.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  const years = Math.floor(diffInDays / 365);
  const months = Math.floor((diffInDays % 365) / 30);

  if (years > 0 && months > 0) {
    return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
  } else if (years > 0) {
    return `${years} yr${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `${months} mo${months > 1 ? 's' : ''}`;
  } else {
    return 'Less than 1 month';
  }
}

interface ResumeSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const SECTION_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99] as const,
    },
  },
};

function ResumeSection({ title, children, className }: ResumeSectionProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      variants={SECTION_VARIANTS}
      viewport={{ once: true }}
      className={clsx('layout-wrapper py-16 md:py-20', className)}
    >
      <div className={gridClass}>
        <div className={clsx(GRID_CLASSES.fullWidth, 'md:col-span-4 mb-8 md:mb-0')}>
          <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white">{title}</h2>
        </div>
        <div className={clsx(GRID_CLASSES.fullWidth, 'md:col-span-12')}>{children}</div>
      </div>
    </motion.section>
  );
}

interface ExperienceItemProps {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description: string[];
}

function ExperienceItem({
  title,
  company,
  startDate,
  endDate,
  description,
  location,
}: ExperienceItemProps) {
  // Reading the current time during render would make prerendering unstable,
  // so ongoing durations are appended after mount.
  const [duration, setDuration] = useState<string>();
  useEffect(() => {
    setDuration(calculateWorkDuration(startDate, endDate, new Date()));
  }, [startDate, endDate]);
  const isOngoing = !endDate;

  // Format period display
  const startMonth = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  const endMonth = isOngoing
    ? 'Present'
    : new Date(endDate).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
  const period = duration
    ? `${startMonth} - ${endMonth} · ${duration}`
    : `${startMonth} - ${endMonth}`;

  return (
    <div className="mb-8">
      <div className="mb-2">
        <h3 className="text-xl font-semibold text-black dark:text-white">{title}</h3>
        <p className="text-lg text-gray-600 dark:text-gray-300">{company}</p>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{period}</p>
          {location && <p className="text-sm text-gray-500 dark:text-gray-400">{location}</p>}
        </div>
      </div>
      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
        {description.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

interface SkillCategoryProps {
  category: string;
  skills: string[];
}

function SkillCategory({ category, skills }: SkillCategoryProps) {
  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-black dark:text-white mb-2">{category}</h4>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ResumePageClient() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="layout-wrapper pt-32 pb-20 md:pt-48 md:pb-32">
        <div className={gridClass}>
          <div className={GRID_CLASSES.fullWidth}>
            {/* Name with enhanced typography */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold text-black dark:text-white mb-2 tracking-tight">
                {resumeData.name}
              </h1>
              <div className="w-24 h-1 bg-white dark:bg-white mb-6"></div>
            </div>

            {/* Title with better styling */}
            <div className="mb-12">
              <p className="text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-300 mb-4">
                {resumeData.title}
              </p>
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-light">
                10+ years creating meaningful products at the crossroads of AI and UX
              </p>
            </div>

            {/* Bio with better typography */}
            <div className="max-w-4xl">
              <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-light mb-4">
                A "T-shaped" product expert with 10+ years bridging AI system architecture and
                interaction design. I transform complex technical challenges into intuitive user
                experiences, combining strategic vision with hands-on execution across the entire
                product lifecycle.
              </p>

              <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-light mb-4">
                Currently pioneering{' '}
                <a
                  href="https://github.com/FradSer/mcp-server-mas-sequential-thinking"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Multi-Agent Systems
                </a>{' '}
                and{' '}
                <a
                  href="https://github.com/FradSer?tab=repositories&q=mcp-server&type=&language=&sort="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  MCP server development
                </a>
                , driving AI implementation in production environments. My research in spatial
                computing and XR interfaces focuses on creating{' '}
                <a
                  href="https://github.com/FradSer/FluidInterfacesSwiftUI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  natural interactive
                </a>{' '}
                experiences that feel effortless and intuitive.
              </p>

              <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-light mb-4">
                Full-stack creator building across platforms: from{' '}
                <a
                  href="https://apps.apple.com/us/app/pachino/id1578918163"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  iOS/macOS apps
                </a>{' '}
                and React web applications to{' '}
                <a
                  href="https://www.figma.com/@fradser"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Figma plugins
                </a>{' '}
                and immersive{' '}
                <a
                  href="https://snnb-hackathon.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  3D Web
                </a>{' '}
                experiences. My AI applications range from cultural tools like{' '}
                <a
                  href="https://yi.isstudio.cc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  I Ching divination
                </a>{' '}
                to practical solutions like{' '}
                <a
                  href="https://id.isstudio.cc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  furniture preview
                </a>{' '}
                systems.
              </p>

              <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-light mb-4">
                Deep expertise in AI{' '}
                <a
                  href="https://huggingface.co/FradSer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  model training and dataset construction
                </a>
                , advancing both research and practical applications while maintaining active
                contributions to the open source community on{' '}
                <a
                  href="https://github.com/FradSer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  GitHub
                </a>
                .
              </p>

              <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-light">
                Recognized innovator with {resumeData.patents.length} published interaction design
                patents, consistently pushing the boundaries of what's possible in digital product
                experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <ResumeSection title="Contact" className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CONTACT_COLUMNS.map((column) => (
            <div key={column.join('-')} className="space-y-2">
              {column.map((key) => (
                <p key={key} className="text-gray-700 dark:text-gray-300">
                  <strong>{CONTACT_LABELS[key]}:</strong>{' '}
                  <a
                    href={contactHref(key)}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    {...(key === 'email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {contactDisplay(key)}
                  </a>
                </p>
              ))}
            </div>
          ))}
        </div>
      </ResumeSection>

      {/* Experience */}
      <ResumeSection title="Experience">
        {resumeData.experience.map((item) => (
          <ExperienceItem key={item.company + item.startDate} {...item} />
        ))}
      </ResumeSection>

      {/* Skills */}
      <ResumeSection title="Skills">
        {resumeData.skills.map((category) => (
          <SkillCategory key={category.category} {...category} />
        ))}
      </ResumeSection>

      {/* Notable Projects */}
      <ResumeSection title="Notable Projects">
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              vivo Vision Operating System
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Interactive design for XR operating system at vivo XR Lab, focusing on spatial
              computing and next-generation interaction paradigms for immersive experiences.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Technologies: XR/VR Design, Spatial Computing, Interactive Systems, Operating System
              UI
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              Lark XR - Virtual Collaboration Platform
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              XR-based collaboration platform built on Lark infrastructure, enabling immersive
              virtual meetings and spatial workspace interactions. Pioneered virtual space
              interaction design patterns for professional team collaboration.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Technologies: XR/VR Design, Virtual Space Interaction, Unity, Collaboration Systems,
              Patent Development
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              Eye Protection Design Handbook
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Comprehensive design study for ByteDance's products to reduce visual damage.
              Implemented across Douyin, Jinri Toutiao, Xigua Video, and Dali product line,
              establishing scientific principles for eye protection in digital interfaces.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Impact: Multi-product implementation, Patent applications, Eye protection standards,
              WCAG compliance
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              Pachino - Pomodoro Timer
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Cross-platform Pomodoro Technique timer app built with SwiftUI for iOS and macOS.
              Features generative art for relaxation, ambient sounds from 11 countries, and
              innovative cross-platform design patterns.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Technologies: SwiftUI, Metal, GLSL, p5.js, Cross-platform Design, App Store
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              BearyChat - Team Collaboration Platform
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              One-stop message distribution workspace designed for Chinese teams with focus on
              organizing and adding value to team information. Successfully transitioned from free
              to commercial product serving major clients.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Technologies: Web Design, Electron, Product Strategy, Enterprise Clients (Huawei,
              Keep, Same)
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              frad.me - Personal Portfolio
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Interactive website showcasing expertise in React development and 3D web technologies
              with WebXR capabilities, progressive enhancement architecture, and spatial computing
              experiences.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Technologies: React, Next.js, Three.js, WebXR, TypeScript, Spatial Computing
            </p>
          </div>
        </div>
      </ResumeSection>

      {/* Patents & Achievements */}
      <ResumeSection title="Patents & Achievements">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              {resumeData.patents.length} Granted Patents in Interaction Design
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Successfully developed and secured multiple patents for virtual space interaction
              design inventions, demonstrating innovation in XR and spatial computing interfaces.
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {resumeData.patents.map((patent) => (
                <li key={patent.number}>
                  <a
                    href={patent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {patent.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              Open Source Contributor
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Active contributor to the open-source community on GitHub, sharing expertise in AI
              systems, interaction design, and development tools.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
              Product Growth Leadership
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Led product teams that achieved significant growth milestones, including growing
              Manman Comic user base from thousands to millions of users.
            </p>
          </div>
        </div>
      </ResumeSection>

      <div className="h-16" />
    </div>
  );
}
