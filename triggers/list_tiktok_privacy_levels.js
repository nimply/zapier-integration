const { API_BASE_URL } = require('../constants');

const LABELS = {
  PUBLIC_TO_EVERYONE: 'Public',
  MUTUAL_FOLLOW_FRIENDS: 'Friends',
  FOLLOWER_OF_CREATOR: 'Followers',
  SELF_ONLY: 'Only Me',
};

const perform = async (z, bundle) => {
  // Depends on the channel picked in the create action's form.
  const channelId = bundle.inputData.channelId;
  if (!channelId) return [];

  const response = await z.request({
    url: `${API_BASE_URL}/v1/channels/${channelId}/tiktok/creator-info`,
  });

  return response.data.privacyLevelOptions.map((level) => ({
    id: level,
    name: LABELS[level] || level,
  }));
};

module.exports = {
  key: 'list_tiktok_privacy_levels',
  noun: 'Privacy Level',
  display: {
    label: 'List TikTok Privacy Levels',
    description: 'Lists the privacy levels a TikTok account may post with. Hidden — powers the privacy dropdown of Create TikTok Post.',
    hidden: true,
  },
  operation: {
    perform,
    sample: { id: 'PUBLIC_TO_EVERYONE', name: 'Public' },
    outputFields: [
      { key: 'id', label: 'Privacy Level', type: 'string' },
      { key: 'name', label: 'Label', type: 'string' },
    ],
  },
};
