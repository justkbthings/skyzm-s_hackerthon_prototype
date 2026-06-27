import type { Response } from "express";
import { config } from "../config";

export type PaymentCallbackStatus = "completed" | "failed";

interface RedirectParams {
  transactionId: string;
  status: PaymentCallbackStatus;
  returnPlatform?: "web" | "native";
  reason?: string;
}

function webFallbackUrl(params: RedirectParams): string {
  const { transactionId, status, reason } = params;
  const query = new URLSearchParams({
    paymentReturn: "1",
    transactionId,
    status,
  });
  if (reason) query.set("reason", reason);
  return `${config.mobileWebUrl}?${query.toString()}`;
}

function nativeDeepLink(params: RedirectParams): string {
  const { transactionId, status, reason } = params;
  const query = new URLSearchParams({ id: transactionId, status });
  if (reason) query.set("reason", reason);
  return `${config.mobileDeepLink}?${query.toString()}`;
}

export function sendPaymentCallbackRedirect(
  res: Response,
  params: RedirectParams
): void {
  if (params.returnPlatform === "web") {
    const payload = JSON.stringify({
      type: "community-remit-payment",
      transactionId: params.transactionId,
      status: params.status,
      reason: params.reason,
    });
    const fallbackUrl = webFallbackUrl(params);
    const title =
      params.status === "completed" ? "Payment complete" : "Payment failed";
    const message =
      params.status === "completed"
        ? "Payment authorised. You can close this window."
        : "Payment could not be completed. You can close this window.";

    res.status(200).type("html").send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; color: #004b49; }
    p { font-size: 1.1rem; line-height: 1.5; }
  </style>
</head>
<body>
  <p>${message}</p>
  <script>
    (function () {
      var msg = ${payload};
      if (window.opener) {
        try { window.opener.postMessage(msg, "*"); } catch (e) {}
      }
      window.close();
      setTimeout(function () {
        window.location.replace(${JSON.stringify(fallbackUrl)});
      }, 600);
    })();
  </script>
</body>
</html>`);
    return;
  }

  res.redirect(nativeDeepLink(params));
}
