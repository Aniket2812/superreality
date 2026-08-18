import { Link } from "react-router-dom";
import {
  CalendarCheck,
  Check,
  Clock3,
  Mic2,
  PhoneCall,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StartFreeButton } from "@/components/marketing/start-free-button";

const FEATURES = [
  {
    icon: PhoneCall,
    number: "01",
    title: "Answers before they hang up",
    body: "A natural voice picks up in your name, day or night—while you stay focused on clients in front of you.",
  },
  {
    icon: UserRoundCheck,
    number: "02",
    title: "Understands what they want",
    body: "Budget, neighborhood, timing, financing. wondering asks the right questions and builds a useful buyer profile.",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "Turns interest into a showing",
    body: "It finds a fit from your listings, checks availability, and books directly into your calendar.",
  },
] as const;

const FAQ = [
  ["Will it sound robotic?", "No. Conversations are responsive and natural, with the tone, area knowledge, and boundaries you define."],
  ["What happens to buyer information?", "Your workspace keeps each buyer's preferences and call history private to your agency."],
  ["Can it use my listings?", "Yes. Connect your website or upload a file, review what was found, and choose exactly what goes live."],
  ["What if a buyer needs me?", "You receive the outcome and buyer details after the call, so you can step in with the full context."],
] as const;

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[42rem] lg:mx-0">
      <div className="absolute -inset-12 -z-10 rounded-full bg-primary/10 blur-3xl" />
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#201e1b] text-white shadow-[0_45px_100px_-40px_rgba(31,23,18,0.7)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5 text-sm font-semibold tracking-[-0.03em]">
            <span className="grid size-7 place-items-center rounded-[9px] bg-primary text-xs">w</span>
            wondering
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-[11px] text-white/60">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> Live
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-[1.2fr_.8fr] sm:p-5">
          <div className="rounded-[1.2rem] bg-white/[0.06] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Right now</p>
            <div className="mt-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Maya is speaking with</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Jordan Lee</p>
              </div>
              <span className="grid size-12 place-items-center rounded-full bg-primary"><Mic2 className="size-5" /></span>
            </div>
            <div className="mt-8 flex h-12 items-center gap-1" aria-hidden="true">
              {[14, 24, 38, 20, 44, 30, 18, 34, 46, 24, 36, 16, 28, 42, 22, 34].map((h, i) => (
                <span key={i} className="w-1 flex-1 rounded-full bg-primary/80" style={{ height: `${h}px`, opacity: .45 + (i % 4) * .14 }} />
              ))}
            </div>
            <div className="mt-5 flex gap-2 text-xs text-white/55">
              <span className="rounded-full bg-white/[0.07] px-3 py-1.5">3+ beds</span>
              <span className="rounded-full bg-white/[0.07] px-3 py-1.5">West end</span>
              <span className="rounded-full bg-white/[0.07] px-3 py-1.5">Under $700k</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex-1 rounded-[1.2rem] bg-primary p-5 text-primary-foreground">
              <Clock3 className="size-5" />
              <p className="mt-8 text-3xl font-semibold tracking-[-0.06em]">24/7</p>
              <p className="mt-1 text-xs text-white/75">Every call, covered.</p>
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
        <div><p className="text-xs font-semibold">New buyer qualified</p><p className="text-[11px] text-muted-foreground">Context saved automatically</p></div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <section className="page-grid border-b border-border/70">
        <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-7xl items-center gap-16 px-5 py-20 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:py-24">
          <div className="relative z-10">
            <p className="eyebrow">The AI buyer concierge</p>
            <h1 className="display-title mt-7 max-w-[9ch]">Never leave a buyer wondering.</h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">
              Meet the voice assistant that answers in your name, learns what every buyer needs, and gets the showing on your calendar.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <StartFreeButton label="Put it to work" />
              <Button asChild size="lg" variant="outline">
                <Link to="/call/demo"><PhoneCall /> Hear a live call</Link>
              </Button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
              <span>7 days free</span><span>No setup fee</span><span>Live in minutes</span>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section id="product" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">One thoughtful conversation</p>
            <h2 className="mt-5 max-w-[12ch] text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">From first ring to front door.</h2>
          </div>
          <p className="max-w-xl self-end text-lg leading-8 text-muted-foreground">wondering makes every inquiry feel personal—even when you’re driving, showing a home, or finally off the clock.</p>
        </div>
        <div className="mt-16 grid border-y border-border lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="group relative border-b border-border px-1 py-9 last:border-b-0 lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
              <div className="flex items-center justify-between"><feature.icon className="size-5 text-primary" /><span className="text-xs text-muted-foreground">{feature.number}</span></div>
              <h3 className="mt-16 max-w-[14ch] text-2xl font-semibold tracking-[-0.04em]">{feature.title}</h3>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="bg-[#201e1b] text-white">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 py-24 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:py-32">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Designed to remember</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">Every call makes the next one better.</h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[1.75rem] bg-white/10 sm:grid-cols-2">
            {[
              ["Connect", "Add your website or listings. You choose exactly what the assistant can recommend."],
              ["Personalize", "Set your name, market, voice, and calendar. It becomes a true extension of your business."],
              ["Share", "Use one call link, a site widget, or your phone line. Buyers can reach you from anywhere."],
              ["Remember", "Preferences and context carry across calls, so returning buyers never have to start over."],
            ].map(([title, body], i) => (
              <div key={title} className="bg-[#201e1b] p-7 sm:p-9"><span className="text-xs text-primary">0{i + 1}</span><h3 className="mt-10 text-xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/55">{body}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="rounded-[2rem] bg-primary px-6 py-14 text-primary-foreground sm:px-12 sm:py-20 lg:px-20">
          <Sparkles className="size-6" />
          <blockquote className="mt-10 max-w-4xl text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">“I stopped checking my phone during showings. The leads are qualified and on my calendar before I walk back to the car.”</blockquote>
          <p className="mt-8 text-sm text-white/75">Independent agent · Toronto, ON</p>
        </div>
      </section>

      <section id="pricing" className="border-y border-border bg-card/45">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_.85fr] lg:items-center lg:py-32">
          <div><p className="eyebrow">Simple from day one</p><h2 className="mt-5 max-w-[11ch] text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">One plan. Every conversation covered.</h2><p className="mt-6 max-w-lg text-muted-foreground">Start with a full week on us. No onboarding invoice, no seat math, no surprise platform fee.</p></div>
          <div className="rounded-[1.75rem] border bg-background p-7 sm:p-9">
            <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-semibold">wondering pro</p><p className="mt-1 text-xs text-muted-foreground">For independent agents</p></div><div className="text-right"><span className="text-4xl font-semibold tracking-[-0.055em]">$597</span><span className="text-sm text-muted-foreground"> / month</span></div></div>
            <div className="my-8 h-px bg-border" />
            <ul className="grid gap-3 text-sm">{["Always-on voice concierge", "Buyer memory and qualification", "Listing matches and calendar booking", "Call link and website embed", "No setup fee"].map(item => <li key={item} className="flex items-center gap-3"><Check className="size-4 text-primary" />{item}</li>)}</ul>
            <StartFreeButton label="Start your free week" className="mt-9 w-full" />
          </div>
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
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Your next lead is about to call</p><h2 className="mt-5 max-w-[13ch] text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl">Be there without picking up.</h2></div>
          <StartFreeButton label="Meet wondering" className="shrink-0" />
        </div>
        <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-1 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><span>© 2026 wondering</span><span>Every buyer remembered.</span></footer>
      </section>
    </main>
  );
}
