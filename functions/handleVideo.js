module.exports = handleVideo
let bitrate = 320
async function handleVideo(video, msg, voiceChannel, playlist = false) {
    const play = require("../functions/play");
    const serverQueue = global.queue.get(msg.guild.id)
    const song = {
      id: video.id,
      title: video.title,
      url: video.murl,
      link: video.streamlink,
      duration: video.duration
    }
    if (!serverQueue) {
      const queueConstruct = {
        textChannel: msg.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 100,
        playing: true,
        bitrate: voiceChannel.bitrate / 1000
      }
      global.queue.set(msg.guild.id, queueConstruct)
  
      queueConstruct.songs.push(song)
  
      try {
        let connection = await voiceChannel.join()
        queueConstruct.connection = connection
        play(msg.guild, queueConstruct.songs[0])
      } catch (error) {
        console.error(`I could not join the voice channel: ${error}`)
        global.queue.delete(msg.guild.id)
        return msg.channel.send(`I could not join the voice channel: ${error}`)
      }
    } else {
      serverQueue.songs.push(song)
      if (playlist) return undefined
      else
        return msg.channel.send(
          `okie! i've added **${song.title}** to the queue!`
        )
    }
    return undefined
  }