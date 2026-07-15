const crypto = require('crypto');
const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const { channelIds, content, title, contentType, mediaIds, schedule } = bundle.inputData;

  const body = { channelIds };
  if (content) body.content = content;
  if (title) body.title = title;
  if (contentType) body.contentType = contentType;
  if (mediaIds && mediaIds.length) body.mediaIds = mediaIds;
  if (schedule) body.schedule = schedule;

  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/v1/posts`,
    headers: {
      // Makes Zapier retries safe — the API deduplicates on this key.
      'Idempotency-Key': crypto.randomUUID(),
    },
    body,
  });

  // The API returns one post per channel; a create must return an object.
  // Surface the first post's fields at the top level for easy mapping and
  // include the full list under `posts`.
  const posts = response.data;
  return { ...posts[0], posts, postCount: posts.length };
};

module.exports = {
  key: 'create_post',
  noun: 'Post',
  display: {
    label: 'Create Post',
    description: 'Creates a post on one or more connected channels (as a draft, scheduled, or published immediately).',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'channelIds',
        label: 'Channels',
        type: 'string',
        list: true,
        required: true,
        dynamic: 'list_channels.id.name',
        helpText: 'Channels to publish to (one post is created per channel). Pick from the list of connected channels, or map channel IDs from a previous step (e.g. the Find Channel search).',
      },
      {
        key: 'content',
        label: 'Content',
        type: 'text',
        required: false,
        helpText: 'Post text/caption.',
      },
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        required: false,
        helpText: 'Title — used by YouTube and Pinterest.',
      },
      {
        key: 'contentType',
        label: 'Content Type',
        type: 'string',
        required: false,
        default: 'POST',
        choices: ['POST', 'REEL', 'STORY', 'VIDEO'],
        helpText: 'Multiple media on a POST become a carousel.',
      },
      {
        key: 'mediaIds',
        label: 'Media',
        type: 'string',
        list: true,
        required: false,
        helpText: 'Media asset IDs in display order. Upload first with the Upload Media action.',
      },
      {
        key: 'schedule',
        label: 'Schedule',
        type: 'string',
        required: false,
        helpText:
          'When to publish: `draft` (default — create only), `next_slot` (next free posting-schedule slot per channel), `now` (publish immediately), or an ISO 8601 datetime like `2026-08-01T09:00:00.000Z`. Anything except `draft` requires the posts:publish scope.',
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
      postCount: 1,
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
      { key: 'postCount', label: 'Posts Created', type: 'integer' },
    ],
  },
};
