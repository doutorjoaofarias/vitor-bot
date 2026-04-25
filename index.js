const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

const sessoes = {};

// Função para simular digitação
async function enviarComDigitando(msg, texto, tempo = 3500) {
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    await new Promise(resolve => setTimeout(resolve, tempo));
    await chat.clearState();
    await msg.reply(texto);
}

const MENU_PRINCIPAL = `1. Agendar nova consulta\n2. Reagendar uma consulta\n3. Receber o link da consulta\n4. Solicitar nota fiscal\n5. Sou um novo paciente\n6. Outros assuntos\n7. Encerrar atendimento`;

const MENU_RECOMECAR = `Então vamos começar de novo. 😊\n\nComo posso ajudar você hoje?\n\n${MENU_PRINCIPAL}`;

const CONFIRMACAO = `✅ Informações recebidas! Em breve um atendente entrará em contato com você para confirmar.\n\nPosso ajudar com mais alguma coisa?\n\n${MENU_PRINCIPAL}`;

const HORARIOS = `O Dr. João atende nas quartas e quintas, das 9 às 19h. A sexta é somente para novos pacientes.`;

const MENU_OUTROS = `Ah, entendi! Então, vamos lá, como eu posso ajudar você hoje?\n\n1. Agendar primeira consulta\n2. Como funciona a consulta\n3. Saber mais sobre o Dr. João\n4. Valores`;

const MENU_NOVO_PACIENTE = `Seja bem-vindo(a)! 🎉 Então, vamos lá, como eu posso ajudar você hoje?\n\n1. Agendar primeira consulta\n2. Como funciona a consulta\n3. Saber mais sobre o Dr. João\n4. Valores\n5. Voltar ao Menu Inicial`;

const SOBRE_DR_JOAO = `👨‍⚕️ *Conheça o Dr. João Farias*\n\nO Dr. João Farias acredita que a medicina deve ir muito além da aborgagens de sintomas isolados; ela deve ser uma ponte para o reestabelecimento pleno da saúde física, mental e espiritual.\n\n*Trajetória e Formação*\nFormado pela Universidade Federal do Maranhão (UFMA), consolidou sua experiência com residência médica e atuação no Rio de Janeiro, acumulando mais de 8 anos de experiência na área médica.\n\n• Residência em Medicina de Família e Comunidade\n• Pós-Graduação em Psiquiatria\n• Abordagem Integrativa\n\n*Filosofia de Atendimento*\nAs primeiras consultas têm duração média de 1h30, permitindo um espaço seguro para que o paciente seja ouvido sem julgamentos. A partir desse encontro, é elaborado um Plano de Tratamento Individualizado.\n\n*Áreas de Atuação*\n🧠 Saúde Mental: Depressão, Bipolaridade, Ansiedade, Pânico, Burnout, TDAH, Borderline, Transtornos do Sono e Alimentares.\n❤️ Saúde Orgânica: Tireoide, Diabetes, Hipertensão — sempre sob a ótica da medicina preventiva e integrativa.\n\n*Missão*\nProporcionar um atendimento onde o paciente se sinta protagonista de sua própria cura.\n\n💬 _"O Dr. João dedica-se a entender o que está por trás do sintoma. Se você busca um acompanhamento que valorize você enquanto pessoa, você está no lugar certo."_\n\nQuer saber mais ou agendar uma consulta?\n\n1. Agendar consulta\n2. Voltar ao Menu Principal`;

const COMO_FUNCIONA = `🗺️ *Como funciona a consulta do Dr. João Farias*\n\n*1. Formulário Clínico Prévio*\nAntes da consulta, você preenche um formulário detalhado com sua história, sintomas e histórico de saúde. Isso permite que o Dr. João chegue já conhecendo o seu cenário.\n\n*2. A Consulta (1h30)*\nRealizada via Telemedicina, com total privacidade. Olharemos para a saúde mental e orgânica de forma integrada, com foco nas causas raízes dos seus problemas.\n\n*3. Plano de Tratamento Individual (PTI)*\nA partir da segunda consulta, você recebe um plano estruturado para o reestabelecimento da sua saúde física, mental e espiritual.\n\n*4. Suporte e Acompanhamento*\nÀs quartas e quintas, o Dr. João fica disponível para responder dúvidas dos pacientes via WhatsApp. Todas as consultas geram Nota Fiscal para reembolso.\n\n📋 *Informações Importantes:*\n• Modalidade: 100% Online (Telemedicina)\n• Investimento: R$ 600,00 por consulta\n• Agendamentos: Realizados após confirmação do pagamento\n• Não são aceitos convênios de saúde\n\n💬 _"Saúde não é apenas a ausência de doença, é a presença de vitalidade e paz mental."_\n\nComo posso te ajudar?\n\n1. Agendar consulta\n2. Voltar ao Menu Principal\n3. Valores`;

const VALORES = `💰 *Saúde: O seu maior investimento, não um custo.*\n\nMuitas vezes olhamos para o valor de uma consulta como um gasto. Mas quanto vale viver bem?\n\n*Por que R$ 600,00 vale a pena:*\n\n1️⃣ *Tempo é vida*\nO tempo que se tem é a vida que se tem. Quando acaba a vida também acaba o tempo. Por isso, aquilo que você mais dedica tempo é o que é mais importante para você. Um médico que passa 1h30 dedicando a vida a um paciente, quando a média de tempo de consultas no Brasil é de 15 minutos, com certeza ama o seu paciente. Do que adianta pagar 600 reais de plano de saúde se você não consegue ficar nem 15 minutos em atendimento? Se você não é visto e nem ouvido de verdade?\n\n2️⃣ *Se não há tempo para a saúde agora, terá para a doença depois.*\nTratar uma doença avançada custa muito mais - financeira e psicologicamente - para você e para todos que o amam. Você já adiou muito, não perca mais tempo, pois tempo é vida.\n\n3️⃣ *Um Plano, não uma Receita*\nSua vida é única e particular! Não ache que um remédio milagroso vai resolver a complexidade da sua situação. Você precisa ser visto em sua particularidade. Por isso, Dr. João desenvolve um Plano de Tratamento Individual para você a partir da 2ª consulta.\n\n4️⃣ *Você não está sozinho*\nA cada 15 dias o Dr. João acompanha via WhatsApp o seu quadro. Ele fica disponível para dúvidas e orientações. Não é um encontro mensal, mas vários encontros ao longo do mês que culminam na consulta mensal. É sobre longitudinalidade.\n\nPosso ajudar com mais alguma coisa?\n\n1. Agendar consulta\n2. Voltar ao Menu Principal`;

client.on('qr', (qr) => {
    console.log('📱 Escaneie o QR Code abaixo com seu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Vítor está online e pronto para atender!');
});

client.on('message', async (msg) => {
    const contato = await msg.getContact();
    const nome = contato.pushname || 'paciente';
    const texto = msg.body.trim();
    const telefone = msg.from;

    // Primeira mensagem
    if (!sessoes[telefone]) {
        sessoes[telefone] = { etapa: 'menu' };
        await enviarComDigitando(msg, `Olá, ${nome}! 👋\nMeu nome é Vítor, sou o assistente virtual do Dr. João.\n\nComo posso ajudar você hoje?\n\n${MENU_PRINCIPAL}`);
        return;
    }

    const etapa = sessoes[telefone].etapa;

    // Opção 7 — Encerrar atendimento (disponível em qualquer etapa)
    if (texto === '7') {
        delete sessoes[telefone];
        await enviarComDigitando(msg, '👋 Atendimento encerrado! Obrigado pelo contato. Qualquer dúvida é só chamar. Tenha um ótimo dia! 😊');
        return;
    }

    if (etapa === 'menu') {
        if (texto === '1') {
            sessoes[telefone].etapa = 'aguardando_dados_agendamento';
            await enviarComDigitando(msg, `Perfeito, vamos lá! 🤝\n${HORARIOS}\n\nPor favor, envie seu *nome*, *gmail* e *dias e horários de preferência*.`);
        } else if (texto === '2') {
            sessoes[telefone].etapa = 'aguardando_dados_reagendamento';
            await enviarComDigitando(msg, `Ótimo, vamos lá! 🤝\n${HORARIOS}\n\nPor favor, envie seu *nome*, *gmail* e *dias e horários de preferência*.`);
        } else if (texto === '3') {
            sessoes[telefone].etapa = 'aguardando_comprovante';
            await enviarComDigitando(msg, 'Entendi! Pode me enviar seu *nome* e o *comprovante de pagamento*, por favor?');
        } else if (texto === '4') {
            sessoes[telefone].etapa = 'aguardando_dados_nf';
            await enviarComDigitando(msg, 'Claro! Preciso que me envie:\n\n📋 *Nome Completo*\n📋 *CPF*\n📋 *Endereço*\n📋 *Valor e data da consulta*');
        } else if (texto === '5') {
            sessoes[telefone].etapa = 'novo_paciente';
            await enviarComDigitando(msg, MENU_NOVO_PACIENTE);
        } else if (texto === '6') {
            sessoes[telefone].etapa = 'outros';
            await enviarComDigitando(msg, MENU_OUTROS);
        } else {
            await enviarComDigitando(msg, `Por favor, escolha uma das opções enviando o *número* correspondente:\n\n${MENU_PRINCIPAL}`);
        }
        return;
    }

    if (etapa === 'novo_paciente') {
        if (texto === '1') {
            sessoes[telefone].etapa = 'aguardando_dados_agendamento';
            await enviarComDigitando(msg, `Perfeito, vamos lá! 🤝\n${HORARIOS}\n\nPor favor, envie seu *nome*, *gmail* e *dias e horários de preferência*.`);
        } else if (texto === '2') {
            sessoes[telefone].etapa = 'como_funciona';
            await enviarComDigitando(msg, COMO_FUNCIONA);
        } else if (texto === '3') {
            sessoes[telefone].etapa = 'sobre_dr_joao';
            await enviarComDigitando(msg, SOBRE_DR_JOAO);
        } else if (texto === '4') {
            sessoes[telefone].etapa = 'valores';
            await enviarComDigitando(msg, VALORES);
        } else if (texto === '5') {
            sessoes[telefone].etapa = 'menu';
            await enviarComDigitando(msg, MENU_RECOMECAR);
        } else {
            await enviarComDigitando(msg, 'Por favor, escolha uma opção válida:\n\n1. Agendar primeira consulta\n2. Como funciona a consulta\n3. Saber mais sobre o Dr. João\n4. Valores\n5. Voltar ao Menu Inicial');
        }
        return;
    }

    if (etapa === 'outros') {
        if (texto === '1') {
            sessoes[telefone].etapa = 'aguardando_dados_agendamento';
            await enviarComDigitando(msg, `Perfeito, vamos lá! 🤝\n${HORARIOS}\n\nPor favor, envie seu *nome*, *gmail* e *dias e horários de preferência*.`);
        } else if (texto === '2') {
            sessoes[telefone].etapa = 'como_funciona';
            await enviarComDigitando(msg, COMO_FUNCIONA);
        } else if (texto === '3') {
            sessoes[telefone].etapa = 'sobre_dr_joao';
            await enviarComDigitando(msg, SOBRE_DR_JOAO);
        } else if (texto === '4') {
            sessoes[telefone].etapa = 'valores';
            await enviarComDigitando(msg, VALORES);
        } else {
            await enviarComDigitando(msg, 'Por favor, escolha uma opção válida:\n\n1. Agendar primeira consulta\n2. Como funciona a consulta\n3. Saber mais sobre o Dr. João\n4. Valores');
        }
        return;
    }

    if (etapa === 'sobre_dr_joao') {
        if (texto === '1') {
            sessoes[telefone].etapa = 'aguardando_dados_agendamento';
            await enviarComDigitando(msg, `Perfeito, vamos lá! 🤝\n${HORARIOS}\n\nPor favor, envie seu *nome*, *gmail* e *dias e horários de preferência*.`);
        } else if (texto === '2') {
            sessoes[telefone].etapa = 'menu';
            await enviarComDigitando(msg, MENU_RECOMECAR);
        } else {
            await enviarComDigitando(msg, 'Por favor, escolha uma opção válida:\n\n1. Agendar consulta\n2. Voltar ao Menu Principal');
        }
        return;
    }

    if (etapa === 'como_funciona') {
        if (texto === '1') {
            sessoes[telefone].etapa = 'aguardando_dados_agendamento';
            await enviarComDigitando(msg, `Perfeito, vamos lá! 🤝\n${HORARIOS}\n\nPor favor, envie seu *nome*, *gmail* e *dias e horários de preferência*.`);
        } else if (texto === '2') {
            sessoes[telefone].etapa = 'menu';
            await enviarComDigitando(msg, MENU_RECOMECAR);
        } else if (texto === '3') {
            sessoes[telefone].etapa = 'valores';
            await enviarComDigitando(msg, VALORES);
        } else {
            await enviarComDigitando(msg, 'Por favor, escolha uma opção válida:\n\n1. Agendar consulta\n2. Voltar ao Menu Principal\n3. Valores');
        }
        return;
    }

    if (etapa === 'valores') {
        if (texto === '1') {
            sessoes[telefone].etapa = 'aguardando_dados_agendamento';
            await enviarComDigitando(msg, `Perfeito, vamos lá! 🤝\n${HORARIOS}\n\nPor favor, envie seu *nome*, *gmail* e *dias e horários de preferência*.`);
        } else if (texto === '2') {
            sessoes[telefone].etapa = 'menu';
            await enviarComDigitando(msg, MENU_RECOMECAR);
        } else {
            await enviarComDigitando(msg, 'Por favor, escolha uma opção válida:\n\n1. Agendar consulta\n2. Voltar ao Menu Principal');
        }
        return;
    }

    if (['aguardando_dados_agendamento', 'aguardando_dados_reagendamento', 'aguardando_comprovante', 'aguardando_dados_nf'].includes(etapa)) {
        sessoes[telefone].etapa = 'menu';
        await enviarComDigitando(msg, CONFIRMACAO);
        return;
    }
});

client.initialize();
