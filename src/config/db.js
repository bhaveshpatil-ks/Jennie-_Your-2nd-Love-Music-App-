import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Windows DNS resolution with MongoDB Atlas SRV connection strings
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore in environments where setting DNS is restricted
}

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<db_username>')) {
    console.warn('⚠️  MongoDB URI contains placeholder <db_username> or is not set.');
    console.warn('ℹ️  Please update MONGODB_URI in backend/.env with your MongoDB Atlas username.');
    return false;
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB connection failed: ${error.message}`);
    console.warn('ℹ️  Server will continue with fallback storage.');
    return false;
  }
}

export function isDbConnected() {
  return isConnected;
}
