const fs = require('fs');
const path = require('path');

/**
 * Post-build script to create package.json in dist/esm/
 * This marks the ESM output directory as ES modules, resolving
 * the conflict with root package.json's "type": "commonjs"
 */
const esmPackageJsonPath = path.join(__dirname, '../dist/esm/package.json');
const esmPackageJson = {
  type: 'module',
};

// Ensure dist/esm directory exists
const esmDir = path.dirname(esmPackageJsonPath);
if (!fs.existsSync(esmDir)) {
  fs.mkdirSync(esmDir, { recursive: true });
}

// Write the package.json file
fs.writeFileSync(esmPackageJsonPath, JSON.stringify(esmPackageJson, null, 2) + '\n', 'utf8');
