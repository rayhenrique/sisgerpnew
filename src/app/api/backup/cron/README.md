# Backup Module Cron Jobs

This directory contains API endpoints designed to be called by external cron services to automate backup operations.

## Available Endpoints

### 1. Execute Backup Schedules
**Endpoint:** `POST /api/backup/cron/execute-schedules`

Executes all backup schedules that are due to run.

**Frequency:** Every hour (recommended)

**Authentication:** Requires `Authorization: Bearer <CRON_SECRET>` header

**Response:**
```json
{
  "message": "Schedule execution completed",
  "results": {
    "total": 3,
    "successful": 2,
    "failed": 1,
    "errors": [
      {
        "scheduleId": "uuid",
        "scheduleName": "Daily Full Backup",
        "error": "Error message"
      }
    ]
  }
}
```

### 2. Apply Retention Policy
**Endpoint:** `POST /api/backup/cron/apply-retention`

Applies retention policies and deletes expired backups.

**Frequency:** Daily (recommended)

**Authentication:** Requires `Authorization: Bearer <CRON_SECRET>` header

**Response:**
```json
{
  "message": "Retention policy applied successfully",
  "results": {
    "totalOrganizations": 1,
    "totalDeleted": 5,
    "organizationResults": [
      {
        "organizationId": null,
        "deleted": 5
      }
    ]
  }
}
```

## Setup Instructions

### 1. Configure Environment Variable

Add the following to your `.env.local` file:

```bash
CRON_SECRET=your-secure-random-secret-here
```

Generate a secure secret:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### 2. Choose a Cron Service

#### Option A: Vercel Cron (Recommended for Vercel deployments)

Create `vercel.json` in your project root:

```json
{
  "crons": [
    {
      "path": "/api/backup/cron/execute-schedules",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/backup/cron/apply-retention",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Note:** Vercel Cron automatically includes the correct authorization header.

#### Option B: GitHub Actions

Create `.github/workflows/backup-cron.yml`:

```yaml
name: Backup Cron Jobs

on:
  schedule:
    # Execute schedules every hour
    - cron: '0 * * * *'
    # Apply retention daily at 2 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  execute-schedules:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 * * * *' || github.event_name == 'workflow_dispatch'
    steps:
      - name: Execute Backup Schedules
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/backup/cron/execute-schedules

  apply-retention:
    runs-on: ubuntu-latest
    if: github.event.schedule == '0 2 * * *' || github.event_name == 'workflow_dispatch'
    steps:
      - name: Apply Retention Policy
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/backup/cron/apply-retention
```

Add `CRON_SECRET` to your GitHub repository secrets.

#### Option C: External Cron Service (cron-job.org, EasyCron, etc.)

1. Create two cron jobs in your service
2. Configure them to make POST requests to:
   - `https://your-domain.com/api/backup/cron/execute-schedules` (hourly)
   - `https://your-domain.com/api/backup/cron/apply-retention` (daily)
3. Add custom header: `Authorization: Bearer YOUR_CRON_SECRET`

#### Option D: Server Cron (Linux/Unix)

Create a script `backup-cron.sh`:

```bash
#!/bin/bash

DOMAIN="https://your-domain.com"
CRON_SECRET="your-secret-here"

# Execute schedules
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$DOMAIN/api/backup/cron/execute-schedules"

# Apply retention (only if running daily)
if [ "$(date +%H)" = "02" ]; then
  curl -X POST \
    -H "Authorization: Bearer $CRON_SECRET" \
    "$DOMAIN/api/backup/cron/apply-retention"
fi
```

Add to crontab:
```bash
# Execute every hour
0 * * * * /path/to/backup-cron.sh >> /var/log/backup-cron.log 2>&1
```

## Testing

### Manual Testing

Test the endpoints manually using curl:

```bash
# Test schedule execution
curl -X POST \
  -H "Authorization: Bearer your-secret-here" \
  http://localhost:3000/api/backup/cron/execute-schedules

# Test retention policy
curl -X POST \
  -H "Authorization: Bearer your-secret-here" \
  http://localhost:3000/api/backup/cron/apply-retention
```

### Monitoring

Monitor cron job execution by:

1. Checking application logs for execution summaries
2. Monitoring backup creation timestamps in the database
3. Verifying `last_run_at` and `next_run_at` fields in `backup_schedules` table
4. Checking for deleted backups in retention policy logs

## Security Considerations

1. **Keep CRON_SECRET secure**: Never commit it to version control
2. **Use HTTPS**: Always use HTTPS in production to protect the secret in transit
3. **Rotate secrets**: Periodically rotate the CRON_SECRET
4. **Monitor logs**: Watch for unauthorized access attempts
5. **Rate limiting**: Consider adding rate limiting to prevent abuse

## Troubleshooting

### Schedules not executing

1. Verify `CRON_SECRET` is set correctly in environment variables
2. Check that schedules are enabled in the database
3. Verify `next_run_at` timestamps are in the past
4. Check application logs for error messages

### Retention policy not deleting backups

1. Verify retention periods are configured correctly
2. Check that backups are old enough to be deleted
3. Verify backup statuses are eligible for deletion (completed, failed, corrupted)
4. Check storage service permissions

### Authentication errors

1. Verify the `Authorization` header is formatted correctly: `Bearer <secret>`
2. Ensure `CRON_SECRET` matches between environment and cron service
3. Check for whitespace or encoding issues in the secret

## Requirements Validation

- **Requirement 2.2**: Automatic backup execution when scheduled time arrives ✓
- **Requirement 2.4**: Scheduled backup execution recorded in history ✓
- **Requirement 7.4**: Daily retention policy enforcement ✓
