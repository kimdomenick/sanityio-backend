import {createClient} from '@sanity/client'

// Configure your Sanity client
const client = createClient({
  projectId: 'a9mzshu7',
  dataset: 'production',
  token: process.env.SANITY_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// Helper function to create a slug from a string
function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function migrateCategories() {
  console.log('🔄 Starting category migration...\n')

  // Step 1: Fetch all portfolio items that have string categories
  console.log('📥 Fetching portfolio items with categories...')
  const portfolioItems = await client.fetch(`
    *[_type == "portfolioArchive" && defined(portfolioCategory)] {
      _id,
      title,
      portfolioCategory
    }
  `)

  console.log(`Found ${portfolioItems.length} portfolio items\n`)

  // Step 2: Extract unique category strings
  const categoryStrings = new Set<string>()
  portfolioItems.forEach((item: any) => {
    if (Array.isArray(item.portfolioCategory)) {
      item.portfolioCategory.forEach((cat: any) => {
        // Only collect if it's a string (not already a reference)
        if (typeof cat === 'string') {
          categoryStrings.add(cat)
        }
      })
    }
  })

  console.log(`📊 Found ${categoryStrings.size} unique categories:`)
  categoryStrings.forEach((cat) => console.log(`   - ${cat}`))
  console.log()

  if (categoryStrings.size === 0) {
    console.log('✅ No string categories found. Migration not needed!')
    return
  }

  // Step 3: Create category documents
  console.log('📝 Creating category documents...')
  const categoryMap = new Map<string, string>() // maps category string to _id

  for (const categoryName of categoryStrings) {
    const slug = generateSlug(categoryName)

    // Check if category already exists
    const existing = await client.fetch(
      `*[_type == "category" && slug.current == $slug][0]`,
      {slug}
    )

    if (existing) {
      console.log(`   ✓ Category "${categoryName}" already exists`)
      categoryMap.set(categoryName, existing._id)
    } else {
      // Create new category document
      const newCategory = await client.create({
        _type: 'category',
        title: categoryName,
        slug: {
          _type: 'slug',
          current: slug,
        },
      })
      console.log(`   ✓ Created category "${categoryName}"`)
      categoryMap.set(categoryName, newCategory._id)
    }
  }

  console.log()

  // Step 4: Update portfolio items to use references
  console.log('🔄 Updating portfolio items to use category references...')
  let updateCount = 0

  for (const item of portfolioItems) {
    // Check if this item has string categories that need migration
    const hasStringCategories = item.portfolioCategory?.some(
      (cat: any) => typeof cat === 'string'
    )

    if (!hasStringCategories) {
      continue
    }

    // Convert string categories to references
    const categoryRefs = item.portfolioCategory
      .filter((cat: any) => typeof cat === 'string')
      .map((catString: string) => ({
        _type: 'reference',
        _ref: categoryMap.get(catString),
        _key: Math.random().toString(36).substring(7),
      }))

    // Update the document
    await client
      .patch(item._id)
      .set({portfolioCategory: categoryRefs})
      .commit()

    console.log(`   ✓ Updated "${item.title}"`)
    updateCount++
  }

  console.log()
  console.log('✅ Migration complete!')
  console.log(`   - Created ${categoryMap.size} categories`)
  console.log(`   - Updated ${updateCount} portfolio items`)
}

// Run the migration
migrateCategories().catch((error) => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
