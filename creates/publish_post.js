const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/v1/posts/${bundle.inputData.postId}/publish`,
  });
  return response.data;
};

module.exports = {
  key: 'publish_post',
  noun: 'Post',
  display: {
    label: 'Publish Post Now',
    description: 'Queues a draft or scheduled post for immediate publishing.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'postId',
        label: 'Post',
        type: 'string',
        required: true,
        dynamic: 'list_posts.id.name',
        search: 'find_post.id',
        helpText:
          'ID of the draft or scheduled post to publish. The action returns the post as `SCHEDULED` — it publishes within a minute. Poll the post or use the Post Published trigger to know when it goes live.',
      },
    ],
    sample: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      channelId: '223e4567-e89b-12d3-a456-426614174001',
      content: 'Launching something new today 🚀',
      title: null,
      contentType: 'POST',
      status: 'SCHEDULED',
      scheduledAt: '2026-07-05T10:01:00.000Z',
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
