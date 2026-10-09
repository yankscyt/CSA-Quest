export interface StudyTipData {
  topic: string;
  domainId: number;
  domainTitle: string;
  coreSummary: string;
  highYieldRules: string[];
  examTrap: string;
  recommendedHandsOn: string;
  mnemonic?: string;
  source?: string;
}

export const CURATED_STUDY_TIPS: Record<string, Omit<StudyTipData, 'topic' | 'domainId' | 'domainTitle'>> = {
  // --- DOMAIN 1: Platform Overview and Navigation ---
  'Next Experience Unified Navigation': {
    coreSummary: 'Unified Navigation provides four primary header menus: All, Favorites, Workspaces, and History, replacing the legacy UI16 left navigation frame.',
    highYieldRules: [
      'The "All" menu allows searching modules or typing <table>.list to navigate directly.',
      'Pin icon docks the navigation pane to the left edge of the viewport.',
      'User preferences (gear icon) controls theme, time zone display, and compact row density.',
      'Workspaces provide multi-tab workspaces for specialized agent workflows (ITSM, CSM).'
    ],
    examTrap: 'Confusing the "All" or "Workspaces" header menu with administrative utilities like "Schema Map" or "Stats", which are modules, not top-level header menus.',
    recommendedHandsOn: 'In your PDI, open the All menu, pin it, navigate to sys_user.list using the filter navigator, and test the compact view toggle in User Preferences.',
    mnemonic: 'A-F-W-H: All, Favorites, Workspaces, History.',
  },
  'The ServiceNow Instance': {
    coreSummary: 'ServiceNow uses an Advanced Multi-Instance Architecture with completely dedicated databases for each customer, unlike shared multi-tenant SaaS.',
    highYieldRules: [
      'Each customer has distinct production and non-production instances (Dev, Test, Prod).',
      'Dedicated databases guarantee strict data isolation, security, and independent upgrade schedules.',
      'Instances connect to data centers in paired geographically diverse regions for automated failover.'
    ],
    examTrap: 'Selecting "Multi-tenant shared database" on exam questions. ServiceNow is multi-instance, NOT multi-tenant at the database layer!',
    recommendedHandsOn: 'Visit stats.do in your PDI URL bar to observe the dedicated instance build version, database node names, and server uptime.',
    mnemonic: 'MI = My Instance (Dedicated database and app tiers).',
  },
  'ServiceNow Platform overview': {
    coreSummary: 'ServiceNow is a single cloud platform with a single data model connecting workflows across Technology, Customer, Employee, and Creator workflows.',
    highYieldRules: [
      'sys_id is the 32-character hexadecimal globally unique identifier for every record.',
      'Base tables (like task and cmdb) are extended by core and custom tables.',
      'Single architecture eliminates data silos by keeping all records in relational MySQL/MariaDB database tables.'
    ],
    examTrap: 'Assuming ServiceNow uses a proprietary non-relational database. Under the hood, it is a relational database mapped through GlideRecord abstractions.',
    recommendedHandsOn: 'Right-click any record form header, select "Copy sys_id", and verify that it is exactly a 32-character hexadecimal string.',
  },
  'Platform capabilities and services': {
    coreSummary: 'Platform capabilities encompass authentication, reporting, platform analytics, integration hubs, and mobile agent applications built on common table structures.',
    highYieldRules: [
      'Role-based access control (RBAC) assigns roles to groups, and groups to users (never assign roles directly to users as best practice).',
      'The admin role grants broad access, but security_admin is required to edit ACLs.',
      'ServiceNow Store provides certified applications built by ServiceNow and partners.'
    ],
    examTrap: 'Assigning roles directly to individual users. Official best practice tested on the exam is: Users -> Assigned to Groups -> Roles assigned to Groups.',
    recommendedHandsOn: 'Inspect sys_user_group in your PDI and verify how roles inherit to all member users.',
  },

  // --- DOMAIN 2: Instance Configuration ---
  'Installing applications and plugins': {
    coreSummary: 'Plugins add specific application features, tables, and workflows to the instance via System Definition > Plugins (or All Applications).',
    highYieldRules: [
      'Once a plugin is activated, it cannot be uninstalled through the standard user interface.',
      'Plugins must always be tested in sub-production instances before production activation.',
      'ServiceNow Store applications follow semantic versioning and can be updated independently of family release upgrades.'
    ],
    examTrap: 'Believing that an administrator can deactivate or uninstall plugins with a simple toggle in the web UI. In reality, plugins cannot be uninstalled.',
    recommendedHandsOn: 'Navigate to System Definition > Plugins and review the filter options (Installed, Available, Needs Update).',
  },
  'Personalizing/customizing the instance': {
    coreSummary: 'Personalization modifies settings for ONLY the logged-in user, while Configuration alters settings globally for ALL users across the instance.',
    highYieldRules: [
      'Personalization: Gear icon on lists to adjust visible columns, switching dark/light theme, local time zone.',
      'Configuration: Form Designer, Form Layout, System Properties, Business Rules.',
      'Personalization changes are NEVER captured in Update Sets; global configurations ARE captured in Update Sets.'
    ],
    examTrap: 'Failing to spot the boundary: if a user clicks the list gear icon, it affects ONLY them. If an admin uses Form Layout/Designer, it affects EVERYONE.',
    recommendedHandsOn: 'Customize list columns using the gear icon, then log in with another test user to prove the other user still sees the default columns.',
    mnemonic: 'Personal = Just Me. Config = Everyone.',
  },
  'Common user interfaces in the Platform': {
    coreSummary: 'Standard UIs include Next Experience Unified Navigation, Service Operations Workspace, Service Portal, and Mobile Agent apps.',
    highYieldRules: [
      'Guided Setup provides step-by-step best practice configuration sequences with progress percentages.',
      'Theme Builder enables visual company branding (logo, primary color, typography) across Next Experience.',
      'System Properties (sys_properties.list) store global instance parameters.'
    ],
    examTrap: 'Confusing Guided Setup (administrative setup wizard) with Order Guides (service catalog multi-item ordering).',
    recommendedHandsOn: 'Search for "Guided Setup" in the navigator and inspect ITSM Guided Setup to see the category checklist structure.',
  },

  // --- DOMAIN 3: Configuring Applications for Collaboration ---
  'Lists, Filters, and Tags': {
    coreSummary: 'Lists display records in tabular format. Breadcrumbs visualize the query condition trail, and tags enable ad-hoc categorizations.',
    highYieldRules: [
      'Wildcards: *text or %text means "contains"; !*text means "does not contain"; text means "starts with".',
      'Breadcrumbs consist of Field > Operator > Value. Clicking any term filters up to that condition.',
      'Tags have three visibility tiers: "Me" (private), "Groups and Users", or "Everyone".'
    ],
    examTrap: 'Forgetting that entering plain text without an asterisk defaults to "starts with", not "contains".',
    recommendedHandsOn: 'Go to incident.list and test Go To search: type "*email" vs "email" to see how the result set changes.',
  },
  'List and Form anatomy': {
    coreSummary: 'Forms display record fields. The Form Header contains the paperclip (attachments), activity stream toggle, template bar, and burger context menu.',
    highYieldRules: [
      'Form Layout uses a dual-column slushbucket; Form Designer provides a visual drag-and-drop canvas.',
      'Form Sections organize fields into collapsible tabs or blocks.',
      'Related Lists appear at the bottom of the form to display records from related tables.'
    ],
    examTrap: 'Confusing Related Lists (record lists at the bottom of a form) with Related Links (clickable UI action text links on the form).',
    recommendedHandsOn: 'Open an Incident, right-click the header, choose Configure > Form Designer, and observe the Section tabs layout.',
  },
  'Form Configuration': {
    coreSummary: 'Form Designer and Form Layout allow administrators to structure fields, containers, annotations, and format multi-column layouts.',
    highYieldRules: [
      'Form Designer has three components: Fields tab, Field Types tab, and the visual Form Canvas.',
      'Creating a new field in Form Designer immediately adds a new column to the database dictionary.',
      'Views allow different sets of users to see different form layouts (e.g., Default view, ESS view, Major Incident view).'
    ],
    examTrap: 'Assuming creating a field on a form only affects that form view. It permanently creates a column in the database table schema!',
    recommendedHandsOn: 'Switch views on an incident form using the hamburger menu > View > Self Service to observe the different fields presented.',
  },
  'Form templates and saving options': {
    coreSummary: 'Templates auto-populate field values on forms. Saving options dictate user redirection after database commits.',
    highYieldRules: [
      'Submit: Saves a new record and redirects back to the previous list.',
      'Save: Commits changes to the database and keeps the user on the current form.',
      'Update: Commits modifications to an existing record and redirects away to the list.',
      'Insert & Stay: Creates a duplicate record with a new sys_id and stays on the newly created record.'
    ],
    examTrap: 'Thinking "Insert" modifies the current record. "Insert" ALWAYS creates a brand new record (new sys_id).',
    recommendedHandsOn: 'On a test incident, right-click the header and test "Save" vs "Insert and Stay" and notice the number and sys_id change.',
  },
  'Task Management': {
    coreSummary: 'The task table is the core base table for Incident, Problem, Change, and Request. It provides common fields and workflows.',
    highYieldRules: [
      'Shared fields inherited from task: number, priority, state, assigned_to, assignment_group, short_description.',
      'Work Notes are for internal fulfiller collaboration; Additional Comments are sent to the customer.',
      'Activity stream logs chronological journal entries and audit history.'
    ],
    examTrap: 'Answering that Work Notes are visible on the Service Portal. Work Notes are strictly internal fulfiller notes!',
    recommendedHandsOn: 'Open task.list to see all tasks across incidents, changes, problems, and catalog tasks in one unified list.',
  },
  'Visual Task Boards (VTBs)': {
    coreSummary: 'Visual Task Boards transform task lists into interactive Kanban boards for agile team collaboration.',
    highYieldRules: [
      'Freeform: Manual lanes and cards, not mapped to underlying field states.',
      'Guided: Lanes map to a choice field (e.g. State); moving cards automatically updates the record in the database.',
      'Flexible: Lanes map to a choice field; moving cards changes lane position without modifying database field values.'
    ],
    examTrap: 'Confusing Guided vs Flexible boards. Guided boards UPDATE the record field; Flexible boards DO NOT update the record field.',
    recommendedHandsOn: 'From any task list, right-click a State column header and select "Show Visual Task Board" to see an instant Guided board.',
  },
  'Visualizations, Dashboards, and Platform Analytics': {
    coreSummary: 'Platform Analytics and Dashboards aggregate data into interactive widgets, charts, and key performance indicators.',
    highYieldRules: [
      'Reports respect the viewing user\'s Access Control Lists (ACLs). Sharing a report with "Everyone" does NOT grant table data access.',
      'Report types: Bar, Pie, Donut, Single Score, Time Series, List.',
      'Dashboards combine multiple reports, interactive filters, and performance analytics widgets into a single canvas.'
    ],
    examTrap: 'Assuming sharing a report allows unauthorized users to see restricted rows. ACLs always filter report data at runtime!',
    recommendedHandsOn: 'Create a quick Donut report on incident grouped by Category and test sharing options.',
  },
  'Notifications': {
    coreSummary: 'Email notifications alert users when specific record events occur, conditions are met, or workflows trigger messages.',
    highYieldRules: [
      'Three configuration tabs: "When to send" (conditions/events), "Who will receive" (users/groups/fields), "What it will contain" (subject/HTML body).',
      'Dynamic field variables use the syntax ${field_name} (e.g., ${number}, ${caller_id.name}).',
      'Users can configure personal notification subscriptions and channels in their user preferences.'
    ],
    examTrap: 'Incorrect syntax for variables. In email notifications, use ${field_name}, not [field_name] or %field_name%.',
    recommendedHandsOn: 'Open System Policy > Email > Notifications, inspect "Incident opened for caller", and review the ${number} syntax.',
  },

  // --- DOMAIN 4: Self Service & Automation ---
  'Knowledge Management': {
    coreSummary: 'Knowledge Management organizes documentation into Knowledge Bases with versioning, translation, and user permissions.',
    highYieldRules: [
      'User Criteria controls access using "Can Read" and "Can Contribute" definitions.',
      'Workflows govern publication: Knowledge - Instant Publish vs Knowledge - Approval Publish.',
      'Social Q&A and article feedback (helpful yes/no, star ratings) drive article search ranking.'
    ],
    examTrap: 'Believing ACLs are the primary way knowledge base reader access is configured. Knowledge uses User Criteria, not ACLs!',
    recommendedHandsOn: 'Navigate to Knowledge > Administration > Knowledge Bases, open IT Knowledge Base, and review the Can Read related list.',
  },
  'Service Catalog': {
    coreSummary: 'Service Catalog provides a consumer-like storefront for ordering goods and services, driving fulfiller task generation.',
    highYieldRules: [
      'Hierarchy: Request [sc_request] -> Requested Item [sc_req_item] -> Catalog Task [sc_task].',
      'Record Producer: A catalog item that creates a task record (such as an Incident) directly from Portal forms.',
      'Order Guide: Bundles multiple items into a single unified onboarding or setup interview.',
      'Variable Sets: Reusable groups of catalog variables shared across multiple catalog items.'
    ],
    examTrap: 'Confusing Record Producers with standard Catalog Items. Standard items create sc_req_item; Record Producers create task records like incident.',
    recommendedHandsOn: 'Open Service Catalog > Maintain Items and inspect "Create Incident" to see how it maps variables to incident fields.',
    mnemonic: 'REQ > RITM > SCTASK (Order > Item > Work).',
  },
  'Workflow Studio': {
    coreSummary: 'Workflow Studio unifies Flow Designer, Process Automation Designer (PAD), Playbooks, and Decision Builder in one modern authoring suite.',
    highYieldRules: [
      'Flow Designer components: Trigger (when it runs), Actions (discrete tasks), and Data Pills (output variables).',
      'Spokes are scoped IntegrationHub bundles containing pre-built actions for third-party systems (Slack, Teams, Jira).',
      'Flow Logic controls execution paths (If, Else, For Each, Do in Parallel).'
    ],
    examTrap: 'Using legacy Workflow Editor for new development. Workflow Studio / Flow Designer is ServiceNow\'s strategic automation engine.',
    recommendedHandsOn: 'Open Flow Designer and create a simple test flow triggered on "Record Created" on the Incident table.',
  },
  'Virtual Agent': {
    coreSummary: 'Virtual Agent is a conversational chatbot interface capable of resolving end-user requests using Natural Language Understanding (NLU).',
    highYieldRules: [
      'Topics define dialogue conversation trees using user input controls, bot responses, and script utilities.',
      'Live Agent Transfer seamlessly escalates bot conversations to human fulfillers in Agent Chat.',
      'Pre-built conversation templates cover password resets, ticket status inquiries, and catalog ordering.'
    ],
    examTrap: 'Thinking Virtual Agent is only an automated script. It includes live agent handover and NLU intent recognition.',
    recommendedHandsOn: 'Navigate to Conversational Interfaces > Virtual Agent > Designer to preview topic conversation flows.',
  },

  // --- DOMAIN 5: Database Management and Platform Security (30% HIGHEST PRIORITY) ---
  'Data Schema': {
    coreSummary: 'HIGHEST EXAM PRIORITY (30%): Tables, columns, and records structure the entire ServiceNow database. Base tables provide inheritance.',
    highYieldRules: [
      'Custom tables in the global scope are prefixed with "u_"; scoped application tables use "x_<vendor>_<app>_".',
      'Reference fields store the 32-character sys_id of the foreign record and display a magnifying glass lookup.',
      'Table inheritance: child tables (like incident) inherit all fields and business logic from parent tables (task).',
      'Schema Map visually models parent/child relationships and reference connections.'
    ],
    examTrap: 'Forgetting custom field prefixes: global fields are "u_<name>"; scoped fields are "x_<company>_<name>". System fields are "sys_".',
    recommendedHandsOn: 'Open System Definition > Tables, find "incident", click "Show Schema Map", and observe the relationship lines pointing to task.',
  },
  'Application/Access Control': {
    coreSummary: 'HIGHEST EXAM PRIORITY: Access Control Lists (sys_security_acl) enforce row and column-level security. security_admin role required.',
    highYieldRules: [
      'Two-step evaluation order: Table-level ACL checked FIRST. Only if Table-level passes is Field-level evaluated.',
      'Specificity hierarchy: table.field > parent.field > table.* > parent.* > *.* (most specific wins).',
      'Three evaluation criteria must ALL evaluate to true: Roles, Condition builder, and Advanced Script.',
      'Editing ACLs requires the elevated security_admin role, even for users with the admin role.'
    ],
    examTrap: 'If Table-level ACL check fails, the user is denied access immediately. Field-level rules are NEVER evaluated if the table check fails!',
    recommendedHandsOn: 'Elevate your role to security_admin in your user avatar menu, then open System Security > Access Control (ACL) to see editable fields.',
    mnemonic: 'Table check FIRST, then Field check.',
  },
  'Importing Data': {
    coreSummary: 'Data import pipeline: Data Source -> Staging Import Set table -> Transform Map -> Target Production Table.',
    highYieldRules: [
      'Import Set tables act as staging areas and are automatically prefixed with "u_imp_" or "u_".',
      'Transform Maps map source columns to target columns (Auto Map Matching Fields or Mapping Assist).',
      'Coalesce option: If true, uses the field as a unique match key. Match found = UPDATE; No match = INSERT.',
      'If multiple fields are marked as coalesce, ALL coalesce fields must match for an update (composite key).'
    ],
    examTrap: 'If NO field is marked as Coalesce, ServiceNow inserts EVERY imported row as a brand new record, causing duplicates.',
    recommendedHandsOn: 'Inspect System Import Sets > Create Transform Map and observe the "Coalesce" checkbox in the Field Maps related list.',
  },
  'CMDB and CSDM': {
    coreSummary: 'CMDB stores Configuration Items (CIs) on base table cmdb_ci. CSDM 4.0 provides a prescriptive standard connecting CIs to Business Services.',
    highYieldRules: [
      'Base table for configuration items is cmdb_ci; parent root table for CI relationships is cmdb_rel_ci.',
      'Asset vs CI: Asset handles financial, depreciation, contract, and warranty lifecycles. CI handles operational health and dependency mapping.',
      'Dependency Views graphically display upstream and downstream CI relationships.',
      'CSDM domains: Foundation, Design, Manage Technical Services, and Sell/Consume.'
    ],
    examTrap: 'Confusing cmdb with cmdb_ci. cmdb_ci is the base table that holds configuration items (servers, databases, applications).',
    recommendedHandsOn: 'Open Configuration > Base Items > Servers, choose a server, and click the Dependency Views icon next to the Name field.',
  },
  'Security Center': {
    coreSummary: 'Security Center monitors instance posture, security baselines, and flags misconfigured properties or excessive permissions.',
    highYieldRules: [
      'Instance Security Dashboard tracks hardening scores across Identity, Data Protection, and Instance access.',
      'Security Hardening baselines recommend settings like restricting public pages, enabling MFA, and enforcing HTTPS.',
      'Security Center does not alter data directly; it identifies vulnerabilities and hardening recommendations.'
    ],
    examTrap: 'Thinking Security Center automatically deletes inactive accounts. It audits and highlights security posture risks.',
    recommendedHandsOn: 'Search for "Security Center" in the application navigator to view the security score and hardening dashboard.',
  },
  'Shared Responsibility Model': {
    coreSummary: 'ServiceNow manages cloud data centers, physical hardware, and hypervisor patching. The customer manages data, users, and ACLs.',
    highYieldRules: [
      'ServiceNow Responsibility: Physical security, datacenter availability, hypervisor host patching, network infrastructure.',
      'Customer Responsibility: User role assignments, Access Control Lists (ACLs), data classification, passwords, and custom scripts.',
      'Customer is always responsible for who has access to their data inside their instance.'
    ],
    examTrap: 'Selecting that ServiceNow manages user access and ACLs. The CUSTOMER is always responsible for configuring their own ACLs and roles!',
    recommendedHandsOn: 'Review the Shared Responsibility matrix in ServiceNow trust documentation.',
  },

  // --- DOMAIN 6: Data Migration and Integration ---
  'UI Policies': {
    coreSummary: 'UI Policies dynamically govern form fields (Mandatory, Read-Only, Visible) on the client side without requiring JavaScript code.',
    highYieldRules: [
      'UI Policy Actions: set Mandatory (true/false/leave alone), Visible (true/false/leave alone), Read-only (true/false/leave alone).',
      'Reverse if false checkbox automatically reverses actions when conditions evaluate to false.',
      'Global checkbox ensures the policy executes across all views; View field scopes it to a specific view.',
      'UI Policies execute on the client browser after form load and when condition fields change.'
    ],
    examTrap: 'Writing a Client Script when a UI Policy can do it without code. UI Policies are the preferred no-code method for mandatory/read-only/visible.',
    recommendedHandsOn: 'Open an Incident, right-click header > Configure > UI Policies, and review a condition like "State is Closed".',
  },
  'Business Rules': {
    coreSummary: 'Business Rules are server-side JavaScript programs that run when database operations (query, insert, update, delete) occur.',
    highYieldRules: [
      'Execution Timings: Before (before database commit), After (after database commit), Async (queued background job), Display (before form load).',
      'The "current" object represents the record being modified; "previous" represents values prior to the change.',
      'Before Business Rules can modify current.field without calling current.update(). NEVER call current.update() in a Business Rule!',
      'Display Business Rules populate the g_scratchpad object to pass server data to client scripts.'
    ],
    examTrap: 'Calling current.update() in a Business Rule. This can trigger infinite recursive loops and is a classic exam failure trap!',
    recommendedHandsOn: 'Inspect System Policy > Rules > Business Rules, filter by Table = incident, and look at the "When to run" tab.',
    mnemonic: 'B-A-A-D: Before, After, Async, Display.',
  },
  'System update sets': {
    coreSummary: 'Update Sets bundle configuration customizations from development to test/prod. They capture configurations, NEVER data records.',
    highYieldRules: [
      'CAPTURED: Business Rules, Client Scripts, UI Policies, Workflows, Form Layouts, Table Definitions, Reports.',
      'NOT CAPTURED: Data records (incidents, users in sys_user, groups, schedules, assets).',
      'State must be set to "Complete" before retrieval on the target instance.',
      'Migration sequence: Retrieve -> Preview Update Set (resolve conflicts) -> Commit Update Set.'
    ],
    examTrap: 'Believing new user records, group members, or test incidents are moved in Update Sets. Data records are NEVER captured in Update Sets!',
    recommendedHandsOn: 'Open System Update Sets > Local Update Sets, create a test set, make a form change, and inspect the Customer Updates related list.',
  },
  'Scripting in ServiceNow': {
    coreSummary: 'ServiceNow uses JavaScript across both client and server tiers. Client scripts use g_form; server scripts use GlideRecord.',
    highYieldRules: [
      'Client Scripts: onLoad, onChange, onSubmit, onCellEdit. Interact with forms via GlideForm (g_form) and GlideUser (g_user).',
      'Server Scripts: Business Rules, Script Includes, Workflow actions. Interact with database via GlideRecord and GlideSystem (gs).',
      'Script Includes are reusable server-side JavaScript libraries (Client-callable via GlideAjax).'
    ],
    examTrap: 'Using GlideRecord synchronously inside Client Scripts. GlideRecord on the client is bad practice; use GlideAjax or g_scratchpad instead.',
    recommendedHandsOn: 'Open the browser console on a ServiceNow form and type g_form.getValue(\'priority\') to see the client API in action.',
  },
};

export function getCuratedTipForTopic(topic: string, domainId?: number, domainTitle?: string): StudyTipData {
  const match = CURATED_STUDY_TIPS[topic];
  if (match) {
    return {
      topic,
      domainId: domainId || 1,
      domainTitle: domainTitle || 'ServiceNow Platform',
      ...match,
      source: 'curated-blueprint',
    };
  }

  // Generic fallback if topic is custom
  return {
    topic,
    domainId: domainId || 5,
    domainTitle: domainTitle || 'ServiceNow Platform',
    coreSummary: `Focus on how "${topic}" interacts with ServiceNow core architecture, base tables, and security policies.`,
    highYieldRules: [
      'Identify whether this feature executes on the Client (browser DOM) or Server (cloud database).',
      'Verify role requirements: admin vs security_admin vs fulfiller roles.',
      'Check whether changes made are captured in Update Sets (configuration) or not (data records).'
    ],
    examTrap: 'Questions on this topic often include distractors that invert client-side and server-side responsibilities.',
    recommendedHandsOn: `Search for "${topic}" in your ServiceNow Personal Developer Instance (PDI) navigator and test configuring it.`,
    mnemonic: 'Client = Speed & UX; Server = Security & Data Integrity.',
    source: 'curated-blueprint',
  };
}
