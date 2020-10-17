const { Command } = require("klasa");
const {
  Permissions: { FLAGS }
} = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "nowplaying",
      enabled: true,
      runIn: ["text"],
      cooldown: 2,
      bucket: 1,
      aliases: [],
      permLevel: 0,
      botPerms: [],
      requiredConfigs: [],
      aliases: ["np"],
      description: "now playing",
      quotedStringSupport: true,
      usageDelim: ""
    });
    this.exp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S*(?:(?:\/e(?:mbed)?)?\/|watch\/?\?(?:\S*?&?v=))|youtu\.be\/)([\w-]{11})(?:[^\w-]|$)/;
  }

  async init() {
    global.queue = new Map();
  }

  async run(msg) {
    const serverQueue = global.queue.get(msg.guild.id);
    if (!serverQueue) {
      return msg.channel.send(`There is nothing playing.`);
    }
    return msg.channel.send(
      `🎶 Now playing: **${serverQueue.songs[0].title}** | ${this.fmtHMS(Math.round(serverQueue.songs[0].duration - (serverQueue.connection.dispatcher.streamTime / 1000)))} left`
    );
  }
  fmtHMS(secs) {
    var sec_num = parseInt(secs, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num % 60;

    return [hours, minutes, seconds]
      .map(v => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":")
      .replace(/^0+/, "");
  }
};
