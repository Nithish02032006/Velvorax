const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../frontend');
const files = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));

const replacementHTML = `<a href="index.html" class="flex-shrink-0 flex items-center">
          <img src="assets/logo.png" alt="Velvorax Logo" class="h-12 object-contain" onerror="this.onerror=null; this.src='https://placehold.co/200x50/0a0a2a/FFD700?text=Velvorax'">
        </a>`;

const sidebarReplacementHTML = `<a href="index.html" class="flex items-center">
        <img src="assets/logo.png" alt="Velvorax Logo" class="h-10 object-contain" onerror="this.onerror=null; this.src='https://placehold.co/150x40/0a0a2a/FFD700?text=Velvorax'">
      </a>`;

files.forEach(file => {
  const filePath = path.join(frontendDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Nav Logo
  content = content.replace(/<div class="flex-shrink-0 flex items-center">[\s\S]*?(<\/h1>\s*<\/div>\s*<\/div>|<\/h1>\s*<\/div>)/, replacementHTML);

  // Replace Sidebar Logo (Dashboards)
  content = content.replace(/<div class="flex items-center text-yellow-400 font-bold text-xl tracking-wider">[\s\S]*?<\/div>/, sidebarReplacementHTML);
  
  // Login page specific
  if(file === 'login.html') {
    content = content.replace(/<div class="w-12 h-12 rounded-full border-2 border-yellow-400 flex items-center justify-center mx-auto mb-4">[\s\S]*?<\/div>/, `<img src="assets/logo.png" alt="Velvorax Logo" class="h-16 mx-auto mb-4 object-contain" onerror="this.onerror=null; this.src='https://placehold.co/200x50/0a0a2a/FFD700?text=Velvorax'">`);
  }

  fs.writeFileSync(filePath, content);
});

console.log('Logo updated in all HTML files.');
