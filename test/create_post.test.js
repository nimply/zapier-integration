/* globals describe, it, expect, beforeEach, afterEach */
const nock = require('nock');
const zapier = require('zapier-platform-core');
const App = require('../index');

const appTester = zapier.createAppTester(App);

const API = 'https://api.nimply.io';
const authData = { access_token: 'a_token', refresh_token: 'r_token' };

describe('creates.create_post', () => {
  beforeEach(() => nock.disableNetConnect());
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('creates a post with an Idempotency-Key and bearer auth', async () => {
    let capturedBody;
    let capturedHeaders;

    nock(API)
      .post('/v1/posts', (body) => {
        capturedBody = body;
        return true;
      })
      .reply(function (uri, body) {
        capturedHeaders = this.req.headers;
        return [
          201,
          [
            {
              id: 'post-1',
              channelId: 'chan-1',
              content: 'Hello world',
              title: null,
              contentType: 'POST',
              status: 'SCHEDULED',
              scheduledAt: '2026-08-01T09:00:00.000Z',
              publishedAt: null,
              createdAt: '2026-07-05T10:00:00.000Z',
              mediaIds: ['media-1'],
            },
            {
              id: 'post-2',
              channelId: 'chan-2',
              content: 'Hello world',
              title: null,
              contentType: 'POST',
              status: 'SCHEDULED',
              scheduledAt: '2026-08-01T09:00:00.000Z',
              publishedAt: null,
              createdAt: '2026-07-05T10:00:00.000Z',
              mediaIds: ['media-1'],
            },
          ],
        ];
      });

    const bundle = {
      authData,
      inputData: {
        channelIds: ['chan-1', 'chan-2'],
        content: 'Hello world',
        contentType: 'POST',
        mediaIds: ['media-1'],
        schedule: 'next_slot',
      },
    };

    const result = await appTester(App.creates.create_post.operation.perform, bundle);

    // Request body sent to the API
    expect(capturedBody).toEqual({
      channelIds: ['chan-1', 'chan-2'],
      content: 'Hello world',
      contentType: 'POST',
      mediaIds: ['media-1'],
      schedule: 'next_slot',
    });

    // Headers: idempotency key (uuid) + bearer token from middleware
    const idempotencyKey = capturedHeaders['idempotency-key'];
    expect(String(idempotencyKey)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(String(capturedHeaders.authorization)).toBe('Bearer a_token');

    // Result: first post flattened + full list
    expect(result.id).toBe('post-1');
    expect(result.status).toBe('SCHEDULED');
    expect(result.postCount).toBe(2);
    expect(result.posts).toHaveLength(2);
    expect(result.posts[1].channelId).toBe('chan-2');
  });

  it('omits optional fields that were not provided', async () => {
    let capturedBody;

    nock(API)
      .post('/v1/posts', (body) => {
        capturedBody = body;
        return true;
      })
      .reply(201, [
        {
          id: 'post-1',
          channelId: 'chan-1',
          content: null,
          title: null,
          contentType: 'POST',
          status: 'DRAFT',
          scheduledAt: null,
          publishedAt: null,
          createdAt: '2026-07-05T10:00:00.000Z',
          mediaIds: [],
        },
      ]);

    const bundle = { authData, inputData: { channelIds: ['chan-1'] } };
    const result = await appTester(App.creates.create_post.operation.perform, bundle);

    expect(capturedBody).toEqual({ channelIds: ['chan-1'] });
    expect(result.status).toBe('DRAFT');
    expect(result.postCount).toBe(1);
  });
});

describe('triggers hook perform (webhook envelope unwrap)', () => {
  it('merges envelope fields into the post payload without clobbering post fields', async () => {
    const bundle = {
      authData,
      cleanedRequest: {
        id: 'evt-1',
        type: 'post.published',
        createdAt: '2026-08-01T09:00:05.000Z',
        workspaceId: 'ws-1',
        data: {
          id: 'post-1',
          channelId: 'chan-1',
          content: 'Hello world',
          status: 'PUBLISHED',
          createdAt: '2026-07-05T10:00:00.000Z',
        },
      },
    };

    const results = await appTester(App.triggers.post_published.operation.perform, bundle);

    expect(results).toHaveLength(1);
    const [post] = results;
    expect(post.id).toBe('post-1'); // post id preserved
    expect(post.createdAt).toBe('2026-07-05T10:00:00.000Z');
    expect(post.event_id).toBe('evt-1');
    expect(post.event_type).toBe('post.published');
    expect(post.event_created_at).toBe('2026-08-01T09:00:05.000Z');
    expect(post.workspace_id).toBe('ws-1');
  });
});

describe('triggers hook subscribe/unsubscribe', () => {
  beforeEach(() => nock.disableNetConnect());
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('subscribes with the target URL and event, unsubscribes by stored id', async () => {
    let subscribeBody;
    nock(API)
      .post('/v1/webhooks', (body) => {
        subscribeBody = body;
        return true;
      })
      .reply(201, { id: 'wh-1', name: 'Zapier: post.failed', events: ['post.failed'] });

    const subscribeResult = await appTester(
      App.triggers.post_failed.operation.performSubscribe,
      { authData, targetUrl: 'https://hooks.zapier.com/abc' }
    );

    expect(subscribeBody).toEqual({
      name: 'Zapier: post.failed',
      url: 'https://hooks.zapier.com/abc',
      events: ['post.failed'],
    });
    expect(subscribeResult.id).toBe('wh-1');

    nock(API).delete('/v1/webhooks/wh-1').reply(200, { id: 'wh-1' });

    const unsubscribeResult = await appTester(
      App.triggers.post_failed.operation.performUnsubscribe,
      { authData, subscribeData: { id: 'wh-1' } }
    );
    expect(unsubscribeResult.id).toBe('wh-1');
  });
});
