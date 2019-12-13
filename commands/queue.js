module.exports = {
    name: 'queue',
    description: 'Gets the music queue!',
    aliases: ['q'],
    execute(bot, msg, args, serverQueue) {
        if (!serverQueue) {
            return msg.channel.send(`There is nothing playing.`)
        }
        return msg.channel.send({
        embed: { // Does this even work? Thought you needed to get the RichEmbed module from discord.js - Bass
            title: `Queue:`,
            description: `${serverQueue.songs.map(song => `**-** [${song.title}](${song.link})`)
            .join("\n")}\n**Now playing: **[${serverQueue.songs[0].title}]${serverQueue.songs[0].link}`
        }
        })  
    },
}