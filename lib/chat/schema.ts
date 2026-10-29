import { z } from "zod";
import { AREAS, CATEGORIES, MAX_MESSAGE_CHARS } from "./types";

/*
  The body of POST /api/chat/session.

  Only what the user did: their intake answers, what they typed, how they
  rated answers, and whether they filed a ticket. Everything else (the bot's
  replies, rules fired, outcome, transcript) is recomputed on the server by
  replaying the messages. Strict, so a client cannot slip in ticket_status or
  any other column; bounded, so a save cannot write an unbounded blob.
*/

export const SessionRequestSchema = z
  .object({
    id: z.uuid(),
    category: z.enum(CATEGORIES),
    area: z.enum(AREAS),
    messages: z.array(z.string().min(1).max(MAX_MESSAGE_CHARS)).min(1).max(40),
    ratings: z
      .array(z.object({ ruleId: z.string().max(80), up: z.boolean() }).strict())
      .max(40),
    fileTicket: z.boolean(),
  })
  .strict()
  // "Feedback or complaint" has no answer step: it exists to become a ticket,
  // so it is only ever saved when the user files it.
  .refine((s) => s.category !== "feedback" || s.fileTicket, {
    message: "Feedback is saved only as a ticket.",
  });

export type SessionRequest = z.infer<typeof SessionRequestSchema>;
