const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const response = await z.request({ url: `${API_BASE_URL}/v1/link-pages` });
  const pages = response.data.data || [];
  const needle = (bundle.inputData.handle || '').trim().toLowerCase();
  // Empty handle returns every page (most workspaces have one).
  return needle ? pages.filter((p) => p.handle.toLowerCase() === needle) : pages;
};

const SAMPLE = {
  id: '8097029e-5895-4a48-b03c-2d7263c2d891',
  handle: 'brewhaus.coffee',
  url: 'https://nimply.link/brewhaus.coffee',
  title: 'Brewhaus Coffee',
  bio: 'Specialty coffee in Al Quoz. Open daily.',
  status: 'PUBLISHED',
  publishedVersion: 4,
  publishedAt: '2026-09-26T16:43:48.221Z',
  blocksCount: 7,
  createdAt: '2026-09-26T16:37:10.000Z',
  updatedAt: '2026-09-27T08:02:11.000Z',
};

module.exports = {
  key: 'find_link_page',
  noun: 'Link Page',
  display: {
    label: 'Find Link Page',
    description: 'Finds a nimply.link page by handle (leave empty to get all pages).',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'handle',
        label: 'Handle',
        type: 'string',
        required: false,
        helpText: 'The part after nimply.link/ — e.g. `brewhaus.coffee`. Leave empty to return every page.',
      },
    ],
    sample: SAMPLE,
    outputFields: [
      { key: 'id', label: 'Page ID', type: 'string' },
      { key: 'handle', label: 'Handle', type: 'string' },
      { key: 'url', label: 'Public URL', type: 'string' },
      { key: 'title', label: 'Title', type: 'string' },
      { key: 'bio', label: 'Bio', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'publishedVersion', label: 'Published Version', type: 'integer' },
      { key: 'publishedAt', label: 'Published At', type: 'datetime' },
      { key: 'blocksCount', label: 'Blocks', type: 'integer' },
    ],
  },
};
