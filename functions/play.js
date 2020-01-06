module.exports = play
const handleVideo = require("../functions/handleVideo");
async function play(guild, songe, bot) {
  const ytdl = require("ytdl-core")
  const leaveVC = require("../functions/leaveVC")
  const serverQueue = global.queue.get(guild.id)

  if (!songe) {
    leaveVC(serverQueue, guild, true)
    return
  }
  let song = serverQueue.songs[0]
  console.log(serverQueue.songs[0])
  console.log(song)
  if (song.url.includes("youtube")) {
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url), {
        volume: 0.5,
        bitrate: serverQueue.bitrate,
        passes: 10
      })
      .on("end", reason => {
        if (reason === "Stream is not generating quickly enough.")
          console.log("Song ended.")
        else console.log(reason)
        serverQueue.songs.shift()
        play(guild, serverQueue.songs[0])
      })
      .on("error", error => console.error(error))
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100)
  } else if (song.url.includes("sndcdn")) {
    const dispatcher = serverQueue.connection
      .play(song.url, {
        volume: 0.5,
        bitrate: serverQueue.bitrate,
        passes: 10
      })
      .on("end", reason => {
        if (reason === "Stream is not generating quickly enough.")
          console.log("Song ended.")
        else console.log(reason)
        serverQueue.songs.shift()
        play(guild, serverQueue.songs[0])
      })
      .on("error", error => console.error(error))
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100)
  } else if (song.url.includes("audius")) {
    const dispatcher = serverQueue.connection
      .play(song.url, {
        volume: 0.5,
        bitrate: serverQueue.bitrate,
        passes: 50
      })
      .on("end", reason => {
        if (reason === "Stream is not generating quickly enough.")
          console.log("Song ended.")
        else console.log(reason)
        serverQueue.songs.shift()
        play(guild, serverQueue.songs[0])
      })
      .on("error", error => console.error(error))
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100)
  }
  serverQueue.textChannel.send(`Now playing **${song.title}**`)
}