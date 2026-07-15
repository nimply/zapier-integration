const { API_BASE_URL } = require('../constants');
const { unwrapEnvelope } = require('./hook-trigger');

// channel.disconnected deliveries carry { channelId, name, type } as the
// envelope's `data` (the channel record itself is already gone), so the
// unwrapped payload has no `id` of its own — dedupe on the channel id.
const withId = (result) => ({ ...result, id: result.channelId });

const performSubscribe = async (z, bundle) => {
  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/v1/webhooks`,
    body: {
      name: 'Zapier: channel.disconnected',
      url: bundle.targetUrl,
      events: ['channel.disconnected'],
    },
  });
  // The returned object (including `id`) is stored as bundle.subscribeData.
  return response.data;
};

const performUnsubscribe = async (z, bundle) => {
  const hookId = bundle.subscribeData.id;
  await z.request({
    method: 'DELETE',
    url: `${API_BASE_URL}/v1/webhooks/${hookId}`,
  });
  return { id: hookId };
};

// Called when Nimply POSTs an event to bundle.targetUrl.
const perform = (z, bundle) => [withId(unwrapEnvelope(bundle.cleanedRequest))];

// Used by the Zap editor to pull real sample data: currently connected
// channels wrapped in fake envelopes so the shape matches live deliveries.
const performList = async (z, bundle) => {
  const [channelsResponse, workspaceResponse] = await Promise.all([
    z.request({ url: `${API_BASE_URL}/v1/channels` }),
    z.request({ url: `${API_BASE_URL}/v1/workspace` }),
  ]);

  return channelsResponse.data.slice(0, 3).map((channel) =>
    withId(
      unwrapEnvelope({
        id: channel.id,
        type: 'channel.disconnected',
        createdAt: channel.createdAt,
        workspaceId: workspaceResponse.data.id,
        data: { channelId: channel.id, name: channel.name, type: channel.type },
      })
    )
  );
};

module.exports = {
  key: 'channel_disconnected',
  noun: 'Channel',
  display: {
    label: 'Channel Disconnected',
    description: 'Triggers when a social channel is disconnected from the workspace.',
  },
  operation: {
    type: 'hook',
    performSubscribe,
    performUnsubscribe,
    perform,
    performList,
    sample: {
      id: '223e4567-e89b-12d3-a456-426614174001',
      channelId: '223e4567-e89b-12d3-a456-426614174001',
      name: 'Acme Corp',
      type: 'INSTAGRAM_PROFESSIONAL',
      event_id: '323e4567-e89b-12d3-a456-426614174002',
      event_type: 'channel.disconnected',
      event_created_at: '2026-08-01T09:00:05.000Z',
      workspace_id: '423e4567-e89b-12d3-a456-426614174003',
    },
    outputFields: [
      { key: 'id', label: 'Channel ID', type: 'string' },
      { key: 'channelId', label: 'Channel ID', type: 'string' },
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'type', label: 'Platform Type', type: 'string' },
      { key: 'event_id', label: 'Event ID', type: 'string' },
      { key: 'event_type', label: 'Event Type', type: 'string' },
      { key: 'event_created_at', label: 'Event Created At', type: 'datetime' },
      { key: 'workspace_id', label: 'Workspace ID', type: 'string' },
    ],
  },
};
