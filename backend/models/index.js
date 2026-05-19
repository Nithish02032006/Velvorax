const Company = require('./Company');
const Deal = require('./Deal');
const Lead = require('./Lead');
const Task = require('./Task');
const Ticket = require('./Ticket');
const Account = require('./Account');

// Internal CRM users (admin/staff)
const User = require('./User');

// External users (clients/customers)
const StandardUser = require('./StandardUser');

module.exports = {
  Company,
  Deal,
  Lead,
  Task,
  Ticket,
  Account,
  User,
  StandardUser
};
