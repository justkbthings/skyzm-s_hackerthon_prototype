import axios from "axios";
import { config } from "../config";

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
