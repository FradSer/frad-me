import patents from '@/content/patents';

interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description: string[];
}

interface SkillCategory {
  category: string;
  skills: string[];
}

interface Patent {
  number: string;
  url: string;
}

interface Project {
  name: string;
  role: string;
  description: string;
  href: string;
  linkLabel: string;
}

interface ResumeData {
  name: string;
  title: string;
  headline: string;
  summary: string;
  contact: {
    email: string;
    website: string;
    github: string;
    twitter: string;
    huggingface: string;
  };
  experience: Experience[];
  projects: Project[];
  skills: SkillCategory[];
  patents: Patent[];
}

const resumeData: ResumeData = {
  name: 'Frad LEE',
  title: 'AI Product Manager & Builder',
  headline: 'Agents, developer tools, and spatial computing.',
  summary:
    'I define products, design interactions, and build working software. My background spans product and interaction design since 2014, with experience at RayNeo, vivo, and ByteDance. Today I focus on AI agents, developer workflows, and wearable experiences.',
  contact: {
    email: 'fradser@gmail.com',
    website: 'https://frad.me',
    github: 'https://github.com/FradSer',
    twitter: 'https://x.com/FradSer',
    huggingface: 'https://huggingface.co/FradSer',
  },
  experience: [
    {
      title: 'AI Product Manager',
      company: 'RayNeo',
      startDate: '2025-12-09',
      location: 'Shenzhen, Guangdong, China',
      description: [
        'Define AI assistant workflows for AR glasses, connecting product strategy, interaction design, and system architecture.',
        'Prototype cross-device agent experiences, including multimodal interaction and context and memory workflows.',
        'Work with engineering teams to evaluate assistant behavior and turn model capabilities into usable wearable experiences.',
      ],
    },
    {
      title: 'Senior Interaction Designer',
      company: 'vivo',
      startDate: '2023-03-01',
      endDate: '2025-12-01',
      location: 'Shenzhen, Guangdong, China',
      description: [
        'Designed spatial interactions for the vivo Vision operating system at vivo XR Lab.',
        'Developed and prototyped interface patterns for VR and AR devices, informing core OS and user experience decisions.',
        'Collaborated with engineering and product teams to refine interactions across the system.',
      ],
    },
    {
      title: 'Product Designer',
      company: 'ByteDance',
      startDate: '2020-01-01',
      endDate: '2023-03-01',
      location: 'Beijing, China',
      description: [
        'Designed and prototyped iOS and Unity experiences for Lark.',
        'Led research for the Eye Protection Design Handbook, used across Douyin, Jinri Toutiao, and Xigua Video.',
        'Built SwiftUI and Origami Studio prototypes for Jinri Toutiao and Xigua Video, including accessibility and usability improvements.',
        'Researched XR collaboration and filed invention patent applications for virtual-space interactions.',
      ],
    },
    {
      title: 'Senior Product Manager',
      company: 'Huobi Global',
      startDate: '2018-05-01',
      endDate: '2018-11-01',
      location: 'Beijing, China',
      description: [
        'Improved cryptocurrency exchange workflows and collaboration with overseas partners.',
        'Worked with Huobi Australia and HBUS to support international expansion.',
      ],
    },
    {
      title: 'Founder',
      company: 'next Lab',
      startDate: '2016-08-01',
      endDate: '2018-05-01',
      location: 'Wuhan, Hubei, China',
      description: [
        'Founded a startup exploring AI, hardware, and blockchain applications; led a team across software and hardware development.',
        'Consulted for DaoCloud Wuhan on a new energy monitoring platform with Dongfeng (Aug 2017 – Jan 2018).',
      ],
    },
    {
      title: 'Product Manager',
      company: 'Beary Innovative',
      startDate: '2016-02-01',
      endDate: '2016-09-01',
      location: 'Beijing, China',
      description: [
        'Led product strategy, planning, and requirements for BearyChat, a team collaboration platform.',
        'Guided the transition from a free service to a commercial product serving Huawei, Keep, and Same.',
        'Managed the design team, coordinated development, and used customer feedback to guide priorities.',
      ],
    },
    {
      title: 'Product Manager',
      company: 'Dream Castle',
      startDate: '2015-02-01',
      endDate: '2016-02-01',
      location: 'Beijing, China',
      description: [
        'Led design and development of Manman Comic, an original comics reading platform.',
        'Managed one designer and five engineers, coordinating with marketing and operations.',
        'Helped grow the platform from thousands to millions of users.',
      ],
    },
    {
      title: 'Interaction Designer',
      company: 'GiftTalk',
      startDate: '2014-04-01',
      endDate: '2015-02-01',
      location: 'Beijing, China',
      description: [
        'Created wireframes, prototypes, and user research for GiftTalk 1.0 and 2.0.',
        'Took on product management responsibilities, writing PRDs and coordinating development from concept to commercial release.',
        'Designed wireframes for Kuaikan Comic, which reached No. 1 on the App Store free apps chart.',
      ],
    },
  ],
  projects: [
    {
      name: 'Code Terrier',
      role: 'Independent product · Product, design & engineering',
      description:
        'An AI code review product for GitHub pull requests and local changes. Built review workflows with repository tools, evidence-backed findings, and persistent state for interrupted reviews.',
      href: 'https://codeterrier.com',
      linkLabel: 'Visit product',
    },
    {
      name: 'Open DeskOS',
      role: 'Open source · Product, interaction & engineering',
      description:
        'A cross-platform desk companion combining a desktop shell, a resident agent, and modular widgets. Develop the product across software, interaction design, and hardware integration.',
      href: 'https://github.com/FradSer/open-deskos',
      linkLabel: 'View repository',
    },
    {
      name: 'Agent Workflow Tools',
      role: 'Open source · Developer tools',
      description:
        'Plugins and native packages for coding agents, including Pi. Build tools for agent coordination, context handoff, and development workflows, and maintain them alongside the code they support.',
      href: 'https://github.com/FradSer/pi-packages',
      linkLabel: 'View repository',
    },
    {
      name: 'MCP Server for Apple Events',
      role: 'Open source · Agent integrations',
      description:
        'Connects AI assistants with Apple Calendar and Reminders. Work across the MCP interface, native platform integration, and tools that make personal workflows accessible to agents.',
      href: 'https://github.com/FradSer/mcp-server-apple-events',
      linkLabel: 'View repository',
    },
    {
      name: 'Pachino',
      role: 'Independent product · Design & native development',
      description:
        'Designed and built a SwiftUI focus timer for iOS and macOS, with generative visuals and ambient audio. Currently exploring a task-planning and focus workflow.',
      href: '/works/pachino',
      linkLabel: 'Read case study',
    },
  ],
  skills: [
    {
      category: 'Agents & Developer Tools',
      skills: [
        'Agent Workflows & Tool Use',
        'Context Engineering',
        'MCP Server Development',
        'Evaluation & Regression Testing',
        'Multi-Agent Coordination',
        'Memory Systems',
      ],
    },
    {
      category: 'Product & Interaction Design',
      skills: [
        'Spatial Computing',
        'Cross-Platform UX',
        'Interactive Prototyping',
        'Accessibility Design',
        'User Research',
        'Product Strategy',
      ],
    },
    {
      category: 'Software Development',
      skills: [
        'TypeScript & React',
        'Next.js',
        'Python',
        'Swift & SwiftUI',
        'Cloudflare Workers',
        'iOS & macOS',
      ],
    },
    {
      category: 'Tools & Collaboration',
      skills: ['Figma', 'Origami Studio', 'Unity', 'GitHub', 'Cross-Functional Leadership'],
    },
  ],
  patents,
};

export default resumeData;
