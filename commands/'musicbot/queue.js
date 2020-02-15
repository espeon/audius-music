const { Command } = require("klasa");
const {
  Permissions: { FLAGS }
} = require("discord.js");

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "queue",
      enabled: true,
      runIn: ["text"],
      cooldown: 2,
      bucket: 1,
      aliases: [],
      permLevel: 0,
      botPerms: [],
      requiredConfigs: [],
      aliases: ["q"],
      description: "Displays the queue.",
      quotedStringSupport: true,
      usage: "[num:string]",
      usageDelim: ""
    });
    this.exp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/\S*(?:(?:\/e(?:mbed)?)?\/|watch\/?\?(?:\S*?&?v=))|youtu\.be\/)([\w-]{11})(?:[^\w-]|$)/;
  }

  async init() {
    global.queue = new Map();
  }

  async run(msg, [num]) {
    const serverQueue = global.queue.get(msg.guild.id);
    if (!serverQueue) return msg.channel.send("There is nothing playing.");
    let pg = 0;
    let max =
      Math.round(serverQueue.songs.length / 10) +
      (serverQueue.songs.length % 10 < 5 ? 1 : 0);
    if (!isNaN(num)) {
      if (num > max)
        return msg.channel.send(
          `There are not enough pages! Please choose a number from 1 to ${max}`
        );
      pg = (JSON.parse(num) - 1) * 10;
    }

    return msg.channel.send({
      embed: {
        title: `Queue:`,
        description: `${serverQueue.songs
          .slice(1 + pg, 11 + pg)
          .map(
            song =>
              `**-** [${song.title}](${song.link}) (${this.fmtHMS(
                Math.round(song.duration)
              )})`
          )
          .join("\n")}\n
          **Now playing: **[${serverQueue.songs[0].title}](${
          serverQueue.songs[0].link
        })`,
        footer: {
          text: `page ${pg / 10 + 1} / ${max} | ${
            serverQueue.songs.length
          } songs`
        }
      }
    });
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
