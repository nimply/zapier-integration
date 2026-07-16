const crypto = require('crypto');
const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const { channelId, boardId, mediaIds, title, content, link, altText, schedule } =
    bundle.inputData;

  const body = { channelId, boardId, mediaIds };
  if (title) body.title = title;
  if (content) body.content = content;
  if (link) body.link = link;
  if (altText) body.altText = altText;
  if (schedule) body.schedule = schedule;

  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/v1/posts/pinterest`,
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body,
  });

  return response.data;
};

module.exports = {
  key: 'create_pinterest_pin',
  noun: 'Pinterest Pin',
  display: {
    label: 'Create Pinterest Pin',
    description: 'Creates a pin on a specific Pinterest board, with an optional destination link and alt text.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'channelId',
        label: 'Pinterest Channel',
        type: 'string',
        required: true,
        dynamic: 'list_pinterest_channels.id.name',
        helpText: 'The connected Pinterest account to pin with.',
      },
      {
        key: 'boardId',
        label: 'Board',
        type: 'string',
        required: true,
        dynamic: 'list_pinterest_boards.id.name',
        helpText: 'The board to pin to. Pick a channel first to load its boards.',
      },
      {
        key: 'mediaIds',
        label: 'Media',
        type: 'string',
        list: true,
        required: true,
        helpText: 'Up to 5 images (carousel) or 1 video, in display order. Upload first with the Upload Media action.',
      },
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        required: false,
        helpText: 'Pin title (max 100 characters).',
      },
      {
        key: 'content',
        label: 'Description',
        type: 'text',
        required: false,
        helpText: 'Pin description.',
      },
      {
        key: 'link',
        label: 'Destination Link',
        type: 'string',
        required: false,
        helpText: 'URL the pin links to.',
      },
      {
        key: 'altText',
        label: 'Alt Text',
        type: 'string',
        required: false,
        helpText: 'Alt text for accessibility (max 500 characters).',
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
      content: 'Our favorite workspace setups.',
      title: 'Workspace inspiration',
      contentType: 'POST',
      status: 'DRAFT',
      scheduledAt: null,
      publishedAt: null,
      createdAt: '2026-07-16T10:00:00.000Z',
      mediaIds: ['323e4567-e89b-12d3-a456-426614174002'],
    },
    outputFields: [
      { key: 'id', label: 'Post ID', type: 'string' },
      { key: 'channelId', label: 'Channel ID', type: 'string' },
      { key: 'title', label: 'Title', type: 'string' },
      { key: 'content', label: 'Description', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'scheduledAt', label: 'Scheduled At', type: 'datetime' },
      { key: 'publishedAt', label: 'Published At', type: 'datetime' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
};
