import mongoose from "mongoose";

const mongodbUrl = process.env.MONGO_URL || '';

mongoose.connect(mongodbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('error', (e) => {
    console.error(`Error ${e}`);
});