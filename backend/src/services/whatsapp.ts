import axios from "axios";
import { config } from "../config";
import { store } from "../store";
import { createNotification } from "./notifications";

export type WhatsAppIntent =
  | { intent: "SEND_PAYMENT"; currency: string; amount: number; target: string }
  | { intent: "REQUEST_PAYMENT"; currency: string; amount: number; target: string }
  | { intent: "CHECK_BALANCE" }
  | { intent: "VIEW_TRANSACTIONS" }
  | { intent: "HELP" }
  | { intent: "UNKNOWN" };

const INTENTS = [
  { regex: /send\s+(R|ZAR|KES|GBP|USD|\$|£|Ksh)\s*(\d+)\s+to\s+(.+)/i, intent: "SEND_PAYMENT" as const },
  { regex: /request\s+(R|ZAR|KES|GBP|USD|\$|£|Ksh)\s*(\d+)\s+from\s+(.+)/i, intent: "REQUEST_PAYMENT" as const },
  { regex: /balance|how much|my wallet/i, intent: "CHECK_BALANCE" as const },
  { regex: /transactions|history|recent/i, intent: "VIEW_TRANSACTIONS" as const },
  { regex: /help|what can you do/i, intent: "HELP" as const },
];

function normaliseCurrency(token: string): string {
  if (token === "$") return "USD";
  if (token === "£") return "GBP";
  if (/ksh/i.test(token)) return "KES";
  if (token.toUpperCase() === "R") return "ZAR";
  return token.toUpperCase();
}

function formatMoney(currency: string, amount: number): string {
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function parseWhatsAppIntent(text: string): WhatsAppIntent {
  for (const candidate of INTENTS) {
    const match = text.match(candidate.regex);
    if (!match) continue;

    if (candidate.intent === "SEND_PAYMENT" || candidate.intent === "REQUEST_PAYMENT") {
      return {
        intent: candidate.intent,
        currency: normaliseCurrency(match[1]),
        amount: Number(match[2]),
        target: match[3].trim(),
      };
    }

    return { intent: candidate.intent };
  }

  return { intent: "UNKNOWN" };
}

export async function resolveWhatsAppReply(input: {
  fromPhone?: string;
  text: string;
}): Promise<string> {
  const intent = parseWhatsAppIntent(input.text);
  const sender = input.fromPhone
    ? (await store.users.all()).find((user) => user.phone?.replace(/\D/g, "") === input.fromPhone?.replace(/\D/g, ""))
    : null;

  if (intent.intent === "SEND_PAYMENT") {
    const target = (await store.users.all()).find(
      (user) =>
        user.displayName.toLowerCase().includes(intent.target.toLowerCase()) ||
        user.email.toLowerCase().includes(intent.target.toLowerCase())
    );

    if (sender && target) {
      await createNotification({
        userId: target.id,
        title: "Payment intent received",
        body: `${sender.displayName} wants to send ${formatMoney(intent.currency, intent.amount)} to you.`,
        type: "payment_request",
      });
    }

    return `✅ I parsed your payment.\nSend: ${formatMoney(intent.currency, intent.amount)}\nTo: ${intent.target}${target ? `\nMatched user: ${target.displayName}` : ""}`;
  }

  if (intent.intent === "REQUEST_PAYMENT") {
    const target = (await store.users.all()).find(
      (user) =>
        user.displayName.toLowerCase().includes(intent.target.toLowerCase()) ||
        user.email.toLowerCase().includes(intent.target.toLowerCase())
    );

    if (sender && target) {
      await createNotification({
        userId: target.id,
        title: "Payment request",
        body: `${sender.displayName} requested ${formatMoney(intent.currency, intent.amount)}.`,
        type: "payment_request",
      });
    }

    return `🧾 Request captured for ${formatMoney(intent.currency, intent.amount)} from ${intent.target}.`;
  }

  if (intent.intent === "CHECK_BALANCE") {
    return sender
      ? `💰 Your wallet balance is ${formatMoney(sender.currency, sender.balance)}`
      : "💰 I could not identify your wallet from this WhatsApp number.";
  }

  if (intent.intent === "VIEW_TRANSACTIONS") {
    const txs = sender ? await store.transactions.byUser(sender.id) : [];
    const recent = txs.slice(0, 5).map((tx) => `${tx.direction} • ${tx.assetCode} ${tx.debitAmount ?? tx.receiveAmount} • ${tx.status}`);
    return recent.length > 0 ? `📄 Recent transactions:\n${recent.join("\n")}` : "📄 No recent transactions found.";
  }

  if (intent.intent === "HELP") {
    return [
      "I can help you with:",
      "Send R500 to Wanjiru",
      "Request R200 from Sipho",
      "What is my balance",
      "Show my transactions",
    ].join("\n");
  }

  return "I did not understand that. Try: Send R500 to Wanjiru";
}

export async function sendWhatsAppText(
  to: string,
  message: string
): Promise<{ sent: boolean; reason?: string }> {
  if (!config.whatsapp.token || !config.whatsapp.phoneNumberId) {
    console.log(`[whatsapp:mock] To ${to}: ${message}`);
    return { sent: false, reason: "WhatsApp not configured — logged to console" };
  }

  await axios.post(
    `https://graph.facebook.com/v21.0/${config.whatsapp.phoneNumberId}/messages`,
    {
      messaging_product: "whatsapp",
      to: to.replace(/\D/g, ""),
      type: "text",
      text: { body: message },
    },
    {
      headers: {
        Authorization: `Bearer ${config.whatsapp.token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return { sent: true };
}

export function buildPaymentInstructionMessage(input: {
  senderName: string;
  amount: string;
  currency: string;
  beneficiaryName: string;
  deepLink: string;
}): string {
  return [
    `Hi! ${input.senderName} wants to send ${input.currency} ${input.amount} to ${input.beneficiaryName}.`,
    "",
    "Tap to review and approve this payment in Community Remit:",
    input.deepLink,
    "",
    "Powered by Open Payments & Interledger — low fees, any amount.",
  ].join("\n");
}
