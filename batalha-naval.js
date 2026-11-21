'use strict';

const TAMANHO_TABULEIRO = 10;

const FROTA = Object.freeze({
  porta_avioes: 5,
  encouracado: 4,
  submarino: 3,
  destroier: 2,
});


function normalizarTexto(valor) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function normalizarTipo(tipo) {
  if (typeof tipo !== 'string') {
    throw new TypeError('Tipo de navio deve ser um texto');
  }

  const nome = normalizarTexto(tipo);
  const aliases = {
    'porta_avioes': 'porta_avioes',
    'porta_aviao': 'porta_avioes',
    'encouracado': 'encouracado',
    'submarino': 'submarino',
    'destroier': 'destroier',
    'destroyer': 'destroier',
    'hidroaviao': 'destroier',
  };

  const tipoNormalizado = aliases[nome];
  if (!tipoNormalizado) {
    throw new RangeError('Tipo de navio inválido');
  }

  return tipoNormalizado;
}

function validarCoordenada(linha, coluna) {
  if (!Number.isInteger(linha) || !Number.isInteger(coluna)) {
    throw new TypeError('Linha e coluna devem ser números inteiros');
  }

  if (
    linha < 0 || linha >= TAMANHO_TABULEIRO ||
    coluna < 0 || coluna >= TAMANHO_TABULEIRO
  ) {
    throw new RangeError('Posição fora do tabuleiro');
  }
}

function validarJogo(jogo) {
  if (
    !jogo ||
    !Array.isArray(jogo.tabuleiro) ||
    !Array.isArray(jogo.navios) ||
    typeof jogo.status !== 'string'
  ) {
    throw new TypeError('Jogo inválido');
  }
}

function criarJogo() {
  const tabuleiro = Array.from({ length: TAMANHO_TABULEIRO }, () =>
    Array.from({ length: TAMANHO_TABULEIRO }, () => ({
      navio: null,
      atingida: false,
    }))
  );

  return {
    tamanho: TAMANHO_TABULEIRO,
    tabuleiro,
    navios: [],
    status: 'posicionando',
    totalAtaques: 0,
    acertos: 0,
    aguas: 0,
  };
}

function normalizarOrientacao(orientacao) {
  if (typeof orientacao !== 'string') {
    throw new TypeError('Orientação deve ser um texto');
  }

  const valor = normalizarTexto(orientacao);
  if (valor === 'h' || valor === 'horizontal') return 'horizontal';
  if (valor === 'v' || valor === 'vertical') return 'vertical';

  throw new RangeError('Orientação inválida: use horizontal ou vertical');
}

function posicionarNavio(jogo, tipo, linha, coluna, orientacao = 'horizontal') {
  validarJogo(jogo);

  if (jogo.status !== 'posicionando') {
    throw new Error('Não é possível posicionar navios após o início da partida');
  }

  const tipoNormalizado = normalizarTipo(tipo);
  const tamanho = FROTA[tipoNormalizado];

  if (jogo.navios.some((navio) => navio.tipo === tipoNormalizado)) {
    throw new Error('Este navio já foi posicionado');
  }

  validarCoordenada(linha, coluna);
  const direcao = normalizarOrientacao(orientacao);
  const posicoes = [];

  for (let i = 0; i < tamanho; i++) {
    const l = linha + (direcao === 'vertical' ? i : 0);
    const c = coluna + (direcao === 'horizontal' ? i : 0);

    if (l >= TAMANHO_TABULEIRO || c >= TAMANHO_TABULEIRO) {
      throw new RangeError('Navio ultrapassa os limites do tabuleiro');
    }

    if (jogo.tabuleiro[l][c].navio !== null) {
      throw new Error('Não é permitido posicionar navios sobrepostos');
    }

    posicoes.push({ linha: l, coluna: c });
  }

  const navio = {
    tipo: tipoNormalizado,
    tamanho,
    orientacao: direcao,
    posicoes,
    atingidas: 0,
    destruido: false,
  };

  for (const posicao of posicoes) {
    jogo.tabuleiro[posicao.linha][posicao.coluna].navio = tipoNormalizado;
  }

  jogo.navios.push(navio);

  if (jogo.navios.length === Object.keys(FROTA).length) {
    jogo.status = 'jogando';
  }

  return navio;
}

function todosNaviosPosicionados(jogo) {
  validarJogo(jogo);
  return jogo.navios.length === Object.keys(FROTA).length;
}

function verificarVitoria(jogo) {
  validarJogo(jogo);
  return jogo.status === 'vitoria';
}

function atacar(jogo, linha, coluna) {
  validarJogo(jogo);
  validarCoordenada(linha, coluna);

  if (jogo.status === 'posicionando') {
    throw new Error('Posicione todos os navios antes de atacar');
  }

  if (jogo.status === 'vitoria') {
    throw new Error('A partida já foi encerrada');
  }

  const celula = jogo.tabuleiro[linha][coluna];
  if (celula.atingida) {
    throw new Error('Esta posição já foi atacada');
  }

  celula.atingida = true;
  jogo.totalAtaques++;

  if (celula.navio === null) {
    jogo.aguas++;
    return {
      resultado: 'agua',
      navio: null,
      navioDestruido: false,
      vitoria: false,
    };
  }

  jogo.acertos++;
  const navio = jogo.navios.find((item) => item.tipo === celula.navio);
  navio.atingidas++;

  if (navio.atingidas === navio.tamanho) {
    navio.destruido = true;
  }

  const venceu = jogo.navios.every((item) => item.destruido);
  if (venceu) jogo.status = 'vitoria';

  return {
    resultado: 'acerto',
    navio: navio.tipo,
    navioDestruido: navio.destruido,
    vitoria: venceu,
  };
}

module.exports = {
  TAMANHO_TABULEIRO,
  FROTA,
  criarJogo,
  posicionarNavio,
  todosNaviosPosicionados,
  atacar,
  verificarVitoria,
};
