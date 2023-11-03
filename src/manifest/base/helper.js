const path = require('path');
const pkgPath = path.join(process.cwd(), 'package.json');
const { version, displayName, description } = require(pkgPath);
const permissions = require('../permissions');

const isDevMode = process.env.NODE_ENV?.includes('dev');

const name = displayName + (isDevMode ? ` [dev]` : '');

const defaultManifest = {
  name,
  version,
  description,
  short_name: name,
  permissions,
  content_scripts: [
    {
      // matches: ['<all_urls>'],
      matches: ['*://youtube.com/*', '*://www.youtube.com/*'],
      // css: ["styles.css"],
      js: ['yt-on-yt-content.js'],
    },
  ],
};

module.exports = {
  name,
  isDevMode,
  permissions,
  defaultManifest,
};
