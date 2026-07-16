const { API_BASE_URL } = require('../constants');

/**
 * Hidden triggers that power the platform-filtered channel dropdowns of the
 * platform-specific create actions (Create YouTube Video, etc.).
 */
const makePlatformChannelsTrigger = (key, label, types) => ({
  key,
  noun: 'Channel',
  display: {
    label,
    description: `Lists connected ${label.replace('List ', '').toLowerCase()}. Hidden — powers dynamic channel dropdowns, not user-facing Zaps.`,
    hidden: true,
  },
  operation: {
    perform: async (z) => {
      const response = await z.request({ url: `${API_BASE_URL}/v1/channels` });
      return response.data
        .filter((channel) => types.includes(channel.type))
        .map((channel) => ({
          id: channel.id,
          name: types.length > 1 ? `${channel.name} (${channel.type})` : channel.name,
          type: channel.type,
        }));
    },
    sample: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Acme Corp',
      type: types[0],
    },
    outputFields: [
      { key: 'id', label: 'Channel ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'type', label: 'Platform Type', type: 'string' },
    ],
  },
});

module.exports = {
  listYouTubeChannels: makePlatformChannelsTrigger(
    'list_youtube_channels',
    'List YouTube Channels',
    ['YOUTUBE'],
  ),
  listTikTokChannels: makePlatformChannelsTrigger(
    'list_tiktok_channels',
    'List TikTok Channels',
    ['TIKTOK_BUSINESS', 'TIKTOK_PERSONAL'],
  ),
  listPinterestChannels: makePlatformChannelsTrigger(
    'list_pinterest_channels',
    'List Pinterest Channels',
    ['PINTEREST'],
  ),
  listLinkedInChannels: makePlatformChannelsTrigger(
    'list_linkedin_channels',
    'List LinkedIn Channels',
    ['LINKEDIN_PROFILE', 'LINKEDIN_PAGE'],
  ),
};
