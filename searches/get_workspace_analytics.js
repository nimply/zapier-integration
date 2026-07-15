const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const { from, to } = bundle.inputData;

  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;

  const response = await z.request({
    url: `${API_BASE_URL}/v1/analytics/workspace`,
    params,
  });

  // Searches must return an array of objects with ids; the API returns one
  // summary object, so wrap it and derive a stable id from the range start.
  return [{ id: `workspace-analytics-${from || 'default'}`, ...response.data }];
};

module.exports = {
  key: 'get_workspace_analytics',
  noun: 'Analytics Summary',
  display: {
    label: 'Get Workspace Analytics',
    description: 'Gets aggregated metrics across all channels: followers, engagement, and post totals. Defaults to the last 30 days.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'from',
        label: 'From',
        type: 'datetime',
        required: false,
        helpText: 'Range start (ISO 8601). Defaults to 30 days ago.',
      },
      {
        key: 'to',
        label: 'To',
        type: 'datetime',
        required: false,
        helpText: 'Range end (ISO 8601). Defaults to now.',
      },
    ],
    sample: {
      id: 'workspace-analytics-default',
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-07-01T00:00:00.000Z',
      channelCount: 5,
      totalFollowers: 45210,
      avgEngagement: 3.9,
      postsPublished: 42,
      totalLikes: 8123,
      totalComments: 940,
      totalShares: 310,
    },
    outputFields: [
      { key: 'id', label: 'Summary ID', type: 'string' },
      { key: 'from', label: 'Range Start', type: 'datetime' },
      { key: 'to', label: 'Range End', type: 'datetime' },
      { key: 'channelCount', label: 'Channel Count', type: 'integer' },
      { key: 'totalFollowers', label: 'Total Followers', type: 'integer' },
      { key: 'avgEngagement', label: 'Average Engagement (%)', type: 'number' },
      { key: 'postsPublished', label: 'Posts Published', type: 'integer' },
      { key: 'totalLikes', label: 'Total Likes', type: 'integer' },
      { key: 'totalComments', label: 'Total Comments', type: 'integer' },
      { key: 'totalShares', label: 'Total Shares', type: 'integer' },
    ],
  },
};
