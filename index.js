const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

let ultimoQR = null;
let botStatus = 'desconectado';

// Página web para mostrar o QR Code
app.get('/', (req, res) => {
    if (botStatus === 'conectado') {
        res.send(`
            <html>
            <body style="font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0;">
                <h1 style="color: green;">✅ Vítor está online!</h1>
                <p>O bot está conectado e funcionando normalmente.</p>
            </body>
            </html>
        `);
    } else if (ultimoQR) {
        res.send(`
            <html>
            <body style="font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0;">
                <h1>📱 Escaneie o QR Code</h1>
                <p>Abra o WhatsApp > Aparelhos conectados > Conectar aparelho</p>
                <img src="${ultimoQR}" style="width: 300px; height: 300px;"/>
                <p><small>Atualize a página se o QR Code expirar</small></p>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
            <body style="font-family: Arial; text-align: center; padding: 50px; background: #f0f0f0;">
                <h1>⏳ Aguarde...</h1>
                <p>O bot está iniciando. Atualize a página em alguns segundos.</p>
            </body>
            </html>
        `);
    }
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor rodando na porta ${PORT}`);
});

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const sessoes = {};

client.on('qr', async (qr) => {
    console.log('📱 Novo QR Code gerado!');
    ultimoQR = await qrcode.toDataURL(qr);
    botStatus = 'desconectado';
});

client.on('ready', () => {
    console.log('✅ Vítor está online e pronto para atender!');
    ultimoQR = null;
    botStatus = 'conectado';
});

client.on('disconnected', () => {
    console.log('❌ Bot desconectado!');
    botStatus = 'desconectado';
});

client.on('message', async (msg) => {
    const contato = await msg.getContact();
    const nome = contato.pushname || 'paciente';
    const texto = msg.body.trim();
    const telefone = msg.from;

    if (!sessoes[telefone]) {
        sessoes[telefone] = { etapa: 'menu' };
        await msg.reply(`Olá, ${nome}! 👋\nMeu nome é Vítor, sou o assistente virtual do Dr. João.\n\nComo posso te ajudar hoje?\n\n1. Agendar nova consulta\n2. Reagendar uma consulta\n3. Receber o link da consulta\n4. Solicitar nota fiscal\n5. Sou um novo paciente\n6. Outros assuntos`);
        return;
    }

    const etapa = sessoes[telefone].etapa;

    if (etapa === 'menu') {
        if (texto === '1') {
            sessoes[telefone].etapa = 'aguardando_dados_agendamento';
            await msg.reply('Perfeito, vamos lá! 😊\nO Dr. João atende nas quartas e quintas, de manhã e até o final da tarde.\n\nPor favor, envie seu *nome*, *gmail* e *horários de preferência*.');
        } else if (texto === '2') {
            sessoes[telefone].etapa = 'aguardando_dados_reagendamento';
            await msg.reply('Ótimo, vamos lá! 😊\nO Dr. João atende nas quartas e quintas, de manhã e até o final da tarde.\n\nPor favor, envie seu *nome*, *gmail* e *horários de preferência*.');
        } else if (texto === '3') {
            sessoes[telefone].etapa = 'aguardando_comprovante';
            await msg.reply('Entendi! Pode me enviar seu *nome* e o *comprovante de pagamento*, por favor?');
        } else if (texto === '4') {
            sessoes[telefone].etapa = 'aguardando_dados_nf';
            await msg.reply('Claro! Preciso que me envie:\n\n📋 *Nome Completo*\n📋 *CPF*\n📋 *Endereço*\n📋 *Valor e data da consulta*');
        } else if (texto === '5') {
            sessoes[telefone].etapa = 'novo_paciente';
            await msg.reply('Que alegria! Seja bem-vindo(a)! 🎉\n\nComo posso te ajudar?\n\n1. Agendar primeira consulta\n2. Como funciona a consulta\n3. Saber mais sobre o Dr. João');
        } else if (texto === '6') {
            sessoes[telefone].etapa = 'outros';
            await msg.reply('Claro! Como posso te ajudar?\n\n1. Agendar primeira consulta\n2. Como funciona a consulta\n3. Saber mais sobre o Dr. João');
        } else {
            await msg.reply('Por favor, escolha uma das opções enviando o *número* correspondente:\n\n1. Agendar nova consulta\n2. Reagendar uma consulta\n3. Receber o link da consulta\n4. Solicitar nota fiscal\n5. Sou um novo paciente\n6. Outros assuntos');
        }
        return;
    }

    if (etapa === 'novo_paciente' || etapa === 'outros') {
        if (texto === '1') {
            sessoes[telefone].etapa = 'aguardando_dados_agendamento';
            await msg.reply('Perfeito! 😊\nO Dr. João atende nas quartas e quintas, de manhã e até o final da tarde.\n\nPor favor, envie seu *nome*, *gmail* e *horários de preferência*.');
        } else if (texto === '2') {
            sessoes[telefone].etapa = 'menu';
            await msg.reply('A consulta com o Dr. João é realizada de forma *online*, pelo Google Meet. 💻\n\nApós o agendamento e pagamento, você recebe o link por aqui.\n\nDeseja agendar sua consulta?\n\n1. Sim, quero agendar\n2. Voltar ao menu principal');
        } else if (texto === '3') {
            sessoes[telefone].etapa = 'menu';
            await msg.reply('O Dr. João é especialista em [especialidade]. 🩺\n\nCom anos de experiência, atende [descrição breve].\n\nQuer saber mais ou agendar uma consulta?\n\n1. Agendar consulta\n2. Voltar ao menu principal');
        } else {
            await msg.reply('Por favor, escolha uma opção válida:\n\n1. Agendar primeira consulta\n2. Como funciona a consulta\n3. Saber mais sobre o Dr. João');
        }
        return;
    }

    if (['aguardando_dados_agendamento', 'aguardando_dados_reagendamento', 'aguardando_comprovante', 'aguardando_dados_nf'].includes(etapa)) {
        sessoes[telefone].etapa = 'menu';
        await msg.reply('✅ Informações recebidas! O Dr. João entrará em contato em breve para confirmar.\n\nPosso ajudar com mais alguma coisa?\n\n1. Agendar nova consulta\n2. Reagendar uma consulta\n3. Receber o link da consulta\n4. Solicitar nota fiscal\n5. Sou um novo paciente\n6. Outros assuntos');
        return;
    }
});

client.initialize();