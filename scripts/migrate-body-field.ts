import {createClient} from '@sanity/client'

// Configure your Sanity client
const client = createClient({
  projectId: 'a9mzshu7',
  dataset: 'production',
  token: process.env.SANITY_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

async function migrateBodyField() {
  console.log('🔄 Starting body field migration...\n')

  // Fetch all portfolio items that have body content
  console.log('📥 Fetching portfolio items...')
  const portfolioItems = await client.fetch(`
    *[_type == "portfolioArchive" && defined(body)] {
      _id,
      _rev,
      title,
      body
    }
  `)

  console.log(`Found ${portfolioItems.length} portfolio items with body content\n`)

  if (portfolioItems.length === 0) {
    console.log('✅ No items to migrate!')
    return
  }

  let migratedCount = 0
  let skippedCount = 0

  for (const item of portfolioItems) {
    // Check if body is a string (old format) or array (new format)
    if (typeof item.body === 'string') {
      try {
        // Move string body to bodyHtml and clear body
        await client
          .patch(item._id)
          .set({bodyHtml: item.body})
          .unset(['body'])
          .commit()

        console.log(`   ✓ Migrated: "${item.title}"`)
        migratedCount++
      } catch (error) {
        console.error(`   ✗ Failed to migrate "${item.title}":`, error)
      }
    } else {
      console.log(`   ⊘ Skipped: "${item.title}" (already using rich text)`)
      skippedCount++
    }
  }

  console.log()
  console.log('✅ Migration complete!')
  console.log(`   - Migrated: ${migratedCount} items`)
  console.log(`   - Skipped: ${skippedCount} items`)
  console.log()
  console.log('Your HTML content is now in the "bodyHtml" field.')
  console.log('You can reference it while creating new rich text content in the "body" field.')
}

// Run the migration
migrateBodyField().catch((error) => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
