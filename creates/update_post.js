const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const { postId, content, title } = bundle.inputData;

  const body = {};
  if (content) body.content = content;
  if (title) body.title = title;

  if (!Object.keys(body).length) {
    throw new z.errors.Error(
      'Provide at least one field to update (Content or Title).',
      'InvalidData',
      400
    );
  }

  const response = await z.request({
    method: 'PATCH',
    url: `${API_BASE_URL}/v1/posts/${postId}`,
    body,
  });
  return response.data;
};

module.exports = {
  key: 'update_post',
  noun: 'Post',
  display: {
    label: 'Update Post',
    description: 'Edits the content and/or title of a draft or scheduled post. Published posts cannot be edited.',
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
        helpText: 'ID of the draft or scheduled post to edit.',
      },
      {
        key: 'content',
        label: 'Content',
        type: 'text',
        required: false,
        helpText: 'New post text/caption. Provide at least one of Content or Title.',
      },
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        required: false,
        helpText: 'New title — used by YouTube and Pinterest.',
      },
    ],
    sample: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      channelId: '223e4567-e89b-12d3-a456-426614174001',
      content: 'Updated caption ✨',
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
