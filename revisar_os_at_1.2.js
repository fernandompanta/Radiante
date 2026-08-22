//Revisa O.S AT versão 1.2

//Acrescentada funcionalidades de verificação e justificativa automática de fotos que não foram aprovadas pela IA do Esmeralda.
//Melhorado alguns avisos de execução para melhor entendimento do usuário.

const { chromium } = require('playwright');

async function main() {

    const browser = await chromium.launch({
        headless: false,
        args: ['--force-device-scale-factor=1.0']
    });

    const page = await browser.newPage();


    // ============================================================
    // LOGIN
    // ============================================================
    console.log('Inicializando fase de Revisar O.S');
    await page.goto('https://radiante.esmeralda.net.br/login');
    await page.getByRole('textbox', { name: 'Usuário' }).click();
    await page.getByRole('textbox', { name: 'Usuário' }).fill('fernando.silva');
    await page.getByRole('textbox', { name: 'Usuário' }).press('Tab');
    await page.getByRole('textbox', { name: 'Senha' }).fill('1234');
    await page.getByRole('button', { name: 'Entrar' }).click();
    console.log(' ');
    console.log('Inicializando fase de Revisar as O.S...');

    // ============================================================
    // ACESSA REVISAR OS
    // ============================================================
    await page.getByRole('link', { name: 'Gestão' }).click();
    await page.getByRole('link', { name: ' Ordem de Serviço' }).click();
    await page.getByRole('link', { name: ' Revisar OS' }).click();

    

    // ============================================================
    // FILTRO ASSISTÊNCIA TÉCNICA
    // ============================================================
    await page.getByRole('textbox').nth(3).click();
    await page.getByRole('treeitem', { name: 'Assistência Técnica (AT)' }).click();
    await page.waitForTimeout(1000);
    console.log(' ');
    console.log('Inicializando tela de Revisar...');

    // ============================================================
    // BUSCAR
    // ============================================================
    await page.locator('.filter-search').click();
    console.log(' ');
    console.log('Filtrando as O.S...');
    await page.waitForTimeout(6000);
    await page.getByText('resultados por página').click();
    await page.getByLabel('resultados por página').selectOption('100');
    await page.waitForTimeout(5000);


    // ============================================================
    // CONTROLE DAS O.S.
    // ============================================================
    const processadas = new Set();

    let contador = 0;
    
    // ============================================================
    // LOOP PRINCIPAL
    // ============================================================

    while (true) { //---------------------------------------------------------->> INICIO DO WHILE

        console.log('');
        console.log('================================================');
        console.log('PROCURANDO PRÓXIMA O.S.');
        console.log('================================================');


        // --------------------------------------------------------
        // Pega as O.S. atualmente disponíveis na fila
        // --------------------------------------------------------

        const revisoes = page.locator('.review-os');

        const quantidade = await revisoes.count();

        console.log(`O.S. disponíveis na página: ${quantidade}`);


        // --------------------------------------------------------
        // Se não houver nenhuma O.S., encerra
        // --------------------------------------------------------

        if (quantidade === 0) {

            console.log('');
            console.log('========================================');
            console.log('NENHUMA O.S. DISPONÍVEL');
            console.log('========================================');

            break;
        }


        // --------------------------------------------------------
        // Procura uma O.S. ainda não processada
        // --------------------------------------------------------

        let osEscolhida = null;

        for (let i = 0; i < quantidade; i++) {

            const revisao = revisoes.nth(i);

            const idOS = await revisao.getAttribute('meta-id');

            console.log(`OS encontrada na posição ${i}: ${idOS}`);

                if (!idOS) {
                    continue;
                }

                if (!processadas.has(idOS)) {
                    osEscolhida = revisao;

                    break;
                }
        }


        // --------------------------------------------------------
        // Se todas as O.S. da página já foram processadas
        // --------------------------------------------------------

        if (!osEscolhida) {

            console.log('');
            console.log('========================================');
            console.log('TODAS AS O.S. DESTA PÁGINA JÁ FORAM');
            console.log('PROCESSADAS.');
            console.log('========================================');

            break;
        }


        // --------------------------------------------------------
        // ID da O.S.
        // --------------------------------------------------------

        const idOS = await osEscolhida.getAttribute('meta-id');

        contador++;

        console.log('');
        console.log('########################################');
        console.log(`PROCESSANDO O.S. ${idOS}`);
        console.log(`O.S. número ${contador}`);
        console.log('########################################');


        // --------------------------------------------------------
        // Marca como processada ANTES de abrir
        // --------------------------------------------------------

        processadas.add(idOS);


        // ========================================================
        // ABRIR O.S.
        // ========================================================

        console.log(`[${idOS}] Abrindo O.S...`);
        await osEscolhida.getByText('Revisar').click();
        await page.waitForTimeout(7000);
        console.log(`[${idOS}] O.S. aberta.`);
        await page.locator('.remove-all-activity').first().click();
        console.log('Excluido atividade, se houver..');

        // ========================================================
        // ADICIONAR ATIVIDADE 001
        // ========================================================

        console.log(`[${idOS}] Adicionando atividade 001...`);
        await page.getByText('Editar Atividades: Selecione').click();
        await page.waitForTimeout(1000);
        await page.getByText('Código: 814373').click();
        await page.waitForTimeout(3000);
        console.log(`[${idOS}] Atividade 001 adicionada.`);


        // ========================================================
        //  ANALISAR FOTOS DA IA
        // ========================================================

        const fotos = page.locator(
            '.photo-item.ai-validation-approved, ' +
            '.photo-item.ai-validation-not-approved, ' +
            '.photo-item.ai-validation-manual-approved'
        );

        const totalFotosIA = await fotos.count();

            let fotosVerdes = 0;
            let fotosVermelhas = 0;
            let fotosManuais = 0;


        console.log('');
        console.log(`[${idOS}] FOTOS DA IA`);
        console.log('----------------------------------------');


        for (let i = 0; i < totalFotosIA; i++) {

            const foto = fotos.nth(i);

            const classe = await foto.getAttribute('class');

            console.log(`Foto IA ${i}: ${classe}`);


            if (classe && classe.includes('ai-validation-approved')) {
                fotosVerdes++;
            }

            if (classe && classe.includes('ai-validation-not-approved')) {
                fotosVermelhas++;
            }

            if (classe && classe.includes('ai-validation-manual-approved')) {
                fotosManuais++;
            }
        }


        console.log('');
        console.log(`[${idOS}] RESULTADO IA`);
        console.log(`Fotos IA: ${totalFotosIA}`);
        console.log(`Verdes: ${fotosVerdes}`);
        console.log(`Vermelhas: ${fotosVermelhas}`);
        console.log(`Manuais: ${fotosManuais}`);



    // =============================================================================================
    // 🔎 PROCURA JUSTIFICATIVAS PARA AS FOTOS NÃO APROVADAS PELA I.A DO ESMERALDA
    // =============================================================================================

        // ====================================================
        // 🔧 NORMALIZA TEXTO DO FCA PARA COMPARAÇÃO
        // ====================================================

        function normalizarTexto(texto) {

        return String(texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }

        // ========================================================
        // LER FECHAMENTO DA O.S.
        // ========================================================

        const fechamento = await page.locator('textarea').nth(3).inputValue();

        console.log('');
        console.log(`[${idOS}] FECHAMENTO DA O.S.`);
        console.log('----------------------------------------');
        console.log(fechamento);
        console.log('----------------------------------------');


        // ========================================================
        // VERIFICAR PALAVRAS-CHAVE NO FECHAMENTO
        // ========================================================

        const fechamentoNormalizado = fechamento
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        const palavrasOcupacao = [
            'ocupacao',
            'produtividade',
            'volume',
            'cancelado'
        ];

        const encontrouPalavra = palavrasOcupacao.some(palavra =>
            fechamentoNormalizado.includes(palavra)
        );

        let justificativaFCA = null;

                if (encontrouPalavra) {

                justificativaFCA = 'Não houve atuacao nesse chamado.';

                console.log('');
                console.log(`[${idOS}] 🔎 PALAVRA-CHAVE ENCONTRADA NO FECHAMENTO.`);

                console.log(`[${idOS}] Justificativa FCA para as fotos:`);

                console.log(`[${idOS}] ${justificativaFCA}`);

                } else {

                console.log('');
                console.log(`[${idOS}] Nenhuma palavra-chave encontrada no fechamento.`);
                }


    // ========================================================
    // CONDIÇÃO CASO TENHA FOTOS VERMELHAS
    // ========================================================

    
    if (fotosVermelhas > 0) {


    // 🔴 TEM FOTO VERMELHA
    // ====================================================

        console.log('');
        console.log(`[${idOS}] FOTO(S) VERMELHA(S) ENCONTRADA(S).`);
        console.log(`[${idOS}] Iniciando aprovação manual das fotos...`);

    // ====================================================
    // 📋 REGRAS DE JUSTIFICATIVA
    // ====================================================


        function encontrarJustificativa(textoFoto) {

        const texto = normalizarTexto(textoFoto);

            console.log('');
            console.log('Texto modificado para identificação:');
            console.log(texto);

    // JUSTIFICATIVAS DA FOTO 01
    // ====================================================
                if (
                    texto.includes('foto do local') && texto.includes('visao geral') || texto.includes('close-up')) {

                    console.log('✅ Regra encontrada: Foto do Local - visão geral/close-up');

                    return 'Foto do Rack onde estão os equipamentos do cliente.';
                }

                if (
                    texto.includes('foto do local') && texto.includes('desfoque')) {

                    console.log('✅ Regra encontrada: Foto do Local - desfoque');

                    return 'Aprovado OK.';
                }


    // JUSTIFICATIVAS DA FOTO 02
    // ====================================================
                if (
                    texto.includes('selfie da equipe uniformizada') && texto.includes('usando capacete')) {

                    console.log('✅ Regra encontrada: Selfie + capacete');

                    return 'Não havia necessidade de uso de capacete nesse cliente.';
                }

                if (
                    texto.includes('selfie da equipe uniformizada') && texto.includes('verde') || texto.includes('uniforme')) {

                    console.log('✅ Regra encontrada: Selfie + uniforme/verde');

                    return 'Aprovado OK.';
                }

                if (
                    texto.includes('selfie da equipe uniformizada') && texto.includes('desfoque')) {

                    console.log('✅ Regra encontrada: Selfie + desfoque');

                    return 'Aprovado OK.';
                }

    
    // JUSTIFICATIVAS DA FOTO 03
    // ====================================================
                if (
                    texto.includes('de trabalho') && texto.includes('desfoque')) {

                    console.log('✅ Regra encontrada: condições de trabalho + desfoque');

                    return 'Aprovado OK.';
                }

                if (
                    texto.includes('de trabalho') && texto.includes('obstruindo')) {

                    console.log('✅ Regra encontrada: condições de trabalho + obstruindo');

                    return 'Aprovado OK.';
                }


    // JUSTIFICATIVAS DA FOTO 05
    // ====================================================
                if (
                    texto.includes('panoramica') && texto.includes('desfoque')) {

                    console.log('✅ Regra encontrada: panoramica + desfoque');

                    return 'Aprovado OK.';
                }

                console.log('⚠️ Nenhuma regra encontrada para esta foto.');

                return null;
        }


    // ====================================================
    // 📸 LOCALIZA FOTOS REPROVADAS PELA IA
    // ====================================================

        const fotosReprovadas = page.locator('.photo-item.ai-validation-not-approved');

        const quantidadeReprovadas = await fotosReprovadas.count();

        console.log(`[${idOS}] Fotos reprovadas pela IA: ${quantidadeReprovadas}`);


    // ====================================================
    // 📸 PERCORRE CADA FOTO REPROVADA
    // ====================================================

            for (let i = 0; i < quantidadeReprovadas; i++) {

                    console.log('');
                    console.log(`[${idOS}] Processando foto reprovada ${i + 1} de ${quantidadeReprovadas}...`);


                    // ------------------------------------------------
                    // Pega novamente a primeira foto reprovada
                    // ------------------------------------------------

                    const fotoReprovada = page.locator('.photo-item.ai-validation-not-approved').first();


                    // ------------------------------------------------
                    // Captura o texto da foto ANTES de abrir
                    // ------------------------------------------------

                    let textoFoto = '';

                                try {

                                    textoFoto = await fotoReprovada.getAttribute('data-original-title');

                                    console.log('');
                                    console.log(`[${idOS}] Texto da foto encontrado:`);

                                    console.log(`[${idOS}] ${textoFoto}`);

                                } catch (erro) {

                                    console.log(`[${idOS}] Não conseguiu ler o atributo da foto.`);

                                }


                    // ------------------------------------------------
                    // Abre a foto
                    // ------------------------------------------------

                    await fotoReprovada.click();

                    await page.waitForTimeout(1000);


                    // ====================================================
                    // ESCOLHER A JUSTIFICATIVA
                    // ====================================================

                    let justificativa = null;

                if (justificativaFCA) {

                        // ====================================================
                        // PRIORIDADE 1 - JUSTIFICATIVA DO FCA
                        // ====================================================

                        justificativa = justificativaFCA;

                        console.log(`[${idOS}] 📝 Usando justificativa encontrada no FCA.`);

                } else {

                        // ====================================================
                        // PRIORIDADE 2 - REGRA ESPECÍFICA DA FOTO
                        // ====================================================

                        justificativa = encontrarJustificativa(textoFoto);

                                if (justificativa) {

                                console.log(`[${idOS}] 📝 Usando justificativa específica da foto.`);

                                }
                }



                        // =================================================
                        // 🔎 TENTA CAPTURAR INFORMAÇÕES DO MODAL
                        // =================================================

                try {

                    const modal = page.locator('.modal.show');

                                if (await modal.count() > 0) {

                                        const textoModal = await modal.last().innerText();

                                        console.log(`[${idOS}] Texto do modal:`);

                                        console.log(`[${idOS}] ${textoModal}`);


                                        // Junta as informações da foto com as informações
                                        // apresentadas no modal.

                                        textoFoto = `${textoFoto}\n${textoModal}`;
                                }

                } catch (erro) {

                    console.log(`[${idOS}] ⚠️ Não conseguiu ler o texto do modal.`);
                }


                // =================================================
                // 📝 ENCONTRA JUSTIFICATIVA
                // =================================================

                //const justificativa = encontrarJustificativa(textoFoto);


                // =================================================
                // ⚠️ SE NÃO ENCONTROU REGRA
                // =================================================

                if (!justificativa) {

                    console.log('');
                    console.log(`[${idOS}] ATENÇÃO: não existe justificativa cadastrada para esta foto.`);

                    console.log(`[${idOS}] Foto NÃO será aprovada automaticamente.`);

                    console.log(`[${idOS}] Verifique manualmente esta foto.`);


                // ---------------------------------------------
                // Fecha o modal
                // ---------------------------------------------

                const botaoFecharSemRegra = page.getByRole('button', {name: 'Fechar'});

                                if (await botaoFecharSemRegra.count() > 0) {

                                        await botaoFecharSemRegra.last().click();

                                        await page.waitForTimeout(1000);
                                }


                // ---------------------------------------------
                // Interrompe o processamento das fotos
                // ---------------------------------------------

                console.log(`[${idOS}] Foto ${i + 1} permanecerá vermelha para revisão manual.`);

                continue;
            
                }


                // =================================================---------------------------------------------------------------------------------------------
                // 🔴 APROVAR MANUALMENTE
                // =================================================

                console.log(`[${idOS}] Aprovando automaticamente pela I.A....`);

                await page.getByRole('button', {name: ' Aprovar manualmente'}).click();

                await page.waitForTimeout(1000);


                // =================================================
                // 📝 PREENCHER JUSTIFICATIVA
                // =================================================

                const campoJustificativa = page.locator('.modal-body > div > .form-control');

                await campoJustificativa.click();

                await campoJustificativa.fill(justificativa);

                console.log(`[${idOS}] 📝 Justificativa preenchida: ${justificativa}`);


                // =================================================
                // ✅ APROVAR
                // =================================================

                await page.getByRole('button', {name: ' Aprovar',exact: true}).click();

                await page.waitForTimeout(1500);

                console.log(`[${idOS}] ✅ Foto ${i + 1} aprovada automaticamente pela I.A.`);


                // =================================================
                // ❌ FECHAR MODAL
                // =================================================

                const botaoFechar = page.getByRole('button', {name: 'Fechar'});


                if (await botaoFechar.count() > 0) {

                        await botaoFechar.last().click();

                        await page.waitForTimeout(1000);
                }




            } //============================== FIM DO FOR


    // ====================================================
    // ✅ TODAS AS FOTOS PROCESSADAS
    // ====================================================

        console.log('');
        console.log(`[${idOS}] Avançando...`);

/*
    // ====================================================
    // 💾 SALVAR O.S.
    // ====================================================

    await page.waitForTimeout(2000);

    console.log(`[${idOS}] Salvando O.S...`);


    await page.getByRole('button', {
        name: 'Salvar',
        exact: true
    }).click();
*/

    // ====================================================
    // 🔎 VERIFICA SE AINDA EXISTEM FOTOS VERMELHAS
    // ====================================================

        await page.waitForTimeout(2000);

        const fotosVermelhasRestantes = page.locator('.photo-item.ai-validation-not-approved');

        const quantidadeVermelhasRestantes = await fotosVermelhasRestantes.count();

        console.log(`[${idOS}] Fotos vermelhas restantes: ${quantidadeVermelhasRestantes}`); 


            if (quantidadeVermelhasRestantes > 0) {

                    // Ainda existe foto vermelha
                    console.log(`[${idOS}] Ainda existem fotos vermelhas.`);

                    console.log(`[${idOS}] Salvando O.S sem avançar de fase...`);

                    await page.getByRole('button', {name: 'Salvar',exact: true}).click();

                    await page.waitForTimeout(6000);

                    console.log(`[${idOS}] O.S salva.`);

            } else {

                    // Todas as fotos foram justificadas/aprovadas
                    console.log(`[${idOS}] Todas as fotos vermelhas foram justificadas.`);

                    console.log(`[${idOS}] Salvando e avançando de fase...`);

                    await page.getByRole('button', {name: 'Salvar e Avançar Fase'}).click();

                    await page.waitForTimeout(5000);

                    // Confirmação do avanço
                    const botaoContinuar = page.getByRole('button', {name: ' Continuar'});

                                if (await botaoContinuar.count() > 0) {

                                            console.log(`[${idOS}] Botão Continuar encontrado.`);

                                            await botaoContinuar.click();

                                            await page.waitForTimeout(1500);

                                            console.log(`[${idOS}] Avanço confirmado.`);

                                } else {

                                            console.log(`[${idOS}] Botão Continuar não apareceu.`);
                                }

                    await page.waitForTimeout(4000);

                    console.log(`[${idOS}] O.S. avançada de fase.`);

            }


            await page.waitForTimeout(6000);

            console.log(`[${idOS}] O.S. salva.`);


        // ====================================================
        // ❌ FECHAR MENSAGEM DE SUCESSO
        // ====================================================

        const botaoFecharSucesso = page.getByRole('button', {name: 'Fechar'});


                if (await botaoFecharSucesso.count() > 0) {

                        await botaoFecharSucesso.last().click();

                        await page.waitForTimeout(4000);
                }

                        console.log(`[${idOS}] Voltou para a fila.`);

                } else {

                        // ====================================================
                        // 🟢 NÃO TEM FOTO VERMELHA
                        // ====================================================

                        console.log('');
                        console.log(`[${idOS}] Nenhuma foto vermelha.`);
                        console.log(`[${idOS}] Ação: SALVAR E AVANÇAR FASE.`);

                        await page.waitForTimeout(1000);

                        await page.getByRole('button', {name: 'Salvar e Avançar Fase'}).click();

                        await page.waitForTimeout(5000);


                        // ====================================================
                        // CONFIRMA AVANÇO
                        // ====================================================

                        const botaoContinuar = page.getByRole('button', {name: ' Continuar'});


                                    if (await botaoContinuar.count() > 0) {

                                            console.log(`[${idOS}] Botão Continuar encontrado.`);

                                            await botaoContinuar.click();

                                            await page.waitForTimeout(1500);

                                            console.log(`[${idOS}] Avanço confirmado.`);

                                    } else {

                                            console.log(`[${idOS}] Botão Continuar não apareceu.`);

                                            console.log(`[${idOS}] Avançando com a revisão...`);

                                            await page.waitForTimeout(1500);
                                    }

                        await page.waitForTimeout(4000);

                        console.log(`[${idOS}] O.S. avançada de fase.`);


                        // ====================================================
                        // PEQUENA PAUSA ANTES DA PRÓXIMA O.S.
                        // ====================================================

                        await page.waitForTimeout(3000);

                        console.log('');
                        console.log('----------------------------------------');
                        console.log('Voltando para procurar próxima O.S...');
                        console.log('----------------------------------------');
                }

    } //-----------------------------------------------------------------FIM DO WHILE


    // ============================================================
    // 10. FINAL
    // ============================================================

    console.log('');
    console.log('================================================');
    console.log('             REVISÃO FINALIZADA');
    console.log('================================================');
    console.log(`O.S. processadas: ${processadas.size}`);
    console.log('');
    console.log('IDs processados:');

    for (const id of processadas) {
        console.log(`- ${id}`);
    }

    console.log('');
    console.log('================================================');
    console.log('             REVISÃO FINALIZADA');
    console.log('================================================');


    // Não fecha o navegador ainda
    await browser.close();




    // Mantém o programa aberto até você pressionar Ctrl + C no terminal
    //await new Promise(() => {});

    //Comando para abrir o Codegen
    //npx playwright codegen https://radiante.esmeralda.net.br/gestao/ordem-servico/revisar-os
}

main();