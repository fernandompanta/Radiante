//Validar fim das O.S Ativação versão 1.0

//Este programa tem como fluxo principal Validar Fim da O.S de Ativação no Esmeralda.

const { chromium } = require('playwright');

async function main() {

    const browser = await chromium.launch({
        headless: false,
        args: ['--force-device-scale-factor=0.9']
    });

    const page = await browser.newPage();


    // ============================================================
    // LOGIN
    // ============================================================
    await page.goto('https://radiante.esmeralda.net.br/login');
    await page.getByRole('textbox', { name: 'Usuário' }).click();
    await page.getByRole('textbox', { name: 'Usuário' }).fill('fernando.silva');
    await page.getByRole('textbox', { name: 'Usuário' }).press('Tab');
    await page.getByRole('textbox', { name: 'Senha' }).fill('1234');
    await page.getByRole('button', { name: 'Entrar' }).click();
    console.log(' ');
    console.log('Inicializando fase de Validar Fim das O.S...');

    // ============================================================
    // ACESSA REVISAR OS
    // ============================================================
    await page.getByRole('link', { name: 'Gestão' }).click();
    await page.getByRole('link', { name: ' Ordem de Serviço' }).click();
    await page.getByRole('link', { name: ' Validar Fim' }).click();

    // ============================================================
    // FILTRO ASSISTÊNCIA TÉCNICA
    // ============================================================
    await page.getByRole('textbox').nth(3).click();
    await page.getByRole('treeitem', { name: 'Ativação' }).click();
    await page.waitForTimeout(1000);
    console.log(' ');
    console.log('Inicializando tela de Validar Fim...');

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


    // --------------------------------------------------------
    // LOOP PRINCIPAL
    // --------------------------------------------------------

    while (true) { //----------------------------------------------------INICIO DO WHILE

            // Verifica se ainda existem O.S. no relatório
            const quantidadeOS = await page.getByText('Avaliar').count();

            console.log(`O.S. disponíveis: ${quantidadeOS}`);

            // --------------------------------------------------------
            // Se não existem mais O.S., encerra
            // --------------------------------------------------------

                    if (quantidadeOS === 0) {

                        console.log('');
                        console.log('Não existe O.S. para validar fim. Encerrando...');

                        await page.waitForTimeout(1000);
                        //await page.getByRole('button', {name: 'Fechar'}).click().catch(() => {});
                        await page.waitForTimeout(1000);
                        await browser.close();

                        break;
                    }


            // --------------------------------------------------------
            // Existe O.S. → pega sempre a primeira
            // --------------------------------------------------------

            console.log('');
            console.log('O.S. encontrada.');
            console.log('Abrindo primeira O.S. para avaliação...');

            await page.getByText('Avaliar').first().click();

            await page.waitForTimeout(5000);


            // --------------------------------------------------------
            // Avançar fase
            // --------------------------------------------------------

            console.log('Avançando fase...');

            await page.getByRole('button', {name: 'Avançar Fase'}).click();
            await page.waitForTimeout(6000);

            console.log('O.S. avançada com sucesso.');
            console.log('Relatório atualizado.');

    } // -------------------------------------------------------------FIM DO WHILE

    console.log('');
    console.log('================================================');
    console.log('            VALIDAR FIM FINALIZADO');
    console.log('================================================');

    await browser.close();



    // Mantém o programa aberto até você pressionar Ctrl + C no terminal
    //await new Promise(() => {});

    //Comando para abrir o Codegen
    //npx playwright codegen https://radiante.esmeralda.net.br/gestao/ordem-servico/revisar-os
}

main();