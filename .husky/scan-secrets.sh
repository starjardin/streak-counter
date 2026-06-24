#!/bin/sh
# Scan staged files for potential secrets before commit.

SECRET_PATTERNS="
sk_live_
sk_test_
sb_secret_
SUPABASE_SECRET_KEY
POSTMARK_SMTP_API_TOKEN
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ghp_
gho_
ghu_
ghs_
-----BEGIN (RSA|OPENSSH|DSA|EC) PRIVATE KEY-----
"

STAGED=$(git diff --cached --name-only --diff-filter=ACM)

if [ -z "$STAGED" ]; then
  exit 0
fi

HAS_SECRETS=0
for FILE in $STAGED; do
  for PATTERN in $SECRET_PATTERNS; do
    if git show ":${FILE}" | grep -q "$PATTERN" 2>/dev/null; then
      echo "ERROR: Potential secret found in '$FILE' (matches pattern: $PATTERN)"
      HAS_SECRETS=1
    fi
  done
done

if [ $HAS_SECRETS -ne 0 ]; then
  echo ""
  echo "Commit blocked. Remove the secret or use 'git commit --no-verify' to bypass."
  exit 1
fi
