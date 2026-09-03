/* Compartilhar o link da promoção vale 1 giro por rede, uma vez cada. Como o
   quiz é respondido uma única vez por e-mail, é daqui que saem os giros extras.

   O Instagram não abre um compartilhamento de link por URL, então ali o link
   é copiado e o app é aberto para a pessoa colar no story ou na mensagem. */

const CANAIS = [
  {
    id: 'instagram',
    rotulo: 'Instagram',
    copia: true,
    endereco: () => 'https://www.instagram.com/'
  },
  {
    id: 'whatsapp',
    rotulo: 'WhatsApp',
    endereco: (link, texto) => 'https://wa.me/?text=' + encodeURIComponent(texto + ' ' + link)
  },
  {
    id: 'facebook',
    rotulo: 'Facebook',
    endereco: link => 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link)
  },
  { id: 'copiar', rotulo: 'Copiar link', copia: true }
];

const TEXTO_DO_CONVITE =
  'Estou participando do Quiz Premiado do Mercado Livre e concorrendo a prêmios. Participe também:';

const compartilhamento = {
  botoes: document.getElementById('compartilhar-botoes'),
  contador: document.getElementById('compartilhar-contador'),
  aviso: document.getElementById('compartilhar-aviso')
};

/* O convite leva para a página da promoção, não para a do quiz. */
function linkDaPromocao() {
  return window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
}

/* ---------------------------- Crédito do giro ----------------------------- */

/* Cada rede paga um giro só na primeira vez; depois disso o botão continua
   compartilhando, mas sem creditar de novo. */
function creditarGiro(canal) {
  const primeiraVez = marcarCanalUsado(canal.id);
  if (primeiraVez) salvarGiros(lerGiros() + 1);

  atualizarRoleta();
  atualizarGirosDisponiveis();
  atualizarCompartilhamento();

  compartilhamento.aviso.textContent = primeiraVez
    ? (canal.copia ? 'Link copiado! Você ganhou 1 giro.' : 'Valeu por compartilhar! Você ganhou 1 giro.')
    : 'Você já tinha usado ' + canal.rotulo + ': o giro dessa rede só vale uma vez.';
  compartilhamento.aviso.hidden = false;
}

function copiarLink(canal, aoTerminar) {
  const link = linkDaPromocao();
  const concluir = () => {
    creditarGiro(canal);
    if (aoTerminar) aoTerminar();
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link)
      .then(concluir)
      .catch(() => copiarPeloCampo(link, canal, aoTerminar));
    return;
  }
  copiarPeloCampo(link, canal, aoTerminar);
}

/* Reserva para navegador sem clipboard ou fora de HTTPS. */
function copiarPeloCampo(link, canal, aoTerminar) {
  const campo = document.createElement('textarea');
  campo.value = link;
  campo.setAttribute('readonly', '');
  campo.style.position = 'fixed';
  campo.style.opacity = '0';
  document.body.append(campo);
  campo.select();

  let copiou = false;
  try {
    copiou = document.execCommand('copy') !== false;
  } catch (erro) {
    copiou = false;
  }

  campo.remove();

  /* Mesmo sem conseguir copiar, o giro é creditado e o link aparece na tela
     para a pessoa copiar à mão: a rede vale 1 giro de qualquer jeito. */
  creditarGiro(canal);
  if (aoTerminar) aoTerminar();

  if (!copiou) {
    compartilhamento.aviso.textContent = 'Não deu para copiar sozinho. O link é: ' + link;
  }
}

/* ------------------------------- Montagem --------------------------------- */

function montarCompartilhamento() {
  if (!compartilhamento.botoes) return;

  CANAIS.forEach(canal => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'compartilhar__botao';
    botao.dataset.canal = canal.id;
    botao.textContent = canal.rotulo;

    botao.addEventListener('click', () => {
      const abrir = canal.endereco
        ? () => window.open(canal.endereco(linkDaPromocao(), TEXTO_DO_CONVITE), '_blank', 'noopener')
        : null;

      /* Onde o link precisa ser colado, copia primeiro e só então abre o app. */
      if (canal.copia) {
        copiarLink(canal, abrir);
        return;
      }
      if (abrir) abrir();
      creditarGiro(canal);
    });

    compartilhamento.botoes.append(botao);
  });

  atualizarCompartilhamento();
}

/* Rede já usada fica marcada e não vale mais giro. */
function atualizarCompartilhamento() {
  if (!compartilhamento.botoes) return;

  const usados = lerCanaisUsados();

  Array.from(compartilhamento.botoes.children).forEach(botao => {
    const usado = usados.indexOf(botao.dataset.canal) !== -1;
    botao.classList.toggle('compartilhar__botao--usado', usado);
    botao.title = usado ? 'Você já ganhou o giro desta rede' : '';
  });

  if (!compartilhamento.contador) return;

  const restantes = CANAIS.length - usados.length;
  compartilhamento.contador.textContent = restantes === 0
    ? 'Você já usou as ' + CANAIS.length + ' redes e ganhou ' + CANAIS.length + ' giros.'
    : usados.length === 0
      ? 'São ' + CANAIS.length + ' redes disponíveis, 1 giro em cada.'
      : 'Você ganhou ' + usados.length + (usados.length === 1 ? ' giro' : ' giros') +
        ' e ainda pode usar ' + (restantes === 1 ? 'mais 1 rede.' : 'mais ' + restantes + ' redes.');
}

montarCompartilhamento();
