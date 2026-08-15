/**
 * site-content router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/site-content',
      handler: 'site-content.find',
      config: { auth: false },
    },
  ],
};