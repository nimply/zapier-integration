const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const body = {};
  if (bundle.inputData.comment) body.comment = bundle.inputData.comment;

  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/v1/posts/${bundle.inputData.postId}/approve`,
    body,
  });
  return response.data;
};

module.exports = {
  key: 'approve_post',
  noun: 'Post',
  display: {
    label: 'Approve Post',
    description: 'Approves a PENDING_APPROVAL post: it returns to SCHEDULED (if it has a future publish time) or DRAFT.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'postId',
        label: 'Post',
        type: 'string',
        required: true,
        dynamic: 'list_pending_posts.id.name',
        search: 'find_post.id',
        helpText: 'ID of the post awaiting approval. Only `PENDING_APPROVAL` posts can be approved.',
      },
      {
        key: 'comment',
        label: 'Comment',
        type: 'text',
        required: false,
        helpText: 'Optional feedback recorded with the decision.',
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
