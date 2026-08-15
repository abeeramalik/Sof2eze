/**
 * blog-post controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  async find(ctx) {
    const entries = await strapi.documents('api::blog-post.blog-post').findMany({
      filters: { publishStatus: 'Published' },
    });

    const data = entries.map((entry) => ({
      id: entry.slug,
      title: entry.title,
      body: entry.body,
      publishedAt: entry.postedAt,
      status: entry.publishStatus,
    }));

    ctx.body = data;
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    const entries = await strapi.documents('api::blog-post.blog-post').findMany({
      filters: { slug: id },
    });

    if (!entries.length) {
      return ctx.notFound('Blog post not found');
    }

    const entry = entries[0];
    ctx.body = {
      id: entry.slug,
      title: entry.title,
      body: entry.body,
      publishedAt: entry.postedAt,
      status: entry.publishStatus,
    };
  },
}));