/* Banco de perguntas do Quiz Brasil.
   A cada rodada o quiz sorteia 10 destas perguntas.
   Para incluir novas, basta seguir o mesmo formato:
   { categoria, enunciado, alternativas: [...], correta: indice, explicacao } */

const BANCO_PERGUNTAS = [
  {
    categoria: 'Geografia',
    enunciado: 'Qual é o maior estado brasileiro em extensão territorial?',
    alternativas: ['Amazonas', 'Pará', 'Mato Grosso', 'Bahia'],
    correta: 0,
    explicacao: 'O Amazonas tem cerca de 1,56 milhão de km², maior que muitos países.'
  },
  {
    categoria: 'Geografia',
    enunciado: 'Quantos estados o Brasil tem, sem contar o Distrito Federal?',
    alternativas: ['24', '25', '26', '27'],
    correta: 2,
    explicacao: 'São 26 estados mais o Distrito Federal, totalizando 27 unidades federativas.'
  },
  {
    categoria: 'Geografia',
    enunciado: 'Qual bioma ocupa a maior parte do Centro-Oeste brasileiro?',
    alternativas: ['Caatinga', 'Cerrado', 'Pantanal', 'Mata Atlântica'],
    correta: 1,
    explicacao: 'O Cerrado é o segundo maior bioma do país e domina o Centro-Oeste.'
  },
  {
    categoria: 'Geografia',
    enunciado: 'Com quantos países da América do Sul o Brasil faz fronteira?',
    alternativas: ['7', '8', '9', '10'],
    correta: 3,
    explicacao: 'São 10 vizinhos: apenas Chile e Equador não fazem fronteira com o Brasil.'
  },
  {
    categoria: 'Geografia',
    enunciado: 'Qual é o ponto mais alto do Brasil?',
    alternativas: ['Pico da Neblina', 'Pico da Bandeira', 'Monte Roraima', 'Pico Paraná'],
    correta: 0,
    explicacao: 'O Pico da Neblina, no Amazonas, tem 2.995,3 metros de altitude.'
  },
  {
    categoria: 'História',
    enunciado: 'Em que ano foi proclamada a Independência do Brasil?',
    alternativas: ['1808', '1822', '1889', '1500'],
    correta: 1,
    explicacao: 'Dom Pedro I proclamou a Independência em 7 de setembro de 1822.'
  },
  {
    categoria: 'História',
    enunciado: 'Qual documento aboliu oficialmente a escravidão no Brasil, em 1888?',
    alternativas: ['Lei do Ventre Livre', 'Lei Áurea', 'Lei Eusébio de Queirós', 'Lei dos Sexagenários'],
    correta: 1,
    explicacao: 'A Lei Áurea foi assinada pela Princesa Isabel em 13 de maio de 1888.'
  },
  {
    categoria: 'História',
    enunciado: 'Qual cidade foi a capital do Brasil antes do Rio de Janeiro?',
    alternativas: ['Recife', 'São Paulo', 'Salvador', 'Ouro Preto'],
    correta: 2,
    explicacao: 'Salvador foi a primeira capital do país, de 1549 a 1763.'
  },
  {
    categoria: 'História',
    enunciado: 'Em que ano Brasília foi inaugurada como capital federal?',
    alternativas: ['1956', '1960', '1964', '1972'],
    correta: 1,
    explicacao: 'Brasília foi inaugurada em 21 de abril de 1960, no governo Juscelino Kubitschek.'
  },
  {
    categoria: 'Cultura',
    enunciado: 'Quem escreveu o romance "Dom Casmurro"?',
    alternativas: ['José de Alencar', 'Machado de Assis', 'Graciliano Ramos', 'Jorge Amado'],
    correta: 1,
    explicacao: 'Machado de Assis publicou "Dom Casmurro" em 1899.'
  },
  {
    categoria: 'Cultura',
    enunciado: 'Qual manifestação cultural é típica do Festival de Parintins, no Amazonas?',
    alternativas: ['Frevo', 'Bumba meu boi', 'Maracatu', 'Congada'],
    correta: 1,
    explicacao: 'O festival reúne os bois Garantido e Caprichoso em uma disputa anual.'
  },
  {
    categoria: 'Cultura',
    enunciado: 'Quem compôs a música "Garota de Ipanema" junto com Vinicius de Moraes?',
    alternativas: ['Tom Jobim', 'João Gilberto', 'Chico Buarque', 'Baden Powell'],
    correta: 0,
    explicacao: 'Tom Jobim assina a melodia e Vinicius de Moraes, a letra, de 1962.'
  },
  {
    categoria: 'Cultura',
    enunciado: 'O frevo, ritmo reconhecido como patrimônio cultural, nasceu em qual estado?',
    alternativas: ['Bahia', 'Pernambuco', 'Ceará', 'Alagoas'],
    correta: 1,
    explicacao: 'O frevo surgiu no Recife, em Pernambuco, no fim do século XIX.'
  },
  {
    categoria: 'Gastronomia',
    enunciado: 'O acarajé é um prato tradicional de qual estado?',
    alternativas: ['Bahia', 'Pará', 'Minas Gerais', 'Rio Grande do Sul'],
    correta: 0,
    explicacao: 'O acarajé é patrimônio cultural brasileiro e símbolo da culinária baiana.'
  },
  {
    categoria: 'Gastronomia',
    enunciado: 'Qual fruta amazônica é a base do tacacá e do tucupi?',
    alternativas: ['Cupuaçu', 'Açaí', 'Mandioca', 'Bacuri'],
    correta: 2,
    explicacao: 'O tucupi é extraído da mandioca brava, muito usada na cozinha do Norte.'
  },
  {
    categoria: 'Gastronomia',
    enunciado: 'O prato "barreado" é típico de qual estado?',
    alternativas: ['Paraná', 'Santa Catarina', 'Goiás', 'Espírito Santo'],
    correta: 0,
    explicacao: 'O barreado é tradicional do litoral paranaense, especialmente de Morretes.'
  },
  {
    categoria: 'Esportes',
    enunciado: 'Quantas Copas do Mundo de futebol masculino o Brasil já venceu?',
    alternativas: ['3', '4', '5', '6'],
    correta: 2,
    explicacao: 'Foram cinco títulos: 1958, 1962, 1970, 1994 e 2002.'
  },
  {
    categoria: 'Esportes',
    enunciado: 'Em que cidade brasileira foram realizados os Jogos Olímpicos de 2016?',
    alternativas: ['São Paulo', 'Brasília', 'Rio de Janeiro', 'Belo Horizonte'],
    correta: 2,
    explicacao: 'O Rio de Janeiro sediou a primeira Olimpíada da América do Sul.'
  },
  {
    categoria: 'Símbolos nacionais',
    enunciado: 'Quantas estrelas há na bandeira do Brasil?',
    alternativas: ['26', '27', '21', '29'],
    correta: 1,
    explicacao: 'São 27 estrelas, representando os 26 estados e o Distrito Federal.'
  },
  {
    categoria: 'Símbolos nacionais',
    enunciado: 'Qual é a frase escrita na faixa da bandeira nacional?',
    alternativas: ['Ordem e Progresso', 'Independência ou Morte', 'Pátria Amada', 'União e Trabalho'],
    correta: 0,
    explicacao: 'O lema "Ordem e Progresso" tem origem no positivismo de Auguste Comte.'
  },
  {
    categoria: 'Curiosidades',
    enunciado: 'Qual é a cidade mais populosa do Brasil?',
    alternativas: ['Rio de Janeiro', 'Brasília', 'São Paulo', 'Salvador'],
    correta: 2,
    explicacao: 'São Paulo é a maior cidade do país e do hemisfério sul.'
  },
  {
    categoria: 'Curiosidades',
    enunciado: 'Quantos fusos horários oficiais o Brasil tem hoje?',
    alternativas: ['2', '3', '4', '5'],
    correta: 2,
    explicacao: 'O país tem 4 fusos horários oficiais, incluindo o de Fernando de Noronha.'
  },
  {
    categoria: 'Curiosidades',
    enunciado: 'Qual é o rio mais extenso inteiramente em território brasileiro?',
    alternativas: ['Rio Amazonas', 'Rio São Francisco', 'Rio Paraná', 'Rio Tocantins'],
    correta: 1,
    explicacao: 'O São Francisco corre cerca de 2.700 km, todos dentro do Brasil.'
  },
  {
    categoria: 'Curiosidades',
    enunciado: 'Qual estado brasileiro concentra a maior parte da produção de café do país?',
    alternativas: ['Minas Gerais', 'São Paulo', 'Bahia', 'Paraná'],
    correta: 0,
    explicacao: 'Minas Gerais responde por mais da metade do café produzido no Brasil.'
  }
];
