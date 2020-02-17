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
    const vc = message.member.voice.channel;
    if (!vc) return message.channel.send("Please connect to a vc");

    vc.join().then(connection => {
      const dispatcher = connection.play(
        "https://cdn.discordapp.com/attachments/362409672625618955/678371900187082763/DK_Rap_as_a_Swing.mp3"
      );

      dispatcher.on("end", reason => {vc.leave()
                                     console.log(reason)});
      dispatcher.on("error", err => console.error(err));
    });
  }
};
