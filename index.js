const { Client, Intents } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const apiUrl = 'https://discord.com/api/v9/entitlements/gift-codes/';

client.once('ready', () => {
    console.log('Bot está online!');
    checkGiftCodeLoop();
});

async function checkGiftCodeLoop() {
    while (true) {
        const code = generateCode();
        const params = {
            country_code: 'BR',
            with_application: 'false',
            with_subscription_plan: 'true'
        };

        console.log(`Verificando código: ${code}`);

        try {
            const response = await axios.get(apiUrl + code, { params });
            const data = response.data;

            if (data.code && data.code === code) {
                console.log(`Código válido encontrado: ${code}`);

                const guildId = ''; // Substitua pelo ID do seu servidor
                const channelId = ''; // Substitua pelo ID do canal 

                const guild = client.guilds.cache.get(guildId);
                const channel = guild.channels.cache.get(channelId);

                if (channel && channel.type === 'GUILD_TEXT') {
                    channel.send(`Código válido testado com sucesso: https://discord.com/billing/promotions/${code}`);
                    console.log('Mensagem enviada para o canal.');
                } else {
                    console.log('Canal não encontrado.');
                }

                break; 
            } else if (data.code && data.code === 10038) {
                console.log('Código não existe ou ainda não foi criado.');
            } else {
                console.log('Erro ao verificar o código.');
            }
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.log('Limite de taxa atingido. Aguardando 15 minutos...');
                await sleep(900000); 
            } else if (error.response && error.response.status === 404) {
                console.log('Código não existe ou ainda não foi criado.');
            } else {
                console.error('Erro ao fazer a chamada à API:', error.message);
            }
        }

        await sleep(5000); 
    }
}

function generateCode() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 24; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }

    return code;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

client.login('TOKEN_BOT'); 
