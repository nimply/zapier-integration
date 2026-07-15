const { buildPostDropdown } = require('./post-dropdown');

module.exports = buildPostDropdown({
  key: 'list_draft_posts',
  status: 'DRAFT',
  displayLabel: 'List Draft Posts',
  sampleStatus: 'DRAFT',
});
