module.exports = play

async function play(guild, song, bot) {
  const ytdl = require("ytdl-core")
  const serverQueue = global.queue.get(guild.id)

  if (!song) {
    serverQueue.voiceChannel.leave()
    serverQueue.textChannel.send(
      "i've left as there's nothing in queue. to add me back in, just queue something up!"
    )
    global.queue.delete(guild.id)
    return
  }
  console.log(serverQueue.songs)
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
  }
  serverQueue.textChannel.send(`Now playing **${song.title}**`)
}