const { API_BASE_URL } = require('../constants');

const perform = async (z, bundle) => {
  const body = { url: bundle.inputData.url };
  if (bundle.inputData.name) body.name = bundle.inputData.name;

  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/v1/media`,
    body,
  });
  return response.data;
};

module.exports = {
  key: 'upload_media',
  noun: 'Media',
  display: {
    label: 'Upload Media',
    description: 'Uploads a file into the workspace media library — map a file from a previous step (Drive, Gmail, forms…) or paste a public URL. Use the returned media ID when creating posts.',
  },
  operation: {
    perform,
    inputFields: [
      {
        // `file` type: Zapier hands the perform a URL for any mapped file
        // (hydration link) or pasted URL — both are fetched server-side by
        // Nimply, so true binary files from other apps work natively.
        key: 'url',
        label: 'File',
        type: 'file',
        required: true,
        helpText: 'Map a file from a previous step, or paste a public http(s) URL.',
      },
      {
        key: 'name',
        label: 'File Name',
        type: 'string',
        required: false,
        helpText: 'File name to store (recommended when mapping files — e.g. "banner.png"). Defaults to the URL basename.',
      },
    ],
    sample: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'launch-banner.png',
      type: 'IMAGE',
      url: 'https://cdn.nimply.io/media/launch-banner.png?sig=...',
      thumbnailUrl: null,
      size: 245760,
      createdAt: '2026-07-05T10:00:00.000Z',
    },
    outputFields: [
      { key: 'id', label: 'Media ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'type', label: 'Type', type: 'string' },
      { key: 'url', label: 'URL (signed, expires in 24h)', type: 'string' },
      { key: 'thumbnailUrl', label: 'Thumbnail URL', type: 'string' },
      { key: 'size', label: 'Size (bytes)', type: 'integer' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
    ],
  },
};
