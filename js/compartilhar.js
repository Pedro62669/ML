/* Compartilhar o link da promoção vale 1 giro. Como o quiz é respondido uma
   única vez por e-mail, é daqui que saem os giros extras. */

const CANAIS = [
  {
    id: 'whatsapp',
    rotulo: 'WhatsApp',
    endereco: (link, texto) => 'https://wa.me/?text=' + encodeURIComponent(texto + ' ' + link)
  },
  {
    id: 'telegram',
    rotulo: 'Telegram',
    endereco: (link, texto) => 'https://t.me/share/url?url=' + encodeURIComponent(link) +
      '&text=' + encodeURIComponent(texto)
  },
  {
    id: 'facebook',
    rotulo: 'Facebook',
    endereco: link => 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link)
  },
  {
    id: 'email',
    rotulo: 'E-mail',
    endereco: (link, texto) => 'mailto:?subject=' + encodeURIComponent('Quiz Premiado Mercado Livre') +
      '&body=' + encodeURIComponent(texto + ' ' + link)
  },
  { id: 'copiar', rotulo: 'Copiar link' }
];

const TEXTO_DO_CONVITE =
  'Estou participando do Quiz Premiado do Mercado Livre e concorrendo a prêmios. Participe também:';

const compartilhamento = {
  botoes: document.getElementById('compartilhar-botoes'),
  contador: document.getElementById('compartilhar-contador'),
  aviso: document.getElementById('compartilhar-aviso')
};

/* O link é o da própria página, sem âncora nem parâmetros. */
function linkDaPromocao() {
  return window.location.origin + window.location.pathname;
}

/* ---------------------------- Crédito do giro ----------------------------- */

function creditarGiro(canal) {
  contarCompartilhamento();
  salvarSaldo(lerSaldo() + CUSTO_DO_GIRO);
  atualizarRoleta();
  atualizarCompartilhamento();

  compartilhamento.aviso.textContent = canal.id === 'copiar'
    ? 'Link copiado! Você ganhou 1 giro.'
    : 'Valeu por compartilhar! Você ganhou 1 giro.';
  compartilhamento.aviso.hidden = false;
}

function copiarLink(canal) {
  const link = linkDaPromocao();

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link)
      .then(() => creditarGiro(canal))
      .catch(() => copiarPeloCampo(link, canal));
    return;
  }
  copiarPeloCampo(link, canal);
}

/* Reserva para navegador sem clipboard ou fora de HTTPS. */
function copiarPeloCampo(link, canal) {
  const campo = document.createElement('textarea');
  campo.value = link;
  campo.setAttribute('readonly', '');
  campo.style.position = 'fixed';
  campo.style.opacity = '0';
  document.body.append(campo);
  campo.select();

  try {
    document.execCommand('copy');
    creditarGiro(canal);
  } catch (erro) {
    compartilhamento.aviso.textContent = 'Não foi possível copiar. O link é: ' + link;
    compartilhamento.aviso.hidden = false;
  }

  campo.remove();
}

/* ------------------------------- Montagem --------------------------------- */

function montarCompartilhamento() {
  if (!compartilhamento.botoes) return;

  CANAIS.forEach(canal => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'compartilhar__botao';
    botao.textContent = canal.rotulo;

    botao.addEventListener('click', () => {
      if (canal.id === 'copiar') {
        copiarLink(canal);
        return;
      }
      window.open(canal.endereco(linkDaPromocao(), TEXTO_DO_CONVITE), '_blank', 'noopener');
      creditarGiro(canal);
    });

    compartilhamento.botoes.append(botao);
  });

  atualizarCompartilhamento();
}

function atualizarCompartilhamento() {
  if (!compartilhamento.contador) return;

  const total = lerCompartilhamentos();
  compartilhamento.contador.textContent = total === 0
    ? 'Você ainda não compartilhou o link.'
    : total === 1
      ? 'Você já compartilhou 1 vez e ganhou 1 giro.'
      : 'Você já compartilhou ' + total + ' vezes e ganhou ' + total + ' giros.';
}

montarCompartilhamento();
