const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api");
//the useUrlParser: true, useCreateIndex:true have been deprecated. that's why they are no more provided as options to the connect method on mongoose
