#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME="${COCKROACH_CLUSTER_NAME:-superreality-hackathon}"
COCKROACH_REGION="${COCKROACH_REGION:-ap-south-1}"
AWS_REGION="${AWS_REGION:-ap-south-1}"
STACK_NAME="${STACK_NAME:-superreality-hackathon}"

for command in ccloud cockroach aws openssl python3; do
  command -v "$command" >/dev/null || { echo "Missing required command: $command" >&2; exit 1; }
done
: "${OPENAI_API_KEY:?Set OPENAI_API_KEY before provisioning}"
ccloud auth whoami -o json >/dev/null

if ! ccloud cluster info "$CLUSTER_NAME" -o json >/dev/null 2>&1; then
  ccloud cluster create BASIC "$CLUSTER_NAME" "$COCKROACH_REGION" \
    --cloud AWS --primary-region "$COCKROACH_REGION" \
    --request-unit-limit 10000000 --storage-gib-limit 10 --wait
fi

DB_USER="superreality_app"
if DATABASE_URL="$(aws ssm get-parameter --region "$AWS_REGION" --name /superreality/database-url --with-decryption --query Parameter.Value --output text 2>/dev/null)"; then
  echo "Reusing the existing encrypted CockroachDB application credential."
else
  DB_PASSWORD="$(openssl rand -base64 36 | tr -dc 'A-Za-z0-9' | head -c 32)"
  ccloud cluster user create "$CLUSTER_NAME" "$DB_USER" --password "$DB_PASSWORD" >/dev/null
  BASE_URL="$(ccloud cluster connection-string "$CLUSTER_NAME" --sql-user "$DB_USER" --database defaultdb --os LINUX --hide-header)"
  DATABASE_URL="$(BASE_URL="$BASE_URL" DB_PASSWORD="$DB_PASSWORD" python3 - <<'PY'
import os
from urllib.parse import quote, urlsplit, urlunsplit

parts = urlsplit(os.environ["BASE_URL"].strip())
host = parts.hostname or ""
if parts.port:
    host += f":{parts.port}"
netloc = f"{quote(parts.username or 'superreality_app')}:{quote(os.environ['DB_PASSWORD'])}@{host}"
print(urlunsplit((parts.scheme or "postgresql", netloc, parts.path, parts.query, "")))
PY
)"
fi

aws ssm put-parameter --region "$AWS_REGION" --name /superreality/database-url \
  --type SecureString --value "$DATABASE_URL" --overwrite >/dev/null
aws ssm put-parameter --region "$AWS_REGION" --name /superreality/openai-api-key \
  --type SecureString --value "$OPENAI_API_KEY" --overwrite >/dev/null

aws cloudformation deploy --region "$AWS_REGION" --stack-name "$STACK_NAME" \
  --template-file infra/aws/superreality.yaml --capabilities CAPABILITY_IAM
aws cloudformation describe-stacks --region "$AWS_REGION" --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs' --output table
