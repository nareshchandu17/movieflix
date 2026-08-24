const fs = require('fs');
const path = require('path');

const audit = JSON.parse(fs.readFileSync('audit_results.json', 'utf8'));

// Helper to get all TS/TSX files
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}
const allFiles = walk('.');

const changes = [];

audit.exactDuplicates.forEach(group => {
  const paths = group.paths;
  const featurePath = paths.find(p => p.startsWith('features\\') || p.startsWith('features/'));
  const legacyPaths = paths.filter(p => p !== featurePath);

  if (featurePath && legacyPaths.length > 0) {
    // Normalize paths to import paths
    const newImport = '@/' + featurePath.replace(/\\/g, '/').replace(/\.tsx?$/, '');
    
    legacyPaths.forEach(legacy => {
      const oldImport = '@/' + legacy.replace(/\\/g, '/').replace(/\.tsx?$/, '');
      changes.push({ oldImport, newImport, fileToDelete: legacy });
    });
  }
});

let modifiedFilesCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  changes.forEach(change => {
    // Basic string replacement is safer than regex escaping here
    const oldStr1 = `"${change.oldImport}"`;
    const newStr1 = `"${change.newImport}"`;
    const oldStr2 = `'${change.oldImport}'`;
    const newStr2 = `'${change.newImport}'`;
    
    content = content.split(oldStr1).join(newStr1);
    content = content.split(oldStr2).join(newStr2);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFilesCount++;
  }
});



// Now delete legacy files
let deletedCount = 0;
changes.forEach(change => {
  if (fs.existsSync(change.fileToDelete)) {
    fs.unlinkSync(change.fileToDelete);
    deletedCount++;
  }
});


