import archiver from 'archiver';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import fs from 'fs';
import pkg from '../package.json' assert { type: 'json' };
// import { iconSizes } from '../src/manifest/base/icons';

dotenvExpand.expand(dotenv.config());

const archive = archiver('zip', {
  zlib: { level: 9 }, // Sets the compression level.
});
const { version } = pkg;
const dirDist = 'dist';
const distDirs = process.env.DIST_DIRS?.split(',').map(dir => dir.trim());

async function compress() {
  for (let i = 0; i < distDirs.length; i++) {
    const dir = distDirs[i];
    const inputPath = `${dirDist}/${dir}/`;
    const outputPath = `${dirDist}/ext_${dir}_v${version}.zip`;
    const exclude = ['**/*.map'];
    const output = fs.createWriteStream(outputPath);
    output.on('close', function () {
      console.log('done writing: ' + archive.pointer() + ' total bytes');
    });

    archive.on('error', function (err) {
      throw err;
    });

    archive.glob('**/*', {
      cwd: inputPath,
      ignore: exclude,
    });

    archive.pipe(output);

    archive.finalize();
  }
}

// commenting compressSource for now, because we're not using it currently,
// if we do use it, it will need some changes to use archiver

// async function compressSource() {
//   const zip = new zl.Zip();
//   const dirs = ['src/', 'webpack/', 'scripts/'];
//   const files = [
//     '.env',
//     '.prettierignore',
//     '.prettierrc.json',
//     'package.json',
//     'README.md',
//     'tsconfig.json',
//     'webpack.config.js',
//     'yarn.lock',
//   ];
//   files.forEach(f => zip.addFile(f));
//   dirs.forEach(f => zip.addFolder(f, f));
//   await zip.archive(`${dirDist}/_source_v${version}.zip`);
// }

await compress();
// await compressSource();
