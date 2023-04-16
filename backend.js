const fs = require("fs");
const cors = require("cors");
const express = require("express");
const { MongoClient, GridFSBucket } = require("mongodb");
const { uploader } = require("./uploader.js");

const app = express();
app.use(
    cors({
        origin: "*",
    })
);

MongoClient.connect("mongodb://localhost:27017/multimedia")
    .then((client) => {
        const db = client.db();

        app.get("/texts", (req, res) => {
            db.collection("text")
                .find({})
                .toArray()
                .then((result) =>
                    res.json({ hasError: false, documents: result })
                )
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.get("/pdfs", (req, res) => {
            db.collection("pdf")
                .find({})
                .toArray()
                .then((result) =>
                    res.json({ hasError: false, documents: result })
                )
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.get("/images", (req, res) => {
            db.collection("image")
                .find({})
                .toArray()
                .then((result) =>
                    res.json({ hasError: false, documents: result })
                )
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.get("/videos", (req, res) => {
            db.collection("video")
                .find({})
                .toArray()
                .then((result) =>
                    res.json({ hasError: false, documents: result })
                )
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.post("/text", uploader.text.upload.single("file"), (req, res) => {
            const title = req.body.title;
            const creator = req.body.creator;
            const source = req.body.source;

            db.collection("text")
                .count({ title: title }, { limit: 1 })
                .then((count) => {
                    if (count === 0) {
                        const oldFilePath = "./uploads/text/sample.txt";
                        const newFilePath = `./uploads/text/${title}.txt`;

                        fs.promises
                            .rename(oldFilePath, newFilePath)
                            .then(() => {
                                const bucket = new GridFSBucket(db);
                                const streamToUpload = fs.createReadStream(
                                    `./uploads/text/${title}.txt`
                                );
                                const uploadStream = bucket.openUploadStream(
                                    `${title}.txt`,
                                    {
                                        contentType: "text/plain",
                                    }
                                );
                                streamToUpload.pipe(uploadStream);
                                uploadStream.on("finish", () => {
                                    console.log(
                                        `${title}.txt uploaded successfully!`
                                    );

                                    uploader.text.genPreview(newFilePath);
                                    const textDocument = {
                                        title,
                                        creator,
                                        source,
                                        preview: fs.readFileSync(
                                            "./uploads/text/preview.jpg",
                                            {
                                                encoding: "base64",
                                            }
                                        ),
                                    };

                                    db.collection("text")
                                        .insertOne(textDocument)
                                        .then((result) => {
                                            console.log(result);
                                            res.json({
                                                hasError: false,
                                                result: result,
                                            });
                                        })
                                        .catch((err) => {
                                            console.error(err);
                                            res.status(500).json({
                                                hasError: true,
                                                error: err,
                                            });
                                        });
                                });
                            })
                            .catch((err) => console.log(err));
                    } else {
                        console.error("File exists.");
                        res.json({ hasError: true, error: "File exists" });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.post("/pdf", uploader.pdf.upload.single("file"), (req, res) => {
            const title = req.body.title;
            const creator = req.body.creator;
            const source = req.body.source;

            db.collection("pdf")
                .count({ title: title }, { limit: 1 })
                .then((count) => {
                    if (count === 0) {
                        const oldFilePath = "./uploads/pdf/sample.pdf";
                        const newFilePath = `./uploads/pdf/${title}.pdf`;

                        fs.promises
                            .rename(oldFilePath, newFilePath)
                            .then(() => {
                                const bucket = new GridFSBucket(db);
                                const streamToUpload = fs.createReadStream(
                                    `./uploads/pdf/${title}.pdf`
                                );
                                const uploadStream = bucket.openUploadStream(
                                    `${title}.pdf`,
                                    {
                                        contentType: "application/pdf",
                                    }
                                );
                                streamToUpload.pipe(uploadStream);
                                uploadStream.on("finish", () => {
                                    console.log(
                                        `${title}.pdf uploaded successfully!`
                                    );

                                    uploader.pdf.genPreview(newFilePath, () => {
                                        console.log("Hello!");
                                        const pdfDocument = {
                                            title,
                                            creator,
                                            source,
                                            preview: fs.readFileSync(
                                                "./uploads/pdf/preview.jpg",
                                                {
                                                    encoding: "base64",
                                                }
                                            ),
                                        };

                                        db.collection("pdf")
                                            .insertOne(pdfDocument)
                                            .then((result) => {
                                                console.log(result);
                                                res.json({
                                                    hasError: false,
                                                    result: result,
                                                });
                                            })
                                            .catch((err) => {
                                                console.error(err);
                                                res.status(500).json({
                                                    hasError: true,
                                                    error: err,
                                                });
                                            });
                                    });
                                });
                            })
                            .catch((err) => console.log(err));
                    } else {
                        console.error("File exists.");
                        res.json({ hasError: true, error: "File exists" });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.post("/image", uploader.image.upload.single("file"), (req, res) => {
            const title = req.body.title;
            const creator = req.body.creator;
            const source = req.body.source;

            db.collection("image")
                .count({ title: title }, { limit: 1 })
                .then((count) => {
                    if (count === 0) {
                        const oldFilePath = "./uploads/image/sample.jpg";
                        const newFilePath = `./uploads/image/${title}.jpg`;

                        fs.promises
                            .rename(oldFilePath, newFilePath)
                            .then(() => {
                                const bucket = new GridFSBucket(db);
                                const streamToUpload = fs.createReadStream(
                                    `./uploads/image/${title}.jpg`
                                );
                                const uploadStream = bucket.openUploadStream(
                                    `${title}.jpg`,
                                    {
                                        contentType: "image/jpeg",
                                    }
                                );
                                streamToUpload.pipe(uploadStream);
                                uploadStream.on("finish", () => {
                                    console.log(
                                        `${title}.jpg uploaded successfully!`
                                    );

                                    uploader.image.genPreview(
                                        newFilePath,
                                        () => {
                                            const imageDocument = {
                                                title,
                                                creator,
                                                source,
                                                preview: fs.readFileSync(
                                                    "./uploads/image/preview.jpg",
                                                    {
                                                        encoding: "base64",
                                                    }
                                                ),
                                            };

                                            db.collection("image")
                                                .insertOne(imageDocument)
                                                .then((result) => {
                                                    console.log(result);
                                                    res.json({
                                                        hasError: false,
                                                        result: result,
                                                    });
                                                })
                                                .catch((err) => {
                                                    console.error(err);
                                                    res.status(500).json({
                                                        hasError: true,
                                                        error: err,
                                                    });
                                                });
                                        }
                                    );
                                });
                            })
                            .catch((err) => console.log(err));
                    } else {
                        console.error("File exists.");
                        res.json({ hasError: true, error: "File exists" });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.post("/video", uploader.video.upload.single("file"), (req, res) => {
            const title = req.body.title;
            const creator = req.body.creator;
            const source = req.body.source;

            db.collection("video")
                .count({ title: title }, { limit: 1 })
                .then((count) => {
                    if (count === 0) {
                        const oldFilePath = "./uploads/video/sample.mp4";
                        const newFilePath = `./uploads/video/${title}.mp4`;

                        fs.promises
                            .rename(oldFilePath, newFilePath)
                            .then(() => {
                                const bucket = new GridFSBucket(db);
                                const streamToUpload = fs.createReadStream(
                                    `./uploads/video/${title}.mp4`
                                );
                                const uploadStream = bucket.openUploadStream(
                                    `${title}.mp4`,
                                    {
                                        contentType: "video/mp4",
                                    }
                                );
                                streamToUpload.pipe(uploadStream);
                                uploadStream.on("finish", () => {
                                    console.log(
                                        `${title}.mp4 uploaded successfully!`
                                    );

                                    uploader.video.genPreview(
                                        newFilePath,
                                        () => {
                                            const videoDocument = {
                                                title,
                                                creator,
                                                source,
                                                preview: fs.readFileSync(
                                                    "./uploads/video/preview.jpg",
                                                    {
                                                        encoding: "base64",
                                                    }
                                                ),
                                            };

                                            db.collection("video")
                                                .insertOne(videoDocument)
                                                .then((result) => {
                                                    console.log(result);
                                                    res.json({
                                                        hasError: false,
                                                        result: result,
                                                    });
                                                })
                                                .catch((err) => {
                                                    console.error(err);
                                                    res.status(500).json({
                                                        hasError: true,
                                                        error: err,
                                                    });
                                                });
                                        }
                                    );
                                });
                            })
                            .catch((err) => console.log(err));
                    } else {
                        console.error("File exists.");
                        res.json({ hasError: true, error: "File exists" });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.get("/text", (req, res) => {
            const { title } = req.query;
            console.log(title);

            const bucket = new GridFSBucket(db);
            const downloadStream = bucket.openDownloadStreamByName(
                `${title}.txt`
            );
            const writeStream = fs.createWriteStream(
                "./downloads/text/sample.txt"
            );

            downloadStream.pipe(writeStream);
            writeStream.on("finish", () => {
                console.log(`${title}.txt downloaded successfully!`);

                const filePath = "./downloads/text/sample.txt";
                const stat = fs.statSync(filePath);

                res.setHeader("Content-Type", "text/plain");
                res.setHeader("Content-Length", stat.size);
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename=${title}.txt`
                );

                const stream = fs.createReadStream(filePath);
                stream.pipe(res);
            });
        });

        app.get("/pdf", (req, res) => {
            const { title } = req.query;
            console.log(title);

            const bucket = new GridFSBucket(db);
            const downloadStream = bucket.openDownloadStreamByName(
                `${title}.pdf`
            );
            const writeStream = fs.createWriteStream(
                "./downloads/pdf/sample.pdf"
            );

            downloadStream.pipe(writeStream);
            writeStream.on("finish", () => {
                console.log(`${title}.pdf downloaded successfully!`);

                const filePath = "./downloads/pdf/sample.pdf";
                const stat = fs.statSync(filePath);

                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Length", stat.size);
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename=${title}.pdf`
                );

                const stream = fs.createReadStream(filePath);
                stream.pipe(res);
            });
        });

        app.get("/image", (req, res) => {
            const { title } = req.query;
            console.log(title);

            const bucket = new GridFSBucket(db);
            const downloadStream = bucket.openDownloadStreamByName(
                `${title}.jpg`
            );
            const writeStream = fs.createWriteStream(
                "./downloads/image/sample.jpg"
            );

            downloadStream.pipe(writeStream);
            writeStream.on("finish", () => {
                console.log(`${title}.jpg downloaded successfully!`);

                const filePath = "./downloads/image/sample.jpg";
                const stat = fs.statSync(filePath);

                res.setHeader("Content-Type", "image/jpeg");
                res.setHeader("Content-Length", stat.size);
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename=${title}.jpg`
                );

                const stream = fs.createReadStream(filePath);
                stream.pipe(res);
            });
        });

        app.get("/video", (req, res) => {
            const { title } = req.query;
            console.log(title);

            const bucket = new GridFSBucket(db);
            const downloadStream = bucket.openDownloadStreamByName(
                `${title}.mp4`
            );
            const writeStream = fs.createWriteStream(
                "./downloads/video/sample.mp4"
            );

            downloadStream.pipe(writeStream);
            writeStream.on("finish", () => {
                console.log(`${title}.mp4 downloaded successfully!`);

                const filePath = "./downloads/video/sample.mp4";
                const stat = fs.statSync(filePath);

                res.setHeader("Content-Type", "video/mp4");
                res.setHeader("Content-Length", stat.size);
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename=${title}.mp4`
                );

                const stream = fs.createReadStream(filePath);
                stream.pipe(res);
            });
        });

        app.delete("/text", (req, res) => {
            const { title } = req.query;
            console.log(title);

            db.collection("text")
                .deleteMany({ title: title })
                .then(() => {
                    const bucket = new GridFSBucket(db);
                    bucket
                        .find({ filename: `${title}.txt` })
                        .toArray()
                        .then((files) => {
                            bucket
                                .delete(files[0]._id)
                                .then(() => res.json({ hasError: false }))
                                .catch((err) => {
                                    console.log(err);
                                    res.status(500).json({
                                        hasError: true,
                                        erro: err,
                                    });
                                });
                        });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.delete("/pdf", (req, res) => {
            const { title } = req.query;
            console.log(title);

            db.collection("pdf")
                .deleteMany({ title: title })
                .then(() => {
                    const bucket = new GridFSBucket(db);
                    bucket
                        .find({ filename: `${title}.pdf` })
                        .toArray()
                        .then((files) => {
                            bucket
                                .delete(files[0]._id)
                                .then(() => res.json({ hasError: false }))
                                .catch((err) => {
                                    console.log(err);
                                    res.status(500).json({
                                        hasError: true,
                                        erro: err,
                                    });
                                });
                        });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.delete("/image", (req, res) => {
            const { title } = req.query;
            console.log(title);

            db.collection("image")
                .deleteMany({ title: title })
                .then(() => {
                    const bucket = new GridFSBucket(db);
                    bucket
                        .find({ filename: `${title}.jpg` })
                        .toArray()
                        .then((files) => {
                            bucket
                                .delete(files[0]._id)
                                .then(() => res.json({ hasError: false }))
                                .catch((err) => {
                                    console.log(err);
                                    res.status(500).json({
                                        hasError: true,
                                        erro: err,
                                    });
                                });
                        });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.delete("/video", (req, res) => {
            const { title } = req.query;
            console.log(title);

            db.collection("video")
                .deleteMany({ title: title })
                .then(() => {
                    const bucket = new GridFSBucket(db);
                    bucket
                        .find({ filename: `${title}.mp4` })
                        .toArray()
                        .then((files) => {
                            bucket
                                .delete(files[0]._id)
                                .then(() => res.json({ hasError: false }))
                                .catch((err) => {
                                    console.log(err);
                                    res.status(500).json({
                                        hasError: true,
                                        erro: err,
                                    });
                                });
                        });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ hasError: true, error: err });
                });
        });

        app.listen(8000, () => {
            console.log("Server started on port 8000.");
        });
    })
    .catch((err) => console.error(err));
