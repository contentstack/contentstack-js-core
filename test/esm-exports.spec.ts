/**
 * ESM Exports Test Suite
 *
 * Purpose: Verify that ESM and CJS builds export correctly and package.json
 * has proper exports field configuration for ESM compatibility.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('ESM Exports Tests', () => {
  const distPath = path.join(__dirname, '..', 'dist');
  const esmIndexPath = path.join(distPath, 'esm', 'src', 'index.js');
  const cjsIndexPath = path.join(distPath, 'cjs', 'src', 'index.js');
  const esmRequestPath = path.join(distPath, 'esm', 'src', 'lib', 'request.js');
  const cjsRequestPath = path.join(distPath, 'cjs', 'src', 'lib', 'request.js');

  describe('ESM Build Exports', () => {
    it('should have ESM build index.js file', () => {
      expect(fs.existsSync(esmIndexPath)).toBe(true);
    });

    it('should export getData from ESM request.js', () => {
      expect(fs.existsSync(esmRequestPath)).toBe(true);
      const requestContent = fs.readFileSync(esmRequestPath, 'utf-8');
      expect(requestContent).toContain('export function getData');
    });

    it('should re-export getData from ESM index.js', () => {
      const indexContent = fs.readFileSync(esmIndexPath, 'utf-8');
      expect(indexContent).toContain("export * from './lib/request'");
    });

    it('should verify getData is a named export in ESM build', () => {
      const requestContent = fs.readFileSync(esmRequestPath, 'utf-8');
      expect(requestContent).toMatch(/export\s+(async\s+)?function\s+getData/);
    });
  });

  describe('CJS Build Exports', () => {
    it('should have CJS build index.js file', () => {
      expect(fs.existsSync(cjsIndexPath)).toBe(true);
    });

    it('should export getData from CJS request.js using exports.getData', () => {
      expect(fs.existsSync(cjsRequestPath)).toBe(true);
      const requestContent = fs.readFileSync(cjsRequestPath, 'utf-8');
      expect(requestContent).toContain('exports.getData');
    });

    it('should re-export getData from CJS index.js using __exportStar', () => {
      const indexContent = fs.readFileSync(cjsIndexPath, 'utf-8');
      expect(indexContent).toContain('__exportStar(require("./lib/request")');
    });
  });

  describe('Package.json Exports Configuration', () => {
    it('should have exports field in package.json', () => {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.exports).toBeDefined();
      expect(packageJson.exports['.']).toBeDefined();
    });

    it('should have import condition pointing to ESM build', () => {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.exports['.'].import).toBeDefined();
      const importPath = packageJson.exports['.'].import.default || packageJson.exports['.'].import;
      expect(importPath).toContain('esm');
    });

    it('should have require condition pointing to CJS build', () => {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.exports['.'].require).toBeDefined();
      const requirePath = packageJson.exports['.'].require.default || packageJson.exports['.'].require;
      expect(requirePath).toContain('cjs');
    });

    it('should have types specified for both import and require', () => {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const exports = packageJson.exports['.'];
      expect(exports.import.types).toBeDefined();
      expect(exports.require.types).toBeDefined();
      expect(exports.import.types).toContain('types');
      expect(exports.require.types).toContain('types');
    });

    it('should verify ESM build file exists at exports path', () => {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const importPath = packageJson.exports['.'].import.default || packageJson.exports['.'].import;
      const fullPath = path.join(__dirname, '..', importPath);
      expect(fs.existsSync(fullPath)).toBe(true);
    });

    it('should verify CJS build file exists at exports path', () => {
      const packageJsonPath = path.join(__dirname, '..', 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const requirePath = packageJson.exports['.'].require.default || packageJson.exports['.'].require;
      const fullPath = path.join(__dirname, '..', requirePath);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  });

  describe('Source Code Imports', () => {
    it('should be able to import getData as named export from source', async () => {
      const { getData } = await import('../src');
      expect(getData).toBeDefined();
      expect(typeof getData).toBe('function');
    });

    it('should verify getData is available in all exports from source', async () => {
      const allExports = await import('../src');
      expect(allExports.getData).toBeDefined();
      expect(typeof allExports.getData).toBe('function');
    });
  });
});
