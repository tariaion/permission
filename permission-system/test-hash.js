const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'admin123';
  const rounds = 12;
  const hashed = await bcrypt.hash(password, rounds);
  console.log('Hashed password:', hashed);
  
  // Test the hash
  const isValid = await bcrypt.compare('admin123', hashed);
  console.log('Password validation:', isValid);
}

hashPassword().catch(console.error);