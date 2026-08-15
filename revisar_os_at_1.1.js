//Revisa O.S AT versão 1.1

//Essa versão foi acrescentada algumas funcionalidades de verificação e justificativa automática de fotos que não foram aprovadas pela IA do Esmeralda.

const { chromium } = require('playwright');

async function main() {

    const browser = await chromium.launch({
        headless: false
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

    // ============================================================
    // BUSCAR
    // ============================================================
    await page.locator('.filter-search').click();
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
    // 4. LOOP PRINCIPAL
    // ============================================================

    while (true) {

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
        // 5. ABRIR O.S.
        // ========================================================

        console.log(`[${idOS}] Abrindo O.S...`);

        await osEscolhida.getByText('Revisar').click();

        await page.waitForTimeout(2000);

        console.log(`[${idOS}] O.S. aberta.`);

        await page.locator('.remove-all-activity').first().click();


        // ========================================================
        // 6. ADICIONAR ATIVIDADE 001
        // ========================================================

        console.log(`[${idOS}] Adicionando atividade 001...`);

        await page.getByText('Editar Atividades: Selecione').click();

        await page.waitForTimeout(1000);

        await page.getByText('Código: 814373').click();

        await page.waitForTimeout(3000);

        console.log(`[${idOS}] Atividade 001 adicionada.`);


        // ========================================================
        // 7. ANALISAR FOTOS DA IA
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


            if (
                classe &&
                classe.includes('ai-validation-approved')
            ) {
                fotosVerdes++;
            }


            if (
                classe &&
                classe.includes('ai-validation-not-approved')
            ) {
                fotosVermelhas++;
            }


            if (
                classe &&
                classe.includes('ai-validation-manual-approved')
            ) {
                fotosManuais++;
            }
        }


        console.log('');
        console.log(`[${idOS}] RESULTADO IA`);
        console.log(`Fotos IA: ${totalFotosIA}`);
        console.log(`Verdes: ${fotosVerdes}`);
        console.log(`Vermelhas: ${fotosVermelhas}`);
        console.log(`Manuais: ${fotosManuais}`);


        // ========================================================
        // 8. DECISÃO
        // ========================================================

        if (fotosVermelhas > 0) {

            // ====================================================
            // 🔴 TEM FOTO VERMELHA
            // ====================================================

            console.log('');
            console.log(`[${idOS}] 🔴 FOTO VERMELHA ENCONTRADA.`);
            console.log(`[${idOS}] Ação: SALVAR somente.`);

            await page.waitForTimeout(2000);

            await page.getByRole('button', {name: 'Salvar',exact: true}).click();

            await page.waitForTimeout(6000);


            console.log(`[${idOS}] O.S. salva.`);


            // ----------------------------------------------------
            // Fecha a mensagem de sucesso
            // ----------------------------------------------------

            await page.getByRole('button', {name: 'Fechar'}).click();

            await page.waitForTimeout(4000);


            console.log(`[${idOS}] Voltou para a fila.`);

        } else {

            // ====================================================
            // 🟢 NÃO TEM FOTO VERMELHA
            // ====================================================

            console.log('');
            console.log(`[${idOS}] 🟢 Nenhuma foto vermelha.`);
            console.log(`[${idOS}] Ação: SALVAR E AVANÇAR FASE.`);

            await page.waitForTimeout(1000);

            await page.getByRole('button', {
                name: 'Salvar e Avançar Fase'
            }).click();

            await page.waitForTimeout(5000);


            // ----------------------------------------------------
            // Confirma avanço
            // ----------------------------------------------------

            //await page.getByRole('button', {name: ' Continuar'}).click();

            const botaoContinuar = page.getByRole('button', {
    name: ' Continuar'
});

if (await botaoContinuar.count() > 0) {

    console.log(`[${idOS}] Botão Continuar encontrado.`);

    await botaoContinuar.click();

    await page.waitForTimeout(1500);

    console.log(`[${idOS}] Avanço confirmado.`);

} else {

    console.log(`[${idOS}] Botão Continuar não apareceu.`);
    console.log(`[${idOS}] A página provavelmente já avançou automaticamente.`);

    await page.waitForTimeout(1500);
}

            await page.waitForTimeout(4000);


            console.log(`[${idOS}] O.S. avançada de fase.`);

        }


        // ========================================================
        // 9. PEQUENA PAUSA ANTES DA PRÓXIMA O.S.
        // ========================================================

        await page.waitForTimeout(3000);


        console.log('');
        console.log('----------------------------------------');
        console.log('Voltando para procurar próxima O.S...');
        console.log('----------------------------------------');
    }


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