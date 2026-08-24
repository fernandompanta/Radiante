//Emitir_relatorio_ATV_WF_parcial.js

//Script atualizando em 24/08/2026 17:03. Este arquivo contem o script do robô que tem a função de emitir o relatório do parcial das medições da Ativação do mês atual no WF da Claro.
//Este robô é apenas para facilitar um processo leve e não terá controle de versão


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
    await page.goto('https://secure.embratel.com.br/wfep/NovoLogin.aspx');
    await page.getByRole('textbox', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Login' }).fill('z495506');
    await page.getByRole('textbox', { name: 'Senha' }).click();
    await page.getByRole('textbox', { name: 'Senha' }).fill('Y9a.(Pd@#');
    console.log(' ');
    console.log('Inicializando WF para emição de relatório...');


    // ============================================================
    // AGUARDA PARA DIGITAR O CAPTCHA
    // ============================================================
    console.log(' ');
    console.log('Validando capctha do site...');
    await page.waitForNavigation();
    await page.waitForTimeout(1000);


    // ============================================================
    // ENTRANDO NA TELA DE CONSULTA
    // ============================================================
    await page.getByRole('link', { name: 'Consulta', exact: true }).click();
    console.log(' ');
    console.log('Entrando na tela de Consulta');
    await page.waitForTimeout(500);
    await page.getByLabel('Categoria do Item:').selectOption('3');
    await page.waitForTimeout(2000);
    //await page.goto('https://secure.embratel.com.br/wfep/relatorios/consulta/default.aspx');
    await page.waitForTimeout(1000);
    await page.locator('td:nth-child(4) > a:nth-child(2)').click();
    await page.waitForTimeout(1000);


    // ============================================================
    // SELECIONANDO ITENS QUE SERÃO EMITIDOS NO RELATÓRIO
    // ============================================================
    await page.getByRole('checkbox', { name: 'Atividade' }).check();
    console.log(' ');
    console.log('Selecionando Atividade');
    await page.waitForTimeout(500);

    await page.getByRole('checkbox', { name: 'Cidade', exact: true }).check();
    console.log('Selecionando Cidade');
    await page.waitForTimeout(500);

    await page.getByRole('checkbox', { name: 'CM' }).check();
    console.log('Selecionando CM');
    await page.waitForTimeout(500);

    await page.getByRole('checkbox', { name: 'Data do Agendamento' }).check();
    console.log('Selecionando Data do Agendamento');
    await page.waitForTimeout(500);

    await page.getByRole('checkbox', { name: 'Responsável', exact: true }).uncheck();
    console.log('Desmarcando Responsável');
    await page.waitForTimeout(500);

    await page.getByRole('checkbox', { name: 'Técnico' }).check();
    console.log('Selecionando Técnico');
    await page.waitForTimeout(500);

    await page.getByRole('checkbox', { name: 'Total da Medição' }).check();
    console.log('Selecionando Total da Medição');
    await page.waitForTimeout(500);

    await page.getByRole('button', { name: 'Fechar' }).click();
    console.log(' ');
    console.log('Seleções executadas com sucesso!');
    await page.waitForTimeout(500);

    await page.locator('#MainContent_ddlCampoPesquisa_0').selectOption('437_Data_Data Aprovação da Medição');
    console.log(' ');
    console.log('Alocando filtro para Data Aprovação da Medição');
    await page.waitForTimeout(2000);

    await page.locator('#MainContent_ddlCriterioPesquisa_0').selectOption('BETWEEN');


    // ============================================================
    // SELECIONANDO A DATA INCIAL E FINAL DO MÊS ANTERIOR
    // ============================================================
    // 1. Selcionando o primeiro dia do mês anterior
    await page.getByRole('textbox', { name: 'De:' }).click();
    await page.waitForTimeout(1000);
    //await page.getByTitle('Anterior').click();
    //await page.waitForTimeout(500);
    await page.getByRole('link', { name: '1', exact: true }).click();
    await page.waitForTimeout(1000);
 

    // Calculando o último dia do mês atual
        const hoje = new Date();
            const ultimoDiaObj = new Date(hoje.getFullYear(), hoje.getMonth() +1, 0);
        const ultimoDia = ultimoDiaObj.getDate().toString(); // Retorna "31", "30", "28" ou "29"

    // Selecionando o ultimo dia do mês atual de forma dinâmica
    await page.getByRole('textbox', { name: 'Até:' }).click();
    await page.waitForTimeout(1000);
    //await page.getByTitle('Anterior').click();
    //await page.waitForTimeout(500);
    await page.getByRole('link', { name: ultimoDia, exact: true }).click();
    await page.waitForTimeout(1000);


    // Clicando em Pesquisar para iniciar a emissão do relatório
    await page.getByRole('link', { name: ' Pesquisar' }).click();
    console.log(' ');
    console.log('Emitindo relatório, por favor aguarde, isso pode demorar...');
    await page.waitForTimeout(30000);


    // Aguarda o elemento ficar visível no DOM e na tela
    //const botaoExportar = page.getByRole('button', { name: 'Exportar resultado para Excel' });
    
    //await botaoExportar.waitFor({ state: 'visible' });

    
    // Aviso de Relatório emitido com sucesso!!

    //await page.waitForTimeout(1000);
    //console.log(' ');
    //console.log('Relatório emitido com sucesso!!');

    
    //await page.waitForNavigation();
    //await page.getByRole('button', { name: 'E n t r a r' }).click();


    // Mantém o programa aberto até você pressionar Ctrl + C no terminal
    //await new Promise(() => {});

    //Comando para abrir o Codegen
    //npx playwright codegen https://secure.embratel.com.br/wfep/NovoLogin.aspx
    

    }

main();