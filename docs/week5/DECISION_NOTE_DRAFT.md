# Week 5 Human Decision Note: draft

**Required:** 150–250 words on decisions, rejections, corrections and tradeoffs.
**This draft:** see the word count at the bottom.

> Rewrite it in your own voice before submitting. The rubric scores *your*
> judgment, so it should sound like you. Every fact in it can be checked in this
> repository. If you change a fact, check it first.

---

My biggest decision this week was not to put an AI model behind /chat. FreeFlow already uses Claude to read briefs, and a model can sound sure of itself while being wrong. A help desk that invents a setting is worse than having none. So the guide answers from 152 written rules, and when nothing fits it says so and offers a ticket. I read tickets in Supabase and either fix the problem or email the person myself. That is the human checkpoint.

I rejected a live chat, because I can't staff one, and kept the chat signed-in only to limit load. I also limited what gets stored: every conversation keeps its first message, the answers given and the ratings, and the full transcript is kept only for tickets, thumbs-down ratings, unanswered questions and guardrail hits.

Checking the answers against the code changed more than the bot. Reviews found 24 wrong or misleading answers, such as "how much have I been paid" getting "FreeFlow is free". They also exposed real bugs: saved briefs never became projects, and the CSV added 16% IVA to rows with no client type. I fixed the app, not just the wording.

The tradeoff is coverage. On 50 questions the rules had never seen, the guide answered 26, and about five of those missed the point. Rules only know wording someone anticipated, so the rest become tickets until real questions train them.

---

**Word count:** 236 (body only, excluding this line and the headers above).
