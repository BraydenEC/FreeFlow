/*
  The content rules /chat answers from.

  Every answer here is a claim about FreeFlow, so each one is written from the
  code it describes, not from memory of what the feature was meant to do.
  The source is noted above each rule; when that code changes, the answer
  must change with it. Keywords and phrases are normalised (lower-case, no
  accents, no punctuation). A rule only competes when the user's first two
  intake answers fall inside its categories and areas.

  This file is meant to be edited: each training session with the owner turns
  a wrong answer into a sample in samples.ts and a fix here.
*/

import type { Rule } from "./types";

export const CONTENT_RULES: Rule[] = [
  // lib/forecast/model.ts — deadline + terms (30-day default), paid skipped, past-due is "late"
  {
    id: "forecast-zero",
    categories: ["broken", "how_to"],
    areas: ["forecast", "dashboard"],
    keywords: ["forecast", "zero", "empty", "nothing", "missing", "pronostico", "blank"],
    phrases: ["next month", "shows zero", "shows 0", "is empty", "month empty", "not showing", "isn t showing", "not in the forecast", "missing from the forecast", "paid project"],
    answer:
      "The forecast puts each unpaid project in the month its money is expected: the deadline plus payment terms (the project's own, or your default in Settings, which starts at 30 days). So work due next month usually lands the month after. Paid projects aren't counted, an hourly project with no hours logged is worth 0 so it isn't counted until you add hours, and money already past its expected date shows as late rather than in a month.",
  },
  // lib/forecast/model.ts expectedPaymentDate; ProjectForm "Payment terms"; Settings "Default payment terms"
  {
    id: "payment-terms",
    categories: "any",
    areas: ["forecast", "projects", "dashboard", "account"],
    keywords: ["terms", "days", "default", "net"],
    strong: ["terms"],
    phrases: ["payment terms", "net 30", "takes to pay", "days to pay", "pays late"],
    answer:
      "Payment terms are how many days after the deadline a client usually pays you. Set your default in Settings (top right), and override it on a project in its Payment terms field. The forecast uses them to decide which month each project's money lands in.",
  },
  // components/dashboard/MarkPaidButton.tsx; features "Record a payment"
  {
    id: "record-payment",
    categories: ["broken", "how_to"],
    areas: ["dashboard", "projects"],
    keywords: ["paid", "mark", "received", "earnings", "pagado", "pago"],
    phrases: ["mark paid", "mark as paid", "mark a project", "got paid", "record a payment", "record payment", "client paid", "como pagado", "me pagaron", "marcar pagado", "marcar un pago", "marco un pago"],
    answer:
      "Use Mark paid on the project's row. It records the payment with today's date and counts it in this month's earnings. Payment isn't editable in the project form, so Mark paid is the way to record it.",
  },
  // app/page.tsx hasOverdue (unpaid and past deadline); components/dashboard/OverdueAlert.tsx
  {
    id: "overdue-alert",
    categories: ["broken", "how_to"],
    areas: ["dashboard", "projects", "other"],
    keywords: ["overdue", "late", "alert", "warning", "pinned", "vencido", "vencida", "atrasado"],
    strong: ["overdue", "vencido", "vencida", "atrasado"],
    phrases: ["past due", "overdue alert", "overdue mean", "what s late", "says overdue", "say overdue", "shows overdue", "marked overdue"],
    answer:
      "A project counts as overdue when it isn't paid and either its deadline has passed or its status is Overdue. The alert only appears then, and it sits at the top of the dashboard while Pin overdue to the top is on in Settings. Marking the project paid clears it; if the deadline was wrong, move it and change the status too.",
  },
  // components/dashboard/ProjectForm.tsx — "New project", "Edit project", "Save changes", Hourly / Fixed fee
  {
    id: "project-create-edit",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard"],
    keywords: ["add", "create", "new", "edit", "change", "update", "rate", "fee", "hourly", "fixed", "proyecto"],
    phrases: ["new project", "add a project", "add project", "edit a project", "edit project", "edit my project", "can t edit", "change the deadline", "move the deadline", "change my rate", "my rate", "client name", "wrong amount", "wrong client", "typo", "put the wrong", "entered the wrong", "nuevo proyecto", "proyecto nuevo", "agrego un proyecto", "agregar proyecto", "agregar un proyecto", "crear proyecto", "crear un proyecto", "editar proyecto"],
    answer:
      "Add a project with + New project under the projects table: name, client, status, deadline, and either a fixed total or hours and an hourly rate, then choose Add project. To change it later, choose Edit on its row, change the fields and choose Save changes.",
  },
  // ProjectForm "Deadline", "Contract signed", "Save changes"; app/page.tsx hasOverdue; lib/forecast/model.ts
  {
    id: "project-date-fix",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard", "other"],
    keywords: ["date", "wrong"],
    phrases: ["the wrong date", "wrong date", "wrong deadline", "put the wrong date", "entered the wrong date", "typed the wrong date", "typed the wrong deadline", "put the wrong deadline", "entered the wrong deadline", "change the date", "fix the date", "correct the date", "fix the deadline", "correct the deadline", "deadline is wrong"],
    answer:
      "Choose Edit on the project's row, change the Deadline and choose Save changes. The table, the forecast and the Overdue alert follow the new date. If its status is Overdue, change that too, because it doesn't change by itself. The Contract signed date is in the same form.",
  },
  // components/dashboard/ProjectForm.tsx onDelete → DELETE /api/projects/[id]
  {
    id: "project-delete",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard"],
    keywords: ["delete", "remove", "trash", "proyecto"],
    phrases: ["delete a project", "delete project", "remove a project", "delete my project", "delete all", "eliminar proyecto", "borrar proyecto", "eliminar un proyecto", "borrar un proyecto", "borro un proyecto"],
    answer:
      "Choose Edit on the project's row, then Delete project at the bottom of the form, and Yes, delete to confirm. Projects are deleted one at a time, and it can't be undone.",
  },
  // ProjectForm "Contract signed", "Contract link", "Stripe invoice or payment link"
  {
    id: "contract-links",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard"],
    keywords: ["contract", "signed", "link", "links", "stripe", "signature", "url"],
    strong: ["contract"],
    phrases: ["contract link", "payment link", "signed contract", "put the contract", "drive link", "paste a link"],
    answer:
      "Each project has fields for the date the contract was signed, a contract link, and a Stripe invoice or payment link. Choose Edit on its row to fill them in. Links must start with http:// or https://, and appear on the row as Contract and Invoice. FreeFlow only stores them; it doesn't create the contract or the invoice.",
  },
  // lib/core/extract.ts + heuristic.ts; features "Brief extraction", "Extraction provenance"
  {
    id: "brief-wrong-field",
    categories: ["broken", "how_to"],
    areas: ["brief"],
    keywords: ["brief", "extract", "extraction", "wrong", "field", "paste", "pasted", "misread", "client", "name", "rate"],
    phrases: ["client email", "wrong client", "wrong rate", "got it wrong", "read it wrong", "edit the result", "edit the fields", "can i edit"],
    answer:
      "Brief extraction can misread things. Choose Create project on the result and correct any field in the form before choosing Add project. Or change the text in the box so the detail is stated clearly and choose Extract core again. The note under the result names the fields to double-check.",
  },
  // lib/core/heuristic.ts — unknowns are null and named in the confidence note
  {
    id: "brief-unsure",
    categories: ["broken", "how_to"],
    areas: ["brief"],
    keywords: ["unsure", "note", "confidence", "blank", "heuristic", "pattern", "matching", "null", "badge", "claude", "say", "says"],
    phrases: ["not sure", "left blank", "pattern matching", "empty field", "not found"],
    answer:
      "When extraction can't find something, the field says \"not found\" and the note names it, instead of guessing. Choose Create project and fill the gap in the form, or add the detail to the brief and extract again. A Pattern matching badge means the AI model wasn't available, so the extraction is simpler; a Claude badge means the AI model read it.",
  },
  // lib/core/heuristic.ts — year-less dates resolve to the next future occurrence
  {
    id: "relative-dates",
    categories: ["broken", "how_to"],
    areas: ["brief"],
    keywords: ["date", "deadline", "friday", "monday", "tomorrow", "year", "relative", "wrong", "picked"],
    phrases: ["next friday", "next week", "end of the month", "wrong date", "wrong year"],
    answer:
      "Dates without a year are read as the next time that date comes around. Phrases like \"next Friday\" are only understood when the AI model did the extraction, so a Pattern matching badge means you should check it. To fix a wrong date, choose Create project and correct the deadline in the form, or write the date out, like Nov 14, and extract again. If the project already exists, choose Edit on its row and change the deadline there.",
  },
  // lib/currency.ts — 11 currencies, one per account, never converted
  {
    id: "currencies",
    categories: "any",
    areas: "any",
    keywords: ["currency", "currencies", "dollar", "dollars", "peso", "pesos", "euro", "euros", "mxn", "usd", "convert", "conversion", "exchange", "symbol", "moneda", "cambiar"],
    strong: ["currency", "currencies", "moneda", "mxn"],
    phrases: ["exchange rate", "wrong currency", "change currency", "change my currency", "changed my currency"],
    answer:
      "FreeFlow supports eleven currencies: USD, MXN, COP, ARS, BRL, CLP, PEN, UYU, CAD, EUR and GBP. Each account uses one, chosen in Settings (top right). Amounts are never converted, so changing it changes how your figures are written, not what they are worth.",
  },
  // lib/tax/withholding.ts — applies when the client is persona moral; 2/3 IVA; ISR 10% general / 1.25% RESICO
  {
    id: "withholding-explained",
    categories: "any",
    areas: "any",
    keywords: ["withholding", "withheld", "retenciones", "retencion", "iva", "isr", "bank", "lower", "less", "net"],
    strong: ["withholding", "retenciones", "retencion", "iva", "isr"],
    phrases: ["lower than", "less than the invoice", "what reaches", "in my bank", "me llega menos", "me retienen", "pagaron menos", "me pago menos", "depositaron menos", "menos de lo que facture", "menos de lo que cobre", "paid me less", "less than i invoiced", "less than i billed", "what is iva", "what is isr", "que es iva", "que es isr"],
    answer:
      "When a company (persona moral) in Mexico pays you, it withholds two thirds of the IVA and part of the ISR: 10% under the general regime or 1.25% under RESICO. The forecast, the After retenciones panel and the net line in the table on a computer show what actually reaches your bank, which is lower than the invoice. Unpaid Invoices and This Month's Earnings show the amount you entered, before tax, so they won't match your bank. Set the client type on the project and your regime in Settings.",
  },
  // components/dashboard/ExportButton.tsx → /api/export/projects
  {
    id: "csv-export",
    categories: "any",
    areas: ["dashboard", "projects", "other"],
    keywords: ["csv", "export", "spreadsheet", "excel", "download", "sheets", "exportar", "descargar"],
    strong: ["csv", "export", "exportar", "excel"],
    phrases: ["google sheets", "export my projects", "export to csv", "export a csv", "export the csv"],
    answer:
      "Use Export CSV under the projects table to download every project, whatever filter is on, as a file that opens in Excel or Google Sheets. The button appears once you have a project; if a filter matches nothing, choose Clear to bring it back. Retenciones are already worked out where they apply. If it says your projects could not be loaded, try again shortly.",
  },
  // components/prefs/LayoutDrawer.tsx; features "Saved layout preferences"
  {
    id: "layout-prefs",
    categories: ["broken", "how_to"],
    areas: ["dashboard", "account"],
    keywords: ["layout", "widget", "widgets", "density", "hide", "order", "width", "arrange", "rearrange", "compact", "table", "bigger", "smaller", "wider"],
    strong: ["layout"],
    phrases: ["hide a widget", "move the panel", "move the widget", "move the forecast", "dashboard layout", "change the order", "reset to defaults", "reset the layout", "reset my layout"],
    answer:
      "Open Settings (top right) to choose the density, which dashboard panels appear, their order and width, and whether explanations are shown. Changes save to your account by themselves, so the layout follows you to other devices. Reset to defaults puts everything in Settings back, including your currency, payment terms and tax regime.",
  },
  // app/(auth)/login, signup, verify-email
  {
    id: "sign-in",
    categories: ["broken", "how_to"],
    areas: ["account", "other"],
    keywords: ["sign", "login", "log", "logged", "verify", "verification", "confirm", "signup", "sesion", "entrar"],
    strong: ["login", "signup"],
    phrases: ["sign in", "log in", "logged out", "verify my email", "logged me out", "confirmation email", "verification email", "invalid login credentials", "iniciar sesion", "no puedo entrar"],
    answer:
      "You're signed in now if you can see this chat. On another device, sign in with the email and password you signed up with; new accounts have to confirm their email first, so check your inbox and spam folder. To reset a password, sign out first, then use Forgot your password? on the sign-in page.",
  },
  // app/(auth)/forgot-password, reset-password
  {
    id: "password-reset",
    categories: ["broken", "how_to"],
    areas: ["account", "other"],
    keywords: ["password", "reset", "forgot", "forgotten", "contrasena", "olvide"],
    strong: ["password", "contrasena"],
    phrases: ["forgot my password", "reset my password", "change my password", "reset link", "olvide mi contrasena", "cambiar contrasena", "cambiar mi contrasena", "recuperar contrasena"],
    answer:
      "Sign out first, because the reset page sends signed-in people back to the dashboard. Choose Sign out at the top right, go to the sign-in page, use the Forgot your password? link, enter your email and choose Send reset link. Then follow the link in the email to choose a new password. Check your spam folder if it doesn't arrive within a minute.",
  },
  // app/research; features "Competitor & substitute analysis", "Confidence on every claim", "Risk map"
  {
    id: "research-page",
    categories: ["how_to", "pricing_technical"],
    areas: ["research", "other"],
    keywords: ["research", "competitor", "competitors", "substitute", "substitutes", "risks", "sources", "prices"],
    strong: ["substitute", "competitors"],
    phrases: ["what is research", "research page", "come from", "a substitute"],
    answer:
      "Research compares eleven competing products and substitutes with pricing, sourced for eight of them and marked estimated for the other three, marks every claim as verified, reported or estimated, and maps the risks to FreeFlow. It's background on why FreeFlow is built the way it is; there's nothing to set up.",
    links: [{ label: "Research", href: "/research" }],
  },
  // app/pricing/page.tsx "free while it is early… None of this is being charged today"; lib/support.ts
  {
    id: "pricing-free",
    categories: "any",
    areas: "any",
    keywords: ["free", "cost", "costs", "price", "pay", "charge", "charged", "subscription", "cancel", "refund", "billing", "trial", "gratis", "cuesta", "costo"],
    strong: ["gratis", "refund", "subscription", "costo"],
    phrases: ["how much does it cost", "how much is freeflow", "is it free", "cancel my subscription", "being charged", "was charged", "got charged", "did i get charged", "want a refund", "credit card", "pay for freeflow", "pay in", "is freeflow free", "is this free", "is this app free", "free to use", "what s included", "whats included", "included for free", "es gratis", "cuanto cuesta", "tiene costo"],
    exact: ["how much", "how do i pay", "can i cancel", "how much is it"],
    answer:
      "FreeFlow is free while it grows: every feature, for everyone, and nothing is charged today. There's no subscription to cancel and nothing to refund. Donations are optional and don't unlock anything.",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Support FreeFlow", href: "/support" },
    ],
  },
  // lib/pricing/tiers.ts — Solo, Project, Pro, Studio; "The page describes a model, not a bill"
  {
    id: "pricing-tiers",
    categories: ["how_to", "pricing_technical"],
    areas: ["pricing", "other"],
    keywords: ["tier", "tiers", "pro", "studio", "solo", "plans"],
    strong: ["tiers", "tier"],
    phrases: ["pricing page", "pro plan", "studio plan", "get with pro", "with pro", "with studio", "pricing real", "how much is pro", "how much is studio", "how much is solo"],
    answer:
      "Solo (free), Project ($9 a month), Pro ($14 a month) and Studio ($12 per seat a month) are the model FreeFlow intends to move to, not a bill. None of it is charged today. The CFDI issuance and seats those paid tiers depend on are not built yet.",
    links: [{ label: "Pricing", href: "/pricing" }],
  },
  // app/support/page.tsx; lib/support.ts — real running costs, nothing gated on donating
  {
    id: "donations",
    categories: "any",
    areas: "any",
    keywords: ["donate", "donating", "donation", "donations", "tip", "coffee", "contribute", "donar", "donacion"],
    strong: ["donate", "donation", "donating", "donar", "donacion"],
    phrases: ["support freeflow", "support the project", "i donate", "buy you a coffee", "make a donation", "puedo donar", "como dono"],
    answer:
      "Donations are optional and go to real running costs like hosting and the domain. They don't unlock any features. The Support page has the details; if it says donations aren't set up yet, there's no payment link to use right now.",
    links: [{ label: "Support FreeFlow", href: "/support" }],
  },
  // features "Accounts and per-user data" — RLS on every table; chat_sessions notice
  {
    id: "data-privacy",
    categories: "any",
    areas: "any",
    keywords: ["privacy", "private", "data", "shared", "secure", "security", "safe", "visible", "sell", "see"],
    strong: ["privacy"],
    phrases: ["other users", "who can see", "is my data", "is this safe", "is it safe", "mis datos", "privacidad"],
    answer:
      "Your projects and settings belong to your account and are protected by row-level security, so other users can't see them. Every help conversation saves your first message, which answers you got and your ratings, so the owner can fix problems. The full conversation is kept only for tickets, thumbs-down answers, questions the guide couldn't answer and messages it had to turn down, with secrets removed.",
  },
  // supabase/*.sql RLS, "The owner's dashboard bypasses RLS"; no encrypt or pgcrypto anywhere in app, lib, components or supabase. Hosting-side encryption can't be read from this repo, so it isn't claimed
  {
    id: "data-encryption",
    categories: "any",
    areas: "any",
    keywords: ["encrypted", "encrypt", "encryption", "encrypting", "encriptado", "encriptados", "encriptar", "cifrado", "cifrados"],
    strong: ["encrypted", "encrypt", "encryption", "encrypting", "encriptado", "encriptados", "encriptar", "cifrado", "cifrados"],
    phrases: ["encrypted", "encrypt", "encryption", "encriptado", "encriptados", "cifrado", "cifrados"],
    answer:
      "I can't confirm encryption details from here, and FreeFlow's own code adds none on top of its database. What I can say: your data is in a hosted Supabase database, and row-level security stops other users from seeing your rows. That covers your projects with their client names, amounts and links, your settings, anything you save, and help conversations. The owner can read tickets and saved data, so don't store anything you wouldn't want seen. For more detail, submit a ticket.",
    offerTicket: true,
  },
  // features note: the Week 2 persona's complaint was "annoying on mobile"
  {
    id: "mobile",
    categories: "any",
    areas: "any",
    keywords: ["mobile", "phone", "iphone", "android", "tablet", "screen", "tiny", "tap", "cut", "celular"],
    strong: ["iphone", "android", "celular", "tablet"],
    phrases: ["on my phone", "on mobile", "cut off", "too small"],
    answer:
      "FreeFlow runs in your phone's browser; there's no app to install. If something is cut off or hard to tap, submit a ticket saying which page, because mobile problems are exactly what the owner wants to fix.",
    offerTicket: true,
  },
  // lib/product/features.ts — CFDI issuance and materialidad evidence are planned
  {
    id: "planned-cfdi",
    categories: "any",
    areas: "any",
    keywords: ["cfdi", "factura", "facturar", "facturas", "pac", "timbrar", "timbre", "materialidad", "xml"],
    strong: ["cfdi", "factura", "facturar", "timbrar", "materialidad"],
    phrases: ["electronic invoice", "legal invoice", "issue an invoice", "send an invoice", "issue a cfdi", "como facturar", "emitir factura", "hacer factura"],
    answer:
      "Issuing CFDI invoices and materialidad evidence are not built yet. They're planned, and the Product page shows what's built and what isn't. For now FreeFlow tracks the work and the payment, so issue the CFDI with your usual provider.",
    links: [{ label: "Product", href: "/product" }],
    offerTicket: true,
  },
  // lib/product/features.ts — seats, cross-person view, per-person profitability are planned
  {
    id: "planned-studio",
    categories: "any",
    areas: "any",
    keywords: ["team", "teams", "seat", "seats", "studio", "invite", "collaborate", "collaborator", "profitability", "employees"],
    strong: ["seats", "seat", "team", "employees"],
    phrases: ["multiple users", "add a user", "add users", "two users", "more users", "second user", "per person", "my team"],
    answer:
      "Multiple seats, a cross-person project view and per-person profitability are not built yet. FreeFlow is one person per account today, and the Product page shows what's planned.",
    links: [{ label: "Product", href: "/product" }],
    offerTicket: true,
  },
  // No self-serve account deletion exists in app/ or app/api/
  {
    id: "account-delete",
    categories: "any",
    areas: ["account", "other"],
    keywords: ["delete", "close", "erase", "remove", "cancel"],
    phrases: ["delete my account", "close my account", "remove my account", "cancel my account", "delete my data", "borrar mi cuenta", "eliminar mi cuenta"],
    answer:
      "You can't delete your account yourself in FreeFlow yet. Submit a ticket and the owner will delete it and confirm by email.",
    offerTicket: true,
  },
  // app/marketing; features "Marketing content engine", "A/B headline test"
  {
    id: "marketing-page",
    categories: ["broken", "how_to"],
    areas: ["marketing"],
    keywords: ["marketing", "posts", "post", "scripts", "script", "campaign", "persona", "copy"],
    strong: ["persona", "campaign"],
    phrases: ["marketing page", "video scripts", "what is marketing", "the persona"],
    answer:
      "The Marketing page is FreeFlow's own campaign: the persona, ten posts, three video scripts, a 14-day calendar and an A/B headline test. Each post and script can be copied or saved, and Export CSV downloads the posts and scripts.",
    links: [{ label: "Marketing", href: "/marketing" }],
  },
  // features "Cash-flow dashboard" — derived, not stored
  {
    id: "dashboard-numbers",
    categories: ["broken", "how_to"],
    areas: ["dashboard"],
    keywords: ["dashboard", "unpaid", "earnings", "earned", "cards", "total", "number", "numbers", "active", "wrong", "counting", "right"],
    phrases: ["this month", "unpaid invoices", "active projects", "wrong number", "wrong total", "0 unpaid", "zero unpaid", "unpaid shows", "owe me"],
    answer:
      "The dashboard cards are worked out from your projects each time you open it. Unpaid Invoices adds up unpaid projects whose status is Invoice sent or Overdue, so work still in progress isn't counted. This Month's Earnings adds up projects marked paid this month, and starts again each month. Active Projects counts unpaid projects that haven't been invoiced yet. If someone owes you and it isn't counted, set that project's status to Invoice sent with Edit on its row. For any other number, check each project's status and whether it's been marked paid.",
  },

  // ── Projects ──────────────────────────────────────────────────────────────
  // lib/projects/schema.ts messages; ProjectForm error display
  {
    id: "project-form-errors",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard"],
    keywords: ["required", "error", "invalid", "save", "saving", "submit"],
    phrases: ["won t save", "can t save", "doesn t save", "not saving", "could not save", "not a real date", "no client", "without a client", "above 0", "needs a total", "needs a rate", "must start with"],
    answer:
      "The form shows what's wrong next to the field. A project needs a name, a client and a real deadline. A fixed-fee project needs a total above 0, an hourly one needs a rate above 0, and links must start with http:// or https://. If it says it could not save, try again, and submit a ticket if it keeps failing.",
    offerTicket: true,
  },
  // ProjectForm STATUS_OPTIONS; lib/progress.ts; StatusBadge "Payment outranks status"
  {
    id: "project-statuses",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard"],
    keywords: ["status", "statuses", "stage", "stages", "progress", "bar", "percent"],
    strong: ["status", "statuses", "stage"],
    phrases: ["awaiting review", "invoice sent", "contract signed", "in progress", "progress bar", "change the status"],
    answer:
      "A project moves through Contract signed, In progress, Awaiting review, Invoice sent and Overdue. You set the status yourself with Edit on its row, and it doesn't change on its own. Paid isn't a status you choose: Mark paid records it, and the progress bar then shows 100%.",
  },
  // MarkPaidButton hides once paid and sends no date; PATCH never touches payment
  {
    id: "payment-undo",
    categories: "any",
    areas: ["projects", "dashboard", "other"],
    keywords: ["undo", "unmark", "mistake", "accidentally", "reverse"],
    strong: ["unmark"],
    phrases: ["as unpaid", "mark unpaid", "paid by mistake", "paid by accident", "paid date", "date paid", "undo mark paid"],
    answer:
      "Mark paid can't be undone in the app, and it always records today's date, so a payment can't be edited afterwards. Submit a ticket with the project's name and what it should say, and the owner can correct it.",
    offerTicket: true,
  },
  // No partial-payment fields: is_paid + paid_at on the whole project
  {
    id: "partial-payments",
    categories: "any",
    areas: ["projects", "dashboard", "other"],
    keywords: ["partial", "deposit", "deposits", "installment", "installments", "milestone", "milestones", "anticipo", "upfront"],
    strong: ["partial", "deposit", "installment", "anticipo", "milestone", "upfront"],
    phrases: ["partial payment", "paid half", "split a project", "split the payment", "a deposit", "paid a deposit", "up front", "half now", "half at the end"],
    answer:
      "A project is either paid in full or not paid, so partial payments can't be recorded. The workaround is one project per payment, like \"Website: deposit\" and \"Website: final\", so each can be marked paid on its own.",
  },
  // No recurrence anywhere in lib/projects
  {
    id: "recurring-projects",
    categories: "any",
    areas: ["projects", "dashboard", "other"],
    keywords: ["recurring", "retainer", "retainers", "repeat", "repeating"],
    strong: ["recurring", "retainer"],
    phrases: ["every month", "monthly retainer", "recurring project", "recurring invoice"],
    answer:
      "There are no recurring projects. For a retainer, add a separate project for each billing period with + New project, using that period's deadline.",
  },
  // ProjectForm "Hours logged"; lib/format.ts projectValue — hours × rate, no timer exists
  {
    id: "time-tracking",
    categories: ["broken", "how_to", "pricing_technical"],
    areas: ["projects", "dashboard", "other"],
    keywords: ["timer", "timesheet", "timesheets", "clock", "hours", "tracking"],
    strong: ["timer", "timesheet"],
    phrases: ["track my time", "time tracking", "add hours", "log hours", "log my hours", "hours logged", "start a timer", "my hours", "update hours", "enter hours", "change hours"],
    answer:
      "There's no timer. On an hourly project, choose Edit on its row, update Hours logged and choose Save changes. The project's value is hours times rate. A fixed-fee project uses its total instead.",
  },
  // ProjectFilters; lib/projects.ts order("deadline"); app/page.tsx "The filter narrows the TABLE only"
  {
    id: "project-search-filter",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard"],
    keywords: ["search", "filter", "filters", "sort", "sorted", "sorting"],
    strong: ["search", "filter", "sort"],
    phrases: ["no projects match", "sort by", "sort the", "filter by", "search for", "only unpaid", "see only"],
    answer:
      "Above the projects table you can search by project or client, and filter by stage and payment. If it says No projects match, choose Clear. Filters only change the table, not the cards, the forecast or the alert. The table is ordered by deadline, soonest first, and there's no other sort.",
  },
  // ProjectFilters; prefs widget visibility; per-account RLS
  {
    id: "project-missing",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard", "other"],
    keywords: ["disappeared", "vanished", "gone", "missing"],
    phrases: ["projects disappeared", "project disappeared", "projects are gone", "can t find my project", "lost my projects", "don t see my", "no veo mis", "mis proyectos"],
    answer:
      "If you see Clear beside the filters above the table, choose it, because a search can hide projects. Then check you're signed in with the email you used, since projects belong to one account, and that Projects table is switched on in Settings. If it's still missing, submit a ticket with the project's name.",
    offerTicket: true,
  },
  // ProjectForm "a deleted project is gone and there is no undo"
  {
    id: "project-recover",
    categories: "any",
    areas: ["projects", "dashboard", "other"],
    keywords: ["restore", "recover", "undelete"],
    strong: ["restore", "undelete", "recover"],
    phrases: ["deleted a project", "deleted my project", "accidentally deleted", "get it back", "undo delete"],
    answer:
      "A deleted project is gone: there's no trash or undo. Add it again with + New project. If you exported a CSV before deleting it, the details will be in that file.",
  },
  // No import route; app/api/projects creates one at a time
  {
    id: "import-bulk",
    categories: "any",
    areas: ["projects", "dashboard", "other", "account"],
    keywords: ["import", "importing", "bulk", "duplicate", "clone", "migrate"],
    strong: ["import", "duplicate", "bulk", "clone"],
    phrases: ["import projects", "import my", "from excel", "from a spreadsheet", "duplicate a project", "copy a project", "bulk edit"],
    answer:
      "You can't import a file, duplicate a project or edit several at once. Add each one with + New project. Export works the other way: Export CSV downloads everything you've added.",
  },
  // lib/forecast/model.ts "clients are not yet records of their own"
  {
    id: "clients",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard", "account", "other"],
    keywords: ["client", "clients", "customer", "customers", "rename", "cliente", "clientes"],
    strong: ["customers", "clientes"],
    phrases: ["client list", "add a client", "rename a client", "manage clients", "client page", "more than one client", "two clients", "multiple clients", "un cliente", "agregar cliente"],
    answer:
      "Clients aren't separate records: each project has one Client field you type into. To rename a client, choose Edit on each of their projects. The search above the table finds every project for a client.",
  },
  // No limit in app/api/projects; lib/pricing/tiers.ts Solo is the future model
  {
    id: "project-limit",
    categories: "any",
    areas: ["projects", "dashboard", "pricing", "other"],
    keywords: ["limit", "limits", "maximum"],
    phrases: ["how many projects", "project limit", "limit on projects", "too many projects", "3 active projects", "3 projects"],
    answer:
      "There's no limit on projects today. The \"up to 3 active projects\" on the Pricing page describes the Solo tier in a future model, and it isn't enforced.",
    links: [{ label: "Pricing", href: "/pricing" }],
  },
  // ProjectForm stores links only; lib/product/features.ts CFDI issuance planned
  {
    id: "invoice-create",
    categories: ["broken", "how_to", "pricing_technical"],
    areas: ["projects", "dashboard", "other"],
    keywords: ["invoice", "invoices", "invoicing"],
    strong: ["invoice", "invoices", "invoicing"],
    phrases: ["create an invoice", "make an invoice", "generate an invoice", "send the invoice", "send an invoice", "invoice a client", "invoice my client", "invoice template", "email an invoice"],
    answer:
      "FreeFlow tracks invoices but doesn't create or send them. Send yours from your usual tool, set the project's status to Invoice sent, and paste its link in the Stripe invoice or payment link field. If you're in Mexico, issuing a legal CFDI is not built yet, so keep using your usual provider.",
  },
  // ProjectForm payment_url is a stored link; no Stripe or bank integration
  {
    id: "payment-automatic",
    categories: "any",
    areas: "any",
    keywords: ["automatic", "automatically", "detect", "sync", "connect"],
    phrases: ["connect to stripe", "connect stripe", "sync with stripe", "connect my bank", "bank account", "mark paid automatically", "detect payment"],
    answer:
      "FreeFlow doesn't connect to Stripe or your bank, so it can't tell when you've been paid. The payment link on a project is only a link. Use Mark paid when the money arrives.",
  },
  // No notification code in lib or app: mail is auth-only (Supabase)
  {
    id: "reminders",
    categories: "any",
    areas: "any",
    keywords: ["reminder", "reminders", "remind", "notification", "notifications", "notified", "notify"],
    strong: ["reminder", "reminders", "notification", "notifications", "remind"],
    phrases: ["payment reminder", "send reminders", "remind my client", "get notified", "email reminder"],
    answer:
      "FreeFlow doesn't send reminders or notifications to you or your clients. Its only emails are for confirming your account and resetting your password. The Overdue alert on the dashboard shows what to chase when you open it.",
  },
  // No expense tables in supabase/
  {
    id: "expenses",
    categories: "any",
    areas: "any",
    keywords: ["expense", "expenses", "receipts", "spending", "margin", "gastos"],
    strong: ["expense", "expenses", "receipts", "gastos"],
    phrases: ["track expenses", "my expenses", "profit margin"],
    answer:
      "FreeFlow tracks income from projects, not expenses or receipts, so it can't show profit. Export CSV gives you the income side to combine with your own expense records.",
  },

  // ── Dashboard and settings ────────────────────────────────────────────────
  // app/page.tsx hasForecast / hasWithholding / hasOverdue; LayoutDrawer "Reset to defaults"
  {
    id: "widgets-missing",
    categories: ["broken", "how_to"],
    areas: ["dashboard", "forecast", "account", "other"],
    keywords: ["widget", "widgets", "panel", "panels", "missing", "disappeared", "gone", "hidden"],
    phrases: ["expected income panel", "where did the", "after retenciones panel", "panel is missing", "widget is missing"],
    answer:
      "Some panels only appear when they have something to show: Expected income needs an unpaid project worth more than 0, After retenciones needs an unpaid project with a persona moral client, and the Overdue alert needs something overdue. Anything else may be switched off in Settings (top right), where each panel has a checkbox.",
  },
  // components/core/CorePreview.tsx; components/research/ResearchWidget.tsx
  {
    id: "dashboard-sections",
    categories: ["broken", "how_to"],
    areas: ["dashboard", "other"],
    keywords: ["extractions", "widget"],
    phrases: ["recent extractions", "market research", "research widget"],
    answer:
      "Recent extractions lists the briefs you've saved in Core, and Market research summarises the Research page. They're there for reference, and you can switch either off in Settings (top right).",
  },
  // components/TopBar.tsx — the Settings label is hidden on small screens
  {
    id: "settings-location",
    categories: "any",
    areas: "any",
    keywords: ["settings", "preferences", "gear", "configuracion", "ajustes"],
    strong: ["settings", "configuracion", "ajustes", "gear"],
    phrases: ["where are settings", "where is settings", "find settings", "open settings", "settings page", "la configuracion"],
    answer:
      "Settings is the gear at the top right of every page; on a phone it's only the icon. It holds your default payment terms, tax regime, currency, density, explanations and dashboard layout. Changes save by themselves, and Done closes it.",
  },
  // LayoutDrawer "Density", "Show reasoning everywhere"; components/prefs/Reasoning.tsx
  {
    id: "reading-prefs",
    categories: ["broken", "how_to"],
    areas: "any",
    keywords: ["density", "compact", "comfortable", "reasoning"],
    strong: ["density", "reasoning"],
    phrases: ["show reasoning", "why button", "why note", "what is density"],
    answer:
      "Density sets how tightly the pages are spaced: compact or comfortable. Show reasoning everywhere opens every \"Why\" note on the Research and Pricing pages; it's off by default, and you can open a single note with its button. Both are in Settings (top right).",
  },
  // lib/prefs/store.ts debounced PUT to /api/prefs
  {
    id: "settings-not-saving",
    categories: ["broken"],
    areas: ["account", "dashboard", "other"],
    keywords: ["resetting", "resets"],
    phrases: ["settings keep", "settings are gone", "settings won t save", "settings not saving", "settings don t save", "layout keeps", "keeps resetting", "keep resetting", "layout won t save"],
    answer:
      "Settings save by themselves a moment after you change them, to your account while you're signed in. Reload the page and check you're signed in with the same email. Reset to defaults clears everything, so avoid it if you only want to change one thing. If they still don't stick, submit a ticket.",
    offerTicket: true,
  },
  // app/globals.css "One palette, always."
  {
    id: "theme",
    categories: "any",
    areas: "any",
    keywords: ["theme", "themes"],
    strong: ["theme"],
    phrases: ["dark mode", "light mode", "change the color", "change the colour", "change the theme"],
    answer:
      "FreeFlow has one colour scheme, so there's no dark or light mode to switch. Density in Settings is the main way to change how pages look.",
  },
  // app/layout.tsx lang="en"; no translations exist
  {
    id: "language",
    categories: "any",
    areas: "any",
    keywords: ["spanish", "espanol", "language", "languages", "idioma", "translate", "traducir", "version"],
    strong: ["spanish", "espanol", "idioma", "language"],
    phrases: ["in spanish", "en espanol", "change the language"],
    answer:
      "FreeFlow and this guide are in English for now, and there's no Spanish version. You can still type project and client names in Spanish, accents included, and I understand some common questions in Spanish, though I answer in English.",
  },
  // Features summary, app/page.tsx widgets
  {
    id: "getting-started",
    categories: "any",
    areas: "any",
    keywords: ["tutorial", "beginner", "onboarding"],
    strong: ["tutorial", "onboarding"],
    phrases: ["get started", "getting started", "where do i start", "how does freeflow work", "what is freeflow", "what does freeflow do", "what can freeflow do", "how to use freeflow", "who is it for", "who is this for", "for freelancers", "freelancers only", "point of this", "owes me", "me deben", "small business", "for my business", "para que sirve", "como empiezo", "como funciona freeflow", "que es freeflow"],
    answer:
      "FreeFlow tracks your projects and the money they bring in. Start by setting your currency and default payment terms in Settings (top right). Then add your first project in the New project form on the dashboard, and keep its status up to date. The dashboard shows what's unpaid, what you earned this month, what's overdue, and six months of expected income. Choose Mark paid when money arrives.",
  },
  // lib/nav/dock.ts DOCK_GROUPS
  {
    id: "app-sections",
    categories: ["how_to", "pricing_technical"],
    areas: "any",
    keywords: ["menu", "navigation", "tabs", "dock"],
    strong: ["menu", "navigation", "tabs", "dock"],
    phrases: ["what is core", "what does core do", "core page", "main menu", "top bar", "where are the pages", "where is the menu"],
    answer:
      "Every page is in the Dock, the round button at the bottom of the screen: hover it or tap it to open. Demo is a short tour of FreeFlow. Dashboard is your projects and money. Paste a brief turns a client's message into a project. Help desk is this guide. Research is the market evidence behind FreeFlow. Product lists what's built and planned. Pricing shows a possible long-term model. Marketing is FreeFlow's own campaign. Docs is how FreeFlow was built and what comes next. Support is for optional donations. Settings and your account stay at the top right.",
  },
  // app/product/page.tsx; lib/product/features.ts
  {
    id: "product-page",
    categories: "any",
    areas: "any",
    keywords: ["roadmap", "planned", "upcoming", "features"],
    strong: ["roadmap", "planned"],
    phrases: ["product page", "what is planned", "roadmap", "new features", "coming soon", "features are planned", "what s new", "whats new", "changelog"],
    answer:
      "The Product page lists every capability and marks each one built or planned. CFDI issuance, materialidad evidence and studio features like multiple seats are not built yet, and the page doesn't give dates. To ask for something, submit a ticket.",
    links: [{ label: "Product", href: "/product" }],
    offerTicket: true,
  },
  // Feedback saved only as a ticket: lib/chat/schema.ts
  {
    id: "feedback-path",
    categories: "any",
    areas: "any",
    keywords: ["complaint", "complaints", "suggestion", "suggestions", "queja", "sugerencia"],
    strong: ["complaint", "suggestion", "queja", "sugerencia"],
    phrases: ["feature request", "request a feature", "report a bug", "bug report", "i want to complain", "give feedback", "have feedback", "leave feedback", "would be nice", "tengo una queja", "reportar un error"],
    answer:
      "Thanks, the owner wants to hear this. Submit a ticket below with what happened or what you'd like, and it goes straight to the owner.",
    offerTicket: true,
  },
  // components/auth/SignOutButton.tsx pushes to /signup
  {
    id: "sign-out",
    categories: "any",
    areas: "any",
    keywords: ["signout", "logout"],
    strong: ["logout", "signout"],
    phrases: ["sign out", "log out", "logout", "cerrar sesion"],
    answer:
      "Choose Sign out at the top right. It takes you to the sign-up page, and your projects stay saved for next time.",
  },
  // PrefsProvider "Every change is debounced and PUT to /api/prefs"; per-account data
  {
    id: "multiple-devices",
    categories: "any",
    areas: "any",
    keywords: ["device", "devices", "laptop", "computer"],
    strong: ["device", "devices", "laptop"],
    phrases: ["another device", "other device", "two devices", "different computer", "another computer", "another phone"],
    answer:
      "Yes. Sign in with the same email on any device and your projects and settings come with you. There's nothing to install.",
  },
  // lib/projects.ts falls back to mock data; app/api/export/projects refuses it
  {
    id: "sample-data",
    categories: "any",
    areas: ["dashboard", "projects", "other"],
    keywords: ["sample", "fake", "demo", "mock"],
    strong: ["fake", "mock", "sample"],
    phrases: ["projects i didn t add", "not my projects", "aren t mine", "fake projects", "sample data", "demo data"],
    answer:
      "If you see projects you never added, FreeFlow couldn't reach its database and showed sample data so the page would still load. They aren't anyone's real projects, and yours aren't lost. Reload in a minute; Export CSV refuses to run while this is happening. If it keeps happening, submit a ticket. The exception is a grader demo account, whose projects start with \"Sample:\" on purpose.",
    offerTicket: true,
  },
  // ProjectForm todayIso, paid route, lib/format daysUntil all use UTC
  {
    id: "dates-timezone",
    categories: "any",
    areas: "any",
    keywords: ["timezone", "utc"],
    strong: ["timezone", "utc"],
    phrases: ["time zone", "wrong day", "one day off", "day off", "day early", "day ahead", "off by one"],
    answer:
      "FreeFlow works out dates in UTC, so in the evening in Mexico its \"today\" can already be tomorrow. That can affect the date the project form starts on, the date Mark paid records, and how many days a project shows as late. You can correct a deadline with Edit on its row; for a wrong paid date, submit a ticket.",
    offerTicket: true,
  },
  // No native app; components/TopBar.tsx runs in the browser
  {
    id: "app-install",
    categories: "any",
    areas: "any",
    keywords: ["install", "offline", "desktop"],
    strong: ["install", "offline"],
    phrases: ["app store", "play store", "mobile app", "desktop app", "download the app", "is there an app", "without internet", "work offline"],
    answer:
      "There's no app to install. FreeFlow runs in the browser on your phone or computer, and it needs an internet connection. You can add it to your phone's home screen from the browser menu.",
  },
  // components/TopBar.tsx nav overflow-x-auto
  {
    id: "mobile-nav",
    categories: "any",
    areas: "any",
    // Also carries `mobile`'s evidence, so naming the menu is what tips it here.
    // Without that the two tie, and `mobile` wins by being earlier in the file.
    keywords: ["menu", "nav", "phone", "cut"],
    strong: ["nav"],
    phrases: ["find help", "help on my phone", "menu is cut off", "menu on my phone", "tabs on my phone", "top bar on my phone", "on my phone", "cut off"],
    answer:
      "On a phone, every page is in the Dock: tap the round button at the bottom of the screen, then swipe the row sideways to reach Docs and Support. Settings is the gear at the top right.",
  },
  // No integrations in package.json or app/api; features map has none
  {
    id: "integrations",
    categories: "any",
    areas: "any",
    keywords: ["integrate", "integration", "integrations", "quickbooks", "xero", "zapier", "slack", "notion", "trello", "asana", "api", "sync", "calendar"],
    strong: ["quickbooks", "xero", "zapier", "slack", "notion", "integration", "integrations", "api", "trello", "asana"],
    phrases: ["public api", "google calendar", "work with"],
    answer:
      "FreeFlow doesn't connect to other tools and has no public API. You can store contract and payment links on a project, and Export CSV gives you a file other tools can read. To ask for a connection, submit a ticket.",
    offerTicket: true,
  },
  // package.json; supabase/; lib/core/extract.ts
  {
    id: "tech-stack",
    categories: ["pricing_technical", "how_to"],
    areas: "any",
    keywords: ["nextjs", "supabase", "vercel", "stack", "technology", "stored", "hosted", "server", "servers"],
    strong: ["supabase", "vercel", "nextjs"],
    phrases: ["tech stack", "built with", "where is my data", "what database", "who hosts"],
    answer:
      "FreeFlow is a web app built with Next.js and hosted on Vercel. Your data is stored in Supabase, a hosted Postgres database, with row-level security limiting each account to its own rows. Brief extraction uses Anthropic's Claude model when it's available.",
  },
  // No /terms or /privacy route in app/
  {
    id: "legal-pages",
    categories: "any",
    areas: "any",
    keywords: ["gdpr", "terminos"],
    strong: ["gdpr", "terminos"],
    phrases: ["terms of service", "terms of use", "terms and conditions", "privacy policy", "aviso de privacidad"],
    answer:
      "FreeFlow doesn't have separate terms or privacy policy pages yet. In short: other users can't see your projects, and nothing is charged. If you need something specific in writing, submit a ticket.",
    offerTicket: true,
  },
  // ChatWindow FILED copy; supabase/chat_sessions.sql tickets frozen by RLS
  {
    id: "ticket-help",
    categories: "any",
    areas: "any",
    keywords: ["ticket", "tickets"],
    strong: ["ticket", "tickets"],
    phrases: ["my ticket", "submit a ticket", "file a ticket", "open a ticket", "ticket status", "how long until", "get a reply", "hear back", "response time"],
    answer:
      "Submit a ticket from this chat: you'll see a note that this conversation goes to the owner and which email it's sent from, then choose Submit ticket. The owner reads every ticket and replies to your account's email address. You can't check a ticket's status here, and a filed ticket can't be changed, so start a new conversation if you need to add something.",
  },
  // lib/chat — the assistant's own scope
  {
    id: "help-capabilities",
    categories: "any",
    areas: "any",
    keywords: [],
    phrases: ["what can you do", "what can you help", "this assistant", "this bot", "how can you help", "what can i ask", "what do you know", "who are you"],
    answer:
      "I'm FreeFlow's automated guide. I answer from written rules about problems in the app, how each feature works, pricing and technical questions. Ask in a sentence, and if I can't help, you can submit a ticket to the owner.",
  },
  // Whole-message small talk: without these "hi" would read as an unanswered question
  {
    id: "chat-greeting",
    categories: "any",
    areas: "any",
    keywords: [],
    exact: ["hi", "hello", "hey", "hi there", "hello there", "hola", "buenas", "buenos dias", "buenas tardes", "good morning", "good afternoon", "help", "help me", "please help", "i need help", "ayuda", "test"],
    answer:
      "Hi! Tell me in a sentence what you're trying to do or what went wrong, and I'll do my best to help.",
  },
  {
    id: "chat-thanks",
    categories: "any",
    areas: "any",
    keywords: [],
    exact: ["thanks", "thank you", "thanks a lot", "thank you so much", "thx", "ty", "gracias", "muchas gracias", "ok", "okay", "ok thanks", "ok gracias", "great", "perfect", "perfecto", "got it", "cool", "nice", "awesome"],
    answer:
      "You're welcome. Ask another question any time, or use 👍 or 👎 to tell the owner whether this helped.",
  },
  // Generic: complaints about the guide itself, only when nothing specific matched
  {
    id: "not-helpful",
    categories: "any",
    areas: "any",
    generic: true,
    keywords: [],
    phrases: ["didn t help", "doesn t help", "not helpful", "useless", "wrong answer", "not what i asked", "not what i meant", "you don t understand", "i don t understand", "no sirve", "no entiendo"],
    answer:
      "Sorry about that. Try asking again in one sentence with the name of the feature, or tap 👎 and submit a ticket so the owner can see it and fix the answer.",
    offerTicket: true,
  },
  // Generic: "too hard" with nothing more to go on. The three steps are ProjectForm, status and MarkPaidButton; panels are the widget checkboxes in LayoutDrawer
  {
    id: "too-complicated",
    categories: "any",
    areas: "any",
    generic: true,
    keywords: [],
    phrases: ["too complicated", "too complex", "too confusing", "too hard", "so complicated", "so confusing", "hard to use", "overwhelming", "demasiado complicado", "muy complicado"],
    answer:
      "You only need three things: add a project on the dashboard, keep its status up to date, and choose Mark paid when the money arrives. The rest is optional, and you can switch off panels you don't want in Settings (top right). If one part is confusing, tell me which, or submit a ticket so the owner can make it simpler.",
    offerTicket: true,
  },
  // Generic: first steps for a fault no specific rule describes
  {
    id: "app-error",
    categories: "any",
    areas: "any",
    generic: true,
    keywords: [],
    phrases: ["crashed", "crash", "crashes", "crashing", "blank", "frozen", "freezes", "stuck", "loading", "loads", "slow", "broken", "bug", "glitch", "error", "not working", "isn t working", "doesn t work", "won t load", "won t open", "can t click", "can t tap", "keeps reloading", "keeps refreshing", "404", "page not found", "takes forever", "taking forever", "takes too long", "is down", "site down", "nothing happens", "nothing happened", "doesn t do anything", "something went wrong", "no hace nada", "no me deja", "no guarda", "no puedo guardar", "no funciona", "no carga", "no abre", "se traba", "esta lento"],
    answer:
      "Try this first: reload the page, check you're still signed in, then try a private window or another browser. If it still happens, submit a ticket saying which page you were on and the exact message you saw.",
    offerTicket: true,
  },
  // Messages from app/api routes: 429s, "Sign in to save", Network error, 503s
  {
    id: "error-messages",
    categories: "any",
    areas: "any",
    keywords: [],
    phrases: ["too many requests", "wait a moment", "sign in to save", "sign in to use", "network error", "could not reach", "not configured"],
    answer:
      "Too many requests means you've hit a short limit, so wait a minute and try again. Sign in to save means your session ended, so sign in again. Network error or could not reach means the connection dropped, so check it and retry. Not configured is a problem on FreeFlow's side, so submit a ticket.",
    offerTicket: true,
  },

  // ── Forecast ──────────────────────────────────────────────────────────────
  // components/dashboard/ForecastPanel.tsx; lib/forecast/model.ts STAGE_LIKELIHOOD, horizon 6
  {
    id: "forecast-explained",
    categories: "any",
    areas: ["forecast", "dashboard", "other"],
    keywords: ["forecast", "scheduled", "likely", "weighted", "weights", "income", "accurate", "estimate", "estimates", "percent"],
    strong: ["scheduled", "likely", "weighted", "percent", "accurate"],
    phrases: ["expected income", "what does likely", "weighted by stage", "forecast calculated", "forecast work", "where is the forecast", "find the forecast", "percentages", "me van a pagar", "will i make", "will i earn", "going to make", "going to earn"],
    answer:
      "The forecast is the Expected income panel on the dashboard, covering the next six months. Scheduled is what's due. Likely weights that by stage: Invoiced 97%, Awaiting review 95%, In progress 90%, Overdue 85%, Contract signed 75%. Those percentages are estimates, and you can't change them.",
  },
  // ForecastPanel "Already late … past its expected date"
  {
    id: "forecast-late",
    categories: ["broken", "how_to"],
    areas: ["forecast", "dashboard"],
    keywords: [],
    phrases: ["already late", "past its expected"],
    answer:
      "Already late is money whose expected date, the deadline plus payment terms, has passed. It's shown as its own figure and isn't counted in any month. Choose Mark paid when it arrives, or use Edit on the row if the deadline or terms are wrong.",
  },
  // lib/forecast/model.ts DEFAULT_HORIZON_MONTHS; ForecastPanel "falls beyond"
  {
    id: "forecast-horizon",
    categories: ["broken", "how_to", "pricing_technical"],
    areas: ["forecast", "dashboard"],
    keywords: ["horizon", "beyond", "longer"],
    strong: ["horizon"],
    phrases: ["six months", "6 months", "12 months", "next year", "more months", "further ahead", "how far"],
    answer:
      "The forecast always shows six months, and you can't change that. Money due later isn't charted, but the note under the panel says how much falls beyond six months.",
  },
  // lib/forecast/model.ts expectedPaymentDate
  {
    id: "forecast-wrong-month",
    categories: ["broken", "how_to"],
    areas: ["forecast", "dashboard"],
    keywords: [],
    phrases: ["wrong month", "different month", "month after", "later month"],
    answer:
      "A project lands in the month of its deadline plus payment terms. With the 30-day default, work due in March shows up in April. To move it, change the Payment terms on the project with Edit on its row, or your default in Settings.",
  },
  // lib/forecast/model.ts expectedNet; lib/projects.ts deriveMetrics
  {
    id: "forecast-amount",
    categories: ["broken", "how_to"],
    areas: ["forecast", "dashboard"],
    keywords: ["amount", "match", "differ"],
    phrases: ["forecast amount", "doesn t match", "don t match", "different from", "lower than my project", "include taxes", "includes taxes", "include iva", "after tax", "subtract", "subtracts"],
    answer:
      "The forecast shows what should reach you. For a persona moral client that's after withholding, and for everyone else it's the project's value. It also counts every unpaid project, so it won't match Unpaid Invoices, which only counts work that's been invoiced.",
  },

  // ── Brief extraction (Core) ───────────────────────────────────────────────
  // app/core/page.tsx; components/core/CoreWorkbench.tsx
  {
    id: "brief-how",
    categories: ["how_to", "pricing_technical"],
    areas: ["brief", "other"],
    keywords: ["core", "extract", "brief", "briefs", "workbench"],
    phrases: ["use core", "how does core", "brief extraction", "extract core", "how do i extract", "paste a brief", "what is a brief", "what do i paste", "what to paste"],
    answer:
      "Go to Core, paste a client email, message or call notes, and choose Extract core. You get the project, client, rate, hours, deadline and status. Choose Create project to check it and add it to your dashboard, Save to database to keep the extraction, or Re-run to try again; use example fills in a sample brief.",
    links: [{ label: "Core", href: "/core" }],
  },
  // app/api/core/save inserts into core_outputs only; lib/core/saved.ts limit 8
  {
    id: "brief-saved-where",
    categories: ["broken", "how_to"],
    areas: ["brief", "dashboard", "projects"],
    keywords: ["saved", "database", "extraction"],
    phrases: ["save to database", "saved the brief", "saved brief", "saved output", "saved outputs", "in my projects", "does saving", "add it to my", "turn it into a project", "into a project", "create a project from", "become a project"],
    answer:
      "Save to database keeps the extraction under Saved outputs on Core and Recent extractions on the dashboard, showing the latest 8. It doesn't create a project, so its money isn't counted yet. To track it, choose Create project on the result or on a saved row, check the form and choose Add project.",
  },
  // lib/core/schema.ts — rate and hours only; lib/core/to-project.ts opens the form on fixed fee without a rate
  {
    id: "brief-value",
    categories: ["broken", "how_to"],
    areas: ["brief"],
    keywords: ["fixed", "fee", "flat", "value", "computed", "dollars", "currency"],
    strong: ["computed"],
    phrases: ["needs rate and hours", "computed value", "fixed fee", "fixed price", "flat fee", "in dollars"],
    answer:
      "Extraction reads an hourly rate and hours and multiplies them. It doesn't read a fixed fee, so that case says \"needs rate and hours\". Choose Create project and enter the total as a fixed fee in the form. Amounts show in your account's currency and are never converted.",
  },
  // app/api/core/extract MAX_BRIEF_LENGTH 8000, rateLimit 15/min; CoreWorkbench error copy
  {
    id: "brief-limits",
    categories: ["broken", "how_to"],
    areas: ["brief"],
    keywords: ["characters", "long", "limit"],
    phrases: ["too long", "brief exceeds", "character limit", "too many requests", "could not reach the extraction", "extraction failed"],
    answer:
      "A brief can be up to 8,000 characters, and you can extract about 15 times a minute. For a long email thread, paste only the part with the details. If it says Too many requests, wait a minute; if it can't reach the extraction service, check your connection and try again.",
  },
  // lib/core/extract.ts sends the brief to Anthropic; app/api/core/save stores raw_input
  {
    id: "brief-privacy",
    categories: "any",
    areas: ["brief", "account", "other"],
    keywords: ["anthropic", "claude", "sent"],
    strong: ["anthropic"],
    phrases: ["ai model", "sent to", "is my brief", "who sees", "my client s email"],
    answer:
      "When the AI model is on, the text you paste is sent to Anthropic's Claude to be read. FreeFlow only keeps it if you choose Save to database, and then the brief and its fields are stored on your account, where other users can't see them. Avoid pasting passwords or bank details.",
  },
  // lib/core/heuristic.ts — English month names and hour/rate words
  {
    id: "brief-language",
    categories: ["broken", "how_to"],
    areas: ["brief"],
    keywords: ["spanish", "espanol", "language", "idioma"],
    strong: ["spanish", "espanol", "language", "idioma"],
    phrases: ["in spanish", "en espanol"],
    answer:
      "You can paste a brief in Spanish, but pattern matching only looks for English words like hours and rate and English month names. Spanish works best when the badge on the result says Claude, the AI model.",
  },
  // SavedOutputs, SavedResearch, SavedScenarios, marketing saved band: no delete controls; limits 8, 12, 10, 12
  {
    id: "saved-items-delete",
    categories: "any",
    areas: "any",
    keywords: ["unsave", "delete", "remove"],
    phrases: ["delete a saved", "remove a saved", "delete saved", "remove saved", "delete a scenario", "delete a record", "delete an extraction", "remove an extraction", "delete my saved", "clear saved"],
    answer:
      "Saved items can't be edited or deleted in the app. The lists show the latest ones: 8 in Core, 12 in Research, 10 in Pricing and 12 in Marketing. To remove something, submit a ticket saying which one.",
    offerTicket: true,
  },

  // ── Research ──────────────────────────────────────────────────────────────
  // types/research.ts CONFIDENCE_MEANING; components/research/SourceBadge.tsx
  {
    id: "research-badges",
    categories: ["broken", "how_to", "pricing_technical"],
    areas: ["research", "other"],
    keywords: ["verified", "reported", "estimated", "unsourced", "badge", "badges", "confidence"],
    strong: ["verified", "reported", "estimated", "unsourced", "confidence"],
    phrases: ["what does verified", "what does reported", "what does estimated", "verified mean", "estimated mean", "reported mean"],
    answer:
      "Verified means checked against the primary source on the date shown. Reported means it comes from a secondary source. Estimated means informed judgment rather than a sourced fact. Unsourced means no link backs the claim.",
  },
  // components/research/ResearchIntake.tsx; app/api/research/extract 8/min; lib/research/saved.ts limit 12
  {
    id: "research-intake",
    categories: ["broken", "how_to"],
    areas: ["research"],
    keywords: ["intake", "note", "notes", "structure", "record", "records"],
    strong: ["intake"],
    phrases: ["structure note", "save record", "research note", "research intake", "saved records", "add my own", "my own competitors", "add a competitor"],
    answer:
      "In the Research page's Intake section (Intake & saved on a phone), paste a note about a competitor, price or regulation and choose Structure note. Check the result, then choose Save record while signed in. It appears under Saved records, which shows the latest 12. You can structure about 8 notes a minute.",
    links: [{ label: "Research", href: "/research" }],
  },
  // components/research/CompetitorTable.tsx
  {
    id: "research-filter",
    categories: ["broken", "how_to"],
    areas: ["research"],
    keywords: ["search", "filter", "filters", "region", "category"],
    strong: ["region"],
    phrases: ["search competitors", "filter competitors", "no results", "find a competitor"],
    answer:
      "On the Competitors tab you can search by name, pricing or finding, and filter by category and region. Filters combine, so choosing several narrows the list further. If nothing shows, clear them.",
  },
  // components/research/RiskMap.tsx
  {
    id: "research-risk",
    categories: ["how_to", "pricing_technical"],
    areas: ["research"],
    keywords: ["likelihood", "impact", "severity", "risk", "risks", "map"],
    strong: ["likelihood", "severity", "risk", "risks"],
    phrases: ["risk map", "read the risk"],
    answer:
      "The Risk map places each risk by how likely it is and how much damage it would do, so the highest combination matters most. It includes risks to FreeFlow's own idea as well as outside threats. There's nothing for you to set up.",
  },
  // app/research/page.tsx "Benchmarks & Mexico"; components/research/MexicoPanel.tsx
  {
    id: "research-mexico",
    categories: ["how_to", "pricing_technical"],
    areas: ["research"],
    keywords: ["benchmarks", "benchmark", "mexico"],
    strong: ["benchmarks", "benchmark"],
    phrases: ["benchmarks and mexico", "mexico tab", "mexico panel"],
    answer:
      "The Benchmarks section (Benchmarks & Mexico on a phone) sets out market benchmarks and Mexico's CFDI invoicing rules. Its Mexico section is marked Verified after being checked against SAT documentation on 2026-09-01, except the 2026 materialidad reform, which still rests on secondary reporting, so confirm that one directly. FreeFlow's own CFDI issuance is not built yet.",
  },
  // lib/research/data.ts dated verification; nothing refreshes it
  {
    id: "research-outdated",
    categories: ["broken", "how_to", "pricing_technical"],
    areas: ["research"],
    keywords: ["outdated", "stale", "incorrect"],
    strong: ["outdated"],
    phrases: ["up to date", "out of date", "price is wrong", "prices are wrong", "wrong price", "research is wrong"],
    answer:
      "Research figures were checked on the date beside each source, and they don't update by themselves. If one is out of date, submit a ticket with the correct figure and a link to where it comes from.",
    offerTicket: true,
  },

  // ── Pricing and support ───────────────────────────────────────────────────
  // app/support/page.tsx "Will this always be free?"
  {
    id: "pricing-future",
    categories: "any",
    areas: "any",
    keywords: ["forever", "eventually"],
    phrases: ["always be free", "stay free", "free forever", "free period", "start charging", "going to charge", "charge later", "will you charge", "pay later", "this free forever", "it free forever", "freeflow free forever", "going to get charged", "will i get charged", "charged later", "charge me later", "will i be charged", "charged in the future"],
    answer:
      "Honestly, probably not forever. The intention is to charge eventually, and the whole model is public on the Pricing page, but nothing is charged today and no date is set. The Support page says there's no plan to put today's features behind a price.",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Support FreeFlow", href: "/support" },
    ],
  },
  // app/pricing/page.tsx "every feature, for everyone"; no billing code
  {
    id: "pricing-upgrade",
    categories: "any",
    areas: "any",
    keywords: ["upgrade", "upgrading", "downgrade", "premium", "purchase", "checkout"],
    strong: ["upgrade", "downgrade", "premium", "checkout", "purchase"],
    phrases: ["upgrade to", "buy pro", "buy a plan", "paid plan", "my plan", "which plan", "mi plan"],
    answer:
      "There's nothing to buy or upgrade yet. Every account has every feature that's built, and FreeFlow has no card on file for you.",
  },
  // components/pricing/PricingCalculator.tsx; lib/pricing/scenarios.ts
  {
    id: "pricing-simulator",
    categories: "any",
    areas: ["pricing", "other"],
    keywords: ["simulator", "scenario", "scenarios", "mrr", "arr", "arpu", "churn", "conservative", "optimistic", "revenue"],
    strong: ["simulator", "scenario", "mrr", "arr", "arpu", "churn"],
    phrases: ["revenue simulator", "the simulator", "what is mrr", "what is arr", "what is churn", "what is arpu"],
    answer:
      "The simulator projects FreeFlow's own revenue under its future pricing, so it isn't your income or a bill. Pick Conservative, Base or Optimistic and move the inputs. MRR is monthly recurring revenue, ARR is the yearly figure, ARPU is average revenue per paying freelancer or studio member, and churn is the share of accounts leaving each month.",
    links: [{ label: "Pricing", href: "/pricing" }],
  },
  // components/pricing/SavedScenarios.tsx
  {
    id: "pricing-saved-scenario",
    categories: ["broken", "how_to"],
    areas: ["pricing"],
    keywords: ["recomputes", "recompute"],
    strong: ["recomputes"],
    phrases: ["model changed", "recomputes identically", "save a scenario", "save this scenario", "saved scenario"],
    answer:
      "Save this scenario, while signed in, stores your inputs and the result, and the Saved tab recalculates each one when it loads. \"recomputes identically\" means the numbers still match. \"model changed\" means the formula has changed since you saved it, so the stored figure differs from today's.",
  },
  // components/pricing/AssumptionsTable.tsx; TierCards "Why this price"; ProjectSegmentPanel
  {
    id: "pricing-assumptions",
    categories: ["how_to", "pricing_technical"],
    areas: ["pricing"],
    keywords: ["assumption", "assumptions", "anchor", "anchored"],
    strong: ["assumption", "assumptions"],
    phrases: ["why this price", "assumptions table", "how were the prices", "where do the prices"],
    answer:
      "The Assumptions tab lists each input in the revenue model and what breaks if it's wrong, and most are estimates. Each tier's \"Why this price\" note names the competitor price it was set against, with a source link.",
    links: [{ label: "Pricing", href: "/pricing" }],
  },
  // lib/pricing/tiers.ts USD_TO_MXN 17.21, FX_DATE 2026-09-19
  {
    id: "pricing-mxn",
    categories: ["how_to", "pricing_technical"],
    areas: ["pricing"],
    keywords: ["mxn", "pesos", "exchange"],
    phrases: ["exchange rate", "prices in pesos", "price in pesos"],
    answer:
      "Peso prices on the Pricing page use a fixed rate of 17.21 MXN per US dollar, dated 2026-09-19. It's deliberately not a live rate, and it doesn't affect your own project amounts, which are never converted.",
  },
  // Nothing is charged; lib/pricing annual discount is a model input
  {
    id: "discounts",
    categories: "any",
    areas: ["pricing", "other"],
    keywords: ["discount", "discounts", "coupon", "promo", "student"],
    strong: ["discount", "coupon", "promo"],
    phrases: ["student discount", "promo code", "discount code", "annual plan"],
    answer:
      "There are no discounts or codes, because nothing is charged today. The annual discount in the simulator is an assumption in the future pricing model, not an offer.",
  },
  // lib/support.ts "the app never learns who donated"; app/support "Handled by Stripe"
  {
    id: "donation-issues",
    categories: "any",
    areas: "any",
    keywords: ["donated", "stripe"],
    phrases: ["my donation", "donation receipt", "charged twice", "donation failed", "refund of my donation", "my card", "card details"],
    answer:
      "Donations are handled by Stripe. FreeFlow never sees your card, and the app doesn't record who donated. For a problem or a refund, submit a ticket with the date and amount.",
    offerTicket: true,
  },

  // ── Marketing ─────────────────────────────────────────────────────────────
  // app/api/marketing/generate takes no input; lib/marketing/generate.ts is about FreeFlow
  {
    id: "marketing-own-business",
    categories: "any",
    areas: ["marketing"],
    keywords: ["customize", "customise"],
    phrases: ["my business", "my own business", "my company", "my brand", "my own posts", "change the persona", "edit the posts", "edit a post", "for my clients"],
    answer:
      "The Marketing page is FreeFlow's own campaign and only writes about FreeFlow. It can't write posts for your business, and the persona and topics can't be edited. You can copy any text and adapt it somewhere else.",
  },
  // components/marketing/MarketingWorkbench.tsx; ProvenanceBadge "AI-generated" / "seed copy"
  {
    id: "marketing-generate",
    categories: "any",
    areas: ["marketing"],
    keywords: ["generate", "generating", "generated", "seed", "greyed", "disabled", "provenance"],
    strong: ["generate", "seed", "provenance"],
    phrases: ["generate live", "seed copy", "ai generated", "generation failed"],
    answer:
      "Generate live writes a fresh campaign with AI, which can take a while. If the button is greyed out, no AI key is set up and you'll see the built-in seed copy. If generation fails, the cards usually switch back to seed copy without an error, replacing what was on screen, so check the badge on each card and save anything first. You only see a failure message if the request itself fails. Reloading also returns to seed copy.",
  },
  // MarketingWorkbench SaveButton; app/marketing/page.tsx "Saved to your account"
  {
    id: "marketing-save",
    categories: ["broken", "how_to"],
    areas: ["marketing"],
    keywords: ["save", "saved", "saving", "retry", "post", "posts", "script"],
    strong: ["retry"],
    phrases: ["save a post", "save button", "saved to your account", "save a script"],
    answer:
      "Save on a post or script stores it on your account, and the button only appears while you're signed in. Saved items appear under Saved to your account when you reload. If the button says Retry, the save failed, so try again.",
  },
  // MarketingWorkbench A/B band; lib/marketing/ab-store.ts localStorage
  {
    id: "marketing-ab",
    categories: ["broken", "how_to"],
    areas: ["marketing"],
    keywords: ["ab", "headline", "headlines", "winner", "variant"],
    strong: ["headline", "winner"],
    phrases: ["a b test", "ab test", "save winner", "headline test", "pick a winner"],
    answer:
      "The A/B headline test lets you choose the better headline in each pair. Your pick is saved in this browser, and Save winner records it on your account. It doesn't measure real clicks, so the winner is your judgment.",
  },
  // Owner's Week 4 decision: no direct publishing
  {
    id: "marketing-publish",
    categories: "any",
    areas: "any",
    keywords: ["publish", "instagram", "facebook", "linkedin", "tiktok", "twitter"],
    strong: ["publish", "instagram", "facebook", "linkedin", "tiktok", "twitter"],
    phrases: ["post to", "post directly", "publish to", "schedule posts", "social media", "auto post"],
    answer:
      "FreeFlow doesn't publish or schedule posts on social networks. Use Copy on a card or Export CSV, then post it yourself.",
  },
  // lib/marketing/content.ts buildCalendar
  {
    id: "marketing-calendar",
    categories: ["broken", "how_to"],
    areas: ["marketing"],
    keywords: ["calendar"],
    strong: ["calendar"],
    phrases: ["14 day", "content calendar"],
    answer:
      "The calendar lays out 14 days using the page's own posts and scripts, so every slot points to something real. It's a plan to follow: it doesn't publish anything or send reminders.",
  },

  // ── Tax ───────────────────────────────────────────────────────────────────
  // ProjectForm "Client is a…"; lib/projects/schema.ts "Empty means not recorded"
  {
    id: "tax-client-type",
    categories: "any",
    areas: "any",
    keywords: ["fisica", "moral"],
    strong: ["fisica", "moral"],
    phrases: ["client type", "client is a", "persona fisica", "persona moral", "not recorded", "es una empresa", "es empresa"],
    answer:
      "Each project has a \"Client is a…\" field: Persona física, Persona moral (company) or Not recorded. Only a persona moral withholds tax, and Not recorded counts as no withholding. Set it with Edit on the project's row. Ask an accountant if you're unsure which a client is.",
  },
  // LayoutDrawer "Mexican tax regime"; lib/tax/withholding.ts ISR_RETENIDO_RATES, DEFAULT_TAX_REGIME
  {
    id: "tax-regime",
    categories: "any",
    areas: "any",
    keywords: ["regime", "regimen", "resico"],
    strong: ["regime", "regimen", "resico"],
    phrases: ["tax regime", "regimen general", "resico"],
    answer:
      "Set it in Settings under Mexican tax regime. Régimen general has 10% ISR withheld and RESICO 1.25%, and régimen general is the default. It only affects invoices to Mexican companies, so ignore it if you don't invoice in Mexico. An accountant can tell you which one applies to you.",
  },
  // lib/tax/withholding.ts computeWithholding: 10,000 → 11,600 → 9,533.33; RESICO 10,408.33
  {
    id: "tax-worked-example",
    categories: "any",
    areas: "any",
    keywords: ["subtotal", "calculation", "formula", "example"],
    phrases: ["before iva", "with iva", "include iva", "includes iva", "iva on top", "how is it calculated", "withholding calculation", "how is withholding"],
    answer:
      "Type project amounts before IVA. For 10,000 billed to a persona moral, IVA of 1,600 makes the invoice 11,600. Under régimen general, 1,066.67 of IVA and 1,000 of ISR are withheld, so 9,533.33 reaches you. Under RESICO the ISR is 125, so 10,408.33 reaches you. This isn't tax advice.",
  },
  // lib/forecast/model.ts expectedNet "a freelancer in the United States charging 1,000 receives 1,000"
  {
    id: "tax-outside-mexico",
    categories: "any",
    areas: "any",
    keywords: [],
    phrases: ["outside mexico", "not in mexico", "live in mexico", "in the us", "another country", "other country", "other countries"],
    answer:
      "Outside Mexico you can ignore the tax settings. Leave \"Client is a…\" as Not recorded and no withholding is applied. FreeFlow doesn't calculate tax for other countries.",
  },
  // components/dashboard/WithholdingPanel.tsx; lib/tax/withholding.ts "Still not modelled"
  {
    id: "tax-not-modelled",
    categories: "any",
    areas: "any",
    keywords: ["exempt", "frontera"],
    strong: ["exempt", "frontera"],
    phrases: ["border zone", "zona fronteriza", "zero rated", "tasa cero"],
    answer:
      "FreeFlow only covers the general case for professional services. Border-zone IVA and exempt or zero-rated activities aren't modelled, so its figures may not fit you. An accountant can give you the right numbers.",
  },
  // No SAT connection in lib or app
  {
    id: "tax-sat",
    categories: "any",
    areas: "any",
    keywords: ["sat"],
    strong: ["sat"],
    phrases: ["the sat", "sat portal", "to sat", "my taxes", "do my taxes", "replace my accountant", "replace an accountant", "replace my", "mis impuestos"],
    answer:
      "FreeFlow doesn't connect to the SAT, so it doesn't file or report anything for you. It only estimates what will reach your bank. Export CSV gives your accountant the figures.",
  },

  // ── Currency and export ───────────────────────────────────────────────────
  // ProjectForm amount labels use prefs.currency; amounts stored unconverted
  {
    id: "currency-usd-label",
    categories: ["broken", "how_to"],
    areas: "any",
    keywords: ["label", "labels"],
    phrases: ["says usd", "say usd", "form says", "shows usd", "says dollars", "showing dollars", "still dollars"],
    answer:
      "The project form's amount labels show your account's currency, chosen in Settings (top right). If it isn't the one you use, change it there. FreeFlow never converts anything, so type amounts in that currency and they appear as you entered them.",
  },
  // lib/currency.ts "ONE CURRENCY PER ACCOUNT, NOT PER PROJECT"
  {
    id: "currency-multiple",
    categories: "any",
    areas: "any",
    keywords: [],
    phrases: ["two currencies", "multiple currencies", "different currencies", "mixed currencies", "more than one currency", "currency per project", "per project currency", "bill one client in", "bill some clients in", "clients in dollars", "clients in pesos"],
    answer:
      "Each account has one currency, because adding up mixed currencies would produce a meaningless total. The workaround is to convert those amounts yourself into your account's currency, and note the original in the project's name.",
  },
  // lib/export/csv.ts is the only project export
  {
    id: "export-pdf",
    categories: "any",
    areas: "any",
    keywords: ["pdf", "print", "printing", "report", "reports"],
    strong: ["pdf", "print"],
    phrases: ["pdf report", "export a pdf", "export pdf", "print my"],
    answer:
      "Export is CSV only, with no PDF or printed report. Use Export CSV, open the file in Excel or Google Sheets, and print or save it as a PDF from there.",
  },
  // lib/export/csv.ts headers; "The point of this file is the contador"
  {
    id: "export-contents",
    categories: "any",
    areas: "any",
    keywords: ["columns", "contador", "accountant"],
    strong: ["contador", "accountant", "columns"],
    phrases: ["in the csv", "csv columns", "my accountant", "mi contador"],
    answer:
      "The CSV has one row per project, including client, status, deadline, paid date, billing and amount, with money columns naming your currency. If any project has a client type recorded, it also shows tax type, regime, IVA and calculated invoiced, withheld and net figures, worked out for every such row, paid or not. A Not recorded row just shows the amount you entered, with no tax added. It opens with accents intact.",
  },

  // ── Account ───────────────────────────────────────────────────────────────
  // No updateUser({ email }) anywhere; only the reset form changes credentials
  {
    id: "email-change",
    categories: "any",
    areas: ["account", "other"],
    keywords: ["email"],
    phrases: ["change my email", "change email", "update my email", "new email", "wrong email", "different email"],
    answer:
      "You can't change your email yourself yet. Submit a ticket with your old and new addresses, and the owner can help.",
    offerTicket: true,
  },
  // Projects belong to user_id; no transfer route
  {
    id: "account-merge",
    categories: "any",
    areas: ["account", "other"],
    keywords: ["merge"],
    strong: ["merge"],
    phrases: ["two accounts", "second account", "merge accounts", "wrong account", "move my projects", "transfer my projects"],
    answer:
      "Accounts can't be merged, and projects can't be moved between them in the app. First check which email you're signed in with. If you need them combined, submit a ticket with both addresses.",
    offerTicket: true,
  },
  // components/auth/AuthForm.tsx signInWithPassword only
  {
    id: "auth-options",
    categories: "any",
    areas: "any",
    keywords: ["apple", "sso", "2fa", "mfa", "authenticator"],
    strong: ["sso", "2fa", "mfa", "authenticator"],
    phrases: ["sign in with", "log in with", "login with", "with google", "two factor", "two step", "magic link", "single sign on"],
    answer:
      "Sign-in is by email and password only. There's no Google or other social sign-in, and no two-factor authentication yet.",
  },
  // AuthForm minLength 6; ResetPasswordForm "The two passwords do not match."
  {
    id: "password-rules",
    categories: "any",
    areas: "any",
    keywords: ["length", "characters"],
    phrases: ["passwords do not match", "at least 6", "password requirements", "password too short", "password need", "password needs", "password have to"],
    answer:
      "A password needs at least 6 characters. When you reset it, type the same new password in both boxes, or it will say the two passwords do not match.",
  },
  // ResetPasswordForm "This link has expired"; VerifyEmailPanel "Resend the link"; app/auth/confirm
  {
    id: "email-link-expired",
    categories: "any",
    areas: "any",
    keywords: ["expired"],
    strong: ["expired"],
    phrases: ["link expired", "link has expired", "link is expired", "expired link", "already used", "link not working", "link takes me", "takes me to the login"],
    answer:
      "Email links work once and don't last long. If one lands you on the sign-in page, try signing in; you may already be confirmed. Otherwise ask for a new one. For a reset link, sign out and use Forgot your password? on the sign-in page. For a confirmation link, use Resend the link on the confirm-your-email page. Then open the newest email.",
  },
  // app/api/auth/resend "rate-limited"; VerifyEmailPanel "Too many emails"
  {
    id: "email-delay",
    categories: "any",
    areas: "any",
    keywords: [],
    phrases: ["too many emails", "no email", "email never arrived", "email not arriving", "didn t get the email", "not getting emails", "no llega", "no me llega"],
    answer:
      "Account emails usually arrive within a minute, and often land in spam, so check there first. Sending is limited, so if it says you've hit a rate limit or to wait some seconds, wait and try again.",
  },
  // No profile fields: the account is an email and a password
  {
    id: "profile-settings",
    categories: "any",
    areas: ["account", "other"],
    keywords: ["profile", "avatar", "username", "logo", "photo", "picture"],
    strong: ["profile", "avatar", "username", "logo"],
    phrases: ["change my name", "my profile", "account page", "my username", "business name", "company name", "my logo"],
    answer:
      "There's no profile: your account is just an email and a password, so you can't add a name, photo or logo. FreeFlow doesn't produce client documents, so nothing would show them.",
  },
  // app/api/export/projects covers projects only
  {
    id: "account-data-download",
    categories: "any",
    areas: "any",
    keywords: [],
    phrases: ["download all my data", "download my data", "export my data", "get my data", "all my data", "copy of my data", "leave freeflow"],
    answer:
      "Export CSV under the projects table downloads all your projects. For anything else, like saved items or help conversations, submit a ticket and say what you need.",
    offerTicket: true,
  },

  // ── Second pass: gaps found with questions held out from the first ─────────
  // ProjectsTable empty state "No projects yet"; per-account data
  {
    id: "dashboard-empty",
    categories: ["broken", "how_to"],
    areas: ["dashboard", "projects", "other"],
    keywords: ["dashboard", "empty"],
    phrases: ["dashboard is empty", "dashboard empty", "no projects yet", "nothing on my dashboard", "new account"],
    answer:
      "A new account starts empty. The New project form is already open under No projects yet: fill it in and choose Add project, and the cards and forecast fill in from there. If you've added projects before, check you're signed in with the same email, because projects belong to one account.",
  },
  // ProjectForm has no notes field or uploads; only two link fields
  {
    id: "notes-attachments",
    categories: ["broken", "how_to", "pricing_technical"],
    areas: ["projects", "dashboard", "other"],
    keywords: ["notes", "note", "attach", "attachment", "attachments", "file", "files", "upload", "comment", "comments"],
    strong: ["notes", "attach", "attachment", "upload"],
    phrases: ["add notes", "add a note", "attach a file", "upload a file"],
    answer:
      "Projects have no notes or file uploads. Each one can hold a contract link and a Stripe invoice or payment link, so keep the document somewhere like Google Drive and paste its link there. Links must start with http:// or https://.",
  },
  // lib/projects/schema.ts deadline required; app/page.tsx hasOverdue; lib/forecast/model.ts
  {
    id: "deadline-explained",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard", "forecast"],
    keywords: ["deadlines"],
    phrases: ["deadline passes", "deadline passed", "deadline used", "no deadline", "with no deadline", "without a deadline", "what is the deadline"],
    answer:
      "Every project needs a deadline, so use your best estimate if there's no real one. Once it passes, an unpaid project joins the Overdue alert, though its status doesn't change by itself. The forecast also expects the money on the deadline plus payment terms.",
  },
  // app/page.tsx — only the current month's earnings; lib/export/csv.ts "Paid on"
  {
    id: "earnings-history",
    categories: "any",
    areas: "any",
    keywords: ["history"],
    strong: ["history"],
    phrases: ["last month", "last year", "previous month", "past months", "how much i made", "how much did i", "earnings history", "income history"],
    answer:
      "The dashboard only shows this month's earnings, with no history view. Use Export CSV: its Paid on column lets you add up any month or year in a spreadsheet.",
  },
  // FreeFlow records money; it never holds or moves any
  {
    id: "money-handling",
    categories: "any",
    areas: "any",
    keywords: [],
    phrases: ["where is my money", "my money", "get my money", "withdraw", "send me my", "payout", "transfer money"],
    answer:
      "FreeFlow doesn't hold or move money. It only records what you tell it, so payments go directly from your client to you, through whatever you normally use. If a client hasn't paid, the project stays unpaid here until you choose Mark paid.",
  },
  // Accounts are single-user: lib/product/features.ts seats planned; no share route
  {
    id: "share-access",
    categories: "any",
    areas: "any",
    keywords: ["share", "sharing"],
    strong: ["share"],
    phrases: ["share my", "share my dashboard", "share access", "give access", "view only", "read only", "my assistant", "assistant log", "my bookkeeper"],
    answer:
      "You can't share a view or give someone else access. Each account is for one person, and multiple seats are not built yet. To show someone your numbers, use Export CSV and send them the file.",
  },
  // lib/support.ts "There is no support queue"
  {
    id: "about-owner",
    categories: "any",
    areas: "any",
    keywords: ["founder", "creator", "developer", "company"],
    strong: ["founder", "creator"],
    phrases: ["who made", "who built", "who created", "who runs", "who owns", "who is the owner", "real company", "legit", "scam", "quien hizo"],
    answer:
      "FreeFlow is a small independent product run by its owner, who reads every ticket. There's no support team or queue behind it.",
  },
  // Web app: nothing browser-specific in app/ or components/
  {
    id: "browsers",
    categories: "any",
    areas: "any",
    keywords: ["browser", "browsers", "safari", "chrome", "firefox", "edge", "brave"],
    strong: ["browser", "browsers", "safari", "chrome", "firefox"],
    phrases: ["which browser", "what browser", "on safari", "on chrome", "on firefox"],
    answer:
      "FreeFlow is a web app, so it should run in any up-to-date browser on a phone or computer. If something looks wrong in one, try another, then submit a ticket naming the browser and the page.",
    offerTicket: true,
  },
  // lib/currency.ts eleven currencies; lib/tax/withholding.ts Mexico only
  {
    id: "countries",
    categories: "any",
    areas: "any",
    keywords: ["colombia", "argentina", "brazil", "brasil", "chile", "peru", "uruguay", "spain", "country", "countries", "mexico"],
    strong: ["colombia", "argentina", "brazil", "brasil", "chile", "peru", "uruguay", "spain", "country", "countries", "mexico"],
    phrases: ["do you support", "available in", "use it in", "work in my country"],
    answer:
      "You can use FreeFlow from anywhere, and it has eleven currencies: USD, MXN, COP, ARS, BRL, CLP, PEN, UYU, CAD, EUR and GBP. Its tax calculations are for Mexico only, so elsewhere leave them unset and no withholding is applied.",
  },

  // ProjectForm "Billing": Fixed fee first, Hourly; lib/format.ts projectValue
  {
    id: "billing-types",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard", "other"],
    keywords: ["billing", "hourly", "fixed", "fee"],
    strong: ["billing", "hourly"],
    phrases: ["fixed fee", "fixed fee mean", "hourly or fixed", "fixed or hourly", "hourly to fixed", "fixed to hourly"],
    answer:
      "Fixed fee means one total for the job, and it's what the form starts on. Hourly means hours times your rate. Choose under Billing when you add a project, or switch with Edit on its row. Enter the amount in your account's currency, before IVA if you invoice in Mexico.",
  },
  // No archive: lib/projects/filter.ts payment filter; StatusBadge "Paid"; ProjectForm delete
  {
    id: "project-archive",
    categories: ["broken", "how_to"],
    areas: ["projects", "dashboard", "other"],
    keywords: ["archive", "archived", "finished", "completed", "complete", "done"],
    strong: ["archive", "archived"],
    phrases: ["archive a project", "as finished", "as done", "as complete", "old projects", "finished projects", "completed projects"],
    answer:
      "There's no archive or Done status. When a project is finished, choose Mark paid once the money arrives, and it stays in the table as Paid. To hide paid work, change the dropdown that says Paid and unpaid, above the table, to Unpaid. Delete project removes one for good.",
  },
  // CoreWorkbench is a single textarea; no upload anywhere
  {
    id: "brief-formats",
    categories: ["broken", "how_to", "pricing_technical"],
    areas: ["brief"],
    keywords: ["pdf", "pdfs", "image", "images", "screenshot", "screenshots", "upload", "attachment", "file"],
    strong: ["pdf", "pdfs", "screenshot", "image", "images"],
    phrases: ["read pdfs", "read a pdf", "upload an email", "upload a file", "upload a pdf", "forward an email"],
    answer:
      "Core only reads text you paste, so it can't take a PDF, image or email file. Copy the words from the document and paste them into the box.",
  },
  // Supabase Auth holds credentials; AuthForm passes them straight to it
  {
    id: "password-safety",
    categories: "any",
    areas: ["account", "other"],
    keywords: [],
    phrases: ["password safe", "password stored", "passwords stored", "see my password", "know my password", "password encrypted", "my password encrypted"],
    answer:
      "Passwords are handled by Supabase's sign-in service, which stores them hashed rather than as readable text, so the owner can't read yours. Use one you don't use anywhere else, because two-factor authentication isn't available yet.",
  },
  // No backup or restore feature in app/; lib/export/csv.ts is the user's own copy
  {
    id: "backups",
    categories: "any",
    areas: "any",
    keywords: ["backup", "backups", "backed"],
    strong: ["backup", "backups", "backed"],
    phrases: ["backed up", "back up", "backup"],
    answer:
      "FreeFlow has no backup or restore feature of its own. To keep your own copy, use Export CSV under the projects table from time to time.",
  },
  // lib/core, lib/research and lib/marketing call Claude; lib/chat does not
  {
    id: "ai-use",
    categories: "any",
    areas: "any",
    keywords: ["chatgpt", "openai", "gpt"],
    strong: ["chatgpt", "openai"],
    phrases: ["use ai", "uses ai", "using ai", "which ai", "what ai", "use chatgpt", "artificial intelligence"],
    answer:
      "AI is used in three places when it's available: brief extraction on Core, note structuring on Research, and Generate live on Marketing. Each result says whether AI or a simpler fallback produced it. This help guide doesn't use AI: it answers from written rules.",
  },
  // No program exists in lib/support.ts or app/
  {
    id: "business-inquiries",
    categories: "any",
    areas: "any",
    keywords: [],
    phrases: ["affiliate", "referral", "refer a friend", "reseller", "partnership", "are you hiring", "investor", "investors"],
    answer:
      "There's no affiliate, referral or partner program. For a business inquiry, submit a ticket and the owner will reply by email.",
    offerTicket: true,
  },
  // FreeFlow records rates; it gives no pricing advice to freelancers
  {
    id: "rates-advice",
    categories: "any",
    areas: "any",
    keywords: ["rates"],
    strong: ["rates"],
    phrases: ["should i charge", "what to charge", "raise my prices", "calculate my rate"],
    answer:
      "I can't advise you on what to charge. FreeFlow records the rates and fees you set, and your exported CSV can show what past projects brought in. The Research page compares software prices, not freelance rates.",
  },
  // OverdueAlert; ProjectForm contract link ("the signed contract is what makes an escalation possible")
  {
    id: "client-nonpayment",
    categories: "any",
    areas: "any",
    keywords: ["chase", "collect"],
    strong: ["chase"],
    phrases: ["won t pay", "doesn t pay", "didn t pay", "not paying", "refuses to pay", "hasn t paid", "chase my client", "collect payment", "no me paga", "no me pagan"],
    answer:
      "FreeFlow can't contact or collect from a client, but it can help you keep track. Set the project's status to Overdue so it stays in the alert, and keep the signed contract's link on the project. For legal options, a lawyer or accountant is the right person to ask.",
  },

  // ForecastPanel has no export; lib/export/csv.ts covers projects
  {
    id: "forecast-export",
    categories: "any",
    areas: ["forecast"],
    keywords: ["export", "csv", "download", "excel"],
    phrases: ["export the forecast", "download the forecast", "forecast to excel"],
    answer:
      "The forecast itself can't be exported. Export CSV under the projects table gives you every project with its deadline and amounts, so you can rebuild it in a spreadsheet.",
  },
  // MarketingWorkbench exportCsv "freeflow-marketing.csv"
  {
    id: "marketing-export",
    categories: "any",
    areas: ["marketing"],
    keywords: ["export", "csv", "download", "excel"],
    phrases: ["export csv", "export the posts", "download the posts"],
    answer:
      "Export CSV on the Marketing page downloads freeflow-marketing.csv with the posts and scripts on screen, so check your browser's downloads. It only covers the campaign; your projects are exported from the dashboard. If nothing downloads, reload and try again, then submit a ticket.",
    offerTicket: true,
  },
  // TopBar shows user.email on large screens; no account lookup
  {
    id: "email-forgotten",
    categories: "any",
    areas: ["account", "other"],
    keywords: [],
    phrases: ["which email", "what email", "forgot my email", "forgot my login"],
    answer:
      "You're signed in if you can see this chat, and on a wide screen your email shows at the top right. Otherwise, search your inboxes for the FreeFlow confirmation email you got when you signed up.",
  },
  // Mail is auth-only: AuthForm, ForgotPasswordForm, app/api/auth/resend
  {
    id: "email-preferences",
    categories: "any",
    areas: "any",
    keywords: ["unsubscribe", "newsletter", "newsletters", "spam"],
    strong: ["unsubscribe", "newsletter"],
    phrases: ["stop getting emails", "stop emails", "marketing emails", "stop sending"],
    answer:
      "FreeFlow only sends account emails you ask for, like confirming your address or resetting your password. The one exception is the launch list: if you joined it on the demo page, you get one email when the lifetime version launches, and nothing else. To be removed, email braydenemeryc@gmail.com; every launch email also has a remove-me link.",
  },

  // proxy.ts PRIVATE_PREFIXES; app/page.tsx landing page; app/chat/page.tsx
  {
    id: "account-required",
    categories: "any",
    areas: "any",
    keywords: ["signup"],
    phrases: ["without an account", "need an account", "without signing up", "without signing in"],
    answer:
      "Your projects on the dashboard, Paste a brief and this guide need an account, which is free. Demo, Docs, the dashboard's public numbers tab, Research, Pricing, Product, Marketing and Support can be read without one, though saving anything on them needs you to sign in.",
  },
  // Public repository on GitHub
  {
    id: "open-source",
    categories: "any",
    areas: "any",
    keywords: ["github", "repository", "repo"],
    strong: ["github", "repository", "repo"],
    phrases: ["open source", "source code"],
    answer:
      "FreeFlow's code is publicly visible on GitHub, under BraydenEC/FreeFlow. To report a problem, a ticket here is the quickest way to reach the owner.",
  },

  // ── Area overviews: last resort for a vague question, before giving up ──────
  {
    id: "overview-dashboard",
    categories: "any",
    areas: ["dashboard"],
    generic: true,
    keywords: ["dashboard", "projects", "wrong", "confused", "confusing", "explain", "show", "see"],
    phrases: ["this page", "what is this", "how does this work", "why is this", "do i need to", "show me"],
    answer:
      "The dashboard is where your projects and money live: cards for unpaid invoices, this month's earnings and active projects, the projects table, expected income and any overdue alert. Tell me which part you mean and I can go further, or submit a ticket.",
    offerTicket: true,
  },
  {
    id: "overview-forecast",
    categories: "any",
    areas: ["forecast"],
    generic: true,
    keywords: ["forecast", "wrong", "low", "high", "update", "updating", "confused", "confusing", "explain"],
    phrases: ["this page", "what is this", "how does this work", "why is this", "do i need to"],
    answer:
      "The forecast comes from your unpaid projects: each one lands in the month of its deadline plus payment terms. If it looks wrong, check those on each project with Edit on its row, and your default in Settings. Marked-paid projects are left out. If it still looks off, submit a ticket with an example.",
    offerTicket: true,
  },
  {
    id: "overview-projects",
    categories: "any",
    areas: ["projects"],
    generic: true,
    keywords: ["project", "projects", "wrong", "confused", "confuse", "confusing", "explain"],
    phrases: ["this page", "what is this", "how does this work", "why is this", "do i need to"],
    answer:
      "Projects live in the table on the dashboard. Add one with + New project, change it with Edit on its row, keep its status up to date, and choose Mark paid when the money arrives. Tell me which part you mean and I can go further, or submit a ticket.",
    offerTicket: true,
  },
  {
    id: "overview-brief",
    categories: "any",
    areas: ["brief"],
    generic: true,
    keywords: ["brief", "core", "extraction", "wrong", "confused", "confusing", "explain"],
    phrases: ["this page", "what is this", "how does this work", "why is this", "do i need to"],
    answer:
      "Core reads a pasted client message and pulls out the project, client, rate, hours, deadline and status. Create project turns the result into a project on your dashboard, and Save to database only keeps the extraction. Tell me which part you mean and I can go further, or submit a ticket.",
    links: [{ label: "Core", href: "/core" }],
    offerTicket: true,
  },
  {
    id: "overview-research",
    categories: "any",
    areas: ["research"],
    generic: true,
    keywords: ["research", "wrong", "confused", "confusing", "explain"],
    phrases: ["this page", "what is this", "how does this work", "why is this", "do i need to"],
    answer:
      "Research is the market evidence behind FreeFlow: competitors, benchmarks and Mexico's rules, a risk map, and a place to save your own notes. You don't need it to use the app. Tell me which part you mean and I can go further, or submit a ticket.",
    links: [{ label: "Research", href: "/research" }],
    offerTicket: true,
  },
  {
    id: "overview-pricing",
    categories: "any",
    areas: ["pricing"],
    generic: true,
    keywords: ["pricing", "plan", "plans", "wrong", "confused", "confusing", "explain"],
    phrases: ["this page", "what is this", "how does this work", "why is this", "do i need to"],
    answer:
      "FreeFlow is free today. The Pricing page shows the model it intends to move to: the tiers, a revenue simulator and the assumptions behind them. None of it is charged. Tell me which part you mean and I can go further, or submit a ticket.",
    links: [{ label: "Pricing", href: "/pricing" }],
    offerTicket: true,
  },
  {
    id: "overview-marketing",
    categories: "any",
    areas: ["marketing"],
    generic: true,
    keywords: ["marketing", "wrong", "confused", "confusing", "explain"],
    phrases: ["this page", "what is this", "how does this work", "why is this", "do i need to"],
    answer:
      "Marketing is FreeFlow's own campaign: a persona, posts, video scripts, a 14-day calendar and an A/B headline test. You don't need it to use the app. Tell me which part you mean and I can go further, or submit a ticket.",
    links: [{ label: "Marketing", href: "/marketing" }],
    offerTicket: true,
  },
  {
    id: "overview-account",
    categories: "any",
    areas: ["account"],
    generic: true,
    keywords: ["account", "settings", "wrong", "work", "confused", "confusing", "explain"],
    phrases: ["this page", "what is this", "how does this work", "why is this", "do i need to"],
    answer:
      "Your account is an email and a password. Your projects and settings belong to it, and Settings at the top right holds your currency, payment terms, tax regime and layout. Tell me which part you mean and I can go further, or submit a ticket.",
    offerTicket: true,
  },
];
