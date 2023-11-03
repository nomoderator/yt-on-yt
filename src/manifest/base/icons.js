const fs = require('fs');
const path = require('path');
const { isDevMode } = require('./helper');

const iconSizes = [16, 24, 32, 48, 96, 128];

const icons = iconSizes.reduce((a, c) => {
  const devLogo = `assets/images/logo/${c}-dev.png`;
  const simpleLogo = `assets/images/logo/${c}.png`;
  const existDevLogo = fs.existsSync(path.join(process.cwd(), 'src', devLogo));
  const logoToUse = isDevMode && existDevLogo ? devLogo : simpleLogo;

  return {
    ...a,
    [c]: logoToUse,
  };
}, {});

module.exports = { icons, iconSizes };
