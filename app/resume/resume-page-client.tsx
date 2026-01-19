'use client';

import { clsx } from 'clsx';
import { motion } from 'motion/react';

import { GRID_CLASSES } from '@/utils/constants';

const gridClass = GRID_CLASSES.container;

// Function to calculate work duration
function calculateWorkDuration(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

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

function ResumeSection({ title, children, className }: ResumeSectionProps) {
  const sectionVariants = {
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

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      variants={sectionVariants}
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
  const duration = calculateWorkDuration(startDate, endDate);
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
  const period = `${startMonth} - ${endMonth} · ${duration}`;

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
    <main className="flex flex-col">
      {/* Hero Section */}
      <section className="layout-wrapper pt-32 pb-20 md:pt-48 md:pb-32">
        <div className={gridClass}>
          <div className={GRID_CLASSES.fullWidth}>
            {/* Name with enhanced typography */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-8xl font-bold text-black dark:text-white mb-2 tracking-tight">
                Frad LEE
              </h1>
              <div className="w-24 h-1 bg-white dark:bg-white mb-6"></div>
            </div>

            {/* Title with better styling */}
            <div className="mb-12">
              <p className="text-2xl md:text-3xl font-medium text-gray-600 dark:text-gray-300 mb-4">
                "T-shaped" Product Expert & Interactive Designer
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
                Recognized innovator with 8 published interaction design patents, consistently
                pushing the boundaries of what's possible in digital product experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <ResumeSection title="Contact" className="border-t border-gray-200 dark:border-gray-700 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Email:</strong>{' '}
              <a
                href="mailto:fradser@gmail.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                fradser@gmail.com
              </a>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Website:</strong>{' '}
              <a
                href="https://frad.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                frad.me
              </a>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>GitHub:</strong>{' '}
              <a
                href="https://github.com/FradSer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                @FradSer
              </a>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>X (Twitter):</strong>{' '}
              <a
                href="https://x.com/FradSer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                @FradSer
              </a>
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              <strong>Hugging Face:</strong>{' '}
              <a
                href="https://huggingface.co/FradSer"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                @FradSer
              </a>
            </p>
          </div>
        </div>
      </ResumeSection>

      {/* Experience */}
      <ResumeSection title="Experience">
        <ExperienceItem
          title="Senior Interactive Designer"
          company="vivo"
          startDate="2023-03-01"
          location="Shenzhen, Guangdong, China"
          description={[
            'Actively participated in the interactive design of the operating system of Vivo Vision since joining Vivo XR Lab',
            'Led spatial computing and XR interface design for next-generation VR/AR devices',
            'Collaborated with cross-functional teams to develop innovative interaction paradigms',
            'Contributed to core OS architecture and user experience design decisions',
          ]}
        />
        <ExperienceItem
          title="Product Designer"
          company="ByteDance"
          startDate="2020-01-01"
          endDate="2023-03-01"
          location="Beijing, China"
          description={[
            'Designer and prototyper with expertise in creating interactive prototypes for iOS and Unity projects at Lark',
            'Successfully developed and submitted patents for virtual space interaction design inventions through confidential projects',
            'Led design research for Eye Protection Design Handbook, implemented across Douyin, Jinri Toutiao, Xigua Video, and Dali product line',
            'Developed interactive prototypes using SwiftUI and Origami Studio for Jinri Toutiao and Xigua Video, resulting in patent applications',
            'Improved accessibility of Xigua Video through development of usability design plans',
            'Conducted pre-research in XR field for Xigua Video and submitted several invention patents',
            'Committed to creating immersive experiences with coding skills in Swift and React',
          ]}
        />
        <ExperienceItem
          title="Senior Product Manager"
          company="Huobi Global"
          startDate="2018-05-01"
          endDate="2018-11-01"
          location="Beijing, China"
          description={[
            'Responsible for overseeing and improving the exchange process with overseas partners',
            'Focused on communication and interaction improvements for international markets',
            'Currently working with Huobi Australia and HBUS for global expansion',
            'Led strategic initiatives for cryptocurrency exchange optimization',
          ]}
        />
        <ExperienceItem
          title="Founder"
          company="next Lab"
          startDate="2016-08-01"
          endDate="2018-05-01"
          location="Wuhan, Hubei, China"
          description={[
            'Founded startup with friends focusing on AI, hardware, and blockchain technology development',
            'Led team including one technical partner, two front-end engineers, and two hardware engineers',
            'Served as Product Manager Consultant at DaoCloud Wuhan (Aug 2017 - Jan 2018) for new energy monitoring platform with Dongfeng',
            'Launched MFIL tokens and conducted crowdfunding for Filecoin mines (Feb 2018 - Jun 2018)',
            'Gained practical knowledge of web3.js and blockchain industry applications',
          ]}
        />
        <ExperienceItem
          title="Product Manager"
          company="Beary Innovative"
          startDate="2016-02-01"
          endDate="2016-09-01"
          location="Beijing, China"
          description={[
            'Responsible for overall direction and execution of product strategy for BearyChat',
            'Successfully navigated company transition from free to commercial product',
            'Led corporate strategy development, product planning, and requirements confirmation',
            'Managed team of designers and tracked development progress while gathering user feedback',
            'Served major clients including Huawei, Keep, and Same',
          ]}
        />
        <ExperienceItem
          title="Product Manager"
          company="Dream Castle"
          startDate="2015-02-01"
          endDate="2016-02-01"
          location="Beijing, China"
          description={[
            'Led product design and development team for Manman Comic, a domestic original comic reading platform',
            'Managed team of one designer and five engineers while collaborating with market and operations',
            'Achieved significant user growth from thousands to millions during tenure',
            'Oversaw product progress and coordinated various market initiatives',
          ]}
        />
        <ExperienceItem
          title="Interaction Designer"
          company="GiftTalk"
          startDate="2014-04-01"
          endDate="2015-02-01"
          location="Beijing, China"
          description={[
            'Completed wireframe, prototype, and user research for GiftTalk product from version 1.0 to 2.0',
            'Served as part-time Product Manager, creating PRDs and monitoring development progress',
            'Led wireframe development for Kuaikan Comic collaborative project',
            'Achieved App Store free chart #1 ranking for Kuaikan Comic project',
            'Responsible for complete product development lifecycle from concept to stable commercial version',
          ]}
        />
      </ResumeSection>

      {/* Skills */}
      <ResumeSection title="Skills">
        <SkillCategory
          category="AI & Advanced Systems"
          skills={[
            'Multi-Agent Systems',
            'Context Engineering',
            'Prompt Engineering',
            'Agent Design',
            'Model Training',
            'AI Application Development',
            'Business Problem Solving',
            'Strategic AI Implementation',
          ]}
        />
        <SkillCategory
          category="Interaction & UX Design"
          skills={[
            'Spatial Computing',
            'XR/VR Interface Design',
            'Multi-platform UX Design',
            'Interactive Prototyping',
            'Patent Development (8 patents)',
            'Accessibility Design',
            'User Research',
            'Product Strategy',
          ]}
        />
        <SkillCategory
          category="Development & Technical"
          skills={[
            'iOS/macOS Development',
            'Swift',
            'React',
            'SwiftUI',
            'Unity',
            'Figma Plugins',
            '3D Web',
            'Web3.js',
          ]}
        />
        <SkillCategory
          category="Tools & Platforms"
          skills={[
            'Origami Studio',
            'Figma',
            'Unity Engine',
            'Xcode',
            'GitHub (Open Source)',
            'Blockchain Technology',
            'Product Management',
            'Cross-functional Leadership',
          ]}
        />
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
              8 Granted Patents in Interaction Design
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Successfully developed and secured multiple patents for virtual space interaction
              design inventions, demonstrating innovation in XR and spatial computing interfaces.
            </p>
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
    </main>
  );
}
