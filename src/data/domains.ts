import { DomainInfo } from '../types';

export const OFFICIAL_DOMAINS: DomainInfo[] = [
  {
    id: 1,
    title: 'Platform Overview and Navigation',
    weight: 7,
    description: 'ServiceNow architecture, instance concepts, user interfaces, and Next Experience Unified Navigation.',
    topics: [
      'ServiceNow Platform overview',
      'Platform capabilities and services',
      'The ServiceNow Instance',
      'Next Experience Unified Navigation',
    ],
    mockQuestionTarget: 4, // 4/60 approx 7%
    color: '#f472b6', // pastel rose pink
  },
  {
    id: 2,
    title: 'Instance Configuration',
    weight: 10,
    description: 'Plugin and application management, branding, personalizing settings, and common platform UI components.',
    topics: [
      'Installing applications and plugins',
      'Personalizing/customizing the instance',
      'Common user interfaces in the Platform',
    ],
    mockQuestionTarget: 6, // 6/60 = 10%
    color: '#fb7185', // pastel coral rose
  },
  {
    id: 3,
    title: 'Configuring Applications for Collaboration',
    weight: 20,
    description: 'Lists, filters, forms, templates, Visual Task Boards, reporting, dashboards, and system notifications.',
    topics: [
      'Lists, Filters, and Tags',
      'List and Form anatomy',
      'Form Configuration',
      'Form templates and saving options',
      'Advanced Form Configuration',
      'Task Management',
      'Visual Task Boards (VTBs)',
      'Visualizations, Dashboards, and Platform Analytics',
      'Notifications',
    ],
    mockQuestionTarget: 12, // 12/60 = 20%
    color: '#ec4899', // pastel strawberry
  },
  {
    id: 4,
    title: 'Self Service & Automation',
    weight: 20,
    description: 'Knowledge bases, Service Catalog items, execution workflows, Workflow Studio, and Virtual Agent bots.',
    topics: [
      'Knowledge Management',
      'Service Catalog',
      'Workflow Studio',
      'Virtual Agent',
    ],
    mockQuestionTarget: 12, // 12/60 = 20%
    color: '#c084fc', // pastel orchid blossom
  },
  {
    id: 5,
    title: 'Database Management and Platform Security',
    weight: 30,
    description: 'HIGHEST PRIORITY (30%): Tables, schema, references, ACL security rules, Data Import/Transform Maps, CMDB, CSDM, and Security Center.',
    topics: [
      'Data Schema',
      'Application/Access Control',
      'Importing Data',
      'CMDB and CSDM',
      'Security Center',
      'Shared Responsibility Model',
    ],
    mockQuestionTarget: 18, // 18/60 = 30%
    isHighPriority: true,
    color: '#e11d48', // vibrant raspberry (30% focus)
  },
  {
    id: 6,
    title: 'Data Migration and Integration',
    weight: 13,
    description: 'UI Policies, Client Scripts vs Business Rules, Update Sets migration workflow, and ServiceNow JavaScript fundamentals.',
    topics: [
      'UI Policies',
      'Business Rules',
      'System update sets',
      'Scripting in ServiceNow',
    ],
    mockQuestionTarget: 8, // 8/60 approx 13%
    color: '#f43f5e', // warm cherry rose
  },
];

export const OFFICIAL_DOC_LINKS = {
  docs: 'https://docs.servicenow.com/',
  learning: 'https://learning.servicenow.com/',
  certificationJourney: 'https://www.servicenow.com/services/training-and-certification/journey/',
  csaBlueprintInfo: 'https://www.servicenow.com/services/training-and-certification.html',
};
