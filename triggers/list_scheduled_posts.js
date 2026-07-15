const { buildPostDropdown } = require('./post-dropdown');

module.exports = buildPostDropdown({
  key: 'list_scheduled_posts',
  status: 'SCHEDULED',
  displayLabel: 'List Scheduled Posts',
  sampleStatus: 'SCHEDULED',
});
