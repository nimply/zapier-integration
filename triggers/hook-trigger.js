const { API_BASE_URL } = require('../constants');

// Nimply delivers webhook events wrapped in an envelope:
//   { id, type, createdAt, workspaceId, data }
// where `data` is the resource (a post, for the events we subscribe to).
// We return the resource with the envelope fields merged in under
// non-colliding keys so `id`/`createdAt` still refer to the post itself.
const unwrapEnvelope = (envelope) => {
  const { data = {}, id, type, createdAt, workspaceId } = envelope || {};
  return {
    ...data,
    event_id: id,
    event_type: type,
    event_created_at: createdAt,
    workspace_id: workspaceId,
  };
};

const postOutputFields = [
  { key: 'id', label: 'Post ID', type: 'string' },
  { key: 'channelId', label: 'Channel ID', type: 'string' },
  { key: 'content', label: 'Content', type: 'string' },
  { key: 'title', label: 'Title', type: 'string' },
  { key: 'contentType', label: 'Content Type', type: 'string' },
  { key: 'status', label: 'Status', type: 'string' },
  { key: 'scheduledAt', label: 'Scheduled At', type: 'datetime' },
  { key: 'publishedAt', label: 'Published At', type: 'datetime' },
  { key: 'createdAt', label: 'Created At', type: 'datetime' },
  { key: 'mediaIds[]', label: 'Media IDs' },
  { key: 'event_id', label: 'Event ID', type: 'string' },
  { key: 'event_type', label: 'Event Type', type: 'string' },
  { key: 'event_created_at', label: 'Event Created At', type: 'datetime' },
  { key: 'workspace_id', label: 'Workspace ID', type: 'string' },
];

const samplePost = (event, status, publishedAt) => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  channelId: '223e4567-e89b-12d3-a456-426614174001',
  content: 'Launching something new today 🚀',
  title: null,
  contentType: 'POST',
  status,
  scheduledAt: '2026-08-01T09:00:00.000Z',
  publishedAt,
  createdAt: '2026-07-05T10:00:00.000Z',
  mediaIds: [],
  event_id: '323e4567-e89b-12d3-a456-426614174002',
  event_type: event,
  event_created_at: '2026-08-01T09:00:05.000Z',
  workspace_id: '423e4567-e89b-12d3-a456-426614174003',
});

// Builds a REST-hook trigger for one Nimply webhook event.
const buildHookTrigger = ({
  key,
  event,
  postStatus,
  label,
  description,
  publishedAtSample = null,
  extraOutputFields = [],
}) => {
  const performSubscribe = async (z, bundle) => {
    const response = await z.request({
      method: 'POST',
      url: `${API_BASE_URL}/v1/webhooks`,
      body: {
        name: `Zapier: ${event}`,
        url: bundle.targetUrl,
        events: [event],
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

  // Called when Nimply POSTs an event to bundle.targetUrl. The envelope's
  // `data` is a lean event payload ({postId, channelId, ...}), while the
  // sample and performList expose the full post — so hydrate the post from
  // the API to keep every delivery shape-identical to the samples.
  const perform = async (z, bundle) => {
    const eventData = unwrapEnvelope(bundle.cleanedRequest);
    const postId = eventData.postId || eventData.id;
    if (!postId) {
      return [eventData];
    }
    try {
      const response = await z.request({
        url: `${API_BASE_URL}/v1/posts/${postId}`,
      });
      // Post fields win on collision (status, scheduledAt, publishedAt);
      // event-only extras (postUrl, error, comment) and event_* survive.
      return [{ ...eventData, ...response.data }];
    } catch (error) {
      // The post may have been deleted between the event and this delivery —
      // fall back to the raw event rather than dropping it.
      return [{ id: postId, ...eventData }];
    }
  };

  // Used by the Zap editor to pull real sample data.
  const performList = async (z, bundle) => {
    const [postsResponse, workspaceResponse] = await Promise.all([
      z.request({
        url: `${API_BASE_URL}/v1/posts`,
        params: { status: postStatus, limit: 3 },
      }),
      z.request({ url: `${API_BASE_URL}/v1/workspace` }),
    ]);

    return postsResponse.data.data.map((post) =>
      unwrapEnvelope({
        id: post.id,
        type: event,
        createdAt: post.publishedAt || post.createdAt,
        workspaceId: workspaceResponse.data.id,
        data: post,
      })
    );
  };

  return {
    key,
    noun: 'Post',
    display: { label, description },
    operation: {
      type: 'hook',
      performSubscribe,
      performUnsubscribe,
      perform,
      performList,
      sample: samplePost(event, postStatus, publishedAtSample),
      outputFields: [...postOutputFields, ...extraOutputFields],
    },
  };
};

module.exports = { buildHookTrigger, unwrapEnvelope };
