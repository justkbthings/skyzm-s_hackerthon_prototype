const { discoverWallet, getClient, normaliseWalletAddress } = require("../lib/openPayments");

async function discoverWalletAddress(walletAddressUrl) {
  return discoverWallet(walletAddressUrl);
}

async function createIncomingPayment(receiverResourceServer, accessToken, amount, assetCode) {
  const client = await getClient();
  return client.incomingPayment.create(
    { url: receiverResourceServer, accessToken },
    {
      walletAddress: receiverResourceServer,
      incomingAmount: {
        value: String(amount),
        assetCode,
        assetScale: 2,
      },
    }
  );
}

async function requestQuoteGrant(senderAuthServer, senderWalletAddress) {
  const client = await getClient();
  return client.grant.request(
    { url: senderAuthServer },
    {
      access_token: {
        access: [
          {
            type: "quote",
            actions: ["create", "read"],
            identifier: normaliseWalletAddress(senderWalletAddress),
          },
        ],
      },
    }
  );
}

async function createQuote(senderResourceServer, accessToken, senderWalletAddress, incomingPaymentUrl) {
  const client = await getClient();
  return client.quote.create(
    { url: senderResourceServer, accessToken },
    {
      walletAddress: normaliseWalletAddress(senderWalletAddress),
      receiver: incomingPaymentUrl,
    }
  );
}

async function requestOutgoingPaymentGrant(senderAuthServer, quoteId, debitAmount, receiveAmount, redirectUri) {
  const client = await getClient();
  return client.grant.request(
    { url: senderAuthServer },
    {
      access_token: {
        access: [
          {
            type: "outgoing-payment",
            actions: ["create", "read"],
            limits: {
              debitAmount,
              receiveAmount,
            },
          },
        ],
      },
      interact: {
        start: ["redirect"],
        finish: { method: "redirect", uri: redirectUri },
      },
    }
  );
}

async function continueGrant(continueUri, continueToken, interactRef, hash) {
  const client = await getClient();
  return client.grant.continue(
    {
      url: continueUri,
      accessToken: continueToken,
    },
    { interact_ref: interactRef, hash }
  );
}

async function createOutgoingPayment(senderResourceServer, accessToken, senderWalletAddress, quoteId) {
  const client = await getClient();
  return client.outgoingPayment.create(
    { url: senderResourceServer, accessToken },
    {
      walletAddress: normaliseWalletAddress(senderWalletAddress),
      quoteId,
    }
  );
}

async function createRecurringGrant(senderAuthServer, limits, redirectUri) {
  const client = await getClient();
  return client.grant.request(
    { url: senderAuthServer },
    {
      access_token: {
        access: [
          {
            type: "outgoing-payment",
            actions: ["create", "read", "list"],
            limits,
          },
        ],
      },
      interact: {
        start: ["redirect"],
        finish: { method: "redirect", uri: redirectUri },
      },
    }
  );
}

module.exports = {
  discoverWalletAddress,
  createIncomingPayment,
  requestQuoteGrant,
  createQuote,
  requestOutgoingPaymentGrant,
  continueGrant,
  createOutgoingPayment,
  createRecurringGrant,
};
