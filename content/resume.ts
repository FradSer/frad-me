export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  location?: string;
  description: string[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface Patent {
  number: string;
  url: string;
}

export interface ResumeData {
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
  title: '"T-shaped" Product Expert & Interactive Designer',
  summary:
    'AI Product Manager at RayNeo focused on AI-native systems and spatial computing. Specializing in Multi-modal interaction and Long-term Memory (LTM) architectures for AR glasses. Bridging technical depth in Multi-Agent Systems with 10+ years of interaction design expertise to build next-generation hardware experiences.',
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
        'Focus on AI-native system architecture and product strategy',
        'Specializing in Multi-modal interaction and Long-term Memory (LTM) systems',
        'Leading development of next-generation AI assistant features for AR glasses',
        'Bridging the gap between advanced AI models and user-centric hardware experiences',
      ],
    },
    {
      title: 'Senior Interactive Designer',
      company: 'vivo',
      startDate: '2023-03-01',
      endDate: '2025-12-01',
      location: 'Shenzhen, Guangdong, China',
      description: [
        'Actively participated in the interactive design of the operating system of Vivo Vision since joining Vivo XR Lab',
        'Led spatial computing and XR interface design for next-generation VR/AR devices',
        'Collaborated with cross-functional teams to develop innovative interaction paradigms',
        'Contributed to core OS architecture and user experience design decisions',
      ],
    },
    {
      title: 'Product Designer',
      company: 'ByteDance',
      startDate: '2020-01-01',
      endDate: '2023-03-01',
      location: 'Beijing, China',
      description: [
        'Designer and prototyper with expertise in creating interactive prototypes for iOS and Unity projects at Lark',
        'Successfully developed and submitted patents for virtual space interaction design inventions',
        'Led design research for Eye Protection Design Handbook, implemented across Douyin, Jinri Toutiao, Xigua Video',
        'Developed interactive prototypes using SwiftUI and Origami Studio',
      ],
    },
    {
      title: 'Senior Product Manager',
      company: 'Huobi Global',
      startDate: '2018-05-01',
      endDate: '2018-11-01',
      location: 'Beijing, China',
      description: [
        'Oversaw and improved the exchange process with overseas partners',
        'Led strategic initiatives for cryptocurrency exchange optimization',
      ],
    },
    {
      title: 'Founder',
      company: 'next Lab',
      startDate: '2016-08-01',
      endDate: '2018-05-01',
      location: 'Wuhan, Hubei, China',
      description: [
        'Founded startup focusing on AI, hardware, and blockchain technology development',
        'Led team including technical partner, front-end engineers, and hardware engineers',
      ],
    },
    {
      title: 'Product Manager',
      company: 'Beary Innovative',
      startDate: '2016-02-01',
      endDate: '2016-09-01',
      location: 'Beijing, China',
      description: [
        'Led product strategy for BearyChat, a team collaboration platform',
        'Successfully navigated company transition from free to commercial product',
        'Served major clients including Huawei, Keep, and Same',
      ],
    },
    {
      title: 'Product Manager',
      company: 'Dream Castle',
      startDate: '2015-02-01',
      endDate: '2016-02-01',
      location: 'Beijing, China',
      description: [
        'Led product design for Manman Comic, a domestic original comic reading platform',
        'Achieved significant user growth from thousands to millions during tenure',
      ],
    },
    {
      title: 'Interaction Designer',
      company: 'GiftTalk',
      startDate: '2014-04-01',
      endDate: '2015-02-01',
      location: 'Beijing, China',
      description: [
        'Completed wireframe, prototype, and user research for GiftTalk product from version 1.0 to 2.0',
        'Achieved App Store free chart #1 ranking for Kuaikan Comic project',
      ],
    },
  ],
  skills: [
    {
      category: 'AI & Advanced Systems',
      skills: [
        'Multi-Agent Systems',
        'Context Engineering',
        'Prompt Engineering',
        'Agent Design',
        'Model Training',
        'AI Application Development',
      ],
    },
    {
      category: 'Interaction & UX Design',
      skills: [
        'Spatial Computing',
        'XR/VR Interface Design',
        'Multi-platform UX Design',
        'Interactive Prototyping',
        'Patent Development (8 patents)',
        'Accessibility Design',
        'User Research',
        'Product Strategy',
      ],
    },
    {
      category: 'Development & Technical',
      skills: [
        'iOS/macOS Development',
        'Swift',
        'React',
        'SwiftUI',
        'Unity',
        'Figma Plugins',
        '3D Web',
      ],
    },
    {
      category: 'Tools & Platforms',
      skills: ['Origami Studio', 'Figma', 'Unity Engine', 'Xcode', 'GitHub', 'Product Management'],
    },
  ],
  patents: [
    { number: 'CN118939106A', url: 'https://patents.google.com/patent/CN118939106A' },
    { number: 'CN118939105A', url: 'https://patents.google.com/patent/CN118939105A' },
    { number: 'WO2023143051A1', url: 'https://patents.google.com/patent/WO2023143051A1' },
    { number: 'CN118535001A', url: 'https://patents.google.com/patent/CN118535001A' },
    { number: 'CN113504832A', url: 'https://patents.google.com/patent/CN113504832A' },
    { number: 'CN117635879A', url: 'https://patents.google.com/patent/CN117635879A' },
    { number: 'CN117376625A', url: 'https://patents.google.com/patent/CN117376625A' },
    { number: 'CN117676261A', url: 'https://patents.google.com/patent/CN117676261A' },
  ],
};

export default resumeData;
