var fs = require('fs');

exports.readExtend = (filename, type, res) => {
    fs.readFile(filename, function (err, data) {
        if (err) {
            console.log("Error!");
            return null;
        }
        res.writeHead(200, { 'Content-Type': type });
        res.write(data);
        return res.end();
    });
}