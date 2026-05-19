import os
import re

files = [
    'frontend/calling.html',
    'frontend/dashboard-super.html',
    'frontend/employee_tracking.html',
    'frontend/leads.html',
    'frontend/invoices.html',
    'frontend/registrations.html',
    'frontend/settings.html',
    'frontend/contacts.html',
    'frontend/accounts.html'
]

# This pattern finds the entire <li> block that contains registrations.html
registration_pattern = r'<li[^>]*>.*?href=["\']registrations\.html["\'].*?</li>'

replacements = {
    '<a href="#" class="sidebar-link"><i data-feather="user-check" class="sidebar-icon"></i> Contacts</a>':
        '<a href="contacts.html" class="sidebar-link"><i data-feather="phone-call" class="sidebar-icon"></i> Contacts</a>',
    '<a href="#" class="sidebar-link"><i data-feather="briefcase" class="sidebar-icon"></i> Accounts</a>':
        '<a href="accounts.html" class="sidebar-link"><i data-feather="briefcase" class="sidebar-icon"></i> Accounts</a>'
}

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()

        # 1. Remove the entire <li> container for Registrations
        content = re.sub(registration_pattern, '', content, flags=re.DOTALL | re.IGNORECASE)

        # 2. Cleanup: Remove any loose <a> tags for registrations
        stray_link_pattern = r'<a[^>]*href=["\']registrations\.html["\'][^>]*>.*?</a>'
        content = re.sub(stray_link_pattern, '', content, flags=re.DOTALL | re.IGNORECASE)

        # 3. Update Contacts & Accounts links
        for old, new in replacements.items():
            content = content.replace(old, new)

        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print("SUCCESS: Sidebar updated and Registrations hidden.")