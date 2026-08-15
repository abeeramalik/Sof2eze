/**
 * job-listing router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/jobs',
      handler: 'job-listing.find',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/jobs/:id',
      handler: 'job-listing.findOne',
      config: { auth: false },
    },
  ],
};