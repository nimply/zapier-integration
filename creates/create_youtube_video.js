const crypto = require('crypto');
const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const {
    channelId,
    title,
    mediaId,
    description,
    videoType,
    category,
    visibility,
    license,
    notifySubscribers,
    allowEmbedding,
    madeForKids,
    schedule,
  } = bundle.inputData;

  const body = { channelId, title, mediaId };
  if (description) body.description = description;
  if (videoType) body.videoType = videoType;
  if (category) body.category = category;
  if (visibility) body.visibility = visibility;
  if (license) body.license = license;
  if (notifySubscribers !== undefined) body.notifySubscribers = notifySubscribers;
  if (allowEmbedding !== undefined) body.allowEmbedding = allowEmbedding;
  if (madeForKids !== undefined) body.madeForKids = madeForKids;
  if (schedule) body.schedule = schedule;

  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/v1/posts/youtube`,
    headers: { 'Idempotency-Key': crypto.randomUUID() },
    body,
  });

  return response.data;
};

module.exports = {
  key: 'create_youtube_video',
  noun: 'YouTube Video',
  display: {
    label: 'Create YouTube Video',
    description: 'Uploads a video (or Short) to a YouTube channel with full video options: category, visibility, license, and more.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'channelId',
        label: 'YouTube Channel',
        type: 'string',
        required: true,
        dynamic: 'list_youtube_channels.id.name',
        helpText: 'The connected YouTube channel to upload to.',
      },
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        required: true,
        helpText: 'Video title (required by YouTube, max 100 characters).',
      },
      {
        key: 'mediaId',
        label: 'Video Media',
        type: 'string',
        required: true,
        helpText: 'Media asset ID of the video. Upload first with the Upload Media action.',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        required: false,
        helpText: 'Video description.',
      },
      {
        key: 'videoType',
        label: 'Video Type',
        type: 'string',
        required: false,
        default: 'video',
        choices: { video: 'Video', short: 'Short' },
        helpText: 'Regular video upload or a YouTube Short.',
      },
      {
        key: 'category',
        label: 'Category',
        type: 'string',
        required: false,
        default: '22',
        choices: {
          1: 'Film & Animation',
          2: 'Autos & Vehicles',
          10: 'Music',
          15: 'Pets & Animals',
          17: 'Sports',
          19: 'Travel & Events',
          20: 'Gaming',
          22: 'People & Blogs',
          23: 'Comedy',
          24: 'Entertainment',
          25: 'News & Politics',
          26: 'Howto & Style',
          27: 'Education',
          28: 'Science & Technology',
        },
      },
      {
        key: 'visibility',
        label: 'Visibility',
        type: 'string',
        required: false,
        default: 'public',
        choices: { public: 'Public', unlisted: 'Unlisted', private: 'Private' },
      },
      {
        key: 'license',
        label: 'License',
        type: 'string',
        required: false,
        default: 'youtube',
        choices: { youtube: 'Standard YouTube License', creativeCommon: 'Creative Commons' },
      },
      {
        key: 'notifySubscribers',
        label: 'Notify Subscribers',
        type: 'boolean',
        required: false,
        helpText: 'Notify channel subscribers about the new video. Defaults to true.',
      },
      {
        key: 'allowEmbedding',
        label: 'Allow Embedding',
        type: 'boolean',
        required: false,
        helpText: 'Allow the video to be embedded on other sites. Defaults to true.',
      },
      {
        key: 'madeForKids',
        label: 'Made for Kids',
        type: 'boolean',
        required: false,
        helpText: 'Self-declare the video as made for kids (COPPA). Defaults to false.',
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
      content: 'Behind the scenes of our launch.',
      title: 'How we built our launch in 7 days',
      contentType: 'VIDEO',
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
      { key: 'contentType', label: 'Content Type', type: 'string' },
      { key: 'status', label: 'Status', type: 'string' },
      { key: 'scheduledAt', label: 'Scheduled At', type: 'datetime' },
      { key: 'publishedAt', label: 'Published At', type: 'datetime' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
};
