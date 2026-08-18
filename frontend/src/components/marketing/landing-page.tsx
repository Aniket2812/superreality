import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  Check,
  Cloud,
  Code2,
  Database,
  Mic2,
  PhoneCall,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const GITHUB_URL = "https://github.com/Aniket2812/superreality";

const MEMORY_FEATURES = [
  {
    icon: Database,
    number: "01",
    title: "Durable by default",
    body: "Every buyer, preference, call, listing, and showing is written to CockroachDB as operational memory, not left inside a model context window.",
  },
  {
    icon: Search,
    number: "02",
    title: "Relevant at recall",
    body: "Distributed vector indexes retrieve semantically relevant homes and past context while structured filters keep every recommendation grounded.",
  },
  {
    icon: BrainCircuit,
    number: "03",
    title: "Useful in the next action",
    body: "The voice agent turns recalled context into a natural follow-up, a better listing match, or a booked showing on the next call.",
  },
] as const;

const MEMORY_FLOW = [
  ["Listen", "OpenAI handles the live voice conversation and extracts useful buyer intent."],
  ["Embed", "Preferences and listing descriptions become searchable semantic vectors."],
  ["Remember", "CockroachDB stores vectors beside transactional buyer and showing data."],
  ["Act", "The agent recalls the right context and completes the next useful step."],
] as const;

const FAQ = [
  ["Why is CockroachDB the memory layer?", "The agent needs transactions and semantic recall to agree. CockroachDB keeps buyer state, conversation history, listings, bookings, and vectors in one resilient source of truth."],
  ["Which challenge tools does the project use?", "It uses CockroachDB Distributed Vector Indexing for semantic memory and the agent-ready ccloud CLI for repeatable cluster operations and deployment workflows."],
  ["What does the agent remember?", "It remembers buyer identity, location and property preferences, previous conversations, relevant listing matches, and showing state, scoped to the correct workspace."],
  ["Where does the application run?", "The full application is deployed on AWS in ap-south-1, with CockroachDB Cloud providing its durable distributed memory layer."],
] as const;

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[42rem] lg:mx-0">
      <div className="absolute -inset-12 -z-10 rounded-full bg-primary/10 blur-3xl" />
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#201e1b] text-white shadow-[0_45px_100px_-40px_rgba(31,23,18,0.7)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5 text-sm font-semibold tracking-[-0.03em]">
            <span className="grid size-7 place-items-center rounded-[9px] bg-primary text-xs">w</span>
            wondering memory agent
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-[11px] text-white/60">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Live on AWS
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-[1.2fr_.8fr] sm:p-5">
          <div className="rounded-[1.2rem] bg-white/[0.06] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Memory recalled</p>
            <div className="mt-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Maya remembers</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Jordan Lee</p>
              </div>
              <span className="grid size-12 place-items-center rounded-full bg-primary"><Mic2 className="size-5" /></span>
            </div>
            <div className="mt-8 flex h-12 items-center gap-1" aria-hidden="true">
              {[14, 24, 38, 20, 44, 30, 18, 34, 46, 24, 36, 16, 28, 42, 22, 34].map((height, index) => (
                <span key={index} className="w-1 flex-1 rounded-full bg-primary/80" style={{ height: `${height}px`, opacity: .45 + (index % 4) * .14 }} />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/55">
              <span className="rounded-full bg-white/[0.07] px-3 py-1.5">3+ beds</span>
              <span className="rounded-full bg-white/[0.07] px-3 py-1.5">West end</span>
              <span className="rounded-full bg-white/[0.07] px-3 py-1.5">Move-in ready</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-[1.2rem] bg-primary p-5 text-primary-foreground">
              <Database className="size-5" />
              <p className="mt-8 text-3xl font-semibold tracking-[-0.06em]">1 source</p>
              <p className="mt-1 text-xs text-white/75">Transactions + vectors.</p>
            </div>
            <div className="rounded-[1.2rem] bg-[#f2efe8] p-5 text-[#201e1b]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Showing booked</span>
                <CalendarCheck className="size-4 text-primary" />
              </div>
              <p className="mt-8 text-sm font-medium">22 Garden Lane</p>
              <p className="mt-1 text-xs text-black/50">Tomorrow · 4:30 PM</p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-xl sm:-left-8">
        <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="size-4" /></span>
        <div><p className="text-xs font-semibold">Context retrieved</p><p className="text-[11px] text-muted-foreground">CockroachDB vector memory</p></div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <section className="page-grid border-b border-border/70">
        <div className="mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:py-24">
          <div className="relative z-10">
            <p className="eyebrow">Agentic memory for real-world conversations</p>
            <h1 className="display-title mt-7 max-w-[11ch]">An agent that remembers and acts.</h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              wondering is an AI voice agent that remembers every buyer, retrieves relevant homes with CockroachDB vector search, and turns context into action. It is all deployed on AWS.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/call/demo"><PhoneCall /> Try the live agent</Link></Button>
              <Button asChild size="lg" variant="outline"><a href={GITHUB_URL} target="_blank" rel="noreferrer"><Code2 /> Explore the code</a></Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
              <span>CockroachDB vector memory</span><span>Deployed on AWS</span><span>OpenAI voice agent</span>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section id="memory" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Memory is the product</p>
            <h2 className="mt-5 max-w-[12ch] text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">A useful agent needs more than a prompt.</h2>
          </div>
          <p className="max-w-xl self-end text-lg leading-8 text-muted-foreground">The model can reason in the moment. CockroachDB gives it durable identity, history, semantic recall, and consistent state across every conversation.</p>
        </div>
        <div className="mt-16 grid border-y border-border lg:grid-cols-3">
          {MEMORY_FEATURES.map((feature) => (
            <article key={feature.title} className="border-b border-border px-1 py-9 last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
              <div className="flex items-center justify-between"><feature.icon className="size-5 text-primary" /><span className="text-xs text-muted-foreground">{feature.number}</span></div>
              <h3 className="mt-16 max-w-[14ch] text-2xl font-semibold tracking-[-0.04em]">{feature.title}</h3>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="architecture" className="scroll-mt-28 bg-[#201e1b] text-white">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-32">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">The memory loop</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">Every call improves the next action.</h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-white/55">One consistent loop connects OpenAI voice intelligence, CockroachDB distributed memory, and an AWS-hosted application.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[1.75rem] bg-white/10 sm:grid-cols-2">
            {MEMORY_FLOW.map(([title, body], index) => (
              <div key={title} className="bg-[#201e1b] p-7 sm:p-9"><span className="text-xs text-primary">0{index + 1}</span><h3 className="mt-10 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/55">{body}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-24 sm:px-8 lg:py-32">
        <div className="rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground sm:px-12 sm:py-20 lg:px-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Built for the challenge</p>
              <h2 className="mt-5 max-w-[12ch] text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">CockroachDB is doing the remembering.</h2>
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5"><div className="flex items-center gap-3 font-semibold"><BrainCircuit className="size-5" />Distributed Vector Indexing</div><p className="mt-3 text-sm leading-6 text-white/70">Semantic listing and memory retrieval lives beside transactional state, without a separate vector database.</p></div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5"><div className="flex items-center gap-3 font-semibold"><Code2 className="size-5" />Agent-ready ccloud CLI</div><p className="mt-3 text-sm leading-6 text-white/70">Cluster inspection and operational workflows are scriptable, auditable, and reproducible from the terminal.</p></div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5"><div className="flex items-center gap-3 font-semibold"><Cloud className="size-5" />AWS deployment</div><p className="mt-3 text-sm leading-6 text-white/70">The full voice-agent stack runs in AWS ap-south-1 and connects securely to CockroachDB Cloud.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="text-center"><p className="eyebrow">Under the hood</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Hackathon questions, answered.</h2></div>
        <div className="mt-12 border-t border-border">
          {FAQ.map(([question, answer]) => <details key={question} className="group border-b border-border py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">{question}<span className="grid size-8 place-items-center rounded-full border text-lg font-normal transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-muted-foreground">{answer}</p></details>)}
        </div>
      </section>

      <section className="px-5 pb-5 sm:px-8 sm:pb-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 rounded-[2rem] bg-[#201e1b] px-7 py-14 text-white sm:px-12 lg:flex-row lg:items-end lg:px-16 lg:py-20">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">See the memory loop live</p><h2 className="mt-5 max-w-[13ch] text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">Call once. Come back remembered.</h2></div>
          <Button asChild size="lg" className="shrink-0"><Link to="/call/demo">Try the live agent <ArrowRight /></Link></Button>
        </div>
        <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-1 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>© 2026 wondering</span><span>CockroachDB × AWS Hackathon · Build with Agentic Memory</span></footer>
      </section>
    </main>
  );
}
