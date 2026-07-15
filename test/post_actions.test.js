/* globals describe, it, expect, beforeEach, afterEach */
const nock = require('nock');
const zapier = require('zapier-platform-core');
const App = require('../index');

const appTester = zapier.createAppTester(App);

const API = 'https://api.nimply.io';
const authData = { access_token: 'a_token', refresh_token: 'r_token' };

const apiPost = (overrides = {}) => ({
  id: 'post-1',
  channelId: 'chan-1',
  content: 'Hello world',
  title: null,
  contentType: 'POST',
  status: 'SCHEDULED',
  scheduledAt: '2026-08-01T09:00:00.000Z',
  publishedAt: null,
  createdAt: '2026-07-05T10:00:00.000Z',
  mediaIds: [],
  ...overrides,
});

describe('creates.schedule_post', () => {
  beforeEach(() => nock.disableNetConnect());
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('POSTs the scheduledAt body to /v1/posts/{id}/schedule', async () => {
    let capturedBody;

    nock(API)
      .post('/v1/posts/post-1/schedule', (body) => {
        capturedBody = body;
        return true;
      })
      .reply(200, apiPost());

    const bundle = {
      authData,
      inputData: { postId: 'post-1', scheduledAt: '2026-08-01T09:00:00.000Z' },
    };

    const result = await appTester(App.creates.schedule_post.operation.perform, bundle);

    expect(capturedBody).toEqual({ scheduledAt: '2026-08-01T09:00:00.000Z' });
    expect(result.id).toBe('post-1');
    expect(result.status).toBe('SCHEDULED');
    expect(result.scheduledAt).toBe('2026-08-01T09:00:00.000Z');
  });
});

describe('creates.unschedule_post', () => {
  beforeEach(() => nock.disableNetConnect());
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('POSTs to /v1/posts/{id}/unschedule and returns the draft post', async () => {
    nock(API)
      .post('/v1/posts/post-1/unschedule')
      .reply(200, apiPost({ status: 'DRAFT', scheduledAt: null }));

    const bundle = { authData, inputData: { postId: 'post-1' } };

    const result = await appTester(App.creates.unschedule_post.operation.perform, bundle);

    expect(result.id).toBe('post-1');
    expect(result.status).toBe('DRAFT');
    expect(result.scheduledAt).toBeNull();
  });
});

describe('creates.update_post', () => {
  beforeEach(() => nock.disableNetConnect());
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('throws a user-facing error when neither content nor title is provided', async () => {
    const bundle = { authData, inputData: { postId: 'post-1' } };

    await expect(
      appTester(App.creates.update_post.operation.perform, bundle)
    ).rejects.toThrow('Provide at least one field to update (Content or Title).');
  });

  it('PATCHes only the provided fields', async () => {
    let capturedBody;

    nock(API)
      .patch('/v1/posts/post-1', (body) => {
        capturedBody = body;
        return true;
      })
      .reply(200, apiPost({ content: 'Updated caption ✨' }));

    const bundle = {
      authData,
      inputData: { postId: 'post-1', content: 'Updated caption ✨' },
    };

    const result = await appTester(App.creates.update_post.operation.perform, bundle);

    expect(capturedBody).toEqual({ content: 'Updated caption ✨' });
    expect(result.content).toBe('Updated caption ✨');
  });
});

describe('searches.find_post', () => {
  beforeEach(() => nock.disableNetConnect());
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('passes the filters as query params and returns the data array', async () => {
    nock(API)
      .get('/v1/posts')
      .query({ status: 'SCHEDULED', channelId: 'chan-1', limit: 10 })
      .reply(200, {
        data: [apiPost(), apiPost({ id: 'post-2' })],
        nextCursor: null,
      });

    const bundle = {
      authData,
      inputData: { status: 'SCHEDULED', channelId: 'chan-1', limit: 10 },
    };

    const results = await appTester(App.searches.find_post.operation.perform, bundle);

    expect(Array.isArray(results)).toBe(true);
    expect(results).toHaveLength(2);
    expect(results[0].id).toBe('post-1');
    expect(results[1].id).toBe('post-2');
  });

  it('defaults the limit to 5 and omits empty filters', async () => {
    nock(API)
      .get('/v1/posts')
      .query({ limit: 5 })
      .reply(200, { data: [apiPost()], nextCursor: null });

    const results = await appTester(App.searches.find_post.operation.perform, {
      authData,
      inputData: {},
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('post-1');
  });
});

describe('searches.get_workspace_analytics', () => {
  beforeEach(() => nock.disableNetConnect());
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('wraps the summary object in an array with a stable id', async () => {
    nock(API)
      .get('/v1/analytics/workspace')
      .query({ from: '2026-06-01T00:00:00.000Z' })
      .reply(200, {
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-07-01T00:00:00.000Z',
        channelCount: 5,
        totalFollowers: 45210,
        avgEngagement: 3.9,
        postsPublished: 42,
        totalLikes: 8123,
        totalComments: 940,
        totalShares: 310,
      });

    const results = await appTester(App.searches.get_workspace_analytics.operation.perform, {
      authData,
      inputData: { from: '2026-06-01T00:00:00.000Z' },
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('workspace-analytics-2026-06-01T00:00:00.000Z');
    expect(results[0].totalFollowers).toBe(45210);
  });
});

describe('triggers.post_published (hook hydration)', () => {
  beforeEach(() => nock.disableNetConnect());
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  const envelope = {
    id: 'evt-1',
    type: 'post.published',
    createdAt: '2026-08-01T09:00:05.000Z',
    workspaceId: 'ws-1',
    data: {
      postId: 'post-1',
      channelId: 'chan-1',
      status: 'PUBLISHED',
      publishedAt: '2026-08-01T09:00:02.000Z',
      postUrl: 'https://instagram.com/p/abc',
      error: null,
    },
  };

  it('hydrates the full post so deliveries match the sample shape', async () => {
    nock(API)
      .get('/v1/posts/post-1')
      .reply(200, apiPost({ status: 'PUBLISHED', publishedAt: '2026-08-01T09:00:02.000Z' }));

    const results = await appTester(App.triggers.post_published.operation.perform, {
      authData,
      cleanedRequest: envelope,
    });

    expect(results).toHaveLength(1);
    const [post] = results;
    // Full post fields from the API (present in the static sample)
    expect(post.id).toBe('post-1');
    expect(post.content).toBe('Hello world');
    expect(post.contentType).toBe('POST');
    expect(post.createdAt).toBe('2026-07-05T10:00:00.000Z');
    expect(post.mediaIds).toEqual([]);
    // Event-only extras survive the merge
    expect(post.postUrl).toBe('https://instagram.com/p/abc');
    expect(post.event_id).toBe('evt-1');
    expect(post.event_type).toBe('post.published');
    expect(post.workspace_id).toBe('ws-1');
  });

  it('falls back to the raw event (with a dedupe id) if the post is gone', async () => {
    nock(API).get('/v1/posts/post-1').reply(404, { detail: 'Post not found' });

    const results = await appTester(App.triggers.post_published.operation.perform, {
      authData,
      cleanedRequest: envelope,
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('post-1');
    expect(results[0].channelId).toBe('chan-1');
    expect(results[0].event_id).toBe('evt-1');
  });
});

describe('triggers.channel_disconnected', () => {
  beforeEach(() => nock.disableNetConnect());
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('unwraps the envelope and dedupes on the channel id', async () => {
    const bundle = {
      authData,
      cleanedRequest: {
        id: 'evt-1',
        type: 'channel.disconnected',
        createdAt: '2026-08-01T09:00:05.000Z',
        workspaceId: 'ws-1',
        data: { channelId: 'chan-1', name: 'Acme Corp', type: 'INSTAGRAM_PROFESSIONAL' },
      },
    };

    const results = await appTester(
      App.triggers.channel_disconnected.operation.perform,
      bundle
    );

    expect(results).toHaveLength(1);
    const [channel] = results;
    expect(channel.id).toBe('chan-1');
    expect(channel.channelId).toBe('chan-1');
    expect(channel.name).toBe('Acme Corp');
    expect(channel.type).toBe('INSTAGRAM_PROFESSIONAL');
    expect(channel.event_id).toBe('evt-1');
    expect(channel.event_type).toBe('channel.disconnected');
    expect(channel.workspace_id).toBe('ws-1');
  });

  it('performList wraps live channels so the shape matches deliveries', async () => {
    nock(API)
      .get('/v1/channels')
      .reply(200, [
        {
          id: 'chan-1',
          name: 'Acme Corp',
          type: 'INSTAGRAM_PROFESSIONAL',
          createdAt: '2026-01-15T09:30:00.000Z',
        },
      ]);
    nock(API).get('/v1/workspace').reply(200, { id: 'ws-1', name: 'Acme' });

    const results = await appTester(
      App.triggers.channel_disconnected.operation.performList,
      { authData, inputData: {} }
    );

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('chan-1');
    expect(results[0].channelId).toBe('chan-1');
    expect(results[0].event_type).toBe('channel.disconnected');
    expect(results[0].workspace_id).toBe('ws-1');
  });
});
