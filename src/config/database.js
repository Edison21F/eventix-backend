// src/config/database.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'eventix' // Puedes especificar el nombre de la base si no lo define la URI
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1); // Sale si falla
  }
};

module.exports = { connectMongoDB };
