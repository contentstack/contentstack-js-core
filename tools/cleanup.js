const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/naming-convention
const Path = require('path');
/* eslint-enable */

const sanitizePath = (inputPath) => {
  return Path.normalize(inputPath)
    ?.replace(/^([\/\\]){2,}/, './') // Normalize leading slashes/backslashes to ''
    .replace(/[\/\\]+/g, '/') // Replace multiple slashes/backslashes with a single '/'
    .replace(/(\.\.(\/|\\|$))+/g, ''); // Remove directory traversal (../ or ..\)
};

const deleteFolderRecursive = (inputPath) => {
  const path = sanitizePath(inputPath);

  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = Path.join(path, sanitizePath(file));
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const folder = process.argv.slice(2)[0];

if (folder) {
  deleteFolderRecursive(Path.join(__dirname, '../dist', folder));
} else {
  deleteFolderRecursive(Path.join(__dirname, '../dist/cjs'));
  deleteFolderRecursive(Path.join(__dirname, '../dist/esm'));
  deleteFolderRecursive(Path.join(__dirname, '../dist/umd'));
  deleteFolderRecursive(Path.join(__dirname, '../dist/types'));
}
