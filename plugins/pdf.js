const {Sparky, isPublic} = require("../lib");
const {getString, getJson} = require('./pluginsCore');
const PDFDocument = require("pdfkit");
const { PDFDocument: PDFLib } = require("pdf-lib"); 
const lang = getString('converters');
let fs = require('fs');
let pdfStore = {};
let mergePdfStore = {};

Sparky({
    name: "addimg",
    fromMe: isPublic,
    category: "converters",
    desc: "Add image to PDF list",
}, async ({ m }) => {

    if (!m.quoted || !m.quoted.message.imageMessage) {
        return m.reply("❌ Reply to an image");
    }

    await m.react("☠️");

    const buffer = await m.quoted.download();

    if (!pdfStore[m.jid]) pdfStore[m.jid] = [];

    pdfStore[m.jid].push({
        type: "image",
        content: buffer
    });

    await m.react("🍻");
    m.reply(`🖼️ Image added (${pdfStore[m.jid].length})`);
});

Sparky({
    name: "addtext",
    fromMe: isPublic,
    category: "converters",
    desc: "Add text to PDF",
}, async ({ m }) => {

    const text = m.quoted?.text || m.text.split(" ").slice(1).join(" ");

    if (!text) return m.reply("❌ Provide or reply to text");

    if (!pdfStore[m.jid]) pdfStore[m.jid] = [];

    pdfStore[m.jid].push({
        type: "text",
        content: text
    });

    m.reply(`📝 Text added (${pdfStore[m.jid].length})`);
});

Sparky({
    name: "pdf",
    fromMe: isPublic,
    category: "converters",
    desc: "Convert stored images into PDF",
}, async ({ m, client }) => {

    try {
        if (!pdfStore[m.jid] || pdfStore[m.jid].length === 0) {
            return m.reply("⚠️ No images stored");
        }

        await m.react("☠️");

        const filePath = `./temp_${Date.now()}.pdf`;
        const doc = new PDFDocument();

        doc.pipe(fs.createWriteStream(filePath));

pdfStore[m.jid].forEach((item, index) => {

    if (index !== 0) doc.addPage();

    if (item.type === "image") {
        doc.image(item.content, {
            fit: [500, 700],
            align: "center",
            valign: "center"
        });
    }

    if (item.type === "text") {
        doc
          .fontSize(16)
          .text(item.content, {
              align: "left"
          });
        }
        });
        

        doc.end();

        setTimeout(async () => {
            await client.sendMessage(m.jid, {
                document: fs.readFileSync(filePath),
                mimetype: "application/pdf",
                fileName: "xbotmd.pdf"
            }, { quoted: m });

            fs.unlinkSync(filePath);
            pdfStore[m.jid] = []; 

            await m.react("🍻");
        }, 2000);

    } catch (err) {
        console.log(err);
        await m.react("❌");
        m.reply("Error creating PDF 😅");
    }
});

Sparky({
    name: "clearimg",
    fromMe: isPublic,
    category: "converters",
    desc: "Clear stored images",
}, async ({ m }) => {
    pdfStore[m.jid] = [];
    m.reply("🗑️ Cleared stored images");
});

Sparky({
    name: "cleartext",
    fromMe: isPublic,
    category: "converters",
    desc: "Clear stored text + images",
}, async ({ m }) => {
    pdfStore[m.jid] = [];
    m.reply("🗑️ Cleared all PDF content");
});

Sparky({
    name: "addpdf",
    fromMe: isPublic,
    category: "converters",
    desc: "Add PDF to merge list",
}, async ({ m }) => {

    if (!m.quoted || !m.quoted.message.documentMessage) {
        return m.reply("❌ Reply to a PDF file");
    }

    const mime = m.quoted.message.documentMessage.mimetype;
    if (!mime.includes("pdf")) {
        return m.reply("❌ Only PDF files allowed");
    }

    await m.react("☠️");

    const buffer = await m.quoted.download();

    if (!mergePdfStore[m.jid]) mergePdfStore[m.jid] = [];

    mergePdfStore[m.jid].push(buffer);

    await m.react("🍻");
    m.reply(`📄 PDF added (${mergePdfStore[m.jid].length})`);
});

Sparky({
    name: "mergepdf",
    fromMe: isPublic,
    category: "converters",
    desc: "Merge added PDFs",
}, async ({ m, client }) => {

    const files = mergePdfStore[m.jid];

    if (!files || files.length < 2) {
        return m.reply("❌ Need at least 2 PDFs");
    }

    try {
        await m.react("☠️");

        const mergedPdf = await PDFLib.create();


        for (let file of files) {
            const pdf = await PDFLib.load(file);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

            pages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedBytes = await mergedPdf.save();

        await client.sendMessage(
            m.jid,
            {
                document: Buffer.from(mergedBytes),
                mimetype: "application/pdf",
                fileName: "xbotmdmerged.pdf"
            },
            { quoted: m }
        );

        mergePdfStore[m.jid] = [];

        await m.react("🍻");

    } catch (err) {
        console.log(err);
        await m.react("❌");
        m.reply("Error merging PDFs 😅");
    }
});

Sparky({
    name: "clearpdf",
    fromMe: isPublic,
    category: "converters",
    desc: "Clear stored PDFs",
}, async ({ m }) => {
    mergePdfStore[m.jid] = [];
    m.reply("🗑️ Cleared stored PDFs");
});
