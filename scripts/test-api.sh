#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3001}"
PASS=0
FAIL=0

pass() { echo "✓ $1"; PASS=$((PASS + 1)); }
fail() { echo "✗ $1"; echo "  → $2"; FAIL=$((FAIL + 1)); }

assert_status() {
  local name="$1" expected="$2" actual="$3" body="$4"
  if [ "$actual" = "$expected" ]; then
    pass "$name (HTTP $actual)"
  else
    fail "$name" "expected HTTP $expected, got $actual — $body"
  fi
}

echo "=== Community Remit API Tests ==="
echo "Base URL: $BASE_URL"
echo ""

# Health
HEALTH=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
BODY=$(echo "$HEALTH" | sed '$d')
CODE=$(echo "$HEALTH" | tail -1)
assert_status "GET /health" "200" "$CODE" "$BODY"

# Login
LOGIN=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nomzamo@example.com","password":"password123"}')
BODY=$(echo "$LOGIN" | sed '$d')
CODE=$(echo "$LOGIN" | tail -1)
assert_status "POST /api/auth/login" "200" "$CODE" "$BODY"

TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))" 2>/dev/null || true)
if [ -n "$TOKEN" ]; then pass "Login returned JWT"; else fail "Login JWT" "no token in response"; fi

AUTH="Authorization: Bearer $TOKEN"

# Me
ME=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/auth/me" -H "$AUTH")
CODE=$(echo "$ME" | tail -1)
assert_status "GET /api/auth/me" "200" "$CODE" ""

# Balance
BAL=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/wallet/balance" -H "$AUTH")
CODE=$(echo "$BAL" | tail -1)
assert_status "GET /api/wallet/balance" "200" "$CODE" ""

# Providers
PROV=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/wallet/providers?country=ZA" -H "$AUTH")
CODE=$(echo "$PROV" | tail -1)
BODY=$(echo "$PROV" | sed '$d')
assert_status "GET /api/wallet/providers" "200" "$CODE" ""
echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); assert len(d['providers'])>=3" 2>/dev/null && pass "ZA has deposit providers" || fail "ZA providers" "expected 3+"

# Deposit
DEP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/wallet/deposit" -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"providerId":"capitec","country":"ZA"}')
CODE=$(echo "$DEP" | tail -1)
assert_status "POST /api/wallet/deposit" "200" "$CODE" ""

# Withdraw (small amount)
WD=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/wallet/withdraw" -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"amount":50,"providerId":"fnb"}')
CODE=$(echo "$WD" | tail -1)
assert_status "POST /api/wallet/withdraw" "200" "$CODE" ""

# Beneficiary
BEN=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/beneficiaries" -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"name":"Mother","walletAddress":"https://ilp.interledger-test.dev/mother"}')
CODE=$(echo "$BEN" | tail -1)
BODY=$(echo "$BEN" | sed '$d')
assert_status "POST /api/beneficiaries" "201" "$CODE" ""
BEN_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || true)

BENLIST=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/beneficiaries" -H "$AUTH")
CODE=$(echo "$BENLIST" | tail -1)
assert_status "GET /api/beneficiaries" "200" "$CODE" ""

# Wallet discover
DISC=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/beneficiaries/discover?url=https://ilp.interledger-test.dev/sarah" -H "$AUTH")
CODE=$(echo "$DISC" | tail -1)
BODY=$(echo "$DISC" | sed '$d')
assert_status "GET /api/beneficiaries/discover" "200" "$CODE" "$BODY"

# Users list
USERS=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/users" -H "$AUTH")
CODE=$(echo "$USERS" | tail -1)
BODY=$(echo "$USERS" | sed '$d')
assert_status "GET /api/users" "200" "$CODE" ""
MOTHER_ID=$(echo "$BODY" | python3 -c "import sys,json; u=[x for x in json.load(sys.stdin) if x['displayName']=='Mother']; print(u[0]['id'] if u else '')" 2>/dev/null || true)

# Payment request
if [ -n "$MOTHER_ID" ]; then
  REQ=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/requests" -H "$AUTH" \
    -H "Content-Type: application/json" \
    -d "{\"payerId\":\"$MOTHER_ID\",\"amount\":200,\"currency\":\"ZAR\",\"reason\":\"Test request\"}")
  CODE=$(echo "$REQ" | tail -1)
  assert_status "POST /api/requests" "201" "$CODE" ""
fi

REQLIST=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/requests" -H "$AUTH")
CODE=$(echo "$REQLIST" | tail -1)
assert_status "GET /api/requests" "200" "$CODE" ""

# Community
COM=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/communities" -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"name":"Family Circle"}')
CODE=$(echo "$COM" | tail -1)
BODY=$(echo "$COM" | sed '$d')
assert_status "POST /api/communities" "201" "$CODE" ""
COM_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || true)

if [ -n "$COM_ID" ]; then
  CR=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/communities/$COM_ID/requests" -H "$AUTH" \
    -H "Content-Type: application/json" \
    -d '{"title":"Work dress","targetAmount":100,"currency":"USD","expiryDate":"2026-12-31"}')
  CODE=$(echo "$CR" | tail -1)
  assert_status "POST /api/communities/:id/requests" "201" "$CODE" ""
fi

# Notifications
NOTIF=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/notifications" -H "$AUTH")
CODE=$(echo "$NOTIF" | tail -1)
assert_status "GET /api/notifications" "200" "$CODE" ""

# History
HIST=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/transactions/history" -H "$AUTH")
CODE=$(echo "$HIST" | tail -1)
assert_status "GET /api/transactions/history" "200" "$CODE" ""

# WhatsApp instruction (mock mode)
WA=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/payments/whatsapp-instruction" -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"phone":"+27821234567","beneficiaryName":"Mother","amount":"100"}')
CODE=$(echo "$WA" | tail -1)
assert_status "POST /api/payments/whatsapp-instruction" "200" "$CODE" ""

# Open Payments quote (may fail if wallet not configured)
QUOTE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/payments/quote" -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"receiverWalletAddress":"https://ilp.interledger-test.dev/sarah","amount":"500","paymentMode":"ONE_TIME","beneficiaryName":"Sarah"}')
CODE=$(echo "$QUOTE" | tail -1)
BODY=$(echo "$QUOTE" | sed '$d')
if [ "$CODE" = "200" ]; then
  pass "POST /api/payments/quote (Open Payments live)"
  TX_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['transactionId'])" 2>/dev/null || true)
  if [ -n "$TX_ID" ]; then
    STATUS=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/payments/status/$TX_ID")
    SCODE=$(echo "$STATUS" | tail -1)
    assert_status "GET /api/payments/status/:id" "200" "$SCODE" ""
  fi
elif [ "$CODE" = "503" ] || [ "$CODE" = "500" ]; then
  echo "⚠ Open Payments quote skipped/failed (HTTP $CODE) — check OP_* env and private key"
  echo "  $BODY"
else
  fail "POST /api/payments/quote" "HTTP $CODE — $BODY"
fi

# Invalid login
BAD=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"bad@example.com","password":"wrong"}')
CODE=$(echo "$BAD" | tail -1)
assert_status "POST /api/auth/login (invalid)" "401" "$CODE" ""

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ "$FAIL" -eq 0 ]
