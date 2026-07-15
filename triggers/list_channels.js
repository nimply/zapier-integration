const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const response = await z.request({ url: `${API_BASE_URL}/v1/channels` });

  return response.data.map((channel) => ({
    id: channel.id,
    name: `${channel.name} (${channel.type})`,
    type: channel.type,
  }));
};

module.exports = {
  key: 'list_channels',
  noun: 'Channel',
  display: {
    label: 'List Channels',
    description: 'Lists connected channels. Hidden — powers dynamic channel dropdowns, not user-facing Zaps.',
    hidden: true,
  },
  operation: {
    perform,
    sample: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Acme Corp (INSTAGRAM_PROFESSIONAL)',
      type: 'INSTAGRAM_PROFESSIONAL',
    },
    outputFields: [
      { key: 'id', label: 'Channel ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'type', label: 'Platform Type', type: 'string' },
    ],
  },
};
