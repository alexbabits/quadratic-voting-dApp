import mongoose from 'mongoose';

// Keep track of current connection state with this object.
const connectionState = {};

async function dbConnect() {
  console.log("Attempting to connect to MongoDB...");
  if (connectionState.isConnected) {
    console.log("Already connected to MongoDB.");
    return;
  }

  try {
    // Attempt to connect to database at URI with mongoose.
    const db = await mongoose.connect('mongodb://127.0.0.1:27017/mydatabase');
    connectionState.isConnected = db.connections[0].readyState;
    console.log("Successfully connected to MongoDB at 'mongodb://127.0.0.1:27017/mydatabase'.");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

export default dbConnect;