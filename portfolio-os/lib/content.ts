// All real content, migrated from the previous site. No invented data.

export const profile = {
  name: "Diwakar Ray Yadav",
  role: "AI Growth Strategist at The Mindsnack",
  location: "Kathmandu, Nepal",
  email: "diwak4r.comp@gmail.com",
  story: [
    "I build AI infrastructure for people the industry skips. I'm a BIT student in Kathmandu shipping commercial products on the side, because good work shouldn't have to wait for a diploma.",
    "My flagship, Nepal AI Gateway, is a commercial LLM proxy built from scratch. It brings NPR-tiered pricing through eSewa to Nepali developers locked out of international payment rails. Under the hood: a Cloudflare Worker architecture, a security audit that closed real vulnerabilities, and an admin console I designed myself.",
    "At The Mindsnack, an official distribution partner of Springbase AI, I run AEO and SEO strategy and redesigned the company's own site from the ground up, based out of The 100 Spaces coworking space in Kathmandu.",
    "The plan is deliberate: Nepal's AI companies first, remote AI roles next, an AI lab after that. Right now I'm rebuilding my fundamentals with CS50P and contributing to open source. No step skipped.",
    "Before AI was the job, it was NEPSE trading across multiple Demat and TMS accounts and HikCentral CCTV administration, the unglamorous machinery that keeps an office running. I still call myself an office executive who leverages AI, not a developer. The rest you'd have to find out by working with me.",
  ],
  exploring: [
    "AI Agents",
    "Claude Code",
    "SEO + AEO",
    "AI Workflows",
    "Browser Automation",
    "Frontend Prototyping",
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
    role: "AI & Workflow Intern",
    org: "The Mindsnack · Springbase AI",
    period: "Present",
    detail:
      "Driving SEO, AEO, and AI-driven workflows to help Springbase AI grow in Nepal.",
  },
  {
    role: "Executive Assistant & IT Operations",
    org: "MC Group of Companies",
    period: "Previous",
    detail:
      "Ran daily office operations: email and Outlook workflows, Excel reporting, documentation, and technical troubleshooting, including NEPSE/TMS tasks and admin coordination.",
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
];

export const skillGroups = [
  {
    group: "AI & LLMs",
    items: [
      "ChatGPT",
      "Claude Code",
      "Codex",
      "Gemini",
      "Perplexity",
      "Cursor",
      "OpenRouter",
      "Prompt Engineering",
      "Browser Agents",
    ],
  },
  {
    group: "AI Practice",
    items: [
      "AI-Assisted Coding",
      "AI-Assisted Research",
      "Workflow Design",
      "Product Testing",
      "Output Evaluation",
    ],
  },
  {
    group: "Web & Prototyping",
    items: [
      "HTML",
      "CSS",
      "JavaScript",
      "Single-File Prototypes",
      "Landing Pages",
      "UI/UX Concepts",
      "Figma",
    ],
  },
  {
    group: "Programming",
    items: [
      "C",
      "C++",
      "Java",
      "OOP",
      "Data Structures",
      "Operating Systems",
      "ESP32 / Arduino",
    ],
  },
  {
    group: "Tools & Ops",
    items: [
      "GitHub",
      "Vercel",
      "Supabase",
      "Google Workspace",
      "Excel",
      "Outlook",
      "IT Support",
      "NEPSE / TMS",
    ],
  },
];

export const projects = [
  {
    name: "Nepal AI Gateway",
    flagship: true,
    live: true,
    description:
      "A unified gateway that brings modern AI models and tools together in one place, built to make AI genuinely accessible for students and small teams across Nepal.",
    tags: ["AI Gateway", "LLMs", "Web"],
    href: "https://ai.diwakaryadav.com.np/",
    linkLabel: "Open Live Site",
    image: "/images/nepal-ai-gateway-shot.png",
  },
  {
    name: "Pryzmira",
    flagship: false,
    live: true,
    description:
      "A personal writing voice AI that learns how you think and write, capturing your authentic tone, style, and perspective to generate content that truly sounds like you.",
    tags: ["Voice AI", "Next.js", "Supabase"],
    href: "https://pryzmira.diwakaryadav.com.np/",
    linkLabel: "Open Live Site",
    image: "/images/pryzmira-shot.png",
  },
  {
    name: "Police Exam Prep",
    flagship: false,
    live: true,
    description:
      "A platform for Nepal Police examination preparation, offering study materials and practice tests.",
    tags: ["Web App", "Education", "React"],
    href: "https://project.diwakaryadav.com.np/",
    linkLabel: "Open Live Site",
    image: "/images/police-exam-shot.png",
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

export const posts = [
  {
    title: "Best Free AI Tools, LLMs, and Agent Platforms in 2026",
    category: "AI & Tools",
    excerpt:
      "A practical list of free AI tools, LLMs, and agent platforms that are actually worth testing in 2026.",
    date: "February 2026",
    readTime: "5 min read",
    href: "https://www.diwakaryadav.com.np/blog/trending-llms/",
  },
  {
    title: "12 AI Prompting Tips for Better ChatGPT and Claude Results",
    category: "AI & Prompting",
    excerpt:
      "A hands-on guide to writing clearer prompts, reducing hallucinations, and getting more useful AI outputs.",
    date: "December 2024",
    readTime: "10 min read",
    href: "https://www.diwakaryadav.com.np/blog/prompting-tips/",
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
