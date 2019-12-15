const Discord = require('discord.js')
const YouTube = require(`simple-youtube-api`)
const ytdl = require(`ytdl-core`)
const ydl = require(`youtube-dl`)
const fs = require('fs') // For reading command files - Bass
let m // Message placeholder - Bass
const bot = new Discord.Client({ disableEveryone: true })
bot.commands = new Discord.Collection()
const { token, prefix, ytkey, sckey } = require('./config.json')
const youtube = new YouTube(ytkey)

const commandFiles = fs.readdirSync('./commands') // read the folder that holds the commands, 
                                                  // and blocks all other code from running until it completes
for (const file of commandFiles) {                // for each file in commandFiles...
  const command = require(`./commands/${file}`)   // ...require it...
  bot.commands.set(command.name, command)         // ...and add to list of commands
}

let id = `id-001`
let title = `NGGYU`
let murl = `https://youtube.com`
let streamlink = `https://audius.co/this-is/a-link-1332`
let bitrate = 320

const queue = new Map()

bot.on(`warn`, console.warn)
bot.on(`error`, console.error)

bot.on(`ready`, () => {
  console.log(`Online and ready to DJ! Prefix is ${prefix}`)
})

bot.on(`voiceStateUpdate`, (n, member) => { // Makes sure the bot leaves the vc
  let vc = member.voiceChannel

  if (vc.members.array().length == 0) {
    vc.leave()
  }
})
bot.on(`message`, async msg => {
  m = msg // Used for errors

  // eslint-disable-line
  if (!msg.content.startsWith(prefix) || msg.author.bot) {
    return // No need for `return undefined` - Bass
  }
  // if (msg.channel.type === `dm`) return undefined
  // Might have no need for this, my bot doesn't respond to DMs anyways - Bass

  function parseArgs (argString, argCount, allowSingleQuote = true) {
    // Replace smart quotes (i.e. “ ” ‘ ’ ) with straight double quotes " "
    argString = argString.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
    const re = allowSingleQuote ? /\s*(?:("|')([^]*?)\1|(\S+))\s*/g : /\s*(?:(")([^]*?)"|(\S+))\s*/g
    const result = []
    let match = []
    // Large enough to get all items
    argCount = argCount || argString.length
    // Get match and push the capture group that is not null to the result
    while (--argCount && (match = re.exec(argString))) result.push(match[2] || match[3])
    // If text remains, push it to the array as-is (except for wrapping quotes, which are removed)
    if (match && re.lastIndex < argString.length) {
      const re2 = allowSingleQuote ? /^("|')([^]*)\1$/g : /^(")([^]*)"$/g
      result.push(argString.substr(re.lastIndex).replace(re2, '$2'))
    }
    return result
  }

  const args = parseArgs(msg.content.slice(prefix.length)) // slices the prefix from the command
  const commandName = args.shift().toLowerCase() /* make the command lowercase 
                                                EXAMPLE: let string = 'ArE yoU MoCkInG Me?'
                                                let lowerString = string.shift().toLowerCase()
                                                // lowerString is 'are you mocking me?' 
                                                - Bass
                                                */
  const searchString = args.join(` `)
  const url = args[1] ? args[1].replace(/<(.+)>/g, `$1`) : ``
  const serverQueue = queue.get(msg.guild.id)

  const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

  if (!command) { // if the bot doesnt have the command specified...
    msg.reply(`I don't have that command, did you mean to use another bot?`) // ...tell the user...
    return // ...and exit - Bass
  }
  try {
    command.execute(bot, msg, args, serverQueue, youtube, queue)
  }
  // The try block above tries to execute a command. If it fails for whatever reason, it throws a error that the 
  // catch block below grabs (thats why its called a "catch" block) and does something with the error. - Bass
  catch (error) {
    console.error(error)
    msg.reply(`There was an error trying to execute that command! \nError: \`\`\`css\n' ${Error(error)}\`\`\``)
  }
})

function play(guild, song) {
  const serverQueue = queue.get(guild.id)

  if (!song) {
    serverQueue.voiceChannel.leave()
    serverQueue.textChannel.send(
      `i've left as there's nothing in queue. to add me back in, just queue something up!`
    )
    queue.delete(guild.id)
    bot.user.setActivity(`some hot tunes`, { type: `LISTENING` })
    return
  }
  console.log(serverQueue.songs)
  console.log(song.url)
  if (song.url.includes(`youtube`)) {
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url), {
        volume: 0.5,
        bitrate: serverQueue.bitrate,
        passes: 10
      })
      .on(`end`, reason => {
        if (reason === `Stream is not generating quickly enough.`)
          console.log(`Song ended.`)
        else console.log(reason)
        serverQueue.songs.shift()
        play(guild, serverQueue.songs[0])
      })
      .on(`error`, error => console.error(error))
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100)
  } else if (song.url.includes(`sndcdn`)) {
    const dispatcher = serverQueue.connection
      .play(song.url, {
        volume: 0.5,
        bitrate: serverQueue.bitrate,
        passes: 10
      })
      .on(`end`, reason => {
        if (reason === `Stream is not generating quickly enough.`)
          console.log(`Song ended.`)
        else console.log(reason)
        serverQueue.songs.shift()
        play(guild, serverQueue.songs[0])
      })
      .on(`error`, error => console.error(error))
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100)
  } else if (song.url.includes(`audius`)) {
    const dispatcher = serverQueue.connection
      .play(song.url, {
        volume: 0.5,
        bitrate: serverQueue.bitrate,
        passes: 10
      })
      .on(`end`, reason => {
        if (reason === `Stream is not generating quickly enough.`)
          console.log(`Song ended.`)
        else console.log(reason)
        serverQueue.songs.shift()
        play(guild, serverQueue.songs[0])
      })
      .on(`error`, error => console.error(error))
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 100)
  }
  serverQueue.textChannel.send(`Now playing **${song.title}**`)
}

process.on('unhandledRejection', function(error) {
  console.error(`Uncaught Promise Rejection:\n${error}`)
  m.reply(`Uncaught Promise Rejection:\n${error}`)
})
// ^ Promise rejections are confusing, heres a link: https://davidwalsh.name/promises - Bass

process.on('uncaughtException', function (err) {
  console.log(`Caught exception: ${err}`)
  //m.reply(`Fatal error, please alert an Audius staff member about this!`)
  bot.destroy()
})
// ^ These are dangerous, if yall want yall can add logging to files so yall can see what went wrong

// Kills the bot when it recieves a SIGINT, Control+C - Bass

/*process.on('SIGINT', () => {
  console.log('Stopping bot.')
  bot.destroy()
})*/

bot.login(token)