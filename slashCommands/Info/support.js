const {
  MessageEmbed
} = require("discord.js");
const config = require("../../botconfig/config.json");
var ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
module.exports = {
  name: "support", //the command name for execution & for helpcmd [OPTIONAL]
  cooldown: 1, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "Sends a Link of the Support Server", //the command description for helpcmd [OPTIONAL]
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, interaction) => {
    try {
      //things u can directly access in an interaction!
      const {
        member,
        channelId,
        guildId,
        applicationId,
        commandName,
        deferred,
        replied,
        ephemeral,
        options,
        id,
        createdTimestamp
      } = interaction;
      const {
        guild
      } = member;
      interaction.reply({
        ephemeral: true,
        content: ""
      });
    } catch (e) {
      console.log(String(e.stack).bgRed)
    }
  }
}
/**
 * @INFO
 * Bot Coded by tibbaR#8979 
 * @INFO
 * Work for lqhaiii Development | https://lqhaiii
 * @INFO
 * 
*/