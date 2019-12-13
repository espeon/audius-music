module.exports = {
    name: 'np',
    description: 'Gets the currently playing song!',
    execute(bot, msg, args, serverQueue) {
        if (!serverQueue) {
            return msg.channel.send(`There is nothing playing.`)
        }
        return msg.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`)  
    },
}