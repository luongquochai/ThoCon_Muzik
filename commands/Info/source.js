const {
  MessageEmbed
} = require("discord.js");
const config = require("../../botconfig/config.json");
var ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
module.exports = {
  name: "source", //the command name for execution & for helpcmd [OPTIONAL]

  category: "Info",
  usage: "source",
  aliases: ["github"],

  cooldown: 5, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "Sends you Source Code Information", //the command description for helpcmd [OPTIONAL]
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      message.reply({
        embeds: [
          new MessageEmbed().setColor(ee.color)
          .setFooter(ee.footertext, ee.footericon)
          .setDescription(`**KHI SỬ DỤNG LẠI SOURCE CODE, __HÃY ĐỂ CREDITS__!** :heart:\n\n[Link to Source](lqhaiii)\n\n[Discord@tibbaR#8979]()`)
        ]
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
