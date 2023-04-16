const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();

MongoClient.connect("mongodb://localhost:27017/multimedia")
    .then((client) => {
        let db = client.db();

        app.listen(3000, () => {
            console.log("Server listening on port 3000...");
        });


    })
    .catch();
