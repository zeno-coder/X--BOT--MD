const fs = require("fs");

const FILE = "./chatMemory.json";

function loadMemory() {
    try {
        if (!fs.existsSync(FILE)) return {};
        const data = fs.readFileSync(FILE, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.log("Memory corrupted. Resetting...");
        return {};
    }
}
function saveMemory(data) {
    fs.writeFileSync(FILE + ".tmp", JSON.stringify(data, null, 2));
    fs.renameSync(FILE + ".tmp", FILE);
}

function addMessage(id, role, content) {
    const memory = loadMemory();

    if (!memory[id]) memory[id] = [];
    memory[id].push({ role, content });

    if (memory[id].length > 10)
        memory[id] = memory[id].slice(-10);

    saveMemory(memory);
}

function getMessages(id) {
    const memory = loadMemory();
    return memory[id] || [];
}

module.exports = { addMessage, getMessages };