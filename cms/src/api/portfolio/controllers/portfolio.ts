/**
 * portfolio controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::portfolio.portfolio', ({ strapi }) => ({
  async find(ctx) {
    const entries = await strapi.documents('api::portfolio.portfolio').findMany({
      filters: { publishStatus: 'Published' },
    });

    const data = entries.map((entry) => ({
      id: entry.slug,
      title: entry.title,
      client: entry.client,
      summary: entry.summary,
      tags: entry.tags,
      image: entry.image,
      status: entry.publishStatus,
    }));

    ctx.body = data;
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    const entries = await strapi.documents('api::portfolio.portfolio').findMany({
      filters: { slug: id },
    });

    if (!entries.length) {
      return ctx.notFound('Portfolio entry not found');
    }

    const entry = entries[0];
    ctx.body = {
      id: entry.slug,
      title: entry.title,
      client: entry.client,
      summary: entry.summary,
      tags: entry.tags,
      image: entry.image,
      status: entry.publishStatus,
    };
  },
}));