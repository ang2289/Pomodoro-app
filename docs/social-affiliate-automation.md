# Threads / Facebook Affiliate Automation

This workflow turns the Shopee batch result workbook into posting drafts for Threads and Facebook.

## Generate Drafts

```bash
npm run social:affiliate -- "批量產生結果_2026-04-29 (6).xlsx" "2026-06-24T09:00:00+08:00" 2
```

The positional arguments are:

1. Source workbook path.
2. First scheduled time.
3. Number of products per day per platform.
4. Optional output directory.

Example with a fixed output directory:

```bash
npm run social:affiliate -- "批量產生結果_2026-04-29 (6).xlsx" "2026-06-24T09:00:00+08:00" 2 output/social-affiliate-automation/latest
```

You can also run the script directly:

```bash
node scripts/social_affiliate_automation.mjs "批量產生結果_2026-04-29 (6).xlsx" "2026-06-24T09:00:00+08:00" 2 --out output/social-affiliate-automation/latest
```

## Output Files

Generated files are written to `output/social-affiliate-automation/<timestamp>` by default.

- `social_schedule.csv`: main posting schedule with platform, time, post text, links, video URLs, and publish status.
- `social_schedule.json`: machine-readable schedule for a future Meta API publisher.
- `posts.txt`: copy-ready post text grouped by platform and time.
- `tracking_template.csv`: metrics sheet for impressions, clicks, orders, and commission.
- `README.md`: local run notes.

## Link Strategy

Facebook posts use the product share page with UTM parameters, because Facebook can handle longer text.

Threads has a 500-character post limit, so the script falls back to the Shopee affiliate short link when the share-page URL is too long. This keeps the link valid instead of truncating it.

Every generated post starts with:

```text
含分潤連結：
```

## Direct Publishing

The draft generator does not publish by itself. Facebook Page publishing is handled by:

```bash
npm run social:facebook:publish -- output/social-affiliate-automation/latest/social_schedule.json 1
```

This command is a dry-run by default.

To publish one draft to a Facebook Page:

```bash
FB_PAGE_ID="your-page-id" FB_PAGE_ACCESS_TOKEN="your-page-access-token" npm run social:facebook:publish -- --live --limit 1
```

To publish one specific schedule row:

```bash
FB_PAGE_ID="your-page-id" FB_PAGE_ACCESS_TOKEN="your-page-access-token" npm run social:facebook:publish -- --live --id 004-facebook
```

This publishes to a Facebook Page, not a personal profile. Personal-profile auto posting is not supported by the Graph API and is more likely to trigger account-risk checks if attempted through browser automation.

Direct Facebook / Threads publishing requires:

- Meta developer app.
- Page or Threads account access token.
- Approved posting permissions.
- A review-safe posting cadence.

Once those credentials exist, `social_schedule.json` can be used as the input for a publisher.
