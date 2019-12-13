module.exports = handleVideo

function handleVideo(video, msg, voiceChannel, playlist = false, queue) {
    const serverQueue = queue.get(msg.guild.id)
    const song = {
      id: id,
      title: title,
      url: murl,
      link: streamlink
    }
    if (!serverQueue) {
      const queueConstruct = {
        textChannel: msg.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 100,
        playing: true,
        bitrate: bitrate
      }
      queue.set(msg.guild.id, queueConstruct)
  
      queueConstruct.songs.push(song)
  
      try {
        let connection = voiceChannel.join()
        .then(() => {
          queueConstruct.connection = connection
          play(msg.guild, queueConstruct.songs[0])
        })
        
      } catch (error) {
        console.error(`I could not join the voice channel: ${error}`)
        queue.delete(msg.guild.id)
        return msg.channel.send(`I could not join the voice channel: ${error}`)
      }
    } else {
      serverQueue.songs.push(song)
      console.log(serverQueue.songs)
      if (playlist) return undefined
      else
        return msg.channel.send(
          `okie! i've added **${song.title}** to the queue!`
        )
    }
    return undefined
  }