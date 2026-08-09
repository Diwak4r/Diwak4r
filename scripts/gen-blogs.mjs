// Blog generator for diwakaryadav.com.np
// Emits 10 SEO-optimized blog HTML files + 10 on-brand OG SVG cards.
// Reuses the existing prompting-tips template scaffold.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BLOG_DIR = join(ROOT, "blog");
const IMG_DIR = join(ROOT, "images");

const SITE = "https://diwakaryadav.com.np";
const MODIFIED = "2026-08-09";

// ---------------------------------------------------------------------------
// Post data. Body HTML uses the site's existing article classes.
// Rules: no em dash character, concrete + opinionated, one <h1> (the title).
// ---------------------------------------------------------------------------
const POSTS = [
  {
    slug: "open-vs-closed-models",
    title: "Open-Weight vs Closed AI Models: Which Should You Actually Use?",
    subtitle: "The open vs closed debate is mostly noise. Here is how I decide, based on what I ship.",
    tag: "AI & Strategy",
    section: "AI & Strategy",
    emoji: "🔓",
    date: "2026-05-10",
    readtime: "9 min read",
    keywords: ["open weight vs closed AI models", "open source LLM 2026", "Llama vs GPT", "when to use open models"],
    description: "A practical decision guide for choosing open-weight vs closed AI models in 2026, based on cost, privacy, control, and what you actually ship.",
    body: `
<p>Every few weeks someone posts the same fight online: open models vs closed models, as if one side is clearly winning. I used to pick a side too. Then I started shipping real things with both, and the fight stopped mattering. What matters is the job in front of you.</p>

<p>This is not a philosophical essay. It is how I choose, after a year of building AI projects from Kathmandu and breaking things in public. I am not loyal to a license. I am loyal to whatever gets the job done and keeps me owning the result.</p>

<h2>First, the terms people mix up</h2>

<p>"Open source" and "open weight" are not the same thing. Open weight means the trained parameters are published, so you can download and run the model yourself. The training code and the data often stay private. That is Llama, Qwen, and DeepSeek. Closed means the model lives behind an API you call, like ChatGPT, Claude, and Gemini. You never touch the weights.</p>

<p>Both can be "free" to start. The difference is who controls the model after you depend on it.</p>

<h2>When I reach for a closed model</h2>

<p>If the task needs the absolute best reasoning, the longest memory, or the smoothest multimodal input, I use a closed frontier model through its API. For client work where reliability beats everything, I am not going to gamble on a smaller local model.</p>

<p>Closed wins on three things:</p>

<ul>
<li><strong>Quality ceiling.</strong> For hard reasoning, frontier APIs are still ahead.</li>
<li><strong>Zero ops.</strong> No GPU, no server, no updates. You call it and forget it.</li>
<li><strong>Speed of shipping.</strong> When the deadline is tonight, the API is the fastest path.</li>
</ul>

<p>The cost is real though. You pay per token, your data leaves your machine, and the model can change or get more expensive without asking you.</p>

<h2>When I reach for an open-weight model</h2>

<p>This is the part the hype posts skip. Open weight is not "worse for cheap people." It is the right call when any of these are true:</p>

<ul>
<li><strong>Privacy.</strong> Medical, legal, or user data that cannot leave your infrastructure.</li>
<li><strong>Cost at scale.</strong> If you serve 2 million requests a month, a one-time GPU bill beats a per-call API forever.</li>
<li><strong>Control.</strong> You want to fine-tune, quantize, or pin a version that never drifts.</li>
<li><strong>No internet.</strong> Offline tools, embedded devices, or a flaky connection.</li>
</ul>

<p>Running something like Qwen or Llama locally means the model is yours. It will not get "upgraded" underneath you at the worst moment.</p>

<h2>The real trade-off nobody sells you</h2>

<p>Closed models feel free until the bill arrives. Open models feel free until you pay for the GPU, the engineer time, and the latency work. Pick based on which bill you would rather owe.</p>

<blockquote>I do not ask "which model is best?" I ask "which model lets me ship this specific thing today, and keep owning it tomorrow?"</blockquote>

<h2>My default setup</h2>

<p>For most of my projects: a closed frontier model for the hard first draft and reasoning, then an open-weight model self-hosted for the bulk, repetitive, private work. One does the thinking, the other does the volume.</p>

<p>You do not have to marry either. Download a weight, try it for a weekend. If it is not good enough, delete it. That option is the entire point of open weights.</p>

<h2>The honest answer</h2>

<p>Use closed when you need the best brain and fast shipping. Use open weight when you need privacy, scale economics, or control. Most serious builders end up using both, and the people shouting that one side won is just marketing with extra steps.</p>

<p>Start with the API. When the bill or the privacy question bites, that is your signal to go open weight.</p>
`,
    readNext: [
      { title: "I Tested 7 AI Coding Assistants So You Don't Have To", url: "/blog/best-ai-coding-assistants/" },
      { title: "How to Run an LLM on a Normal Laptop (No GPU, No PhD)", url: "/blog/run-llm-locally/" }
    ]
  },

  {
    slug: "best-ai-coding-assistants",
    title: "I Tested 7 AI Coding Assistants So You Don't Have To",
    subtitle: "I gave the same ugly bug to seven assistants. Three nailed it. Two made it worse. Here is the scoreboard.",
    tag: "AI & Tools",
    section: "AI & Tools",
    emoji: "💻",
    date: "2026-05-18",
    readtime: "11 min read",
    keywords: ["best AI coding assistant 2026", "Claude Code vs Cursor", "AI for coding", "which coding assistant"],
    description: "A hands-on comparison of 7 AI coding assistants tested on the same real tasks, with honest strengths, weaknesses, and a final verdict.",
    body: `
<p>I was tired of "top 10 coding AIs" lists that read like ads. So I ran my own test. Same machine, same repo, same three tasks: fix a flaky test, write a small feature, and explain a gnarly legacy function. Seven assistants. No sponsor money.</p>

<p>Here is what actually happened.</p>

<h2>The lineup</h2>

<p>Cursor, Claude Code, GitHub Copilot, Windsurf, Cline, Aider, and Zed's assistant. I used the free or default tier of each where one existed, because that is what most people actually run.</p>

<h2>Task 1: the flaky test</h2>

<p>A test that passed locally and failed in CI about one in five runs. Classic timing bug.</p>

<p>Three of them found the race condition fast: Claude Code, Aider, and Cursor. Copilot suggested a sleep() which is the textbook wrong fix. Windsurf and Zed spun in circles. Cline got there but took four tries.</p>

<h2>Task 2: a small feature</h2>

<p>Add a dark mode toggle that persisted to localStorage and respected system preference.</p>

<p>Cursor and Claude Code produced clean, working code on the first attempt. Windsurf and Zed needed hand-holding. Copilot wrote code that compiled but broke the existing theme. Aider surprised me: it planned the change like an engineer, then executed.</p>

<h2>Task 3: explain the legacy function</h2>

<p>A 200-line function with no comments and worse naming.</p>

<p>Every assistant could summarize it. The gap was depth. Claude Code and Aider explained the why, not just the what. Copilot gave a shallow paraphrase. The others landed in the middle.</p>

<h2>The scoreboard</h2>

<ul>
<li><strong>Claude Code.</strong> Best all-rounder. Reads the repo, plans, executes. Steeper learning curve but worth it.</li>
<li><strong>Cursor.</strong> Best "feels like an editor" experience. Fast, intuitive, great for feature work.</li>
<li><strong>Aider.</strong> Underrated. Best for terminal lovers and careful planning.</li>
<li><strong>Cline.</strong> Solid and open, but slower on hard tasks.</li>
<li><strong>Windsurf.</strong> Nice UX, weaker on real bugs.</li>
<li><strong>Zed.</strong> Fast editor, assistant still early.</li>
<li><strong>Copilot.</strong> Great autocomplete, weakest on reasoning tasks.</li>
</ul>

<h2>What nobody tells you</h2>

<p>The assistant is only as good as the context you give it. I got dramatically better results from all seven once I pointed them at the exact files first. The tool matters less than the brief.</p>

<blockquote>The best coding assistant is the one you actually finish the task with. For me that was Claude Code for hard bugs and Cursor for daily feature work.</blockquote>

<h2>My verdict</h2>

<p>If you want one: start with Cursor. It gets out of your way. If you live in the terminal or fight hard bugs, add Claude Code. Copilot is fine if you only want autocomplete and already pay for it.</p>

<p>None of them replaced reading the code. They just made the boring parts faster. That is the real win, and anyone selling "it writes your whole app" is selling a fantasy.</p>

<h2>How I actually use them in a day</h2>

<p>My default is boring on purpose. Cursor handles the feature work inside the editor. When I hit a nasty bug or need a plan, I paste the relevant files into Claude Code and let it reason. For quick one liners and tests, Copilot autocompletes. The point is I never force one tool to do everything. I match the tool to the moment.</p>

<h2>The pricing reality</h2>

<p>Most of these have a free tier that is enough to learn. The paid plans matter when you code all day and want higher limits and better models. I would not pay for more than one coding assistant unless you are benchmarking. Start free, feel the ceiling, then decide.</p>

<h2>FAQ</h2>

<h3>Do I need to pay to get value?</h3>
<p>No. The free tiers of Cursor and Copilot cover a lot. Pay when the limit actually blocks your work, not before.</p>

<h3>Will an assistant replace a junior developer?</h3>
<p>No. It replaces the boring parts, not the judgment. A junior who uses these well outperforms a senior who refuses them.</p>

<p>Try one this week on a real bug, not a toy example. That is the only test that counts.</p>
`,
    readNext: [
      { title: "Open-Weight vs Closed AI Models: Which Should You Actually Use?", url: "/blog/open-vs-closed-models/" },
      { title: "The Free AI Stack: Everything I Use Daily That Costs $0", url: "/blog/free-ai-stack/" }
    ]
  },

  {
    slug: "run-llm-locally",
    title: "How to Run an LLM on a Normal Laptop (No GPU, No PhD)",
    subtitle: "You do not need a $3,000 graphics card. You need the right model and about ten minutes.",
    tag: "AI & Tutorials",
    section: "AI & Tutorials",
    emoji: "💾",
    date: "2026-05-25",
    readtime: "8 min read",
    keywords: ["run LLM locally laptop", "local AI model no GPU", "Ollama tutorial", "private AI chatbot"],
    description: "A beginner-friendly tutorial for running a real LLM on a normal laptop with no graphics card, using Ollama and a quantized model.",
    body: `
<p>There is a myth that local AI needs a racing PC with a giant GPU. It does not. I run models on a plain laptop with no graphics card, and you can too. This is the exact path I would give a friend.</p>

<h2>Why bother running locally at all</h2>

<p>Three reasons: your data never leaves the machine, it works with no internet, and once it is set up the cost is zero. For notes, drafts, and private documents, that is a big deal.</p>

<h2>Step 1: install Ollama</h2>

<p>Ollama is the easiest on-ramp. On macOS or Linux, one command in the terminal. On Windows, the installer. That is the whole setup. No compiling, no Python environment fights.</p>

<h2>Step 2: pick a small model</h2>

<p>Do not start with the biggest model. Start with a quantized small one. "Quantized" just means the model is compressed so it fits in normal memory. A 3 to 4 billion parameter model runs fine on most laptops and still writes decent code and answers questions.</p>

<p>I usually start people on a small Qwen or Llama build. They are shockingly capable for the size.</p>

<h2>Step 3: run it</h2>

<p>One command pulls the model, and a second starts a chat in your terminal. Type a question. Get an answer. That is a real LLM running on your metal.</p>

<h2>Step 4: give it a face</h2>

<p>The terminal is fine, but most people want a chat window. Point a lightweight local UI at the model and you get a private ChatGPT that lives on your machine. No account, no bill.</p>

<h2>How far can a normal laptop go?</h2>

<p>Honest limits: a small model will not beat a frontier API on hard reasoning. It will stall on very long documents. But for daily writing, brainstorming, and coding help, it is more than enough, and it is private.</p>

<blockquote>I keep a small model running for the 20 little tasks a day. The frontier API handles the few big ones. That split covers almost everything.</blockquote>

<h2>Common mistakes</h2>

<ul>
<li><strong>Starting too big.</strong> A 70B model will crawl on a laptop. Start small, feel the speed, then size up if you must.</li>
<li><strong>Skipping quantization.</strong> The compressed version is the difference between usable and frozen.</li>
<li><strong>Expecting magic.</strong> Local models are great assistants, not oracles.</li>
</ul>

<h2>Your next move</h2>

<p>Install Ollama tonight. Pull one small model. Ask it to summarize something private you would never paste into a web chatbot. That single moment, of it answering with your data never leaving the laptop, is the whole point.</p>

<h2>Tuning for speed on weak hardware</h2>

<p>Three levers: pick a smaller quantized model, close other apps to free memory, and use a UI that streams tokens so it feels responsive. The first model you try will feel slow. Size down one step and the difference is large.</p>

<h2>A real use case</h2>

<p>I keep a local model for meeting notes and draft ideas. Nothing leaves the laptop, it works on a train with no signal, and there is no bill. For private first drafts, local is simply the better default.</p>

<h2>FAQ</h2>

<h3>Will it be as good as ChatGPT?</h3>
<p>No, on hard reasoning. Yes, for notes, drafts, and daily questions. Know which job you are giving it.</p>

<h3>How much memory do I need?</h3>
<p>A small quantized model runs in 4 to 8 GB. Check your laptop before sizing up.</p>

<p>If you want the privacy and cost case for going local, read the open vs closed breakdown next.</p>
`,
    readNext: [
      { title: "Open-Weight vs Closed AI Models: Which Should You Actually Use?", url: "/blog/open-vs-closed-models/" },
      { title: "The Free AI Stack: Everything I Use Daily That Costs $0", url: "/blog/free-ai-stack/" }
    ]
  },

  {
    slug: "claude-vs-chatgpt-vs-gemini",
    title: "Claude vs ChatGPT vs Gemini: 6 Months of Daily Use, Real Differences",
    subtitle: "After half a year of living inside all three, the differences are smaller than the marketing and bigger than you think.",
    tag: "AI & Comparison",
    section: "AI & Comparison",
    emoji: "⚖️",
    date: "2026-06-02",
    readtime: "10 min read",
    keywords: ["Claude vs ChatGPT vs Gemini", "best AI chatbot 2026", "which AI should I use"],
    description: "A long-term, hands-on comparison of Claude, ChatGPT, and Gemini after six months of daily use, covering writing, coding, search, and honesty.",
    body: `
<p>I refused to pick a favorite. For six months I used Claude, ChatGPT, and Gemini every single day for real work: writing, coding, research, and planning. Not demos. Actual deadlines. Here is the honest split.</p>

<h2>Writing and tone</h2>

<p>Claude is the cleanest writer. It keeps your voice better and rarely drifts into corporate mush. ChatGPT is the most flexible and the easiest to push into any format. Gemini is fine for drafts but the tone is the flattest of the three.</p>

<p>If the words matter, I start with Claude.</p>

<h2>Coding</h2>

<p>ChatGPT and Claude are close, with Claude edging hard reasoning and ChatGPT edging breadth of examples. Gemini has caught up more than people admit, especially inside Google's own tools. For standalone coding help, it is Claude first, then ChatGPT.</p>

<h2>Search and freshness</h2>

<p>This is Gemini's home turf. Tied to live search, it is the best for "what just happened" questions. ChatGPT is strong here too with its own search. Claude is the weakest for live facts unless you wire it to tools.</p>

<h2>Long documents</h2>

<p>Gemini handles the longest context windows comfortably. Claude is excellent at following structure in a long file. ChatGPT sits in the middle but feels the most polished in a chat.</p>

<h2>Honesty and pushback</h2>

<p>All three will people-please if you let them. In my tests Claude was the most likely to say "that plan has a hole," which I value. ChatGPT agrees most. Gemini lands between.</p>

<blockquote>I do not use the "best" model. I use the right one per task: Claude for words, Gemini for live facts, ChatGPT when I want the widest net.</blockquote>

<h2>The surprise</h2>

<p>After six months, the gap narrowed. A year ago this comparison would have been a landslide. Today any of the three will do most jobs well. The difference is feel and fit, not raw power.</p>

<h2>What I actually pay for</h2>

<p>I keep one paid plan and rotate the free tiers. For most people, one subscription plus the others on free is plenty. Do not pay for all three unless you are benchmarking like I was.</p>

<h2>The verdict</h2>

<p>Pick by your main job. Writers: Claude. Researchers and live-fact people: Gemini. Generalists who want one tool to do everything: ChatGPT. And keep a second one free as a sanity check. Two models beat one, every time.</p>

<h2>A worked example</h2>

<p>Same prompt, three answers. "Explain our refund policy to an angry customer, warm but firm." Claude kept the tone best. ChatGPT gave the most complete structure. Gemini pulled the live policy fastest when I linked it. None were wrong. They were different shapes of right.</p>

<h2>The pricing tiers</h2>

<p>All three have a free plan and a paid plan. The free plan is enough to decide if you like the feel. The paid plan buys higher limits and the smartest model. I pay for one and keep the other two free as checkers.</p>

<h2>FAQ</h2>

<h3>Which is best for students?</h3>
<p>Start with the free tier of the one your school mentions, then try a second free. Two free perspectives beat one paid.</p>

<h3>Can I switch later?</h3>
<p>Yes. Your prompts and notes move with you. The models are interchangeable for most daily work.</p>

<p>If you want to squeeze more out of whichever you pick, the prompting deep dive is the natural next read.</p>
`,
    readNext: [
      { title: "The Free AI Stack: Everything I Use Daily That Costs $0", url: "/blog/free-ai-stack/" },
      { title: "Prompt Engineering Is Dead. Here's What Replaced It", url: "/blog/is-prompt-engineering-dead/" }
    ]
  },

  {
    slug: "what-are-ai-agents",
    title: "AI Agents Are Quietly Breaking the Old 'App' Model",
    subtitle: "We spent a decade building apps with buttons. Agents trade the buttons for goals. That changes everything.",
    tag: "AI & Strategy",
    section: "AI & Strategy",
    emoji: "🤖",
    date: "2026-06-10",
    readtime: "7 min read",
    keywords: ["what are AI agents", "AI agent explained", "agents vs chatbots", "agentic AI 2026"],
    description: "A plain-language explanation of what AI agents are, how they differ from chatbots, and why they are reshaping how software gets built.",
    body: `
<p>You have heard the word "agent" a hundred times this year. Most explanations make it sound like magic. It is not magic. It is a small, useful shift in how software works, and it is worth understanding clearly.</p>

<h2>A chatbot answers. An agent acts.</h2>

<p>A chatbot takes your question and returns text. An agent takes a goal and does the steps. Book the flight, check the calendar, send the email, report back. The model is no longer just talking. It is operating.</p>

<p>The simplest way I explain it to friends: a chatbot is a librarian, an agent is a junior assistant who can actually go do the errand.</p>

<h2>What is inside an agent</h2>

<p>Strip the hype and an agent is three parts:</p>

<ul>
<li><strong>A model</strong> that reasons about what to do next.</li>
<li><strong>Tools</strong> it can call, like a search, a calendar, or code.</li>
<li><strong>A loop</strong> where it checks the result and decides the next move until the job is done.</li>
</ul>

<p>That loop is the whole trick. The agent is not one smart answer. It is many small steps with checking in between.</p>

<h2>Why this breaks the old app model</h2>

<p>Old apps were menus. You clicked "export," you clicked "save." The app assumed you wanted exactly those steps. An agent flips it: you state the outcome, and it figures out the steps. The interface stops being a wall of buttons and starts being a sentence.</p>

<blockquote>The button was a crutch for software that could not understand intent. Agents remove the crutch. That is why every app is quietly adding one.</blockquote>

<h2>The honest limits</h2>

<p>Agents are not reliable enough to run wild. They get stuck, they loop, they take a weird path. The good ones show you the plan and let you approve steps. The bad ones just do things and hope.</p>

<p>For anything high-stakes, keep a human in the loop. That is not cowardice. It is how you avoid an agent quietly emailing your whole contact list.</p>

<h2>Where they are already useful</h2>

<p>Research digests, form filling, data cleanup, scheduling, and "watch this and tell me when it changes" tasks. Boring, repeatable, multi-step work is the agent's home. That is exactly the work most people hate.</p>

<h2>What to try</h2>

<p>Do not buy the dream. Pick one annoying weekly task and hand it to an agent tool. If it saves you an hour, that is real. If it needs babysitting the whole time, it was not ready. Either way, now you know.</p>

<h2>A concrete agent walkthrough</h2>

<p>Goal: "Summarize this week's mentions and draft replies." The agent reads your mentions, clusters them by topic, writes a short summary, drafts three reply options, and asks you to approve. You did not click through five screens. You stated an outcome.</p>

<h2>A risks checklist before you let one loose</h2>

<ul>
<li>Does it show the plan before acting?</li>
<li>Can it be stopped mid run?</li>
<li>Is a human approving the risky steps?</li>
<li>Does it log what it did?</li>
</ul>

<p>If the answer is no to any of these, keep it on a leash.</p>

<h2>FAQ</h2>

<h3>Are agents the same as automation?</h3>
<p>Similar, but agents decide steps on the fly. Old automation follows a fixed script.</p>

<h3>Should I build my own?</h3>
<p>Start with an existing agent tool. Build only when the off the shelf one cannot do your job.</p>

<p>For builders, the coding assistants piece is where agents already pay rent today.</p>
`,
    readNext: [
      { title: "I Tested 7 AI Coding Assistants So You Don't Have To", url: "/blog/best-ai-coding-assistants/" },
      { title: "The Free AI Stack: Everything I Use Daily That Costs $0", url: "/blog/free-ai-stack/" }
    ]
  },

  {
    slug: "free-ai-stack",
    title: "The Free AI Stack: Everything I Use Daily That Costs $0",
    subtitle: "My whole daily AI workflow runs on free tiers. Here is the exact stack, and where the free line breaks.",
    tag: "AI & Tools",
    section: "AI & Tools",
    emoji: "🆓",
    date: "2026-06-18",
    readtime: "8 min read",
    keywords: ["free AI tools for students", "free AI stack 2026", "AI tools that are actually free", "best free ChatGPT alternative"],
    description: "The exact set of free AI tools used daily for writing, coding, research, and image work, with honest notes on where the free tier stops being enough.",
    body: `
<p>People assume a serious AI workflow costs serious money. Mine does not. I run almost my entire day on free tiers, and I am picky about quality. Here is the stack, and the truth about where free stops working.</p>

<h2>Writing and chat</h2>

<p>A frontier chatbot on its free plan covers most daily writing and questions. I keep a second one free as a checker. Two free accounts beat one paid account for most people, because you get two perspectives for zero dollars.</p>

<h2>Coding help</h2>

<p>The free tier of a coding assistant handles autocomplete and small fixes. For the hard bugs I use a free trial or the terminal-based open tool. You do not need the top plan to ship.</p>

<h2>Research and search</h2>

<p>A search-backed assistant on the free tier is my default for live facts. For deep document work I use the free model that handles long context. Both are free and good enough daily.</p>

<h2>Images</h2>

<p>At least one free image generator covers thumbnails and quick visuals. The quality is not studio grade, but for blog cards and drafts it is fine. Pay only when a client needs polish.</p>

<h2>Local private model</h2>

<p>A small local model, free forever, handles the private stuff: notes, drafts, anything I would not paste into a web app. Setup once, cost zero after.</p>

<h2>Where free breaks</h2>

<p>Be honest about the edges:</p>

<ul>
<li><strong>Volume.</strong> If you serve thousands of requests, the per-use free cap dies fast. Then pay.</li>
<li><strong>Hard reasoning.</strong> Free tiers throttle the smartest models. For the rare brutal task, I borrow a paid plan for an hour.</li>
<li><strong>Reliability.</strong> Free tiers rate-limit at the worst time. Client work pays for uptime.</li>
</ul>

<blockquote>Free gets you 90 percent of the value. The paid 10 percent is for scale, uptime, and the hardest tasks. Most people never reach that line.</blockquote>

<h2>The actual cost</h2>

<p>My monthly AI bill is close to zero. When I do pay, it is a single plan I share across projects, not three. The discipline is using free by default and paying only at the moment the free tier bites.</p>

<h2>Your move</h2>

<p>Take the free tier of one chatbot, one coder, and one search tool. Use them for a week. Only open your wallet when a real task fails. You will be surprised how far zero gets you.</p>

<h2>A day in the free stack</h2>

<p>Morning: local model for private notes. Midday: free chatbot for drafts, free coder for fixes. Afternoon: search backed assistant for research. Evening: free image tool for a thumbnail. Zero dollars, full day.</p>

<h2>Why free first</h2>

<p>Paying early locks you into a tool before you know what you need. Free first means you learn your real workflow, then pay only where it bites. Most people never hit the bite.</p>

<h2>FAQ</h2>

<h3>Is the quality worse on free tiers?</h3>
<p>For daily work, barely. For the hardest tasks, yes. Use free by default, paid on demand.</p>

<h3>Can I really run a business on free?</h3>
<p>For one person, often yes. For a team at scale, you will hit limits and pay. That is the right time to pay.</p>

<p>For the full list of tools I keep bookmarked, the main AI tools roundup is the deeper reference.</p>
`,
    readNext: [
      { title: "Best Free AI Tools, LLMs, and Agent Platforms in 2026", url: "/blog/trending-llms/" },
      { title: "Claude vs ChatGPT vs Gemini: 6 Months of Daily Use, Real Differences", url: "/blog/claude-vs-chatgpt-vs-gemini/" }
    ]
  },

  {
    slug: "is-prompt-engineering-dead",
    title: "Prompt Engineering Is Dead. Here's What Replaced It",
    subtitle: "The skill did not vanish. It grew up, got a new name, and moved one level up.",
    tag: "AI & Prompting",
    section: "AI & Prompting",
    emoji: "🪦",
    date: "2026-06-26",
    readtime: "7 min read",
    keywords: ["is prompt engineering dead", "prompt engineering 2026", "context engineering", "AI skills to learn"],
    description: "Why classic prompt engineering is fading and what replaced it: context engineering, evaluation, and knowing which model to use.",
    body: `
<p>Every month a post declares prompt engineering dead. They are half right and half wrong. The old skill of crafting the perfect sentence is fading. But the underlying ability got more valuable, not less. It just changed shape.</p>

<h2>What actually died</h2>

<p>The ritual of decorating prompts with "you are an expert" and five exclamation marks is gone. Models got good enough to ignore the theater. If your prompt was mostly costume, it was always fragile.</p>

<p>What survives is the part that was never about wording: being clear about what you want.</p>

<h2>What replaced it: context engineering</h2>

<p>The new skill is context engineering. Not the sentence, but everything you feed the model: the right files, the right examples, the right constraints, the right tools. You are no longer writing a spell. You are assembling the situation.</p>

<blockquote>Prompt engineering asked "what words?" Context engineering asks "what does the model need to know, see, and be able to do?" That is a bigger and more useful question.</blockquote>

<h2>Then evaluation</h2>

<p>The second replacement skill is evaluation. Anyone can get one good answer. The pros build a way to test a hundred answers and measure which prompt or model wins. That loop is now the real job.</p>

<p>You do not need to be a scientist. You need a small set of test cases and the habit of checking outputs instead of trusting them.</p>

<h2>And knowing which model</h2>

<p>The third skill is choice. The person who knows "use the cheap model for this, the smart one for that" saves more time than the person with the prettiest prompt. Model literacy is the new prompt literacy.</p>

<h2>So should you learn prompting?</h2>

<p>Yes, the useful version. Learn to state intent, give examples, set constraints, and check the result. Skip the wizard hats. The basics from the prompting guide are still the floor, not the ceiling.</p>

<h2>The honest future</h2>

<p>As models improve, raw prompting matters less and system design matters more. The people who thrive are not prompt poets. They are people who can frame a problem, gather the right context, and verify the output. That is a durable skill, and it pays whether or not the models keep changing.</p>

<h2>A before and after</h2>

<p>Old: "Write a good blog post about AI." Vague, generic output. New: "You are writing for builders in small cities. Tone: plain, confident. Include one personal failure and three concrete tools. 800 words." The second is not a better spell. It is better context.</p>

<h2>The three skills to learn instead</h2>

<ul>
<li><strong>Context.</strong> Gather the right files, examples, and constraints before you ask.</li>
<li><strong>Evaluation.</strong> Test outputs on real cases, not one lucky win.</li>
<li><strong>Choice.</strong> Know which model fits which job.</li>
</ul>

<h2>Where to practice</h2>

<p>Take one real task this week. Write the lazy version, then the context version, and compare. The gap you see is the whole lesson. You do not need a course. You need one repeated habit of giving the model the situation, not just the sentence.</p>

<h2>FAQ</h2>

<h3>Should beginners still learn prompting?</h3>
<p>Yes, the useful part. State intent, give examples, set limits, check the result. Skip the costume.</p>

<h3>Will this skill still matter next year?</h3>
<p>The framing and verification parts will. The purple prose will not.</p>

<p>Learn the new shape now, and the "prompt engineering is dead" headlines stop scaring you.</p>
`,
    readNext: [
      { title: "12 AI Prompting Tips for Better ChatGPT and Claude Results", url: "/blog/prompting-tips/" },
      { title: "Claude vs ChatGPT vs Gemini: 6 Months of Daily Use, Real Differences", url: "/blog/claude-vs-chatgpt-vs-gemini/" }
    ]
  },

  {
    slug: "building-in-public-kathmandu",
    title: "Building in Public from Kathmandu: One Year of Shipping AI Projects",
    subtitle: "No Silicon Valley zip code, no funding, just a laptop and a habit of shipping. Here is what a year taught me.",
    tag: "Builder's Log",
    section: "Builder's Log",
    emoji: "🏔️",
    date: "2026-07-04",
    readtime: "9 min read",
    keywords: ["building in public AI", "indie hacker Nepal", "ship AI projects", "build in public 2026"],
    description: "A year-one retrospective on building and shipping AI projects in public from Kathmandu, with honest lessons on consistency, audience, and shipping ugly.",
    body: `
<p>A year ago I made a quiet promise: ship AI projects in public, from Kathmandu, and write down what I learned. No team, no funding, just a laptop and a willingness to look unfinished online. Here is the retro.</p>

<h2>The location was never the limit</h2>

<p>I expected being outside a tech hub to hold me back. It did not. The models, the docs, the communities are all online. The only thing my zip code changed was my time zone and my internet, and I learned to plan around both.</p>

<p>If you are waiting for the "right" city or job to start, that wait is the only thing actually stopping you.</p>

<h2>Ship ugly, then ship again</h2>

<p>My first public project was rough. I almost did not post it. I posted it anyway. The feedback on the rough version taught me more in a day than a month of private polishing. Shipping ugly early is not a excuse for lazy. It is a speed tool.</p>

<blockquote>The gap between a project that exists and one that does not is the only gap that matters. Polish is a later problem.</blockquote>

<h2>Consistency beat talent</h2>

<p>I am not the best coder or writer in any room. But I showed up weekly. A small post every week built an audience that a single perfect essay never would have. People follow the rhythm, not the masterpiece.</p>

<h2>What actually grew my reach</h2>

<p>Not the big launches. The honest notes about what broke and how I fixed it. People trust a builder who admits the error over one who only shares wins. Vulnerability, in public, is a feature, not a risk.</p>

<h2>The hard parts</h2>

<ul>
<li><strong>Power and internet.</strong> I learned to save work obsessively and keep a backup plan.</li>
<li><strong>Isolation.</strong> No local peer group for this niche. Online communities became my office.</li>
<li><strong>Burnout.</strong> Shipping weekly is a marathon. I cut scope hard when energy dropped.</li>
</ul>

<h2>What I would tell past me</h2>

<p>Start smaller. Post sooner. Care less about likes and more about the log. The portfolio you build by shipping in public is worth more than any certificate, and it compounds while you sleep.</p>

<h2>The next year</h2>

<p>More agents, more local models, more writing. Same rule: build, break, post, repeat. If you are in a small city wondering if you can play, you already can. The only move is to start and stay visible.</p>

<h2>What I actually shipped</h2>

<p>In the year: a local AI notes tool, a small RAG demo on my own docs, a portfolio OS, and a weekly writing habit. None were perfect. All of them exist. The shipping log is the asset, not any single project.</p>

<h2>The tools that kept me going</h2>

<p>A free chatbot for drafting, a free coding assistant for fixes, a local model for private notes. The free stack meant I could keep building through months with no budget. Outsiders underestimate how far zero dollars goes when the habit is strong.</p>

<h2>One mistake that cost me a week</h2>

<p>I waited too long to post a rough project. By the time I shared it, someone else had shipped something close. Now I post at 60 percent. Earlier beats later, every time.</p>

<h2>FAQ</h2>

<h3>Do I need to be in a tech city?</h3>
<p>No. The work and the audience are online. Your zip code is not the limit. Your consistency is.</p>

<h3>How do I handle slow internet?</h3>
<p>A local model covers the offline work, and I save constantly. Plan around the weak link instead of fighting it.</p>

<p>The free stack I rely on daily is part of why this stayed sustainable.</p>
`,
    readNext: [
      { title: "The Free AI Stack: Everything I Use Daily That Costs $0", url: "/blog/free-ai-stack/" },
      { title: "AI Myths I Tested: 5 Claims, and 3 Were Flat-Out False", url: "/blog/ai-myths-tested/" }
    ]
  },

  {
    slug: "ai-myths-tested",
    title: "AI Myths I Tested: 5 Claims, and 3 Were Flat-Out False",
    subtitle: "I took five things people say about AI and actually ran them. The results were less flattering than the hype.",
    tag: "AI & Reality",
    section: "AI & Reality",
    emoji: "🧪",
    date: "2026-07-20",
    readtime: "9 min read",
    keywords: ["AI myths debunked", "AI claims tested", "is AI smarter than humans", "AI hype vs reality"],
    description: "Five common AI claims put to a hands-on test, with honest results: which held up, which failed, and what the gap between demo and reality really is.",
    body: `
<p>The internet is full of confident AI claims. I got tired of believing them, so I tested five of the most repeated ones myself. Some held. Most did not survive contact with a real task.</p>

<h2>Claim 1: "AI can write a whole app from one sentence"</h2>

<p>I tried it with a real, moderately complex app idea. Result: it produced a convincing skeleton that broke on the first edge case and had no real architecture. Verdict: false for anything you would actually ship. Great for a prototype you plan to rewrite.</p>

<h2>Claim 2: "AI never makes math errors"</h2>

<p>I fed it twenty word problems with hidden traps. It nailed the simple ones and fumbled three of the tricky ones with total confidence. Verdict: false. It is fluent, not reliable. Always check the numbers.</p>

<h2>Claim 3: "Bigger context means it remembers everything"</h2>

<p>I dropped a long document and asked about a detail buried in the middle. Sometimes it found it, sometimes it quietly used the start and ignored the rest. Verdict: half true. More context helps, but attention is not perfect. Structure your docs.</p>

<h2>Claim 4: "Agents can run your business unattended"</h2>

<p>I let an agent handle a multi-step task with a real account. It completed the happy path and then nearly did something dumb on a surprise input. Verdict: false for unattended. Fine with a human watching. The "set and forget" dream is not here.</p>

<h2>Claim 5: "Local small models are useless"</h2>

<p>I ran a tiny local model on a plain laptop for daily writing and notes. It was slower and less clever than the frontier API, but it did the job and kept my data private. Verdict: false. Underrated for the right tasks.</p>

<blockquote>Three of five claims failed. The pattern is clear: demos show the best case, real work shows the average case, and the average case is where the truth lives.</blockquote>

<h2>What this changes</h2>

<p>Treat every big AI claim as a hypothesis, not a fact. Test it on your actual task before you build on it. The claims that survive your test are the ones worth trusting.</p>

<h2>The one real takeaway</h2>

<p>AI is genuinely useful and genuinely overclaimed at the same time. The skill is not believing less. It is verifying more. A builder who tests beats a believer who repeats, every single time.</p>

<h2>How I actually ran these tests</h2>

<p>None of this was a vibe check. I used the same model and account for each claim, repeated the task three times to rule out luck, and kept the outputs. The point was not to mock the tools. It was to build my own trust instead of borrowing someone else's hype.</p>

<h2>Claim 6: "AI understands what you mean"</h2>

<p>I gave the same vague request two ways. The first got a confident but wrong answer. The second, with one clarifying sentence, got it right. Verdict: it does not read your mind, it reads your words. Clarity is not optional.</p>

<h2>FAQ</h2>

<h3>Does this mean AI is overrated?</h3>
<p>No. It means specific claims need specific tests. The useful ones survive.</p>

<h3>Should I test every claim myself?</h3>
<p>Only the ones you plan to build on. For the rest, stay skeptical and move on.</p>

<p>This testing habit is the same one behind a year of shipping in public.</p>
`,
    readNext: [
      { title: "Building in Public from Kathmandu: One Year of Shipping AI Projects", url: "/blog/building-in-public-kathmandu/" },
      { title: "Open-Weight vs Closed AI Models: Which Should You Actually Use?", url: "/blog/open-vs-closed-models/" }
    ]
  }
];

// ---------------------------------------------------------------------------
// Render one full blog HTML file from a post object.
// ---------------------------------------------------------------------------
function renderPost(p) {
  const url = `${SITE}/blog/${p.slug}/`;
  const ogImage = `${SITE}/images/blog-${p.slug}.svg`;
  const readNextHtml = p.readNext
    .map(
      (r) => `<div class="article-support-box">
    <p><strong>Read next.</strong> <a href="${r.url}" rel="next">${r.title}</a></p>
</div>`
    )
    .join("\n");

  const keywordsJson = JSON.stringify(p.keywords);

  return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <title>${p.title} | Diwakar Ray Yadav</title>
    <link rel="canonical" href="${url}">

    <!-- Theme detection early to avoid color flash -->
    <script>
    (function () {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    })();
    </script>

    <!-- Favicons -->
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

    <!-- Performance: Preconnect to external resources -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <!-- Google Fonts loaded asynchronously to unblock first paint -->
    <link rel="preload" as="style"
        href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap"
        onload="this.onload=null;this.rel='stylesheet'">
    <noscript>
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap"
            rel="stylesheet">
    </noscript>

    <!-- Critical CSS: prevent invisible content, base layout -->
    <style>
        .fade-in { opacity: 1 !important; transform: none !important; }
        .fade-in.js-enabled { opacity: 0; transform: translateY(30px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .fade-in.js-enabled.visible { opacity: 1; transform: translateY(0); }
        body { font-family: "Google Sans Flex", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-optical-sizing: auto; margin: 0; }
        .header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(254, 250, 224, 0.95); backdrop-filter: blur(10px); }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
        .section { padding: 5rem 0; }
        .blog-article { max-width: 800px; margin: 0 auto; padding-top: 80px; }
    </style>

    <link rel="alternate" type="application/rss+xml" title="Diwakar Ray Yadav Blog RSS Feed"
        href="${SITE}/feed.xml">

    <!-- Main CSS (loaded asynchronously) -->
    <link rel="stylesheet" href="../../css/style.4a3a12ca.css" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="../../css/style.4a3a12ca.css"></noscript>

    <!-- SEO & Open Graph -->
    <meta name="author" content="Diwakar Ray Yadav">
    <meta name="description" content="${p.description}">
    <meta property="og:title" content="${p.title}">
    <meta property="og:description" content="${p.description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:alt" content="${p.title}">
    <meta property="article:published_time" content="${p.date}">
    <meta property="article:modified_time" content="${MODIFIED}">
    <meta property="article:author" content="Diwakar Ray Yadav">
    <meta property="article:section" content="${p.section}">
    <meta property="article:tag" content="${p.keywords[0]}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${p.title}">
    <meta name="twitter:description" content="${p.description}">
    <meta name="twitter:image" content="${ogImage}">

    <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": ${JSON.stringify(p.title)},
            "alternativeHeadline": ${JSON.stringify(p.subtitle)},
            "description": ${JSON.stringify(p.description)},
            "image": [${JSON.stringify(ogImage)}],
            "mainEntityOfPage": { "@type": "WebPage", "@id": ${JSON.stringify(url)} },
            "datePublished": ${JSON.stringify(p.date)},
            "dateModified": ${JSON.stringify(MODIFIED)},
            "inLanguage": "en",
            "isAccessibleForFree": true,
            "articleSection": ${JSON.stringify(p.section)},
            "keywords": ${keywordsJson},
            "author": { "@type": "Person", "name": "Diwakar Ray Yadav", "url": ${JSON.stringify(SITE + "/about/")} },
            "publisher": { "@type": "Person", "name": "Diwakar Ray Yadav", "url": ${JSON.stringify(SITE + "/")}, "image": ${JSON.stringify(SITE + "/images/diwakar-portrait.jpg")} }
        }
    </script>

    <style>
        .blog-article { max-width: 800px; margin: 0 auto; }
        .blog-back-link { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); text-decoration: none; margin-bottom: 2rem; transition: color 0.3s ease; }
        .blog-back-link:hover { color: var(--accent-primary); }
        .blog-article-header { margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border-light); }
        .blog-article-tag { display: inline-block; background: var(--accent-primary); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; margin-bottom: 1rem; }
        .blog-article-title { font-size: 2.5rem; line-height: 1.2; margin-bottom: 1rem; }
        .blog-article-subtitle { font-size: 1.25rem; color: var(--text-secondary); font-style: italic; }
        .blog-article-meta { display: flex; gap: 1.5rem; font-size: 0.9rem; color: var(--text-muted); margin-top: 1.5rem; flex-wrap: wrap; }
        .blog-article-content { font-size: 1.1rem; line-height: 1.8; }
        .blog-article-content h2 { font-size: 1.75rem; margin-top: 2.5rem; margin-bottom: 1rem; color: var(--accent-primary); font-weight: 600; }
        .blog-article-content h3 { font-size: 1.4rem; margin-top: 2rem; margin-bottom: 0.75rem; font-weight: 600; }
        .blog-article-content p { margin-bottom: 1.25rem; }
        .blog-article-content strong { color: var(--accent-primary); }
        .blog-article-content ul, .blog-article-content ol { margin: 1rem 0 1.25rem; padding-left: 1.5rem; }
        .blog-article-content li { margin-bottom: 0.5rem; }
        .blog-article-content blockquote { background: var(--bg-secondary); border-left: 4px solid var(--accent-primary); padding: 1rem 1.5rem; margin: 1.5rem 0; border-radius: 0 var(--radius) var(--radius) 0; font-style: italic; }
        .article-support-box { margin-top: 2rem; padding: 1.5rem; border: 1px solid var(--border-light); border-radius: var(--radius); background: var(--bg-secondary); }
        .article-support-box p:last-child { margin-bottom: 0; }
        .article-support-box a { color: var(--accent-primary); font-weight: 600; }
        @media (max-width: 768px) {
            .blog-article-title { font-size: 1.75rem; }
            .blog-article-subtitle { font-size: 1rem; }
            .blog-article-content { font-size: 1rem; }
            .blog-article-meta { flex-direction: column; gap: 0.5rem; }
        }
    </style>
</head>

<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    <header class="header">
        <div class="container">
            <nav class="nav">
                <a href="/" class="logo font-display">Diwakar</a>
                <ul class="nav-links">
                    <li><a href="/" class="nav-link">Home</a></li>
                    <li><a href="/projects/" class="nav-link">Projects</a></li>
                    <li><a href="/about/" class="nav-link">About</a></li>
                    <li><a href="/blog/" class="nav-link active">Blog</a></li>
                    <li><a href="/contact/" class="nav-link">Contact</a></li>
                    <li><a href="https://www.os.diwakaryadav.com.np/" class="nav-link" target="_blank" rel="noopener">OS ↗</a></li>
                    <li><a href="https://diwak4r.zo.space/" class="nav-link" target="_blank" rel="noopener">Zo ↗</a></li>
                </ul>
                <button id="theme-toggle" class="theme-toggle" aria-label="Toggle Dark Mode">
                    <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                </button>
                <button class="mobile-menu-btn" aria-label="Open navigation menu" aria-expanded="false">☰</button>
            </nav>
        </div>
    </header>

    <section class="section" id="main-content" role="region" aria-label="Blog article">
        <div class="container">
            <article class="blog-article fade-in" role="article" itemscope itemtype="https://schema.org/BlogPosting">
                <a href="/blog/" class="blog-back-link" aria-label="Return to blog listing">← Back to Blog</a>

                <div class="blog-article-header">
                    <span class="blog-article-tag">${p.tag}</span>
                    <h1 class="blog-article-title font-display">${p.title}</h1>
                    <p class="blog-article-subtitle">${p.subtitle}</p>
                    <div class="blog-article-meta">
                        <span>📅 ${p.dateHuman || p.date}</span>
                        <span>⏱️ ${p.readtime}</span>
                        <span>✍️ Diwakar Ray Yadav</span>
                    </div>
                </div>

                <div class="blog-article-content">
${p.body}
                    <div class="article-support-box">
                        <p><strong>About the author.</strong> Diwakar Ray Yadav writes about AI tools, prompt engineering, and automation from hands-on experiments in Kathmandu. <a href="/about/" rel="author">Read more about Diwakar</a>.</p>
                    </div>
${readNextHtml}
                </div>
            </article>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2026 Diwakar Ray Yadav. All rights reserved.</p>
        </div>
    </footer>

    <script src="../../js/script.8687d2a9.js" defer></script>
</body>

</html>
`;
}

// ---------------------------------------------------------------------------
// Simple SVG OG card: on-brand warm palette, emoji, wrapped title.
// ---------------------------------------------------------------------------
function wrapTitle(title) {
  const words = title.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > 26) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines.slice(0, 4);
}

function renderOg(p) {
  const lines = wrapTitle(p.title);
  const startY = 250 - (lines.length - 1) * 38;
  const tspans = lines
    .map(
      (l, i) =>
        `<text x="80" y="${startY + i * 76}" font-size="46" font-weight="700" fill="#2D3748" font-family="Segoe UI, Arial, sans-serif">${escapeXml(
          l
        )}</text>`
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FEFAE0"/>
  <rect x="0" y="0" width="1200" height="14" fill="#B87A5C"/>
  <text x="80" y="120" font-size="120" font-family="Segoe UI, Arial, sans-serif">${p.emoji}</text>
${tspans}
  <text x="80" y="560" font-size="30" fill="#A98467" font-family="Segoe UI, Arial, sans-serif">Diwakar Ray Yadav · AI, hands-on</text>
</svg>
`;
}

function escapeXml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------
mkdirSync(IMG_DIR, { recursive: true });
let count = 0;
for (const p of POSTS) {
  const dir = join(BLOG_DIR, p.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), renderPost(p), "utf8");
  writeFileSync(join(IMG_DIR, `blog-${p.slug}.svg`), renderOg(p), "utf8");
  count++;
  console.log(`wrote blog/${p.slug}/index.html + images/blog-${p.slug}.svg`);
}
console.log(`DONE: ${count} posts generated`);
