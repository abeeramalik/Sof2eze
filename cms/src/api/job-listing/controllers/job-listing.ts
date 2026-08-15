/**
 * job-listing controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::job-listing.job-listing', ({ strapi }) => ({
  async find(ctx) {
    const entries = await strapi.documents('api::job-listing.job-listing').findMany({
      filters: { publishStatus: 'Published' },
    });

    const data = entries.map((entry) => ({
      id: entry.slug,
      title: entry.title,
      department: entry.department,
      description: entry.description,
      requirements: entry.requirements,
      status: entry.publishStatus,
    }));

    ctx.body = data;
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    const entries = await strapi.documents('api::job-listing.job-listing').findMany({
      filters: { slug: id },
    });

    if (!entries.length) {
      return ctx.notFound('Job listing not found');
    }

    const entry = entries[0];
    ctx.body = {
      id: entry.slug,
      title: entry.title,
      department: entry.department,
      description: entry.description,
      requirements: entry.requirements,
      status: entry.publishStatus,
    };
  },
}));