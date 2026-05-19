const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../frontend');

// Marketing Footer HTML (Enterprise Multi-Column style)
const marketingFooterHTML = `
    <!-- Enterprise Multi-Column Footer -->
    <footer class="mt-auto py-16 border-t border-white/5 bg-[#030308] relative overflow-hidden z-10">
      <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] -z-10"></div>
      
      <div class="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-16">
        <!-- Brand Column -->
        <div class="lg:col-span-1">
          <div class="flex items-center mb-6">
            <img src="assets/logo.jpg" class="w-10 h-10 rounded-full border border-yellow-500/20 mr-3">
            <div>
              <h2 class="text-white font-black text-xl tracking-tight uppercase leading-none">Velvorax</h2>
              <p class="text-[8px] text-yellow-500 font-bold tracking-[0.2em] uppercase mt-1">Software Solution</p>
            </div>
          </div>
          <p class="text-[11px] text-gray-500 leading-relaxed mb-8 max-w-xs">
            Intelligent automation for the modern enterprise. We empower businesses to generate customers using websites, apps, and autonomous CRM systems.
          </p>
          <div class="flex space-x-4 text-gray-600">
            <a href="https://www.linkedin.com/company/velvoro-software-solutions/" target="_blank" class="hover:text-yellow-400 transition-colors"><i data-feather="linkedin" class="w-4 h-4"></i></a>
            <a href="https://x.com/VelvoroO" target="_blank" class="hover:text-yellow-400 transition-colors">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.248 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/></svg>
            </a>
            <a href="https://www.instagram.com/velvoro_software?igsh=MWRyczU3Z2ZicWVtbA==" target="_blank" class="hover:text-yellow-400 transition-colors"><i data-feather="instagram" class="w-4 h-4"></i></a>
            <a href="https://www.facebook.com/share/1NqjdZAKo2/" target="_blank" class="hover:text-yellow-400 transition-colors"><i data-feather="facebook" class="w-4 h-4"></i></a>
            <a href="https://youtube.com/@velvorosoftwaresolution?si=7fMvTlRsIZ9UK9C0" target="_blank" class="hover:text-yellow-400 transition-colors"><i data-feather="youtube" class="w-4 h-4"></i></a>
          </div>
        </div>

        <!-- Product Column -->
        <div>
          <h3 class="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6">Product</h3>
          <ul class="space-y-4 text-[11px] text-gray-500 font-bold uppercase tracking-widest">
            <li><a href="features.html" class="hover:text-yellow-500 transition-colors">Features</a></li>
            <li><a href="pricing.html" class="hover:text-yellow-500 transition-colors">Pricing</a></li>
            <li><a href="partner.html" class="hover:text-yellow-500 transition-colors">Partners</a></li>
            <li><a href="#" class="hover:text-yellow-500 transition-colors text-gray-700">Blog</a></li>
          </ul>
        </div>

        <!-- Solutions Column -->
        <div>
          <h3 class="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6">Solutions</h3>
          <ul class="space-y-4 text-[11px] text-gray-500 font-bold uppercase tracking-widest">
            <li><a href="services.html" class="hover:text-yellow-500 transition-colors">AI Automation</a></li>
            <li><a href="services.html" class="hover:text-yellow-500 transition-colors">Web Development</a></li>
            <li><a href="services.html" class="hover:text-yellow-500 transition-colors">CRM Systems</a></li>
          </ul>
        </div>

        <!-- Contact Column -->
        <div class="lg:col-span-1">
          <h3 class="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6">Contact</h3>
          <ul class="space-y-4 text-[11px]">
            <li>
              <a href="mailto:raraju@velvorax.tech" class="flex items-center text-gray-500 hover:text-white transition-colors group">
                <i data-feather="mail" class="w-4 h-4 mr-3 text-yellow-500 group-hover:scale-110 transition-transform shrink-0"></i>
                <span class="font-bold tracking-widest truncate">raraju@velvorax.tech</span>
              </a>
            </li>
            <li>
              <a href="tel:+919985201116" class="flex items-center text-gray-500 hover:text-white transition-colors group">
                <i data-feather="phone" class="w-4 h-4 mr-3 text-yellow-500 group-hover:scale-110 transition-transform shrink-0"></i>
                <span class="font-bold tracking-widest">+91 9985201116</span>
              </a>
            </li>
            <li>
              <a href="https://www.google.com/maps/search/?api=1&query=Flat+303,+Sri+Mani+Sai+Arcade,+X+Road,+Miyapur,+Hyderabad,+Telangana+500049" target="_blank" class="flex items-start text-gray-500 hover:text-white transition-colors group">
                <i data-feather="map-pin" class="w-4 h-4 mr-3 mt-1 text-yellow-500 group-hover:scale-110 transition-transform shrink-0"></i>
                <span class="font-bold tracking-widest leading-relaxed">
                  Flat 303, Sri Mani Sai Arcade, 'X' Road<br>
                  Miyapur, Hyderabad, Telangana - 500049
                </span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Company Column -->
        <div>
          <h3 class="text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6">Company</h3>
          <ul class="space-y-4 text-[11px] text-gray-500 font-bold uppercase tracking-widest">
            <li><a href="about.html" class="hover:text-yellow-500 transition-colors">About Us</a></li>
            <li><a href="privacy.html" class="hover:text-yellow-500 transition-colors">Privacy Policy</a></li>
            <li><a href="terms.html" class="hover:text-yellow-500 transition-colors">Terms of Service</a></li>
            <li><a href="#" class="hover:text-yellow-500 transition-colors text-gray-700">Careers</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="max-w-7xl mx-auto px-8 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p class="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em]">
          &copy; 2026 VELVORAX SOFTWARE SOLUTIONS. ALL RIGHTS RESERVED.
        </p>
        <div class="flex items-center space-x-8 text-[9px] text-gray-700 font-black uppercase tracking-[0.3em]">
          <span class="hover:text-white transition-colors cursor-default">SECURE</span>
          <span class="hover:text-white transition-colors cursor-default">ENCRYPTED</span>
          <span class="text-green-500 flex items-center">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
            SYSTEMS OPERATIONAL
          </span>
        </div>
      </div>
    </footer>
    <script>if(window.feather) feather.replace();</script>
`;

// Internal/Dashboard Footer (Minimal)
const dashboardFooterHTML = `
  <footer class="mt-auto py-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
    <p class="text-[9px] text-gray-500 uppercase tracking-widest">
      &copy; 2026 Velvorax Enterprise OS. All rights reserved.
    </p>
    <div class="flex space-x-6 text-[9px] text-gray-600 uppercase tracking-widest">
      <a href="privacy.html" class="hover:text-white transition">Privacy</a>
      <a href="terms.html" class="hover:text-white transition">Terms</a>
      <span class="text-green-500 flex items-center">
        <span class="w-1 h-1 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> SECURE SESSION
      </span>
    </div>
  </footer>
`;

const dashboardPages = [
  'dashboard-super.html', 
  'dashboard-client.html', 
  'dashboard-user.html', 
  'dashboard.html', 
  'calling.html', 
  'employee_tracking.html', 
  'invoices.html', 
  'leads.html', 
  'registrations.html', 
  'settings.html', 
  'admin_pricing.html',
  'reports.html',
  'social.html',
  'tasks.html',
  'cases.html',
  'accounts.html',
  'opportunities.html',
  'contacts.html',
  'profile.html'
];

const files = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(frontendDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove existing footers if any
  content = content.replace(/<!-- Enterprise Multi-Column Footer -->[\s\S]*?<\/footer>/gi, '');
  content = content.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  content = content.replace(/<script>if\(window\.feather\) feather\.replace\(\);<\/script>/gi, '');

  if (dashboardPages.includes(file)) {
    // Add to dashboard pages (Inside <main> if exists, else before </body>)
    if (content.includes('</main>')) {
      content = content.replace('</main>', dashboardFooterHTML + '\n</main>');
      console.log(`Added minimal footer to dashboard page: ${file}`);
    } else {
      content = content.replace('</body>', dashboardFooterHTML + '\n</body>');
      console.log(`Added minimal footer before body to page: ${file}`);
    }
  } else {
    // Add to marketing pages
    content = content.replace('</body>', marketingFooterHTML + '\n</body>');
    console.log(`Added marketing footer to page: ${file}`);
  }

  // Ensure feather icons are replaced
  if (!content.includes('feather.replace()')) {
    content = content.replace('</body>', '<script>if(window.feather) feather.replace();</script>\n</body>');
  }

  fs.writeFileSync(filePath, content);
});

console.log('\nFooter update complete for all pages.');
