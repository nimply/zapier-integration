const { API_BASE_URL } = require('../constants');

const BLOCK_TYPES = {
  LINK: 'Link button',
  TEXT: 'Text',
  SECTION: 'Section title',
  POST_CARD: 'Post card',
  PRODUCT: 'Product',
  COUPON: 'Coupon',
  COUNTDOWN: 'Countdown',
  NOTICE_BAR: 'Notice bar',
  FAQ: 'FAQ',
  TESTIMONIAL: 'Testimonial',
};

const parseConfig = (z, raw) => {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new z.errors.Error('Config must be valid JSON', 'InvalidData', 400);
  }
};

const perform = async (z, bundle) => {
  const {
    pageId,
    replaceBlockId,
    blockType,
    title,
    url,
    subtitle,
    style,
    config,
    position,
    scheduledStartAt,
    scheduledEndAt,
    publishAfter,
  } = bundle.inputData;

  const merged = parseConfig(z, config);
  if (blockType === 'LINK') {
    if (title) merged.title = title;
    if (url) merged.url = url;
    if (subtitle) merged.subtitle = subtitle;
    if (style) merged.style = style;
  }

  let response;
  if (replaceBlockId) {
    // Update an existing block in place (a rolling "latest video" button).
    response = await z.request({
      method: 'PATCH',
      url: `${API_BASE_URL}/v1/link-pages/${pageId}/blocks/${replaceBlockId}`,
      body: { config: merged, isActive: true },
    });
  } else {
    const body = { type: blockType, config: merged };
    if (position !== undefined && position !== null && position !== '') body.position = Number(position);
    if (scheduledStartAt) body.scheduledStartAt = scheduledStartAt;
    if (scheduledEndAt) body.scheduledEndAt = scheduledEndAt;
    response = await z.request({
      method: 'POST',
      url: `${API_BASE_URL}/v1/link-pages/${pageId}/blocks`,
      body,
    });
  }

  const block = response.data;
  if (publishAfter) {
    const published = await z.request({
      method: 'POST',
      url: `${API_BASE_URL}/v1/link-pages/${pageId}/publish`,
    });
    return { ...block, published: published.data };
  }
  return block;
};

module.exports = {
  key: 'add_link_block',
  noun: 'Link Block',
  display: {
    label: 'Add Link Block',
    description: 'Adds a block (link button, text, product, coupon, countdown, FAQ, …) to your nimply.link page, optionally publishing right away.',
  },
  operation: {
    perform,
    inputFields: [
      {
        key: 'pageId',
        label: 'Page',
        type: 'string',
        required: true,
        dynamic: 'list_link_pages.id.name',
        search: 'find_link_page.id',
        helpText: 'The nimply.link page to add the block to.',
      },
      {
        key: 'blockType',
        label: 'Block Type',
        type: 'string',
        required: true,
        default: 'LINK',
        choices: BLOCK_TYPES,
      },
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        required: false,
        helpText: 'Link button label (Link button only).',
      },
      {
        key: 'url',
        label: 'URL',
        type: 'string',
        required: false,
        helpText: 'Where the link button goes (Link button only).',
      },
      {
        key: 'subtitle',
        label: 'Subtitle',
        type: 'string',
        required: false,
        helpText: 'Small text under the title (Link button only).',
      },
      {
        key: 'style',
        label: 'Style',
        type: 'string',
        required: false,
        choices: { solid: 'Solid', outline: 'Outline', card: 'Card', featured: 'Featured' },
        helpText: 'Link button style. Featured makes it stand out at the top of the page.',
      },
      {
        key: 'config',
        label: 'Config (JSON)',
        type: 'text',
        required: false,
        helpText:
          'Block config for other types, e.g. a countdown: {"targetAt":"2026-10-03T18:00:00Z","label":"Drop in"}. See https://developer.nimply.io/docs/link-pages for every type.',
      },
      {
        key: 'position',
        label: 'Position',
        type: 'integer',
        required: false,
        helpText: '0-based position on the page. Leave empty to append at the end; 1 is usually just under the social icons.',
      },
      {
        key: 'scheduledStartAt',
        label: 'Show From',
        type: 'datetime',
        required: false,
        helpText: 'Only show the block from this time.',
      },
      {
        key: 'scheduledEndAt',
        label: 'Hide After',
        type: 'datetime',
        required: false,
        helpText: 'Hide the block after this time (no republish needed).',
      },
      {
        key: 'replaceBlockId',
        label: 'Replace Block ID',
        type: 'string',
        required: false,
        helpText: 'Advanced: update this existing block instead of adding a new one (keeps one rolling "latest" button). Get ids from Find Link Page → the page in the Nimply app.',
      },
      {
        key: 'publishAfter',
        label: 'Publish After Adding',
        type: 'boolean',
        required: false,
        default: 'true',
        helpText: 'Publish the page so the change is live within about a minute. Turn off to keep it in the draft.',
      },
    ],
    sample: {
      id: '5d1f8f4a-6d2e-4a4e-9c0f-2b7e2c0d9a11',
      type: 'LINK',
      position: 1,
      isActive: true,
      config: { title: 'New video: Behind the bar', url: 'https://youtu.be/abc123', style: 'featured' },
      scheduledStartAt: null,
      scheduledEndAt: null,
      createdAt: '2026-09-27T08:02:11.000Z',
      updatedAt: '2026-09-27T08:02:11.000Z',
      published: { publishedVersion: 5, url: 'https://nimply.link/brewhaus.coffee' },
    },
    outputFields: [
      { key: 'id', label: 'Block ID', type: 'string' },
      { key: 'type', label: 'Type', type: 'string' },
      { key: 'position', label: 'Position', type: 'integer' },
      { key: 'isActive', label: 'Active', type: 'boolean' },
      { key: 'scheduledStartAt', label: 'Show From', type: 'datetime' },
      { key: 'scheduledEndAt', label: 'Hide After', type: 'datetime' },
      { key: 'createdAt', label: 'Created At', type: 'datetime' },
      { key: 'published__publishedVersion', label: 'Published Version', type: 'integer' },
      { key: 'published__url', label: 'Public URL', type: 'string' },
    ],
  },
};
