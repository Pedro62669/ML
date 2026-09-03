/* Roleta de prêmios: cada giro gasta um dos giros conquistados no quiz
   (um por resposta certa) ou no compartilhamento.
   Os setores são desenhados a partir desta lista, então mudar o array
   muda a roda, as cores e o sorteio de uma vez só.
   Os pesos somam 100, ou seja, cada peso é a chance da fatia em %. */

const SETORES = [
  {
    rotulo: 'PlayStation 5', tipo: 'produto', peso: 1, valor: 3499,
    nome: 'Console PlayStation® 5 Slim Edição Digital 825 Gb Branco - Sony',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/playstation5.webp',
    mensagem: 'O prêmio máximo da promoção é seu!'
  },
  {
    rotulo: '10% OFF', tipo: 'cupom', peso: 11,
    nome: 'Cupom de 10% OFF',
    fundo: '#FFE600', texto: '#1A3B7C',
    mensagem: '10% de desconto na próxima compra, sem valor mínimo.'
  },
  {
    rotulo: 'Geladeira', tipo: 'produto', peso: 2, valor: 4599,
    nome: 'Geladeira Electrolux Frost Free com AutoSense 480L Efficient Duplex Branca',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/geladeira.webp',
    mensagem: 'Frost Free com AutoSense, 480 litros, duplex.'
  },
  {
    rotulo: 'Sem prêmio', tipo: 'nada', peso: 15,
    fundo: '#C4C4C4', texto: '#333333',
    mensagem: 'Esta fatia não vale prêmio. Use outro giro e tente de novo.'
  },
  {
    rotulo: 'Smart TV', tipo: 'produto', peso: 2, valor: 4299,
    nome: 'Samsung Smart TV 55" MiniLED 4K',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/televisao.webp',
    mensagem: 'Tela MiniLED 4K de 55 polegadas.'
  },
  {
    rotulo: 'Frete grátis', tipo: 'cupom', peso: 11,
    nome: 'Cupom de frete grátis',
    fundo: '#FFE600', texto: '#1A3B7C',
    mensagem: 'Frete grátis em uma compra no site, sem valor mínimo. Não vale para a entrega dos prêmios da roleta.'
  },
  {
    rotulo: 'Air Fryer', tipo: 'produto', peso: 4, valor: 549,
    nome: 'Fritadeira Air Fryer Forno Oven 12L Mondial',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/airfryer.webp',
    mensagem: 'Forno Oven de 12 litros, sem óleo.'
  },
  {
    rotulo: 'Perdeu giro', tipo: 'perde', peso: 15,
    fundo: '#F23D4F', texto: '#FFFFFF',
    mensagem: 'Além do giro que você acabou de usar, sai mais um giro.'
  },
  {
    rotulo: 'Liquidificador', tipo: 'produto', peso: 6, valor: 299,
    nome: 'Liquidificador Philco 1500W 3,1L 12 Velocidades com 6 Lâminas',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/liquidificador.webp',
    mensagem: '1500W, jarra de 3,1L, 12 velocidades e 6 lâminas.'
  },
  {
    rotulo: 'R$ 50', tipo: 'cupom', peso: 8,
    nome: 'R$ 50 em vale-compras',
    fundo: '#FFE600', texto: '#1A3B7C',
    mensagem: 'R$ 50 de crédito para usar no site.'
  },
  {
    rotulo: 'Bicicleta', tipo: 'produto', peso: 2, valor: 8999,
    nome: 'Bicicleta Elétrica Oggi Street Go S12 Tourney',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/bicicleta.webp',
    mensagem: 'Bicicleta elétrica com câmbio Shimano Tourney.'
  },
  {
    rotulo: 'R$ 100', tipo: 'cupom', peso: 6,
    nome: 'R$ 100 em vale-compras',
    fundo: '#FFE600', texto: '#1A3B7C',
    mensagem: 'R$ 100 de crédito para usar no site.'
  },
  {
    rotulo: 'Lava e Seca', tipo: 'produto', peso: 2, valor: 4799,
    nome: 'Máquina Lava e Seca Electrolux 12kg Inverter',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/maquina-de-lavar.webp',
    mensagem: 'Lava e seca de 12 kg com motor Inverter.'
  },
  {
    rotulo: 'Gire de novo', tipo: 'bonus', peso: 15,
    fundo: '#00A650', texto: '#FFFFFF',
    mensagem: 'Este giro saiu de graça: ele voltou para a sua conta.'
  }
];

const ANGULO = 360 / SETORES.length;

/* Prêmio físico é único por participante: quando sai na roleta, a fatia dele
   vira esta aqui, no mesmo lugar e com o mesmo peso. Assim ninguém leva cinco
   televisões, e a roda continua com o mesmo número de fatias. */
const FATIA_VAZIA = {
  rotulo: 'Sem prêmio', tipo: 'nada',
  fundo: '#C4C4C4', texto: '#333333',
  mensagem: 'Esta fatia não vale prêmio. Use outro giro e tente de novo.'
};

const roleta = {
  disco: document.getElementById('roleta-disco'),
  botao: document.getElementById('botao-girar'),
  giros: document.getElementById('roleta-giros'),
  aviso: document.getElementById('roleta-aviso'),
  resultado: document.getElementById('roleta-resultado'),
  premios: document.getElementById('lista-premios')
};

let setores = [];
let rotacaoAtual = 0;
let girando = false;

/* ------------------------------ Montagem --------------------------------- */

/* Troca pelos vazios os produtos que este participante já ganhou. */
function montarSetores() {
  const ganhos = lerPremios()
    .filter(premio => premio.tipo === 'produto')
    .map(premio => premio.rotulo);

  return SETORES.map(setor => {
    if (setor.tipo === 'produto' && ganhos.indexOf(setor.nome) !== -1) {
      return Object.assign({}, FATIA_VAZIA, { peso: setor.peso });
    }
    return setor;
  });
}

function atualizarSetores() {
  setores = montarSetores();
  desenharRoleta();
}

function desenharRoleta() {
  const fatias = setores.map((setor, i) =>
    setor.fundo + ' ' + (i * ANGULO) + 'deg ' + ((i + 1) * ANGULO) + 'deg'
  );
  roleta.disco.style.background = 'conic-gradient(' + fatias.join(', ') + ')';
  roleta.disco.textContent = '';

  setores.forEach((setor, i) => {
    const fatia = document.createElement('div');
    fatia.className = 'roleta__setor';
    /* O CSS usa este ângulo para levar o rótulo até o meio da fatia. */
    fatia.style.setProperty('--angulo', (i * ANGULO + ANGULO / 2) + 'deg');

    const rotulo = document.createElement('span');
    rotulo.textContent = setor.rotulo;
    rotulo.style.color = setor.texto;

    fatia.append(rotulo);
    roleta.disco.append(fatia);
  });
}

/* ------------------------------- Sorteio --------------------------------- */

/* ---------------------------- SEQUÊNCIA DE TESTE --------------------------
   Roteiro fixo pedido para os testes, NÃO REMOVER sem pedido explícito:
   - enquanto sobrar mais de um giro depois deste, só sai perda ou prêmio
     amarelo (os cupons);
   - o penúltimo giro sempre cai num prêmio azul (os produtos);
   - o último giro volta a ser sorteado pelos pesos normais.
   Basta pôr MODO_TESTE_SEQUENCIA em false para a roleta voltar ao sorteio
   por peso em todos os giros. */
const MODO_TESTE_SEQUENCIA = true;

const COR_DO_PREMIO_AZUL = '#2968C8';
const COR_DO_PREMIO_AMARELO = '#FFE600';

function ehPremioAzul(setor) {
  return setor.fundo === COR_DO_PREMIO_AZUL;
}

function ehPremioAmarelo(setor) {
  return setor.fundo === COR_DO_PREMIO_AMARELO;
}

/* "Sem prêmio" entra sempre; "Perdeu giro" custa mais um giro, então só entra
   enquanto sobrar folga para o penúltimo acontecer, senão a contagem pularia
   por cima do prêmio azul. */
function perdaPermitida(setor, girosRestantes) {
  if (setor.tipo === 'nada') return true;
  return setor.tipo === 'perde' && girosRestantes >= 3;
}

/* Posições que servem, na roda como ela está agora: produto já ganho virou
   fatia vazia e por isso deixa de ser candidato a prêmio azul. */
function posicoesQue(filtro) {
  const achadas = [];
  setores.forEach((setor, i) => { if (filtro(setor)) achadas.push(i); });
  return achadas;
}

/* Devolve a posição que o roteiro manda parar, ou null para sortear normal. */
function posicaoDoRoteiro(girosRestantes) {
  if (girosRestantes === 0) return null;

  const candidatas = girosRestantes === 1
    ? posicoesQue(ehPremioAzul)
    : posicoesQue(setor => ehPremioAmarelo(setor) || perdaPermitida(setor, girosRestantes));

  /* Sem candidata (todos os produtos já saíram, por exemplo) o giro segue
     pelo sorteio comum em vez de travar. */
  if (!candidatas.length) return null;
  return candidatas[Math.floor(Math.random() * candidatas.length)];
}

function sortearSetor() {
  const total = setores.reduce((soma, setor) => soma + setor.peso, 0);
  let ponto = Math.random() * total;

  for (let i = 0; i < setores.length; i++) {
    ponto -= setores[i].peso;
    if (ponto <= 0) return i;
  }
  return setores.length - 1;
}

/* ------------------------------- Estado ---------------------------------- */

function atualizarRoleta() {
  const giros = lerGiros();

  roleta.giros.textContent = giros;
  roleta.botao.disabled = girando || giros < 1;

  roleta.aviso.textContent = giros < 1
    ? 'Seus giros acabaram. Compartilhe o link da promoção para ganhar mais.'
    : 'Você tem ' + (giros === 1 ? '1 giro' : giros + ' giros') + ' para usar.';

  listarPremios();
}

/* Os dois grupos são entregues de formas diferentes, então aparecem
   separados: produto vai pelos Correios, cupom vai por e-mail. */
const GRUPOS_DE_PREMIOS = [
  { titulo: 'Prêmios físicos', tipo: 'produto', status: '', variacao: 'premios-ganhos__status--produto' },
  { titulo: 'Cupons e vales', tipo: 'cupom', status: 'E-mail em até 24h', variacao: '' }
];

function listarPremios() {
  const premios = lerPremios();
  roleta.premios.textContent = '';

  if (!premios.length) {
    const vazio = document.createElement('p');
    vazio.className = 'premios-ganhos__vazio';
    vazio.textContent = 'Você ainda não girou a roleta.';
    roleta.premios.append(vazio);
    return;
  }

  GRUPOS_DE_PREMIOS.forEach(grupo => {
    /* Do mais recente para o mais antigo, como já era antes. */
    const itens = premios.filter(premio => premio.tipo === grupo.tipo).reverse();
    if (!itens.length) return;

    const titulo = document.createElement('h4');
    titulo.className = 'premios-ganhos__grupo';
    titulo.textContent = grupo.titulo + ' (' + itens.length + ')';

    const lista = document.createElement('ul');

    itens.forEach(premio => {
      const item = document.createElement('li');

      const nome = document.createElement('strong');
      nome.textContent = premio.rotulo;

      item.append(nome);

      if (grupo.tipo === 'produto') {
        /* Produto é resgatado aqui mesmo no site. */
        if (premio.resgatado) {
          const status = document.createElement('span');
          status.className = 'premios-ganhos__status premios-ganhos__status--produto';
          status.textContent = premio.seguro ? 'Resgatado com seguro' : 'Resgatado';
          item.append(status);
        } else {
          const resgatar = document.createElement('button');
          resgatar.type = 'button';
          resgatar.className = 'botao botao--principal botao--pequeno';
          resgatar.textContent = 'Resgatar prêmio';
          resgatar.addEventListener('click', () => abrirResgate(premio));
          item.append(resgatar);
        }
      } else {
        const status = document.createElement('span');
        status.className = ('premios-ganhos__status ' + grupo.variacao).trim();
        status.textContent = grupo.status;
        item.append(status);
      }

      lista.append(item);
    });

    roleta.premios.append(titulo, lista);
  });
}

/* --------------------------------- Giro ---------------------------------- */

function girar() {
  if (girando) return;

  const giros = lerGiros();
  if (giros < 1) return;

  girando = true;
  salvarGiros(giros - 1);
  roleta.botao.disabled = true;
  roleta.resultado.hidden = true;
  atualizarRoleta();

  const girosRestantes = lerGiros();
  const doRoteiro = MODO_TESTE_SEQUENCIA ? posicaoDoRoteiro(girosRestantes) : null;
  const indice = doRoteiro === null ? sortearSetor() : doRoteiro;

  const centro = indice * ANGULO + ANGULO / 2;
  /* Uma folga aleatória dentro da fatia deixa a parada menos mecânica. */
  const folga = (Math.random() - 0.5) * (ANGULO * 0.6);
  const alvo = (360 - centro - folga + 360) % 360;

  rotacaoAtual += (360 - (rotacaoAtual % 360)) + 360 * 5 + alvo;
  roleta.disco.style.transform = 'rotate(' + rotacaoAtual + 'deg)';

  /* A duração vem do CSS (e cai bastante com "reduzir movimento"),
     então o fim do giro é o fim da transição, com um plano B por garantia. */
  let encerrado = false;
  const encerrarUmaVez = () => {
    if (encerrado) return;
    encerrado = true;
    roleta.disco.removeEventListener('transitionend', encerrarUmaVez);
    encerrarGiro(setores[indice]);
  };

  roleta.disco.addEventListener('transitionend', encerrarUmaVez);
  setTimeout(encerrarUmaVez, 6000);
}

function encerrarGiro(setor) {
  girando = false;
  let complemento = '';

  if (setor.tipo === 'bonus') {
    salvarGiros(lerGiros() + 1);
  } else if (setor.tipo === 'perde') {
    /* Só dá para tirar o que existe: o número de giros nunca fica negativo. */
    const giros = lerGiros();
    salvarGiros(giros - 1);
    complemento = giros === 0
      ? 'Você já não tinha outro giro, então não saiu mais nenhum.'
      : 'Saiu mais um giro da sua conta.';
  } else if (setor.tipo !== 'nada') {
    salvarPremio({
      id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      rotulo: setor.nome || setor.rotulo,
      tipo: setor.tipo,
      codigo: setor.tipo === 'cupom' ? gerarCodigoPremio() : null,
      data: new Date().toISOString()
    });

    /* Produto ganho sai da roda na hora, no lugar dele fica "Sem prêmio". */
    if (setor.tipo === 'produto') atualizarSetores();
  }

  mostrarResultadoDoGiro(setor, complemento);
  atualizarRoleta();
}

function mostrarResultadoDoGiro(setor, complemento) {
  roleta.resultado.textContent = '';
  roleta.resultado.className = 'roleta__resultado roleta__resultado--' + setor.tipo;

  if (setor.imagem) {
    const figura = document.createElement('div');
    figura.className = 'roleta__resultado-figura';
    const imagem = document.createElement('img');
    imagem.src = setor.imagem;
    imagem.alt = setor.nome || setor.rotulo;
    figura.append(imagem);
    roleta.resultado.append(figura);
  }

  const TITULOS = {
    bonus: 'Você girou de novo!',
    nada: 'Não foi dessa vez',
    perde: 'Você perdeu 1 giro'
  };

  const titulo = document.createElement('strong');
  titulo.textContent = TITULOS[setor.tipo] || 'Você ganhou: ' + (setor.nome || setor.rotulo);

  const detalhe = document.createElement('p');
  detalhe.textContent = complemento
    ? setor.mensagem + ' ' + complemento
    : setor.mensagem;

  roleta.resultado.append(titulo, detalhe);

  if (setor.tipo === 'cupom' || setor.tipo === 'produto') {
    const contato = document.createElement('p');
    contato.className = 'roleta__resultado-contato';
    contato.textContent = setor.tipo === 'cupom'
      ? 'O código chega em ' + emailDoParticipante() + ' em até 24 horas. Confira também a caixa de spam.'
      : 'Entramos em contato por ' + emailDoParticipante() + ' em até 5 dias úteis para combinar a entrega. O frete fica por conta do ganhador. Como cada prêmio físico é único, esta fatia saiu da roleta.';
    roleta.resultado.append(contato);
  }

  roleta.resultado.hidden = false;
}

/* Mostra o e-mail cadastrado quando existe; senão, fala de forma genérica. */
function emailDoParticipante() {
  const dados = lerParticipante();
  return dados && dados.email ? dados.email : 'seu e-mail cadastrado';
}

/* O código é gerado e guardado no registro do prêmio: quem entrega é o e-mail,
   não a tela. */
function gerarCodigoPremio() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 4; i++) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return 'QUIZ' + codigo;
}

/* ------------------------------- Eventos --------------------------------- */

atualizarSetores();
atualizarRoleta();

roleta.botao.addEventListener('click', girar);
