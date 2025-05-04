// diagnostic.js - Place in your project root and run with: node diagnostic.js

const fs = require('fs');
const path = require('path');

console.log('Project Structure Diagnostic\n');
console.log('Current Directory:', process.cwd());
console.log('-------------------\n');

// Check required directories
const requiredDirs = ['admin', 'admin/css', 'admin/js', 'backend', 'public', 'public/js', 'public/css'];
const requiredFiles = [
  'admin/index.html',
  'admin/css/admin.css',
  'admin/js/admin.js',
  'backend/server.js',
  'backend/package.json',
  'public/index.html'
];

console.log('Checking directories:');
requiredDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`${exists ? '✓' : '✗'} ${dir}`);
});

console.log('\nChecking files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✓' : '✗'} ${file}`);
});

console.log('\nChecking server.js static middleware:');
try {
  const serverContent = fs.readFileSync('backend/server.js', 'utf8');
  const hasAdminStatic = serverContent.includes("app.use('/admin', express.static");
  const hasAdminRoute = serverContent.includes("app.get('/admin'");
  
  console.log(`${hasAdminStatic ? '✓' : '✗'} Admin static middleware`);
  console.log(`${hasAdminRoute ? '✓' : '✗'} Admin route handler`);
} catch (error) {
  console.log('✗ Could not read server.js');
}