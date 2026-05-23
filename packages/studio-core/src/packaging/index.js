/**
 * Packaging adapter — call kdna-cli for pack, verify, sign, publish operations.
 *
 * Studio Core does not re-implement these. It provides structured interfaces
 * that delegate to kdna-cli subprocess calls.
 */

const { execSync } = require('child_process');
const path = require('path');

function packDomain(domainDir, outputDir = null) {
  const args = ['pack', domainDir];
  if (outputDir) args.push('--output', outputDir);
  const result = execSync(`kdna ${args.join(' ')}`, { encoding: 'utf8' });
  return { success: true, output: result.trim() };
}

function packEncryptedDomain(domainDir, licensePath, outputDir = null) {
  const args = ['pack', domainDir, '--encrypt', '--license', licensePath];
  if (outputDir) args.push('--output', outputDir);
  const result = execSync(`kdna ${args.join(' ')}`, { encoding: 'utf8' });
  return { success: true, output: result.trim() };
}

function verifyDomain(domainPath) {
  try {
    const result = execSync(`kdna verify ${domainPath} --json`, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (e) {
    const stdout = (e.stdout || '').toString();
    try { return JSON.parse(stdout); } catch { return { error: e.message, stdout }; }
  }
}

function inspectContainer(filePath) {
  try {
    const result = execSync(`kdna inspect ${filePath} --json`, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch {
    return null;
  }
}

function signDomain(domainDir, identityDir = null) {
  // Uses kdna publish --check for signing
  const args = ['publish', '--check', domainDir];
  try {
    const result = execSync(`kdna ${args.join(' ')}`, { encoding: 'utf8', env: { ...process.env } });
    return { success: true, output: result.trim() };
  } catch (e) {
    return { success: false, error: e.stderr?.toString() || e.message };
  }
}

function generateLicense(domain, issuedTo, savePath = null) {
  const args = ['license', 'generate', domain, '--to', issuedTo];
  if (savePath) args.push('--save', savePath);
  try {
    const result = execSync(`kdna ${args.join(' ')}`, { encoding: 'utf8' });
    return { success: true, output: result.trim() };
  } catch (e) {
    return { success: false, error: e.stderr?.toString() || e.message };
  }
}

module.exports = {
  packDomain,
  packEncryptedDomain,
  verifyDomain,
  inspectContainer,
  signDomain,
  generateLicense,
};
