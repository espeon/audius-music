module.exports = getLinks;

const request = require("request");
const { token, prefix, ytkey, sckey } = process.env;
const handleVideo = require("../functions/handleVideo");
const audius = require("../functions/sources/audius.js");
const soundcloud = require("../functions/sources/soundcloud.js");
const findLengthOfm3u8 = require("../functions/utils/findLengthOfm3u8");
const YouTube = require("simple-youtube-api");
const youtube = new YouTube(ytkey);

const needle = require('needle');
var mm = require("music-metadata");

const discord = require("discord.js");

async function getLinks(msg, url, voiceChannel) {
  if (url == undefined && msg.attachments.array().length == 0)
    throw "you didn't tell me what to play!";
  if (msg.attachments.array().length !== 0 ) {
    const ata = await JSON.stringify(msg.attachments);
    const final = await JSON.parse(ata);
    console.log(final)
    let input = final[0].proxyURL;
    if (
      !(input.endsWith("ogg") ||
      input.endsWith("mp3") ||
      input.endsWith("wav") ||
      input.endsWith("flac"))
    )
      return msg.send(
        "That is not a valid file format! Supported formats can be found here => <https://www.npmjs.com/package/music-metadata>"
      );
    let info = []
    let m = await readFileMetadata(final[0].proxyURL)
    info.id = final[0].id;
    info.title = discord.Util.escapeMarkdown(final[0].name);
    info.murl = final[0].proxyURL;
    info.streamlink = final[0].proxyURL;
    info.duration = Math.round(m.format.duration)
    // eslint-disable-line no-await-in-loop
    await handleVideo(info, msg, voiceChannel); // eslint-disable-line no-await-in-loop
  } else if ((url.endsWith("ogg") ||
      url.endsWith("mp3") ||
      url.endsWith("wav") ||
      url.endsWith("flac")) && url.startsWith("https://")) {
    let info = []
    let m = await readFileMetadata(url)
    info.id = url.split('/')[url.split("/").length -1].split(".")[0];
    info.title = m.common.title?m.common.title:url.split("/")[url.split("/").length -1].split(".")[0];
    info.murl = url;
    info.streamlink = url;
    info.duration = Math.round(m.format.duration)
    // eslint-disable-line no-await-in-loop
    await handleVideo(info, msg, voiceChannel); // eslint-disable-line no-await-in-loop
  } else if (url.includes("soundcloud.com")) {
    soundcloud(msg, url, voiceChannel);
  } else if (url.includes("audius.co")) {
    audius(msg, url, voiceChannel);
  } else if (
    url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)
  ) {
    const playlist = await youtube.getPlaylist(url);
    const videos = await playlist.getVideos();
    for (const video of Object.values(videos)) {
      let info = await youtube.getVideoByID(video.id);
      info.id = video.id;
      info.title = discord.Util.escapeMarkdown(video.title);
      info.murl = video.url;
      info.streamlink = video.url;
      info.duration = info.durationSeconds;
      // eslint-disable-line no-await-in-loop
      await handleVideo(info, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
    }
    return msg.channel.send(
      `✅ Playlist: **${playlist.title}** has been added to the queue!`
    );
  } else if (url.includes("youtube.com/watch?")) {
    let info = await youtube.getVideo(url);
    let video = info;
    info.id = video.id;
    info.title = discord.Util.escapeMarkdown(video.title);
    info.murl = video.url;
    info.streamlink = video.url;
    info.duration = video.durationSeconds;
    // eslint-disable-line no-await-in-loop
    return handleVideo(info, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
  } else {
    try {
      if (url == "") {
        return msg.channel.send("you didn't tell me what to play!!!");
      }

      var videos = await youtube.searchVideos(url, 10);
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
    info.duration = video.durationSeconds;
    return handleVideo(info, msg, voiceChannel);
  }
}
async function readFileMetadata(url){

      const stream = needle.get(url);

      return mm.parseStream(stream, null, {duration: true}).then(metadata => {
        console.log(metadata)
        return metadata
      });
}