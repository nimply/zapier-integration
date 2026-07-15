const { buildHookTrigger } = require('./hook-trigger');

module.exports = buildHookTrigger({
  key: 'post_rejected',
  event: 'post.rejected',
  postStatus: 'DRAFT',
  label: 'Post Rejected',
  description: 'Triggers when a pending post is rejected back to draft.',
  extraOutputFields: [{ key: 'comment', label: 'Rejection Comment', type: 'string' }],
});
