import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testDBConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connection test successful');
    } catch (error) {
        console.error('MongoDB connection test failed:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

testDBConnection();