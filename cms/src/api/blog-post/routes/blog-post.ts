/**
 * blog-post router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/blog',
      handler: 'blog-post.find',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/blog/:id',
      handler: 'blog-post.findOne',
      config: { auth: false },
    },
  ],
};