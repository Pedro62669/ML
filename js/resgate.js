/* Resgate do prêmio físico, feito no próprio site: endereço de entrega,
   oferta de seguro (que dá para pular) e confirmação. */

/* Preço do seguro sai do valor do produto: 12% ao ano. O plano de 2 anos é o
   recomendado e sai com desconto, como na garantia estendida da loja. */
const PLANOS_DE_SEGURO = [
  { id: '1 ano', rotulo: '1 ano', fator: 0.12, desconto: 0, recomendado: false },
  { id: '2 anos', rotulo: '2 anos', fator: 0.24, desconto: 0.20, recomendado: true }
];

/* Frete estimado pela região do CEP, e formas de pagamento oferecidas. */
const FRETE_POR_REGIAO = [24.90, 24.90, 29.90, 29.90, 34.90, 34.90, 39.90, 39.90, 44.90, 44.90];

/* Tempo da tela de carregamento entre o seguro e o checkout. */
const ESPERA_DO_CHECKOUT = 1800;

const FORMAS_DE_PAGAMENTO = [
  { id: 'pix', rotulo: 'Pix', detalhe: 'Aprovação na hora', selo: 'Sem juros' }
];

const resgate = {
  etapaEntrega: document.getElementById('resgate-entrega'),
  etapaSeguro: document.getElementById('resgate-seguro'),
  etapaFim: document.getElementById('resgate-fim'),
  imagem: document.getElementById('resgate-imagem'),
  nome: document.getElementById('resgate-nome'),
  nomeSeguro: document.getElementById('seguro-produto'),
  imagemSeguro: document.getElementById('seguro-imagem'),
  formulario: document.getElementById('formulario-entrega'),
  opcoes: document.getElementById('seguro-opcoes'),
  pular: document.getElementById('botao-pular-seguro'),
  adicionar: document.getElementById('botao-adicionar-seguro'),
  etapaCarregando: document.getElementById('resgate-carregando'),
  etapaCheckout: document.getElementById('resgate-checkout'),
  imagemCheckout: document.getElementById('checkout-imagem'),
  nomeCheckout: document.getElementById('checkout-nome'),
  abaFreteValor: document.getElementById('aba-frete-valor'),
  enderecoCheckout: document.getElementById('checkout-endereco'),
  prazo: document.getElementById('checkout-prazo'),
  envioPreco: document.getElementById('checkout-envio-preco'),
  alterarEndereco: document.getElementById('botao-alterar-endereco'),
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
let planoEscolhido = planoRecomendado().id;
let seguroContratado = null;
let pagamentoEscolhido = FORMAS_DE_PAGAMENTO[0].id;
let esperaDoCheckout = null;

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
  return freteDoCep(resgate.cep.value);
}

/* "Chegará entre quinta-feira e sábado", contando a partir de hoje. */
function textoDoPrazo() {
  const dias = [3, 6];
  const nomes = dias.map(soma => {
    const data = new Date();
    data.setDate(data.getDate() + soma);
    /* Não há entrega no domingo: empurra para segunda. */
    if (data.getDay() === 0) data.setDate(data.getDate() + 1);
    return data.toLocaleDateString('pt-BR', { weekday: 'long' });
  });
  return 'Chegará entre ' + nomes[0] + ' e ' + nomes[1];
}

/* Acha o produto na lista da roleta para saber imagem e valor. */
function produtoDoPremio(premio) {
  return SETORES.filter(setor => setor.nome === premio.rotulo)[0] || null;
}

function planoRecomendado() {
  return PLANOS_DE_SEGURO.filter(plano => plano.recomendado)[0] || PLANOS_DE_SEGURO[0];
}

function precoCheioDoPlano(plano, produto) {
  const valor = produto && produto.valor ? produto.valor : 500;
  return Math.round(valor * plano.fator);
}

function precoDoPlano(plano, produto) {
  return Math.round(precoCheioDoPlano(plano, produto) * (1 - plano.desconto));
}

function mostrarEtapa(nome) {
  if (nome !== 'carregando') pararEspera();

  resgate.etapaEntrega.hidden = nome !== 'entrega';
  resgate.etapaSeguro.hidden = nome !== 'seguro';
  resgate.etapaCarregando.hidden = nome !== 'carregando';
  resgate.etapaCheckout.hidden = nome !== 'checkout';
  resgate.etapaFim.hidden = nome !== 'fim';

  /* A tela de carregamento cobre a página: trava a rolagem enquanto aparece. */
  document.body.classList.toggle('sem-rolagem', nome === 'carregando');

  /* Seguro e checkout saem do cartão e ocupam a página, como na loja. */
  document.body.classList.toggle('pagina-loja', nome === 'seguro' || nome === 'checkout');
}

function pararEspera() {
  clearTimeout(esperaDoCheckout);
  esperaDoCheckout = null;
}

/* ------------------------------- Abertura -------------------------------- */

function abrirResgate(premio) {
  premioEmResgate = premio;
  planoEscolhido = planoRecomendado().id;
  seguroContratado = null;
  pagamentoEscolhido = FORMAS_DE_PAGAMENTO[0].id;

  const produto = produtoDoPremio(premio);
  resgate.nome.textContent = premio.rotulo;
  resgate.nomeSeguro.textContent = premio.rotulo;

  if (produto && produto.imagem) {
    resgate.imagem.src = produto.imagem;
    resgate.imagem.alt = premio.rotulo;
    resgate.imagem.hidden = false;
    resgate.imagemSeguro.src = produto.imagem;
    resgate.imagemSeguro.alt = premio.rotulo;
    resgate.imagemSeguro.hidden = false;
  } else {
    resgate.imagem.hidden = true;
    resgate.imagemSeguro.hidden = true;
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

/* Coluna da direita: o valor do seguro e, quando há desconto, o preço cheio
   riscado com a economia embaixo. O seguro é pago de uma vez. */
function valoresDoPlano(plano, produto) {
  const caixa = document.createElement('span');
  caixa.className = 'seguro__valores';

  const cheio = precoCheioDoPlano(plano, produto);
  const preco = precoDoPlano(plano, produto);

  const total = document.createElement('span');
  total.className = 'seguro__total';
  if (preco < cheio) {
    const riscado = document.createElement('s');
    riscado.textContent = emReais(cheio);
    total.append(riscado);
  }
  total.append(emReais(preco));

  caixa.append(total);

  if (preco < cheio) {
    const economia = document.createElement('span');
    economia.className = 'seguro__economia';
    economia.textContent = 'Economize ' + emReais(cheio - preco);
    caixa.append(economia);
  }

  return caixa;
}

function montarPlanos(produto) {
  resgate.opcoes.textContent = '';

  PLANOS_DE_SEGURO.forEach((plano, i) => {
    const escolhido = plano.id === planoEscolhido;

    const opcao = document.createElement('label');
    opcao.className = 'seguro__opcao' +
      (escolhido ? ' seguro__opcao--ativa' : '') +
      (plano.recomendado ? ' seguro__opcao--recomendada' : '');

    const marcador = document.createElement('input');
    marcador.type = 'radio';
    marcador.name = 'plano-seguro';
    marcador.value = plano.id;
    marcador.checked = escolhido;
    marcador.addEventListener('change', () => {
      planoEscolhido = plano.id;
      Array.from(resgate.opcoes.children).forEach((outra, j) => {
        outra.classList.toggle('seguro__opcao--ativa', i === j);
      });
    });

    const rotulo = document.createElement('span');
    rotulo.className = 'seguro__periodo';
    rotulo.textContent = plano.rotulo;

    opcao.append(marcador, rotulo, valoresDoPlano(plano, produto));

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

  /* Espera curta antes de mostrar o checkout, como numa loja de verdade. */
  mostrarEtapa('carregando');
  esperaDoCheckout = setTimeout(() => {
    mostrarEtapa('checkout');
    rolarAteQuiz();
  }, ESPERA_DO_CHECKOUT);
}

/* Losango do Pix, desenhado aqui para não depender de arquivo de imagem. */
function desenharIconePix() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');

  const losango = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  losango.setAttribute('d', 'M12 3 21 12 12 21 3 12z');
  losango.setAttribute('fill', '#32BCAD');

  svg.append(losango);
  return svg;
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

    const icone = document.createElement('span');
    icone.className = 'pagamento__icone';
    icone.append(desenharIconePix());

    const texto = document.createElement('span');
    const titulo = document.createElement('strong');
    titulo.textContent = forma.rotulo;
    const detalhe = document.createElement('small');
    detalhe.textContent = forma.detalhe;
    texto.append(titulo, detalhe);

    opcao.append(marcador, icone, texto);

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
function linhaDoResumo(rotulo, valor, destaque, riscado) {
  const titulo = document.createElement('dt');
  titulo.textContent = rotulo;

  const dado = document.createElement('dd');
  if (destaque) dado.className = 'checkout__gratis';

  /* Valor cheio riscado antes do que a pessoa paga de fato. */
  if (riscado) {
    const antes = document.createElement('s');
    antes.textContent = riscado;
    dado.append(antes);
  }
  dado.append(valor);

  return [titulo, dado];
}

function atualizarCheckout() {
  const produto = produtoDoPremio(premioEmResgate);
  const valorProduto = produto && produto.valor ? produto.valor : 0;
  const frete = valorDoFrete();
  const seguro = precoDoSeguroContratado();

  const freteTexto = frete > 0 ? emReaisExato(frete) : 'Grátis';

  resgate.abaFreteValor.textContent = freteTexto;
  resgate.prazo.textContent = textoDoPrazo();
  resgate.envioPreco.textContent = freteTexto;

  resgate.linhas.textContent = '';
  resgate.linhas.append(...linhaDoResumo(
    'Produto',
    'Grátis',
    true,
    valorProduto > 0 ? emReais(valorProduto) : null
  ));
  if (seguro > 0) {
    resgate.linhas.append(...linhaDoResumo('Seguro de ' + seguroContratado, emReaisExato(seguro)));
  }
  resgate.linhas.append(...linhaDoResumo('Frete', freteTexto, frete === 0));

  resgate.total.textContent = emReaisExato(frete + seguro);
  resgate.economia.textContent = valorProduto > 0
    ? 'Você economizou ' + emReais(valorProduto)
    : '';
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
    tipoEntrega: 'frete',
    frete: frete,
    pagamento: forma.rotulo,
    total: frete + seguroPago,
    dataResgate: new Date().toISOString()
  });

  const destino = 'Entrega em ' + entrega.endereco + ', ' + entrega.numero +
    ' – ' + entrega.cidade + '/' + entrega.uf + '.';

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

  resgate.pagar.addEventListener('click', () => concluirResgate(seguroContratado));
  resgate.alterarEndereco.addEventListener('click', () => {
    mostrarEtapa('entrega');
    rolarAteQuiz();
  });

  resgate.voltarSeguro.addEventListener('click', () => {
    mostrarEtapa('seguro');
    rolarAteQuiz();
  });
  resgate.voltar.addEventListener('click', () => {
    /* Volta a etapa para o começo: também tira as marcas que o seguro deixa. */
    mostrarEtapa('entrega');
    mostrarTela('roleta');
    rolarAteQuiz();
  });
}
