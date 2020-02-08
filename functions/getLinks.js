module.exports = getLinks;
async function getLinks(msg, argu, voiceChannel, youtube) {
  const handleVideo = require("../functions/handleVideo");
  const discord = require("discord.js");
  const axios = require("axios");
  const request = require("request");
  const { token, prefix, ytkey, sckey } = process.env;
  let args = JSON.parse(argu).join(" ");
  if (args.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
    const playlist = await youtube.getPlaylist(args);
    const videos = await playlist.getVideos();
    for (const video of Object.values(videos)) {
      let info = await youtube.getVideoByID(video.id);
      info.id = video.id;
      info.title = discord.Util.escapeMarkdown(video.title);
      info.murl = video.url;
      info.streamlink = video.url;
      // eslint-disable-line no-await-in-loop
      await handleVideo(info, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
    }
    return msg.channel.send(
      `✅ Playlist: **${playlist.title}** has been added to the queue!`
    );
  } else {
    let url = args;
    console.log(url);
    try {
      if (typeof url == "") {
        return msg.channel.send("you didn't tell me what to play!!!");
      }
      /* for soundcloud's v1 API
            
            if (url.includes("soundcloud.com")) {
            request(
                `https://kanbot-api.glitch.me/api/sc/track?sc=${url}`,
                function(error, response, body) {
                console.log(body)
                if (response.statusCode == 404) {
                    return msg.channel.send("This track can't be played.")
                }
                let soundcloud = JSON.parse(body)
                ydl.exec(url, ["-f", "mp3", "-g"], {}, (err, outp) => {
                    id = "sc-" + soundcloud.id
                    title = soundcloud.title + " by " + soundcloud.user.username
                    murl = outp[0] //soundcloud.stream_url + `?client_id=${sckey}`
                    return handleVideo(murl, msg, voiceChannel)
                })
                }
            )   soundcloud's v2 API*/
      if (url.includes("soundcloud.com")) {
        request(
          `https://kanbot-api.glitch.me/api/sc/track?sc=${url}&v2=true`,
          function(error, response, body) {
            if (response.statusCode == 404) {
              console.log(body);
              return msg.channel.send("This track can't be played.");
            }
            let soundcloud = JSON.parse(body)[0];
            request(
              soundcloud.media.transcodings[0].url +
                `?client_id=${sckey}`,
              function(error, response, body1) {
                if (response.statusCode == 404) {
                  return msg.channel.send("This track can't be played.");
                }
                let play = JSON.parse(body1);
                console.log(play.url.replace(/&/gm, "%"));
                let info = [];
                info.id =
                  "sc-" +
                  soundcloud.id +
                  soundcloud.media.transcodings[0].preset;
                info.title =
                  soundcloud.title + " by " + soundcloud.user.username;
                info.murl = play.url;
                info.streamlink = url;
                return handleVideo(info, msg, voiceChannel);
              }
            );
          }
        );
      } else if (url.includes("audius.co")) {
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
                }&title=${q.route_id.split("/")[1]}&handle=${
                  q.route_id.split("/")[0]
                }`;
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
          let options = {
            method: "POST",
            url:
              "https://discoveryprovider2.audius.co/tracks_including_unlisted",
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
          request(options, function(error, response, body) {
            // I don't even know how to switch this to axios - Bass
            if (body.success != true) {
              console.log(body.success);
              return msg.channel.send("This may not be a valid Audius link.");
            }
            let soundcloud = body;
            let info = [];
            info.id = id;
            info.title = soundcloud.data[0].title;
            info.murl = `https://kanbot-api.glitch.me/api/audius/generate.m3u8?id=${id}&title=${encodeURIComponent(
              slug
            )}&handle=${encodeURIComponent(username)}`;
            info.streamlink = link;
            return handleVideo(info, msg, voiceChannel);
          });
        }
      } else {
        let video = await youtube.getVideo(url);
      }
      if(url.includes("youtube.com/")){
        console.log("youtube video")
      let info = await youtube.getVideo(url);
        let video = info
      info.id = video.id;
      info.title = discord.Util.escapeMarkdown(video.title);
      info.murl = video.url;
      info.streamlink = video.url;
      // eslint-disable-line no-await-in-loop
      return handleVideo(info, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
      }
    } catch (error) {
      try {
        if (args == "") {
          return msg.channel.send("you didn't tell me what to play!!!");
        }
        
        var videos = await youtube.searchVideos(args, 10);
        let index = 0;
        if (videos.map.size == 0) throw "No videos found";
        msg.channel
          .send(
            `
__**Song selection:**__
${videos.map(video2 => `**${++index} -** ${video2.title}`).join("\n")}
					`
          )
          .then(msg =>
            setTimeout(function() {
              msg.delete();
            }, 10500)
          );
        // eslint-disable-next-line max-depth
        try {
          setTimeout(function() {
            //nothing lol
          }, 250);
          const filter = m => m.content > 0 && m.content < 11;
          var response = await msg.channel.awaitMessages(filter, {
            max: 1,
            time: 10000,
            errors: ["time"]
          });
        } catch (err) {
          console.error("error: " + err);
          if (typeof response != undefined) {
            return msg.channel.send(
              "It looks like you've entered something I wasn't expecting. Could you please try again?"
            );
          } else {
            return;
          }
        }
        const videoIndex = parseInt(response.first().content);
        var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
      } catch (err) {
        console.error(err);
        return msg.channel.send("i couldn't get any results.");
      }
      let info = [];
      info.id = video.id;
      info.title = discord.Util.escapeMarkdown(video.title);
      info.murl = video.url;
      info.streamlink = video.url;
      return handleVideo(info, msg, voiceChannel);
    }
  }
}
