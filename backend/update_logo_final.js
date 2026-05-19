const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../frontend');
const files = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));

const logoHTML = `<a href="index.html" class="flex items-center">
          <img src="assets/logo.png" alt="Velvorax Logo" class="h-10 md:h-12 object-contain">
        </a>`;

files.forEach(file => {
  const filePath = path.join(frontendDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to find the logo container in nav or sidebar
  // This looks for anything inside a div that contains "Velvorax" or a logo-like structure
  content = content.replace(/<div class="flex-shrink-0 flex items-center">[\s\S]*?(<\/h1>\s*<\/div>\s*<\/div>|<\/h1>\s*<\/div>)/, logoHTML);
  content = content.replace(/<div class="p-6 border-b border-gray-800">\s*<div class="flex items-center text-yellow-400 font-bold text-xl tracking-wider">[\s\S]*?<\/div>\s*<\/div>/, `<div class="p-6 border-b border-gray-800">${logoHTML}</div>`);
  content = content.replace(/<div class="p-6 border-b border-gray-800">\s*<a href="index.html" class="flex items-center">[\s\S]*?<\/a>\s*<\/div>/, `<div class="p-6 border-b border-gray-800">${logoHTML}</div>`);
  
  // Login page specific
  if(file === 'login.html') {
    content = content.replace(/<div class="w-12 h-12 rounded-full border-2 border-yellow-400 flex items-center justify-center mx-auto mb-4">[\s\S]*?<\/div>/, `<img src="assets/logo.png" alt="Velvorax Logo" class="h-16 mx-auto mb-4 object-contain">`);
  }

  fs.writeFileSync(filePath, content);
});

console.log('Final logo update complete.');
