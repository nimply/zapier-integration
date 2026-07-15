const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const response = await z.request({
    method: 'DELETE',
    url: `${API_BASE_URL}/v1/posts/${bundle.inputData.postId}`,
  });
  return response.data;
};

module.exports = {
  key: 'delete_post',
  noun: 'Post',
  display: {
    label: 'Delete Post',
    description: 'Deletes a draft or scheduled post. Published posts cannot be deleted via the API.',
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
        helpText: 'ID of the draft or scheduled post to delete.',
      },
    ],
    sample: {
      id: '123e4567-e89b-12d3-a456-426614174000',
    },
    outputFields: [{ key: 'id', label: 'Post ID', type: 'string' }],
  },
};
