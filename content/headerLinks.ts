import { DestinationType } from '@/components/common/CommonLink';

// Order mirrors the homepage section flow: work → patent → ask → listen.
// The trailing two links go to other routes / external.
const headerLinks = [
  {
    title: 'work',
    href: 'work',
    destinationType: DestinationType.section,
  },
  {
    title: 'patent',
    href: 'patent',
    destinationType: DestinationType.section,
  },
  {
    title: 'ask',
    href: 'ask',
    destinationType: DestinationType.section,
  },
  {
    title: 'listen',
    href: 'listen',
    destinationType: DestinationType.section,
  },
  {
    title: 'resume',
    href: '/resume',
    destinationType: DestinationType.link,
  },
  {
    title: 'calendly',
    href: 'https://calendly.com/fradser',
  },
];

export default headerLinks;
