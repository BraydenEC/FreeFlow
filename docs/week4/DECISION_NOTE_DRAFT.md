# Week 4 Human Decision Note: draft

**Required:** 150–250 words on decisions, rejections, corrections and tradeoffs.
**This draft:** see the word count at the bottom.

> Rewrite it in your own voice before submitting. The rubric scores *your*
> judgment, so it should sound like you. Every fact in it can be checked in this
> repository. If you change a fact, check it first.

---

Marketing is where a product is most tempted to exaggerate, so my first decision this week was a rule: every claim has to trace back to something real. The persona is the freelancer I interviewed in Week 2, quoted word for word, not an invented archetype. The homepage already said what FreeFlow is and is not, so I kept it and made its headline the control in my first A/B test instead of rewriting it.

The course allowed simulated AI output if it was labelled. I generated the campaign with Claude for real and labelled it anyway, so every card shows whether it came from the model or from seed copy. The code builds the 14-day calendar from the posts and scripts, so it can never schedule something that doesn't exist.

I rejected publishing straight to social networks, because that is a different product, and A/B click analytics, because I have no traffic and would be inventing numbers.

Two corrections. While planning, I found the site had quietly gone back from monochrome to indigo even though the commits said otherwise, so I restored it and made one file the source of truth. Later a check said Save was broken, but it had never actually reloaded the page. The code was right.

The tradeoff: live generation takes about 38 seconds and costs money, so it is rate limited and falls back to seed copy.

---

**Word count:** 233 (body only, excluding this line and the headers above).
