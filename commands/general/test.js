const { Command, version: klasaVersion, Duration } = require("klasa");
const { version: discordVersion } = require("discord.js");
const os = require("os");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      guarded: true,
      description: language => language.get("COMMAND_STATS_DESCRIPTION")
    });
  }

  async run(message) {
    let guild = message.guild
    console.log(this.client.channels.cache.get(guild.systemChannelID))
  }
};
