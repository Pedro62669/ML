/* Motor do Quiz Premiado: cadastro, sorteio das perguntas, cronômetro,
   pontuação e tela de resultado. */

const CONFIG = {
  rodadasPorEmail: 1,
  totalPerguntas: 10,
  segundosPorPergunta: 20,
  pontosPorAcerto: 100,
  bonusMaximo: 100
};

const tela = {
  cadastro: document.getElementById('tela-cadastro'),
  jogo: document.getElementById('tela-jogo'),
  resultado: document.getElementById('tela-resultado'),
  roleta: document.getElementById('tela-roleta'),
  resgate: document.getElementById('tela-resgate')
};

const el = {
  formulario: document.getElementById('formulario-cadastro'),
  nome: document.getElementById('nome'),
  email: document.getElementById('email'),
  telefone: document.getElementById('telefone'),
  aceite: document.getElementById('aceite'),
  erroAceite: document.getElementById('erro-aceite'),
  indiceAtual: document.getElementById('indice-atual'),
  totalPerguntas: document.getElementById('total-perguntas'),
  cronometro: document.getElementById('cronometro'),
  cronometroValor: document.getElementById('cronometro-valor'),
  progresso: document.getElementById('progresso'),
  categoria: document.getElementById('categoria'),
  enunciado: document.getElementById('enunciado'),
  alternativas: document.getElementById('alternativas'),
  feedback: document.getElementById('feedback'),
  pontos: document.getElementById('pontos'),
  proxima: document.getElementById('botao-proxima'),
  repetir: document.getElementById('botao-repetir'),
  irRoleta: document.getElementById('botao-ir-roleta'),
  avisoLimite: document.getElementById('aviso-limite'),
  rodadasRestantes: document.getElementById('resultado-rodadas')
};

const LETRAS = ['A', 'B', 'C', 'D'];

let participante = null;
let rodada = [];
let indice = 0;
let pontos = 0;
let acertos = 0;
let respostas = [];
let segundosRestantes = 0;
let temporizador = null;

/* ------------------------------ Utilitários ------------------------------ */

function embaralhar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/* Sorteia as perguntas da rodada e embaralha as alternativas de cada uma,
   mantendo a referência de qual delas é a correta. */
function montarRodada() {
  return embaralhar(BANCO_PERGUNTAS)
    .slice(0, CONFIG.totalPerguntas)
    .map(pergunta => {
      const textoCorreto = pergunta.alternativas[pergunta.correta];
      const alternativas = embaralhar(pergunta.alternativas);
      return {
        categoria: pergunta.categoria,
        enunciado: pergunta.enunciado,
        explicacao: pergunta.explicacao,
        alternativas: alternativas,
        correta: alternativas.indexOf(textoCorreto)
      };
    });
}

function mostrarTela(nome) {
  Object.keys(tela).forEach(chave => { tela[chave].hidden = chave !== nome; });
}

function rolarAteQuiz() {
  document.getElementById('participar').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* --------------------------- Limite por e-mail ---------------------------- */
/* O quiz é respondido uma vez por e-mail. Depois disso, giros extras vêm de
   compartilhar o link da promoção. */

function rodadasUsadas(email) {
  return lerRodadas().filter(registro => registro.email === email).length;
}

function rodadasRestantes(email) {
  return Math.max(CONFIG.rodadasPorEmail - rodadasUsadas(email), 0);
}

function avisarLimiteAtingido() {
  const titulo = document.createElement('strong');
  titulo.textContent = 'Você já respondeu o quiz com este e-mail.';

  const detalhe = document.createElement('span');
  detalhe.textContent = lerSaldo() >= CUSTO_DO_GIRO
    ? 'Seus pontos continuam valendo: gire a roleta ou compartilhe o link para ganhar mais giros.'
    : 'Para ganhar mais giros, compartilhe o link da promoção na tela da roleta.';

  el.avisoLimite.textContent = '';
  el.avisoLimite.append(titulo, detalhe);
  el.avisoLimite.className = 'feedback feedback--errado';
  el.avisoLimite.hidden = false;

  mostrarTela('cadastro');
  rolarAteQuiz();
}

/* ------------------------------- Cadastro -------------------------------- */

function marcarErro(campo, temErro) {
  campo.closest('.campo').classList.toggle('campo--erro', temErro);
  return !temErro;
}

function validarNome() {
  const partes = el.nome.value.trim().split(/\s+/).filter(parte => parte.length >= 2);
  return marcarErro(el.nome, partes.length < 2);
}

function validarEmail() {
  const valor = el.email.value.trim();
  return marcarErro(el.email, !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor));
}

/* O celular é opcional: só valida se a pessoa digitou alguma coisa. */
function validarTelefone() {
  const digitos = el.telefone.value.replace(/\D/g, '');
  return marcarErro(el.telefone, digitos.length > 0 && (digitos.length < 10 || digitos.length > 11));
}

function validarAceite() {
  const aceito = el.aceite.checked;
  el.erroAceite.classList.toggle('campo__erro--visivel', !aceito);
  return aceito;
}

function aplicarMascaraTelefone() {
  const digitos = el.telefone.value.replace(/\D/g, '').slice(0, 11);
  if (!digitos) {
    el.telefone.value = '';
    return;
  }
  let formatado = '(' + digitos.slice(0, 2);
  if (digitos.length > 2) {
    formatado += ') ' + digitos.slice(2, digitos.length > 10 ? 7 : 6);
  }
  if (digitos.length > 6) {
    formatado += '-' + digitos.slice(digitos.length > 10 ? 7 : 6);
  }
  el.telefone.value = formatado;
}

function enviarCadastro(evento) {
  evento.preventDefault();

  /* Valida tudo antes de sair, para a pessoa ver todos os erros de uma vez. */
  const valido = [validarNome(), validarEmail(), validarTelefone(), validarAceite()]
    .every(Boolean);
  if (!valido) {
    const primeiroErro = el.formulario.querySelector('.campo--erro input, #aceite:not(:checked)');
    if (primeiroErro) primeiroErro.focus();
    return;
  }

  participante = {
    nome: el.nome.value.trim(),
    email: el.email.value.trim().toLowerCase(),
    telefone: el.telefone.value.trim(),
    exibicao: abreviarNome(el.nome.value)
  };
  salvarParticipante(participante);

  iniciarQuiz();
}

/* ------------------------------- Cronômetro ------------------------------ */

function iniciarCronometro() {
  pararCronometro();
  segundosRestantes = CONFIG.segundosPorPergunta;
  atualizarCronometro();

  temporizador = setInterval(() => {
    segundosRestantes--;
    atualizarCronometro();
    if (segundosRestantes <= 0) {
      responder(null);
    }
  }, 1000);
}

function pararCronometro() {
  if (temporizador) {
    clearInterval(temporizador);
    temporizador = null;
  }
}

function atualizarCronometro() {
  el.cronometroValor.textContent = Math.max(segundosRestantes, 0);
  el.cronometro.classList.toggle('cronometro--alerta', segundosRestantes <= 5);
}

/* -------------------------------- Rodada --------------------------------- */

function iniciarQuiz() {
  /* Guarda única: vale para o cadastro, para o "jogar de novo" e para o
     botão da roleta. */
  if (participante && rodadasRestantes(participante.email) === 0) {
    avisarLimiteAtingido();
    return;
  }

  el.avisoLimite.hidden = true;
  /* A roda é do e-mail: quem troca de e-mail recebe as fatias de volta. */
  atualizarSetores();
  rodada = montarRodada();
  indice = 0;
  pontos = 0;
  acertos = 0;
  respostas = [];

  el.totalPerguntas.textContent = rodada.length;
  el.pontos.textContent = '0';

  mostrarTela('jogo');
  rolarAteQuiz();
  mostrarPergunta();
}

function mostrarPergunta() {
  const pergunta = rodada[indice];

  el.indiceAtual.textContent = indice + 1;
  el.categoria.textContent = pergunta.categoria;
  el.enunciado.textContent = pergunta.enunciado;
  el.progresso.style.width = (indice / rodada.length * 100) + '%';

  el.feedback.hidden = true;
  el.feedback.className = 'feedback';
  el.proxima.disabled = true;
  el.proxima.textContent = indice === rodada.length - 1 ? 'Ver resultado' : 'Próxima pergunta';

  el.alternativas.textContent = '';
  pergunta.alternativas.forEach((texto, i) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'alternativa';

    const letra = document.createElement('span');
    letra.className = 'alternativa__letra';
    letra.textContent = LETRAS[i];

    const rotulo = document.createElement('span');
    rotulo.textContent = texto;

    botao.append(letra, rotulo);
    botao.addEventListener('click', () => responder(i));
    el.alternativas.append(botao);
  });

  iniciarCronometro();
}

function responder(escolha) {
  pararCronometro();

  const pergunta = rodada[indice];
  const acertou = escolha === pergunta.correta;
  let ganhos = 0;

  if (acertou) {
    const bonus = Math.round(CONFIG.bonusMaximo * (Math.max(segundosRestantes, 0) / CONFIG.segundosPorPergunta));
    ganhos = CONFIG.pontosPorAcerto + bonus;
    pontos += ganhos;
    acertos++;
    el.pontos.textContent = pontos;
  }

  respostas.push({
    enunciado: pergunta.enunciado,
    escolha: escolha === null ? null : pergunta.alternativas[escolha],
    correta: pergunta.alternativas[pergunta.correta],
    explicacao: pergunta.explicacao,
    acertou: acertou
  });

  /* Trava as alternativas e destaca a correta e a que foi marcada. */
  Array.from(el.alternativas.children).forEach((botao, i) => {
    botao.disabled = true;
    if (i === pergunta.correta) {
      botao.classList.add('alternativa--certa');
    } else if (i === escolha) {
      botao.classList.add('alternativa--errada');
    } else {
      botao.classList.add('alternativa--apagada');
    }
  });

  exibirFeedback(acertou, escolha === null, pergunta, ganhos);

  el.proxima.disabled = false;
  el.proxima.focus();
}

function exibirFeedback(acertou, tempoEsgotado, pergunta, ganhos) {
  const titulo = document.createElement('strong');
  const detalhe = document.createElement('span');

  if (acertou) {
    titulo.textContent = 'Resposta certa! +' + ganhos + ' pontos';
  } else if (tempoEsgotado) {
    titulo.textContent = 'O tempo acabou. A resposta era: ' + pergunta.alternativas[pergunta.correta];
  } else {
    titulo.textContent = 'Quase! A resposta era: ' + pergunta.alternativas[pergunta.correta];
  }
  detalhe.textContent = pergunta.explicacao;

  el.feedback.textContent = '';
  el.feedback.append(titulo, detalhe);
  el.feedback.classList.add(acertou ? 'feedback--certo' : 'feedback--errado');
  el.feedback.hidden = false;
}

function avancar() {
  if (indice < rodada.length - 1) {
    indice++;
    mostrarPergunta();
  } else {
    finalizar();
  }
}

/* ------------------------------ Resultado -------------------------------- */

function finalizar() {
  pararCronometro();
  el.progresso.style.width = '100%';

  const percentual = acertos / rodada.length;
  const faixas = [
    { minimo: 1, icone: '🏆', titulo: 'Nota máxima!', mensagem: 'Você gabaritou o quiz. Sua pontuação já está valendo na disputa.' },
    { minimo: 0.7, icone: '🎉', titulo: 'Muito bom!', mensagem: 'Você conhece bem o Brasil e já está concorrendo aos prêmios.' },
    { minimo: 0.4, icone: '👏', titulo: 'Bom resultado!', mensagem: 'Deu para ver que você manja do assunto. Amanhã dá para melhorar.' },
    { minimo: 0, icone: '📚', titulo: 'Valeu por participar!', mensagem: 'O banco de perguntas é grande: jogue de novo e aumente sua pontuação.' }
  ];
  const faixa = faixas.find(item => percentual >= item.minimo);

  document.getElementById('resultado-icone').textContent = faixa.icone;
  document.getElementById('resultado-titulo').textContent = faixa.titulo;
  document.getElementById('resultado-mensagem').textContent = faixa.mensagem;
  document.getElementById('resultado-acertos').textContent = acertos;
  document.getElementById('resultado-total').textContent = rodada.length;
  document.getElementById('resultado-pontos').textContent = pontos;

  /* Os pontos da rodada entram no saldo que paga os giros da roleta. */
  const saldo = lerSaldo() + pontos;
  salvarSaldo(saldo);

  const giros = Math.floor(saldo / CUSTO_DO_GIRO);
  document.getElementById('resultado-giros').textContent =
    giros === 1 ? '1 giro' : giros + ' giros';
  document.getElementById('resultado-saldo').textContent = giros > 0
    ? 'Saldo de ' + saldo.toLocaleString('pt-BR') + ' pontos. Cada giro custa ' + CUSTO_DO_GIRO + '.'
    : 'Saldo de ' + saldo.toLocaleString('pt-BR') + ' pontos. Faltam ' + (CUSTO_DO_GIRO - saldo % CUSTO_DO_GIRO) + ' para o primeiro giro.';
  el.irRoleta.disabled = giros < 1;

  montarResumo();

  salvarRodada({
    nome: participante.exibicao,
    email: participante.email,
    pontos: pontos,
    acertos: acertos,
    total: rodada.length,
    data: new Date().toISOString()
  });

  const restantes = rodadasRestantes(participante.email);
  el.rodadasRestantes.textContent = restantes > 0
    ? 'Você ainda tem ' + restantes + (restantes === 1 ? ' participação' : ' participações') + ' com este e-mail.'
    : 'O quiz é uma vez por e-mail. Para ganhar mais giros, compartilhe o link da promoção na roleta.';
  /* Sem rodada sobrando o botão some: quem manda agora é o compartilhamento. */
  el.repetir.hidden = restantes === 0;

  renderizarRanking();
  atualizarRoleta();

  mostrarTela('resultado');
  rolarAteQuiz();
}

function montarResumo() {
  const caixa = document.getElementById('resumo');
  caixa.textContent = '';

  const titulo = document.createElement('h3');
  titulo.textContent = 'Revisão das respostas';
  caixa.append(titulo);

  respostas.forEach((resposta, i) => {
    const item = document.createElement('div');
    item.className = 'resumo__item';

    const pergunta = document.createElement('p');
    const marca = document.createElement('span');
    marca.className = 'resumo__marca ' + (resposta.acertou ? 'resumo__marca--certa' : 'resumo__marca--errada');
    marca.textContent = resposta.acertou ? '✓' : '✕';
    pergunta.append(marca, document.createTextNode((i + 1) + '. ' + resposta.enunciado));

    const suaResposta = document.createElement('small');
    suaResposta.textContent = 'Sua resposta: ' + (resposta.escolha || 'sem resposta (tempo esgotado)');

    const correta = document.createElement('small');
    correta.textContent = 'Resposta correta: ' + resposta.correta + ' — ' + resposta.explicacao;

    item.append(pergunta, suaResposta, correta);
    caixa.append(item);
  });
}

/* ------------------------------- Eventos --------------------------------- */

/* Quem já jogou neste navegador não precisa digitar tudo de novo. */
const salvo = lerParticipante();
if (salvo) {
  el.nome.value = salvo.nome || '';
  el.email.value = salvo.email || '';
  el.telefone.value = salvo.telefone || '';

  if (salvo.email && rodadasRestantes(salvo.email) === 0) {
    participante = salvo;
    avisarLimiteAtingido();
  }
}

el.formulario.addEventListener('submit', enviarCadastro);
el.telefone.addEventListener('input', aplicarMascaraTelefone);
el.aceite.addEventListener('change', validarAceite);
el.nome.addEventListener('blur', validarNome);
el.email.addEventListener('blur', validarEmail);
el.proxima.addEventListener('click', avancar);

el.irRoleta.addEventListener('click', () => {
  mostrarTela('roleta');
  rolarAteQuiz();
});

/* Usada aqui e pela roleta: só volta direto ao quiz quem já se cadastrou. */
function voltarParaOQuiz() {
  if (participante) {
    iniciarQuiz();
  } else {
    mostrarTela('cadastro');
    rolarAteQuiz();
  }
}

el.repetir.addEventListener('click', voltarParaOQuiz);

/* Banner e botão de chamada levam direto para o formulário. */
document.querySelectorAll('[data-ir-para-quiz]').forEach(gatilho => {
  gatilho.addEventListener('click', () => {
    rolarAteQuiz();
    if (!tela.cadastro.hidden) el.nome.focus({ preventScroll: true });
  });
});
