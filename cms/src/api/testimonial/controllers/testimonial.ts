/**
 * testimonial controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::testimonial.testimonial', ({ strapi }) => ({
  async find(ctx) {
    const entries = await strapi.documents('api::testimonial.testimonial').findMany({
      filters: { publishStatus: 'Published' },
    });

    const data = entries.map((entry) => ({
      id: entry.slug,
      clientName: entry.clientName,
      clientTitle: entry.clientTitle,
      quote: entry.quote,
      status: entry.publishStatus,
    }));

    ctx.body = data;
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    const entries = await strapi.documents('api::testimonial.testimonial').findMany({
      filters: { slug: id },
    });

    if (!entries.length) {
      return ctx.notFound('Testimonial not found');
    }

    const entry = entries[0];
    ctx.body = {
      id: entry.slug,
      clientName: entry.clientName,
      clientTitle: entry.clientTitle,
      quote: entry.quote,
      status: entry.publishStatus,
    };
  },
}));