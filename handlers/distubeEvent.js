console.log(`Welcome to SERVICE HANDLER /--/ By https://lqhaiii /--/ Discord: tibbaR#8979`.yellow);
const PlayerMap = new Map()
const delay = require('delay');
const Discord = require(`discord.js`);
const {
    KSoftClient
} = require('@ksoft/api');
const config = require(`../botconfig/config.json`);
const ksoft = new KSoftClient(config.ksoftapi);
const ee = require(`../botconfig/embed.json`);
const {
  MessageButton,
  MessageActionRow,
  MessageEmbed
} = require(`discord.js`);
const { 
  lyricsEmbed, check_if_dj
} = require("./functions");
let songEditInterval = null;
module.exports = (client) => {
  try {
    client.distube
      .on(`playSong`, async (queue, track) => {
        try {
          client.guilds.cache.get(queue.id).me.voice.setDeaf(true).catch((e) => {
            //console.log(e.stack ? String(e.stack).grey : String(e).grey)
          })
        } catch (error) {
          console.log(error)
        }
        try {
          var newQueue = client.distube.getQueue(queue.id)
          var newTrack = track;
          var data = receiveQueueData(newQueue, newTrack)
          //Send message with buttons
          let currentSongPlayMsg = await queue.textChannel.send(data).then(msg => {
            PlayerMap.set(`currentmsg`, msg.id);
            return msg;
          })
          //create a collector for the thinggy
          var collector = currentSongPlayMsg.createMessageComponentCollector({
            filter: (i) => i.isButton() && i.user && i.message.author.id == client.user.id,
            time: track.duration > 0 ? track.duration * 1000 : 600000
          }); //collector for 5 seconds
          //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
          let lastEdited = false;

          /**
           * @INFORMATION - EDIT THE SONG MESSAGE EVERY 10 SECONDS!
           */
          try{clearInterval(songEditInterval)}catch(e){}
          songEditInterval = setInterval(async () => {
            if (!lastEdited) {
              try{
                var newQueue = client.distube.getQueue(queue.id)
                var newTrack = newQueue.songs[0];
                var data = receiveQueueData(newQueue, newTrack)
                await currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
              }catch (e){
                clearInterval(songEditInterval)
              }
            }
          }, 7000)

          collector.on('collect', async i => {
            if(i.customId != `10` && check_if_dj(client, i.member, client.distube.getQueue(i.guild.id).songs[0])) {
              return i.reply({embeds: [new MessageEmbed()
                .setColor(ee.wrongcolor)
                .setFooter(ee.footertext, ee.footericon)
                .setTitle(`${client.allEmojis.x} **You are not a DJ and not the Song Requester!**`)
                .setDescription(`**DJ-ROLES:**\n${check_if_dj(client, i.member, client.distube.getQueue(i.guild.id).songs[0])}`)
              ],
              ephemeral: true});
            }
            lastEdited = true;
            setTimeout(() => {
              lastEdited = false
            }, 7000)
            //skip
            if (i.customId == `1`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel) {
                i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
                await delay(5000);
                i.deleteReply();
              }
              //get the player instance
              const queue = client.distube.getQueue(i.guild.id);
              //if no player available return aka not playing anything
              if (!queue || !newQueue.songs || newQueue.songs.length == 0) {
                i.reply({
                  content: `${client.allEmojis.x} Chưa có gì để phát`,
                  ephemeral: true
                })
                await delay(5000);
                i.deleteReply();
              }
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              //if ther is nothing more to skip then stop music and leave the Channel
              if (newQueue.songs.length == 0) {
                //if its on autoplay mode, then do autoplay before leaving...
                  i.reply({
                    embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(`⏹ **Dừng phát và thoát kênh**`)
                    .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
                  })
                  await delay(5000);
                  i.deleteReply();
                  clearInterval(songEditInterval);
                  //edit the current song message
                  await client.distube.stop(i.guild.id)
                return
              }
              //skip the track
              await client.distube.skip(i.guild.id)
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`⏭ **Bỏ qua bài hát tiếp theo!**`)
                  .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
              })
              await delay(5000);
              i.deleteReply();
            }
            //stop
            if (i.customId == `2`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })

              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
                //stop the track
                i.reply({
                  embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(`⏹ **Dừng bài hát và thoát kênh!**`)
                    .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
                })
                await delay(5000);
                i.deleteReply();
                clearInterval(songEditInterval);
                //edit the current song message
                await client.distube.stop(i.guild.id)
            }
            //pause/resume
            if (i.customId == `3`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              if (newQueue.playing) {
                await client.distube.pause(i.guild.id);
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
                i.reply({
                  embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(`⏸ **Tạm dừng!**`)
                    .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
                })
                await delay(5000);
                i.deleteReply();
              } else {
                //pause the player
                await client.distube.resume(i.guild.id);
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
                i.reply({
                  embeds: [new MessageEmbed()
                    .setColor(ee.color)
                    .setTimestamp()
                    .setTitle(`▶️ **Phát tiếp!**`)
                    .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
                })
                await delay(5000);
                i.deleteReply();
              }
            }
            //autoplay
            if (i.customId == `4`) {
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              //pause the player
              await newQueue.toggleAutoplay()
              if (newQueue.autoplay) {
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
              } else {
                var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
                currentSongPlayMsg.edit(data).catch((e) => {
                  //console.log(e.stack ? String(e.stack).grey : String(e).grey)
                })
              }
              //Send Success Message
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`${newQueue.autoplay ? `${client.allEmojis.check_mark} **Bật chế độ tự động phát**`: `${client.allEmojis.x} **Tắt chế độ tự động phát**`}`)
                  .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
                })
                await delay(5000);
                i.deleteReply();
            }
            //Shuffle
            if(i.customId == `5`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              //pause the player
              await newQueue.shuffle()
              //Send Success Message
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`🔀 **Đã trộn ${newQueue.songs.length} bài hát!**`)
                  .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
              })
              await delay(5000);
              i.deleteReply();
            }
            //Songloop
            if(i.customId == `6`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              //Disable the Repeatmode
              if(newQueue.repeatMode == 1){
                await newQueue.setRepeatMode(0)
              } 
              //Enable it
              else {
                await newQueue.setRepeatMode(1)
              }
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`${newQueue.repeatMode == 1 ? `${client.allEmojis.check_mark} **Bật chế độ lặp bài hát**`: `${client.allEmojis.x} **Tắt chế độ lặp bài hát**`}`)
                  .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
              })
              await delay(5000);
              i.deleteReply();
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Queueloop
            if(i.customId == `7`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              //Disable the Repeatmode
              if(newQueue.repeatMode == 2){
                await newQueue.setRepeatMode(0)
              } 
              //Enable it
              else {
                await newQueue.setRepeatMode(2)
              }
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`${newQueue.repeatMode == 2 ? `${client.allEmojis.check_mark} **Bật chế độ lặp danh sách**`: `${client.allEmojis.x} **Tắt chế độ lặp danh sách**`}`)
                  .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
                })
                await delay(5000);
              i.deleteReply();
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Forward
            if(i.customId == `8`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              let seektime = newQueue.currentTime + 10;
              if (seektime >= newQueue.songs[0].duration) seektime = newQueue.songs[0].duration - 1;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000})
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`⏩ **Chuyển tiếp \`10 giây\`!**`)
                  .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
              })
              await delay(5000);
              i.deleteReply();
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Rewind
            if(i.customId == `9`){
              let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              let seektime = newQueue.currentTime - 10;
              if (seektime < 0) seektime = 0;
              if (seektime >= newQueue.songs[0].duration - newQueue.currentTime) seektime = 0;
              await newQueue.seek(Number(seektime))
              collector.resetTimer({time: (newQueue.songs[0].duration - newQueue.currentTime) * 1000})
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`⏪ **Lùi lại \`10 giây\`!**`)
                  .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
              })
              await delay(5000);
              i.deleteReply();
              var data = receiveQueueData(client.distube.getQueue(queue.id), newQueue.songs[0])
              currentSongPlayMsg.edit(data).catch((e) => {
                //console.log(e.stack ? String(e.stack).grey : String(e).grey)
              })
            }
            //Lyrics
            if(i.customId == `10`){let { member } = i;
              //get the channel instance from the Member
              const { channel } = member.voice
              //if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              //if not in the same channel as the player, return Error
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
                return i.reply({
                  content: `${client.allEmojis.x} **Lyrics are disabled!**\n> *Due to legal Reasons, Lyrics are disabled and won't work for an unknown amount of time!* :cry:`,
                  ephemeral: true
                });
              let embeds = [];
              await ksoft.lyrics.get(newQueue.songs[0].name).then(
                async track => {
                    if (!track.lyrics) return i.reply({content: `${client.allEmojis.x} **No Lyrics Found!** :cry:`, ephemeral: true});
                    lyrics = track.lyrics;
                embeds = lyricsEmbed(lyrics, newQueue.songs[0]);
              }).catch(e=>{
                console.log(e)
                return i.reply({content: `${client.allEmojis.x} **No Lyrics Found!** :cry:\n${String(e).substr(0, 1800)}`, ephemeral: true});
              })
              i.reply({
                embeds: embeds, ephemeral: true
              })
            }
            // Up Volume
            if(i.customId == '11') {
              let { member } = i;
              // get the channel instance from the Member
              const { channel } = member.voice
              // if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} ** Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              let volume = queue.volume + 10
              if (volume > 150) {
                await client.distube.setVolume(i.guild.id, 150);
              } else {
                await client.distube.setVolume(i.guild.id, volume);
              }
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`🔊 **Tăng âm lượng \`${volume}\`!**`)
                  .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
              })
              await delay(5000);
              i.deleteReply();
            }
            // Down Volume
            if(i.customId == '12') {
              let { member } = i;
              // get the channel instance from the Member
              const { channel } = member.voice
              // if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} ** Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              let volume = queue.volume - 10
              if (volume < 10) {
                await client.distube.setVolume(i.guild.id, 0);
              } else {
                await client.distube.setVolume(i.guild.id, volume);
              }
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`🔊 **Giảm âm lượng \`${volume}\`!**`)
                  .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
              })
              await delay(5000);
              i.deleteReply();
            }
            // Disable Volume
            if(i.customId == '13') {
              let { member } = i;
              // get the channel instance from the Member
              const { channel } = member.voice
              // if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} ** Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              let volume = 0
              await client.distube.setVolume(i.guild.id, 0);
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`🔊 **Tắt âm lượng \`${volume}\`!**`)
                  .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
              })
              await delay(5000);
              i.deleteReply();
            }
            // Enable Volume
            if(i.customId == '14') {
              let { member } = i;
              // get the channel instance from the Member
              const { channel } = member.voice
              // if the member is not in a channel, return
              if (!channel)
                return i.reply({
                  content: `${client.allEmojis.x} ** Hãy join Voice Channel đầu tiên!**`,
                  ephemeral: true
                })
              if (channel.id !== newQueue.voiceChannel.id)
                return i.reply({
                  content: `${client.allEmojis.x} **Hãy join Voice Channel đầu tiên! <#${channel.id}>**`,
                  ephemeral: true
                })
              let volume = 30
              await client.distube.setVolume(i.guild.id, volume);
              i.reply({
                embeds: [new MessageEmbed()
                  .setColor(ee.color)
                  .setTimestamp()
                  .setTitle(`🔊 **Bật âm lượng \`${volume}\`!**`)
                  .setFooter(`💢 Thực hiện bởi: ${member.user.tag}`, member.user.displayAvatarURL({dynamic: true}))]
              })
              await delay(5000);
              i.deleteReply();
            }
          });
        } catch (error) {
          console.error(error)
        }
      })
      .on(`addSong`, (queue, song) => queue.textChannel.send({
        embeds: [
          new MessageEmbed()
          .setColor(ee.color)
          .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
          .setFooter("💯 " + song.user.tag, song.user.displayAvatarURL({
            dynamic: true
          }))
          .setTitle(`<:plus:898506228706205707> **Đã thêm bài hát vào Danh Sách!**`)
          .setDescription(`<:simon:898508399958978571> Song: [\`${song.name}\`](${song.url})  -  \`${song.formattedDuration}\``)
          .addField(`⌛ **Thời gian**`, `\`${queue.songs.length - 1} song${queue.songs.length > 0 ? "s" : ""}\` - \`${(Math.floor((queue.duration - song.duration) / 60 * 100) / 100).toString().replace(".", ":")}\``)
          .addField(`🌀 **Thời lượng Danh sách:**`, `\`${queue.formattedDuration}\``)
        ]
      }).then(msg => msg.delete({timeout: 5000}).catch(err => console.log(erro.message))))
      .on(`addList`, (queue, playlist) => queue.textChannel.send({
        embeds: [
          new MessageEmbed()
          .setColor(ee.color)
          .setThumbnail(playlist.thumbnail.url ? playlist.thumbnail.url : `https://img.youtube.com/vi/${playlist.songs[0].id}/mqdefault.jpg`)
          .setFooter("💯" + playlist.user.tag, playlist.user.displayAvatarURL({
            dynamic: true
          }))
          .setTitle(`${client.allEmojis.check_mark} **Bài hát được thêm vào danh sách!**`)
          .setDescription(`📋 Danh sách phát: [\`${playlist.name}\`](${playlist.url ? playlist.url : ""})  -  \`${playlist.songs.length} Song${playlist.songs.length > 0 ? "s" : ""}\``)
          .addField(`⌛ **Thời gian**`, `\`${queue.songs.length - - playlist.songs.length} song${queue.songs.length > 0 ? "s" : ""}\` - \`${(Math.floor((queue.duration - playlist.duration) / 60 * 100) / 100).toString().replace(".", ":")}\``)
          .addField(`🌀 **Thời lượng Danh sách:**`, `\`${queue.formattedDuration}\``)
        ]
      }).then(msg => msg.delete({timeout: 5000}).catch(err => console.log(erro.message))))
      // DisTubeOptions.searchSongs = true
      .on(`searchResult`, (message, result) => {
        let i = 0
        message.channel.send(`**Chọn một tùy chọn từ bên dưới**\n${result.map((song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join(`\n`)}\n*Nhập bất kỳ thứ gì khác hoặc đợi 60 giây để hủy*`)
      })
      // DisTubeOptions.searchSongs = true
      .on(`searchCancel`, message => message.channel.send(`Hủy tìm kiếm`).catch((e)=>console.log(e)))
      .on(`error`, (channel, e) => {
        channel.send(`An error encountered: ${e}`).catch((e)=>console.log(e))
        console.error(e)
      })
      .on(`empty`, channel => channel.send(`Kênh thoại trống! Đang rời kênh ...`).then(msg => msg.delete({timeout: 5000}).catch(err => console.log(erro.message))).catch((e)=>console.log(e)))
      .on(`searchNoResult`, message => message.channel.send(`Không có kết quả nào!`).then(msg => msg.delete({timeout: 5000}).catch(err => console.log(erro.message))).catch((e)=>console.log(e)))
      .on(`finishSong`, (queue, song) => {
        var embed = new MessageEmbed().setColor(ee.color)
        .setAuthor(`${song.name}`, "https://cdn.discordapp.com/attachments/883978730261860383/883978741892649000/847032838998196234.png", song.url)
        // .setDescription(`See the [Queue on the **DASHBOARD** Live!](${require("../dashboard/settings.json").website.domain}/${queue.id})`)
        .setDescription(`⛔️ Bài hát kết thúc!`)
        .setThumbnail(`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`)
        .setFooter(`💯 ${song.user.tag}\n`, song.user.displayAvatarURL({
          dynamic: true
        }));
        queue.textChannel.messages.fetch(PlayerMap.get(`currentmsg`)).then(currentSongPlayMsg=>{
          currentSongPlayMsg.edit({embeds: [embed], components: []}).catch((e) => {
            //console.log(e.stack ? String(e.stack).grey : String(e).grey)
          })
        }).catch((e) => {
          //console.log(e.stack ? String(e.stack).grey : String(e).grey)
        })
      })
      .on(`finish`, queue => {
        queue.textChannel.send({
          embeds: [
            new MessageEmbed().setColor(ee.color).setFooter(ee.footertext, ee.footericon)
            .setTitle("⛔️ LEFT THE CHANNEL")
            .setDescription(":headphones: **Không còn bài hát nào nữa**")
            .setTimestamp()
          ]
        }).then(msg => msg.delete({timeout: 5000}).catch(err => console.log(erro.message)))
      })
      .on(`initQueue`, queue => {
        try {
          client.settings.ensure(queue.id, {
            defaultvolume: 50,
            defaultautoplay: false,
            defaultfilters: [`bassboost6`, `clear`]
          })
          let data = client.settings.get(queue.id)
          queue.autoplay = Boolean(data.defaultautoplay);
          queue.volume = Number(data.defaultvolume);
          queue.setFilter(data.defaultfilters);
        } catch (error) {
          console.error(error)
        }
      });
  } catch (e) {
    console.log(String(e.stack).bgRed)
  }

  function receiveQueueData(newQueue, newTrack) {
    var djs = client.settings.get(newQueue.id, `djroles`);
    if(!djs || !Array.isArray(djs)) djs = [];
    else djs = djs.map(r => `<@&${r}>`);
    if(djs.length == 0 ) djs = "`not setup`";
    else djs.slice(0, 15).join(", ");
    if(!newTrack) return new MessageEmbed().setColor(ee.wrongcolor).setTitle("NO SONG FOUND?!?!")
    var embed = new MessageEmbed().setColor(ee.color)
      // .setDescription(`See the [Queue on the **DASHBOARD** Live!](${require("../dashboard/settings.json").website.domain}/queue/${newQueue.id})`)
      .addField(`💡 Yêu cầu bởi:`, `>>> ${newTrack.user}`, true)
      .addField(`<:milkclock:900828606509514773> Thời lượng:`, `>>> \`${newQueue.formattedCurrentTime} / ${newTrack.formattedDuration}\``, true)
      .addField(`<:playlist:900826135259140098> Danh sách:`, `>>> \`${newQueue.songs.length} song(s)\`\n\`${newQueue.formattedDuration}\``, true)
      .addField(`<:volume:900758188553568276> Âm lượng:`, `>>> \`${newQueue.volume} %\``, true)
      .addField(`♾ Lặp bài hát:`, `>>> ${newQueue.repeatMode ? newQueue.repeatMode === 2 ? `${client.allEmojis.check_mark}\` Queue\`` : `${client.allEmojis.check_mark} \`Song\`` : `${client.allEmojis.x}`}`, true)
      .addField(`<:autoplay:900827421161426994> Tự phát:`, `>>> ${newQueue.autoplay ? `${client.allEmojis.check_mark}` : `${client.allEmojis.x}`}`, true)
      .addField(`<:download:898504040877543434> Download bài hát:`, `>>> [\`Click here\`](${newTrack.streamURL})`, true)
      .addField(`<:filter:898504338320793601> Filter${newQueue.filters.length > 0 ? "s": ""}:`, `>>> ${newQueue.filters && newQueue.filters.length > 0 ? `${newQueue.filters.map(f=>`\`${f}\``).join(`, `)}` : `${client.allEmojis.x}`}`, newQueue.filters.length > 1 ? false : true)
			// .addField(`🎧 DJ-Role${client.settings.get(newQueue.id, "djroles").length > 1 ? "s": ""}:`, `>>> ${djs}`, client.settings.get(newQueue.id, "djroles").length > 1 ? false : true)
      .setAuthor(`${newTrack.name}`, `https://cdn.discordapp.com/attachments/893153516745531410/901056581121220608/milkmochamusic.gif`, newTrack.url)
      .setThumbnail(`https://img.youtube.com/vi/${newTrack.id}/mqdefault.jpg`)
      .setFooter(`💯 ${newTrack.user.tag}`, newTrack.user.displayAvatarURL({
        dynamic: true
      }));
    let skip = new MessageButton().setStyle('PRIMARY').setCustomId('1').setEmoji(`⏭`).setLabel(`Bài kế`)
    let stop = new MessageButton().setStyle('DANGER').setCustomId('2').setEmoji(`🏠`).setLabel(`Dừng`)
    let pause = new MessageButton().setStyle('SECONDARY').setCustomId('3').setEmoji('⏸').setLabel(`Tạm dừng`)
    let autoplay = new MessageButton().setStyle('SUCCESS').setCustomId('4').setEmoji('🔁').setLabel(`Tự phát`)
    let shuffle = new MessageButton().setStyle('PRIMARY').setCustomId('5').setEmoji('🔀').setLabel(`Mix danh sách`)
    if (!newQueue.playing) {
      pause = pause.setStyle('SUCCESS').setEmoji('▶️').setLabel(`Phát tiếp`)
    }
    if (newQueue.autoplay) {
      autoplay = autoplay.setStyle('SECONDARY')
    }
    let songloop = new MessageButton().setStyle('SUCCESS').setCustomId('6').setEmoji(`🔁`).setLabel(`Lặp bài hát`)
    let queueloop = new MessageButton().setStyle('SUCCESS').setCustomId('7').setEmoji(`🔂`).setLabel(`Lặp danh sách`)
    let forward = new MessageButton().setStyle('PRIMARY').setCustomId('8').setEmoji('⏩').setLabel(`+10 giây`)
    let rewind = new MessageButton().setStyle('PRIMARY').setCustomId('9').setEmoji('⏪').setLabel(`-10 giây`)
    let lyrics = new MessageButton().setStyle('PRIMARY').setCustomId('10').setEmoji('📝').setLabel(`Lyrics`).setDisabled();
    if (newQueue.repeatMode === 0) {
      songloop = songloop.setStyle('SUCCESS')
      queueloop = queueloop.setStyle('SUCCESS')
    }
    if (newQueue.repeatMode === 1) {
      songloop = songloop.setStyle('SECONDARY')
      queueloop = queueloop.setStyle('SUCCESS')
    }
    if (newQueue.repeatMode === 2) {
      songloop = songloop.setStyle('SUCCESS')
      queueloop = queueloop.setStyle('SECONDARY')
    }
    if (Math.floor(newQueue.currentTime) < 10) {
      rewind = rewind.setDisabled()
    } else {
      rewind = rewind.setDisabled(false)
    }
    if (Math.floor((newTrack.duration - newQueue.currentTime)) <= 10) {
      forward = forward.setDisabled()
    } else {
      forward = forward.setDisabled(false)
    }
    let upvol = new MessageButton().setStyle('PRIMARY').setCustomId('11').setEmoji('🔊').setLabel('Tăng âm lượng')
    let downvol = new MessageButton().setStyle('SUCCESS').setCustomId('12').setEmoji('🔉').setLabel('Giảm âm lượng');
    let disvol = new MessageButton().setStyle('DANGER').setCustomId('13').setEmoji('🔇').setLabel('Tắt âm lượng');
    if (newQueue.volume >= 150) {
      upvol.setStyle('SECONDARY')
      upvol.setDisabled(true)
    } else if (newQueue.volume === 0) {
      downvol.setStyle('SECONDARY')
      downvol.setDisabled(true)
      disvol.setLabel('Bật âm lượng').setStyle('SUCCESS').setEmoji('🔊').setCustomId('14')
    } else if (newQueue.volume > 0) {
      downvol.setStyle('SUCCESS').setDisabled(false)
      disvol.setLabel('Tắt âm lượng').setStyle('DANGER').setEmoji('🔇').setCustomId('13')
    }

    const row = new MessageActionRow().addComponents([skip, stop, pause, autoplay, shuffle]);
    const row2 = new MessageActionRow().addComponents([upvol, downvol, disvol, forward, rewind]);
    const row3 = new MessageActionRow().addComponents([songloop, queueloop]);
    return {
      embeds: [embed],
      components: [row, row2, row3]
    };
  }
};
/**
 * 
 * @INFO
 * Bot Coded by tibbaR#8979 | 
 * @INFO
 * Work for lqhaiii Development | https://lqhaiii
 * @INFO
 * 
*/
