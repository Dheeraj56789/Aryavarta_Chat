import mongoose from "mongoose";

const dbConnect = async () => {
    const primaryUri = process.env.MONGODB_CONNECT;
    const localUri = "mongodb://127.0.0.1:27017/chat_app";

    // If primaryUri contains placeholder `<db_password>`, try local MongoDB directly
    const shouldTryPrimary = primaryUri && !primaryUri.includes("<db_password>");

    if (shouldTryPrimary) {
        try {
            await mongoose.connect(primaryUri, {
                serverSelectionTimeoutMS: 5000
            });
            console.log("Connected to MongoDB Atlas successfully 🍃");
            return;
        } catch (error) {
            console.warn(`Could not connect to MongoDB Atlas (${error.message}). Falling back to local MongoDB...`);
        }
    } else {
        console.warn("MongoDB Atlas URI has placeholder '<db_password>'. Attempting connection to local MongoDB...");
    }

    try {
        await mongoose.connect(localUri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("Connected to Local MongoDB (mongodb://127.0.0.1:27017/chat_app) successfully! 🍃");
    } catch (localError) {
        console.error("Critical: Failed to connect to local MongoDB:", localError.message);
    }
};

export default dbConnect;