module.exports = play;
const handleVideo = require("../functions/handleVideo");
async function play(guild, songe) {
  const ytdl = require("ytdl-core");
  const leaveVC = require("../functions/leaveVC");
  const serverQueue = global.queue.get(guild.id);
  const Audius = require("@audius/audius.js");

  if(global.audius == null){
  global.audius = new Audius({
    analyticsId: "audius_bot_prod"
  });
  }

  if (!songe) {
    leaveVC(serverQueue, guild, true);
    return;
  }
  let song = serverQueue.songs[0];
  console.log(serverQueue.songs[0]);
  console.log(song);
  if (song.url.includes("youtube")) {
    const dispatcher = serverQueue.connection
      .play(await ytdl(song.url, {
              quality: 'highestaudio',
              highWaterMark: 1024 * 1024 * 10
            }), {
        volume: 0.5,
        bitrate: serverQueue.bitrate,
        passes: 2
      })
      .on("finish", reason => {
        if (reason === "Stream is not generating quickly enough.")
          console.log("Song ended.");
        else console.log(reason);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  } else if(song.url.includes("audius:")) {
    console.log(song.url);
    const dispatcher = serverQueue.connection
      .play(await global.audius.getAudioStreamURL(song.url.replace("audius://", "")), {
        volume: 0.5,
        bitrate: serverQueue.bitrate,
        passes: 2,
        highWaterMark: 512,
        fec: true
      })
      .on("finish", reason => {
        if (reason === "Stream is not generating quickly enough.")
          console.log("Song ended.");
        else console.log(reason);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => {
        console.error(error);
        console.log("aaa");
      });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  } else {
    console.log(song.url);
    const dispatcher = serverQueue.connection
      .play(song.url, {
        bitrate: serverQueue.bitrate,
        passes: 2,
      })
      .on("finish", reason => {
        if (reason === "Stream is not generating quickly enough.")
          console.log("Song ended.");
        else console.log(reason);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => {
        console.error(error);
        console.log("aaa");
      });
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100);
  }
  serverQueue.textChannel.send(`Now playing **${song.title}**`);
}

let getAudiusStreamURL = async (audius, id) => {
  const url = await audius.getAudioStreamURL(id)
  return url
}
