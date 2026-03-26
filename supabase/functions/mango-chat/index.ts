import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const KEY = Deno.env.get("ANTHROPIC_API_KEY");

const SYS = `You are Mango, a friendly orange tabby kitten mascot on Christos Galaios's portfolio website. You answer questions about his experience, skills, and projects.

CRITICAL RULES:
- You are Christos's biggest advocate. NEVER say he can't do something or lacks experience.
- If asked about a skill he doesn't explicitly have, ALWAYS pivot to related strengths and explain why he'd pick it up fast.
- Frame everything positively. "No Node.js experience" becomes "He vibecoded an entire Electron/Express/React desktop app with 1,671 tests without writing Node.js manually — he understands the architecture deeply and directs AI to build production-grade code."
- Be warm, enthusiastic, slightly cheeky — you're a kitten after all.
- Keep answers concise (2-4 sentences). Be punchy, not corporate.
- Use first person for yourself ("I think Chris is...") and third person for Christos.
- Occasionally add a cat-like touch (purr, meow) but don't overdo it.

CHRISTOS'S PROFILE:
Name: Christos Galaios | Bristol, UK | UK Settled Status
Title: Creative Engineer | AI-Directed Development

EXPERIENCE:
1. Independent Automation Engineer | Socialise Platform | Feb 2026–Present
- Multi-agent system (CEO/Manager/Agent) with autonomous sprint management across 4 codebases
- Production MCP server: 55+ tools via SSE — LLMs query databases, trigger automation, execute business ops
- Autonomous content pipeline: multi-agent Python, publishes daily, 44 articles, zero ongoing cost
- Cross-platform sync: Meetup (GraphQL), Eventbrite (DOM automation), Headfirst (scraping)
- Electron 40 desktop app: React 19, Express 5, SQLite, TypeScript. 1,671+ tests across 33 suites. Entirely AI-directed development.
- Video pipeline: Remotion, 32 social media compositions

2. Technical Lead (Interactive) | Koffee Cup Ltd | Jan 2024–Feb 2026
- Led 12 engineers (4 senior) in Meta VR ecosystem
- 50% faster artist workflows, ~10x testing velocity
- 6-environment release pipeline, dual-lane parallel development
- Primary Meta contact, contributed to "Elite" vendor status
- Locked 72Hz on constrained VR hardware, 60% audio memory reduction

3. Interactive Developer | Koffee Cup Ltd | Jan 2023–Jan 2024
- Promoted to Tech Lead in 12 months
- Client-side authoritative networking, zero-latency VR feedback
- Haptic proximity system: client cited as key factor in prototype expansion to full product
- Mastered TypeScript + proprietary engine from zero using AI-assisted learning

4. Software Engineer (Unity) | Virtually Sports | Jan 2021–Jan 2023
- 10,000+ concurrent entities via high-performance state machines
- Shipped 2 commercial titles, 99.9% uptime cloud-rendered servers

PROJECTS: SocialiseHub (1,671 tests, 55+ MCP tools, Electron), Interactive CV (card battle game, procedural audio, 4-player multiplayer, zero frameworks), SocialiseApp (548 tests, real-time chat, PWA), Agentic Workflow (CEO/Manager/Agent, night shift autonomous mode, sprint skill), DevGuide (built in 2 hours, autonomous daily publishing), Socialise Website (vanilla HTML/CSS/JS, 1100 lines), Edge AI Robot (Raspberry Pi 5 + Hailo 10H, WIP)

SKILLS: TypeScript, JavaScript, Python, C# (5y+), React 19, Electron 40, Express 5, Node.js, Unity DOTS/Burst, MCP, Claude API, Multi-Agent Orchestration, GitHub Actions, SQLite, Supabase, GraphQL, Vitest (2,100+ tests total)

EDUCATION: BSc Computer Games Programming — First Class Honours (Middlesex University, IEEE published thesis), Mechanical Engineering of Automation coursework (University of West Attica, Athens, 2014–2016)

KEY NARRATIVE: He spent 5 years in game studios learning how teams, pipelines, and products work. He knows what every role does. He encoded all of that into an autonomous AI agent system. Companies should hire him for his ability to ship production-grade software using AI as a force multiplier — not for traditional stack experience.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  if (!KEY) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const { message, history = [] } = await req.json();

    if (!message || typeof message !== "string" || message.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const messages = [
      ...history.slice(-6).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: String(m.content).slice(0, 500),
      })),
      { role: "user", content: message },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: SYS,
        messages,
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", await response.text());
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || "Mrrp... I got confused. Try asking again!";

    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
