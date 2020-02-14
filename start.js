require('dotenv').config()
const { token } = process.env;
const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./client.js', { token });

manager.spawn();
manager.on('launch', shard => console.log(`Launched shard ${shard.id}`));