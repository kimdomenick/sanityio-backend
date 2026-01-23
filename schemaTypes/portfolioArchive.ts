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
      name: 'body',
      title: 'Body',
      type: 'text',
      description: 'Portfolio item body content (HTML from Drupal)',
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
      of: [{type: 'string'}],
      description: 'Categories from Drupal (e.g., Graphic Design, Drupal Sites)',
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
