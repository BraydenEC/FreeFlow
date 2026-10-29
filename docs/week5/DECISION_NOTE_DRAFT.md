# Week 5 Human Decision Note: draft

**Required:** 150–250 words on decisions, rejections, corrections and tradeoffs.
**This draft:** see the word count at the bottom.

> Rewrite it in your own voice before submitting. The rubric scores *your*
> judgment, so it should sound like you. Every fact in it can be checked in this
> repository. If you change a fact, check it first.

---

My biggest decision this week was not to put an AI model behind /chat. FreeFlow already uses Claude to read project briefs, and I know a model can sound sure of itself while being wrong. A help desk that makes up a setting is worse than having none. So the assistant answers from 27 written rules, each checked against the code it describes. When nothing fits, it says "I don't have an answer for that yet" and offers a ticket that I read in Supabase. That ticket is the human checkpoint: I either fix the problem or email the person myself.

I decided against opening the chat to signed-out visitors, to keep the load down, and against a live chat with me, because I can't staff one. Every conversation saves a summary. The full transcript is kept only for tickets, thumbs-down ratings, unanswered questions and guardrail hits.

Three corrections came before launch. A fact-check against the code found four wrong answers. One of them told users that "next Friday" is always understood, when only the AI model understands it. The first secret filter would have blanked invoice numbers, dates and phone numbers, while missing a password written in Spanish. And "can other users see my projects?" was being refused as a privacy violation, when it deserved a real answer.

The tradeoff: rules only understand phrasings someone has written down, so unfamiliar questions fall through to a ticket until training adds them.

---

**Word count:** 241 (body only, excluding this line and the headers above).
