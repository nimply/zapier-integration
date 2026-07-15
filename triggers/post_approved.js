const { buildHookTrigger } = require('./hook-trigger');

module.exports = buildHookTrigger({
  key: 'post_approved',
  event: 'post.approved',
  postStatus: 'SCHEDULED',
  label: 'Post Approved',
  description: 'Triggers when a pending post is approved (returning it to scheduled or draft).',
  extraOutputFields: [{ key: 'comment', label: 'Approval Comment', type: 'string' }],
});
