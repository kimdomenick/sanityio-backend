import {createClient} from '@sanity/client'
import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'

// Configure your Sanity client
const client = createClient({
  projectId: 'a9mzshu7',
  dataset: 'production',
  token: process.env.SANITY_TOKEN, // You'll need to set this
  apiVersion: '2024-01-01',
  useCdn: false,
})

interface DrupalImage {
  target_id: string
  alt: string
  title: string
  width: string
  height: string
  url: string
  filename: string
  filesize: string
  mimetype: string
}

interface DrupalArticle {
  id: string
  uuid: string
  title: string
  type: string
  created: string
  changed: string
  published: boolean
  author_id: string
  fields: {
    path: {
      alias: string
      pid: string
      langcode: string
    }
    body: {
      value: string
      summary: string
      format: string
    }
    field_image?: DrupalImage
    field_release_date?: {
      value: string
    }
    field_tags?: {
      target_id: string
      term_name: string
      term_vocabulary: string
    } | Array<{
      target_id: string
      term_name: string
      term_vocabulary: string
    }>
    field_blockquote?: any[]
    field_exclude_from_tech_blog?: {
      value: string
    }
  }
}

interface DrupalPortfolio {
  id: string
  uuid: string
  title: string
  type: string
  created: string
  changed: string
  published: boolean
  author_id: string
  fields: {
    path: {
      alias: string
      pid: string
      langcode: string
    }
    body: {
      value: string
      summary: string
      format: string
    }
    field_short_description?: {
      value: string
      format: string
    }
    field_image?: DrupalImage
    field_gallery?: DrupalImage[]
    field_portfolio_category?: {
      target_id: string
      term_name: string
      term_vocabulary: string
    } | Array<{
      target_id: string
      term_name: string
      term_vocabulary: string
    }>
    field_site_status?: {
      value: string
    }
  }
}

// Helper function to download and upload image to Sanity
async function uploadImageToSanity(
  imageUrl: string,
  alt: string,
  filename: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    // Validate inputs
    if (!imageUrl || !filename || imageUrl === 'undefined' || filename === 'undefined') {
      console.warn(`  Skipping invalid image: url=${imageUrl}, filename=${filename}`)
      resolve(null)
      return
    }

    // Determine if we need http or https
    const protocol = imageUrl.startsWith('https') ? https : http

    // For HTTPS, we need to handle self-signed certificates (DDEV)
    const options = imageUrl.startsWith('https')
      ? { rejectUnauthorized: false }
      : {}

    protocol.get(imageUrl, options, (response) => {
      if (response.statusCode !== 200) {
        console.warn(`Failed to download image: ${imageUrl} (${response.statusCode})`)
        resolve(null)
        return
      }

      const chunks: Buffer[] = []
      response.on('data', (chunk) => chunks.push(chunk))
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks)
          const asset = await client.assets.upload('image', buffer, {
            filename: filename,
          })
          resolve({
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
            alt: alt,
            drupalUrl: imageUrl,
          })
        } catch (error) {
          console.error(`Error uploading image ${filename}:`, error)
          resolve(null)
        }
      })
      response.on('error', (error) => {
        console.error(`Error downloading image ${imageUrl}:`, error)
        resolve(null)
      })
    })
  })
}

// Helper to normalize tag data
function normalizeTags(tagData: any): string[] {
  if (!tagData) return []
  if (Array.isArray(tagData)) {
    return tagData.map((tag) => tag.term_name)
  }
  return [tagData.term_name]
}

// Helper to normalize category data
function normalizeCategories(categoryData: any): string[] {
  if (!categoryData) return []
  if (Array.isArray(categoryData)) {
    return categoryData.map((cat) => cat.term_name)
  }
  return [categoryData.term_name]
}

// Import articles
async function importArticles(baseImageUrl: string) {
  const articlesPath = path.join(process.cwd(), 'export', 'article.json')
  const articles: DrupalArticle[] = JSON.parse(fs.readFileSync(articlesPath, 'utf-8'))

  console.log(`Found ${articles.length} articles to import`)

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i]
    console.log(`Importing article ${i + 1}/${articles.length}: ${article.title}`)

    try {
      // Upload image if it exists
      let imageRef = null
      if (article.fields.field_image && article.fields.field_image.url && article.fields.field_image.filename) {
        const img = article.fields.field_image
        const fullImageUrl = `${baseImageUrl}${img.url}`
        console.log(`  Uploading image: ${img.filename}`)
        imageRef = await uploadImageToSanity(fullImageUrl, img.alt || '', img.filename)
      }

      // Create the document
      const doc = {
        _type: 'articleArchive',
        _id: `article-${article.id}`,
        title: article.title,
        drupalId: parseInt(article.id),
        drupalUuid: article.uuid,
        slug: {
          _type: 'slug',
          current: article.fields.path.alias.split('/').pop() || article.title.toLowerCase().replace(/\s+/g, '-'),
        },
        pathAlias: article.fields.path.alias,
        created: article.created,
        changed: article.changed,
        published: article.published,
        authorId: article.author_id,
        body: article.fields.body.value,
        summary: article.fields.body.summary || '',
        image: imageRef,
        releaseDate: article.fields.field_release_date?.value,
        tags: normalizeTags(article.fields.field_tags),
        blockquote: article.fields.field_blockquote && article.fields.field_blockquote.length > 0
          ? JSON.stringify(article.fields.field_blockquote)
          : null,
        excludeFromTechBlog: article.fields.field_exclude_from_tech_blog?.value === '1',
      }

      await client.createOrReplace(doc)
      console.log(`  ✓ Imported: ${article.title}`)
    } catch (error) {
      console.error(`  ✗ Error importing article ${article.title}:`, error)
    }
  }
}

// Import portfolio items
async function importPortfolio(baseImageUrl: string) {
  const portfolioPath = path.join(process.cwd(), 'export', 'portfolio.json')
  const portfolioItems: DrupalPortfolio[] = JSON.parse(fs.readFileSync(portfolioPath, 'utf-8'))

  console.log(`Found ${portfolioItems.length} portfolio items to import`)

  for (let i = 0; i < portfolioItems.length; i++) {
    const item = portfolioItems[i]
    console.log(`Importing portfolio ${i + 1}/${portfolioItems.length}: ${item.title}`)

    try {
      // Upload featured image if it exists
      let imageRef = null
      if (item.fields.field_image && item.fields.field_image.url && item.fields.field_image.filename) {
        const img = item.fields.field_image
        const fullImageUrl = `${baseImageUrl}${img.url}`
        console.log(`  Uploading featured image: ${img.filename}`)
        imageRef = await uploadImageToSanity(fullImageUrl, img.alt || '', img.filename)
      }

      // Upload gallery images if they exist
      let galleryRefs = []
      if (item.fields.field_gallery && Array.isArray(item.fields.field_gallery) && item.fields.field_gallery.length > 0) {
        console.log(`  Uploading ${item.fields.field_gallery.length} gallery images`)
        for (const galleryImg of item.fields.field_gallery) {
          if (galleryImg.url && galleryImg.filename) {
            const fullImageUrl = `${baseImageUrl}${galleryImg.url}`
            const ref = await uploadImageToSanity(fullImageUrl, galleryImg.alt || '', galleryImg.filename)
            if (ref) {
              galleryRefs.push(ref)
            }
          }
        }
      }

      // Create the document
      const doc = {
        _type: 'portfolioArchive',
        _id: `portfolio-${item.id}`,
        title: item.title,
        drupalId: parseInt(item.id),
        drupalUuid: item.uuid,
        slug: {
          _type: 'slug',
          current: item.fields.path.alias.split('/').pop() || item.title.toLowerCase().replace(/\s+/g, '-'),
        },
        pathAlias: item.fields.path.alias,
        created: item.created,
        changed: item.changed,
        published: item.published,
        authorId: item.author_id,
        shortDescription: item.fields.field_short_description?.value || '',
        body: item.fields.body.value,
        image: imageRef,
        gallery: galleryRefs.length > 0 ? galleryRefs : null,
        portfolioCategory: normalizeCategories(item.fields.field_portfolio_category),
        siteStatus: item.fields.field_site_status?.value || null,
      }

      await client.createOrReplace(doc)
      console.log(`  ✓ Imported: ${item.title}`)
    } catch (error) {
      console.error(`  ✗ Error importing portfolio item ${item.title}:`, error)
    }
  }
}

// Main import function
async function main() {
  // You need to provide the base URL of your old Drupal site
  const baseImageUrl = process.env.DRUPAL_BASE_URL || 'https://your-old-drupal-site.com'

  if (!process.env.SANITY_TOKEN) {
    console.error('Error: SANITY_TOKEN environment variable is required')
    console.log('Create a token at: https://www.sanity.io/manage')
    process.exit(1)
  }

  if (baseImageUrl === 'https://your-old-drupal-site.com') {
    console.error('Error: DRUPAL_BASE_URL environment variable is required')
    console.log('Set it to your old Drupal site URL (e.g., https://old-site.com)')
    process.exit(1)
  }

  console.log('Starting Drupal content import...')
  console.log(`Base image URL: ${baseImageUrl}`)

  try {
    await importArticles(baseImageUrl)
    console.log('\n✓ Articles import complete\n')

    await importPortfolio(baseImageUrl)
    console.log('\n✓ Portfolio import complete\n')

    console.log('Import finished successfully!')
  } catch (error) {
    console.error('Import failed:', error)
    process.exit(1)
  }
}

main()
