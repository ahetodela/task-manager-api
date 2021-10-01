const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId, //since we are going to store the user id here which is an objectID
            required: true,
            ref: "User", //this creates a link between the task model and the users model
        },
    },
    {
        timestamps: true,
    }
);
//Task model definition
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
