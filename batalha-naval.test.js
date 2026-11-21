'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  TAMANHO_TABULEIRO,
  FROTA,
  criarJogo,
  posicionarNavio,
  todosNaviosPosicionados,
  atacar,
  verificarVitoria,
} = require('./batalha-naval');

function criarJogoPronto() {
  const jogo = criarJogo();
  posicionarNavio(jogo, 'porta_avioes', 0, 0, 'H');
  posicionarNavio(jogo, 'encouracado', 2, 0, 'H');
  posicionarNavio(jogo, 'submarino', 4, 0, 'H');
  posicionarNavio(jogo, 'destroier', 6, 0, 'H');
  return jogo;
}

function atacarPosicoes(jogo, posicoes) {
  return posicoes.map(([linha, coluna]) => atacar(jogo, linha, coluna));
}

test.describe('Criação do tabuleiro 10 x 10', () => {
  test('CT01: tamanho padrão do tabuleiro é 10', () => {
    assert.equal(TAMANHO_TABULEIRO, 10);
  });

  test('CT02: cria exatamente 10 linhas e 10 colunas', () => {
    const jogo = criarJogo();
    assert.equal(jogo.tabuleiro.length, 10);
    assert.ok(jogo.tabuleiro.every((linha) => linha.length === 10));
  });

  test('CT03: tabuleiro possui 100 células', () => {
    const jogo = criarJogo();
    assert.equal(jogo.tabuleiro.flat().length, 100);
  });

  test('CT04: todas as células começam vazias e não atingidas', () => {
    const jogo = criarJogo();
    assert.ok(jogo.tabuleiro.flat().every((celula) =>
      celula.navio === null && celula.atingida === false
    ));
  });

  test('CT05: jogo começa no estado posicionando', () => {
    const jogo = criarJogo();
    assert.equal(jogo.status, 'posicionando');
    assert.equal(jogo.totalAtaques, 0);
    assert.equal(jogo.acertos, 0);
    assert.equal(jogo.aguas, 0);
  });

  test('CT06: frota possui os quatro navios e tamanhos exigidos', () => {
    assert.deepEqual(FROTA, {
      porta_avioes: 5,
      encouracado: 4,
      submarino: 3,
      destroier: 2,
    });
  });
});

test.describe('Posicionamento dos navios', () => {
  test('CT07: posiciona porta-aviões ocupando 5 casas', () => {
    const jogo = criarJogo();
    const navio = posicionarNavio(jogo, 'porta_avioes', 0, 0, 'H');
    assert.equal(navio.tamanho, 5);
    assert.equal(navio.posicoes.length, 5);
    assert.deepEqual(jogo.tabuleiro[0].slice(0, 5).map((c) => c.navio),
      Array(5).fill('porta_avioes'));
  });

  test('CT08: posiciona encouraçado ocupando 4 casas', () => {
    const jogo = criarJogo();
    const navio = posicionarNavio(jogo, 'encouracado', 0, 0, 'H');
    assert.equal(navio.tamanho, 4);
    assert.equal(navio.posicoes.length, 4);
  });

  test('CT09: posiciona submarino ocupando 3 casas', () => {
    const jogo = criarJogo();
    const navio = posicionarNavio(jogo, 'submarino', 0, 0, 'H');
    assert.equal(navio.tamanho, 3);
    assert.equal(navio.posicoes.length, 3);
  });

  test('CT10: posiciona destroier ocupando 2 casas', () => {
    const jogo = criarJogo();
    const navio = posicionarNavio(jogo, 'destroier', 0, 0, 'H');
    assert.equal(navio.tamanho, 2);
    assert.equal(navio.posicoes.length, 2);
  });

  test('CT11: aceita hidroavião como nome alternativo do destroier', () => {
    const jogo = criarJogo();
    const navio = posicionarNavio(jogo, 'Hidroavião', 0, 0, 'H');
    assert.equal(navio.tipo, 'destroier');
    assert.equal(navio.tamanho, 2);
  });

  test('CT12: posiciona navio na horizontal', () => {
    const jogo = criarJogo();
    const navio = posicionarNavio(jogo, 'submarino', 3, 2, 'horizontal');
    assert.deepEqual(navio.posicoes, [
      { linha: 3, coluna: 2 },
      { linha: 3, coluna: 3 },
      { linha: 3, coluna: 4 },
    ]);
  });

  test('CT13: posiciona navio na vertical', () => {
    const jogo = criarJogo();
    const navio = posicionarNavio(jogo, 'submarino', 2, 3, 'V');
    assert.deepEqual(navio.posicoes, [
      { linha: 2, coluna: 3 },
      { linha: 3, coluna: 3 },
      { linha: 4, coluna: 3 },
    ]);
  });

  test('CT14: aceita navio encostado em outro sem sobreposição', () => {
    const jogo = criarJogo();
    posicionarNavio(jogo, 'destroier', 0, 0, 'H');
    assert.doesNotThrow(() => posicionarNavio(jogo, 'submarino', 1, 0, 'H'));
  });

  test('CT15: permite posicionar navio na última coluna quando couber', () => {
    const jogo = criarJogo();
    const navio = posicionarNavio(jogo, 'destroier', 0, 8, 'H');
    assert.deepEqual(navio.posicoes, [
      { linha: 0, coluna: 8 },
      { linha: 0, coluna: 9 },
    ]);
  });

  test('CT16: permite posicionar navio na última linha quando couber', () => {
    const jogo = criarJogo();
    const navio = posicionarNavio(jogo, 'submarino', 7, 0, 'V');
    assert.deepEqual(navio.posicoes, [
      { linha: 7, coluna: 0 },
      { linha: 8, coluna: 0 },
      { linha: 9, coluna: 0 },
    ]);
  });

  test('CT17: rejeita tipo de navio desconhecido', () => {
    const jogo = criarJogo();
    assert.throws(() => posicionarNavio(jogo, 'cruzador', 0, 0), /Tipo de navio inválido/);
  });

  test('CT18: rejeita tipo de navio que não seja texto', () => {
    const jogo = criarJogo();
    assert.throws(() => posicionarNavio(jogo, 123, 0, 0), TypeError);
  });

  test('CT19: rejeita posicionamento duplicado do mesmo navio', () => {
    const jogo = criarJogo();
    posicionarNavio(jogo, 'submarino', 0, 0);
    assert.throws(() => posicionarNavio(jogo, 'submarino', 2, 0), /já foi posicionado/);
  });

  test('CT20: não permite posicionar destroier e hidroavião na mesma frota', () => {
    const jogo = criarJogo();
    posicionarNavio(jogo, 'destroier', 0, 0);
    assert.throws(() => posicionarNavio(jogo, 'hidroavião', 2, 0), /já foi posicionado/);
  });

  test('CT21: rejeita sobreposição de navios', () => {
    const jogo = criarJogo();
    posicionarNavio(jogo, 'destroier', 0, 0, 'H');
    assert.throws(() => posicionarNavio(jogo, 'submarino', 0, 1, 'H'), /sobrepostos/);
  });

  test('CT22: rejeita navio que ultrapassa a borda direita', () => {
    const jogo = criarJogo();
    assert.throws(() => posicionarNavio(jogo, 'porta_avioes', 0, 6, 'H'), /ultrapassa/);
  });

  test('CT23: rejeita navio que ultrapassa a borda inferior', () => {
    const jogo = criarJogo();
    assert.throws(() => posicionarNavio(jogo, 'encouracado', 7, 0, 'V'), /ultrapassa/);
  });

  test('CT24: rejeita orientação diferente de horizontal ou vertical', () => {
    const jogo = criarJogo();
    assert.throws(() => posicionarNavio(jogo, 'submarino', 0, 0, 'diagonal'), /Orientação inválida/);
  });

  test('CT25: rejeita coordenadas fracionadas no posicionamento', () => {
    const jogo = criarJogo();
    assert.throws(() => posicionarNavio(jogo, 'submarino', 1.5, 0), TypeError);
  });

  test('CT26: rejeita coordenadas negativas no posicionamento', () => {
    const jogo = criarJogo();
    assert.throws(() => posicionarNavio(jogo, 'submarino', -1, 0), RangeError);
  });

  test('CT27: rejeita coordenadas fora do tabuleiro no posicionamento', () => {
    const jogo = criarJogo();
    assert.throws(() => posicionarNavio(jogo, 'submarino', 0, 10), RangeError);
  });

  test('CT28: começa a partida após posicionar os quatro navios', () => {
    const jogo = criarJogoPronto();
    assert.equal(todosNaviosPosicionados(jogo), true);
    assert.equal(jogo.status, 'jogando');
  });

  test('CT29: não inicia a partida com a frota incompleta', () => {
    const jogo = criarJogo();
    posicionarNavio(jogo, 'porta_avioes', 0, 0);
    posicionarNavio(jogo, 'encouracado', 2, 0);
    posicionarNavio(jogo, 'submarino', 4, 0);
    assert.equal(todosNaviosPosicionados(jogo), false);
    assert.equal(jogo.status, 'posicionando');
  });

  test('CT30: não permite posicionar navios depois de completar a frota', () => {
    const jogo = criarJogoPronto();
    assert.throws(() => posicionarNavio(jogo, 'porta_avioes', 8, 0), /após o início/);
  });
});

test.describe('Ataques e resultados', () => {
  test('CT31: não permite atacar antes de posicionar todos os navios', () => {
    const jogo = criarJogo();
    assert.throws(() => atacar(jogo, 0, 0), /Posicione todos os navios/);
  });

  test('CT32: ataque em célula vazia resulta em água', () => {
    const jogo = criarJogoPronto();
    const resultado = atacar(jogo, 9, 9);
    assert.equal(resultado.resultado, 'agua');
    assert.equal(resultado.navio, null);
    assert.equal(jogo.aguas, 1);
    assert.equal(jogo.totalAtaques, 1);
  });

  test('CT33: ataque em navio resulta em acerto', () => {
    const jogo = criarJogoPronto();
    const resultado = atacar(jogo, 0, 0);
    assert.equal(resultado.resultado, 'acerto');
    assert.equal(resultado.navio, 'porta_avioes');
    assert.equal(jogo.acertos, 1);
  });

  test('CT34: ataque marca a célula como atingida', () => {
    const jogo = criarJogoPronto();
    atacar(jogo, 9, 9);
    assert.equal(jogo.tabuleiro[9][9].atingida, true);
  });

  test('CT35: rejeita ataque repetido na mesma posição', () => {
    const jogo = criarJogoPronto();
    atacar(jogo, 9, 9);
    assert.throws(() => atacar(jogo, 9, 9), /já foi atacada/);
    assert.equal(jogo.totalAtaques, 1);
  });

  test('CT36: rejeita ataque com linha ou coluna fracionada', () => {
    const jogo = criarJogoPronto();
    assert.throws(() => atacar(jogo, 1.5, 0), TypeError);
  });

  test('CT37: rejeita ataque com coordenadas negativas', () => {
    const jogo = criarJogoPronto();
    assert.throws(() => atacar(jogo, -1, 0), RangeError);
  });

  test('CT38: rejeita ataque fora do tabuleiro', () => {
    const jogo = criarJogoPronto();
    assert.throws(() => atacar(jogo, 10, 0), RangeError);
  });

  test('CT39: navio não é destruído antes de receber todos os acertos', () => {
    const jogo = criarJogoPronto();
    atacar(jogo, 0, 0);
    const navio = jogo.navios.find((item) => item.tipo === 'porta_avioes');
    assert.equal(navio.atingidas, 1);
    assert.equal(navio.destruido, false);
  });

  test('CT40: identifica navio destruído após atingir todas as casas', () => {
    const jogo = criarJogoPronto();
    const resultados = atacarPosicoes(jogo, [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]);
    assert.equal(resultados.at(-1).navioDestruido, true);
    assert.equal(jogo.navios.find((item) => item.tipo === 'porta_avioes').destruido, true);
  });

  test('CT41: água não conta como acerto', () => {
    const jogo = criarJogoPronto();
    atacar(jogo, 9, 9);
    assert.equal(jogo.acertos, 0);
    assert.equal(jogo.aguas, 1);
  });

  test('CT42: acertos e águas são contabilizados separadamente', () => {
    const jogo = criarJogoPronto();
    atacar(jogo, 0, 0);
    atacar(jogo, 9, 9);
    assert.equal(jogo.totalAtaques, 2);
    assert.equal(jogo.acertos, 1);
    assert.equal(jogo.aguas, 1);
  });

  test('CT43: vitória ocorre somente após destruir todos os navios', () => {
    const jogo = criarJogoPronto();
    atacarPosicoes(jogo, [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
      [2, 0], [2, 1], [2, 2], [2, 3],
      [4, 0], [4, 1], [4, 2],
      [6, 0], [6, 1],
    ]);
    assert.equal(verificarVitoria(jogo), true);
    assert.equal(jogo.status, 'vitoria');
  });

  test('CT44: partida não é vitória enquanto existir navio não destruído', () => {
    const jogo = criarJogoPronto();
    atacarPosicoes(jogo, [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]);
    assert.equal(verificarVitoria(jogo), false);
    assert.equal(jogo.status, 'jogando');
  });

  test('CT45: resultado do último ataque informa a vitória', () => {
    const jogo = criarJogoPronto();
    atacarPosicoes(jogo, [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
      [2, 0], [2, 1], [2, 2], [2, 3],
      [4, 0], [4, 1], [4, 2],
    ]);
    const ultimo = atacar(jogo, 6, 0);
    assert.equal(ultimo.vitoria, false);
    const final = atacar(jogo, 6, 1);
    assert.equal(final.vitoria, true);
    assert.equal(final.navioDestruido, true);
  });

  test('CT46: não permite ataques depois da vitória', () => {
    const jogo = criarJogoPronto();
    atacarPosicoes(jogo, [
      [0, 0], [0, 1], [0, 2], [0, 3], [0, 4],
      [2, 0], [2, 1], [2, 2], [2, 3],
      [4, 0], [4, 1], [4, 2],
      [6, 0], [6, 1],
    ]);
    assert.throws(() => atacar(jogo, 9, 9), /partida já foi encerrada/);
  });
});

test.describe('Validação do estado do jogo', () => {
  test('CT47: funções rejeitam objeto de jogo inválido', () => {
    assert.throws(() => posicionarNavio({}, 'submarino', 0, 0), /Jogo inválido/);
    assert.throws(() => atacar({}, 0, 0), /Jogo inválido/);
    assert.throws(() => verificarVitoria({}), /Jogo inválido/);
  });

  test('CT48: verificarVitoria retorna falso durante o posicionamento', () => {
    const jogo = criarJogo();
    assert.equal(verificarVitoria(jogo), false);
  });
});
