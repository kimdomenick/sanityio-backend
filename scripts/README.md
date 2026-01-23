# Drupal Content Import

This script imports content from your Drupal export into Sanity.

## Prerequisites

Before running the import, you need:

1. **Sanity API Token** - Create a token with write permissions:
   - Go to https://www.sanity.io/manage
   - Select your project
   - Navigate to API → Tokens
   - Create a new token with "Editor" permissions
   - Copy the token

2. **Drupal Base URL** - The URL of your old Drupal site where images are hosted

## Running the Import

1. Set the required environment variables:

```bash
export SANITY_TOKEN="your-sanity-token-here"
export DRUPAL_BASE_URL="https://your-old-drupal-site.com"
```

2. Run the import script:

```bash
npm run import
```

## What the Script Does

The import script:

1. **Reads JSON exports** from the `export/` folder:
   - `article.json` - Imported as `articleArchive` documents
   - `portfolio.json` - Imported as `portfolioArchive` documents

2. **Downloads and uploads images** from your Drupal site to Sanity's asset system

3. **Maps Drupal fields** to the corresponding Sanity schema fields

4. **Creates documents** in your Sanity dataset using `createOrReplace` (safe to re-run)

## Imported Content

### Articles
- Title, dates (created/changed), published status
- Body content and summary
- Featured image with alt text
- Tags
- Original Drupal ID, UUID, and path alias
- Release date
- Blockquotes
- Tech blog exclusion flag

### Portfolio Items
- Title, dates (created/changed), published status
- Short description and body content
- Featured image and gallery images
- Portfolio categories
- Site status (live, mockup, etc.)
- Original Drupal ID, UUID, and path alias

## Troubleshooting

### Images not uploading
- Verify `DRUPAL_BASE_URL` is correct and accessible
- Check that image paths in the JSON match your Drupal site structure
- Some images may fail if they're no longer available on the old site

### Token errors
- Ensure your `SANITY_TOKEN` has write permissions
- Verify the token is for the correct project

### Re-running the import
- The script uses `createOrReplace` so it's safe to re-run
- Documents are created with stable IDs (`article-{id}` and `portfolio-{id}`)
- Re-running will update existing documents rather than creating duplicates
