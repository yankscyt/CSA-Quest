import { StudyNote } from '../types';

export const INITIAL_KNOWLEDGE_NOTES: StudyNote[] = [
  {
    id: 'note-d1-1',
    domainId: 1,
    topic: 'Next Experience Unified Navigation',
    title: 'Unified Navigation Architecture & Menus',
    content: `### Next Experience Unified Navigation
The Next Experience Unified Navigation is the default UI framework introduced to provide a modernized, accessible, and unified experience across applications.

#### Key Header Components:
* **All menu:** Provides full access to application menus and modules. Supports filter text (e.g. typing \`sys_user.list\` or module titles).
* **Favorites menu:** Contains user-starred modules, lists, forms, or URLs.
* **Workspaces menu:** Provides quick jumping between configured multi-tab agent workspaces (CSM, ITSM, HR).
* **History menu:** Displays chronological history of recently accessed records and lists.
* **User Preferences:** Gear menu controlling theme (light/dark), time zone, accessibility, and notification channels.

#### Handy Navigation Shortcuts:
* \`<table>.list\` - opens table list view in current window.
* \`<table>.LIST\` - opens table list view in a new browser tab.
* \`<table>.form\` - opens a new blank record form for that table.`,
    keyTerms: [
      { term: 'sys_id', definition: 'Unique 32-character hexadecimal globally unique identifier assigned to every record in ServiceNow.' },
      { term: 'Banner Frame', definition: 'The top navigation header containing global search, user preferences, and unified menus.' },
      { term: 'Multi-Instance', definition: 'ServiceNow cloud architecture where each customer has their own dedicated database and application tier.' }
    ],
    isBookmarked: true,
    lastUpdated: '2026-10-12',
  },
  {
    id: 'note-d2-1',
    domainId: 2,
    topic: 'Personalizing/customizing the instance',
    title: 'Personalization vs Configuration Comparison',
    content: `### Personalization vs Configuration

Understanding the boundary between personalizing an interface versus system configuration is a high-frequency CSA exam topic.

| Dimension | Personalization | Configuration / Customization |
| :--- | :--- | :--- |
| **Scope** | Affects **only the logged-in user** | Affects **all users** on the instance |
| **Permissions** | Any end user or fulfiller (no special role needed) | Requires **admin** or application-specific admin roles |
| **Examples** | Adding a column to my list via gear icon; switching to dark mode; setting personal time zone | Using Form Designer to add a field for everyone; writing a Business Rule |
| **Update Sets** | **Never** captured in Update Sets | **Captured** in Update Sets |`,
    keyTerms: [
      { term: 'Personalize List', definition: 'Gear icon on a list column header that configures personal visible columns for the current user only.' },
      { term: 'Guided Setup', definition: 'An administrative sequence of steps that guides admins through best-practice application configuration.' },
      { term: 'Theme Builder', definition: 'Next Experience visual utility for creating custom enterprise color palettes and brand logos.' }
    ],
    isBookmarked: false,
    lastUpdated: '2026-10-13',
  },
  {
    id: 'note-d3-1',
    domainId: 3,
    topic: 'Lists, Filters, and Tags',
    title: 'List Search Operators & Filter Syntax',
    content: `### List Search Wildcards Cheat Sheet

Searching list columns using the Go To search or text filters relies on specific syntax characters:

| Operator | Syntax Example | Meaning |
| :--- | :--- | :--- |
| **Contains** | \`*keyword\` or \`%keyword\` | Matches text containing the term anywhere in the string |
| **Does not contain** | \`!*keyword\` | Returns records where the column does not contain the term |
| **Starts with** | \`keyword\` (plain text) | Default search behavior; matches beginning of string |
| **Ends with** | \`%keyword\` (in SQL) or filter operator | Matches string ending with keyword |
| **Equals** | \`=keyword\` | Matches exact string match |
| **Greater than / Less than** | \`>value\` or \`<value\` | Useful for dates, numbers, and priority levels |

#### Breadcrumbs Behavior:
* Clicking any breadcrumb condition term evaluates and filters up to that specific point.
* Clicking the right arrow (> or chevron) removes that criterion.`,
    keyTerms: [
      { term: 'Breadcrumb', definition: 'Visual filter hierarchy trail (Field > Operator > Value) at the top of lists.' },
      { term: 'Form Designer', definition: 'Drag-and-drop WYSIWYG tool to edit form sections, fields, and field properties.' },
      { term: 'Visual Task Board (VTB)', definition: 'Interactive Kanban board categorized into Freeform, Guided (tied to a field), or Flexible.' }
    ],
    isBookmarked: true,
    lastUpdated: '2026-10-19',
  },
  {
    id: 'note-d4-1',
    domainId: 4,
    topic: 'Service Catalog',
    title: 'Service Catalog Architecture & Record Hierarchy',
    content: `### The Service Catalog Hierarchy

When a user submits a request on the Service Portal, ServiceNow creates a three-tiered record structure:

\`\`\`
Request [sc_request] (REQ#)
   └── Requested Item [sc_req_item] (RITM#)
         ├── Catalog Task [sc_task] (SCTASK# - Procurement)
         └── Catalog Task [sc_task] (SCTASK# - Deployment)
\`\`\`

#### Key Components:
* **Record Producer:** A catalog item with a simplified interface that creates a task record (such as an Incident or Change Request) directly.
* **Order Guide:** Bundles multiple catalog items into a unified wizard (e.g. "New Hire Onboarding" ordering Laptop + Phone + Office Chair).
* **Variable Set:** A reusable collection of catalog variables that can be shared across multiple catalog items to eliminate redundant configuration.
* **User Criteria:** Determines which users can request or view items based on location, department, company, group, or role.`,
    keyTerms: [
      { term: 'Workflow Studio', definition: 'Unified environment consolidating Flow Designer, Process Automation Designer, and Playbooks.' },
      { term: 'Data Pill', definition: 'Interactive draggable element representing variable outputs in Flow Designer.' },
      { term: 'Spoke', definition: 'A scoped integration bundle of Flow Designer actions and subflows for 3rd-party systems.' }
    ],
    isBookmarked: false,
    lastUpdated: '2026-10-21',
  },
  {
    id: 'note-d5-1',
    domainId: 5,
    topic: 'Application/Access Control',
    title: 'Access Control (ACL) Evaluation Order (CRITICAL 30%)',
    content: `### ACL Rule Evaluation Precedence

Domain 5 accounts for **30% of the CSA exam**. ACL evaluation rules are among the most heavily tested concepts!

#### The Two-Step Security Check:
1. **Table-level ACL evaluation:** Can the user access ANY records in this table?
   * If Table-level fails: **Access is DENIED immediately.** Field-level checks are skipped!
2. **Field-level ACL evaluation:** Can the user access THIS specific column?
   * Only evaluated if Table-level passed.

\`\`\`
User Request ---> [Table-level ACL Check] ──(Passed)──> [Field-level ACL Check] ──(Passed)──> Access Granted
                         │                                     │
                     (Failed)                              (Failed)
                         │                                     │
                         └───> Access DENIED <─────────────────┘
\`\`\`

#### Specificity Order (Most Specific to Least Specific):
1. \`table.field\` (e.g., incident.short_description)
2. \`parent_table.field\` (e.g., task.short_description)
3. \`table.*\` (incident.* wildcard fallback for any field without a specific rule)
4. \`parent_table.*\` (task.* wildcard fallback)
5. \`*.*\` (global wildcard rule)`,
    keyTerms: [
      { term: 'security_admin', definition: 'Elevated privilege role required to create or modify Access Control Lists (sys_security_acl).' },
      { term: 'Coalesce', definition: 'Transform Map option that determines whether to update an existing record or insert a new one.' },
      { term: 'CSDM', definition: 'Common Service Data Model: standard prescriptive framework connecting infrastructure CIs to business services.' }
    ],
    isBookmarked: true,
    lastUpdated: '2026-10-15',
  },
  {
    id: 'note-d6-1',
    domainId: 6,
    topic: 'UI Policies',
    title: 'UI Policies vs Client Scripts vs Business Rules',
    content: `### Client-Side vs Server-Side Architecture

| Feature | UI Policy | Client Script | Business Rule |
| :--- | :--- | :--- | :--- |
| **Execution Environment** | Client Browser | Client Browser | ServiceNow Server |
| **Requires Scripting?** | **No** (UI Policy Actions handle Mandatory, Read-Only, Visible) | **Yes** (JavaScript using \`g_form\`) | **Yes / Optional** (JavaScript using \`current\` & \`GlideRecord\`) |
| **Trigger Event** | Form condition / field change | \`onLoad\`, \`onChange\`, \`onSubmit\`, \`onCellEdit\` | Database operations: Query, Insert, Update, Delete |
| **Timing Options** | When condition is met / reverse if false | Event-driven in browser DOM | \`Before\`, \`After\`, \`Async\`, \`Display\` |

#### Update Sets: What is Captured vs What is NOT Captured?
* **CAPTURED (Configuration):** Business Rules, Client Scripts, UI Policies, Form Layouts, Fields, Workflows, Tables.
* **NOT CAPTURED (Data):** New incidents, user accounts (\`sys_user\`), group memberships, schedule entries, hardware assets.`,
    keyTerms: [
      { term: 'g_form', definition: 'Client-side GlideForm API object for interacting with fields on the currently displayed form.' },
      { term: 'GlideRecord', definition: 'Server-side API class used in Business Rules and Script Includes to interact with database tables.' },
      { term: 'Update Set', definition: 'A group of configuration customizations that can be moved from one instance to another (e.g., Dev to Test).' }
    ],
    isBookmarked: true,
    lastUpdated: '2026-10-26',
  },
];
