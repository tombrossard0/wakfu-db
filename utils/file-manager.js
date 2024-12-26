const { promises: fs } = require('node:fs');
const path = require('path');

function fsJobDone(err, path, type) {
    if (err) {
        console.log(err);
    } else {

        console.log(`${type}: ${path} done without error!`);
    }
}

async function readFile(file_path) {
    try {
        const data = await fs.readFile(path.join(__dirname, '../', file_path),
            { encoding: 'utf8', flag: 'r' });
        console.log(`readed ${file_path} successfully!`);
        return JSON.parse(data);
    } catch (err) {
        console.log(`Failed to read: ${file_path}`);
        throw err;
    }
}

async function writeFile(file_path, data) {
    await fs.writeFile(path.join(
        __dirname,
        '../', file_path),
        JSON.stringify(data),
        err => {
            if (err) {
                console.log(err);
            } else {
                console.log(`writted to ${file_path} successfully!`);
            }
        }
    );
}

module.exports = {
    readFile,
    writeFile,
}