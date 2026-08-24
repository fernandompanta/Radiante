//Endossar chamado Ativação ATV OS versão 1.0

//Este programa tem como fluxi principal o Endosso das O.S de Ativação através do Esmeralda pelo Playwright

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
    console.log('Inicializando fase de Endosso das O.S...');

    // ============================================================
    // ACESSA REVISAR OS
    // ============================================================
    await page.getByRole('link', { name: 'Gestão' }).click();
    await page.getByRole('link', { name: ' Ordem de Serviço' }).click();
    await page.getByRole('link', { name: ' Endossar OS' }).click();
    console.log(' ');
    console.log('Inicializando tela de Endosso...');

    // ============================================================
    // FILTRO ASSISTÊNCIA TÉCNICA
    // ============================================================
    await page.getByRole('textbox').nth(3).click();
    await page.getByRole('treeitem', { name: 'Ativação' }).click();
    await page.waitForTimeout(1000);

    // ============================================================
    // BUSCAR
    // ============================================================
    await page.locator('.filter-search').click();
    console.log(' ');
    console.log('Filtrando as O.S...');
    await page.waitForTimeout(6000);

    const osEndossar = page.locator('.endorse-os');
    const quantidadeOS = await osEndossar.count();
    console.log(`O.S. para endossar: ${quantidadeOS}`);

    // ============================================================
    // CONDIÇÃO DE ENDOSSO DAS O.S
    // ============================================================

    if (quantidadeOS > 0) {

            console.log(' ');
            console.log('Inicializando endosso...');

            await page.getByText('resultados por página').click();
            await page.getByLabel('resultados por página').selectOption('100');
            await page.waitForTimeout(5000);

            // ============================================================
            // SELEÇÃO PARA ENDOSSAR A O.S
            await page.locator('label').nth(4).click();
            await page.getByText('Endosar OSs').click();
            await page.waitForTimeout(6000);



            // ============================================================
            // ACEITA O AVISO DE ENDOSSAR
            // ============================================================
            await page.getByRole('button', { name: ' Sim' }).click();
            console.log('Endossando as O.S...');
            await page.waitForTimeout(70000); //------------>> Incluído tempo de 70 segundos para o endosso finalizar
            await page.getByRole('button', { name: 'Fechar',exact: true}).click();

            //await page.getByRole('button', {name: 'Salvar',exact: true}).click();

            await page.waitForTimeout(6000);

    } else {

            console.log(' ');
            console.log('Não existe O.S para Endossar. Finalizando...');

            //await page.getByRole('button', { name: 'Fechar Aviso' }).click();

            //await page.waitForTimeout(1000);

            //await browser.close();
    }




    // ============================================================
    // AVISO DE FINALIZAÇÃO DO ENDOSSO
    // ============================================================
    console.log('');
    console.log('================================================');
    console.log('              ENDOSSO FINALIZADO');
    console.log('================================================');
    



    // Não fecha o navegador ainda
    await browser.close();
    

    // Mantém o programa aberto até você pressionar Ctrl + C no terminal
    //await new Promise(() => {});

    //Comando para abrir o Codegen
    //npx playwright codegen https://radiante.esmeralda.net.br/gestao/ordem-servico/endossar-os
}

main();