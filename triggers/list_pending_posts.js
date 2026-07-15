const { buildPostDropdown } = require('./post-dropdown');

module.exports = buildPostDropdown({
  key: 'list_pending_posts',
  status: 'PENDING_APPROVAL',
  displayLabel: 'List Pending Approval Posts',
  sampleStatus: 'PENDING_APPROVAL',
});
