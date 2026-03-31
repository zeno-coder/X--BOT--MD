const { Sparky, isPublic, spdl } = require("../lib");
const { getJson, extractUrlsFromText, getString, isUrl } = require("./pluginsCore");
const { addMessage, getMessages } = require("../lib/chatMemory");
const axios = require('axios');
const fetch = require('node-fetch');
const gis = require("g-i-s");
const config = require("../config.js");
const lang = getString('download');


Sparky(
    {
        name: "insta",
        fromMe: isPublic,
        desc: "Instagram media downloader - download images and videos from Instagram",
        category: "downloader",
    },
    async ({
        m, client, args
    }) => {
        args = args || m.quoted?.text;
        if (!args) return await m.reply(lang.NEED_URL);
        //if (isUrl(args)) return await m.reply(lang.NOT_URL);
        try {
            await m.react('☠️');
            let response = await getJson(config.API + "/api/downloader/igdl?url=" + args);
            for (let i of response.data) {
                await m.sendMsg(m.jid, i.url, { quoted: m }, i.type)
            }
            await m.react('🍻');
        } catch (e) {
            console.log(e);
            await m.react('❌');
        }
    }
);

Sparky({
    name: "nana",
    fromMe: isPublic,
    category: "misc",
    desc: "AI chat with memory"
},
async ({ m, args }) => {

    args = args || m.quoted?.text;
    if (!args) return m.reply("Hi NANA HERE🎈");

    try {

const chatId = m.jid;
let history = getMessages(chatId) || [];
history = history
  .filter(msg => msg && msg.role && msg.content)
  .map(msg => ({
    role: msg.role,
    content: String(msg.content)
  }));

const messages = [
  {
    role: "system",
    content: "You are NANA, a helpful WhatsApp AI assistant."
  },
  ...history,
  { role: "user", content: args }
];

const res = await axios.post(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    model: "llama-3.1-8b-instant",
    messages: messages
  },
  {
    headers: {
      Authorization: `Bearer ${config.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    }
  }
);

const reply = res.data.choices[0].message.content;
addMessage(chatId, "user", args);
addMessage(chatId, "assistant", reply);

return m.reply(reply);

    } catch (err) {
    console.log("STATUS:", err.response?.status);
    console.log("DATA:", err.response?.data);
    console.log("MESSAGE:", err.message);
    return m.reply("AI broke ☠️");
}
});

// Sparky({
//     name: "apk",
//     fromMe: isPublic,
//     category: "downloader",
//     desc: "Find and download APKs from Aptoide by app ID",
// },
// async ({
//     m, client, args
// }) => {
//     let appId = args || m.quoted?.text;
//     if (!appId) return await m.reply(lang.NEED_Q);

//     try {
//         await m.react('⬇️');

//         const { result: appInfo } = await getJson(AP + "download/aptoide?id=" + appId);
        
//         await client.sendMessage(m.jid, {
//             document: {
//                 url: appInfo.link
//             },
//             fileName: appInfo.appname,
//             caption: `App Name: ${appInfo.appname}\nDeveloper: ${appInfo.developer}`,
//             mimetype: "application/vnd.android.package-archive"
//         }, {
//             quoted: m
//         });
//         await m.react('✅');
//     } catch (error) {
//         await m.react('❌');
//         console.error(error);
//     }
// });

Sparky({
    name: "img",
    fromMe: isPublic,
    desc: "Search images (Pexels)",
    category: "downloader",
}, async ({ m, args }) => {
    try {
        if (!args) return m.reply("Enter query bro\nExample: img car,5");

        let [query, amount] = args.split(",");
        amount = parseInt(amount) || 5;

        await m.reply(`🔍 Searching ${amount} images for *${query}*...`);

        const res = await axios.get(
            "https://api.pexels.com/v1/search",
            {
                headers: {
                    Authorization: config.PEXELS_KEY
                },
                params: {
                    query: query,
                    per_page: amount
                }
            }
        );

        const images = res.data.photos;

        if (!images || images.length === 0) {
            return m.reply("No images found ❌");
        }

        for (let img of images) {
            await m.sendMsg(m.jid, img.src.medium, {}, "image");
        }

    } catch (e) {
        console.log("PEXELS ERROR:", e.response?.data || e.message);
        await m.reply("Error fetching images ❌");
    }
});
Sparky({
    name: "pintrest",
    fromMe: isPublic,
    category: "downloader",
    desc: "Download images from Pinterest",
},
async ({ m, args }) => {
    try {
        let url = args || m.quoted?.text;
        if (!url) return await m.reply("❌ Give Pinterest URL");

        await m.react('⬇️');

        const res = await getJson(`https://api.itzpire.com/download/pinterest?url=${url}`);

        console.log("API RESPONSE:", res);

        const data = res?.data;

        if (!data || !data.images || data.images.length === 0) {
            await m.react('❌');
            return m.reply("❌ No images found");
        }

        await m.reply(`📥 Downloading ${data.images.length} images...`);

        // 🔥 send all images
        for (let img of data.images) {
            await m.sendMsg(m.jid, img, {}, "image");
        }

        await m.react('✅');

    } catch (err) {
        console.log(err);
        await m.react('❌');
        m.reply("❌ Pinterest download failed");
    }
});

Sparky({
    name: "fb",
    fromMe: isPublic,
    category: "downloader",
    desc: "Download files from Facebook by providing a valid URL",
},
async ({
    m, client, args
}) => {
    try {
        let match = args || m.quoted?.text;
        if (!match) return await m.reply(lang.NEED_URL);
        await m.react('⬇️');
        const data = await getJson(config.API + "/api/downloader/fbdl?url=" + match);
        await m.sendFromUrl(data.data.high, { caption: data.data.title });
        await m.react('✅');
    } catch (error) {
        await m.react('❌');
        return m.reply(error);
    }
});

Sparky({
    name: "spotify",
    fromMe: isPublic,
    category: "downloader",
    desc: "play a song"
  },
  async ({
    m, client, args
  }) => {
    try {
        args = args || m.quoted?.text;
        if(!args) return await m.reply(lang.NEED_Q);
  await m.react('🔎');
  const ser = await getJson(config.API + "/api/search/spotify?search=" + args)
  const play = ser.data[0];
        await m.react('⬇️');
        await m.reply(`_Downloading ${play.name} By ${play.artists}_`)
  const url = await spdl(play.link);
  await m.sendMsg(m.jid , url, { mimetype: "audio/mpeg" } , "audio")
   await m.react('✅');     
    } catch (error) {
        await m.react('❌');
        m.reply(error);
    }
  });

  Sparky({
    name: "spotifydl",
    fromMe: isPublic,
    category: "downloader",
    desc: "play a song"
  },
  async ({
    m, client, args
  }) => {
    try {
        args = args || m.quoted?.text;
        if(!args) return await m.reply(lang.NEED_URL);
        await m.react('⬇️');
  const url = await spdl(args);
  await m.sendMsg(m.jid , url, { mimetype: "audio/mpeg" } , "audio")
   await m.react('✅');     
    } catch (error) {
        await m.react('❌');
        m.reply(error);
    }
  });

Sparky({
    name: "fire",
    fromMe: isPublic,
    category: "downloader",
    desc: "Download media from XNXX by search or URL",
},
async ({
    m, client, args
}) => {
    try {
        let match = args || m.quoted?.text;
        if (!match) return await m.reply(lang.NEED_Q);
            await m.react('☠️');
            const { result } = await getJson(config.API + "/api/search/xnxx?search=" + match);
            await m.react('👄');
            var xnxx = result.result[0].link
            const xdl = await getJson(`${config.API}/api/downloader/xnxx?url=${xnxx}`)
            await m.sendFromUrl(xdl.data.files.high, { caption: xdl.data.title });
        await m.react('💦');
    } catch (error) {
        await m.react('❌');
        m.reply(error);
    }
});


Sparky({
    name: "terabox",
    fromMe: isPublic,
    category: "downloader",
    desc: "Download files from TeraBox by providing a valid URL",
},
async ({
    m, client, args
}) => {
    try {
        let match = args || m.quoted?.text;
        if (!match) return await m.reply(lang.NEED_URL);
        await m.react('⬇️');
        const { data } = await getJson(config.API + "/api/downloader/terrabox?url=" + match);
        await m.sendFromUrl(data.dlink, { caption: data.filename });
        await m.react('✅');
    } catch (error) {
        await m.react('❌');
        console.error(error);
    }
});


Sparky({
    name: "gitclone",
    fromMe: isPublic,
    category: "downloader",
    desc: "Download GitHub repositories as ZIP files",
},
async ({
    m, client, args
}) => {
    try {
        let match = args || m.quoted?.text;
        if (!isUrl(match)) return await m.reply(lang.NEED_URL)
        await m.react('⬇️');
        let user = match.split("/")[3];
        let repo = match.split("/")[4];
        const msg = await m.reply(lang.DOWNLOADING);
        await client.sendMessage(m.jid, {
            document: {
                url: `https://api.github.com/repos/${user}/${repo}/zipball`
            },
            fileName: repo,
            mimetype: "application/zip"
        }, {
            quoted: m
        });
        await m.react('✅');
    } catch (error) {
        await m.react('❌');
        console.error(error);
    }
});
