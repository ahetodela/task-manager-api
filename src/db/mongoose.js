const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_DB_URL);
//the useUrlParser: true, useCreateIndex:true have been deprecated. that's why they are no more provided as options to the connect method on mongoose
