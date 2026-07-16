const crypto = require('crypto');
const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const {
    channelId,
    mediaIds,
    privacyLevel,
    title,
    content,
    allowComments,
    allowDuet,
    allowStitch,
    brandContent,
    brandOrganic,
    schedule,
  } = bundle.inputData;

  const body = { channelId, mediaIds, privacyLevel };
  if (title) body.title = title;
  if (content) body.content = content;
  if (allowComments !== undefined) body.allowComments = allowComments;
  if (allowDuet !== undefined) body.allowDuet = allowDuet;
  if (allowStitch !== undefined) body.allowStitch = allowStitch;
  if (brandContent !== undefined) body.brandContent = brandContent;
  if (brandOrganic !== undefined) body.brandOrganic = brandOrganic;
  if (schedule) body.schedule = schedule;

  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/v1/posts/tiktok`,
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body,
  });

  return response.data;
};

module.exports = {
  key: 'create_tiktok_post',
  noun: 'TikTok Post',
  display: {
    label: 'Create TikTok Post',
    description: 'Posts a video or photos to TikTok with privacy level, comment/Duet/Stitch settings, and commercial-content disclosure.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'channelId',
        label: 'TikTok Channel',
        type: 'string',
        required: true,
        dynamic: 'list_tiktok_channels.id.name',
        helpText: 'The connected TikTok account to post to.',
      },
      {
        key: 'mediaIds',
        label: 'Media',
        type: 'string',
        list: true,
        required: true,
        helpText: '1 video or up to 35 photos, in display order. Upload first with the Upload Media action.',
      },
      {
        key: 'privacyLevel',
        label: 'Privacy Level',
        type: 'string',
        required: true,
        dynamic: 'list_tiktok_privacy_levels.id.name',
        helpText: 'Who can view the post. Only the levels the account allows are listed.',
      },
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        required: false,
        helpText: 'Post title (max 100 characters).',
      },
      {
        key: 'content',
        label: 'Caption',
        type: 'text',
        required: false,
      },
      {
        key: 'allowComments',
        label: 'Allow Comments',
        type: 'boolean',
        required: false,
        helpText: 'Defaults to false.',
      },
      {
        key: 'allowDuet',
        label: 'Allow Duet',
        type: 'boolean',
        required: false,
        helpText: 'Video posts only. Defaults to false.',
      },
      {
        key: 'allowStitch',
        label: 'Allow Stitch',
        type: 'boolean',
        required: false,
        helpText: 'Video posts only. Defaults to false.',
      },
      {
        key: 'brandContent',
        label: 'Branded Content',
        type: 'boolean',
        required: false,
        helpText: 'Disclose the post as branded content (paid partnership). Not allowed with Only Me privacy.',
      },
      {
        key: 'brandOrganic',
        label: 'Your Brand',
        type: 'boolean',
        required: false,
        helpText: 'Disclose the post as promoting your own brand or business.',
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
      content: 'Behind the scenes 🎬',
      title: null,
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
      { key: 'content', label: 'Caption', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'scheduledAt', label: 'Scheduled At', type: 'datetime' },
      { key: 'publishedAt', label: 'Published At', type: 'datetime' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
};
