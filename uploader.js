const fs = require("fs");
const sharp = require("sharp");
const multer = require("multer");
const mt = require("media-thumbnail");
const { spawn } = require("child_process");
const { createCanvas } = require("canvas");

const getStorage = (type, filename) =>
    multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `./uploads/${type}`);
        },
        filename: function (req, file, cb) {
            cb(null, filename);
        },
    });

const genTextPreview = (filePath) => {
    const text = fs.readFileSync(filePath, "utf8");

    const canvas = createCanvas(200, 300);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000000";
    ctx.font = "20px Arial";
    const lineHeight = 30;
    const lines = text.split("\n");
    let y = 30;
    for (const line of lines) {
        ctx.fillText(line, 0, y);
        y += lineHeight;
    }

    const buffer = canvas.toBuffer("image/jpeg");
    fs.writeFileSync("./uploads/text/preview.jpg", buffer);
};

const genPDFPreview = (filePath, cb) => {
    const previewLargePath = "./uploads/pdf/previewLarge.jpg";
    const previewPath = "./uploads/pdf/preview.jpg";

    const command = "gs";
    const args = [
        "-o",
        `${previewLargePath}`,
        "-sDEVICE=jpeg",
        "-dFirstPage=1",
        "-dLastPage=1",
        "-dJPEGQ=60",
        "-r300",
        "-dTextAlphaBits=4",
        "-dGraphicsAlphaBits=4",
        "-dSAFER",
        "-dBATCH",
        "-dNOPAUSE",
        `"${filePath}"`,
    ];

    const child = spawn(command, args, { stdio: "inherit" });

    child.on("exit", () => {
        console.log("Successfully exited from child!\n");
        sharp(previewLargePath)
            .resize(200, 300)
            .toFile(previewPath, (err, info) => {
                if (err) {
                    console.error(err);
                } else {
                    cb();
                }
            });
    });
};

const genImagePreview = (filePath, cb) => {
    const previewPath = "./uploads/image/preview.jpg";
    sharp(filePath)
        .resize({ width: 200 })
        .toFile(previewPath, (err, info) => {
            if (err) {
                console.error(err);
            } else {
                cb();
            }
        });
};

const genVideoPreview = (filePath, cb) => {
    const previewPath = "./uploads/video/preview.jpg";

    const command = "ffmpeg";
    const args = [
        "-i",
        `${filePath}`,
        "-ss",
        "00:00:05",
        "-vframes",
        "1",
        "-vf",
        `scale=320:-1`,
        `${previewPath}`,
        "-y"
    ];

    const child = spawn(command, args, { stdio: "inherit" });

    child.on("exit", () => {
        cb();
    });
};

const uploader = {
    text: {
        upload: multer({ storage: getStorage("text", "sample.txt") }),
        genPreview: genTextPreview,
    },
    pdf: {
        upload: multer({ storage: getStorage("pdf", "sample.pdf") }),
        genPreview: genPDFPreview,
    },
    image: {
        upload: multer({ storage: getStorage("image", "sample.jpg") }),
        genPreview: genImagePreview,
    },
    video: {
        upload: multer({ storage: getStorage("video", "sample.mp4") }),
        genPreview: genVideoPreview,
    },
};

module.exports = { uploader };
