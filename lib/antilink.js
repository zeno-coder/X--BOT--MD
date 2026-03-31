const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "antilinkDB.json");
function loadDB() {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE));
}

function saveDB(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}


function getAntiLink(jid) {
    const db = loadDB();
    return db[jid] || { enabled: false, action: "warn", allowedUrls: "null" };
}

function setAntiLink(jid, value) {
    const db = loadDB();

    if (!db[jid]) {
        db[jid] = { enabled: false, action: "warn", allowedUrls: "null" };
    }

    if (typeof value === "boolean") {
        db[jid].enabled = value;
    } else {
        db[jid].action = value;
    }

    saveDB(db);
}

function setAllowedUrl(jid, urls) {
    const db = loadDB();

    if (!db[jid]) {
        db[jid] = { enabled: false, action: "warn", allowedUrls: "null" };
    }

    db[jid].allowedUrls = urls;

    saveDB(db);
}

function normalizeUrl(url) {
    return url
        .replace(/https?:\/\//, '')
        .replace('www.', '')
        .split('/')[0]
        .toLowerCase();
}


module.exports = {
    getAntiLink,
    setAntiLink,
    setAllowedUrl,
    normalizeUrl
};