'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import resumeData from '@/content/resume';
import { GRID_CLASSES } from '@/utils/constants';

const linkClass =
  'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

type ContactKey = keyof typeof resumeData.contact;

const CONTACT_LABELS: Record<ContactKey, string> = {
  email: 'Email',
  website: 'Website',
  github: 'GitHub',
  twitter: 'X (Twitter)',
  huggingface: 'Hugging Face',
};

function ContactLinks() {
  return (
    <nav aria-label="Contact" className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
      {(Object.keys(CONTACT_LABELS) as ContactKey[]).map((key) => (
        <a
          key={key}
          href={key === 'email' ? `mailto:${resumeData.contact[key]}` : resumeData.contact[key]}
          className={clsx(linkClass, 'inline-flex min-h-11 items-center')}
          {...(key === 'email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {key === 'email' ? resumeData.contact.email : CONTACT_LABELS[key]}
        </a>
      ))}
    </nav>
  );
}

function ResumeIntro() {
  return (
    <section aria-labelledby="resume-name" className="layout-wrapper pt-32 pb-16 md:pt-40 md:pb-20">
      <h1
        id="resume-name"
        className="text-6xl md:text-8xl font-bold tracking-tight text-black dark:text-white"
      >
        {resumeData.name}
      </h1>
      <p className="mt-8 text-2xl md:text-3xl font-medium text-black dark:text-white">
        {resumeData.title}
      </p>
      <p className="mt-3 text-xl md:text-2xl text-gray-600 dark:text-gray-300">
        {resumeData.headline}
      </p>
      <p className="mt-6 max-w-[70ch] text-lg leading-relaxed text-gray-700 dark:text-gray-300">
        {resumeData.summary}
      </p>
      <ContactLinks />
    </section>
  );
}

function ResumeSection({ title, children }: { title: string; children: ReactNode }) {
  const id = title.toLowerCase().replaceAll(' ', '-');
  return (
    <section
      aria-labelledby={id}
      className="layout-wrapper border-t border-gray-200 dark:border-gray-800 py-12 md:py-16"
    >
      <div className={GRID_CLASSES.container}>
        <div className="col-span-16 md:col-span-4 mb-6 md:mb-0 md:pr-6">
          <h2 id={id} className="text-2xl md:text-3xl font-bold text-black dark:text-white">
            {title}
          </h2>
        </div>
        <div className="col-span-16 md:col-span-12 min-w-0">{children}</div>
      </div>
    </section>
  );
}

function SelectedProjects() {
  return (
    <ResumeSection title="Selected Projects">
      <div className="space-y-8">
        {resumeData.projects.map((project) => (
          <article key={project.name}>
            <h3 className="text-xl font-semibold">
              <a
                href={project.href}
                className={linkClass}
                {...(project.href.startsWith('https://')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {project.name}
              </a>
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{project.role}</p>
            <p className="mt-3 max-w-[70ch] leading-relaxed text-gray-700 dark:text-gray-300">
              {project.description}
            </p>
          </article>
        ))}
      </div>
    </ResumeSection>
  );
}

function ExperienceItem({
  title,
  company,
  startDate,
  endDate,
  description,
  location,
}: (typeof resumeData.experience)[number]) {
  return (
    <article>
      <h3 className="text-xl font-semibold text-black dark:text-white">{company}</h3>
      <p className="mt-1 text-lg text-gray-700 dark:text-gray-300">{title}</p>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        <time dateTime={startDate}>{dateFormatter.format(new Date(startDate))}</time>
        {' – '}
        {endDate ? (
          <time dateTime={endDate}>{dateFormatter.format(new Date(endDate))}</time>
        ) : (
          'Present'
        )}
      </p>
      {location && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{location}</p>}
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-700 dark:text-gray-300">
        {description.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function Skills() {
  return (
    <ResumeSection title="Skills">
      <div className="grid gap-8 sm:grid-cols-2">
        {resumeData.skills.map(({ category, skills }) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-black dark:text-white">{category}</h3>
            <p className="mt-2 leading-relaxed text-gray-700 dark:text-gray-300">
              {skills.join(' · ')}
            </p>
          </div>
        ))}
      </div>
    </ResumeSection>
  );
}

function Patents() {
  return (
    <ResumeSection title="Patents">
      <h3 className="text-xl font-semibold text-black dark:text-white">
        {resumeData.patents.length} patent publications
      </h3>
      <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
        Published applications in virtual-space interaction and spatial interface design.
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {resumeData.patents.map((patent) => (
          <li key={patent.number}>
            <a
              href={patent.url}
              target="_blank"
              rel="noopener noreferrer"
              className={clsx(linkClass, 'inline-flex min-h-11 items-center')}
            >
              {patent.number}
            </a>
          </li>
        ))}
      </ul>
    </ResumeSection>
  );
}

export default function ResumePageClient() {
  return (
    <div className="flex w-full flex-col items-center pb-16">
      <ResumeIntro />
      <SelectedProjects />
      <ResumeSection title="Experience">
        <div className="space-y-10">
          {resumeData.experience.map((item) => (
            <ExperienceItem key={item.company + item.startDate} {...item} />
          ))}
        </div>
      </ResumeSection>
      <Skills />
      <Patents />
    </div>
  );
}
