import { config, collection, singleton, fields } from '@keystatic/core';

const projectSchema = {
  title: fields.text({ label: 'Title', validation: { isRequired: true } }),
  slug: fields.slug({ name: { label: 'Slug' } }),
  summary: fields.text({ label: 'Summary (one card line)', multiline: true, validation: { isRequired: true } }),
  role: fields.text({ label: 'My role' }),
  period: fields.text({ label: 'Period (e.g. 2025 — now)' }),
  stack: fields.array(fields.text({ label: 'Tech' }), {
    label: 'Stack',
    itemLabel: (props) => props.value,
  }),
  priority: fields.integer({ label: 'Priority (lower = higher on the list)', defaultValue: 100 }),
  featured: fields.checkbox({ label: 'Featured on home', defaultValue: false }),
  repoUrl: fields.url({ label: 'Repo URL (optional)' }),
  liveUrl: fields.url({ label: 'Live URL (optional)' }),
  content: fields.mdx({ label: 'Case study' }),
};

const postSchema = {
  title: fields.text({ label: 'Title', validation: { isRequired: true } }),
  slug: fields.slug({ name: { label: 'Slug' } }),
  date: fields.date({ label: 'Date', validation: { isRequired: true } }),
  draft: fields.checkbox({ label: 'Draft', defaultValue: true }),
  tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags', itemLabel: (p) => p.value }),
  content: fields.mdx({ label: 'Post' }),
};

const cvSchema = {
  fullName: fields.text({ label: 'Full name', validation: { isRequired: true } }),
  title: fields.text({ label: 'Professional title', validation: { isRequired: true } }),
  location: fields.text({ label: 'Location line' }),
  summary: fields.text({ label: 'Summary', multiline: true }),
  skills: fields.array(
    fields.object({
      category: fields.text({ label: 'Category' }),
      items: fields.text({ label: 'Items (comma-separated)', multiline: true }),
    }),
    { label: 'Skill groups', itemLabel: (p) => p.fields.category.value },
  ),
  experience: fields.array(
    fields.object({
      company: fields.text({ label: 'Company' }),
      role: fields.text({ label: 'Role' }),
      period: fields.text({ label: 'Period' }),
      location: fields.text({ label: 'Location' }),
      bullets: fields.array(fields.text({ label: 'Bullet', multiline: true }), {
        label: 'Achievements',
        itemLabel: (p) => p.value.slice(0, 60),
      }),
    }),
    { label: 'Experience', itemLabel: (p) => p.fields.company.value },
  ),
  education: fields.array(
    fields.object({
      school: fields.text({ label: 'School' }),
      degree: fields.text({ label: 'Degree' }),
      period: fields.text({ label: 'Period' }),
    }),
    { label: 'Education', itemLabel: (p) => p.fields.school.value },
  ),
};

export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'anton.dev admin' } },
  collections: {
    projectsEn: collection({
      label: 'Projects (EN)',
      path: 'content/projects/en/*',
      slugField: 'slug',
      format: { contentField: 'content' },
      schema: projectSchema,
    }),
    projectsRu: collection({
      label: 'Projects (RU)',
      path: 'content/projects/ru/*',
      slugField: 'slug',
      format: { contentField: 'content' },
      schema: projectSchema,
    }),
    postsEn: collection({
      label: 'Posts (EN)',
      path: 'content/posts/en/*',
      slugField: 'slug',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
    postsRu: collection({
      label: 'Posts (RU)',
      path: 'content/posts/ru/*',
      slugField: 'slug',
      format: { contentField: 'content' },
      schema: postSchema,
    }),
  },
  singletons: {
    site: singleton({
      label: 'Site settings',
      path: 'content/site',
      schema: {
        siteUrl: fields.url({ label: 'Canonical site URL' }),
        email: fields.text({ label: 'Email' }),
        githubUrl: fields.url({ label: 'GitHub URL' }),
        linkedinUrl: fields.url({ label: 'LinkedIn URL' }),
        telegramUrl: fields.url({ label: 'Telegram URL (optional)' }),
        bookingUrl: fields.url({ label: 'Book-a-call URL (optional)' }),
        availabilityEn: fields.text({ label: 'Availability badge (EN)' }),
        availabilityRu: fields.text({ label: 'Availability badge (RU)' }),
      },
    }),
    cvEn: singleton({ label: 'CV (EN)', path: 'content/cv/en', schema: cvSchema }),
    cvRu: singleton({ label: 'CV (RU)', path: 'content/cv/ru', schema: cvSchema }),
  },
});
