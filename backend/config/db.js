const mongoose = require('mongoose');


const connectDB = async () => 
{ 
    try 
    {
        await mongoose.connect(`${process.env.MONGO_URL}/${process.env.MONGO_DB}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            console.log(`Mongo DB Connected successfully.`);
        });
    } catch(error) {
        console.error(`MongoDB Coneection error :: ${error.message}`);
    }
}

module.exports = connectDB;