const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../frontend');
const dashFiles = ['leads.html', 'calling.html', 'employee_tracking.html', 'invoices.html', 'settings.html'];

const newSidebar = `    <nav class="flex-1 p-4 space-y-2">
      <a href="dashboard.html" class="sidebar-link {DASH_ACTIVE}"><i data-feather="grid" class="sidebar-icon"></i> Dashboard</a>
      <a href="leads.html" class="sidebar-link {LEADS_ACTIVE}"><i data-feather="users" class="sidebar-icon"></i> Leads</a>
      <a href="#" class="sidebar-link"><i data-feather="user" class="sidebar-icon"></i> Customers</a>
      <a href="#" class="sidebar-link"><i data-feather="briefcase" class="sidebar-icon"></i> Projects</a>
      <a href="employee_tracking.html" class="sidebar-link {TRACK_ACTIVE}"><i data-feather="activity" class="sidebar-icon"></i> Analytics</a>
      <a href="invoices.html" class="sidebar-link {INV_ACTIVE}"><i data-feather="file-text" class="sidebar-icon"></i> Reports</a>
      <div class="pt-4 pb-2 text-[10px] uppercase text-gray-500 font-bold px-4">System</div>
      <a href="settings.html" class="sidebar-link {SET_ACTIVE}"><i data-feather="settings" class="sidebar-icon"></i> Settings</a>
      <a href="#" class="sidebar-link"><i data-feather="layers" class="sidebar-icon"></i> Integrations</a>
      <a href="#" class="sidebar-link"><i data-feather="help-circle" class="sidebar-icon"></i> Support</a>
    </nav>`;

const newTopbar = `    <!-- Topbar -->
    <header class="h-16 border-b border-gray-800 bg-[#0a0a2a]/80 backdrop-blur flex items-center justify-between px-6 z-10">
      <div class="flex items-center bg-gray-900/50 border border-gray-800 rounded px-3 py-1.5 w-64">
        <i data-feather="search" class="w-4 h-4 text-gray-500 mr-2"></i>
        <input type="text" placeholder="Search..." class="bg-transparent border-none outline-none text-sm text-gray-300 w-full">
      </div>
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-2 text-gray-400">
          <i data-feather="bell" class="w-5 h-5"></i>
          <i data-feather="message-square" class="w-5 h-5"></i>
        </div>
        <div class="flex items-center space-x-3 border-l border-gray-800 pl-6">
          <div class="text-right hidden md:block">
            <p class="text-sm font-bold text-white leading-none" id="topUserName">John Doe</p>
            <p class="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">Administrator</p>
          </div>
          <div class="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-black shadow-lg shadow-yellow-400/20">
            JD
          </div>
        </div>
      </div>
    </header>`;

dashFiles.forEach(file => {
  const filePath = path.join(frontendDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Topbar
  content = content.replace(/<!-- Topbar -->[\s\S]*?<\/header>/, newTopbar);
  
  // Replace Sidebar Nav
  let sidebar = newSidebar
    .replace('{DASH_ACTIVE}', file === 'dashboard.html' ? 'active' : '')
    .replace('{LEADS_ACTIVE}', file === 'leads.html' ? 'active' : '')
    .replace('{TRACK_ACTIVE}', file === 'employee_tracking.html' ? 'active' : '')
    .replace('{INV_ACTIVE}', file === 'invoices.html' ? 'active' : '')
    .replace('{SET_ACTIVE}', file === 'settings.html' ? 'active' : '');
    
  content = content.replace(/<nav class="flex-1 p-4 space-y-2">[\s\S]*?<\/nav>/, sidebar);
  
  fs.writeFileSync(filePath, content);
});

console.log('Dashboard UI synchronized across all pages.');
