const { buildHookTrigger } = require('./hook-trigger');

module.exports = buildHookTrigger({
  key: 'post_published',
  event: 'post.published',
  postStatus: 'PUBLISHED',
  label: 'Post Published',
  description: 'Triggers when a post is successfully published to a social channel.',
  publishedAtSample: '2026-08-01T09:00:02.000Z',
  extraOutputFields: [{ key: 'postUrl', label: 'Post URL', type: 'string' }],
});
