/*
  The prompt library on /docs: prompts the owner gave the coding agent, quoted
  as written (typos kept), from docs/PROMPT_LOG.md and docs/week1-5/PROMPT_LOG.md.
  Week 6's come from this week's sessions. Friends' names are never included.
*/

export type PromptEntry = { week: number; title: string; text: string };

export const PROMPTS: PromptEntry[] = [
  {
    week: 0,
    title: "Plan before any code",
    text: "Read the attached document and begin to plan out the development for the website. DO NOT build anything yet, to start I want to create an organized plan for the development of the website before generating any code",
  },
  {
    week: 1,
    title: "Read the spec, audit, then plan",
    text: "Please read these documents. Make sure that I have everything listed in the documents. If so, please continue to develop the website and log all of the changes.",
  },
  {
    week: 1,
    title: "Close the gaps",
    text: "please continue to work, document all of the changes and create a handoff document when finished. Please tell me the actions I need to take individually",
  },
  {
    week: 2,
    title: "Plan before building",
    text: "Read these documents and create a plan/outline for what there is to work on for Week 2/Module 2",
  },
  {
    week: 2,
    title: "Choose an approach",
    text: "What are the options you have, and out of them what do you recommend most?",
  },
  {
    week: 2,
    title: "Completeness audit",
    text: "Is Week 2 fully finished according to the rubric and required contents?",
  },
  {
    week: 3,
    title: "Read everything, plan before building",
    text: "Read every document attached. Create outline for Module 3 based on documents.",
  },
  {
    week: 3,
    title: "Clarify the segment choice",
    text: "I dont what you mean by the small studio or contador serving freelancers",
  },
  {
    week: 4,
    title: "Verify the migrations",
    text: "I ran both of the prompts into supabase, please verify that they are both working",
  },
  {
    week: 4,
    title: "Audit against the rubric",
    text: "What is missing in module 4 based on the rubric",
  },
  {
    week: 5,
    title: "Train the bot together",
    text: "Nothing is wrong, As you build it, I want you to test the bot with me so we can figure out and train the bot the properly answer questions and problems",
  },
  {
    week: 5,
    title: "Rules, not a model",
    text: "Rule based engine that can be built off the tokens in this conversation",
  },
  {
    week: 5,
    title: "A person behind the bot",
    text: "If a bot cant solve an issue we will brainstorm a response, or allow a system to submit a ticket so I can fix the issue or personally email the user on my end",
  },
  {
    week: 6,
    title: "Build the funnel",
    text: "I want you to follow marketing research for a page funnel, this is what I want /demo to be, I want it to be a landing page and a marketing funnel guided at grabbing users attention and using the complete marketing funnel to get them to use the product and buy it once I make it paid.",
  },
  {
    week: 6,
    title: "Build fast, check at the end",
    text: "continue to work, use native for now as its quicker and we can do a full sweep for the end to ensure stability and speed",
  },
];
