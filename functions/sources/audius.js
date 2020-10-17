module.exports = audius;
const handleVideo = require("../../functions/handleVideo");
const request = require("request");
const findLengthOfm3u8 = require("../../functions/utils/findLengthOfm3u8");
async function audius(msg, url, voiceChannel) {
  if (url.includes("/playlist/") || url.includes("/album/")) {
    let id = url
      .replace("https://audius.co/", "")
      .split("-")
      .pop();
    async function e(options) {
      return new Promise(resolve => {
        request(options, async function(error, response, body) {
          console.log(options)
          let q = await JSON.parse(body);
          console.log(JSON.parse(body).data[0].title);
          resolve(JSON.parse(body).data[0]);
        });
      });
    }
    async function b(list) {
      for (const id of list) {
        console.log(id.id)
        options = {
          url: "https://discoveryprovider3.audius.co/tracks?with_users=true",
          qs: { id: decodeHashId(id.id) }, 
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
        info.title = `${q.title}・${q.user.name}`;
        info.murl = `https://creatornode--linustek.repl.co/api/generate.m3u8?id=${
          q.track_id
        }&title=${encodeURIComponent(q.route_id.split("/")[1])}&handle=${encodeURIComponent(q.route_id.split("/")[0])}`;
        console.log(info.murl);
        info.duration = await findLengthOfm3u8(info.murl);
        info.streamlink = `https://audius.co/${q.route_id}-${q.track_id}`;

        await handleVideo(info, msg, voiceChannel, true);
      }
    }

    let options = {
      url: `https://discoveryprovider2.audius.co/v1/full/playlists/${encodeHashId(parseInt(id))}`,
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
      let list = JSON.parse(body).data[0].tracks;
      let res = await b(list);
      await console.log(res);
      return msg.channel.send(
        `✅ Playlist: **${
          JSON.parse(body).data[0].playlist_name
        }** has been added to the queue!`
      );
    });
  } else {
    let link = decodeURIComponent(url.replace("https://audius.co/", ""));
    console.log(url);
    if (link.slice(0, -1) === "/") {
      link = link.slice(0, -1);
    }
    let username = link.split("/")[0];
    let slugpre = link.split("/")[1].split("-");
    slugpre.pop();
    let slug = decodeURIComponent(slugpre.join("-"));
    let id = link.split("-").pop();
    console.log(id, slug, username);
    let options = {
      url:
        `https://discoveryprovider2.audius.co/v1/full/tracks/${encodeHashId(parseInt(id))}?url_title=${slug}&handle=${username}&show_unlisted=true`,
      headers: { "Content-Type": "application/json" },
      body: {
        tracks: [
          {
            id: parseInt(id),
            url_title: slug,
            handle: username
          }
        ]
      },
      json: true
    };
    request(options, async function(error, response, body) {
      // I don't even know how to switch this to axios - Bass
      let e = body;
      console.log(body);
      let info = [];
      if(body.data.is_delete) return msg.channel.send("This track has been deleted.")
      let legacy =
        body.data.is_unlisted || body.data.stem_of ? false : true;
      console.log(
        "legacy",
        body.data.is_unlisted || body.data.stem_of
          ? "enabled"
          : "disabled"
      );
      console.log({
        id: parseInt(id),
        url_title: slug,
        handle: body.data.user.name
      });
      info.id = parseInt(id);
      info.title = `${e.data.title}・${e.data.user.name}`;
      info.murl = legacy
        ? `audius://${info.id}`
        : `https://creatornode--linustek.repl.co/api/generate.m3u8?id=${
            info.id
          }&title=${encodeURIComponent(slug)}&handle=${encodeURIComponent(
            username
          )}`;
      info.streamlink = link;
      info.duration = link;
      return handleVideo(info, msg, voiceChannel);
    });
  }
}

const Hashids = require('hashids/cjs')

const HASH_SALT = 'azowernasdfoia'
const MIN_LENGTH = 5
const hashids = new Hashids(HASH_SALT, MIN_LENGTH)

/** Decodes a string id into an int. Returns null if an invalid ID. */
const decodeHashId = (id) => {
  try {
    const ids = hashids.decode(id)
    if (!ids.length) return null
    const num = Number(ids[0])
    if (isNaN(num)) return null
    return num
  } catch (e) {
    console.error(`Failed to decode ${id}`, e)
    return null
  }
}

const encodeHashId = (id) => {
  try {
    if (id === null) return null
    const encodedId = hashids.encode(id)
    return encodedId
  } catch (e) {
    console.error(`Failed to encode ${id}`, e)
    return null
  }
}