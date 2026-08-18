import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  CalendarCheck,
  Check,
  Code2,
  History,
  Mic2,
  PhoneCall,
  Search,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const GITHUB_URL = "https://github.com/Aniket2812/superreality";

const PRODUCT_FEATURES = [
  {
    icon: PhoneCall,
    number: "01",
    title: "Answers while you are busy",
    body: "Every buyer gets an immediate, natural response while you are in a showing, driving, or away from your phone.",
  },
  {
    icon: UserRoundCheck,
    number: "02",
    title: "Qualifies without a form",
    body: "wondering learns the buyer's location, timing, property needs, and financing through a real conversation.",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "Moves the lead forward",
    body: "It recommends relevant listings, answers grounded questions, and turns serious interest into a booked showing.",
  },
] as const;

const CONVERSATION_FLOW = [
  ["Answer", "A warm voice responds when a buyer calls, even when the agent cannot."],
  ["Understand", "Natural questions uncover what the buyer actually needs and how soon they want to move."],
  ["Match", "The concierge searches the agent's real listings and explains why each home is relevant."],
  ["Continue", "Preferences carry into the next call, and the agent receives a clear summary and next step."],
] as const;

const FAQ = [
  ["Will it sound robotic?", "No. The conversation is responsive and natural. The assistant listens, asks follow-up questions, and stays within the tone and boundaries set by the agent."],
  ["Can it make up a listing?", "No. Recommendations are grounded in the listings connected to the workspace, so buyers only hear about homes the agent can actually offer."],
  ["What happens when a buyer calls again?", "wondering recognizes the buyer and continues from saved preferences and previous conversations instead of making them repeat everything."],
  ["When does the human agent step in?", "The agent receives the buyer profile, call outcome, relevant matches, and showing details, making the handoff immediate and informed."],
] as const;

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[42rem] lg:mx-0">
      <div className="absolute -inset-12 -z-10 rounded-full bg-primary/10 blur-3xl" />
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#201e1b] text-white shadow-[0_45px_100px_-40px_rgba(31,23,18,0.7)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5 text-sm font-semibold tracking-[-0.03em]">
            <span className="grid size-7 place-items-center rounded-[9px] bg-primary text-xs">w</span>
            wondering buyer concierge
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-[11px] text-white/60">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Live call
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-[1.2fr_.8fr] sm:p-5">
          <div className="rounded-[1.2rem] bg-white/[0.06] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Buyer conversation</p>
            <div className="mt-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Maya is speaking with</p>
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
              <UserRoundCheck className="size-5" />
              <p className="mt-8 text-3xl font-semibold tracking-[-0.06em]">Qualified</p>
              <p className="mt-1 text-xs text-white/75">Needs captured naturally.</p>
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
        <div><p className="text-xs font-semibold">Agent handoff ready</p><p className="text-[11px] text-muted-foreground">Full context saved automatically</p></div>
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
            <p className="eyebrow">The AI buyer concierge for real estate</p>
            <h1 className="display-title mt-7 max-w-[11ch]">Turn missed calls into booked showings.</h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              wondering answers every buyer inquiry, understands what they need, recommends the right homes, and keeps the conversation moving until the showing is on your calendar.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/call/demo"><PhoneCall /> Try the live concierge</Link></Button>
              <Button asChild size="lg" variant="outline"><a href={GITHUB_URL} target="_blank" rel="noreferrer"><Code2 /> Explore the project</a></Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
              <span>Always available</span><span>Grounded in your listings</span><span>Remembers every buyer</span>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section id="problem" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">The problem</p>
            <h2 className="mt-5 max-w-[12ch] text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">Buyer intent disappears into voicemail.</h2>
          </div>
          <p className="max-w-xl self-end text-lg leading-8 text-muted-foreground">The best inquiries often arrive while agents are driving, showing homes, or helping another client. A slow response means repeated questions, lost context, and a buyer who moves on.</p>
        </div>
        <div className="mt-16 grid border-y border-border lg:grid-cols-3">
          {PRODUCT_FEATURES.map((feature) => (
            <article key={feature.title} className="border-b border-border px-1 py-9 last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
              <div className="flex items-center justify-between"><feature.icon className="size-5 text-primary" /><span className="text-xs text-muted-foreground">{feature.number}</span></div>
              <h3 className="mt-16 max-w-[14ch] text-2xl font-semibold tracking-[-0.04em]">{feature.title}</h3>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="scroll-mt-28 bg-[#201e1b] text-white">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-32">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">One continuous conversation</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">From first hello to confirmed showing.</h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-white/55">wondering handles the repetitive work without making the experience feel repetitive for the buyer.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[1.75rem] bg-white/10 sm:grid-cols-2">
            {CONVERSATION_FLOW.map(([title, body], index) => (
              <div key={title} className="bg-[#201e1b] p-7 sm:p-9"><span className="text-xs text-primary">0{index + 1}</span><h3 className="mt-10 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/55">{body}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="memory" className="mx-auto max-w-7xl scroll-mt-28 px-5 py-24 sm:px-8 lg:py-32">
        <div className="rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground sm:px-12 sm:py-20 lg:px-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Why memory matters</p>
              <h2 className="mt-5 max-w-[12ch] text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">Returning buyers never start over.</h2>
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5"><div className="flex items-center gap-3 font-semibold"><History className="size-5" />Conversation continuity</div><p className="mt-3 text-sm leading-6 text-white/70">The next call begins with the buyer's saved needs, previous questions, and earlier recommendations.</p></div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5"><div className="flex items-center gap-3 font-semibold"><Search className="size-5" />Better listing matches</div><p className="mt-3 text-sm leading-6 text-white/70">The concierge connects what buyers say with relevant homes, even when they describe needs in their own words.</p></div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-5"><div className="flex items-center gap-3 font-semibold"><BrainCircuit className="size-5" />A complete agent handoff</div><p className="mt-3 text-sm leading-6 text-white/70">Agents get the context behind the lead, not just a name and number, so the human follow-up starts in the right place.</p></div>
            </div>
          </div>
          <p className="mt-10 border-t border-white/20 pt-6 text-xs leading-5 text-white/65">Technical note: CockroachDB keeps buyer history, listing context, and semantic recall together as one reliable memory layer.</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="text-center"><p className="eyebrow">The useful details</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Questions, answered.</h2></div>
        <div className="mt-12 border-t border-border">
          {FAQ.map(([question, answer]) => <details key={question} className="group border-b border-border py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold">{question}<span className="grid size-8 place-items-center rounded-full border text-lg font-normal transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-muted-foreground">{answer}</p></details>)}
        </div>
      </section>

      <section className="px-5 pb-5 sm:px-8 sm:pb-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-10 rounded-[2rem] bg-[#201e1b] px-7 py-14 text-white sm:px-12 lg:flex-row lg:items-end lg:px-16 lg:py-20">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Hear it for yourself</p><h2 className="mt-5 max-w-[13ch] text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">Give every buyer a helpful first conversation.</h2></div>
          <Button asChild size="lg" className="shrink-0"><Link to="/call/demo">Try the live concierge <ArrowRight /></Link></Button>
        </div>
        <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-1 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>© 2026 wondering</span><span>Every buyer heard. Every conversation remembered.</span></footer>
      </section>
    </main>
  );
}
