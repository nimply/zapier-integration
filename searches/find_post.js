const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const { status, channelId, limit } = bundle.inputData;

  const params = { limit: limit || 5 };
  if (status) params.status = status;
  if (channelId) params.channelId = channelId;

  const response = await z.request({
    url: `${API_BASE_URL}/v1/posts`,
    params,
  });

  // The API returns { data: [...], nextCursor }; searches return the array.
  return response.data.data;
};

module.exports = {
  key: 'find_post',
  noun: 'Post',
  display: {
    label: 'Find Post',
    description: 'Finds recent posts, optionally filtered by status and/or channel (newest first).',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'status',
        label: 'Status',
        type: 'string',
        required: false,
        choices: ['DRAFT', 'PENDING_APPROVAL', 'SCHEDULED', 'PUBLISHED', 'FAILED', 'ARCHIVED'],
        helpText: 'Only return posts with this status.',
      },
      {
        key: 'channelId',
        label: 'Channel',
        type: 'string',
        required: false,
        dynamic: 'list_channels.id.name',
        helpText: 'Only return posts for this channel. Pick from the list or map a channel ID from a previous step.',
      },
      {
        key: 'limit',
        label: 'Limit',
        type: 'integer',
        required: false,
        default: '5',
        helpText: 'Maximum number of posts to return (1–100).',
      },
    ],
    sample: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      channelId: '223e4567-e89b-12d3-a456-426614174001',
      content: 'Launching something new today 🚀',
      title: null,
      contentType: 'POST',
      status: 'SCHEDULED',
      scheduledAt: '2026-08-01T09:00:00.000Z',
      publishedAt: null,
      createdAt: '2026-07-05T10:00:00.000Z',
      mediaIds: [],
    },
    outputFields: [
      { key: 'id', label: 'Post ID', type: 'string' },
      { key: 'channelId', label: 'Channel ID', type: 'string' },
      { key: 'content', label: 'Content', type: 'string' },
      { key: 'title', label: 'Title', type: 'string' },
      { key: 'contentType', label: 'Content Type', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'scheduledAt', label: 'Scheduled At', type: 'datetime' },
      { key: 'publishedAt', label: 'Published At', type: 'datetime' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
};
