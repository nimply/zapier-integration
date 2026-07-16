const packageJson = require('./package.json');
const zapier = require('zapier-platform-core');

const authentication = require('./authentication');
const middleware = require('./middleware');

const channelDisconnected = require('./triggers/channel_disconnected');
const listChannels = require('./triggers/list_channels');
const listDraftPosts = require('./triggers/list_draft_posts');
const listPendingPosts = require('./triggers/list_pending_posts');
const listPosts = require('./triggers/list_posts');
const listScheduledPosts = require('./triggers/list_scheduled_posts');
const postApprovalRequested = require('./triggers/post_approval_requested');
const postApproved = require('./triggers/post_approved');
const postFailed = require('./triggers/post_failed');
const postPublished = require('./triggers/post_published');
const postRejected = require('./triggers/post_rejected');
const listPinterestBoards = require('./triggers/list_pinterest_boards');
const listTikTokPrivacyLevels = require('./triggers/list_tiktok_privacy_levels');
const {
  listYouTubeChannels,
  listTikTokChannels,
  listPinterestChannels,
  listLinkedInChannels,
} = require('./triggers/platform_channel_lists');
const approvePost = require('./creates/approve_post');
const createPost = require('./creates/create_post');
const createYouTubeVideo = require('./creates/create_youtube_video');
const createTikTokPost = require('./creates/create_tiktok_post');
const createPinterestPin = require('./creates/create_pinterest_pin');
const createLinkedInPost = require('./creates/create_linkedin_post');
const deletePost = require('./creates/delete_post');
const publishPost = require('./creates/publish_post');
const rejectPost = require('./creates/reject_post');
const requestApproval = require('./creates/request_approval');
const schedulePost = require('./creates/schedule_post');
const unschedulePost = require('./creates/unschedule_post');
const updatePost = require('./creates/update_post');
const uploadMedia = require('./creates/upload_media');
const findChannel = require('./searches/find_channel');
const findPost = require('./searches/find_post');
const getWorkspaceAnalytics = require('./searches/get_workspace_analytics');

module.exports = {
  version: packageJson.version,
  platformVersion: zapier.version,

  // Recommended for new v19 integrations (integration check D028): skip the
  // legacy automatic input-data cleaning for predictable perform inputs.
  flags: { skipThrowForStatus: false, cleanInputData: false },

  authentication,
  beforeRequest: [...middleware.befores],
  afterResponse: [...middleware.afters],

  triggers: {
    [channelDisconnected.key]: channelDisconnected,
    [listChannels.key]: listChannels,
    [listDraftPosts.key]: listDraftPosts,
    [listPendingPosts.key]: listPendingPosts,
    [listPosts.key]: listPosts,
    [listScheduledPosts.key]: listScheduledPosts,
    [postApprovalRequested.key]: postApprovalRequested,
    [postApproved.key]: postApproved,
    [postFailed.key]: postFailed,
    [postPublished.key]: postPublished,
    [postRejected.key]: postRejected,
    [listYouTubeChannels.key]: listYouTubeChannels,
    [listTikTokChannels.key]: listTikTokChannels,
    [listPinterestChannels.key]: listPinterestChannels,
    [listLinkedInChannels.key]: listLinkedInChannels,
    [listPinterestBoards.key]: listPinterestBoards,
    [listTikTokPrivacyLevels.key]: listTikTokPrivacyLevels,
  },

  creates: {
    [approvePost.key]: approvePost,
    [createPost.key]: createPost,
    [createYouTubeVideo.key]: createYouTubeVideo,
    [createTikTokPost.key]: createTikTokPost,
    [createPinterestPin.key]: createPinterestPin,
    [createLinkedInPost.key]: createLinkedInPost,
    [deletePost.key]: deletePost,
    [publishPost.key]: publishPost,
    [rejectPost.key]: rejectPost,
    [requestApproval.key]: requestApproval,
    [schedulePost.key]: schedulePost,
    [unschedulePost.key]: unschedulePost,
    [updatePost.key]: updatePost,
    [uploadMedia.key]: uploadMedia,
  },

  searches: {
    [findChannel.key]: findChannel,
    [findPost.key]: findPost,
    [getWorkspaceAnalytics.key]: getWorkspaceAnalytics,
  },
};
