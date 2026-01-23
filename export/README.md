# Drupal 8 Content Export

This directory contains all exported content from your Drupal 8 "Fijiggle" site.

## Export Summary

### Content Types (JSON)
- **article.json** - 26 blog articles (184 KB)
- **page.json** - 7 pages (12 KB)
- **portfolio.json** - 30 portfolio items (91 KB)

### Taxonomy (JSON)
- **taxonomy_modules.json** - 157 terms (295 KB)
- **taxonomy_portfolio_category.json** - 6 categories (8 KB)
- **taxonomy_tags.json** - 45 tags (58 KB)

### Files & Images
- **../sites/default/files/** - 67 MB of images and files
- **files-list.txt** - List of all 73 unique files referenced in content

## JSON Structure

Each content item includes:

```json
{
  "id": "13",
  "uuid": "4e3a3226-558d-452f-83a6-0d05d3ce5a2c",
  "title": "Article Title",
  "type": "article",
  "created": "2018-04-04T14:20:28-04:00",
  "changed": "2019-08-01T15:27:41-04:00",
  "published": true,
  "author_id": "1",
  "fields": {
    "body": {
      "value": "<p>HTML content...</p>",
      "summary": "Summary text",
      "format": "full_html"
    },
    "field_image": {
      "target_id": "17",
      "alt": "PHP logo",
      "title": "",
      "width": "256",
      "height": "256",
      "url": "/sites/default/files/2018-04/PHP.png",
      "filename": "PHP.png",
      "filesize": "37215",
      "mimetype": "image/png"
    },
    "field_tags": {
      "target_id": "5",
      "term_name": "custom breadcrumbs",
      "term_vocabulary": "tags"
    },
    "path": {
      "alias": "/blog/article-slug",
      "pid": "56",
      "langcode": "en"
    }
  }
}
```

## Field Types Included

- **Text fields**: HTML content with format (full_html, basic_html)
- **Images/Files**: Complete metadata (url, filename, filesize, mimetype, alt, title, dimensions)
- **Taxonomy references**: Include term name and vocabulary
- **Paragraphs**: Full nested paragraph data with all fields
- **Dates**: ISO 8601 format
- **URL aliases**: From path field

## Importing to Sanity.io

### File Paths
All file URLs are relative to the Drupal root. The actual files are in `../sites/default/files/`.

For Sanity.io, you'll need to:
1. Upload files to Sanity's asset system
2. Replace the Drupal file references with Sanity asset references

### Sample Import Script (Node.js)
```javascript
const fs = require('fs');
const sanityClient = require('@sanity/client');

const client = sanityClient({
  projectId: 'your-project-id',
  dataset: 'production',
  token: 'your-token',
  useCdn: false
});

// Load exported data
const articles = JSON.parse(fs.readFileSync('article.json'));

// Import articles
for (const article of articles) {
  const doc = {
    _type: 'article',
    title: article.title,
    slug: { current: article.fields.path?.alias?.replace('/blog/', '') || '' },
    publishedAt: article.created,
    body: article.fields.body?.value || '',
    // Map other fields...
  };

  await client.create(doc);
}
```

### Handling Images
```javascript
// Upload image to Sanity
const imageAsset = await client.assets.upload('image',
  fs.createReadStream(`../sites/default/files/image.png`), {
    filename: 'image.png'
  }
);

// Reference in document
const doc = {
  _type: 'article',
  mainImage: {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: imageAsset._id
    },
    alt: 'Alt text'
  }
};
```

## Content Type Mappings

### Article → Sanity Schema
- `title` → title (string)
- `fields.body.value` → body (block content or text)
- `fields.field_image` → mainImage (image)
- `fields.field_tags` → tags (array of references)
- `fields.path.alias` → slug
- `created` → publishedAt
- `fields.field_release_date` → customDate

### Portfolio → Sanity Schema
- `title` → title
- `fields.body.value` → description
- `fields.field_image` → mainImage
- `fields.field_gallery` → gallery (array of images)
- `fields.field_portfolio_category` → category
- `fields.field_short_description` → excerpt

## Notes

- All dates are in ISO 8601 format
- HTML content may need to be converted to Portable Text for Sanity
- Some Drupal-specific fields (vid, revision data) can be ignored
- Entity references include both ID and human-readable names
- Paragraphs are exported with full nested data

## Tools & Resources

- **HTML to Portable Text**: https://github.com/sanity-io/block-tools
- **Sanity Import**: https://www.sanity.io/docs/importing-data
- **Sanity CLI**: https://www.sanity.io/docs/cli

---

Generated: <?php echo date('Y-m-d H:i:s'); ?>

Total: 63 content items, 208 taxonomy terms, 73 files
