const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  // Depends on the channel picked in the create action's form.
  const channelId = bundle.inputData.channelId;
  if (!channelId) return [];

  const response = await z.request({
    url: `${API_BASE_URL}/v1/channels/${channelId}/pinterest/boards`,
  });

  return response.data.map((board) => ({
    id: board.id,
    name: board.privacy === 'PUBLIC' ? board.name : `${board.name} (${board.privacy})`,
    privacy: board.privacy,
    pinCount: board.pinCount,
  }));
};

module.exports = {
  key: 'list_pinterest_boards',
  noun: 'Board',
  display: {
    label: 'List Pinterest Boards',
    description: 'Lists the boards of a Pinterest channel. Hidden — powers the board dropdown of Create Pinterest Pin.',
    hidden: true,
  },
  operation: {
    perform,
    sample: {
      id: '1022106146619699999',
      name: 'Product inspiration',
      privacy: 'PUBLIC',
      pinCount: 42,
    },
    outputFields: [
      { key: 'id', label: 'Board ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'privacy', label: 'Privacy', type: 'string' },
      { key: 'pinCount', label: 'Pin Count', type: 'integer' },
    ],
  },
};
