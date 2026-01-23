import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'articleArchive',
  title: 'Article Archive',
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
      name: 'body',
      title: 'Body',
      type: 'text',
      description: 'Article body content (HTML from Drupal)',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      description: 'Article summary/teaser',
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
      name: 'releaseDate',
      title: 'Release Date',
      type: 'date',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'blockquote',
      title: 'Block Quote',
      type: 'text',
    }),
    defineField({
      name: 'excludeFromTechBlog',
      title: 'Exclude from Tech Blog',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'releaseDate',
      media: 'image',
    },
  },
})
