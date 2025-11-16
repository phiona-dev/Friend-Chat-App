const mongoose = require('mongoose');

async function connectDB() {
	const uri = process.env.MONGODB_URI;
	if (!uri) {
		throw new Error('MONGODB_URI is not set in environment');
	}
	mongoose.set('strictQuery', true);
	await mongoose.connect(uri, {
		autoIndex: true,
	});
	console.log('✅ MongoDB Connected to:', mongoose.connection.name);
	console.log('📍 Database:', mongoose.connection.db.databaseName);
	return mongoose.connection;
}

module.exports = { connectDB };

