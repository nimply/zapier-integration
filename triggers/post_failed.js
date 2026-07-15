const { buildHookTrigger } = require('./hook-trigger');

module.exports = buildHookTrigger({
  key: 'post_failed',
  event: 'post.failed',
  postStatus: 'FAILED',
  label: 'Post Failed',
  description: 'Triggers when publishing a post fails (rejected by the social platform).',
  extraOutputFields: [{ key: 'error', label: 'Error Message', type: 'string' }],
});
