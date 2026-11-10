import { CHANGES } from "@/lib/venture/changes";

/*
  /docs practical impact check: does FreeFlow help, where could it hurt
  someone and what protects against that, what happens if it gets something
  wrong, and can it last. Content from the Week 6 spec.

  The "make it right" ladder is the owner's public accountability promise. It
  deliberately promises no cash: the top tier is free lifetime access when
  FreeFlow goes paid, given without being asked for.
*/

const RISKS: [string, string, string][] = [
  ["A wrong withholding figure", "Your tax planning", "Tested rules, the math shown, and a note that it isn't tax advice"],
  ["Paste a brief misreads a deadline or rate", "You and your client", "You check it before saving, and it says what it was unsure about"],
  ["Planning on money that is only “likely”", "Your income", "Scheduled and likely money are shown separately"],
  ["The help desk gives a wrong answer", "You", "Written rules only, so it can't invent an answer"],
  ["Private data exposed", "You and your clients", "Each account can only see its own rows. The owner says plainly that he can read help chats."],
  ["An outage or lost data", "Your deadlines", "Export to CSV any time, and pages keep working without the database"],
];

export default function ImpactCheck() {
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="impact-help">
        <h3 id="impact-help" className="text-[15px] font-semibold">
          1. Does it help?
        </h3>
        <ul className="text-ink-muted mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed">
          <li>
            A working freelancer interviewed in Week 2 said all the information he wanted was there. Two things he said
            changed the product: the phone layout, and projects that start as a fixed fee.
          </li>
          <li>
            {CHANGES.length} things people asked for have shipped so far, each one listed on the demo page with where it
            was said.
          </li>
          <li>Five outside testers use it this week. What they find is added to the testing summary above, good or bad.</li>
        </ul>
      </section>

      <section aria-labelledby="impact-hurt">
        <h3 id="impact-hurt" className="text-[15px] font-semibold">
          2. Where could it hurt someone, and what protects against it?
        </h3>
        <div className="border-hairline mt-3 overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-raised text-ink-muted text-xs">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">Could go wrong</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Who is hurt</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Protection</th>
              </tr>
            </thead>
            <tbody>
              {RISKS.map(([what, who, guard]) => (
                <tr key={what} className="border-hairline border-t align-top">
                  <td className="px-4 py-3">{what}</td>
                  <td className="text-ink-muted px-4 py-3">{who}</td>
                  <td className="text-ink-muted px-4 py-3">{guard}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="impact-wrong">
        <h3 id="impact-wrong" className="text-[15px] font-semibold">
          3. If we get it wrong, we&rsquo;ll make it right
        </h3>
        <ol className="mt-3 flex flex-col gap-3">
          {[
            ["Every problem", "We tell the people affected, quickly and plainly, fix it, and add it to the public list of what changed."],
            [
              "It affected your work",
              "Brayden personally helps put it right, for example by correcting your records. If FreeFlow's mistake caused a problem with your client, he'll write a short note to them explaining that FreeFlow made the mistake.",
            ],
            [
              "It cost you real money or a client",
              "You get free lifetime access when FreeFlow goes paid, automatically, without having to ask.",
            ],
          ].map(([tier, promise], k) => (
            <li key={tier} className="border-hairline bg-surface flex gap-4 rounded-xl border px-5 py-4">
              <span className="numeric text-ink-faint pt-0.5 text-xs">{k + 1}</span>
              <span>
                <span className="block text-sm font-semibold">{tier}</span>
                <span className="text-ink-muted mt-1 block text-sm leading-relaxed">{promise}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-ink-muted mt-3 text-sm leading-relaxed">
          FreeFlow doesn&rsquo;t pay cash for lost income, and won&rsquo;t pretend otherwise. If something went wrong,
          email{" "}
          <a href="mailto:braydenemeryc@gmail.com" className="text-ink underline-offset-4 hover:underline">
            braydenemeryc@gmail.com
          </a>
          .
        </p>
      </section>

      <section aria-labelledby="impact-last">
        <h3 id="impact-last" className="text-[15px] font-semibold">
          4. Can it last?
        </h3>
        <p className="text-ink-muted mt-2 max-w-3xl text-sm leading-relaxed">
          FreeFlow is free now, and runs on free tiers of its hosting and database. The plan is to stay free for as long as
          possible, then launch a one-time purchase for full access rather than a subscription. That purchase has to cover
          hosting, the database once usage outgrows its free tier, the AI calls behind Paste a brief, and the time it takes
          to keep fixing and improving it.
        </p>
      </section>
    </div>
  );
}
