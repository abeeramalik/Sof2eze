/**
 * team-member controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::team-member.team-member', ({ strapi }) => ({
  async find(ctx) {
    const entries = await strapi.documents('api::team-member.team-member').findMany();

    const data = entries.map((entry) => ({
      id: entry.slug,
      name: entry.name,
      role: entry.role,
      bio: entry.bio,
      photo: entry.photo,
    }));

    ctx.body = data;
  },

  async findOne(ctx) {
    const { id } = ctx.params;

    const entries = await strapi.documents('api::team-member.team-member').findMany({
      filters: { slug: id },
    });

    if (!entries.length) {
      return ctx.notFound('Team member not found');
    }

    const entry = entries[0];
    ctx.body = {
      id: entry.slug,
      name: entry.name,
      role: entry.role,
      bio: entry.bio,
      photo: entry.photo,
    };
  },
}));