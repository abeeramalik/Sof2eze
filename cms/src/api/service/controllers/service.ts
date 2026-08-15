/**
 * service controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::service.service', ({ strapi }) => ({
  async find(ctx) {
    const entries = await strapi.documents('api::service.service').findMany({
      filters: { publishStatus: 'Published' },
    });

    const data = entries.map((entry) => ({
      id: entry.slug,
      title: entry.title,
      description: entry.description,
      icon: entry.icon,
      status: entry.publishStatus,
    }));

    ctx.body = data;
  },
}));