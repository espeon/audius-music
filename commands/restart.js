let trusted = ["267121875765821440", "546462001505763331", "351023948408029196", "624113588033945610"]
module.exports = {
  name: "restart",
  description: "restarts the bot (only for mods...tbh)",
  execute(bot, msg, args, serverQueue) {
    if (trusted.indexOf(msg.author.id) != -1) {
      msg.channel.send("Restarting music bot...");
      bot.destroy();
      process.exit(1);
    }
    return msg.channel.send("You cannot use this command.");
  }
};
