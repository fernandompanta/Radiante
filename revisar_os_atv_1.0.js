//Revisa O.S Ativação versão 1.0

//Este programa tem a funcionalidade principal de revisar O.S verificando o valor e acrescentando as atividades de acorodo com o valor total da medição
//Este programa verifica também se existe fotos não validadas pela I.A. do próprio Esmeralda.

const { chromium } = require('playwright');
const XLSX = require('xlsx');

// ============================================================
// FUNÇÃO PARA LER A PLANILHA DO EXCEL
// ============================================================
function lerPlanilha(caminhoArquivo) {
  const workbook = XLSX.readFile(caminhoArquivo);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
}

// ============================================================
// Mapa de regras: Valor Total -> Atividades, Códigos e Valores Unitários
// ============================================================
function obterAtividadesPorValor(valorTotal) {
  const valor = parseFloat(valorTotal.toFixed(2));

  const REGRAS = {
    0.00: [
      { atividade: 'IMPROD', codigo: '697383', valor: 0.00 }
    ],
    230.53: [
      { atividade: 'VISINST', codigo: '476348', valor: 230.53 }
    ],
    484.39: [
      { atividade: 'VISINST', codigo: '476348', valor: 230.53 },
      { atividade: 'DESL51', codigo: '476357', valor: 253.86 }
    ],
    794.12: [
      { atividade: 'VISINST', codigo: '476348', valor: 230.53 },
      { atividade: 'DESL151', codigo: '476358', valor: 563.59 }
    ],
    881.29: [
      { atividade: 'VISINST', codigo: '476348', valor: 230.53 },
      { atividade: 'DESL301', codigo: '476359', valor: 650.76 }
    ],
    1336.82: [
      { atividade: 'VISINST', codigo: '476348', valor: 230.53 },
      { atividade: 'DESL500', codigo: '476360', valor: 1106.29 }
    ],
    355.22: [
      { atividade: 'PREAT', codigo: '476338', valor: 355.22 }
    ],
    609.08: [
      { atividade: 'PREAT', codigo: '476338', valor: 355.22 },
      { atividade: 'DESL51', codigo: '476357', valor: 253.86 }
    ],
    918.81: [
      { atividade: 'PREAT', codigo: '476338', valor: 355.22 },
      { atividade: 'DESL151', codigo: '476358', valor: 563.59 }
    ],
    1005.98: [
      { atividade: 'PREAT', codigo: '476338', valor: 355.22 },
      { atividade: 'DESL301', codigo: '476359', valor: 650.76 }
    ],
    1461.51: [
      { atividade: 'PREAT', codigo: '476338', valor: 355.22 },
      { atividade: 'DESL500', codigo: '476360', valor: 1106.29 }
    ],
    759.03: [
      { atividade: 'ATV', codigo: '624365', valor: 759.03 }
    ],
    1012.89: [
      { atividade: 'ATV', codigo: '624365', valor: 759.03 },
      { atividade: 'DESL51', codigo: '476357', valor: 253.86 }
    ],
    1322.62: [
      { atividade: 'ATV', codigo: '624365', valor: 759.03 },
      { atividade: 'DESL151', codigo: '476358', valor: 563.59 }
    ],
    1409.79: [
      { atividade: 'ATV', codigo: '624365', valor: 759.03 },
      { atividade: 'DESL301', codigo: '476359', valor: 650.76 }
    ],
    1865.32: [
      { atividade: 'ATV', codigo: '624365', valor: 759.03 },
      { atividade: 'DESL500', codigo: '476360', valor: 1106.29 }
    ]
  };

  return REGRAS[valor] || null;
    }

async function main() {

    const browser = await chromium.launch({
        headless: false,
        args: ['--force-device-scale-factor=0.90']
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
    await page.getByRole('treeitem', { name: 'Ativação' }).click();
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



    // ================================================================================
    // INICIO DA EXECUÇÃO DA REVISÃO DAS O.S
    // ================================================================================



    // ============================================================
    // LEITURA DA PLANILHA EXCEL
    // ============================================================
    const dadosPlanilha = lerPlanilha('./faturamento_mensal.xlsx');

    // ============================================================
    // REVISÃO DAS O.S DE ATIVAÇÃO, ADIÇÃO DE CHAMADO DE ACORDO COM VALOR E CONFERENCIA DAS FOTOS
    // ============================================================
    console.log(' ');
    console.log('Aguardando os chamados carregarem na grid...');
    const celulasChamados = page.getByRole('gridcell').filter({ hasText: /^\d{7}$/ });
    await celulasChamados.first().waitFor({ state: 'visible', timeout: 15000 });

    const totalChamadosTela = await celulasChamados.count();
    console.log(`\n==================================================`);
    console.log(`Iniciando processamento TOTAL de ${totalChamadosTela} chamados encontrados na tela.`);
    console.log(`==================================================\n`);

    let chamadosProcessados = 0;
    let chamadosNaoEncontrados = 0;

    // ============================================================
    // LOOP PRINCIPAL
    // ============================================================

    for (let i = 0; i < totalChamadosTela; i++) { // ---------------------------------------------------------------Inicio do FOR

          try {
              // Atualiza o mapeamento dos elementos a cada iteração
              const celulasAtuais = page.getByRole('gridcell').filter({ hasText: /^\d{7}$/ });
              const celula = celulasAtuais.nth(i);
      
              // Garante que o elemento está visível na tela antes de ler
              await celula.scrollIntoViewIfNeeded();
              const numeroBilhete = (await celula.innerText()).trim();

              console.log(' ');
              console.log(`--------------------------------------------------`);
              console.log(`[${i + 1}/${totalChamadosTela}] Processando Chamado: ${numeroBilhete}`);

              // Busca na planilha
              const itemEncontrado = dadosPlanilha.find(
              (row) => String(row.Item).trim() === numeroBilhete
              );

                      if (itemEncontrado) {
                            const valorMedicao = parseFloat(itemEncontrado['Total da Medição']) || 0;
                            const atividades = obterAtividadesPorValor(valorMedicao);

                            console.log(`   ├─ Encontrado no Excel | Total Medição: R$ ${valorMedicao.toFixed(2)}`);

                                      if (atividades) {
                                      // 1. Abrir modal de edição
                                      const botoesRevisar = page.getByText('Revisar');
                                      await botoesRevisar.nth(i + 2).click();
                                      await page.waitForTimeout(7000);

                                      // 2. Limpar atividades anteriores

                                      await page.locator('.remove-all-activity').first().click();
                                      console.log('Excluido atividade, se houver..');
                                      await page.waitForTimeout(2000);


                                      //const btnRemoveAll = page.locator('.remove-all-activity').first();
                                      
                                                  //if (await btnRemoveAll.isVisible()) {
                                                  //          await btnRemoveAll.click();
                                                  //          await page.waitForTimeout(500);
                                                  //}

                                                  //const btnRemoveSingle = page.locator('.remove > .fa').first();
          //if (await btnRemoveSingle.isVisible()) {
            //await btnRemoveSingle.click();
            //await page.waitForTimeout(500);
          //}


                                                  // 3. Preencher novas atividades
                                                  for (const itemAtividade of atividades) {
                                                            await page.getByText('Editar Atividades: Selecione').click();
                                                            await page.waitForTimeout(500);

                                                            await page.locator('.select2-search.select2-search--dropdown > .select2-search__field').fill(itemAtividade.atividade);
                                                            await page.waitForTimeout(1500);

                                                            await page.getByText(`Código: ${itemAtividade.codigo}`).press('Enter');
                                                            await page.waitForTimeout(1000);
                                                            console.log(`   ├─ Atividade inserida: ${itemAtividade.atividade} (${itemAtividade.codigo})`);
                                                  }

                                      // 4. Inspecionar e aprovar fotos vermelhas (se existirem)
                                      const fotos = page.locator(
                                            '.photo-item.ai-validation-approved, ' +
                                            '.photo-item.ai-validation-not-approved, ' +
                                            '.photo-item.ai-validation-manual-approved'
                                      );

                                      await page.waitForTimeout(1000);
                                      const countVermelhas = await page.locator('.photo-item.ai-validation-not-approved').count();

                                                  if (countVermelhas > 0) {
                                                            console.log(`   ├─ ⚠️ Encontrada(s) ${countVermelhas} foto(s) vermelha(s). Aprovando manualmente...`);

                                                                      for (let v = 0; v < countVermelhas; v++) {
                                                                              await page.locator('.photo-item.ai-validation-not-approved').first().click();
                                                                              await page.waitForTimeout(1000);

                                                                              await page.getByRole('button', { name: ' Aprovar manualmente' }).click();
                                                                              await page.waitForTimeout(1000);

                                                                              await page.locator('.modal-body > div > .form-control').click();
                                                                              await page.locator('.modal-body > div > .form-control').fill('Aprovado OK');
                                                                              await page.waitForTimeout(500);

                                                                              await page.getByRole('button', { name: ' Aprovar', exact: true }).click();
                                                                              await page.waitForTimeout(1000);

                                                                              await page.getByRole('button', { name: 'Fechar' }).click();
                                                                              await page.waitForTimeout(1000);
                                                                      }

                                                              console.log('   ├─ ✅ Fotos vermelhas aprovadas!');
                                                  }

                                      // 5. Salvar e fechar
                                      await page.getByRole('button', { name: 'Salvar', exact: true }).click();
                                      await page.waitForTimeout(1000);

                                      await page.getByRole('button', { name: 'Fechar' }).click();
                                      await page.waitForTimeout(1500);

                                      chamadosProcessados++;
                                      console.log(`   └─ ✅ Chamado ${numeroBilhete} finalizado com sucesso!`);
                                      
                                      
                                      } else {

                                      console.log(`   └─ ⚠️ Sem regras cadastradas para R$ ${valorMedicao.toFixed(2)}. Pulando.`);

                                      }


                      } else {

                      chamadosNaoEncontrados++;
                      console.log(`   └─  Chamado ${numeroBilhete} não consta na planilha. Pulando.`);
                      }

          } catch (erro) {
          
          console.log(`   └─ ❌ Erro ao processar o chamado do índice ${i + 1}: ${erro.message}`);
      
          // Tenta fechar qualquer modal aberta para não travar a próxima iteração
          const btnFecharModal = page.getByRole('button', { name: 'Fechar' });
                
                      if (await btnFecharModal.isVisible()) {
                              await btnFecharModal.click();
                              await page.waitForTimeout(1000);
                      }
          }
  

    } // -----------------------------------------------------------------------------------Fim do FOR

    
    console.log(' ');
    console.log(' ');
    console.log('--------- RESUMO DA EXECUÇÃO ---------');
    console.log(`• Total de chamados analisados: ${totalChamadosTela}`);
    console.log(`• Chamados editados e salvos: ${chamadosProcessados}`);
    console.log(`• Chamados não encontrados no Excel: ${chamadosNaoEncontrados}`);
    console.log(' ');
    console.log(' ');
    console.log('================================================');
    console.log('             REVISÃO FINALIZADA');
    console.log('================================================');



    // Não fecha o navegador ainda
    await browser.close();


    }

    //Comando para abrir o Codegen
    //npx playwright codegen https://radiante.esmeralda.net.br/gestao/ordem-servico/revisar-os


main();


//await page.getByText('Revisar').nth(2).click(); (botão REVISAR)

//await page.getByRole('button', {name: 'Salvar e Avançar Fase'}).click();

