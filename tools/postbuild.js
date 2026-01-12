const fs = require('fs');
const path = require('path');

/**
 * Post-build script to create package.json in dist/esm/
 * This marks the ESM output directory as ES modules, resolving
 * the conflict with root package.json's "type": "commonjs"
 * Also adds .js extensions to relative imports for ESM compatibility
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

// Fix relative imports to include .js extensions for ESM compatibility
const esmSrcDir = path.join(__dirname, '../dist/esm/src');

function fixImportsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Replace relative imports/exports without .js extension
  // Matches: './something' or '../something' but not './something.js' or './something.json'
  const fixedContent = content
    .replace(/(from\s+['"])(\.\.?\/[^'"]+)(['"])/g, (match, prefix, importPath, suffix) => {
      // Skip if already has extension or is a JSON import
      if (importPath.endsWith('.js') || importPath.endsWith('.json') || importPath.endsWith('.mjs')) {
        return match;
      }

      // Add .js extension
      return `${prefix}${importPath}.js${suffix}`;
    })
    .replace(/(export\s+\*\s+from\s+['"])(\.\.?\/[^'"]+)(['"])/g, (match, prefix, importPath, suffix) => {
      // Skip if already has extension or is a JSON import
      if (importPath.endsWith('.js') || importPath.endsWith('.json') || importPath.endsWith('.mjs')) {
        return match;
      }

      // Add .js extension
      return `${prefix}${importPath}.js${suffix}`;
    });

  if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
  }
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      fixImportsInFile(fullPath);
    }
  }
}

// Process all .js files in the ESM build
if (fs.existsSync(esmSrcDir)) {
  processDirectory(esmSrcDir);
}
