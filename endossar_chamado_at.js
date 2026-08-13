const { chromium } = require('playwright');

async function main() {

    const browser = await chromium.launch({
        headless: false
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

    // ============================================================
    // ACESSA REVISAR OS
    // ============================================================
    await page.getByRole('link', { name: 'Gestão' }).click();
    await page.getByRole('link', { name: ' Ordem de Serviço' }).click();
    await page.getByRole('link', { name: ' Endossar OS' }).click();

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
    // SELEÇÃO PARA ENDOSSAR A O.S
    // ============================================================
    await page.locator('label').nth(4).click();
    await page.getByText('Endosar OSs').click();
    await page.waitForTimeout(5000);



    // ============================================================
    // ACEITA O AVISO DE ENDOSSAR
    // ============================================================
    await page.getByRole('button', { name: ' Sim' }).click();

    await page.getByRole('button', { name: 'Fechar',exact: true}).click();

    //await page.getByRole('button', {name: 'Salvar',exact: true}).click();

    await page.waitForTimeout(6000);


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