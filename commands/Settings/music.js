const {
  MessageEmbed
} = require("discord.js");
const config = require("../../botconfig/config.json");
const ee = require("../../botconfig/embed.json");
const settings = require("../../botconfig/settings.json");
const delay = require('delay');
module.exports = {
  name: "music-request", //the command name for execution & for helpcmd [OPTIONAL]

  category: "Settings",
  aliases: ["music"],
  usage: "music <add/remove> <#Channel>",

  cooldown: 1, //the command cooldown for execution & for helpcmd [OPTIONAL]
  description: "Create a music request room!", //the command description for helpcmd [OPTIONAL]
  memberpermissions: ["MANAGE_GUILD "], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  run: async (client, message, args) => {
    try {
      let musicChannel = client.settings.get(message.guild.id, `musicchannel`);
      let musicChannel_name = client.channels.cache.get(musicChannel.toString());
      //things u can directly access in an interaction!
      const {
        member, channelId, guildId, applicationId, commandName, deferred, replied,
        ephemeral, options, id, createdTimestamp } = message;
      const { guild } = member;

      if (!args[0]) {
        await message.reply({
          embeds: [new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${client.allEmojis.x} **Please add a Method+Channel!**`)
            .setDescription(`**Usage:**\n> \`${client.settings.get(message.guild.id, "prefix")}music <add/remove> <#Channel>\``)
          ],
        }).then(msg => { setTimeout(() => { msg.delete().catch((e) => { console.log(String(e).grey) }) }, 5000) }).catch((e) => { console.log(String(e).grey) });
      }
      let command = args[0].toLowerCase();
      if (!["add", "remove"].includes(command)) {
        return message.reply({
          embeds: [new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${client.allEmojis.x} **Please add a Method+Channel!**`)
            .setDescription(`**Usage:**\n> \`${client.settings.get(message.guild.id, "prefix")}music <add/remove> <#Channel>\``)
          ],
        }).then(msg => { setTimeout(() => { msg.delete().catch((e) => { console.log(String(e).grey) }) }, 5000) }).catch((e) => { console.log(String(e).grey) });
      }

      let Channel = message.mentions.channels.first();
      if (!Channel) {
        await message.reply({
          embeds: [new MessageEmbed()
            .setColor(ee.wrongcolor)
            .setFooter(ee.footertext, ee.footericon)
            .setTitle(`${client.allEmojis.x} **Please add a Method+Channel!**`)
            .setDescription(`**Usage:**\n> \`${client.settings.get(message.guild.id, "prefix")}music <add/remove> <#Channel>\``)
          ],
        }).then(msg => { setTimeout(() => { msg.delete().catch((e) => { console.log(String(e).grey) }) }, 5000) }).catch((e) => { console.log(String(e).grey) });
      }
      client.settings.ensure(guild.id, {
        musicchannel: []
      })

      if (command == "add") {
        if (client.settings.get(guild.id, "musicchannel").length < 1) {
          if (client.settings.get(guild.id, "musicchannel").includes(Channel.id)) {
            await message.reply({
              embeds: [
                new MessageEmbed()
                  .setColor(ee.wrongcolor)
                  .setFooter(ee.footertext, ee.footericon)
                  .setTitle(`${client.allEmojis.x} **Kênh này đã được dùng để làm music-request**`)
              ],
            }).then(msg => { setTimeout(() => { msg.delete().catch((e) => { console.log(String(e).grey) }) }, 5000) }).catch((e) => { console.log(String(e).grey) });
          }
          client.settings.push(guild.id, Channel.id, "musicchannel");
            await message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.color)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(`${client.allEmojis.check_mark} **The Channel \`${Channel.name}\` got added to the 🎧 Music-request!**`)
              //   .addField(`🎧 **Bot-Channel${client.settings.get(guild.id, "botchannel").length > 1 ? "s": ""}:**`, `>>> ${djs}`, true)
            ],
          }).then(msg => { setTimeout(() => { msg.delete().catch((e) => { console.log(String(e).grey) }) }, 5000) }).catch((e) => { console.log(String(e).grey) });
        } else {
          await message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.color)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(`${client.allEmojis.x} **Không thể thêm kênh vì đã có kênh yêu cầu nhạc 🎧!**`)
                .setDescription(`> Kênh yêu cầu nhạc đang có sẵn tại: ${musicChannel_name.toString()}`)
                // .setTitle(`${client.allEmojis.check_mark} **The Channel \`${Channel.name}\` got added to the 🎧 Music-request!**`)
              //   .addField(`🎧 **Bot-Channel${client.settings.get(guild.id, "botchannel").length > 1 ? "s": ""}:**`, `>>> ${djs}`, true)
            ],
          }).then(msg => { setTimeout(() => { msg.delete().catch((e) => { console.log(String(e).grey) }) }, 5000) }).catch((e) => { console.log(String(e).grey) });
        }

      } else {
        if (!client.settings.get(guild.id, "musicchannel").includes(Channel.id)) {
          return await message.reply({
            embeds: [
              new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(`${client.allEmojis.x} **This Channel is not a Music-request yet!**`)
            ],
          }).then(msg => { setTimeout(() => { msg.delete().catch((e) => { console.log(String(e).grey) }) }, 5000) }).catch((e) => { console.log(String(e).grey) });
        }
        client.settings.remove(guild.id, Channel.id, "musicchannel");
          await message.reply({
          embeds: [
            new MessageEmbed()
              .setColor(ee.color)
              .setFooter(ee.footertext, ee.footericon)
              .setTitle(`${client.allEmojis.check_mark} **The Channel \`${Channel.name}\` got removed from the 🎧 Music-request!**`)
            //   .addField(`🎧 **Bot-Channel${client.settings.get(guild.id, "botchannel").length > 1 ? "s": ""}:**`, `>>> ${djs}`, true)
          ],
        }).then(msg => { setTimeout(() => { msg.delete().catch((e) => { console.log(String(e).grey) }) }, 5000) }).catch((e) => { console.log(String(e).grey) });
      }

    } catch (e) {
      console.log(String(e.stack).bgRed)
    }
  }

}