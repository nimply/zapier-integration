const crypto = require('crypto');
const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const { channelId, content, mediaIds, visibility, schedule } = bundle.inputData;

  const body = { channelId, content };
  if (mediaIds && mediaIds.length) body.mediaIds = mediaIds;
  if (visibility) body.visibility = visibility;
  if (schedule) body.schedule = schedule;

  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/v1/posts/linkedin`,
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body,
  });

  return response.data;
};

module.exports = {
  key: 'create_linkedin_post',
  noun: 'LinkedIn Post',
  display: {
    label: 'Create LinkedIn Post',
    description: 'Posts to a LinkedIn profile or company page with visibility control.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'channelId',
        label: 'LinkedIn Channel',
        type: 'string',
        required: true,
        dynamic: 'list_linkedin_channels.id.name',
        helpText: 'The connected LinkedIn profile or company page to post to.',
      },
      {
        key: 'content',
        label: 'Content',
        type: 'text',
        required: true,
        helpText: 'Post text (max 3000 characters).',
      },
      {
        key: 'mediaIds',
        label: 'Media',
        type: 'string',
        list: true,
        required: false,
        helpText: 'Up to 20 images or 1 video, in display order. Upload first with the Upload Media action.',
      },
      {
        key: 'visibility',
        label: 'Visibility',
        type: 'string',
        required: false,
        default: 'PUBLIC',
        choices: { PUBLIC: 'Public', CONNECTIONS: 'Connections Only' },
        helpText: 'Connections Only works on personal profiles.',
      },
      {
        key: 'schedule',
        label: 'Schedule',
        type: 'string',
        required: false,
        helpText:
          'When to publish: `draft` (default — create only), `next_slot`, `now`, or an ISO 8601 datetime like `2026-08-01T09:00:00.000Z`. Anything except `draft` requires the posts:publish scope.',
      },
    ],
    sample: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      channelId: '223e4567-e89b-12d3-a456-426614174001',
      content: 'Excited to share what we have been building.',
      title: null,
      contentType: 'POST',
      status: 'DRAFT',
      scheduledAt: null,
      publishedAt: null,
      createdAt: '2026-07-16T10:00:00.000Z',
      mediaIds: [],
    },
    outputFields: [
      { key: 'id', label: 'Post ID', type: 'string' },
      { key: 'channelId', label: 'Channel ID', type: 'string' },
      { key: 'content', label: 'Content', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'scheduledAt', label: 'Scheduled At', type: 'datetime' },
      { key: 'publishedAt', label: 'Published At', type: 'datetime' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
};
