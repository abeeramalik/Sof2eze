/**
 * site-content controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::site-content.site-content', ({ strapi }) => ({
  async find(ctx) {
    const entry = await strapi.documents('api::site-content.site-content').findFirst();

    if (!entry) {
      return ctx.notFound('Site content not found');
    }

    ctx.body = {
      home: {
        heroTitle: entry.heroTitle,
        heroSubtitle: entry.heroSubtitle,
        highlights: entry.highlights,
      },
      about: {
        history: entry.history,
        mission: entry.mission,
        vision: entry.vision,
      },
    };
  },
}));