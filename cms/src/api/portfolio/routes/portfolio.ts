/**
 * portfolio router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/portfolio',
      handler: 'portfolio.find',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/portfolio/:id',
      handler: 'portfolio.findOne',
      config: { auth: false },
    },
  ],
};