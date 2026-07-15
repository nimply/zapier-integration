# Changelog

## 1.1.1

Triggers:

- trigger/post_published, trigger/post_failed, trigger/post_approval_requested, trigger/post_approved, trigger/post_rejected — webhook deliveries now hydrate the full post from the API, so every delivery includes content, title, media, and timestamps (matching the editor samples), plus event extras (post URL, error message, approval comment)

## 1.1.0

Actions:

- create/unschedule_post — move a scheduled post back to draft and clear its publish time

## 1.0.0

Initial public release of the Nimply integration.

Triggers (instant, webhook-powered):

- trigger/post_published — fires when a scheduled post goes live
- trigger/post_failed — fires when a platform rejects a post
- trigger/post_approval_requested — fires when a draft is sent for sign-off
- trigger/post_approved — fires when a pending post is approved
- trigger/post_rejected — fires when a pending post is rejected
- trigger/channel_disconnected — fires when a social channel is disconnected

Actions:

- create/create_post — create posts as drafts, into the next free slot, immediately, or at a specific time (with media and a channel picker)
- create/upload_media — upload files mapped from previous steps or from a public URL
- create/schedule_post, create/publish_post, create/update_post, create/delete_post — full post lifecycle
- create/request_approval, create/approve_post, create/reject_post — client approval workflow

Searches:

- search/find_channel — find a connected channel by name (empty query lists all)
- search/find_post — find posts by status and channel
- search/get_workspace_analytics — followers, engagement, and totals for a date range
