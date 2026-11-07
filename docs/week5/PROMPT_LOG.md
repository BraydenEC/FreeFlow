# Week 5 Coding-Agent Prompt Log

**Agent:** Claude Code · **Requirement:** minimum 5 · **Delivered:** 34, all quoted from the session transcripts

> Typos are kept. Two prompts are shortened where marked with `…` or `[ ]`: a
> folder path on my computer, and the names of three friends. Short replies that only
> answered a question are grouped with the decision they settled.

| # | Date | Prompt | Result |
|---|---|---|---|
| 1 | Oct 28 | "Read all files following this pathname'…/Module 5'. When finished use brainstorm skill to outline next steps of production." | All four course PDFs read; design questions began |
| 2 | Oct 28 | "Ask the questions" | First guess at the purpose: a pre-sales fit check for visitors |
| 3 | Oct 28 | "I would picture long term users opening the chat with a probem with a feature or something specifically with the webaite, typically why I use the chat is because something is not working and am trying to find an alternative. If not, it would be about a pricing or a question about usage. I want the chat bot to be a general guide to help people with how ot use the app, how ot understand each of the features if not already clear, answer questions regarding prcing or anything technical and lastly save important conversations about issues with the website, general complaints" | **Corrected the agent's guess.** `/chat` became a help desk for existing users, not a sales bot |
| 4 | Oct 28 | "Nothing is wrong, As you build it, I want you to test the bot with me so we can figure out and train the bot the properly answer questions and problems" | Every wrong answer becomes a test row and a rule fix |
| 5 | Oct 28 | "Rule based engine that can be built off the tokens in this conversation" | **No AI at runtime.** Rules are written during the build |
| 6 | Oct 28 | "We figure out in this chat how the rules should work, and apply it to the bot" | Rules are agreed here, then put into the bot |
| 7 | Oct 28 | "If a bot cant solve an issue we will brainstorm a response, or allow a system to submit a ticket so I can fix the issue or personally email the user on my end" | Tickets became the human checkpoint |
| 8 | Oct 28 | "What would you recommend" | Tickets are read in the Supabase table; no private admin page this week |
| 9 | Oct 28 | "only existing users for now to reduce load" | Signed-in users only. The page still loads for everyone, with a sign-in prompt |
| 10 | Oct 28 | "What do you think" → "all of these fit for now, over time we can add more restraints" | The nine guardrails were accepted |
| 11 | Oct 28 | "yes" → "guided chat" | Guided chat chosen over a form-first layout, from two mockups |
| 12 | Oct 28 | "What would you recommend" | A summary of every conversation; the full transcript only when it matters |
| 13 | Oct 28 | "Not this week but I will be able to find some" → "Work on everything except for the 3 testers, we can add this later" | External tests deferred; design committed as `5c028a5` |
| 14 | Oct 29 | "write the plan" | 8-task plan, `47fdb92`. Packet committed before any code, `5083f6e` |
| 15 | Oct 29 | "Use native and have the subagents check the work as you build" | Built test-first with a reviewer per task, `3ce29f9` to `f63a6c3` |
| 16 | Oct 29 | "can you run the supabase sql on your own, and approve the merge" | Table created with 4 policies, merged, and tested live: 200, 401, and a second ticket refused with 409 |
| 17 | Oct 29 | "what is left for module 5" | Checklist of remaining evidence |
| 18 | Oct 29 | "Create an image generated mockup, draft a human decision note for me to edit, have you taken screenshots yet?" | Note drafted. Image prompt written, because the agent has no image generator |
| 19 | Nov 4 | "Now what is left for module 5 submission document" | The 13 required items, each with a status |
| 20 | Nov 4 | "Walk me through how to do the training sessions" | How to run a session and report wrong answers |
| 21 | Nov 4 | "Can you create a rule for every possible question that may be asked for every section, so that someone wont have to submit a ticket every time they have a question. Try to think of every possible issue and question, create the rules. So that most questions can be answered and in the end if anyone cant have their question answered they can submit a ticket to me" | 27 rules became 152, `b35e799`. On 50 unseen questions it answered 26. It can't cover "every possible question", and the log says so |
| 22 | Nov 4 | "please fix the problems, when finished reference all MODULE 5 documents and find what is missing" | App bugs fixed, `cf64068`: briefs become projects, CSV tax, Active Projects |
| 23 | Nov 4 | "Draft me a human decision note. Then pretend to be 3 other potential users, anf give a user test for each one. make each user different, different uses and freelance work. and finally provide a AI generated mockup" | Note redrafted; persona tests run through the real engine; Gemini mockup added |
| 24 | Nov 4 | "Do not label it as a rehearsal I can do that manually" | "Rehearsal" label dropped. They stay marked as written by Claude and out of the external tests table |
| 25 | Nov 6 | "fix the wrong answers, graders should have their own demo accounts" | Two wrong answers fixed test-first; demo account script, `22b3294` |
| 26 | Nov 6 | "make the people one called, [three friends' names], all of my friends back home who are into tech and understand ai usage, modeling and freelance work" | **The agent didn't do this as asked:** real names on invented results would be false evidence. It made a real test kit for them instead, `EXTERNAL_TESTS.md` |
| 27 | Nov 6 | "Can you do it for me" | **Declined:** creating production logins with the secret key stays with the owner |
| 28 | Nov 6 | "I cant find the url" | Gave the public project URL and where to find the key |
| 29 | Nov 6 | "I did the terminal steps what next" | Confirmed the three accounts and their sample data on the live site |
| 30 | Nov 6 | "Can you give me 3 scenarios to walk through and test for myself before sending my friends the link, pretend they are all in freelance and 2 are from USA 1 is from Mexico. I want you to walk me through copy and poasting the messages / chat comments for each account" | Three scripted scenarios with the expected rule for each message |
| 31 | Nov 6 | "can you takeover and do it manually? I can sign into each account for you if needed, but since you have access to the email and passwords would you be able to do it yourself" → "Signed into the first account" → "ready" | The owner signed in; the agent ran all three scenarios on the live site and found the problems in Iteration 4 |
| 32 | Nov 6 | "please use a parallel agent to fix all of the bugs and problems found" | 20 fixes, `3532264` to `4832111` |
| 33 | Nov 6 | "/handoff resume" | Picked up from the saved state; final code review found ten problems, seven fixed in `368e105` |
| 34 | Nov 6 | "Please make sure that Module 5 submission document is ready to submit," | This packet, with its evidence captured live and the items only the owner can supply left marked |
