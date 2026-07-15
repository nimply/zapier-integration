const { API_BASE_URL } = require('../constants');

const label = (post) => {
  const text = post.content ? String(post.content).slice(0, 60) : '(no text)';
  return `${text} [${post.status}]`;
};

// Builds a hidden polling trigger that powers a post dropdown, optionally
// restricted to one status so actions only offer posts they can act on
// (e.g. Request Approval → drafts only).
const buildPostDropdown = ({ key, status, displayLabel, sampleStatus }) => {
  const perform = async (z, bundle) => {
    const response = await z.request({
      url: `${API_BASE_URL}/v1/posts`,
      params: status ? { status } : {},
    });

    return response.data.data.map((post) => ({
      id: post.id,
      name: label(post),
      status: post.status,
    }));
  };

  return {
    key,
    noun: 'Post',
    display: {
      label: displayLabel,
      description: 'Hidden — powers dynamic post dropdowns, not user-facing Zaps.',
      hidden: true,
    },
    operation: {
      perform,
      sample: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: `Launching something new today 🚀 [${sampleStatus}]`,
        status: sampleStatus,
      },
      outputFields: [
        { key: 'id', label: 'Post ID', type: 'string' },
        { key: 'name', label: 'Name', type: 'string' },
        { key: 'status', label: 'Status', type: 'string' },
      ],
    },
  };
};

module.exports = { buildPostDropdown };
