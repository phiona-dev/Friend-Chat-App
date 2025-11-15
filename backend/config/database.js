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
	return mongoose.connection;
}

module.exports = { connectDB };

