async function processMessage(message) {
    const data = message.data;

    if (message.error) {
        console.log(message.message);
        return;
    }

    if (message.type === "version") {
        const version_txt = document.getElementById("version");
        version_txt.innerText += data.version;
    }
}

const ws = new WebSocket(`ws://wakfu-db.onrender.com:8080`);

ws.onopen = () => {
    console.log("WebSocket connection established");
}

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    processMessage(message);
};

ws.onclose = () => {
    console.log('WebSocket connection closed.');
};
