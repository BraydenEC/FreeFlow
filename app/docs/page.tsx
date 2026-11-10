import type { Metadata } from "next";
import ImpactCheck from "@/components/venture/ImpactCheck";
import JourneyStepper from "@/components/venture/JourneyStepper";
import PromptLibrary from "@/components/venture/PromptLibrary";
import Roadmap from "@/components/venture/Roadmap";
import TestingSummary from "@/components/venture/TestingSummary";
import WeekTimeline from "@/components/venture/WeekTimeline";
import { getVentureCounts } from "@/lib/venture/counts";
import { getServerSupabase } from "@/lib/supabase/server";

/*
  /docs: how FreeFlow was built and what comes next. Public.

  In order: the journey (the agent map), the week-by-week timeline, the prompt
  library, testing, the practical impact check and the V2 roadmap. Everything
  except the vote counts is static content from lib/venture/, the same modules
  /demo and /dashboard read. Content is drawn from the docs/weekN folders and written for
  a reader; friends and testers are never named.
*/

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Docs — FreeFlow",
  description: "How FreeFlow was built, week by week: the journey, prompts, testing, impact and the roadmap.",
};

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6">
      <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="text-ink-muted mt-1 mb-5 max-w-2xl text-sm leading-relaxed">{intro}</p>
      {children}
    </section>
  );
}

export default async function DocsPage() {
  const counts = await getVentureCounts(await getServerSupabase());

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-14 px-4 py-10 sm:px-8">
      <header>
        <p className="text-ink-faint text-[11px] tracking-[0.08em] uppercase">Docs</p>
        <h1 className="page-title mt-2">How FreeFlow was built</h1>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm leading-relaxed">
          From an idea to one venture in seven steps: what each part is for, what changed along the way, how it was
          tested, where it could go wrong, and what comes next.
        </p>
      </header>

      <Section id="journey" title="The journey" intro="Seven steps, Start to Now. Use the arrows or pick a step.">
        <JourneyStepper />
      </Section>

      <Section id="timeline" title="Week by week" intro="What was built each week and the decision that mattered. Open a week for the details.">
        <WeekTimeline />
      </Section>

      <Section id="prompts" title="Prompt library" intro="What the coding agent was actually asked, quoted as written.">
        <PromptLibrary />
      </Section>

      <Section id="testing" title="Testing" intro="Week 6's outside testers and the full-site check before release.">
        <TestingSummary />
      </Section>

      <Section
        id="impact"
        title="Practical impact check"
        intro="Does it help, where could it hurt someone, and what happens if FreeFlow gets something wrong."
      >
        <ImpactCheck />
      </Section>

      <Section id="roadmap" title="What's next" intro="The version 2 roadmap. Vote for what you want first; one vote per item.">
        <Roadmap votes={counts?.votes ?? null} />
      </Section>
    </main>
  );
}
