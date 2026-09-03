/* Resgate do prêmio físico, feito no próprio site: endereço de entrega,
   oferta de seguro (que dá para pular) e confirmação. */

/* Preço do seguro sai do valor do produto: 12% ao ano, na mesma proporção
   das três opções. */
const PLANOS_DE_SEGURO = [
  { id: '1 ano', rotulo: '1 ano', fator: 0.12, recomendado: true },
  { id: '1 ano e meio', rotulo: '1 ano e meio', fator: 0.18, recomendado: false },
  { id: '2 anos', rotulo: '2 anos', fator: 0.24, recomendado: false }
];

/* Frete estimado pela região do CEP, e formas de pagamento oferecidas. */
const FRETE_POR_REGIAO = [24.90, 24.90, 29.90, 29.90, 34.90, 34.90, 39.90, 39.90, 44.90, 44.90];

const FORMAS_DE_PAGAMENTO = [
  { id: 'pix', rotulo: 'Pix', detalhe: 'Aprovação na hora', selo: 'Sem juros' },
  { id: 'credito', rotulo: 'Cartão de crédito', detalhe: 'Parcele em até 6x', selo: '' },
  { id: 'boleto', rotulo: 'Boleto bancário', detalhe: 'Compensa em até 2 dias úteis', selo: '' }
];

const resgate = {
  etapaEntrega: document.getElementById('resgate-entrega'),
  etapaSeguro: document.getElementById('resgate-seguro'),
  etapaFim: document.getElementById('resgate-fim'),
  imagem: document.getElementById('resgate-imagem'),
  nome: document.getElementById('resgate-nome'),
  nomeSeguro: document.getElementById('seguro-produto'),
  formulario: document.getElementById('formulario-entrega'),
  opcoes: document.getElementById('seguro-opcoes'),
  pular: document.getElementById('botao-pular-seguro'),
  adicionar: document.getElementById('botao-adicionar-seguro'),
  etapaCheckout: document.getElementById('resgate-checkout'),
  imagemCheckout: document.getElementById('checkout-imagem'),
  nomeCheckout: document.getElementById('checkout-nome'),
  abas: document.getElementById('checkout-abas'),
  abaFreteValor: document.getElementById('aba-frete-valor'),
  enderecoCheckout: document.getElementById('checkout-endereco'),
  prazo: document.getElementById('checkout-prazo'),
  pagamentos: document.getElementById('checkout-pagamentos'),
  linhas: document.getElementById('checkout-linhas'),
  total: document.getElementById('checkout-total'),
  economia: document.getElementById('checkout-economia'),
  pagar: document.getElementById('botao-pagar'),
  voltarSeguro: document.getElementById('botao-voltar-seguro'),
  resumo: document.getElementById('resgate-resumo'),
  voltar: document.getElementById('botao-voltar-roleta'),
  cep: document.getElementById('cep'),
  endereco: document.getElementById('endereco'),
  numero: document.getElementById('numero'),
  complemento: document.getElementById('complemento'),
  cidade: document.getElementById('cidade'),
  uf: document.getElementById('uf')
};

let premioEmResgate = null;
let planoEscolhido = PLANOS_DE_SEGURO[0].id;
let seguroContratado = null;
let tipoDeEntrega = 'frete';
let pagamentoEscolhido = FORMAS_DE_PAGAMENTO[0].id;

/* ------------------------------ Utilitários ------------------------------ */

function emReais(valor) {
  return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function emReaisExato(valor) {
  return 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* O frete sai da região do CEP; é estimativa, como na tela de compra. */
function freteDoCep(cep) {
  const digitos = (cep || '').replace(/\D/g, '');
  const regiao = digitos ? Number(digitos.charAt(0)) : 0;
  return FRETE_POR_REGIAO[regiao] || FRETE_POR_REGIAO[0];
}

function precoDoSeguroContratado() {
  if (!seguroContratado) return 0;
  const plano = PLANOS_DE_SEGURO.filter(item => item.id === seguroContratado)[0];
  return precoDoPlano(plano, produtoDoPremio(premioEmResgate));
}

function valorDoFrete() {
  return tipoDeEntrega === 'retirada' ? 0 : freteDoCep(resgate.cep.value);
}

/* "Chegará entre quinta-feira e sábado", contando a partir de hoje. */
function textoDoPrazo() {
  const dias = tipoDeEntrega === 'retirada' ? [2, 4] : [3, 6];
  const nomes = dias.map(soma => {
    const data = new Date();
    data.setDate(data.getDate() + soma);
    /* Não há entrega no domingo: empurra para segunda. */
    if (data.getDay() === 0) data.setDate(data.getDate() + 1);
    return data.toLocaleDateString('pt-BR', { weekday: 'long' });
  });
  return (tipoDeEntrega === 'retirada' ? 'Disponível para retirada entre ' : 'Chegará entre ') +
    nomes[0] + ' e ' + nomes[1];
}

/* Acha o produto na lista da roleta para saber imagem e valor. */
function produtoDoPremio(premio) {
  return SETORES.filter(setor => setor.nome === premio.rotulo)[0] || null;
}

function precoDoPlano(plano, produto) {
  const valor = produto && produto.valor ? produto.valor : 500;
  return Math.round(valor * plano.fator);
}

function mostrarEtapa(nome) {
  resgate.etapaEntrega.hidden = nome !== 'entrega';
  resgate.etapaSeguro.hidden = nome !== 'seguro';
  resgate.etapaCheckout.hidden = nome !== 'checkout';
  resgate.etapaFim.hidden = nome !== 'fim';
}

/* ------------------------------- Abertura -------------------------------- */

function abrirResgate(premio) {
  premioEmResgate = premio;
  planoEscolhido = PLANOS_DE_SEGURO[0].id;
  seguroContratado = null;
  tipoDeEntrega = 'frete';
  pagamentoEscolhido = FORMAS_DE_PAGAMENTO[0].id;

  const produto = produtoDoPremio(premio);
  resgate.nome.textContent = premio.rotulo;
  resgate.nomeSeguro.textContent = premio.rotulo;

  if (produto && produto.imagem) {
    resgate.imagem.src = produto.imagem;
    resgate.imagem.alt = premio.rotulo;
    resgate.imagem.hidden = false;
  } else {
    resgate.imagem.hidden = true;
  }

  montarPlanos(produto);
  mostrarEtapa('entrega');
  mostrarTela('resgate');
  rolarAteQuiz();
}

/* ------------------------------- Endereço -------------------------------- */

function aplicarMascaraCep() {
  const digitos = resgate.cep.value.replace(/\D/g, '').slice(0, 8);
  resgate.cep.value = digitos.length > 5
    ? digitos.slice(0, 5) + '-' + digitos.slice(5)
    : digitos;
}

function validarCampoObrigatorio(campo, minimo) {
  const vazio = campo.value.trim().length < minimo;
  campo.closest('.campo').classList.toggle('campo--erro', vazio);
  return !vazio;
}

function validarCep() {
  const digitos = resgate.cep.value.replace(/\D/g, '');
  resgate.cep.closest('.campo').classList.toggle('campo--erro', digitos.length !== 8);
  return digitos.length === 8;
}

function enviarEndereco(evento) {
  evento.preventDefault();

  const valido = [
    validarCep(),
    validarCampoObrigatorio(resgate.endereco, 3),
    validarCampoObrigatorio(resgate.numero, 1),
    validarCampoObrigatorio(resgate.cidade, 2),
    validarCampoObrigatorio(resgate.uf, 2)
  ].every(Boolean);

  if (!valido) {
    const primeiro = resgate.formulario.querySelector('.campo--erro input');
    if (primeiro) primeiro.focus();
    return;
  }

  mostrarEtapa('seguro');
  rolarAteQuiz();
}

/* -------------------------------- Seguro --------------------------------- */

function montarPlanos(produto) {
  resgate.opcoes.textContent = '';

  PLANOS_DE_SEGURO.forEach((plano, i) => {
    const opcao = document.createElement('label');
    opcao.className = 'seguro__opcao' + (i === 0 ? ' seguro__opcao--ativa' : '');

    const marcador = document.createElement('input');
    marcador.type = 'radio';
    marcador.name = 'plano-seguro';
    marcador.value = plano.id;
    marcador.checked = i === 0;
    marcador.addEventListener('change', () => {
      planoEscolhido = plano.id;
      Array.from(resgate.opcoes.children).forEach((outra, j) => {
        outra.classList.toggle('seguro__opcao--ativa', i === j);
      });
    });

    const rotulo = document.createElement('span');
    rotulo.className = 'seguro__periodo';
    rotulo.textContent = plano.rotulo;

    const preco = document.createElement('span');
    preco.className = 'seguro__preco';
    preco.textContent = emReais(precoDoPlano(plano, produto));

    opcao.append(marcador, rotulo, preco);

    if (plano.recomendado) {
      const selo = document.createElement('span');
      selo.className = 'seguro__selo';
      selo.textContent = 'Recomendado';
      opcao.append(selo);
    }

    resgate.opcoes.append(opcao);
  });
}

/* -------------------------------- Checkout -------------------------------- */

/* Vindo do seguro: guarda a escolha e monta a tela de pagamento. */
function irParaCheckout(seguro) {
  seguroContratado = seguro;

  const produto = produtoDoPremio(premioEmResgate);
  resgate.nomeCheckout.textContent = premioEmResgate.rotulo;

  if (produto && produto.imagem) {
    resgate.imagemCheckout.src = produto.imagem;
    resgate.imagemCheckout.alt = premioEmResgate.rotulo;
    resgate.imagemCheckout.hidden = false;
  } else {
    resgate.imagemCheckout.hidden = true;
  }

  resgate.enderecoCheckout.textContent = resgate.endereco.value.trim() + ', ' +
    resgate.numero.value.trim() +
    (resgate.complemento.value.trim() ? ' - ' + resgate.complemento.value.trim() : '') +
    ' - ' + resgate.cidade.value.trim() + '/' + resgate.uf.value.trim().toUpperCase() +
    ' - CEP ' + resgate.cep.value.trim();

  montarPagamentos();
  atualizarCheckout();
  mostrarEtapa('checkout');
  rolarAteQuiz();
}

function montarPagamentos() {
  resgate.pagamentos.textContent = '';

  FORMAS_DE_PAGAMENTO.forEach((forma, i) => {
    const opcao = document.createElement('label');
    opcao.className = 'pagamento' + (i === 0 ? ' pagamento--ativo' : '');

    const marcador = document.createElement('input');
    marcador.type = 'radio';
    marcador.name = 'forma-pagamento';
    marcador.value = forma.id;
    marcador.checked = i === 0;
    marcador.addEventListener('change', () => {
      pagamentoEscolhido = forma.id;
      Array.from(resgate.pagamentos.children).forEach((outro, j) => {
        outro.classList.toggle('pagamento--ativo', i === j);
      });
    });

    const texto = document.createElement('span');
    const titulo = document.createElement('strong');
    titulo.textContent = forma.rotulo;
    const detalhe = document.createElement('small');
    detalhe.textContent = forma.detalhe;
    texto.append(titulo, detalhe);

    opcao.append(marcador, texto);

    if (forma.selo) {
      const selo = document.createElement('span');
      selo.className = 'pagamento__selo';
      selo.textContent = forma.selo;
      opcao.append(selo);
    }

    resgate.pagamentos.append(opcao);
  });
}

/* Uma linha do resumo: rótulo à esquerda, valor à direita. */
function linhaDoResumo(rotulo, valor, destaque) {
  const titulo = document.createElement('dt');
  titulo.textContent = rotulo;

  const dado = document.createElement('dd');
  if (destaque) dado.className = 'checkout__gratis';
  dado.textContent = valor;

  return [titulo, dado];
}

function atualizarCheckout() {
  const produto = produtoDoPremio(premioEmResgate);
  const valorProduto = produto && produto.valor ? produto.valor : 0;
  const frete = valorDoFrete();
  const seguro = precoDoSeguroContratado();

  resgate.abaFreteValor.textContent = emReaisExato(freteDoCep(resgate.cep.value));
  resgate.prazo.textContent = textoDoPrazo();

  resgate.linhas.textContent = '';
  resgate.linhas.append(...linhaDoResumo('Prêmio da promoção', 'Grátis', true));
  if (seguro > 0) {
    resgate.linhas.append(...linhaDoResumo('Seguro de ' + seguroContratado, emReaisExato(seguro)));
  }
  resgate.linhas.append(...linhaDoResumo(
    tipoDeEntrega === 'retirada' ? 'Retirada' : 'Frete',
    frete > 0 ? emReaisExato(frete) : 'Grátis',
    frete === 0
  ));

  resgate.total.textContent = emReaisExato(frete + seguro);
  resgate.economia.textContent = valorProduto > 0
    ? 'Você economizou ' + emReais(valorProduto) + ' no valor do produto.'
    : '';
}

function trocarEntrega(evento) {
  const botao = evento.target.closest('[data-entrega]');
  if (!botao) return;

  tipoDeEntrega = botao.dataset.entrega;
  Array.from(resgate.abas.children).forEach(aba => {
    aba.classList.toggle('checkout__aba--ativa', aba === botao);
  });
  atualizarCheckout();
}

function concluirResgate(seguro) {
  const entrega = {
    cep: resgate.cep.value.trim(),
    endereco: resgate.endereco.value.trim(),
    numero: resgate.numero.value.trim(),
    complemento: resgate.complemento.value.trim(),
    cidade: resgate.cidade.value.trim(),
    uf: resgate.uf.value.trim().toUpperCase()
  };

  const frete = valorDoFrete();
  const seguroPago = precoDoSeguroContratado();
  const forma = FORMAS_DE_PAGAMENTO.filter(item => item.id === pagamentoEscolhido)[0];

  atualizarPremio(premioEmResgate.id, {
    resgatado: true,
    seguro: seguro,
    entrega: entrega,
    tipoEntrega: tipoDeEntrega,
    frete: frete,
    pagamento: forma.rotulo,
    total: frete + seguroPago,
    dataResgate: new Date().toISOString()
  });

  const destino = tipoDeEntrega === 'retirada'
    ? 'Retirada no ponto mais próximo de ' + entrega.cidade + '/' + entrega.uf + '.'
    : 'Entrega em ' + entrega.endereco + ', ' + entrega.numero + ' – ' + entrega.cidade + '/' + entrega.uf + '.';

  resgate.resumo.textContent = premioEmResgate.rotulo + ' está a caminho. ' + destino +
    ' ' + textoDoPrazo() + '. ' +
    (seguro ? 'Seguro de ' + seguro + ' incluído. ' : 'Sem seguro contratado. ') +
    'Total de ' + emReaisExato(frete + seguroPago) + ' pago com ' + forma.rotulo + '.';

  listarPremios();
  mostrarEtapa('fim');
  rolarAteQuiz();
}

/* ------------------------------- Eventos --------------------------------- */

if (resgate.formulario) {
  resgate.formulario.addEventListener('submit', enviarEndereco);
  resgate.cep.addEventListener('input', aplicarMascaraCep);
  resgate.uf.addEventListener('input', () => {
    resgate.uf.value = resgate.uf.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
  });

  resgate.pular.addEventListener('click', () => irParaCheckout(null));
  resgate.adicionar.addEventListener('click', () => irParaCheckout(planoEscolhido));

  resgate.abas.addEventListener('click', trocarEntrega);
  resgate.pagar.addEventListener('click', () => concluirResgate(seguroContratado));
  resgate.voltarSeguro.addEventListener('click', () => {
    mostrarEtapa('seguro');
    rolarAteQuiz();
  });
  resgate.voltar.addEventListener('click', () => {
    mostrarTela('roleta');
    rolarAteQuiz();
  });
}
