const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../frontend');
const files = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));

// Mockup image has logo + text "Velvorax SOFTWARE SOLUTION"
// I will use a flex container for the logo + text
const logoHTML = `<a href="index.html" class="flex-shrink-0 flex items-center group">
          <img src="assets/logo.png" alt="Velvorax Logo" class="h-12 object-contain mr-3 group-hover:scale-105 transition-transform">
          <div class="hidden sm:block">
            <h1 class="text-2xl font-bold text-yellow-400 tracking-wider leading-none">Velvorax</h1>
            <p class="text-[0.6rem] text-gray-400 tracking-[0.2em] uppercase mt-1">Software Solution</p>
          </div>
        </a>`;

files.forEach(file => {
  const filePath = path.join(frontendDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace Nav Logo
  content = content.replace(/<a href="index.html" class="flex-shrink-0 flex items-center">[\s\S]*?<\/a>/, logoHTML);
  content = content.replace(/<a href="index.html" class="flex items-center">[\s\S]*?<\/a>/, logoHTML);
  
  // Dashboard sidebar specific (smaller)
  const sidebarLogo = `<a href="index.html" class="flex items-center group px-2">
          <img src="assets/logo.png" alt="Velvorax Logo" class="h-10 object-contain mr-3">
          <div>
            <h1 class="text-xl font-bold text-yellow-400 tracking-wider leading-none">Velvorax</h1>
            <p class="text-[0.5rem] text-gray-500 tracking-[0.1em] uppercase mt-1">Software Solution</p>
          </div>
        </a>`;
  
  content = content.replace(/<div class="p-6 border-b border-gray-800">[\s\S]*?<\/div>/, `<div class="p-6 border-b border-gray-800">${sidebarLogo}</div>`);

  fs.writeFileSync(filePath, content);
});

console.log('Logo and Branding updated across all pages.');
