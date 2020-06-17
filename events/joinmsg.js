const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'guildCreate' });
	}

	run(guild) {
		if (!guild.available) return;
    this.client.channels.cache.get(guild.systemChannelID).send("hey 🏄‍♀️🌊👋\nif you need help, do "+ process.env.prefix + "help.")
	}

};