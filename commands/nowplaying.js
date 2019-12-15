module.exports = {
    name: 'nowplaying',
    description: 'Gets the currently playing song!',
    aliases: ['np'],
    execute(bot, msg, args, serverQueue) {
        if (!serverQueue) {
            return msg.channel.send(`There is nothing playing.`)
        }
        return msg.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`)  
    },
}