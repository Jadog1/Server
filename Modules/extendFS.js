var fs = require('fs');

exports.readExtend = (filename, type, res) => {
    fs.readFile(filename, function (err, data) {
        if (err) {
            console.log("Error: " + err);
            return null;
        }
        res.writeHead(200, { 'Content-Type': type });
        res.write(data);
        return res.end();
    });
}

exports.getLastModified = async (filename) => {
    return new Promise((resolve, reject) => {
        fs.stat(filename, function (err, stats) {
            if (err) {
                console.log("Error file modification: " + err);
                reject(null);
                return;
            }
            resolve((new Date().getTime() - new Date(stats.mtime).getTime()) / 1000);
        });
    })
}

exports.readAFile = async (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, function (err, data) {
            if (err) {
                console.log("Error file read: " + err);
                reject(null);
                return;
            }
            resolve(data);
        });
    })
}

exports.writeAFile = async (filename, jsonData) => {
    fs.writeFile(filename, jsonData, function (err) {
        if (err) {
            console.log("Error file write: " + err);
        }
    });
}