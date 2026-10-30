// All real content, migrated from the previous site. No invented data.

export const profile = {
  name: "Diwakar Ray Yadav",
  role: "Growth Intern at Springbase AI",
  location: "Kathmandu, Nepal",
  email: "diwak4r.comp@gmail.com",
  /** One line, same as the hero on the classic site. */
  intro:
    "I'm a BIT student in Kathmandu. I test new AI models by building things with them, and I work on growth at Springbase AI.",
  story: [
    "My first job had nothing to do with AI. I worked in an office in Kathmandu, handling NEPSE share trading for a few accounts and keeping the CCTV system running.",
    "But I've always loved tinkering and exploring. So when AI came along, I started playing with it, and I never really stopped.",
    "That curiosity took me to The Mindsnack, an AI startup here in Kathmandu. I helped people find them on Google and in AI search, and I rebuilt their website.",
    "Along the way, I noticed a problem. Most developers in Nepal can't pay for AI tools, because they don't have international cards. So I built Nepal AI Gateway, an AI API made for them. Right now it gives developers a free API for a stealth model, no card needed.",
    "Today I study BIT, work as a Growth Intern at Springbase AI, and contribute to open source. On the side, I'm learning Python through CS50P.",
    "When a new AI model drops, I test it by building something, like a whole castle in one HTML file, and share it on X.",
  ],
  exploring: [
    "AI Agents",
    "Model Testing",
    "SEO + AEO",
    "AI Workflows",
    "Browser Automation",
    "Three.js Worlds",
  ],
};

export const socials = [
  { label: "GitHub", href: "https://github.com/Diwak4r" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/diwak4r/" },
  { label: "X", href: "https://x.com/Norwakar" },
  { label: "Instagram", href: "https://www.instagram.com/diwak4r/" },
] as const;

export const experience = [
  {
    role: "Growth Intern",
    org: "Springbase AI",
    period: "Sep 2026 - Present",
    detail:
      "Organic growth: community distribution, AI directory listings, content, and referral tracking.",
  },
  {
    role: "AI Growth Strategist",
    org: "The Mindsnack",
    period: "Jun - Sep 2026",
    detail:
      "Worked on how the company shows up in Google and AI search (SEO and AEO), and rebuilt its website.",
  },
  {
    role: "Executive Assistant & IT Operations",
    org: "MC Group of Companies",
    period: "2024 - Early 2026",
    detail:
      "Ran the daily office work: email, Excel reports, and documents. Fixed PC and WiFi problems and handled NEPSE / TMS tasks. This is where I started using AI to work faster.",
  },
];

export const education = [
  {
    degree: "Bachelor of Information Technology",
    school: "Himalayan Whitehouse International College",
    period: "2024 - Present",
  },
  {
    degree: "Diploma in Computer Application",
    school: "IT Plus Computer Institute",
    period: "2022 - 2023",
  },
  {
    degree: "+2 Science (NEB)",
    school: "Shree Mahadev Janata Model Secondary School, Harion, Sarlahi",
    period: "2021 - 2023",
  },
];

export const skillGroups = [
  {
    group: "Building",
    items: [
      "HTML, CSS & JavaScript",
      "Three.js",
      "React & Next.js",
      "Cloudflare Workers",
      "Supabase",
      "PowerShell",
      "Git & GitHub",
    ],
  },
  {
    group: "Working with AI",
    items: [
      "Testing new models",
      "Building with coding agents",
      "LLM APIs & gateways",
      "Agent workflows",
      "Browser automation",
    ],
  },
  {
    group: "Growth",
    items: ["SEO & AEO", "Community distribution", "Content", "Referral tracking"],
  },
  {
    group: "CS foundations",
    items: [
      "C & C++",
      "Java",
      "Python (learning)",
      "Data structures",
      "Operating systems",
      "ESP32 / Arduino",
    ],
  },
  {
    group: "Office & IT",
    items: ["Excel reporting", "PC & network support", "NEPSE / TMS"],
  },
];

export const projects = [
  {
    name: "Nepal AI Gateway",
    flagship: true,
    live: true,
    description:
      'A free AI API for developers in Nepal. Sign in with Google, get a key, and call the stealth model "diwakar" through the standard OpenAI API: 2M tokens a day, no card.',
    tags: ["AI Gateway", "LLMs", "Web"],
    href: "https://ai.diwakaryadav.com.np/",
    linkLabel: "Open Live Site",
    image: "/images/nag-screenshot.webp",
  },
  {
    name: "SystemCleaner Pro",
    flagship: false,
    live: false,
    description:
      "A Windows cleanup script that clears temporary files, caches, and clutter to keep systems running lean. Born from real IT troubleshooting work.",
    tags: ["Windows", "Automation"],
    href: "https://github.com/Diwak4r/SystemCleanerPro",
    linkLabel: "View on GitHub",
    image: null,
  },
  {
    name: "File Organizer",
    flagship: false,
    live: false,
    description:
      "A second-semester project that sorts files into folders by type. The build that taught me the most about how automation works under the hood.",
    tags: ["Automation", "Learning Project"],
    href: "https://github.com/Diwak4r/File-Organizer",
    linkLabel: "View on GitHub",
    image: null,
  },
];

/** The 3D worlds from the classic site's "AI Builds". Each one runs inside a
 *  DiwakarOS window. Burg Falkenrast refuses cross-site framing, so a copy of
 *  its single HTML file ships in public/worlds/. */
export interface World {
  id: string;
  name: string;
  description: string;
  tags: string[];
  image: string;
  /** What loads inside the window */
  src: string;
  /** The public Netlify page, for "open in new tab" */
  href: string;
  /** iframe sandbox. Never lets a world navigate or script the OS itself. */
  sandbox: string;
}

/** The local copy is same-origin, so it gets NO allow-same-origin: an opaque
 *  origin keeps it away from the OS's storage and DOM. */
const LOCAL_SANDBOX = "allow-scripts allow-pointer-lock";
/** Cross-origin Netlify builds keep their own origin but cannot touch the top page. */
const REMOTE_SANDBOX = "allow-scripts allow-same-origin allow-pointer-lock allow-popups";

export const worlds: World[] = [
  {
    id: "burg-falkenrast",
    name: "Burg Falkenrast",
    description:
      "A hilltop castle that builds itself stone by stone, 7,817 stones in all. When it is done, you can walk through the gate and into the great hall.",
    tags: ["Three.js", "One HTML file"],
    image: "/images/builds/burg-falkenrast.webp",
    src: "/worlds/burg-falkenrast/index.html",
    href: "https://burg-falkenrast.netlify.app/",
    sandbox: LOCAL_SANDBOX,
  },
  {
    id: "olympus",
    name: "Olympus",
    description:
      "A Greco-Roman acropolis made only from code. No 3D models and no image textures: every column, leaf, waterfall and cloud is generated when the page loads.",
    tags: ["Three.js", "Procedural"],
    image: "/images/builds/olympus.webp",
    src: "https://olympus-acropolis.netlify.app/",
    href: "https://olympus-acropolis.netlify.app/",
    sandbox: REMOTE_SANDBOX,
  },
  {
    id: "endless-rail",
    name: "Endless Rail",
    description:
      "A train ride that never ends. The world is generated as you go, from meadows to autumn forests, desert and alpine peaks.",
    tags: ["Three.js", "Procedural"],
    image: "/images/builds/endless-rail.webp",
    src: "https://endless-rail-diwak4r.netlify.app/",
    href: "https://endless-rail-diwak4r.netlify.app/",
    sandbox: REMOTE_SANDBOX,
  },
  {
    id: "desert-storm",
    name: "Desert Storm",
    description:
      "A first-person military shooter that runs in the browser. Move, aim, scope and reload, with no install and no game engine.",
    tags: ["Three.js", "Game"],
    image: "/images/builds/desert-storm.webp",
    src: "https://magical-moxie-45d3e3.netlify.app/",
    href: "https://magical-moxie-45d3e3.netlify.app/",
    sandbox: REMOTE_SANDBOX,
  },
];

const BLOG = "https://www.diwakaryadav.com.np/blog";

/** Every post on the classic blog, newest first. */
export const posts = [
  {
    title: "GPT-6, Claude 5.5, Gemini 4: The October 2026 Model Rush, Explained",
    category: "AI & Models",
    excerpt:
      "GPT-6, Claude 5.5 and Gemini 4 all landed within about a month. What each costs, what free users get, and which to try first if you build from Nepal.",
    date: "October 2026",
    readTime: "5 min read",
    href: `${BLOG}/october-2026-ai-models/`,
  },
  {
    title: "Open Models in October 2026: DeepSeek, GLM, Kimi, and Mistral Close the Gap",
    category: "AI & Strategy",
    excerpt:
      "DeepSeek V4.1 Flash, GLM-5.3, Kimi K3 and Mistral Large 4: what the October 2026 open models cost, what runs locally, and how to choose one.",
    date: "October 2026",
    readTime: "5 min read",
    href: `${BLOG}/open-weight-models-october-2026/`,
  },
  {
    title: "Your AI Coding Agent Needs a Leash: 3 Warnings From October 2026",
    category: "AI & Security",
    excerpt:
      "Three October 2026 stories show why AI coding agents need limits: a model that tried to send data out, a hijacked CLI setup, and attackers using agents.",
    date: "October 2026",
    readTime: "6 min read",
    href: `${BLOG}/ai-agent-security-october-2026/`,
  },
  {
    title: "Apps Are Opening Their Doors to AI Agents: Apple, Walmart, and GitHub",
    category: "AI & Strategy",
    excerpt:
      "Apple, Walmart, and GitHub opened official doors for AI agents in October 2026. What MCP is, what changes for users, and what builders should do next.",
    date: "October 2026",
    readTime: "6 min read",
    href: `${BLOG}/apps-opening-to-ai-agents/`,
  },
  {
    title: "AI Myths I Tested: 5 Claims, and 4 Were Flat-Out False",
    category: "AI & Reality",
    excerpt:
      "Five common AI claims put to a hands-on test, with honest results: which held up, which failed, and what the gap between demo and reality really is.",
    date: "July 2026",
    readTime: "9 min read",
    href: `${BLOG}/ai-myths-tested/`,
  },
  {
    title: "Building in Public from Kathmandu: One Year of Shipping AI Projects",
    category: "Builder's Log",
    excerpt:
      "A year-one look back at building and shipping AI projects in public from Kathmandu, with honest lessons on consistency, audience, and shipping ugly.",
    date: "July 2026",
    readTime: "9 min read",
    href: `${BLOG}/building-in-public-kathmandu/`,
  },
  {
    title: "Prompt Engineering Is Dead. Here's What Replaced It",
    category: "AI & Prompting",
    excerpt:
      "Why classic prompt engineering is fading and what replaced it: context engineering, evaluation, and knowing which model to use.",
    date: "June 2026",
    readTime: "7 min read",
    href: `${BLOG}/is-prompt-engineering-dead/`,
  },
  {
    title: "The Free AI Stack: Everything I Use Daily That Costs $0",
    category: "AI & Tools",
    excerpt:
      "The exact set of free AI tools used daily for writing, coding, research, and image work, with honest notes on where the free tier stops being enough.",
    date: "June 2026",
    readTime: "8 min read",
    href: `${BLOG}/free-ai-stack/`,
  },
  {
    title: "AI Agents Are Quietly Breaking the Old 'App' Model",
    category: "AI & Strategy",
    excerpt:
      "A plain-language explanation of what AI agents are, how they differ from chatbots, and why they are reshaping how software gets built.",
    date: "June 2026",
    readTime: "7 min read",
    href: `${BLOG}/what-are-ai-agents/`,
  },
  {
    title: "Claude vs ChatGPT vs Gemini: 6 Months of Daily Use, Real Differences",
    category: "AI & Comparison",
    excerpt:
      "A long-term, hands-on comparison of Claude, ChatGPT, and Gemini after six months of daily use, covering writing, coding, search, and honesty.",
    date: "June 2026",
    readTime: "10 min read",
    href: `${BLOG}/claude-vs-chatgpt-vs-gemini/`,
  },
  {
    title: "How to Run an LLM on a Normal Laptop (No GPU, No PhD)",
    category: "AI & Tutorials",
    excerpt:
      "A beginner-friendly tutorial for running a real LLM on a normal laptop with no graphics card, using Ollama and a quantized model.",
    date: "May 2026",
    readTime: "8 min read",
    href: `${BLOG}/run-llm-locally/`,
  },
  {
    title: "I Tested 7 AI Coding Assistants So You Don't Have To",
    category: "AI & Tools",
    excerpt:
      "A hands-on comparison of 7 AI coding assistants tested on the same real tasks, with honest strengths, weaknesses, and a final verdict.",
    date: "May 2026",
    readTime: "11 min read",
    href: `${BLOG}/best-ai-coding-assistants/`,
  },
  {
    title: "Open-Weight vs Closed AI Models: Which Should You Actually Use?",
    category: "AI & Strategy",
    excerpt:
      "A practical decision guide for choosing open-weight vs closed AI models in 2026, based on cost, privacy, control, and what you actually ship.",
    date: "May 2026",
    readTime: "9 min read",
    href: `${BLOG}/open-vs-closed-models/`,
  },
  {
    title: "Best Free AI Tools, LLMs, and Agent Platforms in 2026",
    category: "AI & Tools",
    excerpt:
      "A practical list of free AI tools, LLMs, and agent platforms in 2026, including chatbots, OCR tools, research agents, and workflow assistants.",
    date: "February 2026",
    readTime: "5 min read",
    href: `${BLOG}/trending-llms/`,
  },
  {
    title: "10 Unconventional Simple Tool Ideas",
    category: "Ideas & Innovation",
    excerpt:
      "10 unconventional simple tool ideas that solve problems hiding in plain sight, from time awareness to self-knowledge.",
    date: "January 2026",
    readTime: "8 min read",
    href: `${BLOG}/simple-tool-ideas/`,
  },
  {
    title: "12 AI Prompting Tips for Better ChatGPT and Claude Results",
    category: "AI & Prompting",
    excerpt:
      "Learn 12 practical AI prompting tips to get better results from ChatGPT, Claude, and other AI assistants.",
    date: "December 2024",
    readTime: "10 min read",
    href: `${BLOG}/prompting-tips/`,
  },
];

/** Diwakar's picks. Every track has the full song plus "viral cut" clips of
 *  its loudest moments; artists and covers come from the real files' tags. */
export interface Track {
  slug: string;
  title: string;
  artist: string;
  cover: string;
  /** The complete song */
  full: string;
  /** The most-played moments, cut into short parts */
  clips: { label: string; audio: string }[];
}

const clipsOf = (slug: string, n: number) =>
  Array.from({ length: n }, (_, i) => ({
    label: `Part ${i + 1}`,
    audio: `/audio/${slug}-${i + 1}.mp3`,
  }));

const track = (slug: string, title: string, artist: string, nClips: number): Track => ({
  slug,
  title,
  artist,
  cover: `/images/music-covers/${slug}.jpg`,
  full: `/audio/full/${slug}.mp3`,
  clips: clipsOf(slug, nClips),
});

export const playlist: Track[] = [
  track("udi-udi", "Udi Udi", "Aneesh, Sarkar, Hruday", 5),
  track("sunflower", "Sunflower", "Post Malone, Swae Lee", 5),
  track("after-hours", "After Hours", "The Weeknd", 5),
  track("reminder", "Reminder", "The Weeknd", 5),
  track("timeless", "Timeless", "The Weeknd, Playboi Carti", 5),
  track("kanhaiyya", "Kanhaiyya", "Jubin Nautiyal, Shashwat Sachdev", 4),
  track("aakhri-ishq", "Aakhri Ishq", "Jubin Nautiyal, Shashwat Sachdev", 4),
  track("gehra-hua", "Gehra Hua", "Arijit Singh, Shashwat Sachdev", 4),
  track("ishq-jalakar", "Ishq Jalakar (Karvaan)", "Shashwat Sachdev, Shahzad Ali", 4),
  track("destiny-mann-atkeya", "Destiny (Mann Atkeya)", "Shashwat Sachdev, Token", 4),
  track("lutt-le-gaya", "Lutt Le Gaya", "Shashwat Sachdev, Simran Choudhary", 3),
  track("move-yeh-ishq-ishq", "Move (Yeh Ishq Ishq)", "Sonu Nigam, Shashwat Sachdev", 4),
  track("bhatbhatey-ma", "BHATBHATEY MA", "PURPLE, Gwala$, 4z", 4),
  track("aaahh-men", "AAAHH MEN!", "Doja Cat", 4),
  track("sorry", "Sorry", "Justin Bieber", 4),
  track("gata-only", "Gata Only", "FloyyMenor, Cris MJ", 4),
  track("gata-only-remix", "Gata Only (Remix)", "FloyyMenor, Ozuna, Anitta", 4),
  track("me-and-the-devil", "Me and the Devil", "Soap&Skin", 4),
  track("f1", "F1", "Hans Zimmer", 4),
];
