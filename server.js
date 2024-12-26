const express = require('express');
const axios = require('axios');
const http = require('http');

const WebSocket = require('ws');

const path = require('path');
const { readFile, writeFile } = require('./utils/file-manager.js');

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("static"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/index.html')); 
});

app.get('/data/:name', (req, res) => {
    res.sendFile(path.join(__dirname, `static/data/${req.params.name}.json`));
});

wss.on('connection', async (ws) => {
    console.log("Client connected via WebSocket.");

    await updateDB();
    console.log("done!");

    const sendData = async (data, type) => {
        try {
            ws.send(JSON.stringify({ error: false, type: type, data: data }));
        } catch (err) {
            console.error('Error fetching data:', err);
            ws.send(JSON.stringify({ error: true, type: "error", message: 'Failed to fetch data' }));
        }
    };

    try {
        sendData(await readFile('static/data/version.json'), "version");
    } catch (err) {
        ws.send(JSON.stringify({ error: true, type: "error", message: 'Failed to read data' }));
    }

    ws.on('close', () => {
        console.log('Client disconnected.');
    });
});

async function updateDB() {
    console.log("Checking for updating the db...");

    let old_version = null;

    try {
        old_version = (await readFile('static/data/version.json')).version;
    } catch (err) { // File not found (no version exists in the db)
        // Do nothing
        console.log("No version exists!");
    }

    try {
        const new_version_data = (await axios.get("https://wakfu.cdn.ankama.com/gamedata/config.json")).data;
        const new_version = new_version_data.version;

        if (old_version !== new_version) {
            console.log("Updating the version...");
            await writeFile('static/data/version.json', new_version_data);

            console.log("Updating all data");

            const files = [
                "actions",
                "blueprints",
                "collectibleResources",
                "equipmentItemTypes",
                "harvestLoots",
                "itemTypes",
                "itemProperties",
                "items",
                "jobsItems",
                "recipeCategories",
                "recipeIngredients",
                "recipeResults",
                "recipes",
                "resourceTypes",
                "resources",
                "states"
            ];

            for (const file of files) {
                try {
                    const data = (await axios.get(`https://wakfu.cdn.ankama.com/gamedata/${new_version}/${file}.json`)).data;
                    await writeFile(`static/data/${file}.json`, data);
                } catch (err) {
                    console.log(`${file}.json doesn't exist.`);
                }
            }
        }
    } catch (err) {
        throw err;
    }

    console.log("Check done successfully!");
}

app.listen(port, async () => {
    console.log(`app listening on port ${port}`);
});
