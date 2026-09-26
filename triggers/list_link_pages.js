const { API_BASE_URL } = require('../constants');

// Hidden polling trigger that powers the link-page dropdown in Add Link Block.
const perform = async (z, bundle) => {
  const response = await z.request({ url: `${API_BASE_URL}/v1/link-pages` });
  return (response.data.data || []).map((page) => ({
    id: page.id,
    name: `${page.title || page.handle} (nimply.link/${page.handle})`,
    handle: page.handle,
    status: page.status,
  }));
};

module.exports = {
  key: 'list_link_pages',
  noun: 'Link Page',
  display: {
    label: 'List Link Pages',
    description: 'Hidden — powers the link-page dropdown, not user-facing Zaps.',
    hidden: true,
  },
  operation: {
    perform,
    sample: {
      id: '8097029e-5895-4a48-b03c-2d7263c2d891',
      name: 'Brewhaus Coffee (nimply.link/brewhaus.coffee)',
      handle: 'brewhaus.coffee',
      status: 'PUBLISHED',
    },
    outputFields: [
      { key: 'id', label: 'Page ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'handle', label: 'Handle', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
    ],
  },
};
