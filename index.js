// nodejs core modules
const path = require("path");
const fs = require('fs');

// importing express
const express = require("express");
const app = express();

// importing hbs
const hbs = require('hbs');

// setting the view engine to hbs
app.set('view engine', 'hbs');
app.set('views', "./views");

// end point to serve our homepage (index.hbs)
app.get("/", (req,res) => {
    let videoList = [];

    // reading all the file names from our assests folder
    videoList = fs.readdirSync("./assests");
  
    // sending our index.hbs file as response with all the video names
    res.render("index", {videoList:videoList});
});


app.get("/video/:filename", (req,res) => {
    // extract the route parameter ":filename"
    const fileName = req.params.filename;

    // send the video.hbs with the fileName in the parameter
    res.render("video", {
      fileName: fileName
    });
});




app.get("/stream/:filename", (req,res) => {
    // extract the route parameter ":filename" and join it to the path of the assests folder
    const fileName = req.params.filename;
    const pathToVideo = `./assests/${fileName}`;
    
    // extracting video size of the requested video
    const videoSize = fs.readFileSync(pathToVideo).length;

    // range specified in the request header asking for a specific part of the video
    const range = req.headers.range;
    
    // size of the video we are going to stream at a time
    // here I've sticked to stream 1MB size of video at a time
    const chunkSize = 1 * 1024 * 1024;

    // calculating the start and end of the part of the video to stream
    const start = parseInt(range.replace(/\D/g, ""), 10);
    const end = Math.min(start + chunkSize, videoSize - 1);

    const contentLength = end - start + 1;
    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges":"bytes",
        "Content-Length": contentLength,
        "Content-Type":"video/mp4"
    });

    // creating a readable stream of the video file
    const videoStream = fs.createReadStream(pathToVideo,{start,end});

    // at last we attach our streamable file to the response
    videoStream.pipe(res);
});


// listening at port 3300
app.listen(3300, () => console.log("Server running at port 3300"));

