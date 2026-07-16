# Changelog

## 1.2.0

Actions (platform-specific creates, with each platform's full option set):

- create/create_youtube_video — upload a video or Short with category, visibility, license, subscriber notification, embedding, and made-for-kids
- create/create_tiktok_post — post a video or photos with privacy level (dynamic, from the account's allowed levels), comment/Duet/Stitch settings, and commercial-content disclosure
- create/create_pinterest_pin — create a pin on a specific board (dynamic board dropdown) with a destination link and alt text
- create/create_linkedin_post — post to a profile or company page with visibility control

Hidden dropdown triggers powering the above: list_youtube_channels, list_tiktok_channels, list_pinterest_channels, list_linkedin_channels, list_pinterest_boards, list_tiktok_privacy_levels.

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
