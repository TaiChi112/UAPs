const fs = require('fs');

function rep(file, a, b) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.split(a).join(b);
  fs.writeFileSync(file, content);
}

// Restore orm-vault and raw-vault first to get a clean state before fixing
