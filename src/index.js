const express = require("express");
require("./db/mongoose");
const userRouter = require("./routes/user");
const taskRouter = require("./routes/task");

const app = express();
const port = process.env.PORT;

//middleware here before the other app.use calls

//to allow express send and receive json data
app.use(express.json());

//Routers here
app.use(userRouter);
app.use(taskRouter);

//server port
app.listen(port, () => {
    console.log("Listening on port: " + port);
});
