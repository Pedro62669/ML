/* Ranking parcial mostrado na tela de resultado: junta os participantes
   de exemplo com as rodadas jogadas neste navegador. A disputa é por
   acertos, que é também o número de giros conquistados. */

const PARTICIPANTES_EXEMPLO = [
  { nome: 'Camila R.', acertos: 10 },
  { nome: 'Diego M.', acertos: 10 },
  { nome: 'Aline S.', acertos: 10 },
  { nome: 'Rafael T.', acertos: 9 },
  { nome: 'Juliana P.', acertos: 9 },
  { nome: 'Marcos V.', acertos: 9 },
  { nome: 'Beatriz L.', acertos: 8 },
  { nome: 'Thiago A.', acertos: 8 },
  { nome: 'Fernanda C.', acertos: 8 },
  { nome: 'Lucas B.', acertos: 7 }
];

const LIMITE_LINHAS = 10;

/* Mantém apenas a melhor rodada de cada participante local. */
function melhoresRodadasLocais() {
  const melhores = new Map();

  lerRodadas().forEach(rodada => {
    const atual = melhores.get(rodada.nome);
    if (!atual || rodada.acertos > atual.acertos) {
      melhores.set(rodada.nome, {
        nome: rodada.nome,
        acertos: rodada.acertos,
        meu: true
      });
    }
  });

  return Array.from(melhores.values());
}

function celula(conteudo) {
  const td = document.createElement('td');
  if (conteudo instanceof Node) {
    td.append(conteudo);
  } else {
    td.textContent = conteudo;
  }
  return td;
}

/* Monta a tabela e garante que a linha de quem acabou de jogar apareça,
   mesmo que o resultado fique fora das primeiras posições. */
function renderizarRanking() {
  const corpo = document.getElementById('corpo-ranking');
  if (!corpo) return;

  const lista = melhoresRodadasLocais()
    .concat(PARTICIPANTES_EXEMPLO)
    .sort((a, b) => b.acertos - a.acertos);

  const visiveis = lista.slice(0, LIMITE_LINHAS);
  const minhaPosicao = lista.findIndex(item => item.meu);
  if (minhaPosicao >= LIMITE_LINHAS) {
    visiveis.push(lista[minhaPosicao]);
  }

  corpo.textContent = '';

  visiveis.forEach(participante => {
    const posicao = lista.indexOf(participante) + 1;
    const linha = document.createElement('tr');
    if (participante.meu) linha.className = 'eu';

    const selo = document.createElement('span');
    selo.className = 'posicao' + (posicao <= 3 ? ' posicao--' + posicao : '');
    selo.textContent = posicao;

    linha.append(
      celula(selo),
      celula(participante.nome + (participante.meu ? ' (você)' : '')),
      celula(participante.acertos + '/10'),
      celula(participante.acertos === 1 ? '1 giro' : participante.acertos + ' giros')
    );
    corpo.append(linha);
  });
}
