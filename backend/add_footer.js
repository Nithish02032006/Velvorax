const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../frontend');
const pages = ['index.html', 'features.html', 'services.html', 'pricing.html', 'login.html', 'dashboard.html', 'about.html'];

const footerHTML = `
  <!-- COMPACT MODERN FOOTER -->
  <footer class="bg-[#030303] text-gray-400 py-12 border-t border-white/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between gap-12">
        
        <!-- Logo & Brand Description -->
        <div class="md:w-1/3">
          <div class="flex items-center mb-4">
            <img src="assets/logo.png" alt="Velvorax Logo" class="h-8 mr-3">
            <span class="text-xl font-bold text-white tracking-tighter">Velvorax</span>
          </div>
          <p class="text-xs leading-relaxed max-w-xs mb-6">
            Intelligent automation for the modern enterprise. Transcend traditional limits with autonomous systems.
          </p>
          <div class="flex space-x-5">
            <a href="https://www.linkedin.com/company/velvoro-software-solutions/" target="_blank" class="hover:text-yellow-400 transition-colors"><i data-feather="linkedin" class="w-4 h-4"></i></a>
            <a href="https://x.com/VelvoroO" target="_blank" class="hover:text-yellow-400 transition-colors"><i data-feather="twitter" class="w-4 h-4"></i></a>
            <a href="https://www.instagram.com/velvoro_software?igsh=MWRyczU3Z2ZicWVtbA==" target="_blank" class="hover:text-yellow-400 transition-colors"><i data-feather="instagram" class="w-4 h-4"></i></a>
            <a href="https://www.facebook.com/share/1NqjdZAKo2/" target="_blank" class="hover:text-yellow-400 transition-colors"><i data-feather="facebook" class="w-4 h-4"></i></a>
            <a href="https://youtube.com/@velvorosoftwaresolution?si=7fMvTlRsIZ9UK9C0" target="_blank" class="hover:text-yellow-400 transition-colors"><i data-feather="youtube" class="w-4 h-4"></i></a>
          </div>
        </div>

        <!-- Links Grid -->
        <div class="md:w-2/3 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <h5 class="text-white text-xs font-bold uppercase tracking-widest mb-5">Product</h5>
            <ul class="space-y-3 text-xs">
              <li><a href="#" class="hover:text-white transition-colors">Features</a></li>
              <li><a href="pricing.html" class="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h5 class="text-white text-xs font-bold uppercase tracking-widest mb-5">Solutions</h5>
            <ul class="space-y-3 text-xs">
              <li><a href="#" class="hover:text-white transition-colors">AI Automation</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Cloud Tech</a></li>
              <li><a href="#" class="hover:text-white transition-colors">CRM Engine</a></li>
            </ul>
          </div>
          <div>
            <h5 class="text-white text-xs font-bold uppercase tracking-widest mb-5">Resources</h5>
            <ul class="space-y-3 text-xs">
              <li><a href="#" class="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Docs</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h5 class="text-white text-xs font-bold uppercase tracking-widest mb-5">Company</h5>
            <ul class="space-y-3 text-xs">
              <li><a href="about.html" class="hover:text-white transition-colors">About</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Legal</a></li>
            </ul>
          </div>
        </div>

      </div>

      <!-- Bottom Row -->
      <div class="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p class="text-[10px] text-gray-600 uppercase tracking-widest">
          &copy; 2026 Velvorax Software Solutions. All rights reserved.
        </p>
        <div class="flex space-x-6 text-[10px] text-gray-700 uppercase tracking-widest">
          <a href="#" class="hover:text-white transition">Privacy</a>
          <a href="#" class="hover:text-white transition">Terms</a>
          <a href="#" class="hover:text-white transition text-green-500 animate-pulse">Systems Operational</a>
        </div>
      </div>
    </div>
  </footer>
  <script>if(window.feather) feather.replace();</script>
`;

pages.forEach(page => {
  const filePath = path.join(frontendDir, page);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace ALL misprints of Velvoro with Velvorax
  content = content.replace(/velvoro/gi, 'Velvorax');
  
  // Clean up ALL previous versions of the footer specifically
  content = content.replace(/<footer[\s\S]*?<\/footer>/, '');
  content = content.replace(/<!--[\s\S]*?FOOTER -->[\s\S]*?<\/footer>/, '');

  content = content.replace('</body>', footerHTML + '\n</body>');
  fs.writeFileSync(filePath, content);
  console.log(`Fixed branding and footer on ${page}`);
});
