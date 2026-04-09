const { User } = require('./models');

const USERS = [
  { username: 'admin',  email: 'admin@admin.com',          password: 'Admin1234!', role: 'admin'  },
  { username: 'editor', email: 'editor@eventhub.com',       password: 'Admin1234!', role: 'editor' },
  { username: 'viewer', email: 'viewer@eventhub.com',       password: 'Admin1234!', role: 'viewer' },
];

async function seed() {
  const count = await User.count();
  if (count > 0) return;

  for (const u of USERS) {
    await User.create(u);
  }
  console.log('Seed : utilisateurs créés (admin, editor, viewer)');
}

module.exports = seed;
