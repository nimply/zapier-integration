# Nimply Zapier Integration

Zapier Platform CLI app for the [Nimply API](https://developer.nimply.io/docs/api-reference) — see the [developer docs](https://developer.nimply.io) for the full OpenAPI spec and guides.

Built with `zapier-platform-core` **19.0.0** (plain JavaScript, `zapier init` conventions). Note: since v19 the CLI binary is named **`zapier-platform`** (not `zapier`) — use `npx zapier-platform <cmd>` with the local devDependency, or `npm i -g zapier-platform-cli`.

## What's included

| Type | Key | Notes |
|---|---|---|
| Trigger (REST hook) | `post_published` | Subscribes to the `post.published` webhook event |
| Trigger (REST hook) | `post_failed` | `post.failed` event |
| Trigger (REST hook) | `post_approval_requested` | `post.approval_requested` event |
| Trigger (REST hook) | `post_approved` | `post.approved` event |
| Trigger (REST hook) | `post_rejected` | `post.rejected` event |
| Trigger (REST hook) | `channel_disconnected` | `channel.disconnected` event; payload is `{channelId, name, type}` (dedupe `id` = channel id) |
| Trigger (polling, hidden) | `list_channels` | `GET /v1/channels` — powers dynamic channel dropdowns only |
| Trigger (polling, hidden) | `list_posts` | `GET /v1/posts` — powers dynamic post dropdowns only |
| Trigger (polling, hidden) | `list_draft_posts` / `list_pending_posts` / `list_scheduled_posts` | Status-filtered dropdown sources for actions that only accept posts in one state |
| Trigger (polling, hidden) | `list_youtube_channels` / `list_tiktok_channels` / `list_pinterest_channels` / `list_linkedin_channels` | Platform-filtered channel dropdown sources for the platform-specific creates |
| Trigger (polling, hidden) | `list_pinterest_boards` | `GET /v1/channels/{id}/pinterest/boards` — board dropdown for Create Pinterest Pin (reads `channelId` from the form) |
| Trigger (polling, hidden) | `list_tiktok_privacy_levels` | `GET /v1/channels/{id}/tiktok/creator-info` — privacy dropdown for Create TikTok Post (reads `channelId` from the form) |
| Create | `create_post` | `POST /v1/posts` with an `Idempotency-Key` header; `schedule` supports `draft` / `next_slot` / `now` / ISO 8601 |
| Create | `create_youtube_video` | `POST /v1/posts/youtube` — title (required), video/Short, category, visibility, license, notify subscribers, embedding, made-for-kids |
| Create | `create_tiktok_post` | `POST /v1/posts/tiktok` — privacy level (required, dynamic), comments/Duet/Stitch toggles, branded-content disclosure |
| Create | `create_pinterest_pin` | `POST /v1/posts/pinterest` — board (required, dynamic), destination link, alt text |
| Create | `create_linkedin_post` | `POST /v1/posts/linkedin` — content (required), media, visibility PUBLIC/CONNECTIONS |
| Create | `upload_media` | `POST /v1/media` (import from public URL) |
| Create | `schedule_post` | `POST /v1/posts/{id}/schedule` (`{scheduledAt}`, future ISO 8601) |
| Create | `unschedule_post` | `POST /v1/posts/{id}/unschedule` — `SCHEDULED` → `DRAFT`, clears the publish time |
| Create | `publish_post` | `POST /v1/posts/{id}/publish` — returns `SCHEDULED`, publishes within a minute |
| Create | `update_post` | `PATCH /v1/posts/{id}` (`{content?, title?}` — at least one required) |
| Create | `delete_post` | `DELETE /v1/posts/{id}` — drafts/scheduled only, returns `{id}` |
| Create | `request_approval` | `POST /v1/posts/{id}/request-approval` (`DRAFT` → `PENDING_APPROVAL`) |
| Create | `approve_post` | `POST /v1/posts/{id}/approve` (`{comment?}`) |
| Create | `reject_post` | `POST /v1/posts/{id}/reject` (`{comment?}`) |
| Search | `find_channel` | `GET /v1/channels`, client-side name-contains filter; empty name returns all channels |
| Search | `find_post` | `GET /v1/posts?status=&channelId=&limit=` (limit defaults to 5), returns the `data` array |
| Search | `get_workspace_analytics` | `GET /v1/analytics/workspace?from=&to=` — single summary wrapped in an array with a derived `id` |

Triggers subscribe via `POST /v1/webhooks` (`{name, url: bundle.targetUrl, events}`), unsubscribe via `DELETE /v1/webhooks/{id}`, and unwrap the delivery envelope `{id, type, createdAt, workspaceId, data}` — envelope fields are merged as `event_id`, `event_type`, `event_created_at`, `workspace_id`. Because webhook payloads are lean (`{postId, channelId, ...}`), the post triggers **hydrate the full post** via `GET /v1/posts/{postId}` on delivery, so every task matches the sample shape (content, title, media, timestamps) plus event extras (`postUrl`, `error`, `comment`). `performList` pulls Zap-editor samples from `GET /v1/posts?status=...&limit=3` (`channel_disconnected` wraps `GET /v1/channels` in fake envelopes instead, since the channel record is gone by the time the real event fires).

## Authentication: OAuth 2.0 authorization code + PKCE (public client)

- Authorize: `https://app.nimply.io/oauth/authorize`
- Token: `https://api.nimply.io/oauth/token` (JSON body, no client secret)
- Scopes: `workspace:read channels:read posts:read posts:write posts:publish media:read media:write analytics:read webhooks:manage`
- Connection test: `GET /v1/workspace`; connection label = workspace `name`

PKCE is handled by `enablePkce: true` in `authentication.js`: Zapier generates the verifier, automatically appends `code_challenge` + `code_challenge_method=S256` to the authorize URL, and exposes the verifier as `bundle.inputData.code_verifier`, which we send in the token-exchange body.

## Setup & deployment

### 1. Register the Zapier app (gets you the App ID)

```bash
npm install
npx zapier-platform login
npx zapier-platform register "Nimply"
```

`register` writes `.zapierapprc` containing your numeric App **ID** (also shown by `npx zapier-platform describe`).

### 2. Register the OAuth client against Nimply

Zapier's OAuth redirect URI embeds that App ID:

```
https://zapier.com/dashboard/auth/oauth/return/App<ID>CLIAPI/
```

(e.g. App ID `12345` → `https://zapier.com/dashboard/auth/oauth/return/App12345CLIAPI/`)

Register a **public** client (no secret) via Nimply's dynamic client registration:

```bash
curl -X POST https://api.nimply.io/oauth/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Zapier",
    "redirect_uris": ["https://zapier.com/dashboard/auth/oauth/return/App<ID>CLIAPI/"],
    "grant_types": ["authorization_code", "refresh_token"],
    "token_endpoint_auth_method": "none",
    "scope": "workspace:read channels:read posts:read posts:write posts:publish media:read media:write analytics:read webhooks:manage"
  }'
```

Keep the `client_id` from the response.

### 3. Set the env var and push

```bash
npx zapier-platform push                          # first push creates version 1.0.0
npx zapier-platform env:set 1.0.0 CLIENT_ID=<client_id_from_step_2>
```

(Env vars are per app version — re-set after bumping `version` in `package.json`. For local `zapier-platform invoke` testing, copy `.env.example` to `.env` instead.)

Then connect a test account in the Zap editor and build a Zap against each trigger/action.

### 4. Publishing

Submission to the public Zapier App Directory is a **manual** step: keep the integration private for testing (invite users via `npx zapier-platform users:add` or share links), and when ready run `npx zapier-platform promote 1.0.0` and submit for review from the [Zapier Platform UI](https://developer.zapier.com/) (Publishing → submit for review). Zapier's team reviews manually; it is not automated by `push`.

## Development

```bash
npm install
npm test                          # jest + nock unit tests (creates, searches, hook subscribe/perform)
npx zapier-platform validate      # local schema validation + integration checks (no login needed)
```

Layout:

```
index.js                     # app definition (auth, middleware, triggers/creates/searches)
authentication.js            # OAuth2 + PKCE config
middleware.js                # beforeRequest: attach Bearer token
constants.js                 # base URLs
triggers/hook-trigger.js     # shared REST-hook factory (subscribe/unsubscribe/perform/performList)
triggers/post_published.js
triggers/post_failed.js
triggers/post_approval_requested.js
triggers/post_approved.js
triggers/post_rejected.js
triggers/channel_disconnected.js  # standalone hook (channel payload, not post)
triggers/list_channels.js    # hidden polling trigger for dynamic dropdowns
triggers/post-dropdown.js    # shared factory for post dropdown triggers
triggers/list_posts.js       # hidden dropdown source (all posts)
triggers/list_draft_posts.js      # hidden dropdown source (DRAFT only)
triggers/list_pending_posts.js    # hidden dropdown source (PENDING_APPROVAL only)
triggers/list_scheduled_posts.js  # hidden dropdown source (SCHEDULED only)
creates/create_post.js
creates/upload_media.js
creates/schedule_post.js
creates/unschedule_post.js
creates/publish_post.js
creates/update_post.js
creates/delete_post.js
creates/request_approval.js
creates/approve_post.js
creates/reject_post.js
searches/find_channel.js
searches/find_post.js
searches/get_workspace_analytics.js
test/create_post.test.js
test/post_actions.test.js
```
