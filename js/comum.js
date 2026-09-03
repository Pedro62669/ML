/* Funções compartilhadas da landing: contagem regressiva, FAQ,
   armazenamento local do participante e das rodadas jogadas. */

const PROMOCAO = {
  fim: new Date('2026-09-15T23:59:59'),
  chaveRodadas: 'quizPremiado.rodadas',
  chaveParticipante: 'quizPremiado.participante',
  chaveSaldo: 'quizPremiado.saldo',
  chavePremios: 'quizPremiado.premios',
  chaveCompartilhamentos: 'quizPremiado.compartilhamentos'
};

/* -------------------------- Armazenamento local -------------------------- */
/* Enquanto não existe backend, tudo fica no navegador de quem participa. */

function lerRodadas() {
  try {
    const bruto = localStorage.getItem(PROMOCAO.chaveRodadas);
    const lista = bruto ? JSON.parse(bruto) : [];
    return Array.isArray(lista) ? lista : [];
  } catch (erro) {
    return [];
  }
}

function salvarRodada(registro) {
  try {
    const lista = lerRodadas();
    lista.push(registro);
    localStorage.setItem(PROMOCAO.chaveRodadas, JSON.stringify(lista));
  } catch (erro) {
    /* navegador sem armazenamento: a rodada continua valendo na tela */
  }
}

function lerParticipante() {
  try {
    const bruto = localStorage.getItem(PROMOCAO.chaveParticipante);
    return bruto ? JSON.parse(bruto) : null;
  } catch (erro) {
    return null;
  }
}

function salvarParticipante(participante) {
  try {
    localStorage.setItem(PROMOCAO.chaveParticipante, JSON.stringify(participante));
  } catch (erro) {
    /* silencioso de propósito */
  }
}

/* Saldo e prêmios são guardados POR E-MAIL: quem troca o e-mail começa do
   zero, sem herdar os giros nem os prêmios de quem jogou antes no mesmo
   navegador. Os dois ficam em um mapa { e-mail: valor }. */

function emailAtivo() {
  const dados = lerParticipante();
  return (dados && dados.email) || '';
}

function lerMapa(chave) {
  try {
    const bruto = localStorage.getItem(chave);
    const dados = bruto ? JSON.parse(bruto) : null;
    return dados && typeof dados === 'object' && !Array.isArray(dados) ? dados : {};
  } catch (erro) {
    return {};
  }
}

function salvarMapa(chave, mapa) {
  try {
    localStorage.setItem(chave, JSON.stringify(mapa));
  } catch (erro) {
    /* silencioso de propósito */
  }
}

/* Saldo de pontos: é o que paga os giros da roleta. */

function lerSaldo() {
  const valor = parseInt(lerMapa(PROMOCAO.chaveSaldo)[emailAtivo()], 10);
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

function salvarSaldo(saldo) {
  const mapa = lerMapa(PROMOCAO.chaveSaldo);
  mapa[emailAtivo()] = Math.max(saldo, 0);
  salvarMapa(PROMOCAO.chaveSaldo, mapa);
}

/* Prêmios já sorteados na roleta. */

function lerPremios() {
  const lista = lerMapa(PROMOCAO.chavePremios)[emailAtivo()];
  return Array.isArray(lista) ? lista : [];
}

function salvarPremio(premio) {
  const mapa = lerMapa(PROMOCAO.chavePremios);
  const lista = Array.isArray(mapa[emailAtivo()]) ? mapa[emailAtivo()] : [];
  lista.push(premio);
  mapa[emailAtivo()] = lista;
  salvarMapa(PROMOCAO.chavePremios, mapa);
}

/* Usada pelo resgate para marcar o prêmio como retirado e guardar o seguro. */
function atualizarPremio(id, dados) {
  const mapa = lerMapa(PROMOCAO.chavePremios);
  const lista = Array.isArray(mapa[emailAtivo()]) ? mapa[emailAtivo()] : [];
  const premio = lista.filter(item => item.id === id)[0];
  if (!premio) return;

  Object.assign(premio, dados);
  mapa[emailAtivo()] = lista;
  salvarMapa(PROMOCAO.chavePremios, mapa);
}

/* Compartilhamentos feitos por este e-mail (cada um vale um giro). */

function lerCompartilhamentos() {
  const valor = parseInt(lerMapa(PROMOCAO.chaveCompartilhamentos)[emailAtivo()], 10);
  return Number.isFinite(valor) && valor > 0 ? valor : 0;
}

function contarCompartilhamento() {
  const mapa = lerMapa(PROMOCAO.chaveCompartilhamentos);
  mapa[emailAtivo()] = lerCompartilhamentos() + 1;
  salvarMapa(PROMOCAO.chaveCompartilhamentos, mapa);
}

/* Antes disso, saldo e prêmios eram um valor solto, sem dono. Se ainda estiver
   no formato antigo, passa tudo para o e-mail que está salvo no navegador. */
function migrarParaMapaPorEmail() {
  const email = emailAtivo();
  if (!email) return;

  try {
    const saldo = localStorage.getItem(PROMOCAO.chaveSaldo);
    if (saldo !== null && /^\d+$/.test(saldo.trim())) {
      salvarMapa(PROMOCAO.chaveSaldo, { [email]: parseInt(saldo, 10) });
    }

    const premios = JSON.parse(localStorage.getItem(PROMOCAO.chavePremios) || 'null');
    if (Array.isArray(premios)) {
      salvarMapa(PROMOCAO.chavePremios, { [email]: premios });
    }
  } catch (erro) {
    /* dado ilegível: começa limpo */
  }
}

/* Prêmios sorteados antes do resgate existir não tinham id; sem ele o resgate
   não sabe qual registro atualizar. */
function garantirIdsDosPremios() {
  const mapa = lerMapa(PROMOCAO.chavePremios);
  let mudou = false;

  Object.keys(mapa).forEach(email => {
    if (!Array.isArray(mapa[email])) return;
    mapa[email].forEach(premio => {
      if (!premio.id) {
        premio.id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        mudou = true;
      }
    });
  });

  if (mudou) salvarMapa(PROMOCAO.chavePremios, mapa);
}

migrarParaMapaPorEmail();
garantirIdsDosPremios();

/* Deixa o nome no formato usado no ranking: "Pedro H." */
function abreviarNome(nome) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  return partes[0] + ' ' + partes[partes.length - 1].charAt(0).toUpperCase() + '.';
}

/* -------------------------- Contagem regressiva -------------------------- */

function iniciarContador() {
  const caixa = document.getElementById('contador');
  if (!caixa) return;

  const campos = {
    dias: caixa.querySelector('[data-contador="dias"]'),
    horas: caixa.querySelector('[data-contador="horas"]'),
    minutos: caixa.querySelector('[data-contador="minutos"]'),
    segundos: caixa.querySelector('[data-contador="segundos"]')
  };

  function doisDigitos(valor) {
    return String(valor).padStart(2, '0');
  }

  function atualizar() {
    const restante = PROMOCAO.fim - new Date();

    if (restante <= 0) {
      Object.values(campos).forEach(campo => { campo.textContent = '00'; });
      return;
    }

    const segundos = Math.floor(restante / 1000);
    campos.dias.textContent = doisDigitos(Math.floor(segundos / 86400));
    campos.horas.textContent = doisDigitos(Math.floor(segundos % 86400 / 3600));
    campos.minutos.textContent = doisDigitos(Math.floor(segundos % 3600 / 60));
    campos.segundos.textContent = doisDigitos(segundos % 60);
  }

  atualizar();
  setInterval(atualizar, 1000);
}

/* ------------------------- Carrossel de prêmios --------------------------- */
/* O deslize é do próprio navegador (scroll-snap). Aqui só cuidamos dos
   pontinhos: eles aparecem quando a faixa é rolável, ou seja, no mobile. */

function iniciarCarrossel() {
  const trilho = document.getElementById('trilho-premios');
  const pontos = document.getElementById('pontos-premios');
  if (!trilho || !pontos) return;

  const cartoes = Array.from(trilho.children);

  cartoes.forEach((cartao, i) => {
    const ponto = document.createElement('button');
    ponto.type = 'button';
    ponto.className = 'carrossel__ponto';
    ponto.setAttribute('aria-label', 'Ver prêmio ' + (i + 1) + ' de ' + cartoes.length);
    ponto.addEventListener('click', () => {
      trilho.scrollTo({ left: cartao.offsetLeft - trilho.offsetLeft, behavior: 'smooth' });
    });
    pontos.append(ponto);
  });

  function marcarAtivo() {
    /* O cartão ativo é o que estiver mais perto da borda esquerda da faixa. */
    let ativo = 0;
    let menorDistancia = Infinity;

    cartoes.forEach((cartao, i) => {
      const distancia = Math.abs(cartao.offsetLeft - trilho.offsetLeft - trilho.scrollLeft);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        ativo = i;
      }
    });

    Array.from(pontos.children).forEach((ponto, i) => {
      ponto.classList.toggle('carrossel__ponto--ativo', i === ativo);
    });
  }

  marcarAtivo();
  trilho.addEventListener('scroll', marcarAtivo, { passive: true });
  window.addEventListener('resize', marcarAtivo);
}

/* -------------------------------- FAQ ------------------------------------ */

function iniciarFaq() {
  const faq = document.getElementById('faq');
  if (!faq) return;

  faq.querySelectorAll('.faq__pergunta').forEach(botao => {
    botao.addEventListener('click', () => {
      const resposta = document.getElementById(botao.getAttribute('aria-controls'));
      const aberto = botao.getAttribute('aria-expanded') === 'true';
      botao.setAttribute('aria-expanded', String(!aberto));
      resposta.hidden = aberto;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  iniciarContador();
  iniciarFaq();
  iniciarCarrossel();
});
