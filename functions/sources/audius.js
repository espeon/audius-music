module.exports = audius;
const handleVideo = require("../../functions/handleVideo");
const request = require("request");
const findLengthOfm3u8 = require('../../functions/utils/findLengthOfm3u8')
async function audius(msg, url, voiceChannel) {
  if (url.includes("playlist")) {
    let id = url
      .replace("https://audius.co/", "")
      .split("-")
      .pop();
    async function e(options) {
      return new Promise(resolve => {
        request(options, async function(error, response, body) {
          let q = await JSON.parse(body);
          console.log(JSON.parse(body).data[0].title);
          resolve(JSON.parse(body).data[0]);
        });
      });
    }
    async function b(list) {
      for (const id of list) {
        options = {
          url: "https://discoveryprovider3.audius.co/tracks",
          qs: { id: id.track },
          headers: {
            Host: "discoveryprovider3.audius.co",
            Accept: "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0",
            json: true
          }
        };
        let q = await e(options);
        let info = [];
        info.id = id;
        info.title = q.title;
        info.murl = `https://kanbot-api.glitch.me/api/audius/generate.m3u8?id=${
          q.track_id
        }&title=${q.route_id.split("/")[1]}&handle=${q.route_id.split("/")[0]}`;
        info.duration = await findLengthOfm3u8(info.murl);
        info.streamlink = info.streamlink = `https://audius.co/${q.route_id}-${q.track_id}`;
        await handleVideo(info, msg, voiceChannel, true);
      }
    }

    let options = {
      url: "https://discoveryprovider3.audius.co/playlists",
      qs: { playlist_id: id },
      headers: {
        Host: "discoveryprovider3.audius.co",
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0",
        json: true
      }
    };
    request(options, async function(error, response, body) {
      let optionsarray = [];
      let list = JSON.parse(body).data[0].playlist_contents.track_ids;
      let res = await b(list);
      await console.log(res);
      return msg.channel.send(
        `✅ Playlist: **${
          JSON.parse(body).data[0].playlist_name
        }** has been added to the queue!`
      );
    });
  } else {
    let link = url;
    if (link.slice(0, -1) === "/") {
      link = link.slice(0, -1);
    }
    let username = link.replace("https://audius.co/", "").split("/")[0];
    let slugpre = decodeURIComponent(link)
      .replace("https://audius.co/", "")
      .split("/")[1]
      .split("-");
    slugpre.pop();
    let slug = slugpre.join("-");
    let id = link
      .replace("https://audius.co/", "")
      .split("-")
      .pop();
    console.log(id, slug, username);
    let options = {
      method: "POST",
      url: "https://discoveryprovider2.audius.co/tracks_including_unlisted",
      headers: { "Content-Type": "application/json" },
      body: {
        tracks: [
          {
            id: id,
            url_title: slug,
            handle: username
          }
        ]
      },
      json: true
    };
    request(options, async function(error, response, body) {
      // I don't even know how to switch this to axios - Bass
      if (body.success != true) {
        console.log(body);
        console.log(options.body);
        return msg.channel.send("This may not be a valid Audius link.");
      }

      let e = body;
      let info = [];
      info.id = id;
      info.title = `${e.data[0].title}・${username}`;
      info.murl = `https://kanbot-api.glitch.me/api/audius/generate.m3u8?id=${id}&title=${encodeURIComponent(
        slug
      )}&handle=${encodeURIComponent(username)}`;
      info.streamlink = link;
      info.duration = await findLengthOfm3u8(info.murl);
      return handleVideo(info, msg, voiceChannel);
    });
  }
}
