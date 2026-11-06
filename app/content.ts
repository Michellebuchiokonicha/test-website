// ─────────────────────────────────────────────────────────────
// ALL SITE CONTENT LIVES HERE. Edit this file, push, Vercel redeploys.
// Anything marked TODO is a placeholder for you to fill in.
// Gallery photos are NOT listed here: just drop them in public/gallery/ (see README-SITE.md).
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Michelle Buchi Okonicha",
  shortName: "Michelle",
  title: "AI/ML engineer, researcher & community builder",
  tagline:
    "I build production machine learning systems, research how AI agents behave on small devices, and teach the next generation of women in tech.",
  location: "Kingston upon Hull, UK",
  url: "https://yourdomain.com", // TODO: your real domain
  email: "michelleokonicha@gmail.com",
  cvUrl: "/cv.pdf", // TODO: put your CV at public/cv.pdf (leave your phone number off the public copy)
  socials: [
    { label: "GitHub", href: "https://github.com/" }, // TODO
    { label: "LinkedIn", href: "https://www.linkedin.com/" }, // TODO
    { label: "X / Twitter", href: "https://x.com/" }, // TODO
    { label: "Google Developers profile", href: "https://developers.google.com/profile/u/me" }, // TODO
  ],
};

export const badges = [
  "Google Developer Expert",
  "Women Techmakers Ambassador",
  "MSc AI & Data Science, University of Hull",
];

export const stats = [
  { value: "60+", label: "technical events spoken at" },
  { value: "~40", label: "technical articles written" },
  { value: "640+", label: "girls reached through Girls Like Me Dream" },
  { value: "1 + 2", label: "papers published + under review" },
];

export const about = [
  "I'm a machine learning and AI engineer and a Google Developer Expert, currently completing an MSc in Artificial Intelligence and Data Science at the University of Hull, supervised by Dr. Julius Mboli.",
  "My research interests are LLM memory, goal drift, edge AI, quantisation, small language models, agents and agentic workflows, computer vision, and time series forecasting. My MSc project measures how the goals of small, quantised language-model agents drift over long recursive workflows on edge devices.",
  "Before the MSc I was CTO and co-founder at PLATE, building computer vision for commercial kitchens, and an AI software engineer at Aricah Technologies, where I shipped RAG-powered products to the web and Google Play. I started my career in software engineering as the first female software engineer at Landmark Africa.",
  "Outside the code, I'm a Women Techmakers Ambassador, Partnership Lead for the Hull AI Society, a student ambassador at the University of Hull, and a volunteer tutor with PyGirls.",
];

export const skills = [
  {
    group: "AI / ML",
    items: ["LLMs", "RAG", "Semantic search", "MongoDB Vector Search", "LoRA fine-tuning", "Computer vision (YOLOv8, Mask R-CNN)", "NLP", "Hugging Face", "PyTorch", "TensorFlow"],
  },
  {
    group: "MLOps & serving",
    items: ["MLflow", "Drift & latency monitoring", "ONNX Runtime", "Docker", "Kubernetes", "CI/CD"],
  },
  {
    group: "Engineering",
    items: ["Python", "JavaScript", "FastAPI", "Flask", "Asyncio", "REST APIs", "Redis", "AWS", "GCP", "PostgreSQL", "MongoDB", "Supabase"],
  },
];

export type Project = {
  name: string;
  role: string;
  period?: string;
  summary: string;
  tags: string[];
  href?: string;
  featured?: boolean;
  todo?: boolean; // true = placeholder text you still need to write
};

// Featured first, then the rest. Reorder freely.
export const projects: Project[] = [
  {
    name: "Goal drift in recursive agentic workflows",
    role: "MSc dissertation research · ongoing",
    period: "2026",
    summary:
      "Quantifying and mitigating goal drift in stateless small language model agents on edge-quantised devices, using a LangGraph auditor, survival analysis (Kaplan-Meier, Cox) and Qwen2.5 and Llama 3.2 models on Apple hardware and HPC.",
    tags: ["Agents", "Small language models", "Quantisation", "LangGraph", "Survival analysis"],
    featured: true,
  },
  {
    name: "PLATE",
    role: "Co-founder, CTO & ML engineer",
    period: "2025 – 2026",
    summary:
      "An AI kitchen assistant combining real-time computer vision food recognition with multi-modal Gemini models for recipe generation. I built the inference backend and cut inference latency by 35% for cross-platform mobile users.",
    tags: ["Computer vision", "Gemini", "FastAPI", "ONNX / CoreML / TFLite", "Docker"],
    featured: true,
  },
  {
    name: "AfroLearner",
    role: "Lead open-source developer · in development",
    summary:
      "An NLP language-learning platform for low-resource African languages, starting with Wolof. Built with Python, FastAPI and the Waxal dataset, with custom tokenisers and local inference endpoints via Meta's MMS framework.",
    tags: ["NLP", "Low-resource languages", "FastAPI", "Open source"],
    featured: true,
  },
  {
    name: "Velarius Education Platform",
    role: "Aricah Technologies · live on Play Store & web",
    summary:
      "An LLM-powered edtech platform with custom RAG frameworks on OpenAI and Gemini models, secure document indexing and context-grounded testing. 50+ downloads.",
    tags: ["RAG", "OpenAI", "Gemini", "Edtech"],
    featured: true,
  },
  {
    name: "Upsidedown House app",
    role: "Landmark Africa",
    summary:
      "The first interactive experience of its kind in West Africa, with scalable data logging for 100,000+ event visitors.",
    tags: ["Product engineering", "Scale"],
  },
  {
    name: "Hospitality Institute portal",
    role: "Landmark Africa",
    summary:
      "A student portal and admin panel (Vue.js, PHP, Laravel, SQL) that automated workflows and reduced administrative bottlenecks.",
    tags: ["Vue.js", "Laravel", "SQL"],
  },
  {
    name: "Hospitality operations platform",
    role: "Execufy · contract",
    period: "2024",
    summary:
      "Delivered a high-availability platform to go-live on schedule, with board collaboration and peer interaction modules. Cut server response times by 18% via Supabase/PostgreSQL tuning and code splitting.",
    tags: ["Supabase", "PostgreSQL", "Performance"],
  },
  {
    name: "Frootaz & Belish",
    role: "Aricah Technologies · live",
    summary: "Shipped food-logistics (Frootaz) and kilishi-delivery (Belish) applications.",
    tags: ["Food-tech", "Web & mobile"],
  },
  {
    name: "Fugoku",
    role: "TODO: your role",
    summary: "TODO: what you built and the outcome.",
    tags: ["TODO"],
    todo: true,
  },
];

export type Job = {
  role: string;
  org: string;
  period: string;
  bullets: string[];
};

export const experience: Job[] = [
  {
    role: "Machine Learning & AI Engineer",
    org: "PLATE",
    period: "Aug 2025 – Jun 2026",
    bullets: [
      "Architected and productionised the inference backend for an AI kitchen assistant (real-time computer vision plus multi-modal Gemini).",
      "Cut inference latency by 35% and built async FastAPI serving with automated model logging to track drift.",
    ],
  },
  {
    role: "AI Software Engineer",
    org: "Aricah Technologies",
    period: "Jan 2024 – Jan 2026",
    bullets: [
      "Shipped 3 production AI applications across edtech and food-tech, on web and Google Play.",
      "Built RAG pipelines on MongoDB Vector Search that improved retrieval precision by 22%; fine-tuned Gemma with LoRA.",
    ],
  },
  {
    role: "Software Engineer (Contract)",
    org: "Execufy",
    period: "2024",
    bullets: ["Delivered a hospitality operations platform on schedule and reduced server response times by 18%."],
  },
  {
    role: "Software Engineer",
    org: "Landmark Africa",
    period: "Jan 2022 – Jan 2024",
    bullets: [
      "First female software engineer at Landmark Africa; maintained applications serving 200,000+ monthly customers.",
      "Supported enterprise hotel clients including Google, JP Morgan and MTN.",
    ],
  },
  {
    role: "Software Support Engineer",
    org: "Zanibal LLC",
    period: "Mar 2021 – Nov 2021",
    bullets: ["Improved bug resolution cycles by 25% with SQL reporting pipelines; promoted within 3 months."],
  },
];

export type Award = {
  title: string;
  org: string;
  year: string;
  description: string;
  image: string; // put the file in public/awards/ and match the name here
};

export const awards: Award[] = [
  {
    title: "Full Circle Award",
    org: "Google Showcase",
    year: "2026",
    description:
      "Recognised for completing the full development-to-mentorship circle: graduated from the Women Developer Academy, became the first Google Developer Expert to emerge from it in Sub-Saharan Africa, then mentored others through the GDE Academy who also became GDEs.",
    image: "/awards/full-circle-award.jpg",
  },
  {
    title: "1st Place, AI Racer",
    org: "DAIM Hackathon",
    year: "2026",
    description:
      "Winning team in an autonomous racing challenge for Gymnasium's CarRacing-v3, pairing a PPO reinforcement-learning agent with a NEAT-style genetic algorithm. I built the genetic-algorithm component.",
    image: "/awards/daim-hackathon-2026.jpg",
  },
  {
    title: "Women Techmakers High Impact Award",
    org: "Women Techmakers",
    year: "2023",
    description:
      "First recipient of the Women Techmakers High Impact Award in Sub-Saharan Africa, for outstanding contributions to the technical community.",
    image: "/awards/wtm-high-impact-award.jpg",
  },
  {
    title: "Emerging Software Engineer, Nominee",
    org: "TechTrend Africa",
    year: "2021",
    description: "Nominated for early contributions to software engineering.",
    image: "/awards/techtrend-africa-nominee.jpg",
  },
];

// ── Writing ──────────────────────────────────────────────────
export const writingPlatforms = [
  { name: "dev.to", href: "https://dev.to/" }, // TODO: your profile URL
  { name: "Hashnode", href: "https://hashnode.com/" }, // TODO: your profile URL
  { name: "Medium", href: "https://medium.com/" }, // TODO: your profile URL
];

export type Article = {
  title: string;
  platform: "dev.to" | "Hashnode" | "Medium" | "Other";
  href: string;
  date?: string; // e.g. "2026-03"
  summary?: string;
};

// Newest first. Add one object per article.
export const articles: Article[] = [
  // TODO: replace these with your real articles
  { title: "TODO: article title", platform: "dev.to", href: "https://dev.to/", date: "2026-01" },
  { title: "TODO: article title", platform: "Hashnode", href: "https://hashnode.com/", date: "2025-11" },
  { title: "TODO: article title", platform: "Medium", href: "https://medium.com/", date: "2025-09" },
];

// ── Press, papers & conversations ────────────────────────────
export type PressItem = {
  title: string;
  outlet: string;
  href: string;
  date?: string;
  type: "Feature" | "Paper" | "Interview" | "Podcast" | "Talk" | "Mention";
};

export const press: PressItem[] = [
  // TODO: replace with real items. Types: Feature, Paper, Interview, Podcast, Talk, Mention.
  { title: "TODO: magazine or press feature", outlet: "TODO: outlet", href: "#", date: "2026", type: "Feature" },
  { title: "TODO: published paper title", outlet: "TODO: venue", href: "#", date: "2026", type: "Paper" },
  { title: "TODO: interview or podcast", outlet: "TODO: host", href: "#", date: "2025", type: "Podcast" },
];

export type Talk = { title: string; event: string; date: string; href?: string };
export const talks: Talk[] = [
  // TODO: replace with your real talks. Keep the best 4 to 6 here.
  { title: "TODO: talk title", event: "TODO: event name", date: "2026" },
  { title: "TODO: talk title", event: "TODO: event name", date: "2026" },
  { title: "TODO: talk title", event: "TODO: event name", date: "2025" },
];

export const community = {
  headline: "Girls Like Me Dream Initiative",
  body: "An outreach and AI training programme I founded. It has reached more than 640 girls, giving them hands-on exposure to AI and a community that tells them they belong in tech.",
  roles: [
    "Google Developer Expert (GDE)",
    "Women Techmakers Ambassador",
    "Partnership Lead, Hull AI Society",
    "Student Ambassador, University of Hull",
    "Volunteer tutor, PyGirls",
  ],
};
