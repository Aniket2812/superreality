# Deploying wondering

The supported production target is AWS with CockroachDB Cloud as the persistent
agent-memory layer. The deployment uses two hackathon products directly:

- CockroachDB Distributed Vector Indexing for semantic listing, buyer, and interaction recall.
- `ccloud` CLI for managed-cluster discovery/provisioning, SQL-user rotation, and connection setup.

## Prerequisites

- authenticated AWS CLI with permission for CloudFormation, EC2, IAM, and SSM;
- authenticated `ccloud` CLI;
- CockroachDB `cockroach` CLI;
- an OpenAI API key.

## Deploy

```bash
export OPENAI_API_KEY=...
export COCKROACH_CLUSTER_NAME=avian-goat # omit to provision superreality-hackathon
export COCKROACH_REGION=ap-south-1
export AWS_REGION=ap-south-1
./infra/aws/provision.sh
```

The script creates or reuses the CockroachDB Cloud cluster, rotates the application SQL
credential when migrating from the bundled local database, stores both database and OpenAI
credentials as encrypted AWS Systems Manager parameters, and deploys the CloudFormation
stack. The EC2 host is managed through SSM Session Manager, so no SSH port is exposed.

The app reads one `DATABASE_URL`; structured operational records and 1,536-dimensional
OpenAI embeddings are held transactionally in CockroachDB. The startup migration creates
tenant-prefixed distributed vector indexes. The local CockroachDB container is retained for
offline development only.

## Verify

```bash
curl --fail https://<elastic-ip>.sslip.io/health

DATABASE_URL="$(aws ssm get-parameter \
  --region ap-south-1 \
  --name /superreality/database-url \
  --with-decryption \
  --query Parameter.Value \
  --output text)"
COCKROACH_URL="$DATABASE_URL" cockroach sql --execute \
  "SELECT count(*) FROM memory_listings; SHOW INDEXES FROM memory_listings;"
```

Never print or commit the decrypted URL. See [docs/HACKATHON.md](docs/HACKATHON.md) for the
memory architecture, schema, vector query, AWS topology, and judging demo path.

Cloud resources can incur charges. Delete the CloudFormation stack and CockroachDB cluster
when they are no longer required.
