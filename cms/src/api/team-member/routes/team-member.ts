/**
 * team-member router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/team',
      handler: 'team-member.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/team/:id',
      handler: 'team-member.findOne',
      config: {
        auth: false,
      },
    },
  ],
};