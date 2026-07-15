const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const response = await z.request({ url: `${API_BASE_URL}/v1/channels` });

  const query = (bundle.inputData.name || '').toLowerCase();
  return response.data
    .filter((channel) => channel.name && channel.name.toLowerCase().includes(query))
    .map((channel) => ({
      id: channel.id,
      name: channel.name,
      type: channel.type,
    }));
};

module.exports = {
  key: 'find_channel',
  noun: 'Channel',
  display: {
    label: 'Find Channel',
    description: 'Finds a connected social channel by name. Leave the name empty to return all connected channels.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'name',
        label: 'Channel Name',
        type: 'string',
        required: false,
        helpText: 'Full or partial channel name (case-insensitive contains match). Leave empty to return ALL connected channels.',
      },
    ],
    sample: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Acme Corp',
      type: 'INSTAGRAM_PROFESSIONAL',
    },
    outputFields: [
      { key: 'id', label: 'Channel ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'type', label: 'Platform Type', type: 'string' },
    ],
  },
};
