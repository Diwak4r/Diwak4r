/**
 * The terminal's personality: every command answers with one reply picked at
 * random from its pool, so repeat visitors keep finding new lines.
 *
 * Matching is longest-prefix ("git status" wins over "git"), same as before.
 */
export type Reply = string[];

export const POOLS: Record<string, Reply[]> = {
  /* ---- direct roasts ---- */
  roastme: [
    ["you opened a fake terminal inside a portfolio to get roasted.", "that's the roast. that's the whole roast."],
    ["your search history is 90% 'how to' and 10% shame. we can tell."],
    ["you have 47 tabs open and one of them is playing audio. find it. face yourself."],
    ["certified keyboard warrior: 120 WPM in arguments, 12 WPM in assignments."],
  ],
  roast: [
    ["usage: roastme. own your choices."],
    ["you want a roast without typing 'roastme'? even your commands procrastinate."],
  ],
  motivation: [
    ["'the grind never stops' — you, before a 4 hour nap."],
    ["motivation not found. installing discipline instead... failed. classic."],
    ["you don't need motivation, you need to close YouTube. this is the sign."],
  ],
  /* ---- love life ---- */
  gf: [
    ["404 girlfriend not found.", "have you tried turning your personality off and on again?"],
    ["she said 'you're like a brother to me'. bro got friend-zoned by a Boolean."],
  ],
  bf: [
    ["404 boyfriend not found. he's 'focusing on his career' (Valorant)."],
    ["boyfriend.exe has stopped responding. have you tried a software update?"],
  ],
  crush: [
    ["she saw your 'seen 2:47 AM' and chose peace."],
    ["your crush thinks of you too! (as a backup contact for notes before exams)"],
    ["shooting your shot? your aim is worse in DMs than in Valorant, and that's saying something."],
  ],
  rizz: [
    ["rizz level: negative. you say 'ok cool cool cool' when nervous."],
    ["bro's idea of flirting is sharing a GitHub repo. (honestly? valid.)"],
  ],
  /* ---- health & habits ---- */
  gym: [
    ["gym membership: active since January. attendance: also January."],
    ["you lift? yeah — your laptop, from the bed to the desk and back."],
    ["today's workout: 3 sets of 'I'll start Monday'."],
  ],
  sleep: [
    ["'one more episode' — you, 6 episodes ago. it's 3 AM. go."],
    ["your sleep schedule is a suggestion at this point. even your circadian rhythm gave up."],
    ["sleep is for people whose code compiles."],
  ],
  wake: [
    ["9 alarms. snoozed all 9. woke up at the exact minute of the deadline. talent, honestly."],
    ["good morning! (it's 1 PM.)"],
  ],
  coffee: [
    ["brewing... error: bloodstream already 80% caffeine.", "switching to chiya. doctor's orders."],
    ["coffee won't fix your codebase, but here we are. ☕ dispensed."],
  ],
  chai: [
    ["one chai = one hour of productivity. you're 14 chais behind schedule."],
    ["chai > coffee. this terminal will not be taking questions."],
  ],
  chiya: [
    ["chiya pasal down the street knows your order AND your CGPA. both are concerning."],
    ["milk chiya, extra adrak, roadside glass. peak developer experience. dispensed. 🫖"],
  ],
  momo: [
    ["ordering momo... jhol or chilli?", "wrong answer changes everything, choose wisely."],
    ["you: 'I'm saving money this month'. also you: full plate steam momo + kothey. every. day."],
    ["momo is a food group. nutritionists hate this one Kathmandu trick."],
  ],
  maggi: [
    ["2-minute maggi, 45-minute existential crisis while eating it over the sink. hostel life."],
    ["maggi at 2 AM is not a meal, it's a coping mechanism. anyway, water's boiling."],
  ],
  /* ---- student life ---- */
  cgpa: [
    ["your CGPA called. it wants you to stop checking it and start affecting it."],
    ["CGPA: fine. GitHub graph: green. priorities: understood."],
    ["'CGPA doesn't matter' — statement typed by someone whose CGPA definitely matters."],
  ],
  attendance: [
    ["attendance: 74.9%. the 0.1% is going to hurt, and you know exactly which class."],
    ["you treat 80% attendance as a budget to spend, not a requirement. financially savvy, academically doomed."],
  ],
  backlog: [
    ["backlog check: academically? maybe. emotionally? absolutely."],
    ["your backlog has a backlog. it's backlogs all the way down."],
  ],
  exam: [
    ["exam in 12 hours. syllabus: unopened. you: reading terminal jokes. iconic."],
    ["study tip: the syllabus PDF doesn't count as studying just because it's open."],
    ["'sir will give easy questions this year' — famous last words, every semester."],
  ],
  assignment: [
    ["due at 11:59 PM. you'll submit at 11:58. peak performance engineering."],
    ["your assignment is 'almost done' the way Nepali roads are 'almost finished'."],
  ],
  homework: [
    ["ChatGPT did your homework, and honestly? it also judged you."],
    ["homework found: 7 pending. motivation found: 0 pending."],
  ],
  internship: [
    ["'6 months experience required' — for an internship. the industry is a comedy show."],
    ["unpaid internship offering 'exposure'. exposure doesn't pay for momo."],
  ],
  job: [
    ["entry level job: 3 years experience, 12 skills, salary 'competitive' (it's not)."],
    ["your dream job exists. it just requires the exact skills you keep postponing."],
  ],
  salary: [
    ["salary: loading... expected: lakhs. reality: 'we'll discuss after probation'."],
    ["you calculated your future salary in USD again didn't you. bro is pre-rich."],
  ],
  resume: [
    ["'proficient in Excel' — you made one pie chart in 2022."],
    ["your resume says 'team player'. your git history says 'force pushed to main at 3 AM'."],
  ],
  cv: [
    ["one page CV, eight years of personality squeezed into bullet points. brutal."],
    ["adding this website to the CV would honestly carry the whole thing."],
  ],
  linkedin: [
    ["'Thrilled to announce...' calm down, you updated your profile picture."],
    ["LinkedIn is just Instagram for people who say 'synergy' unironically."],
  ],
  leetcode: [
    ["leetcode streak: 2 days. netflix streak: 214 days. the data doesn't lie."],
    ["you solved Two Sum and updated your resume. respect the confidence."],
  ],
  dsa: [
    ["DSA: the art of learning trees while your life remains unbalanced."],
    ["you'll reverse a linked list in an interview and never again for the rest of your life."],
  ],
  /* ---- dev culture ---- */
  bug: [
    ["it's not a bug, it's an undocumented feature with hostile intent."],
    ["the bug is on line 1. the line you wrote first. it's always the one you trusted."],
  ],
  deploy: [
    ["deploying on Friday? bold. brave. wrong."],
    ["deployed successfully! (to the wrong environment.)"],
  ],
  prod: [
    ["you don't test in prod. you vibe in prod. there's a difference. legally."],
    ["prod is down. it's always DNS. it was DNS last time. it will be DNS next time."],
  ],
  password: [
    ["your password is your name + birth year and we both know it. change it. now."],
    ["password hint: it's the same one you use everywhere. that's the problem."],
  ],
  "wifi password": [
    ["the wifi password is the landlord's phone number. it's ALWAYS the landlord's phone number."],
    ["nice try. even the wifi has trust issues with you."],
  ],
  /* ---- money & markets ---- */
  nepse: [
    ["NEPSE is green! (you sold yesterday.)"],
    ["your portfolio: -12%. your confidence: +200%. NEPSE investors are built different."],
    ["circuit breaker hit again. Kathmandu's real extreme sport."],
  ],
  bitcoin: [
    ["you checked bitcoin's price 14 times today and own 0.0003 of one."],
    ["'should have bought in 2013' — you, annually, since 2017."],
  ],
  crypto: [
    ["your crypto strategy: buy high, panic, sell low, repeat. flawless execution."],
    ["bro's portfolio is 60% hope, 40% coins named after dogs."],
  ],
  loadshedding: [
    ["loadshedding flashbacks unlocked. candle + homework + inverter hum. character development."],
    ["kids these days will never know the pain of the 18-hour schedule taped to the fridge."],
  ],
  /* ---- brainrot & games ---- */
  tiktok: [
    ["'just one scroll' — you, 2 hours and 340 videos ago."],
    ["your attention span called. it hung up after 3 seconds."],
  ],
  reels: [
    ["reels at 2 AM hit different because your dopamine receptors have given up."],
    ["you've watched the same recipe reel 5 times. you will never cook it. we both know."],
  ],
  insta: [
    ["posting 'grind mode 💪' stories from bed is a lifestyle and you're living it."],
    ["your story views are down 12%. the algorithm is also tired of you."],
  ],
  valorant: [
    ["'last game' count tonight: 6. rank: still Iron. spirit: unbreakable."],
    ["you blamed the team again didn't you. bro IS the team."],
    ["aim training for 2 hours to still get one-tapped by a Reyna smurf. poetry."],
  ],
  pubg: [
    ["landed Pochinki, died in 40 seconds, blamed the ping. a Kathmandu classic."],
    ["chicken dinner? your last dinner was maggi. focus."],
  ],
  freefire: [
    ["free fire max? bro's device said 'please, I'm begging you, no'."],
    ["your little cousin is better than you and you know it."],
  ],
  /* ---- deadlines & hostel ---- */
  deadline: [
    ["deadline is tomorrow. panic is today. productivity is... pending."],
    ["you work best under pressure? you work ONLY under pressure. it's not a superpower, it's a schedule."],
  ],
  hostel: [
    ["hostel wifi: 2 bars, 200 residents, 1 dream. good luck pushing to GitHub."],
    ["hostel room status: 3 mugs, 1 spoon, infinite dishes 'soaking'."],
  ],
  mess: [
    ["today's mess menu: dal, bhat, and disappointment. same as yesterday. same as tomorrow."],
    ["you complain about mess food daily and still go back for seconds. loyalty."],
  ],
  /* ---- classic terminal toys ---- */
  cowsay: [
    [" _____________________", "< skill issue detected >", " ---------------------", "        \\   ^__^", "         \\  (oo)\\_______", "            (__)\\       )\\/\\", "                ||----w |", "                ||     ||"],
    [" ________________________", "< momo > maggi. fight me. >", " ------------------------", "        \\   ^__^", "         \\  (oo)\\_______", "            (__)\\       )\\/\\", "                ||----w |", "                ||     ||"],
  ],
  fortune: [
    ["you will close a tab today that you needed. you will not remember which one."],
    ["a deadline you forgot is remembering you right now."],
    ["good news: the bug is simple. bad news: it's in your understanding."],
    ["someone will ask 'did you try turning it off and on again'. they will be right."],
  ],
  sl: [
    ["you meant 'ls'. but here's your train anyway:", "      ====        ________ ", "  _D _|  |_______/        \\__I_I_____===__|_________|", "   |(_)---  |   H\\________/ |   |        =|___ ___|  ", "   /     |  |   H  |  |     |   |         ||_| |_||  ", "  |      |  |   H  |__--------------------| [___] |  ", "  choo choo. now type it properly."],
  ],
  matrix: [
    ["wake up, Neo...", "01100100 01101001 01110111 01100001 01101011 01100001 01110010", "the matrix has you. it's called 'the attendance system'."],
  ],
  hack: [
    ["initializing hack... accessing mainframe... bypassing firewall...", "just kidding. the only thing getting hacked here is your sleep schedule."],
    ["hacking NASA with HTML... done.", "(this is a joke. please do not hack anything. especially not with HTML.)"],
  ],
  uptime: [
    ["this desktop: up 99.9% of the time.", "you: up 99.9% of the night. one of these is healthy."],
  ],
  man: [
    ["man what? man up and read the docs. (the docs: 'help')"],
    ["no manual entry. like most of your projects, the documentation is a promise."],
  ],
  whois: [
    ["whois you? someone who reads 'help' and then types random commands anyway. respect."],
    ["diwakar: builds AI infra in Kathmandu. you: reading a fake terminal. both valid."],
  ],
  "touch grass": [
    ["command accepted. grass located 12 meters from your device.", "estimated time since last contact: unknown. concerning."],
    ["error: outside not found. have you tried opening a window? (a real one.)"],
  ],
  "sudo make me a sandwich": [
    ["okay. 🥪 (with great power comes great sandwiches.)"],
  ],
  "make me a sandwich": [
    ["what? make it yourself. (try sudo.)"],
  ],
  weather: [
    ["Kathmandu: dusty with a chance of traffic.", "open the Weather app for the real forecast."],
  ],
};

/** Longest-prefix match against the pool table; returns one random reply. */
export function matchPool(input: string): Reply | null {
  const lower = input.toLowerCase();
  const key = Object.keys(POOLS)
    .filter((k) => lower === k || lower.startsWith(k + " "))
    .sort((a, b) => b.length - a.length)[0];
  if (!key) return null;
  const pool = POOLS[key];
  return pool[Math.floor(Math.random() * pool.length)];
}
