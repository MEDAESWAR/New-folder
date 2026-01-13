import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL as string);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log("DATABASE MIGRATION: MONGOOSE ACTIVE");
    } catch (error: any) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
