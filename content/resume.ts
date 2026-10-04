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

interface ResumeData {
  name: string;
  title: string;
  summary: string;
  contact: {
    email: string;
    website: string;
    github: string;
    twitter: string;
    huggingface: string;
  };
  experience: Experience[];
  skills: SkillCategory[];
  patents: Patent[];
}

const resumeData: ResumeData = {
  name: 'Frad LEE',
  title: 'AI Product Manager & Interaction Designer',
  summary:
    "I'm an AI Product Manager at RayNeo with 10+ years in product management and interaction design. I work on AI systems and spatial computing for AR glasses, with a focus on multimodal interaction, long-term memory, and multi-agent systems.",
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
        'Define product strategy and system architecture for AI features in AR glasses.',
        'Design multimodal interaction and long-term memory (LTM) systems.',
        'Lead development of AI assistant features, translating model capabilities into hardware experiences.',
      ],
    },
    {
      title: 'Senior Interaction Designer',
      company: 'vivo',
      startDate: '2023-03-01',
      endDate: '2025-12-01',
      location: 'Shenzhen, Guangdong, China',
      description: [
        'Designed interactions for the vivo Vision operating system at vivo XR Lab.',
        'Led spatial interface design for VR and AR devices.',
        'Worked with cross-functional teams to develop and refine interaction patterns.',
        'Contributed to core OS architecture and user experience decisions.',
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
        'Contributed to visual-comfort design validation for Dali desk lamps.',
        'Built SwiftUI and Origami Studio prototypes for Jinri Toutiao and Xigua Video.',
        'Developed accessibility and usability improvements for Xigua Video.',
        'Researched XR collaboration and filed invention patents for virtual-space interactions.',
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
        'Founded a startup focused on AI, hardware, and blockchain applications.',
        'Led a team of one technical partner, two front-end engineers, and two hardware engineers.',
        'Consulted for DaoCloud Wuhan on a new energy monitoring platform with Dongfeng (Aug 2017 – Jan 2018).',
        'Launched MFIL tokens and crowdfunding for Filecoin mining (Feb 2018 – Jun 2018).',
        'Developed practical experience with web3.js and blockchain applications.',
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
  skills: [
    {
      category: 'AI Systems',
      skills: [
        'Multi-Agent Systems',
        'Context Engineering',
        'Prompt Engineering',
        'Agent Design',
        'MCP Server Development',
        'Multimodal Interaction',
        'Long-Term Memory',
        'Model Training',
        'AI Application Development',
      ],
    },
    {
      category: 'Interaction & Product Design',
      skills: [
        'Spatial Computing',
        'XR/VR Interface Design',
        'Cross-Platform UX',
        'Interactive Prototyping',
        'Patent Development',
        'Accessibility Design',
        'User Research',
        'Product Strategy',
      ],
    },
    {
      category: 'Software Development',
      skills: [
        'iOS & macOS',
        'Swift & SwiftUI',
        'React',
        'Figma Plugin Development',
        'Interactive 3D Web',
        'web3.js',
      ],
    },
    {
      category: 'Tools & Collaboration',
      skills: [
        'Figma',
        'Origami Studio',
        'Unity',
        'Xcode',
        'GitHub',
        'Cross-Functional Leadership',
      ],
    },
  ],
  patents,
};

export default resumeData;
