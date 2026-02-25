import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "ReachOut <noreply@reachout.apachetastudio.org>";
const MIKEE_EMAIL = process.env.MIKEE_EMAIL ?? "mikee@apachetastudio.org";

// In local dev, leave RESEND_API_KEY unset or as the placeholder.
// Emails will be logged to the console instead of sent.
const isDev = !process.env.RESEND_API_KEY ||
  process.env.RESEND_API_KEY === "re_your_api_key";

const resend = isDev ? null : new Resend(process.env.RESEND_API_KEY);

async function send(payload: {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}): Promise<{ error: null | Error }> {
  if (isDev || !resend) {
    console.log("\n📧 [email — dev mode, not sent]");
    console.log(`  To:      ${payload.to}`);
    console.log(`  Subject: ${payload.subject}`);
    console.log(`  Body:\n${payload.text.split("\n").map(l => `    ${l}`).join("\n")}\n`);
    return { error: null };
  }
  return resend.emails.send(payload);
}

export async function sendSubmissionEmail({
  destinationEmail,
  senderName,
  senderEmail,
  message,
  formTitle,
  username,
}: {
  destinationEmail: string;
  senderName: string;
  senderEmail: string;
  message: string;
  formTitle: string;
  username: string;
}) {
  return send({
    from: FROM,
    to: destinationEmail,
    replyTo: senderEmail,
    subject: `New message via ReachOut — ${formTitle}`,
    text: [
      `You received a new message via your ReachOut form (reachout.apachetastudio.org/to/${username}).`,
      "",
      `From: ${senderName} <${senderEmail}>`,
      "",
      message,
      "",
      "---",
      "Reply directly to this email to respond.",
      "ReachOut does not store this message. Only you have it.",
    ].join("\n"),
  });
}

export async function sendLimitWarningEmail({
  userEmail,
  username,
  count,
  limit,
}: {
  userEmail: string;
  username: string;
  count: number;
  limit: number;
}) {
  return send({
    from: FROM,
    to: userEmail,
    subject: "You're almost at your ReachOut limit",
    text: [
      `Hi,`,
      "",
      `Your ReachOut form (reachout.apachetastudio.org/to/${username}) has received ${count} of ${limit} messages this month — you're at ${Math.round((count / limit) * 100)}%.`,
      "",
      "What would you pay to keep receiving messages without limits? Just reply and tell us — we're figuring out pricing and your answer shapes it.",
      "",
      "— Mikee, Apacheta",
    ].join("\n"),
  });
}

export async function sendLimitHitNotification({
  userEmail,
  username,
}: {
  userEmail: string;
  username: string;
}) {
  return send({
    from: FROM,
    to: userEmail,
    subject: "Your ReachOut form has reached its limit",
    text: [
      `Hi,`,
      "",
      `Your ReachOut form (reachout.apachetastudio.org/to/${username}) has reached its 100-message monthly limit. New submissions are temporarily blocked until next month.`,
      "",
      "I wanted to reach out personally. If this limit is hurting you, reply to this email — let's figure something out.",
      "",
      "— Mikee, Apacheta",
    ].join("\n"),
  });
}

export async function notifyMikeeOnLimitHit({
  userEmail,
  username,
}: {
  userEmail: string;
  username: string;
}) {
  return send({
    from: FROM,
    to: MIKEE_EMAIL,
    subject: `[ReachOut] Limit hit: ${username}`,
    text: `User ${userEmail} (username: ${username}) has hit their monthly limit. Follow up personally.`,
  });
}
