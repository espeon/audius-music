const { Client, Util } = require("discord.js");
const { BOT_TOKEN, prefix, ytkey, sckey } = process.env;
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
const request = require("request");
const ydl = require("youtube-dl");

const client = new Client({ disableEveryone: true });

const youtube = new YouTube(ytkey);

let id = "id-001";
let title = "NGGYU";
let murl = "https://youtube.com";
let streamlink = "https://audius.co/this-is/a-link-1332"
let bitrate = 320

const queue = new Map();
let skip = false;

client.on("warn", console.warn);

client.on("error", console.error);

client.on("ready", () => {
  console.log(`okie! Prefix is ${prefix}`);
});

client.on("message", async msg => {
  // eslint-disable-line
  if (msg.author.bot) return undefined;
  if (!msg.content.startsWith(prefix)) return undefined;
  if (msg.channel.type === "dm") return undefined;

  const args = msg.content.split(" ");
  const searchString = args.slice(1).join(" ");
  const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
  const serverQueue = queue.get(msg.guild.id);

  let command = msg.content.toLowerCase().split(" ")[0];
  command = command.slice(prefix.length);

  if (command === "play" || command === "p") {
    const voiceChannel = msg.member.voice.channel;
    if (!voiceChannel)
      return msg.channel.send(
        "connecting to the vc you're in\nwait... you aren't in one!"
      );
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return msg.channel.send(
        "i may not have permissions to connect to vc... could someone please check?"
      );
    }
    if (!permissions.has("SPEAK")) {
      return msg.channel.send(
        "i may not have permissions to speak in vc... could someone please check?"
      );
    }

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
        await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
      }
      return msg.channel.send(
        `✅ Playlist: **${playlist.title}** has been added to the queue!`
      );
    } else {
      try {
        if (typeof url == "") {
          return msg.channel.send("you didn't tell me what to play!!!");
        }
        /*if (url.includes("soundcloud.com")) {
          request(
            `https://kanbot-api.glitch.me/api/sc/track?sc=${url}`,
            function(error, response, body) {
              console.log(body);
              if (response.statusCode == 404) {
                return msg.channel.send("This track can't be played.");
              }
              let soundcloud = JSON.parse(body);
              ydl.exec(url, ["-f", "mp3", "-g"], {}, (err, outp) => {
                id = "sc-" + soundcloud.id;
                title = soundcloud.title + " by " + soundcloud.user.username;
                murl = outp[0]; //soundcloud.stream_url + `?client_id=${sckey}`;
                return handleVideo(murl, msg, voiceChannel);
              });
            }
          );*/
          if (url.includes("soundcloud.com")) {
          request(
            `https://kanbot-api.glitch.me/api/sc/track?sc=${url}&v2=true`,
            function(error, response, body) {
              if (response.statusCode == 404) {
              console.log(body);
              return msg.channel.send("This track can't be played.");
            }
              let soundcloud = JSON.parse(body)[0]
              console.log(soundcloud.media.transcodings[0].url)
              request(
            soundcloud.media.transcodings[0].url + "?client_id=Vu5tlmvC9eCLFZkxXG32N1yQMfDSAPAA",
            function(error, response, body1) {
              if (response.statusCode == 404) {
              return msg.channel.send("This track can't be played.");
            }
              let play = JSON.parse(body1);
              console.log(play.url.replace(/&/gm, "%"))
              id = "sc-" + soundcloud.id + soundcloud.media.transcodings[0].preset;
              title = soundcloud.title + " by " + soundcloud.user.username;
              murl = play.url
              streamlink = url
              return handleVideo(murl, msg, voiceChannel);
            }
          );
            }
          );
        } else if (url.includes("audius")) {
          let link = url;
          if(link.slice(0, -1) === "/"){
            link = link.slice(0, -1)
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
          var options = {
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
          console.log(slug)
          request(options, function(error, response, body) {
            if (body.success != true) {
              console.log(body.success);
              return msg.channel.send("This may not be a valid Audius link.");
            }
            let soundcloud = body;
            id = id;
            title = soundcloud.data[0].title;
            murl = `https://kanbot-api.glitch.me/api/audius/generate.m3u8?id=${id}&title=${slug}&handle=${username}`;
            streamlink = link
            return handleVideo(murl, msg, voiceChannel);
          });
        } else {
          var video = await youtube.getVideo(url);
        }
      } catch (error) {
        try {
          if (searchString == "") {
            return msg.channel.send("you didn't tell me what to play!!!");
          }
          var videos = await youtube.searchVideos(searchString, 10);
          let index = 0;
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
              console.log("");
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

        id = video.id;
        title = Util.escapeMarkdown(video.title);
        murl = video.url;
        streamlink = video.url
        return handleVideo(video, msg, voiceChannel);
      }
    }
  } else if (command === "skip") {
    if (!msg.member.voice.channel)
      return msg.channel.send("Please join a voice channel first.");
    if (!serverQueue)
      return msg.channel.send(
        "There isn't anything playing! (wait this shouldn't happen ?????)"
      );
    serverQueue.connection.dispatcher.end("Skip command has been used!");
    skip = true;
    return undefined;
  } else if (command === "stop" || command === "leave" || command === "clear") {
    if (!msg.member.voice.channel)
      return msg.channel.send("Please join a voice channel first.");
    if (!serverQueue)
      return msg.channel.send(
        "There isn't anything playing! (wait this shouldn't happen ?????)"
      );
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end("Stop command has been used!");
    msg.channel.send("okie! queue has been cleared!");
    return undefined;
  } else if (command === "volume") {
    if (!msg.member.voice.channel)
      return msg.channel.send("You are not in a voice channel!");
    if (!serverQueue) return msg.channel.send("There is nothing playing.");
    if (!args[1])
      return msg.channel.send(
        `The current volume is **${serverQueue.volume}%**`
      );
    serverQueue.volume = args[1];
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 100);
    return msg.channel.send(`I set the volume to **${args[1]}%**`);
  } else if (command === "bitrate") {
    if (!msg.member.voice.channel)
      return msg.channel.send("You are not in a voice channel!");
    if (!serverQueue) return msg.channel.send("There is nothing playing.");
    if (!args[1])
      return msg.channel.send(
        `The current bitrate is **${serverQueue.bitrate}%kbps**`
      );
    if(args[1] > 320){
      args[1] = 320
    }
    if(args[1] < 1){
      args[1] = 1
    }
    serverQueue.bitrate = args[1];
    serverQueue.connection.dispatcher.setBitrate(args[1]);
    return msg.channel.send(`Bitrate was set to **${args[1]}kbps**`);
  } 
  else if (command === "np" || command === "nowplaying") {
    if (!serverQueue) return msg.channel.send("There is nothing playing.");
    return msg.channel.send(
      `🎶 Now playing: **${serverQueue.songs[0].title}**`
    );
  } else if (command === "queue" || command === "q") {
    if (!serverQueue) return msg.channel.send("There is nothing playing.");
    return msg.channel.send({
      embed: {
        title: `Queue:`,
        description: `${serverQueue.songs
          .map(song => `**-** [${song.title}](${song.link})`)
          .join("\n")}\n**Now playing: **[${
          serverQueue.songs[0].title
        }](serverQueue.songs[0].link)`
      }
    });
  } else if (command === "pause") {
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
      serverQueue.connection.dispatcher.pause();
      return msg.channel.send("okie! music has been paused.");
    }
    return msg.channel.send("There is nothing playing.");
  } else if (command === "resume") {
    if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      return msg.channel.send("i've resumed the music");
    }
    return msg.channel.send("There is nothing playing.");
  }

  return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
  const serverQueue = queue.get(msg.guild.id);
  const song = {
    id: id,
    title: title,
    url: murl,
    link: streamlink
  };
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: msg.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 100,
      playing: true,
      bitrate: bitrate
    };
    queue.set(msg.guild.id, queueConstruct);

    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(msg.guild, queueConstruct.songs[0]);
    } catch (error) {
      console.error(`I could not join the voice channel: ${error}`);
      queue.delete(msg.guild.id);
      return msg.channel.send(`I could not join the voice channel: ${error}`);
    }
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    if (playlist) return undefined;
    else
      return msg.channel.send(
        `okie! i've added **${song.title}** to the queue!`
      );
  }
  return undefined;
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    serverQueue.textChannel.send(
      "i've left as there's nothing in queue. to add me back in, just queue something up!"
    );
    queue.delete(guild.id);
    client.user.setActivity("some hot tunes", { type: "LISTENING" });
    return;
  }
  console.log(serverQueue.songs);
  console.log(song.url)
  if (song.url.includes("youtube")) {
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url), {
        volume: 0.5,
        bitrate: serverQueue.bitrate,
        passes: 10
      })
      .on("end", reason => {
        if (reason === "Stream is not generating quickly enough.")
          console.log("Song ended.");
        else console.log(reason);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  } else if (song.url.includes("sndcdn")) {
    const dispatcher = serverQueue.connection
      .play(song.url, {
        volume: 0.5,
        bitrate: serverQueue.bitrate,
        passes: 10
      })
      .on("end", reason => {
        if (reason === "Stream is not generating quickly enough.")
          console.log("Song ended.");
        else console.log(reason);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  } else if (song.url.includes("audius")) {
    const dispatcher = serverQueue.connection
      .play(song.url, {
        volume: 0.5,
        bitrate: serverQueue.bitrate,
        passes: 10
      })
      .on("end", reason => {
        if (reason === "Stream is not generating quickly enough.")
          console.log("Song ended.");
        else console.log(reason);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  }
  serverQueue.textChannel.send(`Now playing **${song.title}**`);
}

client.login(BOT_TOKEN);
