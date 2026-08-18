#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-south-1}"
STACK_NAME="${STACK_NAME:-superreality-hackathon}"
CAL_DEFAULT_TIMEZONE="${CAL_DEFAULT_TIMEZONE:-America/Toronto}"

for command in aws python3; do
  command -v "$command" >/dev/null || { echo "Missing required command: $command" >&2; exit 1; }
done
: "${CAL_API_KEY:?Set CAL_API_KEY to a Cal.com API key from Settings > Security}"

# Validate the key, reuse a requested event type, or create one purpose-built for showings.
CAL_RESULT="$({ CAL_API_KEY="$CAL_API_KEY" RR_CAL_EVENT_TYPE_ID="${RR_CAL_EVENT_TYPE_ID:-}" CAL_DEFAULT_TIMEZONE="$CAL_DEFAULT_TIMEZONE" python3 - <<'PY'
import json
import os
import urllib.error
import urllib.request

key = os.environ["CAL_API_KEY"]
requested = os.environ.get("RR_CAL_EVENT_TYPE_ID", "").strip()
timezone = os.environ["CAL_DEFAULT_TIMEZONE"]

def request(method, path, version, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        "https://api.cal.com/v2" + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {key}",
            "cal-api-version": version,
            "Content-Type": "application/json",
            # Cal's Cloudflare edge rejects Python's default urllib fingerprint (1010).
            "User-Agent": "wondering-calendar/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.load(response)["data"]
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace")[:500]
        raise SystemExit(f"Cal.com {method} {path} failed ({exc.code}): {detail}") from exc

profile = request("GET", "/me", "2024-06-14")
events = request("GET", "/event-types", "2024-06-14")
event = None
if requested:
    event = next((item for item in events if str(item.get("id")) == requested), None)
    if event is None:
        raise SystemExit(f"Cal.com event type {requested} was not found in this account")
else:
    event = next((item for item in events if item.get("slug") == "property-showing"), None)
    if event is None:
        event = request(
            "POST",
            "/event-types",
            "2024-06-14",
            {
                "lengthInMinutes": 30,
                "title": "Property Showing",
                "slug": "property-showing",
                "description": "In-person property showing scheduled by the wondering voice concierge.",
                "bookingRequiresAuthentication": False,
                "locations": [
                    {
                        "type": "address",
                        "address": "Property address confirmed during the call",
                        "public": True,
                    }
                ],
            },
        )

print(json.dumps({
    "event_type_id": event["id"],
    "event_slug": event.get("slug"),
    "username": profile.get("username"),
    "timezone": timezone,
}))
PY
} 2>&1)" || { echo "$CAL_RESULT" >&2; exit 1; }

RR_CAL_EVENT_TYPE_ID="$(CAL_RESULT="$CAL_RESULT" python3 -c 'import json,os; print(json.loads(os.environ["CAL_RESULT"])["event_type_id"])')"

aws ssm put-parameter --region "$AWS_REGION" --name /superreality/cal-api-key \
  --type SecureString --value "$CAL_API_KEY" --overwrite >/dev/null
aws ssm put-parameter --region "$AWS_REGION" --name /superreality/cal-event-type-id \
  --type String --value "$RR_CAL_EVENT_TYPE_ID" --overwrite >/dev/null
aws ssm put-parameter --region "$AWS_REGION" --name /superreality/cal-default-timezone \
  --type String --value "$CAL_DEFAULT_TIMEZONE" --overwrite >/dev/null

INSTANCE_ID="$(aws cloudformation describe-stacks --region "$AWS_REGION" \
  --stack-name "$STACK_NAME" --query 'Stacks[0].Outputs[?OutputKey==`InstanceId`].OutputValue' \
  --output text)"

COMMAND_ID="$(aws ssm send-command --region "$AWS_REGION" --instance-ids "$INSTANCE_ID" \
  --document-name AWS-RunShellScript --comment 'Configure Cal.com bookings' \
  --parameters 'commands=["cd /opt/superreality","CAL_KEY=$(aws ssm get-parameter --name /superreality/cal-api-key --with-decryption --query Parameter.Value --output text --region '${AWS_REGION}')","CAL_EVENT=$(aws ssm get-parameter --name /superreality/cal-event-type-id --query Parameter.Value --output text --region '${AWS_REGION}')","CAL_TZ=$(aws ssm get-parameter --name /superreality/cal-default-timezone --query Parameter.Value --output text --region '${AWS_REGION}')","sed -i -e /^CAL_API_KEY=/d -e /^RR_CAL_EVENT_TYPE_ID=/d -e /^CAL_DEFAULT_TIMEZONE=/d .env","echo CAL_API_KEY=$CAL_KEY >> .env","echo RR_CAL_EVENT_TYPE_ID=$CAL_EVENT >> .env","echo CAL_DEFAULT_TIMEZONE=$CAL_TZ >> .env","docker compose -f docker-compose.yml -f infra/aws/docker-compose.yml up -d --force-recreate backend agent"]' \
  --query 'Command.CommandId' --output text)"

aws ssm wait command-executed --region "$AWS_REGION" --command-id "$COMMAND_ID" \
  --instance-id "$INSTANCE_ID"
echo "Cal.com connected: $CAL_RESULT"
