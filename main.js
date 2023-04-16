const { spawn } = require("child_process");
const sharp = require("sharp");
const mt = require("media-thumbnail");

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

// genPDFPreview("./uploads/pdf/Little Book of Semaphores.pdf", () =>
//     console.log(2 + 2)
// );

genVideoPreview("./uploads/video/Earth Rotating.mp4", () => console.log(2 + 2));
