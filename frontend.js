const fs = require("fs");

const sendFile = (filePath, type) => {
    const fileName = filePath.split("/").splice(-1)[0];
    const text = fs.readFileSync(filePath, "utf8");

    const file = new Blob([text], { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", file, fileName);
    formData.append(
        "metadata",
        JSON.stringify({
            fileName,
            title: "All's Well That End Well",
            source: "https://www.folger.edu/explore/shakespeares-works/download/",
            author: "William Shakespeare",
            genre: ["comedy"],
        })
    );

    fetch("http://localhost:3000/text", {
        method: "POST",
        body: formData,
    })
        .then((response) => {
            console.log("File uploaded successfully.");
        })
        .catch((error) => {
            console.error("Error uploading file:", error);
        });
};

sendFile("./data/text/alls_well.txt", "text/plain");

