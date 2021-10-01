/* const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient; */

const { MongoClient, ObjectId } = require("mongodb"); //destructuring

const connectionURL = process.env.MONGO_DB_URL;
const databaseName = "task-manager";

/* Code to connect mongodb in the terminal when it disconnects 
from video 73 at minute 6:15
/Users/DelaAheto/mongodb/bin/mongod.exe --dbpath=/Users/DelaAheto/mongodb-data

*/

MongoClient.connect(
    connectionURL,
    { useNewUrlParser: true },
    (error, client) => {
        if (error) {
            return console.log("unable to connect to databse", error);
        }

        const db = client.db(databaseName);
        /* db.collection("users").findOne(
            { name: "Richmond", age: 7 },
            (error, user) => {
                if (error) {
                    return console.log("Unable to fetch document", error);
                }
                console.log("Document details: ", user);
                if (!user) {
                    return console.log("document does not exist");
                }
                console.log(user);
            }
        ); */
        /* db.collection("users")
            .find({ age: 36 })
            .count((error, count) => {
                if (error) {
                    return console.log(error);
                }
                console.log(count);
            }); */
        /* db.collection("tasks").findOne(
            { _id: new ObjectId("6140394c0c1241572467015f") },
            (error, task) => {
                if (error) {
                    return console.log(error);
                }
                console.log(task);
            }
        );
        db.collection("tasks")
            .find({ completed: false })
            .toArray((error, tasks) => {
                if (error) {
                    return console.log("unable to fetch tasks", error);
                }
                console.log("These are the tasks: ", tasks);
            }); */
        /* db.collection("users")
            .updateOne(
                {
                    _id: new ObjectId("6140325e48dd8e56aad6b42d"),
                },
                {
                    $set: {
                        name: "Janet Gadasu Aheto",
                    },
                    $min: {
                        age: 25,
                    },
                }
            )
            .then((result) => {
                console.log(result);
            })
            .catch((reject) => {
                console.log(reject);
            }); */
        db.collection("tasks")
            .updateMany(
                {
                    completed: false,
                },
                {
                    $set: {
                        completed: true,
                    },
                }
            )
            .then((resolve) => {
                console.log("succeeded", resolve);
            })
            .catch((reject) => {
                console.log(reject);
            });
    }
);
