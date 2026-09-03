/* Roleta de prêmios: cada giro custa pontos do saldo acumulado no quiz.
   Os setores são desenhados a partir desta lista, então mudar o array
   muda a roda, as cores e o sorteio de uma vez só.
   Os pesos somam 100, ou seja, cada peso é a chance da fatia em %. */

const CUSTO_DO_GIRO = 100;

const SETORES = [
  {
    rotulo: 'PlayStation 5', tipo: 'produto', peso: 1,
    nome: 'Console PlayStation® 5 Slim Edição Digital 825 Gb Branco - Sony',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/playstation5.webp',
    mensagem: 'O prêmio máximo da promoção é seu!'
  },
  {
    rotulo: '10% OFF', tipo: 'cupom', peso: 13,
    nome: 'Cupom de 10% OFF',
    fundo: '#FFE600', texto: '#1A3B7C',
    mensagem: '10% de desconto na próxima compra, sem valor mínimo.'
  },
  {
    rotulo: 'Geladeira', tipo: 'produto', peso: 2,
    nome: 'Geladeira Electrolux Frost Free com AutoSense 480L Efficient Duplex Branca',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/geladeira.webp',
    mensagem: 'Frost Free com AutoSense, 480 litros, duplex.'
  },
  {
    rotulo: 'Sem prêmio', tipo: 'nada', peso: 15,
    fundo: '#C4C4C4', texto: '#333333',
    mensagem: 'Esta fatia não vale prêmio. Junte mais ' + CUSTO_DO_GIRO + ' pontos e tente outra vez.'
  },
  {
    rotulo: 'Smart TV', tipo: 'produto', peso: 2,
    nome: 'Samsung Smart TV 55" MiniLED 4K',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/televisao.webp',
    mensagem: 'Tela MiniLED 4K de 55 polegadas.'
  },
  {
    rotulo: 'Frete grátis', tipo: 'cupom', peso: 13,
    nome: 'Cupom de frete grátis',
    fundo: '#FFE600', texto: '#1A3B7C',
    mensagem: 'Frete grátis em uma compra no site, sem valor mínimo. Não vale para a entrega dos prêmios da roleta.'
  },
  {
    rotulo: 'Air Fryer', tipo: 'produto', peso: 4,
    nome: 'Fritadeira Air Fryer Forno Oven 12L Mondial',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/airfryer.webp',
    mensagem: 'Forno Oven de 12 litros, sem óleo.'
  },
  {
    rotulo: 'Perdeu giro', tipo: 'perde', peso: 15,
    fundo: '#F23D4F', texto: '#FFFFFF',
    mensagem: 'Além do giro que você acabou de usar, saem mais ' + CUSTO_DO_GIRO + ' pontos do saldo.'
  },
  {
    rotulo: 'Liquidificador', tipo: 'produto', peso: 6,
    nome: 'Liquidificador Philco 1500W 3,1L 12 Velocidades com 6 Lâminas',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/liquidificador.webp',
    mensagem: '1500W, jarra de 3,1L, 12 velocidades e 6 lâminas.'
  },
  {
    rotulo: 'R$ 50', tipo: 'cupom', peso: 10,
    nome: 'R$ 50 em vale-compras',
    fundo: '#FFE600', texto: '#1A3B7C',
    mensagem: 'R$ 50 de crédito para usar no site.'
  },
  {
    rotulo: 'Bicicleta', tipo: 'produto', peso: 2,
    nome: 'Bicicleta Elétrica Oggi Street Go S12 Tourney',
    fundo: '#2968C8', texto: '#FFFFFF',
    imagem: 'imagens/premios/bicicleta.webp',
    mensagem: 'Bicicleta elétrica com câmbio Shimano Tourney.'
  },
  {
    rotulo: 'Lava e Seca', tipo: 'produto', peso: 2,
    nome: 'Máquina Lava e Seca Electrolux 12kg Inverter',
    fundo: '#1A3B7C', texto: '#FFFFFF',
    imagem: 'imagens/premios/maquina-de-lavar.webp',
    mensagem: 'Lava e seca de 12 kg com motor Inverter.'
  },
  {
    rotulo: 'Gire de novo', tipo: 'bonus', peso: 15,
    fundo: '#00A650', texto: '#FFFFFF',
    mensagem: 'Este giro saiu de graça: seus pontos voltaram para o saldo.'
  }
];

const ANGULO = 360 / SETORES.length;

/* Prêmio físico é único por participante: quando sai na roleta, a fatia dele
   vira esta aqui, no mesmo lugar e com o mesmo peso. Assim ninguém leva cinco
   televisões, e a roda continua com o mesmo número de fatias. */
const FATIA_VAZIA = {
  rotulo: 'Sem prêmio', tipo: 'nada',
  fundo: '#C4C4C4', texto: '#333333',
  mensagem: 'Esta fatia não vale prêmio. Junte mais ' + CUSTO_DO_GIRO + ' pontos e tente outra vez.'
};

const roleta = {
  disco: document.getElementById('roleta-disco'),
  botao: document.getElementById('botao-girar'),
  saldo: document.getElementById('roleta-saldo'),
  giros: document.getElementById('roleta-giros'),
  aviso: document.getElementById('roleta-aviso'),
  resultado: document.getElementById('roleta-resultado'),
  premios: document.getElementById('lista-premios'),
  outraRodada: document.getElementById('botao-outra-rodada')
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
  const saldo = lerSaldo();
  const giros = Math.floor(saldo / CUSTO_DO_GIRO);

  roleta.saldo.textContent = saldo.toLocaleString('pt-BR');
  roleta.giros.textContent = giros;
  roleta.botao.disabled = girando || giros < 1;

  if (giros < 1) {
    const faltam = CUSTO_DO_GIRO - (saldo % CUSTO_DO_GIRO);
    roleta.aviso.textContent = 'Faltam ' + faltam + ' pontos para o próximo giro. Responda outra rodada para acumular.';
  } else {
    roleta.aviso.textContent = 'Cada giro custa ' + CUSTO_DO_GIRO + ' pontos do seu saldo.';
  }

  listarPremios();
}

function listarPremios() {
  const premios = lerPremios();
  roleta.premios.textContent = '';

  if (!premios.length) {
    const vazio = document.createElement('li');
    vazio.className = 'premios-ganhos__vazio';
    vazio.textContent = 'Você ainda não girou a roleta.';
    roleta.premios.append(vazio);
    return;
  }

  premios.slice().reverse().forEach(premio => {
    const item = document.createElement('li');

    const nome = document.createElement('strong');
    nome.textContent = premio.rotulo;
    item.append(nome);

    if (premio.tipo === 'cupom') {
      const status = document.createElement('span');
      status.className = 'premios-ganhos__status';
      status.textContent = 'E-mail em até 24h';
      item.append(status);
    }

    roleta.premios.append(item);
  });
}

/* --------------------------------- Giro ---------------------------------- */

function girar() {
  if (girando) return;

  const saldo = lerSaldo();
  if (saldo < CUSTO_DO_GIRO) return;

  girando = true;
  salvarSaldo(saldo - CUSTO_DO_GIRO);
  roleta.botao.disabled = true;
  roleta.resultado.hidden = true;
  atualizarRoleta();

  const indice = sortearSetor();
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
    salvarSaldo(lerSaldo() + CUSTO_DO_GIRO);
  } else if (setor.tipo === 'perde') {
    /* Só dá para tirar o que existe: o saldo nunca fica negativo. */
    const saldo = lerSaldo();
    const perdidos = Math.min(saldo, CUSTO_DO_GIRO);
    salvarSaldo(saldo - perdidos);
    complemento = perdidos === 0
      ? 'Seu saldo já estava zerado, então não saiu mais nenhum ponto.'
      : 'Saíram mais ' + perdidos + ' pontos do seu saldo.';
  } else if (setor.tipo !== 'nada') {
    salvarPremio({
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
roleta.outraRodada.addEventListener('click', () => voltarParaOQuiz());
