const { buildHookTrigger } = require('./hook-trigger');

module.exports = buildHookTrigger({
  key: 'post_approval_requested',
  event: 'post.approval_requested',
  postStatus: 'PENDING_APPROVAL',
  label: 'Post Approval Requested',
  description: 'Triggers when a draft post is submitted for approval.',
});
