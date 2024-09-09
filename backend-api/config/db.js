const mongoose = require("mongoose");

const connectDB = async() =>{
    try{
       await mongoose.connect(process.env.DATABASE_URL,{
        dbName:process.env.DB_NAME,
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
       });
        console.log("Connect DB Succes");

    }catch(err){
        console.log(err); 
        console.log("Connected to yourDB-name database");
        process.exit(1);
    }
}
module.exports = connectDB;