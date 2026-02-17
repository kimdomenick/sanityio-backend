import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'portfolioArchive',
  title: 'Portfolio Archive',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'drupalId',
      title: 'Drupal ID',
      type: 'number',
      description: 'Original Drupal node ID',
    }),
    defineField({
      name: 'drupalUuid',
      title: 'Drupal UUID',
      type: 'string',
      description: 'Original Drupal UUID',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'pathAlias',
      title: 'Path Alias',
      type: 'string',
      description: 'Original Drupal path alias',
    }),
    defineField({
      name: 'created',
      title: 'Created Date',
      type: 'datetime',
    }),
    defineField({
      name: 'changed',
      title: 'Last Modified',
      type: 'datetime',
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'fullPage',
      title: 'Full Page',
      type: 'boolean',
      description: 'Display as a full page portfolio item',
      initialValue: false,
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      description: 'Year of the portfolio item (e.g., 2024)',
      validation: (Rule) => Rule.integer().min(1900).max(2100),
    }),
    defineField({
      name: 'authorId',
      title: 'Author ID',
      type: 'string',
      description: 'Original Drupal author ID',
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      description: 'Brief description of the portfolio item',
    }),
    defineField({
      name: 'bodyHtml',
      title: 'Body (Original HTML)',
      type: 'text',
      description: 'Original HTML from Drupal - reference this when creating rich text content',
      hidden: ({document}) => !!document?.body, // Hide once new body content exists
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Numbered', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'},
              {title: 'Underline', value: 'underline'},
              {title: 'Strike', value: 'strike-through'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                  {
                    name: 'blank',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },
      ],
      description: 'Rich text content for the portfolio item',
    }),
    defineField({
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
        {
          name: 'drupalUrl',
          type: 'string',
          title: 'Original Drupal URL',
          description: 'Original image URL from Drupal',
        },
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {hotspot: true},
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
            {
              name: 'drupalUrl',
              type: 'string',
              title: 'Original Drupal URL',
              description: 'Original image URL from Drupal',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'portfolioCategory',
      title: 'Portfolio Category',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'category'}]}],
      description: 'Categories for this portfolio item',
    }),
    defineField({
      name: 'portfolioType',
      title: 'Portfolio Type',
      type: 'reference',
      to: [{type: 'portfolioType'}],
      description: 'Type of portfolio item (e.g., Tech/Development, Creative)',
    }),
    defineField({
      name: 'siteStatus',
      title: 'Site Status',
      type: 'string',
      options: {
        list: [
          {title: 'Live', value: 'live'},
          {title: 'Mock-up', value: 'mockup'},
          {title: 'Archived', value: 'archived'},
          {title: 'In Development', value: 'development'},
        ],
      },
      description: 'Status of the portfolio site/project',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'shortDescription',
      media: 'image',
    },
  },
})
