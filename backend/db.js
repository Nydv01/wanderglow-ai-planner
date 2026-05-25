// backend/db.js
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

// Initialize database file
function initDb() {
  if (!fs.existsSync(dbPath)) {
    const initialData = {
      users: [],
      trips: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

// Read database
function readDb() {
  initDb();
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file, resetting database:', error);
    const initialData = { users: [], trips: [] };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
}

// Write database
function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database file:', error);
    return false;
  }
}

// User Helpers
const users = {
  findAll: () => {
    return readDb().users;
  },
  findByEmail: (email) => {
    const db = readDb();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findById: (id) => {
    const db = readDb();
    return db.users.find(u => u.id === id);
  },
  create: (userData) => {
    const db = readDb();
    const newUser = {
      id: '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...userData
    };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
  }
};

// Trip Helpers
const trips = {
  findAll: () => {
    return readDb().trips;
  },
  findByUserId: (userId) => {
    const db = readDb();
    return db.trips.filter(t => t.userId === userId);
  },
  findById: (id) => {
    const db = readDb();
    return db.trips.find(t => t.id === id);
  },
  create: (tripData) => {
    const db = readDb();
    const newTrip = {
      id: '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      isShared: false,
      ...tripData
    };
    db.trips.push(newTrip);
    writeDb(db);
    return newTrip;
  },
  update: (id, updatedFields) => {
    const db = readDb();
    const index = db.trips.findIndex(t => t.id === id);
    if (index !== -1) {
      db.trips[index] = {
        ...db.trips[index],
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      writeDb(db);
      return db.trips[index];
    }
    return null;
  },
  delete: (id) => {
    const db = readDb();
    const initialLength = db.trips.length;
    db.trips = db.trips.filter(t => t.id !== id);
    if (db.trips.length !== initialLength) {
      writeDb(db);
      return true;
    }
    return false;
  }
};

module.exports = {
  users,
  trips
};
