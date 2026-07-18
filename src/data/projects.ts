export type ProjectColor = 'orange' | 'blue';

export interface Project {
  title: string;
  problem: string;
  solution: string;
  stack: string[];
  live: string;
  liveLabel: string;
  source: string;
  image?: string;
  monogram?: string;
  color: ProjectColor;
}

export interface SmallTool {
  title: string;
  line: string;
  url: string;
}

export const PROJECTS: Project[] = [
  {
    title: 'nomnomcli',
    problem: 'AI agents guess calories instead of calculating them — nutrition answers are plausible-sounding hallucinations.',
    solution:
      'An agent-first CLI where deterministic code does the math against a bundled USDA food database — the agent is only the voice interface. Russian/English food parsing, recipe import from URLs, local SQLite, zero runtime dependencies.',
    stack: ['Python', 'SQLite', 'USDA FDC', 'Agent skills'],
    live: 'https://github.com/maxjustships/nomnomcli',
    liveLabel: 'View project',
    source: 'https://github.com/maxjustships/nomnomcli',
    monogram: 'NN',
    color: 'orange',
  },
  {
    title: 'YourLandingSucks',
    problem: 'Landing pages lose conversions to issues nobody checks after launch.',
    solution:
      'Agent-driven evidence pipeline: onboarding, watch, and verification for public website surfaces — accessibility, performance, and UX checks with Playwright.',
    stack: ['TypeScript', 'Playwright', 'AI agents'],
    live: 'https://github.com/maxjustships/yourlandingsucks',
    liveLabel: 'View project',
    source: 'https://github.com/maxjustships/yourlandingsucks',
    monogram: 'YLS',
    color: 'orange',
  },
  {
    title: 'Teleplaylist Bot',
    problem: 'Audio files in Telegram chats turn into unorganized scroll.',
    solution:
      'A Telegram bot that organizes audio into playlists — serverless backend on Cloudflare Workers with a D1 database.',
    stack: ['grammY', 'Cloudflare Workers', 'D1', 'Drizzle ORM'],
    live: 'https://t.me/playlists_manager_bot',
    liveLabel: 'Open in Telegram',
    source: 'https://github.com/maxjustships/teleplaylist-bot',
    image: '/assets/teleplaylist.webp',
    color: 'blue',
  },
  {
    title: 'Noise & Beats',
    problem: 'Focus apps are bloated; a browser tab should be enough.',
    solution:
      'A quiet browser instrument for filtered noise colors and rhythmic beats — Web Audio API, installable PWA, fully local-first.',
    stack: ['Astro', 'Web Audio API', 'PWA'],
    live: 'https://noiseandbeats.pages.dev/',
    liveLabel: 'View live',
    source: 'https://github.com/maxjustships/noiseandbeats',
    image: '/assets/noiseandbeats.webp',
    color: 'blue',
  },
  {
    title: 'AI Studio Parser',
    problem: 'Google AI Studio conversation exports are hard to merge and reuse.',
    solution:
      'A local-first browser tool to combine, reorder, and deduplicate exports — drag-and-drop JSON, nothing leaves the machine.',
    stack: ['React', 'Vite', 'Local-first'],
    live: 'https://aistudio-parser.pages.dev/',
    liveLabel: 'View live',
    source: 'https://github.com/maxjustships/ai-studio-parser',
    image: '/assets/aistudioparser.webp',
    color: 'orange',
  },
  {
    title: 'EZ Image Save',
    problem: 'Saving web images in the right format takes too many clicks.',
    solution:
      'A Chrome extension that saves images in your preferred format in one click, with a clean conversion pipeline.',
    stack: ['TypeScript', 'Chrome Extensions API'],
    live: 'https://github.com/maxjustships/ez-img-save',
    liveLabel: 'View project',
    source: 'https://github.com/maxjustships/ez-img-save',
    monogram: 'EZ',
    color: 'blue',
  },
];

export const SMALL_TOOLS: SmallTool[] = [
  {
    title: 'KBFlow',
    line: 'A small page about keyboard-driven workflow love — lessons and challenges for a calmer computer life.',
    url: 'https://kbflow-dev.pages.dev/',
  },
  {
    title: 'Tintpad',
    line: 'A tiny installable lightpad — fills the screen with color and simple animations.',
    url: 'https://tintpad.pages.dev/',
  },
  {
    title: 'Stendhal Book Exporter',
    line: 'Local-first formatter that exports plain text as Stendhal-compatible Minecraft book files.',
    url: 'https://maxjustships.github.io/stendhal-book-exporter/',
  },
  {
    title: 'ZBrush MME Importer',
    line: 'Blender addon for importing ZBrush Multi Map Exporter folders with automatic material building.',
    url: 'https://github.com/maxjustships/zbrush-mme-blender-importer',
  },
  {
    title: 'Edge Reduction Connect',
    line: 'Blender addon that connects mismatched edge strips with predefined reduction patterns.',
    url: 'https://github.com/maxjustships/edge-reduction-addon',
  },
];

export const CONTACT = {
  email: 'max@maxjustships.dev',
  telegram: 'https://t.me/maxjustships',
  telegramLabel: '@maxjustships',
  github: 'https://github.com/maxjustships',
};
