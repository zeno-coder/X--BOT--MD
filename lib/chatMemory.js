const fs = require("fs");

const FILE = "./chatMemory.json";

function loadMemory() {
    if (!fs.existsSync(FILE)) return {};
    return JSON.parse(fs.readFileSync(FILE));
}

function saveMemory(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function addMessage(id, role, content) {
    const memory = loadMemory();

    if (!memory[id]) memory[id] = [];
    memory[id].push({ role, content });

    // Limit memory (avoid huge tokens)
    if (memory[id].length > 10)
        memory[id] = memory[id].slice(-10);

    saveMemory(memory);
}

function getMessages(id) {
    const memory = loadMemory();
    return memory[id] || [];
}

module.exports = { addMessage, getMessages };
