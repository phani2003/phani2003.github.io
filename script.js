/* ==========================================================================
   phani@cloud-ai — terminal portfolio engine
   Pure vanilla JS. No frameworks, no build step.

   HOW TO PERSONALIZE:
   Everything a recruiter will read lives in the CONFIG object below.
   Edit CONFIG, drop your resume PDF into assets/resume/, and redeploy.
   ========================================================================== */

'use strict';

/* ==========================================================================
   1. CONFIG — edit this block with your real information
   ========================================================================== */
const CONFIG = {
  name: 'Phani Bhushan',
  handle: 'phani',
  title: 'Cloud & AI Platform Engineer',
  location: 'India',
  email: 'phani@example.com',           // TODO: replace with real email
  github: 'https://github.com/phani',    // TODO
  linkedin: 'https://linkedin.com/in/phani', // TODO
  resumePath: 'assets/resume/Phani_Resume.pdf', // TODO: add the actual file

  company: {
    name: 'Tata Consultancy Services',
    role: 'Cloud & AI Platform Engineer',
    period: 'Aug 2024 – Present',
    bullets: [
      'Design and operate multi-cloud infrastructure across AWS and Azure using Terraform-first workflows.',
      'Build generative AI pipelines and internal copilots using LangChain, LangGraph and RAG architectures.',
      'Own CI/CD, container orchestration (Docker/Kubernetes) and platform reliability for client workloads.',
      'Automate operational workflows using Power Automate and Copilot Studio to cut manual toil.',
      'Partner with security teams to bake IAM least-privilege and policy-as-code into every deployment.'
    ]
  },

  projects: [
    {
      title: 'Cloud Landing Zone Automation',
      stack: ['Terraform', 'AWS', 'Azure', 'Python'],
      summary: 'Reusable IaC modules that stand up a compliant multi-account landing zone in under 30 minutes.',
      details: [
        'Modular Terraform stacks for networking, IAM guardrails, logging and cost controls.',
        'Policy-as-code checks (OPA/Sentinel-style) run in CI before any apply.',
        'Self-service account vending via a lightweight internal CLI.'
      ]
    },
    {
      title: 'RAG-Powered Internal Copilot',
      stack: ['LangChain', 'LangGraph', 'FastAPI', 'Vector DB'],
      summary: 'Retrieval-augmented assistant that answers infra and process questions from internal docs.',
      details: [
        'Ingests runbooks, wikis and postmortems into a versioned vector store.',
        'LangGraph orchestrates multi-step retrieval, tool calls and citation-backed answers.',
        'Deployed behind FastAPI with streaming responses and usage analytics.'
      ]
    },
    {
      title: 'Zero-Touch Deployment Pipeline',
      stack: ['GitHub Actions', 'Docker', 'Kubernetes', 'Terraform'],
      summary: 'End-to-end pipeline from PR to production with automated rollback on health-check failure.',
      details: [
        'Ephemeral preview environments per pull request.',
        'Progressive rollout with automated canary analysis.',
        'One command rollback wired into on-call tooling.'
      ]
    },
    {
      title: 'Workflow Automation Suite',
      stack: ['Power Automate', 'Copilot Studio', 'Azure Functions'],
      summary: 'Automated recurring approval and reporting workflows, saving several team-hours per week.',
      details: [
        'Copilot Studio bot handles first-line support triage.',
        'Power Automate flows sync tickets across tools with zero manual entry.',
        'Azure Functions handle the custom logic Power Automate can\u2019t express natively.'
      ]
    }
  ],

  skills: {
    Cloud: ['AWS', 'Azure', 'Serverless', 'Cost Optimization'],
    'Infra as Code': ['Terraform', 'Ansible', 'Policy-as-Code'],
    Platform: ['Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions'],
    Languages: ['Python', 'Bash', 'JavaScript'],
    AI: ['LangChain', 'LangGraph', 'RAG', 'FastAPI'],
    'Low-Code / Automation': ['Copilot Studio', 'Power Automate'],
    Security: ['IAM', 'Least-Privilege Design', 'Secrets Management']
  },

  certifications: [
    'AWS Certified Solutions Architect \u2013 Associate',
    'Microsoft Certified: Azure Administrator Associate',
    'HashiCorp Certified: Terraform Associate'
  ],

  education: {
    degree: 'B.Tech in Computer Science',
    school: '(add your university)',
    period: '(add years)'
  },

  timeline: [
    { year: '2024', text: 'Joined Tata Consultancy Services as Cloud & AI Platform Engineer.' },
    { year: '2023', text: 'Shipped first production Terraform module set for internal landing zones.' },
    { year: '2022', text: 'Started building with generative AI \u2014 LangChain, RAG, early copilots.' }
  ]
};

/* ==========================================================================
   2. Small render helpers — build sanitized DOM, never innerHTML raw input
   ========================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function el(tag, opts = {}, children = []) {
  const node = document.createElement(tag);
  if (opts.class) node.className = opts.class;
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.html !== undefined) node.innerHTML = opts.html; // only used with trusted, static strings
  if (opts.attrs) Object.entries(opts.attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (opts.data) Object.entries(opts.data).forEach(([k, v]) => (node.dataset[k] = v));
  children.forEach((c) => c && node.appendChild(c));
  return node;
}

function line(text, cls = 'out-line') {
  return el('div', { class: cls, text });
}

function heading(text) {
  return el('div', { class: 'out-line out-heading', text });
}

function link(url, label) {
  return el('a', {
    class: 'out-link',
    text: label || url,
    attrs: { href: url, target: '_blank', rel: 'noopener noreferrer' }
  });
}

function kv(key, val) {
  return el('div', { class: 'kv-row' }, [
    el('span', { class: 'kv-key', text: key }),
    el('span', { class: 'kv-val', text: val })
  ]);
}

function bar(label, pct) {
  const track = el('div', { class: 'bar-track' }, [
    el('div', { class: 'bar-fill' })
  ]);
  track.firstChild.style.width = pct + '%';
  return el('div', { class: 'bar-row' }, [
    el('span', { class: 'bar-label', text: label }),
    track,
    el('span', { class: 'bar-pct', text: pct + '%' })
  ]);
}

function chip(cmdName) {
  return el('button', { class: 'inline-cmd', text: cmdName, data: { cmd: cmdName } });
}

function block(...nodes) {
  const wrap = el('div', { class: 'output-block' });
  nodes.forEach((n) => wrap.appendChild(n));
  return wrap;
}

/* ==========================================================================
   3. Command registry
   ========================================================================== */
const COMMAND_LIST = [
  'help', 'about', 'whoami', 'skills', 'experience', 'projects', 'certifications',
  'education', 'contact', 'social', 'github', 'linkedin', 'resume', 'cloud', 'aws',
  'azure', 'terraform', 'devops', 'security', 'ai', 'rag', 'architecture', 'techstack',
  'timeline', 'clear', 'banner', 'theme', 'date', 'pwd', 'ls', 'echo', 'neofetch', 'exit'
];

const Commands = {};

Commands.help = () => block(
  heading('Available commands'),
  el('div', { class: 'out-line out-dim' }, [], []),
  ...groupHelp()
);

function groupHelp() {
  const groups = {
    'About me': ['about', 'whoami', 'skills', 'experience', 'timeline', 'education', 'certifications'],
    'Work': ['projects', 'techstack', 'cloud', 'aws', 'azure', 'terraform', 'devops', 'security', 'ai', 'rag', 'architecture'],
    'Reach me': ['contact', 'social', 'github', 'linkedin', 'resume'],
    'System': ['clear', 'banner', 'theme', 'date', 'pwd', 'ls', 'echo', 'neofetch', 'exit']
  };
  const rows = [];
  Object.entries(groups).forEach(([label, cmds]) => {
    rows.push(el('div', { class: 'out-line out-accent out-bold', text: label }));
    const row = el('div', { class: 'out-line' });
    cmds.forEach((c, i) => {
      row.appendChild(chip(c));
      row.appendChild(document.createTextNode(i < cmds.length - 1 ? '  ' : ''));
    });
    rows.push(row);
  });
  rows.push(el('div', { class: 'out-line out-faint', text: '\ntip: some commands respond to more than the obvious \u2014 keep exploring.' }));
  return rows;
}

Commands.about = () => {
  const b = block(
    heading(`${CONFIG.name} \u2014 ${CONFIG.title}`),
    line('I design cloud infrastructure that doesn\u2019t page anyone at 3am, and I build AI systems that ship past a demo.'),
    line('Comfortable moving between Terraform modules, Kubernetes manifests, and LangGraph pipelines in the same afternoon.'),
    line(`Currently at ${CONFIG.company.name} as a ${CONFIG.company.role}.`)
  );
  const tipRow = el('div', { class: 'out-line out-dim' });
  tipRow.append('Try ', chip('skills'), ', ', chip('projects'), ' or ', chip('experience'), ' next.');
  b.appendChild(tipRow);
  return b;
};

Commands.whoami = () => block(
  line(CONFIG.title, 'out-line out-accent out-bold'),
  line('Specializing in:'),
  ...['AWS', 'Azure', 'Infrastructure as Code', 'DevOps', 'Platform Engineering', 'Generative AI']
    .map((s) => line('  \u2022 ' + s))
);

Commands.skills = () => {
  const nodes = [heading('Skills')];
  Object.entries(CONFIG.skills).forEach(([cat, list]) => {
    nodes.push(el('div', { class: 'out-line out-accent out-bold', text: cat }));
    nodes.push(line('  ' + list.join('  \u00b7  ')));
  });
  return block(...nodes);
};

Commands.experience = () => {
  const c = CONFIG.company;
  const nodes = [
    heading(c.name),
    line(`${c.role}    ${c.period}`, 'out-line out-dim'),
    line('')
  ];
  c.bullets.forEach((bPoint) => nodes.push(line('  \u2022 ' + bPoint)));
  return block(...nodes);
};

Commands.projects = () => {
  const nodes = [heading('Projects'), line('Type "project N" to open one \u2014 e.g. project 1', 'out-dim'), line('')];
  CONFIG.projects.forEach((p, i) => {
    nodes.push(el('div', { class: 'out-line' }, [
      el('span', { class: 'out-accent out-bold', text: `[${i + 1}] ${p.title}` })
    ]));
    nodes.push(line('    ' + p.summary, 'out-line out-dim'));
    nodes.push(line('    stack: ' + p.stack.join(', '), 'out-line out-faint'));
  });
  return block(...nodes);
};

function projectDetail(n) {
  const p = CONFIG.projects[n - 1];
  if (!p) return block(line(`No project #${n}. Try "projects" to see the list.`, 'out-error'));
  const nodes = [
    heading(`[${n}] ${p.title}`),
    line(p.summary),
    line('stack: ' + p.stack.join(', '), 'out-dim'),
    line('')
  ];
  p.details.forEach((d) => nodes.push(line('  \u2022 ' + d)));
  return block(...nodes);
}

Commands.certifications = () => block(
  heading('Certifications'),
  ...CONFIG.certifications.map((cItem) => line('  \u2713 ' + cItem, 'out-line out-success'))
);

Commands.education = () => block(
  heading('Education'),
  kv('Degree', CONFIG.education.degree),
  kv('School', CONFIG.education.school),
  kv('Period', CONFIG.education.period)
);

Commands.timeline = () => {
  const nodes = [heading('Timeline')];
  CONFIG.timeline.forEach((t) => {
    nodes.push(el('div', { class: 'out-line' }, [
      el('span', { class: 'out-accent out-bold', text: t.year + '  ' }),
      el('span', { text: t.text })
    ]));
  });
  return block(...nodes);
};

Commands.contact = () => {
  const b = block(heading('Contact'));
  const rows = [
    ['Email', CONFIG.email, 'mailto:' + CONFIG.email],
    ['LinkedIn', CONFIG.linkedin, CONFIG.linkedin],
    ['GitHub', CONFIG.github, CONFIG.github]
  ];
  rows.forEach(([label, textVal, url]) => {
    b.appendChild(el('div', { class: 'kv-row' }, [
      el('span', { class: 'kv-key', text: label }),
      link(url, textVal)
    ]));
  });
  return b;
};

Commands.social = Commands.contact;

Commands.github = () => block(line('Opening GitHub...', 'out-dim'), link(CONFIG.github));
Commands.linkedin = () => block(line('Opening LinkedIn...', 'out-dim'), link(CONFIG.linkedin));

Commands.resume = () => {
  // Trigger a real download; if the file isn't there yet, tell the user honestly.
  const a = document.createElement('a');
  a.href = CONFIG.resumePath;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return block(
    line('Fetching resume.pdf...', 'out-dim'),
    line('If nothing downloaded, the file hasn\u2019t been added yet at ' + CONFIG.resumePath, 'out-warning')
  );
};

Commands.cloud = () => block(
  heading('Cloud footprint'),
  el('pre', { class: 'ascii', text:
`                 ┌───────────────────────┐
                 │        Route 53 /     │
                 │        Front Door     │
                 └───────────┬───────────┘
                             │
                 ┌───────────▼───────────┐
                 │   CDN / API Gateway    │
                 └───────────┬───────────┘
              ┌──────────────┼──────────────┐
     ┌────────▼───────┐┌─────▼──────┐┌───────▼────────┐
     │  ECS / AKS pods ││  Lambda /  ││  Static assets │
     │  (autoscaled)   ││  Functions ││  (S3 / Blob)   │
     └────────┬────────┘└─────┬──────┘└────────────────┘
              │                │
     ┌────────▼────────┐┌──────▼───────┐
     │ RDS / Cosmos DB  ││  Vector DB   │
     └──────────────────┘└──────────────┘
     All provisioned via Terraform · guarded by IAM least-privilege` })
);

Commands.architecture = Commands.cloud;

Commands.aws = () => block(
  heading('AWS'),
  line('IAM \u00b7 VPC \u00b7 EC2 \u00b7 ECS/EKS \u00b7 Lambda \u00b7 S3 \u00b7 RDS \u00b7 CloudFront \u00b7 CloudWatch \u00b7 Route 53'),
  line('Primary cloud for landing-zone automation and container workloads.', 'out-dim')
);

Commands.azure = () => block(
  heading('Azure'),
  line('Entra ID \u00b7 AKS \u00b7 Functions \u00b7 Blob Storage \u00b7 Azure SQL \u00b7 Front Door \u00b7 Monitor'),
  line('Used heavily alongside Copilot Studio and Power Automate integrations.', 'out-dim')
);

Commands.terraform = () => block(
  heading('Terraform'),
  line('Module-first IaC: networking, IAM, compute and data layers versioned and reused across environments.'),
  el('pre', { class: 'ascii', text:
`module "landing_zone" {
  source  = "./modules/landing-zone"
  env     = "prod"
  region  = "ap-south-1"
}` })
);

Commands.devops = () => block(
  heading('DevOps'),
  line('CI/CD with GitHub Actions \u00b7 Docker \u00b7 Kubernetes \u00b7 progressive rollout \u00b7 automated rollback'),
  line('Philosophy: if a deploy can\u2019t roll back in one command, it isn\u2019t done.', 'out-dim')
);

Commands.security = () => block(
  heading('Security'),
  line('IAM least-privilege by default \u00b7 policy-as-code in CI \u00b7 secrets managed, never committed'),
  line('Security is a design constraint, not a post-launch audit.', 'out-dim')
);

Commands.ai = () => block(
  heading('AI pipeline'),
  el('pre', { class: 'ascii', text:
`  User Query
      │
      ▼
 ┌──────────┐    ┌───────────────┐    ┌─────────────┐
 │ Retriever│──▶│  Vector Store  │───▶│  Re-ranker  │
 └────┬─────┘    └───────────────┘    └──────┬──────┘
      │                                       │
      ▼                                       ▼
 ┌──────────────────────────────────────────────────┐
 │      LangGraph orchestration (tools + memory)      │
 └───────────────────────┬────────────────────────────┘
                          ▼
                     LLM response
                   (citation-backed)` })
);

Commands.rag = () => block(
  heading('RAG'),
  line('Retrieval-Augmented Generation: ground LLM answers in your own docs instead of hoping it remembers.'),
  line('Stack: LangChain \u00b7 LangGraph \u00b7 FastAPI \u00b7 vector database \u00b7 citation-checked responses.')
);

Commands.techstack = () => block(
  heading('Tech stack'),
  ...Object.entries(CONFIG.skills).map(([cat, list]) => bar(cat, Math.min(95, 60 + list.length * 8)))
);

Commands.banner = () => block(el('pre', { class: 'ascii', text: BANNER_ART }));

Commands.theme = (args) => {
  if (!args.length) {
    return block(line('Usage: theme <dark|matrix|default>', 'out-dim'));
  }
  const t = args[0].toLowerCase();
  const root = document.documentElement;
  if (t === 'matrix') {
    root.style.setProperty('--accent', '#3fb950');
    root.style.setProperty('--purple', '#3fb950');
    return block(line('Theme set to matrix (green accent).', 'out-success'));
  }
  if (t === 'default' || t === 'dark') {
    root.style.setProperty('--accent', '#58a6ff');
    root.style.setProperty('--purple', '#bc8cff');
    return block(line('Theme reset to default.', 'out-success'));
  }
  return block(line(`Unknown theme "${t}". Try dark, matrix or default.`, 'out-error'));
};

Commands.date = () => block(line(new Date().toString()));
Commands.pwd = () => block(line('/home/visitor'));
Commands.ls = () => block(line('about.txt   skills.json   experience.log   projects/   contact.txt   resume.pdf'));

Commands.echo = (args) => block(line(args.join(' ')));

Commands.neofetch = () => {
  const info = [
    ['visitor@phani', ''],
    ['-------------', ''],
    ['OS', 'PhaniOS (static, GitHub Pages)'],
    ['Role', CONFIG.title],
    ['Stack', 'AWS, Azure, Terraform, K8s, LangChain'],
    ['Uptime', uptimeString()],
    ['Shell', 'phani-sh 1.0'],
    ['Terminal', 'phani-term']
  ];
  const nodes = [];
  const wrap = el('div', { class: 'out-line' });
  const art = el('pre', { class: 'ascii', text: NEOFETCH_ART });
  const infoBox = el('div');
  info.forEach(([k, v]) => {
    if (!v) { infoBox.appendChild(line(k, 'out-line out-accent out-bold')); return; }
    infoBox.appendChild(el('div', { class: 'kv-row' }, [
      el('span', { class: 'kv-key', text: k }),
      el('span', { class: 'kv-val', text: v })
    ]));
  });
  wrap.style.display = 'flex';
  wrap.style.gap = '20px';
  wrap.style.flexWrap = 'wrap';
  wrap.append(art, infoBox);
  return block(wrap);
};

Commands.clear = () => 'CLEAR';
Commands.exit = () => {
  return block(
    line('logout'),
    line('Connection to phani closed.', 'out-dim'),
    line('(refresh the page to reconnect)', 'out-faint')
  );
};

/* ---------------- Secret / easter-egg commands ---------------- */
const Secrets = {
  'sudo hire phani': () => block(
    line('[sudo] password for visitor: ', 'out-dim'),
    line('Permission granted. Excellent choice.', 'out-success out-bold'),
    line(`Reach out: ${CONFIG.email}`, 'out-accent')
  ),
  'hire': () => block(line('Right decision. Try "sudo hire phani" for the full ceremony.', 'out-success')),
  'coffee': () => block(line('\u2615  Brewing... deployment-grade coffee, no downtime.', 'out-warning')),
  'make coffee': () => block(line('bash: make: *** No rule to make target \'coffee\'.', 'out-error'), line('...but here\u2019s one anyway \u2615', 'out-success')),
  'hello': () => block(line(`Hey! Thanks for stopping by ${CONFIG.name}\u2019s terminal.`, 'out-accent')),
  'joke': () => block(line(pick([
    'There are 10 types of people: those who understand binary and those who don\u2019t.',
    'It\u2019s not a bug \u2014 it\u2019s an undocumented feature of the cloud.',
    '99 little bugs in the code, 99 little bugs... take one down, patch it around, 127 little bugs in the code.'
  ]), 'out-line')),
  'hack nasa': () => block(
    line('Initiating uplink...', 'out-dim'),
    line('...', 'out-dim'),
    line('Nice try. This terminal only hacks cloud bills down. \ud83d\ude09', 'out-warning')
  ),
  'fortune': () => block(line(pick([
    'The cloud is just someone else\u2019s computer \u2014 treat it with respect.',
    'Infrastructure as code, empathy as culture.',
    'Ship small, roll back fast, sleep well.'
  ]), 'out-line')),
  'motivate': () => block(line(pick([
    'Every outage you\u2019ve survived made your next design better.',
    'Automate the boring parts so you have energy for the hard parts.',
    'The best runbook is the one you never have to open.'
  ]), 'out-success'))
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function uptimeString() {
  const start = window.__bootTime || Date.now();
  const secs = Math.floor((Date.now() - start) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

/* ==========================================================================
   4. ASCII art
   ========================================================================== */
const BANNER_ART =
`██████╗ ██╗  ██╗ █████╗ ███╗   ██╗██╗    ██████╗ ██╗  ██╗██╗   ██╗███████╗██╗  ██╗ █████╗ ███╗   ██╗
██╔══██╗██║  ██║██╔══██╗████╗  ██║██║    ██╔══██╗██║  ██║██║   ██║██╔════╝██║  ██║██╔══██╗████╗  ██║
██████╔╝███████║███████║██╔██╗ ██║██║    ██████╔╝███████║██║   ██║███████╗███████║███████║██╔██╗ ██║
██╔═══╝ ██╔══██║██╔══██║██║╚██╗██║██║    ██╔══██╗██╔══██║██║   ██║╚════██║██╔══██║██╔══██║██║╚██╗██║
██║     ██║  ██║██║  ██║██║ ╚████║██║    ██████╔╝██║  ██║╚██████╔╝███████║██║  ██║██║  ██║██║ ╚████║
╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝    ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝`;

const NEOFETCH_ART =
`    ╭──────╮
    │ >_   │
    │      │
    ╰──────╯`;

const BOOT_LINES = [
  { text: BANNER_ART, cls: 'line-accent' },
  { text: '', cls: 'line-dim' },
  { text: CONFIG.title, cls: 'line-text' },
  { text: '', cls: 'line-dim' },
  { text: 'Loading modules...', cls: 'line-dim' },
  { text: '\u2713 Cloud', cls: 'line-ok' },
  { text: '\u2713 AI', cls: 'line-ok' },
  { text: '\u2713 Security', cls: 'line-ok' },
  { text: '\u2713 Platform Engineering', cls: 'line-ok' },
  { text: '', cls: 'line-dim' },
  { text: 'System Ready.', cls: 'line-accent' }
];

/* ==========================================================================
   5. Boot sequence
   ========================================================================== */
async function runBoot() {
  window.__bootTime = Date.now();
  const out = $('#boot-output');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  for (const l of BOOT_LINES) {
    const div = document.createElement('div');
    div.className = l.cls;
    out.appendChild(div);
    if (prefersReducedMotion || l.text.includes('█')) {
      div.textContent = l.text;
    } else {
      await typeInto(div, l.text, 6);
    }
    await sleep(l.text === '' ? 40 : 70);
  }

  const cursor = document.createElement('span');
  cursor.className = 'boot-cursor';
  out.appendChild(cursor);

  await sleep(400);
  $('#boot-screen').style.transition = 'opacity 0.4s ease';
  $('#boot-screen').style.opacity = '0';
  await sleep(400);
  $('#boot-screen').style.display = 'none';
  $('#terminal-app').classList.remove('hidden');

  Terminal.init();
}

function typeInto(node, text, speed) {
  return new Promise((resolve) => {
    let i = 0;
    (function tick() {
      if (i <= text.length) {
        node.textContent = text.slice(0, i);
        i++;
        setTimeout(tick, speed);
      } else {
        resolve();
      }
    })();
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

/* ==========================================================================
   6. Terminal engine
   ========================================================================== */
const Terminal = {
  history: [],
  historyIndex: -1,

  init() {
    this.stream = $('#output-stream');
    this.input = $('#cmd-input');
    this.body = $('#terminal-body');
    this.ghost = $('#ghost-hint');

    this.printWelcome();
    this.bindEvents();
    this.startClock();
    this.input.focus();
  },

  printWelcome() {
    const b = block(
      el('pre', { class: 'ascii', text: BANNER_ART }),
      el('div', { class: 'out-line', text: CONFIG.name, attrs: { style: 'font-size:1.6em; font-weight:800; color:var(--text);' } }),
      line(CONFIG.title, 'out-line out-accent out-bold'),
      el('div', { class: 'out-line out-dim' })
    );
    const tip = el('div', { class: 'out-line out-dim' });
    tip.append('Type ', chip('help'), ' to get started.');
    b.appendChild(tip);
    this.stream.appendChild(b);
  },

  bindEvents() {
    this.input.addEventListener('keydown', (e) => this.onKeyDown(e));
    this.input.addEventListener('input', () => this.updateGhost());

    $('#focus-catcher').addEventListener('click', () => this.input.focus());
    this.body.addEventListener('click', () => this.input.focus());

    $$('.inline-cmd').forEach((btn) => this.bindChip(btn));

    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        this.clearScreen();
      }
    });

    // Delegate clicks for chips added dynamically later
    this.stream.addEventListener('click', (e) => {
      const t = e.target.closest('.inline-cmd');
      if (t) this.runFromChip(t.dataset.cmd);
    });
  },

  bindChip(btn) {
    btn.addEventListener('click', () => this.runFromChip(btn.dataset.cmd));
  },

  runFromChip(cmd) {
    this.input.value = cmd;
    this.submit();
  },

  onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.navigateHistory(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.navigateHistory(1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      this.autocomplete();
    }
  },

  navigateHistory(dir) {
    if (!this.history.length) return;
    this.historyIndex = Math.min(
      this.history.length,
      Math.max(0, this.historyIndex + dir)
    );
    this.input.value = this.history[this.historyIndex] ?? '';
    this.updateGhost();
    requestAnimationFrame(() => {
      this.input.selectionStart = this.input.selectionEnd = this.input.value.length;
    });
  },

  autocomplete() {
    const val = this.input.value.trim();
    if (!val) return;
    const matches = COMMAND_LIST.filter((c) => c.startsWith(val.toLowerCase()));
    if (matches.length === 1) {
      this.input.value = matches[0];
      this.updateGhost();
    } else if (matches.length > 1) {
      this.printEcho(this.input.value, true);
      this.stream.appendChild(block(line(matches.join('   '), 'out-dim')));
      this.scrollToBottom();
    }
  },

  updateGhost() {
    const val = this.input.value;
    if (!val) { this.ghost.textContent = ''; return; }
    const match = COMMAND_LIST.find((c) => c.startsWith(val.toLowerCase()) && c !== val.toLowerCase());
    this.ghost.textContent = match ? match : '';
  },

  submit() {
    const raw = this.input.value;
    const trimmed = raw.trim();
    this.printEcho(raw);
    this.input.value = '';
    this.ghost.textContent = '';

    if (trimmed) {
      this.history.push(trimmed);
      this.historyIndex = this.history.length;
      this.execute(trimmed);
    }
    this.scrollToBottom();
  },

  printEcho(cmdText) {
    const echo = el('div', { class: 'echo-line' }, [
      el('span', { class: 'prompt-user', text: 'visitor' }),
      el('span', { class: 'out-dim', text: '@' }),
      el('span', { class: 'prompt-host', text: 'phani' }),
      el('span', { class: 'out-dim', text: ':~$\u00a0' }),
      el('span', { text: cmdText })
    ]);
    this.stream.appendChild(echo);
  },

  execute(raw) {
    const lower = raw.toLowerCase().trim();

    // secrets checked as full-string matches first
    if (Secrets[lower]) {
      this.stream.appendChild(Secrets[lower]());
      return;
    }

    // "project N"
    const projectMatch = lower.match(/^project\s+(\d+)$/);
    if (projectMatch) {
      this.stream.appendChild(projectDetail(parseInt(projectMatch[1], 10)));
      return;
    }

    const [cmd, ...args] = raw.trim().split(/\s+/);
    const key = cmd.toLowerCase();

    if (Commands[key]) {
      const result = Commands[key](args);
      if (result === 'CLEAR') {
        this.clearScreen();
        return;
      }
      this.stream.appendChild(result);
      return;
    }

    this.stream.appendChild(block(
      line(`command not found: ${cmd}`, 'out-error'),
      (() => {
        const t = el('div', { class: 'out-line out-dim' });
        t.append('Type ', chip('help'), ' to see available commands.');
        return t;
      })()
    ));
  },

  clearScreen() {
    this.stream.innerHTML = '';
  },

  scrollToBottom() {
    this.body.scrollTop = this.body.scrollHeight;
  },

  startClock() {
    const clockEl = $('#tb-clock');
    const tick = () => {
      clockEl.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
    };
    tick();
    setInterval(tick, 1000);
  }
};

/* ==========================================================================
   7. Boot
   ========================================================================== */
window.addEventListener('DOMContentLoaded', runBoot);
