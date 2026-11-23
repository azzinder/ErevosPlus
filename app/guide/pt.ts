// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

/** The user guide in Portuguese. Its format: lib/guide.ts. The same sections, in the same order and shape, as the English one. */
export const guide = `
## O que é o Erevos {#about}

O Erevos é um mensageiro feito para a privacidade. Você não precisa de conta, nem de número de telefone, nem de e-mail
para usá-lo, e ele foi pensado para continuar funcionando onde quer que você esteja: por um celular por perto sem
nenhuma rede, pelo Wi-Fi ou pela internet.

- **Por perto, sem internet:** dois celulares Android falam direto por Bluetooth, Wi-Fi Aware ou Wi-Fi Direct,
  criptografados de ponta a ponta, e celulares e computadores na mesma rede Wi-Fi ou no hotspot de um celular também.
  Com um rádio LoRa, os textos vão a quilômetros.
- **Por um relay:** pelo Wi-Fi ou pela internet, através de um pequeno servidor (um relay) que você mesmo pode rodar.
- **Espaços:** um bloqueio com senha, uma segunda senha que abre um Erevos separado e vazio, e conversas ocultas em
  cada espaço.
- **Aparência:** os visuais do LPHL: Classic, Modernist e Nocturne, doze paletas, e vidro como em lphl.nekten.eu.

{-O **Erevos+** é o mesmo app com mais: conversas com pessoas no Telegram, Messenger, Signal, Session, Matrix, XMPP
e Nostr, no Android 8.0 ou mais recente. Passe para ele, ou volte, em **Atualizações**: veja
[Erevos, Erevos+ ou Erevos Lite, e betas](#update-channel).}

> As mensagens são **criptografadas de ponta a ponta**, tanto por um relay quanto por perto, mas nada foi auditado
> ainda por especialistas independentes. [O que está protegido hoje](#privacy) diz exatamente o que está e o que não está.

Este guia abre em **Guia de uso**, no menu da tela inicial (os três pontos no topo). A busca no topo dele encontra
qualquer palavra que esteja nele. O guia está em todos os idiomas do app, e aparece no que você escolheu, veja
[Idioma](#start).

### Quem o faz, e por quê

- **Quem:** Erevos, by azzinder: a mesma pessoa que fez o [Fasouli](https://github.com/azzinder/lphl-chrima-releases/releases/latest), um app privado para as suas finanças.
- **Onde:** não importa. O que importa é que o relay e o app para o navegador rodam no servidor do próprio criador
  (lphl.nekten.eu).
- **Para quem:** para qualquer pessoa que queira falar com os seus sem dar um número de telefone, um e-mail ou uma
  conta: amigos, famílias, grupos, e quem vive onde a internet é cortada ou vigiada. E para quem, sem nada a esconder,
  quer manter o seu espaço pessoal privado, longe de olhares curiosos.
- **Por quê:** porque os apps conhecidos pedem um número de telefone, sabem quem fala com quem e param quando a
  internet cai. Porque os "termos de uso" de alguns deles não nos contemplam, e temos dúvidas sobre como protegem a
  nossa privacidade. Porque a outros faltam recursos de que precisamos. O Erevos não pede nada, e encontra um caminho
  pelo que houver: a internet, o Wi-Fi, o Bluetooth, um celular por perto.
- **Quem paga:** ninguém: sem anúncios, sem investidores, sem coleta de dados. Quem quiser pode ajudar com os custos de
  funcionamento, como o servidor: **Configurações** → **Geral** → **Apoiar o Erevos** tem as formas, Liberapay,
  PayPal, Monero e Bitcoin. Dar ou não dar não muda nada no app.
  **Por quê:** cada forma abre fora do Erevos, no navegador ou numa carteira, só quando tocada, então o próprio Erevos
  não envia nada e nunca sabe quem deu. O PayPal sabe quem dá; o Monero não mostra nem quem deu nem quanto; o Bitcoin
  não mostra nomes, mas o que o endereço recebeu é público.
- **Contato:** **Configurações** → **Geral** → **Contato** adiciona o criador como contato, e você escreve no próprio
  Erevos, com criptografia de ponta a ponta, sem número de telefone e sem e-mail.

### Feito com o código aberto de outros

O próprio Erevos é software livre, com a licença AGPL-3.0-or-later, veja [Licença](#licence), e é construído sobre o
trabalho de código aberto de outras pessoas. Estas são as partes principais, cada uma com os seus autores e a sua
licença:

- **Element Call** (Element; AGPL-3.0): as chamadas Matrix.
- **Arti, lyrebird, Snowflake e WebTunnel** (The Tor Project; Arti MIT ou Apache-2.0, lyrebird BSD-2-Clause, Snowflake
  BSD-3-Clause, WebTunnel MIT): o Tor dentro do app, e as pontes do Tor no Android.
- **vodozemac** (Matrix.org Foundation; Apache-2.0): a criptografia do Matrix.
- **OpenMLS** (OpenMLS Authors; MIT): os grupos criptografados.
- **Bibliotecas RustCrypto e dalek-cryptography** (os desenvolvedores delas; MIT ou Apache-2.0 no RustCrypto,
  BSD-3-Clause no dalek-cryptography): a criptografia em si.
- **React Native, Expo e react-native-webrtc** (Meta, 650 Industries e a comunidade React Native WebRTC; MIT): o app e as
  chamadas dele.
- **Electron** (Electron contributors; MIT): o app para computador.
- **Fontes Inter** (Rasmus Andersson e os Inter Project Authors; SIL Open Font License 1.1): as fontes do app.

A lista completa, cada pacote com a sua licença, está no arquivo \`CREDITS.md\` que vem com o código-fonte do {=Erevos}.

**Por quê:** porque quem os fez deu o seu trabalho livremente e pediu para ser nomeado, e porque você deve poder ver do
que o Erevos é feito.

Esta parte também abre em **Configurações** → **Geral** → **Sobre o Erevos**.

## Primeiros passos {#start}

O Erevos é baixado da página de versões dele, um arquivo para cada sistema: veja [Atualizações](#updates) para saber
onde, e como atualizá-lo. Ele roda no Android, num computador (Linux, macOS e Windows), no Sailfish OS e, pelo
navegador, num iPhone. Se você é novo nele, comece com um convite de alguém que já o usa: um código QR ou link, e você
está dentro, com essa pessoa como contato (veja Convidar alguém novo, em [Conversar por um relay](#relay)).

A tela inicial é a lista das suas conversas, a que se moveu por último no topo. Cada uma mostra a imagem do contato, a
última mensagem com as marcas dela, quando chegou e quantas mensagens dele você ainda não leu. Um relógio ao lado
significa que as mensagens dela desaparecem. **Buscar conversas** encontra uma conversa pelo nome ou pela última
mensagem e, abaixo das conversas, as mensagens que contêm o que você digita, em todas as conversas do espaço: toque
numa para abrir a conversa dela naquele ponto. Numa conversa, os detalhes dela têm **Buscar nesta conversa**: ▲ e ▼
vão para o que ela encontrou antes e depois. As duas procuram só neste celular: no que ele guarda selado{~, e **Buscar
nesta conversa** também nos SMS que a conversa de um contato mostra}; as conversas ocultas só são buscadas de dentro
delas. Uma conversa longa abre nas últimas 100 mensagens dela, e as anteriores, entre elas as importadas do Telegram ou
do WhatsApp, vêm sozinhas conforme você rola para cima (**Mostrar mensagens anteriores**, acima delas, também as traz);
ir para uma anterior (pela busca, por uma mensagem favorita ou pela mensagem que uma outra responde) também a traz.
Cada conversa abre na sua última mensagem, com a barra de mensagem embaixo: as conversas com contatos{~, os grupos e as
conversas de SMS| e os grupos}{+, e também as conversas de Matrix, XMPP e Nostr}. Com a tela rolada um pouco para cima, setas redondas
aparecem no canto inferior direito, em todas elas: a de cima vai para o início da conversa, a de baixo de volta para o
fim. Entre elas, se havia mensagens novas ao abrir a conversa, um tique duplo vai para a primeira delas, onde você
parou, enquanto essa mensagem não estiver à vista. A partir do início, **Mostrar mensagens posteriores**, abaixo do que
aparece, traz mais; escrever uma mensagem, ou a seta de baixo, volta ao fim.

**Por quê:** uma conversa longa abre nas últimas mensagens para abrir na hora: desenhar tudo de uma vez seria lento,
sobretudo em celulares mais antigos. As conversas ocultas ficam fora da busca da tela inicial para que a tela inicial
pareça igual, quer um espaço tenha alguma ou não: as mensagens delas só podem ser lidas enquanto o PIN delas as mantém
abertas.

**Fixadas e arquivadas:** segure qualquer conversa na tela inicial, de um contato{+ ou}{-{~,| ou}} de um grupo{-{~ ou de uma conversa de SMS}}{+, no Matrix, XMPP,
Nostr ou SMS}, para **Fixar no topo**, **Arquivar** e, no Android, **Silenciar esta conversa**. No máximo 10 conversas
ficam fixadas. Uma conversa arquivada sai da lista até chegar uma mensagem nova dela; toque em **Arquivadas** no topo
para ver o que você arquivou,{~ SMS também,} e toque de novo para voltar. As conversas ocultas têm suas próprias
conversas fixadas e arquivadas.

- **A imagem** é desenhada a partir da chave do contato: a mesma chave dá sempre as mesmas cores e a mesma lua{+ (em tons
  de verde no Matrix)}, para você reconhecer uma conversa de relance sem nenhuma foto. Não é uma verificação da chave; o
  [número de segurança](#relay) é.
- **A linha abaixo da busca** diz se há um relay definido e se a sua fila está pronta. Toque nela para configurar um.
- **A busca e essa linha ficam** sob a barra superior{~, com o botão de serviços,|} enquanto a lista rola.
- **Conversa comigo**, sempre a primeira nas conversas, com um alfinete, guarda as suas notas para você mesmo: veja
  Conversa comigo e lembretes abaixo.
- [+] **As conversas do Matrix**, depois que você entra no Matrix, ficam na lista com as outras, as mais recentes
  primeiro, cada uma marcada **Matrix**, e um convite aparece no topo. O chip **Matrix** mostra só elas, e ali
  **Nova conversa** começa uma conversa no Matrix: veja [Matrix](#matrix).
- [+] **As conversas do XMPP**, depois que você entra no XMPP, ficam na lista do mesmo jeito, cada uma marcada **XMPP**, e
  quem pede para adicionar você, ou um grupo que convida você, aparece no topo. O chip **XMPP** mostra só elas, e ali
  **Nova conversa** começa uma conversa no XMPP: veja [XMPP](#xmpp).
- [+] **As conversas Nostr**, quando o espaço tem uma chave Nostr, ficam na lista da mesma forma, cada uma marcada
  **Nostr**. O botão **Nostr** mostra só elas, com quantas mensagens não foram lidas, e ali **Nova conversa** abre a
  tela das conversas Nostr: veja [Conversas com outros apps Nostr](#nostr-chats).
- **Marcar tudo como lido**, no menu ⋮, lê de uma vez todas as conversas da parte da lista em que você está (todas as
  mensagens{~, SMS}{- ou Erevos}{+, Erevos, Matrix, XMPP ou Nostr}), inclusive as silenciadas e as bloqueadas com PIN, depois de perguntar.
  Cada uma é lida como se você a abrisse, então quem escreveu é avisado como naquele momento; os convites e as pessoas
  que pedem para adicionar você ficam até você responder.{+ As telas do Matrix, do XMPP e do Nostr o têm em **Conversas**
  para as suas próprias conversas.} As conversas ocultas ele nunca lê.
- [+] **O feed público**, quando o espaço tem uma chave Nostr ou está numa sala Matrix pública, é mais um botão,
  **Público**: um só feed, como no Amethyst, com as publicações públicas das pessoas que a sua chave Nostr segue e as
  mensagens das salas Matrix públicas em que você está, das mais recentes às mais antigas. Cada uma mostra quem a
  escreveu (um pequeno N ou M diz a rede), quando, suas palavras, suas fotos dentro da publicação e um cartão para o seu
  link. Com ambas ligadas, **Todas**, **Nostr** e **Matrix**, acima do feed, escolhem o que aparece, e **Fotos** escolhe
  como as fotos e os cartões são buscados. Sob uma publicação: responder, compartilhar de novo, curtir e compartilhar;
  sob uma mensagem Matrix: responder, reagir e compartilhar. **Nova publicação**, a caneta embaixo, escreve uma
  publicação pública, com até quatro fotos. Veja [Conversas com outros apps Nostr](#nostr-chats).
- **Nova conversa**, embaixo, abre as configurações do relay e a adição de um contato. **Lembrar-me**, o sino laranja
  ao lado, escreve um lembrete para você.
- **{~O fone verde e a pessoa violeta|A pessoa violeta}** no topo, no Android, {~abrem **Telefone** e **Contatos** direto, nas cores dos
  ícones deles|abre **Contatos** direto, na cor do ícone dela} na tela inicial do celular. {~Eles não estão|Ela não está} também no menu dos três pontos.
- [~] **O botão de serviços**, abaixo da barra do topo, onde fica enquanto a lista rola, quando duas partes com mensagens estão ligadas em Módulos, diz qual parte
  da lista aparece (**Todos os serviços**, ou a escolhida), com os sinais dos serviços, as mensagens não lidas de
  todos e, em vermelho, um serviço que não está conectado agora. Toque nele para a janela **Serviços**: um cartão para
  cada parte ligada, mesmo sem conversa ainda, cada um com suas mensagens não lidas (99+ acima de 99) e um ponto,
  verde enquanto a rede dele está conectada, vermelho com **Sem conexão** quando não está. Um cartão mostra só aquela
  parte: **Todos** todas as conversas, **SMS** só os SMS (com as conversas cuja última mensagem foi um SMS; ali
  aparece se o Erevos ainda não é o app de SMS), **Erevos** só as conversas do Erevos, as de cada contato, o que quer
  que tenha chegado por último{+, e **Matrix**, **XMPP**, **Público** e **Nostr** as deles}. **Adicionar** abre Módulos,
  para ligar mais, e **Marcar tudo como lido** lê a parte mostrada. Toque e segure um cartão para movê-lo para antes
  ou depois ou ocultá-lo com **Ocultar**: um serviço oculto continua ligado, mas não avisa nem conta no número do ícone
  (o Telegram, cujas pastas podem aparecer no início, sim), e suas conversas saem também
  de **Todos** (a busca ainda as encontra), e fica no pé da janela, onde um toque o mostra de novo. Qualquer cartão segurado, também **Todos**, pode virar
  **Abre primeiro**: o Erevos abre nele pelo ícone, e em **Todos** enquanto nenhum for escolhido. Conversas e grupos
  em **Em silêncio** não contam, como no número no ícone do Erevos, e o que se digita na busca não muda os números.
  Abaixo do botão, sem busca, vêm primeiro as conversas com mensagens não lidas, em **Não lidas**, com **Marcar tudo
  como lido** ao lado, e depois as outras em **Recentes**.
- **O widget**, no Android: adicione o Erevos pelos widgets da tela inicial. {~Os quatro botões dele abrem **Telefone**,
  os **SMS**, as **Mensagens** do Erevos e **Contatos**, depois da senha como qualquer link (o Telefone sem ela, se você
  permitir). Sobre os três primeiros ele mostra quantas chamadas perdidas, SMS não lidos e mensagens novas há, nunca de
  quem nem o quê; com chamadas perdidas, **Telefone** abre em **Recentes**.|Os dois botões dele abrem as **Mensagens** do Erevos e
  **Contatos**, depois da senha como qualquer link. Sobre **Mensagens** ele mostra quantas mensagens novas há, nunca de
  quem nem o quê.} Um botão tocado de novo mostra a tela dele
  de novo, também depois de você ter escolhido outra aba ali. As palavras dele seguem o idioma do Erevos.
  **Configurações** → **Aparência** → **Widget** define a ordem dos botões dele.
- **O cadeado laranja** no topo bloqueia o Erevos na hora quando há uma senha definida, ou abre as configurações de
  bloqueio quando não há.
- **Os três pontos** abrem o resto:

| No menu | O que abre |
| --- | --- |
| **Novo grupo** | Uma conversa em grupo com os seus contatos. Veja [Conversas em grupo](#groups). |
| **Grupos públicos** | Um grupo em que qualquer pessoa com o link pode pedir para entrar, com um dono e admins. Veja [Grupos públicos](#public-groups). |
| **Mensagens favoritas** | As mensagens que você favoritou, em todas as suas conversas. Veja O menu de uma mensagem, em Conversar por um relay. |
| **Celulares por perto** | Os seus contatos por Bluetooth e Wi-Fi Aware, ou na mesma rede Wi-Fi, sem internet. Veja [Conversar com um celular por perto](#nearby). |
| **Guia de uso** | Este guia. |
| **Configurações · Settings** | A última linha, com uma engrenagem: tudo o que você pode configurar, em grupos, com uma busca. Veja Configurações abaixo. |

Dentro de uma conversa, o nome e a imagem dela ficam no topo com a forma como ela viaja: **Criptografada** (de ponta a
ponta), **Online**, **Por perto** enquanto o celular da pessoa está conectado ao seu pelo rádio, ou **digitando…**, com
um cronômetro quando as mensagens da conversa desaparecem. Ao lado deles, o bloco azul com uma câmera inicia uma
videochamada e o verde com um fone, uma chamada de voz. Toque no nome, ou em **⋯** depois deles (**⋮** no Android),
para os **Detalhes** da conversa: a imagem dela (toque nela para mudá-la), **Ligar**, **Vídeo**, **Renomear** e
**Imagem**, depois **Mensagens temporárias**, **Bloquear capturas de tela**, **Aparecer offline**, **Aparência da conversa**, o **Número de segurança**,
**Mover para conversas ocultas**, **Mover para outro espaço** e **Apagar mensagens**. **Pronto** os fecha.

**Mídia, links e arquivos**, nos detalhes abaixo de **Buscar nesta conversa**, lista o que a conversa guarda,
cada tipo na sua própria aba com quantos há: **Fotos** (numa grade), **Vídeos**, **Mensagens de voz**, **Música**,
**Arquivos** e **Links**, os mais novos primeiro sob os seus meses, também os importados do Telegram ou do
WhatsApp. Um toque abre uma foto ou um arquivo para ver ou salvar, toca um som ali mesmo, ou abre um link depois de
perguntar; segurado, cada um oferece **Mostrar na conversa**, que vai para a mensagem dele. Um que ainda não foi baixado
do relay leva até ele na conversa, onde um toque o baixa. O calendário no topo vai para um dia: os dias que têm algo
daquele tipo ficam marcados. **Ir para um dia**, abaixo dele nos detalhes, faz o mesmo para a própria conversa: vai
para a primeira mensagem daquele dia.

**Por quê:** as listas são feitas neste celular a partir do que ele já guarda, então nenhum servidor fica sabendo o que
uma conversa contém; e só as fotos que estão na tela são lidas, como na conversa, então uma conversa com milhares delas
abre tão rápido quanto uma sem nenhuma.

[~] **Também no {+Matrix, XMPP, Nostr e }SMS:** {+uma conversa no Matrix, XMPP ou Nostr tem embaixo **Buscar nesta conversa**,
**Mídia, links e arquivos**, **Ir para um dia** e **Exportar conversa**, ao lado de **Notificações**, e }uma conversa
de SMS {+os }tem {-**Buscar nesta conversa**, **Mídia, links e arquivos**, **Ir para um dia** e **Exportar conversa** }primeiro no seu **⋮**. Eles olham só o que este celular guarda da conversa: {+as mensagens que uma
conversa do Matrix guarda (abaixo da busca, **Carregar mensagens anteriores** traz mais antigas do servidor dela, como
o topo da conversa faz), as de uma conversa do XMPP ou do Nostr, e }cada SMS e MMS da conversa no celular; ir para um
SMS mais antigo carrega a conversa até ele. Nada do que você digita na busca sai do celular. Fotos e arquivos aparecem
na lista, e um toque leva a cada um na conversa, onde um toque o traz do servidor dele como antes, então nenhum
servidor sabe quais você olhou; as imagens de um MMS aparecem na própria lista. **Exportar conversa** escreve a
conversa como para um contato, depois da mesma pergunta; as conversas de um lugar oculto não são exportadas.

Uma boa primeira hora:

1. Abra **Configurações** → **Privacidade e segurança** → **Bloqueio e segunda senha** e defina uma senha, para que
   ninguém que pegue o celular possa abrir o Erevos.
2. Abra **Celulares por perto** no menu em dois celulares que estejam perto um do outro, e permita o que o Android
   pedir.
3. Adicionem um ao outro com **Mostrar meu código QR**, como em [Conversar com um celular por perto](#nearby), e enviem
   uma mensagem: ela vai por perto, criptografada de ponta a ponta, sem relay e sem internet.
4. Para falar de mais longe, configure um relay como em [Conversar por um relay](#relay).

### Conversa comigo e lembretes

**Conversa comigo** fica sempre no topo das conversas, com um alfinete, em todos os espaços. É uma conversa sem mais
ninguém: escreva notas, links, fotos, arquivos e mensagens de voz para você mesmo, como em qualquer conversa. Ela não
vai para mais ninguém: fica criptografada no espaço, e vai só para os seus próprios dispositivos conectados,
criptografada de ponta a ponta, para que cada um tenha as mesmas notas e os mesmos lembretes (veja [Dispositivos
conectados](#devices)). Um backup leva tudo dela, notas, fotos, arquivos e mensagens de voz, como nas
conversas.

- **Um lembrete:** toque em **Lembrar-me** (o sino laranja ao lado de **Nova conversa**), escreva do que quer ser
  lembrado, escolha um horário (**Daqui a 1 hora**, **Hoje à noite 20:00**, **Amanhã 09:00**, ou qualquer dia, hora e
  minuto) e toque em **Lembrar-me**. Ele vai para a Conversa comigo, com um sino e o horário dele. Na conversa, **+** →
  **Lembrar-me**, ou segurar a seta de enviar, também dá um horário à nota que você escreve.
- **No horário dele**, no Android, o celular mostra um aviso, **Reminder** (ou **3 reminders**) – "Open Chat with
  myself to read it", nunca o que ele diz, também com o Erevos fechado e bloqueado; tocado, abre a Conversa comigo,
  depois da senha. Até você abrir a conversa, o lembrete aparece na linha dela no topo das conversas, com uma
  contagem, e na conversa com uma borda colorida; visto ali, ele também sai do aviso. Num computador, no app web, ou
  com os avisos desativados, é ali que você o vê. Se **Horários exatos** não estiver permitido (**Configurações** →
  **Geral** → **Permissões**), o Android pode mostrá-lo alguns minutos atrasado.
- **Segurar uma nota** oferece **Copiar**, **Abrir** (uma foto ou um arquivo), **Lembrar-me**, ou **Mudar o lembrete**
  e **Sem lembrete**, **Mover para uma pasta** e **Apagar**.
- **Pastas:** o botão de pasta no topo, ao lado de **Aparência da conversa**, cria uma. Aparecem então abas acima das
  notas: **Todas**, e uma para cada pasta, que mostra só o que há nela; o que você escreve, envia ou grava enquanto
  uma pasta está escolhida vai para dentro dela. Uma nota fica no máximo em uma pasta: **Mover para uma pasta** a põe
  em outra, em uma nova ou em **Sem pasta**. Segurar a aba de uma pasta, ou tocar nela de novo, oferece **Renomear a
  pasta** e **Apagar a pasta**; as notas dela ficam, sem pasta. Uma nota vai para os seus dispositivos conectados com
  a sua pasta, e uma pasta renomeada ou apagada em um deles fica assim nos outros também; uma vazia fica no
  dispositivo onde foi criada.
- Cada espaço tem a sua própria Conversa comigo, e também cada posição de conversas ocultas, no topo da lista delas
  (veja [Conversas ocultas](#hidden)). Os lembretes de uma posição oculta aparecem ali assim que o PIN dela a abre; o
  celular os avisa no horário só enquanto **Receber quando fechadas** está ativado para aquela posição, no mesmo
  aviso. Um PIN novo para a posição, que a começa vazia, ou a posição removida, tira os lembretes dela do celular. As
  notas de uma posição oculta vão só para os dispositivos conectados a essa posição por conta própria, nunca para os
  do espaço (veja [Dispositivos conectados](#devices)).
- **De outro app:** um app do telefone pode pedir para guardar aqui uma nota, como o Fasouli para um pagamento que
  está chegando, com o seu lembrete. O Erevos abre a Conversa comigo depois da senha, no espaço que você abre, e
  pergunta antes **Guardar esta nota?**, com o texto e a hora; só **Adicionar** a guarda. Nada volta para o app. Para um pagamento agendado o lembrete volta, todo mês ou como o pagamento se repete: assim que você o vê, ele passa para a próxima vez.

**Por quê:** um aviso aparece na tela bloqueada para quem estiver com o celular, então o que um lembrete diz fica
criptografado no espaço dele e o Android só fica sabendo o horário: o aviso não pode contar a ninguém o que você queria
lembrar, nem em que espaço ele está. E as notas não vão para ninguém além dos seus próprios dispositivos,
criptografadas de ponta a ponta entre eles como as suas conversas: o relay só as carrega criptografadas.

- [~] **De outras conversas:** uma mensagem de uma conversa {+do Matrix, XMPP, Nostr ou }{-de }SMS também pode vir para cá, com um
  lembrete: **Lembrar-me** no menu dela.

### Navegar deslizando

- **Voltar:** deslize para a direita em qualquer lugar de uma tela para voltar, como faz a seta de voltar. Uma seta
  redonda sai pela esquerda; solte quando ela estiver inteira, ou deslize rápido, e você volta. Solte antes e você
  fica. Numa conversa, faz o mesmo que a seta de voltar dela: volta para a lista de conversas, ou sai das conversas
  ocultas, fechando-as. Nos **Detalhes** de uma conversa, fecha-os.
- **Abas:** deslize para a esquerda ou para a direita para ir à aba ao lado, como ao tocar no chip dela: {~**Todos**,
  **SMS**}{+,}{-{~ e}} {~**Erevos**}{+, **Matrix**, **XMPP** e **Nostr**}{~ na tela inicial (os ligados em Módulos), **Teclado**,
  **Recentes** e **Favoritos** no **Telefone**,} os filtros em **Contatos**, e os conjuntos de figurinhas.{~ Na tela
  inicial as partes são escolhidas na janela **Serviços**, pelo botão abaixo da barra do topo.}
- Numa tela com abas, deslizar só muda a aba, também sobre as linhas da lista dela, e antes da primeira ou depois da
  última aba não faz nada: volte dali com a seta de voltar.{~ Uma conversa de SMS é arquivada ou apagada segurando-a.}

### Configurações

**Configurações · Settings**, a última linha do menu (os três pontos), reúne tudo o que você pode configurar no Erevos,
em grupos, como fazem as configurações do próprio celular. Nos outros idiomas, aparece nesse idioma e em inglês, como
**Einstellungen · Settings**, para ser encontrada mesmo num idioma que você não sabe ler.

- **Buscar nas configurações,** no topo, encontra uma configuração pelo começo das palavras dela, com ou sem acentos,
  e mostra onde ela fica, como {~**Telefone e SMS › SMS**|**Privacidade e segurança › Conversas ocultas**}. Toque nela para abri-la.
- **Idioma · Language,** a linha abaixo da busca, abre a lista de idiomas, veja Idioma abaixo.
- **Um grupo** abre a lista das configurações dele, e uma configuração abre a tela dela. Uma configuração com partes,
  como {~**SMS**|**Backups**}, lista essas partes, e cada parte abre sozinha.
- **Só aparece o que funciona aqui:** num computador, no Sailfish OS e no app web não há {~**Telefone e SMS**, |}Tor,
  Nostr nem LoRa, e um grupo sem nada para configurar aqui não aparece.
- [~] **Só os módulos ativados:** as configurações de um módulo desativado, como {+**Matrix** ou }**Telefone e SMS**,
  também não aparecem: veja [Módulos](#modules).

| Grupo | O que há nele |
| --- | --- |
| **Geral** | **Idioma**, {~**Módulos**, |}**Atualizações**, **Dar o Erevos a um telefone próximo** (Android), **Novidades**, **Sobre o Erevos**, **Apoiar o Erevos** e **Permissões** (Android e o app web). Veja Idioma abaixo, {~[Módulos](#modules), |}[Atualizações](#updates) e [O Erevos para um telefone próximo](#give-app). |
| **Aparência** | **Estilo e cores** (acabamento, vidro, estilo, tema, cores e texto em áreas coloridas, com a prévia), **Papel de parede**, **Mensagens** (o formato dos balões), **Ícones do launcher** (Android), **Widget** (Android) e **Vibrar ao tocar** (Android). Veja [Aparência](#appearance). |
| **Notificações** | **Em segundo plano** (Android e o app de computador): receber e tocar enquanto o Erevos está fechado, e o aviso de mensagens; num computador, se o Erevos continua rodando com a janela fechada. **Notificações com o app fechado** (o app web): Web Push. **Número no ícone**: quantas mensagens não foram lidas, no ícone do Erevos. Veja [Num iPhone](#iphone) e [Num computador](#desktop). |
| **Privacidade e segurança** | **Bloqueio e segunda senha** (bloquear ao abrir o Erevos, a senha, a privacidade da tela, impressão digital ou rosto, a segunda senha), **Conversas ocultas** (os PINs das 4 posições), **Botão de pânico** (com a senha de pânico), **Calculadora no lugar do Erevos** (Android, em Aparência), **Capturas de tela** (Android) e **Este app web** (só no app web). Veja [Bloqueio com senha](#lock), [Segunda senha](#second), [Conversas ocultas](#hidden) e [Botão de pânico](#panic). Veja também [Apagar-me de todos os lugares](#forget). |
| **Relay e redes** | **Caminhos**, **Relay** (abre **Nova conversa** com **Para usuários avançados** aberto), **Relay de casa**, **Tor** (Android), **Nostr** (Android){+,}{- e} **Rádio LoRa** (Android){+, **Matrix**, **XMPP** e **Conversas Nostr**}. Veja [Conversar por um relay](#relay), [Relay de casa](#home-relay), [Pelo Tor](#tor), [Pelo Nostr](#nostr){+,}{- e} [Por um rádio LoRa](#lora){+, [Matrix](#matrix), [XMPP](#xmpp) e [Conversas com outros apps Nostr](#nostr-chats)}. |
[~] | **Telefone e SMS** (Android) | **Telefone**, as configurações do app de telefone, as mesmas de **Telefone** → **Configurações**. **SMS**, em partes: **O Erevos como app de SMS**, **Descobrir o Erevos num número**, **SMS quando nada mais funciona**, **Nomes dos seus contatos**, **Arquivadas, Spam e Lixeira**, **Filtro de spam**, **Números bloqueados**, **Desfazer envio de SMS**, **Dois chips** (só com dois chips) e **Novo SMS**. Veja [Telefone](#phone) e [SMS](#sms). |
| **Dados e dispositivos** | **Backups**, **Partes do backup**, **Dispositivos conectados** e **Conversas importadas**. Veja [Backups](#backup), [Partes do backup com amigos](#backup-pieces), [Dispositivos conectados](#devices) e [Conversas importadas](#import). |
| **Para testes** | **Teste do relay** e **Teste de rádio** (Android). Veja [As telas de teste](#tests). |

### Idioma

O Erevos está em inglês, grego, alemão, francês, espanhol, italiano, português e servo-croata. Na primeira vez que
abre, ele segue o idioma do celular se for um destes (um celular em sérvio, croata, bósnio ou montenegrino começa em
servo-croata), e fica em inglês nos outros casos. Para mudá-lo, abra o menu (os três pontos), toque em
**Configurações · Settings**, a última linha dele, e depois na primeira linha ali, **Idioma · Language**. Nos outros
idiomas, as duas aparecem nesse idioma e em inglês, como **Einstellungen · Settings** e **Sprache · Language**. Depois
toque no idioma, cada um com o nome na própria língua: **Ελληνικά**, **English**, **Deutsch**, **Español**,
**Français**, **Italiano**, **Português** ou **Srpskohrvatski**. O app inteiro muda na hora.

- **Este guia** também está em cada um desses idiomas, e chama os botões como o app os mostra no seu. Nos idiomas
  que não são o inglês nem o grego, uma palavra nova no app pode aparecer em inglês por um tempo, até ser
  traduzida.
- **Guardado no celular:** a escolha fica guardada neste celular, fora de todos os espaços, então a tela da senha
  também aparece nesse idioma, e todos os espaços abrem nele. Não é selada: quem estiver com o celular pode ver que
  idioma você escolheu.
- **Os avisos do Android** (uma chamada recebida, mensagens novas, o Erevos recebendo em segundo plano) ficam em grego
  quando o Erevos está em grego, e em inglês em todos os outros idiomas.

## Módulos {#modules}

O Erevos é feito de partes, seus módulos: o **Erevos** em si (as próprias conversas, grupos e chamadas, criptografados
de ponta a ponta, com as conversas ocultas), o **Telefone**{- e}{+,} os **SMS**{+, as conversas com apps **Nostr**, **Matrix** e
**XMPP**, e **Telegram**, **Messenger**, **Signal** e **Session**}. A **Coleção** (suas fotos e arquivos, criptografados) também é um módulo. O Telefone e os SMS só existem no Android, a Coleção no Android, no app para computador, no app web e no Sailfish OS. Qualquer um pode ficar ativado, o próprio Erevos também, um ou
mais, pelo menos um: **Configurações** → **Geral** → **Módulos** ativa ou desativa cada um a qualquer momento.

Na primeiríssima vez que inicia, o Erevos se configura como um instalador faz. Antes de abrir o primeiro espaço: o que
você não entrega (nem número de telefone, nem e-mail, nem nome de usuário, nem conta: você adiciona pessoas com um
código QR ou um link, ou elas convidam você), um nome para seus contatos se você quiser um, e o idioma; depois quais
módulos usar, cada um com o que faz. Depois, no espaço: uma tela para cada módulo escolhido, com como começar com ele
(para o Erevos, como você entra; para o Telefone e os SMS, o Erevos como app de telefone e como app de SMS{+; para Nostr,
Matrix e XMPP, sua conta lá}) e o que o Android, ou o navegador, deve permitir para ele. Cada permissão fica na primeira
tela que precisa dela, e **Permitir tudo, um por um** faz as perguntas que o Android faz no próprio Erevos, uma depois
da outra. Depois o bloqueio com senha e os backups automáticos, depois o que está pronto e o que falta, com **Convidar
alguém**. **O resto depois** deixa o resto para as Configurações; até você terminar ou adiar, os passos aparecem de novo
quando o Erevos inicia. Aberto com um convite, o Erevos o mostra quando os passos terminam. Depois de uma atualização,
todos os módulos continuam ativados, como antes, até você mudá-los.

- **O nome:** não é um nome de usuário: ninguém o procura, e ele não precisa ser único. Ele vai, criptografado, só para
  quem você adiciona, e **O meu nome**, em Configurações → Privacidade e segurança, o muda.
- **Mudar de outro celular:** no Android, **Eu já tenho o {=Erevos} em outro celular** pula o nome e os módulos, que vêm
  com o backup. O espaço abre, **Abrir Backups** o restaura (veja [Mudar para um celular novo](#new-phone)), e seguem as
  telas dos módulos que ele traz, depois a impressão digital e a pasta dos backups automáticos, que ficam com cada
  celular. **Ainda não tenho backup** diz como fazer um.
- **Num computador ou num navegador:** **Conectar ao meu celular** pula os passos e abre **Dispositivos conectados**.

- **Desativado:** um módulo desativado não inicia: nada dele roda, espera num servidor ou toca, então o Erevos fica
  mais leve, abre mais rápido e gasta menos bateria. Ele não aparece em lugar nenhum: nem na tela inicial, nem no menu,
  nem nas configurações, e os ícones do Telefone e dos SMS saem dos apps do celular. Um link, uma notificação ou o
  widget que ainda levem a ele dizem que está desativado, com **Abrir Módulos**.
- **Nada é apagado:** as conversas, os contatos, as contas e as configurações dele voltam quando ele é ativado de novo.
  Os contatos, o bloqueio por senha, os espaços, os backups e as Configurações estão sempre lá, seja o que for que
  esteja ativado.
- **Ativado de novo:** um módulo ativado inicia na hora, e **Permissões** mostra o que o Android deve permitir para
  ele, como no primeiro início.
- **Novo com uma atualização:** um módulo que chega com uma atualização, como a Coleção com a 7, fica ativado, também
  onde você escolheu os módulos antes de ele chegar, até você desativá-lo.
- **O Telefone ou os SMS desativados** enquanto o Erevos ainda é o app de telefone ou o app de SMS: o Android continua
  dando ao Erevos as chamadas ou os SMS, guardados como antes. **Abrir Apps padrão** escolhe outro app.
- **O Telefone sozinho:** sem nenhum módulo que traga mensagens, a tela inicial avisa, com **Telefone** e **Módulos**.
- **Guardado no celular:** a escolha vale para este celular, igual em todos os espaços, e é guardada fora dos espaços,
  como os ícones, já que o Telefone pode abrir sem a senha.

**Por quê:** nem todo mundo quer tudo. Quem usa o {=Erevos} só como telefone, ou só para o Nostr, fica com um app que faz
só isso, e um celular que não espera em segundo plano mensagens que nunca chegam.

## Conversar com um celular por perto {#nearby}

Enquanto um espaço está aberto, em qualquer tela, o Erevos procura outros celulares com {=Erevos} ao redor, por Bluetooth
e, onde o celular tem, por Wi-Fi Aware, e na rede Wi-Fi em que está, celulares e computadores igualmente. Não é preciso
internet, chip nem rede Wi-Fi. Ele leva as mensagens aos seus contatos, criptografadas de ponta a ponta como as que
passam pelo relay.

Só procura quando **Procurar celulares por perto** está ligado, em **Perto, sem internet**, em **Nova conversa**: fica
desligado até você ligar, nos dois celulares, e até lá tudo vai pelo relay.

1. Abra **Celulares por perto** no menu nos dois celulares. Na primeira vez, o Android pede para encontrar dispositivos
   por perto (no Android 12 e anteriores, também a localização); permita, ou os celulares não conseguem se encontrar.
2. Se vocês ainda não são contatos, adicionem um ao outro: num celular toque em **Nova conversa**, onde aparece **Seu
   código QR**, e leia-o com o outro, como em [Conversar por um relay](#relay). Sem relay, o código guarda só as suas
   chaves, e vocês só se alcançam por perto, até terem um.
3. Escolha o contato, digite na barra de mensagem embaixo e toque na seta de enviar. Assim que o celular da outra
   pessoa responde, o topo da conversa diz **Por perto**.

- **Enquanto um espaço está aberto:** as conexões começam quando um espaço abre, seja qual for a tela, e param quando
  outro espaço abre: bloqueado, o espaço continua atrás da tela da senha. Uma mensagem de perto aparece na tela inicial
  como uma que vem pelo relay, e uma chamada também toca ali. No Android elas continuam com o Erevos em segundo plano,
  enquanto **Em segundo plano** está em **Receber e tocar**. Para poupar a bateria ali, ele procura celulares com menos
  frequência: o Wi-Fi Direct a cada dez minutos, o Wi-Fi Aware um minuto a cada cinco, e na mesma rede Wi-Fi ele ouve
  os outros vinte segundos a cada dois minutos. Assim, um celular por perto pode ser encontrado alguns minutos depois;
  as conexões que estão de pé continuam de pé, e assim que o Erevos aparece na tela ele volta a procurar com a mesma
  frequência de antes.
- **Alcance:** algumas dezenas de metros ao ar livre, menos através de paredes.
- **Wi-Fi Aware:** mais rápido, mas nem todo celular tem. O Bluetooth funciona em todos. Para pará-lo, desative
  **Procurar com Wi-Fi Aware**, acima de **Encontrar Erevos na mesma rede Wi-Fi**.
- **A mesma rede Wi-Fi ou um hotspot:** celulares numa mesma rede Wi-Fi, ou no hotspot de um celular, se encontram e
  falam direto, mesmo quando essa rede não tem internet; o app de computador também. Se o Android perguntar se deve
  ficar numa rede Wi-Fi sem internet, fique. Qualquer pessoa nessa rede consegue saber que há um app Erevos ali, não de
  quem. O firewall de um computador precisa deixar entrar a porta 47905 (UDP e TCP). Para parar, desative **Encontrar
  Erevos na mesma rede Wi-Fi** em **Perto, sem internet**, na tela **Nova conversa**.
- **Uma rede Wi-Fi própria (Android 10 e posteriores):** sem uma rede Wi-Fi em comum, dois celulares com {=Erevos} perto
  um do outro criam uma pequena rede Wi-Fi própria (Wi-Fi Direct) e falam por ela como na mesma rede Wi-Fi: mais rápido
  que o Bluetooth, e uma chamada passa por ela sem internet. Não pede nada; cada celular também continua na sua própria
  rede Wi-Fi onde puder. Qualquer pessoa por perto consegue saber que há um celular com {=Erevos} ali, e poderia entrar
  nessa pequena rede, recebendo só bytes selados. Precisa de **Encontrar Erevos na mesma rede Wi-Fi** ativado; para
  parar só ela, desative **Criar uma rede Wi-Fi com celulares por perto** abaixo dele.
- **Num celular Samsung**, **Procurar com Wi-Fi Aware** e **Criar uma rede Wi-Fi com celulares por perto** ficam
  desativados até você ativá-los: enquanto um app os usa, a Samsung pede para desligar o compartilhamento dela. O
  Bluetooth e a mesma rede Wi-Fi funcionam sem eles.
- **Outros celulares por perto** recebem só bytes selados que não conseguem abrir, e só até o celular do seu contato
  ser conhecido: a partir daí, o que você envia vai só para ele. As mensagens de voz só vão para um contato que se sabe
  estar perto. Fotos e arquivos precisam do relay.
- **Com um relay também,** cada mensagem também vai por ele, então nada se perde se a conexão cair; a cópia que chega
  em segundo lugar não é mostrada de novo. Se o relay não estiver acessível, a cópia por perto é a que vale.
- **Levadas por outros celulares:** quando o relay não está acessível e o seu contato não está perto, os celulares com
  {=Erevos} por perto também pegam a sua mensagem, selada para o relay do seu contato. Cada um a guarda, três dias no
  máximo, passa-a a no máximo mais dois celulares que encontrar, e a entrega a esse relay pelo próprio relay assim que
  puder; o seu faz o mesmo. Eles não conseguem lê-la, nem saber de quem é nem para quem: só veem o endereço do relay.
  Ela fica quando o Erevos fecha, selada no celular. As suas ficam no seu espaço, e só vão enquanto ele está aberto.
  Levar mensagens de outros fica ativado a menos que você desative **Levar mensagens de outras pessoas** em **Perto,
  sem internet**, na tela **Nova conversa**, e só para relays na internet com TLS (wss://): um desconhecido por
  perto nunca faz o seu celular, ou o seu relay, acessar um numa rede local ou no próprio celular. As suas próprias
  mensagens são levadas pelos celulares por perto que têm isso ativado.
- **Trazidas por outros celulares:** ao contrário, quando o seu celular não tem internet, um celular com Erevos ao
  lado que tem internet, e leva para os outros, pega o que espera por você no seu relay e entrega por perto. O Erevos
  pergunta uma vez sobre cada celular assim, também o de um contato, porque um desconhecido pode passar mensagens de
  um contato para parecer ele, e só enquanto está na frente: **Um celular perto de você tem internet. Ele deve trazer
  suas mensagens?** Esse celular fica sabendo de qual fila do seu relay é sua e de quando você a lê; nunca do que
  dizem suas mensagens, que só o seu celular abre. Sabendo a fila, ele poderia pegar suas mensagens antes que cheguem
  a você, então assim que o seu celular tiver internet de novo ele passa sozinho para uma fila nova e avisa seus
  contatos sem alarde. Para as conversas ocultas pergunta à parte, e só enquanto estão na tela, porque aquele celular
  saberia que há uma segunda fila, e portanto que pode haver conversas ocultas. Nunca para um relay alcançado só pelo
  Tor. O seu celular faz o mesmo pelos celulares ao lado enquanto **Levar mensagens de outras pessoas** está ligado,
  nunca enquanto vai pelo Tor, e de um relay diferente do seu só depois do seu sim, avisado de que esse relay então vê
  o endereço de internet do seu celular.

**Por quê:** um pacote não diz para quem é, então ninguém por perto consegue saber por ele de quem ele é. Até o celular
do seu contato responder numa conexão, o seu celular também não consegue saber qual dos celulares por perto é o dele:
então os pacotes curtos vão para todos eles, cada um os testa, e a partir do primeiro que abre, aquela conexão é a do
seu contato. Uma mensagem de voz, em pedaços maiores, espera por isso.

> Uma mensagem de perto só abre no espaço que tem esse contato. Uma para outro espaço deste celular espera na memória,
> seis horas no máximo, até esse espaço abrir. Uma para conversas ocultas só abre
> enquanto elas estão abertas, ou recebem fechadas, e até lá espera do mesmo jeito.

**Por quê:** as conexões por perto pertencem ao celular, não a um espaço, e nada nelas nomeia um: o que chega é testado
nas conversas do espaço que está aberto, e guardado por um tempo na memória para os outros, nunca gravado no celular.
As conversas ocultas também as usam, mas o que elas ouvem é delas: a conexão em que um contato oculto foi ouvido fica
separada da do espaço, só na memória e só enquanto essas conversas ocultas estão abertas ou recebem fechadas, então o
espaço nunca fica sabendo que um contato delas está por perto; e no ar as mensagens delas parecem as do espaço. Elas
nunca levam mensagens de outros, nunca são levadas por outros, e nunca vão por LoRa{~ nem por SMS}.

**Bluetooth que não dá para seguir:** o que seu celular emite por Bluetooth para os outros o acharem diz só que perto
há um celular com {=Erevos}, com um número aleatório que muda a cada nove a doze minutos, e no Android 8 e depois a partir
de um endereço que muda junto. Assim, quem escuta num lugar e depois em outro não consegue saber que é o mesmo celular,
pelo menos pelo Erevos. As conexões abertas continuam abertas. Celulares com um {=Erevos} mais antigo acham o seu, e o seu
acha eles, como antes.

## Por um rádio LoRa {#lora}

Com um rádio LoRa Meshtastic conectado ao celular por Bluetooth, o Erevos chega a outro Erevos com um rádio na mesma
malha, a quilômetros, sem internet: direto, ou pelos rádios Meshtastic que houver no caminho. Fica desativado a menos
que você configure um rádio, e só no Android.

1. Configure o rádio primeiro no app Meshtastic, sobretudo a **região** dele: sem ela ele não transmite nada. Depois
   feche o app Meshtastic, ou desconecte-o lá: um rádio se conecta a um app de cada vez.
2. Abra **Configurações** → **Relay e redes** → **Rádio LoRa**, toque em **Encontrar meu rádio**, leia o que ele diz e
   toque no seu rádio quando ele aparecer. Um rádio ainda não pareado pede o PIN: ele aparece na tela do rádio, ou é
   123456.
3. O seu contato faz o mesmo com o dele, na mesma malha: a mesma região e o mesmo primeiro canal.
4. Escreva como sempre. Quando o relay não está acessível e não há nenhum celular por perto, um texto vai por LoRa, e
   a linha abaixo da conversa diz isso.

- **Só texto, e devagar:** uma mensagem vai em pedaços de cerca de 220 bytes, cada um um ou dois segundos no ar, e a
  lei só permite a um rádio um certo tempo no ar (na UE, um décimo de cada hora). Por isso o LoRa só leva textos e
  apagamentos, e só quando nada mais os leva. Mensagens de voz, fotos e arquivos esperam na conversa, marcados
  **Aguardando**, e vão sozinhos assim que o relay ou um celular por perto puder levá-los; as chamadas também precisam
  de um deles. A primeira mensagem para um contato demora mais, pois leva as chaves.
- **Marcas:** **✓✓** chega com a próxima mensagem da outra pessoa, pois as marcas sozinhas não vão por LoRa.
- **Peças de reserva, e textos longos compactados:** uma mensagem de duas peças ou mais vai com peças de reserva
  depois dela, uma para cada quatro, para que o Erevos do seu contato refaça as peças perdidas no caminho, sem
  reenviar nada; elas ocupam um pouco mais de tempo no ar. Um texto longo vai compactado, menor e sem perder nada,
  para um contato cujo Erevos lê mensagens compactadas, então ocupa menos peças, ou chega a caber; um curto vai como é.
- **Para todos os rádios ao alcance:** cada mensagem é ouvida por todos os rádios ao redor, e repassada pelos rádios
  Meshtastic, como o Meshtastic faz. Todo Erevos a testa; só o do seu contato a abre. Nada é levado para outros por
  LoRa.
- **O nome dele e onde está:** os rádios Meshtastic anunciam de vez em quando o nome deles a todos os rádios ao
  alcance, e onde estão se tiverem GPS ou uma posição fixa, às claras. O Erevos impede o seu de fazer isso (**Em
  sigilo**): define a função dele como Client hidden, desliga o GPS e remove uma posição fixa. Ele ainda responde a um
  rádio que pergunta o nome dele, então dê a ele um nome que não diga nada sobre você, no app Meshtastic. **Anunciados
  a todos ao alcance** devolve a função e o GPS dele, depois de um aviso; uma posição fixa volta a ser definida no app
  Meshtastic. Se o rádio não mantiver as configurações, a tela do LoRa diz isso.
- **Ele continua conectado** enquanto o Erevos roda, e se conecta de novo sozinho quando o rádio volta ao alcance.
  **Desativar o LoRa** devolve ao rádio a função e o GPS dele, se estiver conectado, e depois o desconecta e o
  esquece. As conversas ocultas nunca vão por LoRa.

**Por quê:** o que um rádio Meshtastic diz de si mesmo vai às claras, para qualquer um que esteja ouvindo a
quilômetros: o nome dele e onde está poderiam mostrar onde você está e ligar o rádio a você, então o Erevos o mantém em
sigilo a menos que você escolha o contrário. E como a lei só permite a um rádio um certo tempo no ar, o LoRa fica
reservado para os seus próprios textos, quando nada mais pode levá-los, nunca para o que outros celulares o fariam
levar.

> Um rádio LoRa é ouvido a quilômetros, e o sinal dele pode ser rastreado até onde ele está, em sigilo ou não. O que o
> Erevos envia continua criptografado de ponta a ponta, mas qualquer pessoa com um rádio consegue saber que o seu
> transmite, quando e quanto. Com **Anunciados a todos ao alcance**, qualquer pessoa com um rádio também pode ler o
> nome dele e onde ele está.

## Conversar por um relay {#relay}

Um relay é um pequeno servidor que guarda filas de mão única: cada celular tem a sua própria fila, e quem tem o **link
de contato** dele pode deixar mensagens nela. O relay não guarda contas, nomes nem números de telefone, e não consegue
ler as mensagens: elas são criptografadas de ponta a ponta, e só os dois celulares têm as chaves. Cada celular pode usar
um relay próprio: uma mensagem para um contato em outro relay é selada para o relay dele e entregue ao seu, que a
repassa, então o relay dele nunca vê o endereço do seu celular. Um celular sem relay ganha um lugar no relay do
contato, veja **Sem relay próprio** abaixo.

**Por quê:** com filas e sem contas, nenhum servidor guarda uma lista de quem conhece quem, e ninguém precisa do seu
número de telefone ou e-mail para chegar até você: quem tem o seu link de contato pode escrever na sua fila, e só você
a lê.

1. Na tela inicial, toque em **Nova conversa**. Enquanto algo estiver faltando, no topo **Como você se conecta agora** diz em palavras simples como os
   seus contatos chegam até você: pelo seu relay, pelo Nostr sem relay, ou só por perto; quando tudo funciona, ele não
   aparece. Com um relay, um campo bem no topo encontra um contato pelo nome ou adiciona um link colado nele, e embaixo
   vêm **Seu código QR**, com **Já tem {=Erevos}** e **Novo no {=Erevos}** acima, e linhas para **Seu link de contato** e mais; um celular ainda
   sem relay começa com **Comece com um convite**. As
   configurações do próprio relay ficam em **Para usuários avançados**, embaixo; **Configurações** → **Relay e redes**
   → **Relay** abre Nova conversa com elas abertas.
2. Em **Para usuários avançados**, digite o **Endereço do relay**: \`ws://<endereço do computador>:7879\` para um relay
   na sua própria rede, ou \`wss://relay.example.org\` para um na internet. Adicione o **Token** se o relay pedir um.
3. O Erevos cria a sua fila nele sozinho, alguns segundos depois, e diz **Fila no relay criada**: tudo funciona, textos, fotos, mensagens de voz,
   chamadas e grupos, e **Como você se conecta agora** some, pois não falta nada. Se não conseguir, o aviso diz o porquê; **Criar minha fila no relay**, sob o endereço, tenta de novo.
4. **Seu código QR** fica na própria Nova conversa, assim que ela abre. Deixe o outro celular lê-lo com a câmera, e
   depois abrir o link no Erevos. A tela **Adicionar um contato** mostra o que ele contém: toque em **Adicionar à
   conversa** só se você mesmo o leu. **Adicionar e vincular a um dos meus contatos** também adiciona a pessoa,
   vinculada ao contato que você escolher, cujo nome a conversa recebe.
   O código é curto, então qualquer câmera o lê. Quem o lê responde com o próprio link de contato, e depois este celular escreve para a pessoa primeiro. O código é novo cada vez que Nova conversa abre, e vale uma vez: quem o ler primeiro vira contato na hora; quem o ler depois, ou pegar o link que você compartilha, escreve primeiro um pedido de mensagem. **Código QR grande, sem internet** mostra o código inteiro no lugar, que funciona por perto sem internet, e **Código QR pequeno** volta atrás. **Compartilhar**, embaixo, envia um link curto que qualquer app deixa tocar; no Android ele abre o Erevos, que pergunta antes de aceitá-lo. Para adicionar alguém com o código QR de contato dela, seu celular precisa antes de um relay.
   Este código QR só funciona se os dois celulares tiverem um relay, como diz o cartão. Para alguém que ainda não tem
   o {=Erevos}, ou cujo celular não tem relay, escolha em vez disso **Novo no {=Erevos}**, acima: o cartão mostra **Convite
   para o {=Erevos}**, um convite com o qual o celular da pessoa entra no seu relay, como em Convidar alguém novo, mais
   abaixo. Nova conversa mostra o que você escolheu por último.
   O mesmo vale por toque: enquanto o código pequeno de contato aparece e o NFC está ligado no Android, o outro celular
   o pega se você encostar a parte de trás dele na do seu. Só funciona com o Erevos em primeiro plano, não em segundo
   plano, e nunca com o código QR grande.
5. Se a câmera da outra pessoa mostrar só o texto, ou se ela estiver longe, toque em **Compartilhar** embaixo do seu
   código QR, ou abra **Seu link de contato** e toque em **Compartilhar meu link de contato**, e envie para ela. Ela cola
   o link no campo do topo de **Nova conversa** e toca em **Adicionar**.
6. Ou ao contrário: toque em **Ler o da outra pessoa**, embaixo do seu código QR, e tire uma foto do código QR na tela
   dela, ou toque em **De uma foto do código QR da outra pessoa** para uma captura de tela ou uma foto dele que ela
   tenha enviado. O Erevos o lê e a adiciona na hora. Num computador, no Sailfish OS e no app web, **Ler o da outra
   pessoa** pede uma foto dele; num iPhone ele também oferece a câmera.
   As conversas ocultas também têm os dois; ali o campo do topo aceita só um link.
7. Ou, com alguém ao seu lado ou ao telefone: toque em **Emparelhar com um código** em **Nova conversa**. Um toca em
   **Mostrar um código** e diz ou mostra os 8 dígitos; o outro toca em **Digitar o código dele** e os digita. Então cada
   telefone tem o outro como contato, como se cada um tivesse lido o código QR do outro. O código em si nunca sai dos
   telefones: eles provam um ao outro que o conhecem, e os links de contato vão criptografados com uma chave que só o
   mesmo código dá. Eles se encontram em relays públicos do Nostr, que não veem nem o código nem os links, e quem tenta
   adivinhar tem 3 tentativas antes de o código fechar. Um código vale 10 minutos.

A nova conversa aparece na tela inicial com o nome **contato** e os primeiros caracteres da chave da pessoa, até ter um
nome: **Renomear** nos detalhes dela dá um. Logo depois de adicioná-la aqui, **Vincular a um dos meus contatos**, abaixo
do aviso de que ela foi adicionada, permite escolher um dos seus contatos (**Agora não** deixa como está): a conversa
recebe o nome desse contato, se não tiver um próprio, e o cartão do contato mostra a conversa. As conversas ocultas só
oferecem os próprios contatos, nunca os do celular. Basta que um celular adicione o outro: adicionar um link começa uma
conversa criptografada e diz ao outro celular como responder, então ele lista a conversa na próxima vez que olhar a
sua fila, o que faz a cada poucos segundos.

**O que o relay vê de uma conversa:** todos os seus contatos escrevem na sua única fila. Depois que cada celular recebeu
uma mensagem do outro, toda mensagem entre eles é selada mais uma vez para o celular a que se destina, com uma chave que
esse celular deu dentro da conversa, então para o relay cada uma é um punhado de bytes aleatórios de um entre poucos
tamanhos, e ele não consegue saber por elas a que conversa pertencem. A primeira mensagem de uma conversa, e as enviadas
antes de a resposta chegar, ainda o mostram. O relay ainda vê que endereço coloca cada mensagem, e quando. E cada uma
diz ao relay, num byte que ele lê, o que carrega: uma mensagem que alguém lê, uma comunicação entre celulares (que uma
mensagem chegou ou foi lida, digitando, estar online, reações, chaves novas), ou uma chamada que toca. Então o relay vê
quais são mensagens, e quando uma chamada começa, estejam as notificações ativadas ou não: é assim que o aviso de um
app web fechado consegue contá-las, e o aviso das conversas ocultas fechadas.

### Formas de entrar no relay

Um relay que pede um token deixa um celular entrar de três formas. Cada forma termina com um token próprio do celular
ali, então quem cuida do relay pode tirar qualquer celular sozinho.

- **Um convite:** um código QR ou link de um celular que já está no relay (veja Convidar alguém novo abaixo). Nada para
  digitar, e vocês viram contatos na hora.
- **Uma conta:** **Entrar com LPHL**, quando o relay oferece (veja Entrar no relay abaixo). Qualquer conta LPHL pode,
  em até 10 celulares.
- **O token do relay:** o token único para todos, de quem cuida do relay, digitado em **Token**. O Erevos o troca na
  hora, sozinho, por um token próprio do celular, com o nome que você usa para si nos convites (\`phone\` quando você
  não deu nome), avisa, e a partir daí só usa esse. Assim este celular também pode convidar. Precisa de um relay que
  aceite convites, de depois do Erevos 3.1.0; com um mais antigo, ou um que não aceita convites, o celular fica com o
  token do relay e não pode convidar.
- **Os limites:** um celular pode ter 5 convites aguardando ao mesmo tempo e fazer 10 por dia (o dia em UTC); cada um
  é para um celular e dura 7 dias. O relay deixa entrar 100 celulares por convite no total, contando também os convites
  ainda aguardando, a menos que o operador dele tenha escolhido outra coisa. Os celulares que entraram com uma conta ou
  com o token do relay não contam nesses 100: o relay dá um token próprio a 50 celulares por dia que vieram com o token
  dele, e uma conta tem 10 celulares. O relay atende 512 conexões ao mesmo tempo, sejam de quem forem, a menos que o
  operador dele tenha escolhido outra coisa.
- **Tirar um celular:** quem cuida do relay apaga a linha dele no arquivo de tokens do relay: ele não pode mais usar o
  relay, enquanto os celulares que ele convidou ficam com o deles. Se ele já teve o token do relay, também trocam esse
  token, para que ele não possa voltar com ele. Os celulares com token próprio seguem como estão: só um celular com o
  token antigo ainda digitado (não aberto desde então, ou com um {=Erevos} mais antigo) precisa do novo.
- **As conversas ocultas** mantêm o token do relay digitado para elas: trocá-lo no mesmo momento que o do espaço
  mostraria ao relay que elas são deste celular. Quando o token do relay mudar, digite o novo no **Para usuários
  avançados** delas.

**Por quê:** o relay dá a cada conexão uma thread própria, então só atende um certo número ao mesmo tempo; e só
acrescenta um certo número de linhas por dia para celulares que vieram com o token único dele, para que um token que foi
parar onde não devia não possa encher o arquivo de tokens.

### Convidar alguém novo

Um código QR ou link traz alguém novo: o celular da pessoa entra no {=Erevos} no seu relay, com acesso próprio, sem digitar
nada, e vocês viram contatos um do outro na hora, sem pedido de mensagem.

- **Para convidar:** na tela inicial, toque em **Convidar** ao lado da linha do relay ou, em **Nova conversa**, escolha
  **Novo no {=Erevos}** acima do código QR. O código QR aparece na hora: quando o {=Erevos} está no celular da
  pessoa, ela o escaneia com a câmera e abre o link no Erevos, ou toque em **Compartilhar o convite** e mande o link a
  ela. Abaixo você pode digitar para quem é (o nome dela nas suas conversas) e **Seu nome, para essa pessoa**, ou
  deixar os dois vazios. Aberto de novo enquanto ninguém o pegou e ainda falta pelo menos um dia, mostra o mesmo
  convite, então não gasta nenhum dos 5 em espera nem dos 10 por dia; **Convidar outra pessoa** cria um novo. Ele vale
  para uma pessoa, por 7 dias, ou menos se o convite do relay acabar antes. Quem o
  pega primeiro fica com ele, então dê só a essa pessoa.
  Num celular Android com o NFC ligado você também pode entregá-lo por toque: encoste a parte de trás do celular da
  pessoa na parte de trás do seu enquanto o código aparece, e o celular dela abre o link sozinho, no Erevos se estiver
  instalado, ou então na página web do Erevos, que oferece o {=Erevos}. Se o NFC estiver desligado, a tela diz para ligá-lo
  nas configurações do Android.
- **Para entrar:** num celular ainda sem relay, **Nova conversa** começa com **Comece com um convite**. Toque em **Ler
  o código QR da outra pessoa** e tire uma foto do convite na tela dela, ou toque em **De uma foto do código QR da outra
  pessoa**, ou cole o link no campo dali e toque em **Entrar**; ler o convite com a câmera e abrir o link no Erevos
  também funciona. O link abre **… convida você para o {=Erevos}**: toque em **Entrar** só se ele veio dessa pessoa. O
  Erevos obtém acesso próprio ao relay dela e uma fila ali, adiciona a pessoa e diz **Boas-vindas ao Erevos**. A
  primeira mensagem dele avisa o celular da pessoa, que adiciona este como contato na hora, com o nome que ela digitou.
- **As outras formas de entrar:** logo abaixo, **Para usuários avançados** abre as demais, para quem as procura:
  **Entrar com LPHL** faz o login deste celular no relay do LPHL com uma conta LPHL, no navegador (veja Entrar no
  relay abaixo), e depois você adiciona os seus contatos pelos convites ou links deles; **Começar sem relay**, como em
  Sem nenhum relay, em Pelo Nostr; e as configurações do relay, como de 1 a 6 acima. Um convite é a forma mais simples
  de entrar, e no relay um celular convidado tem só um nome de letras e números ao acaso.
- **Outro relay:** embaixo de **Entrar com LPHL**, **Entrar em outro relay…** recebe o endereço de outro relay, como
  quem cuida dele te passou, por exemplo relay.example.org: o cartão então faz o login lá, com o nome das contas que
  esse relay aceita, ou diz que não oferece login, e aí quem cuida dele pode te dar um convite. **Voltar para** traz de
  volta o do LPHL.
- **O que o seu relay precisa permitir:** o acesso próprio é um convite para o seu relay (veja Convites para o relay
  abaixo), então só vem de um celular com token próprio num relay que aceita convites. Ele conta entre os seus convites,
  com um nome de letras e números ao acaso, e continua mesmo quando o seu termina. Um celular com o token único do relay
  para todos troca-o primeiro por um próprio (veja Formas de entrar no relay acima); onde o relay não faz isso, ele não
  cria convite: entre no relay primeiro (abaixo do **Token**, em **Para usuários avançados**), ou aceite um convite para
  ele. Quando o seu relay não aceita convites, o convite ainda torna vocês contatos, e o celular da pessoa usa o seu
  relay só como o seu link de contato permite, como em Sem relay próprio abaixo.
- **Um celular que já tem relay** mantém o próprio: o convite só adiciona vocês, e vocês viram contatos na hora do
  mesmo jeito.
- **O que fica guardado:** o seu celular guarda o segredo de cada convite e o nome para a pessoa, selados no espaço,
  até ele ser usado ou terminarem os 7 dias dele, 20 no máximo ao mesmo tempo. Nada disso fica no relay além do convite
  para o relay.
- [~] **Por SMS, para alguém que ainda não tem {=Erevos}:** no Android, o cartão de um contato que não está no Erevos tem
  **Convidar por SMS**. Ele escreve um SMS para o primeiro número da pessoa com um link curto, no app de SMS (o do
  próprio Erevos quando ele é o app de SMS do celular), para você enviar ou não. A página do link no servidor web do
  LPHL oferece o {=Erevos} à pessoa (o app Android, ou o app web num iPhone) e depois abre o convite nele; no app web num
  iPhone, ela cola o link em **Tenho um convite**. Ela toca em **Entrar**: o celular dela entra no seu relay como acima
  e responde ao seu por ele, o que a adiciona, vinculada a esse número e com o nome do cartão. A primeira mensagem dele,
  que vai sozinha, torna você contato dela, com o nome que você usou para si no seu último convite. O convite vem
  depois do **#** no link, que não é enviado a nenhum servidor web, mas a operadora vê o SMS, como todo SMS: por isso é
  para uma pessoa, por dois dias, e quando os dois dias acabam sem nenhum celular tê-lo usado, o seu celular revoga o
  convite dele para o relay. Precisa de um relay que deixe o seu celular convidar, como acima.

### Sem relay próprio

Um celular sem relay conversa pela internet do mesmo jeito: ao adicionar o link de um contato cujo relay empresta
lugares, ele pega um lugar ali, sem token.

- **Como:** adicione o link da pessoa como nos passos 4 e 5, sem nada em **Relay**. O Erevos diz que agora você tem um
  lugar no relay dela, emprestado pelo link dela, e a partir daí o usa como seu: o seu próprio link o nomeia, então
  outras pessoas também chegam até você ali.
- **Quem empresta:** o seu link leva um bilhete para um lugar no seu relay só quando você ativa **Compartilhar um lugar
  no meu relay com este link**, em **Seu link de contato** na tela **Nova conversa**, e só para o link mostrado
  naquele momento: na próxima vez que ela abrir, estará desativado de novo. O relay precisa de uma chave para o envio
  em dois saltos, e só empresta depois que quem cuida dele ativa o empréstimo; essa pessoa também pode revogar os
  lugares de um bilhete. Um bilhete dura 30 dias e dá até quatro lugares. Qualquer pessoa que vê um link com bilhete
  pode pegar um lugar com ele, então dê esse link só a quem você quer.
- **O que um lugar emprestado não faz:** as mensagens para contatos em outros relays vão direto ao relay deles, que
  então vê o endereço do seu celular. Ele não guarda nada para depois (uma mensagem enviada mais tarde espera no
  celular), não dá relay de chamadas (as chamadas vão direto entre os celulares), e cria no máximo mais 4 filas e envia
  no máximo 50 MB de arquivos por dia. O seu link não empresta nada adiante.
- **O seu próprio relay, em vez disso:** digite o endereço dele em **Relay**: o lugar emprestado é liberado, e os
  contatos ficam sabendo do novo pela sua próxima mensagem.
- **Um link sem bilhete** (de um relay ou Erevos mais antigo): um relay que não pede token é usado como está; senão
  vocês só se alcançam por perto, até você ter um relay.

**Por quê:** um link com bilhete é uma chave do seu relay para quem o vê, então o seu link só leva um quando você
escolhe, para o link mostrado naquele momento, e o relay só empresta depois que quem cuida dele permite. Os arquivos de
um lugar emprestado ficam limitados a umas poucas fotos e mensagens de voz por dia, para que ele nunca ocupe todo o
armazenamento do relay.

### Convites para o relay

Um celular com token próprio num relay que aceita convites pode deixar mais um celular usar esse relay, com um token
próprio desse celular, para que nenhum token seja digitado ou repassado.

- **Para convidar:** em **Para usuários avançados** na tela **Nova conversa**, abaixo do **Token**, toque em
  **Convidar para o relay**, digite para quem é e toque em **Criar o convite**. Abre-se um código QR: deixe o celular
  da pessoa lê-lo com a câmera e abrir o link no Erevos, ou toque em **Compartilhar o convite** e envie para ela. Vale
  para um celular por 7 dias, e quem o pegar primeiro fica com ele, então mostre só para ela.
- **Para aceitar um:** o link abre **Convite para um relay**, com o endereço do relay: toque em **Usar este relay** só
  se ele veio de alguém que você conhece. No Erevos, **Ler o da outra pessoa** e **De uma foto do código QR da outra
  pessoa** em Nova conversa também leem um convite, e o link dele pode ser colado no campo do topo. O Erevos cria um token
  para este celular, guarda-o com o endereço do relay só neste espaço e cria a sua fila ali. Se o celular usa outro
  relay, ele pergunta antes, e os contatos ficam sabendo da sua nova fila pela sua próxima mensagem. O Erevos aceita um
  convite para um relay wss://, ou para um ws:// só numa rede doméstica (como \`ws://192.168.1.10:7879\`). As conversas
  ocultas não aceitam convites.
- **Seus convites:** listados abaixo do botão, aguardando ou em uso. **Revogar** revoga um que ainda está aguardando, ou
  corta na hora o celular que o pegou, só ele: os celulares que ele convidou por sua vez ficam com o deles.
- **O deles fica:** um celular que você convidou fica com a linha dele no relay mesmo quando a sua cai, porque o celular
  que convidou você a revogou, a conta com que você entrou não pode mais usar o relay, ou o operador dele a tirou, e o
  mesmo vale para os celulares que ele convidou. Só os seus convites ainda aguardando não deixam mais ninguém entrar.
- **O que o relay guarda:** para aquele celular um nome de letras e números ao acaso, que não diz nada de quem ele é (o
  nome que você digitou fica no seu celular; um Erevos anterior ao 6.0.0 dava esse nome ao relay, em letras latinas),
  que você o convidou, e uma impressão digital do token dele, não o token. Quem cuida do relay vê isso, e pode tirar
  qualquer celular dele. Um celular pode ter 5 convites aguardando ao mesmo tempo, e fazer 10 por dia, e o relay só
  deixa entrar um certo número de celulares por convite (100, a menos que o operador dele tenha escolhido outra coisa).
- **Quem pode convidar:** um celular com token próprio, num relay cujo operador ativou os convites (veja
  [Rodar o seu próprio relay](#own-relay)). Um celular com o token único do relay para todos troca-o primeiro por um
  próprio (veja Formas de entrar no relay acima). Com um lugar emprestado não há **Convidar para o relay**.

**Por quê:** o relay guarda só uma impressão digital de cada token, nunca o token, então o arquivo dele não diz a
ninguém como se conectar. E um convite nomeia um relay wss://, ou um ws:// em casa, então ele nunca pode mandar os
pedidos do seu celular pela internet às claras.

### Entrar no relay

Um relay pode deixar os celulares entrarem com uma conta em que o operador dele confia, como a do LPHL, em troca de um
token próprio, sem nada para digitar no Erevos.

- **Para entrar:** digite o endereço do relay em **Relay**. Quando o relay oferece, **Entrar com LPHL** aparece abaixo
  do **Token**. Toque nele: o navegador abre a página de login, onde você digita o seu nome e a sua senha, que o
  Erevos nunca vê. A página do relay mostra então seis dígitos. No Android, toque ali em **Abrir o {=Erevos}** e o Erevos
  conclui o login sozinho; caso contrário, digite-os como descrito a seguir. De volta ao Erevos, que leva você direto
  para **Código da página**, digite-os ali e toque em **Concluir o login**: o celular guarda o token dele com o
  endereço do relay só neste espaço, e cria a sua fila ali. Digite o código só no Erevos do seu próprio celular e não
  o dê a ninguém, mesmo que peçam: quem o digitar usa o relay como você. Depois de 5 códigos errados o login acaba:
  entre de novo. O Erevos só abre uma página de login no próprio endereço do relay, por https.
- **Entrar de novo** no mesmo celular substitui a linha dele no relay, quando o token dele é o que ele recebeu desse
  relay. Cada celular recebe uma linha própria, 10 no máximo para uma conta.
- **O que o relay e o LPHL veem:** o relay dá à linha do celular o nome do seu usuário (\`lphl:nekten\`), e a cada hora
  pergunta ao LPHL se a conta ainda pode usá-lo: assim que a conta é fechada ou desativada, ou o LPHL não pode ser
  consultado por 3 dias, a linha cai, e o celular não pode mais usar o relay; os celulares que ele convidou ficam com o
  deles. O LPHL vê cada login e essas verificações, mas nada dos seus espaços, conversas ou contatos. Entrar a partir de
  outro espaço com a mesma conta mostra ao relay que os dois são seus.
- **As conversas ocultas** não fazem login.

**Por quê:** a página mostra o código e você o digita no Erevos, não o contrário, então um link de login que outra
pessoa envie a você não rende nada a ela: só quem entrou vê o código, e cinco errados acabam com o login. O Erevos só
abre uma página de login no próprio endereço do relay, por https, então nada que responda no lugar do relay pode
mandar você para uma página em outro lugar. E um provedor que não pode ser consultado por um tempo não corta nenhum
celular na hora: só 3 dias sem uma resposta válida cortam. E o botão **Abrir o Erevos** é igualmente seguro: o link
contém só os seis dígitos, que não reivindicam nada sem o segredo que só o celular que iniciou o login tem, então um
app que pegasse o link não obtém nada.

### A própria chave do relay

Assim que o Erevos conhece a chave do seu relay (ele pergunta ao relay na primeira vez, ou um link de contato a
informa), toda conexão com esse relay começa com uma verificação: o relay tem de provar que tem essa chave, e o token e
tudo o que vem depois vão criptografados para essa chave, dentro da própria criptografia da conexão (TLS). Em **Como
você se conecta agora**, o Erevos diz então que o seu relay provou a própria chave. A partir daí, este espaço nunca mais
acessa esse relay sem a verificação.

- Um relay mais antigo que este app não prova nada: funciona como antes, e **Como você se conecta agora** diz que ele é
  mais antigo. O Erevos tenta de novo a cada hora.
- Um relay que não consegue provar a chave que o Erevos guarda para ele não recebe nada, e as suas mensagens esperam;
  **Como você se conecta agora** diz isso em vermelho. Só se o operador dele lhe disse que ele tem uma chave nova,
  toque em **Ele tem uma chave nova**: o Erevos então aceita a chave que o relay der em seguida.

**Por quê:** o certificado da conexão diz só que quem responde tem um certificado para o nome do relay, que uma empresa
que emite certificados também pode dar a outra pessoa, por engano ou quando obrigada. A própria chave do relay só está
no servidor dele, então ninguém no meio pode se passar por ele, e um certificado renovado não muda nada.

### O número de segurança

Abra a conversa, toque no nome dela e depois em **Número de segurança**. Os dois celulares mostram os mesmos 60 dígitos
para vocês dois. Comparem pessoalmente ou numa chamada: se forem iguais, não há ninguém no meio. Se forem diferentes,
não confie nessa conversa, e adicione o link de novo, lido do próprio celular da pessoa. Depois que ela tiver conectado
um dispositivo, ele também diz quando a lista de dispositivos dela mudou pela última vez: as suas mensagens também vão
para cada lugar dessa lista, então se ela não conectou nem desconectou um nessa época, pergunte a ela.

Lado a lado, vocês podem conferir com códigos em vez de ler os dígitos: abaixo do número, cada celular mostra um
código QR. Toque em **Tirar foto do código dela** e fotografe o código no celular da pessoa; depois deixe que ela faça
o mesmo com o seu. Quando bate, a linha diz **Conferido pessoalmente**. Cada celular marca o outro só pelo que ele
mesmo viu, e nada é enviado. Se disser que não bate, pode haver alguém no meio: não confie nessa conversa. **Escolher
uma foto do código dela** confere, em vez disso, uma foto do código que você já tem. A marca **Conferido
pessoalmente**, com o dia, fica até você tocar em **Tirar a marca**. Ela fica neste celular, vai com a conversa quando
ela entra nas conversas ocultas ou sai delas, e não é passada para os seus dispositivos conectados. Um código de um
{=Erevos} mais novo avisa: atualize o Erevos e tire a foto de novo.

**Por quê:** o código tem só um hash das duas chaves, numa ordem que distingue os dois celulares, então uma foto da
sua própria tela não confere nada, e uma foto do código não diz quem vocês são a quem não tem as duas chaves.

### Apresentar dois contatos

Nos detalhes da conversa de um contato, **Apresentar a um contato** deixa você escolher outro dos seus contatos e
**Perguntar aos dois**. Cada um é perguntado na sua conversa com ele, por uma mensagem que cita o outro com o nome que
você deu; os dois precisam de um nome. Cada um responde **Dizer sim** ou **Dizer não** nessa conversa. Só se os dois
disserem sim eles viram contatos: aquele de cuja conversa você fez a apresentação escreve primeiro, e o celular do
outro o aceita na hora, com o nome que você deu. Se um disser não, nada acontece, e o outro não fica sabendo. Uma
apresentação espera uma semana.

**Por quê:** tudo vai dentro da criptografia das suas conversas com cada um, então nenhum relay vê quem é apresentado
a quem. Você só repassa o link de contato que o segundo escolheu dar, depois de dizer sim. Como quem apresenta poderia
fazer passar outra pessoa, compare o número de segurança com o novo contato como com qualquer outro.

### Enviada, chegou e lida

Acima da primeira mensagem de cada dia, em todas as conversas, também nos grupos e na Conversa comigo, o dia aparece
em destaque: **Hoje**, **Ontem**, o dia da semana na última semana e, antes disso, o dia da semana com a data, como
**Terça-feira, 10 de novembro**.

Abaixo de cada uma das suas mensagens para um contato, **✓** diz que o relay ou um celular por perto a pegou, **✓✓**
que ela chegou ao celular da pessoa, e **✓✓✓** que a pessoa a leu. O celular dela avisa o seu, dentro da criptografia,
na próxima vez que cada um olhar o relay, ou na hora quando estão perto. Uma mensagem conta como lida assim que a
conversa dela aparece na tela. **Marcar tudo como lido** no menu ⋮ conta do mesmo jeito: os celulares deles são avisados
na próxima olhada no relay.

Em um grupo que não é público, as suas mensagens têm as mesmas marcas, para todos os outros membros juntos: **✓**
depois de enviada, **✓✓** quando a mensagem chegou ao celular de cada membro que estava no grupo quando você a enviou,
e **✓✓✓** quando todos a leram. O celular de cada membro avisa o seu, numa mensagem de grupo silenciosa destinada só a você, criptografada de ponta a ponta como o resto do grupo: que a mensagem chegou, alguns segundos depois (junto com
as outras que chegaram nesse meio-tempo, numa só), e que foi lida, assim que o grupo aparece na tela. Segure uma
mensagem sua e escolha **Quem leu** para ver quem a leu e quando, em que celular ela chegou e quando, e quem ainda não
fez nem uma coisa nem outra, em **Ainda não**. Um membro cujo {=Erevos} é mais antigo que estas marcas não avisa nada,
então fica em **Ainda não** e a mensagem fica em **✓**. Os grupos públicos não têm marcas. Um computador conectado a
este celular mostra as mesmas marcas.

- **Enviando…:** no momento em que você toca em Enviar, o celular dá uma vibração curta, o campo se esvazia e a
  mensagem aparece, marcada **Enviando…** até o relay ou o celular da pessoa pegá-la. Se ela não puder ir nem puder
  esperar, as palavras dela voltam para o campo. Sair da conversa enquanto ela mostra **Enviando…** não a perde: ela
  vai, ou fica marcada **Aguardando**.
- **Aguardando:** uma mensagem que nada pôde pegar, porque o relay não está acessível e o celular da pessoa não está
  perto, fica na conversa marcada **Aguardando**, e vai sozinha, em ordem, assim que o relay ou o celular da pessoa por
  perto puder pegá-la, enquanto um espaço estiver aberto; então ela mostra **✓**. Um texto aguarda na hora. Uma
  mensagem de voz, foto ou arquivo pergunta antes: **Deixar aguardando** ou **Apagar**. Uma mensagem aguardando é
  apagada só neste celular. Nas conversas ocultas ela também aguarda, mas vai só pelo relay delas, nunca para o celular
  por perto nem por LoRa: enquanto elas estão abertas, ou, com **Receber quando fechadas** ativado, enquanto o espaço
  está aberto. Quando a fila do contato no relay está cheia, um texto, mensagem de voz, foto ou arquivo ainda vai para
  os dispositivos conectados dele, se tiver algum, aparece como enviado, e é tentado de novo para o celular dele
  enquanto as conversas ocultas ficam abertas: se forem fechadas antes de ele ir, o celular da pessoa nunca o recebe.
- **Enviar mais tarde:** segure a seta de enviar e escolha **Mais tarde…**, ou toque em **+** e depois em **Enviar mais
  tarde**. Escolha um horário com um toque (**Daqui a 1 hora**, **Hoje à noite 20:00**, **Amanhã 09:00**) ou o dia, a
  hora e os minutos, até um ano à frente, depois **Enviar mais tarde**. A mensagem fica na conversa marcada
  **Agendada** com o horário dela. Ela vai criptografada para o relay, que a guarda e a envia nesse horário, mesmo que
  este celular esteja desligado ou bloqueado então, e o celular da pessoa a mostra a partir desse horário, não antes.
  Sem nenhum relay acessível agora, ela espera neste celular e vai para o relay assim que algum estiver acessível. Sem
  nada digitado, o horário que você escolhe vale para a próxima foto, arquivo ou mensagem de voz: uma foto ou arquivo
  vai para o seu relay na hora e fica lá até a pessoa pegá-lo, 14 dias depois do horário no máximo. As conversas
  ocultas também têm isso, do mesmo jeito, pelo relay delas. Até o horário dela, apague-a para tirá-la do relay, e ela
  nunca vai. Se a fila do relay da pessoa mudar antes disso, o Erevos a guarda de novo para a nova na próxima vez que
  acessar o relay. Com um token próprio deste celular, ela só vai se o celular ainda tiver a sua linha nesse relay
  então. Uma mensagem sem som continua sem som. Um relay de antes disso não guarda nada para depois: então a mensagem
  espera neste celular e vai no horário dela enquanto o Erevos roda, também em segundo plano enquanto **Em segundo
  plano** está em **Receber e tocar** (abaixo), ou quando o Erevos abrir de novo.
- **Mensagem de segurança:** digite-a, toque em **+** e depois em **Mensagem de segurança**, e escolha por quanto
  tempo: 6 ou 12 horas, 1, 2 ou 3 dias, ou uma semana. Ela vai para o relay na hora, como uma enviada para mais tarde, e
  o relay a envia sozinho nesse horário. Cada vez que você abre o Erevos, depois da senha, ela é adiada de novo por esse
  mesmo tempo, então só sai se você não abrir o Erevos a tempo: se o celular for perdido, levado, quebrar ou ficar sem
  internet, ou se algo acontecer com você. O Erevos rodando em segundo plano não a adia, nem a tela de senha dele, nem
  uma janela deixada aberta que ninguém tocou ou em que ninguém digitou por 10 minutos. Nas conversas ocultas ela é
  adiada enquanto o lugar delas recebe, ou quando você a abre. Na conversa ela aparece marcada como **Mensagem de
  segurança** com o horário em que sairia; apague-a para pará-la. Escreva-a de modo que diga o que é: para o seu contato
  ela chega como uma mensagem comum. Se o relay não puder ser alcançado quando você abrir o Erevos, ela mantém o
  horário. Ela é criptografada uma só vez e vai de novo para o relay como está cada vez que é adiada, então não custa
  nada à sua conversa.
  **Por quê:** uma mensagem guardada pelo relay não precisa de nada deste celular para sair, então quem levar o
  celular não consegue pará-la, a não ser abrindo o Erevos com a senha.
- **Enviar sem som:** segure a seta de enviar e escolha **Sem som**: o celular da pessoa mostra o aviso sem som nem
  vibração. Um Erevos de antes disso não conhece isso e toca como sempre, e o Erevos como app web também, cujo aviso
  vem do navegador. O mesmo vale para o aviso de uma posição de conversas ocultas que está fechada, com **Avisar
  quando chega uma mensagem** ativado, e para o de um espaço fechado com **Também enquanto outro espaço está aberto**:
  eles só perguntam ao relay quantas chegaram, e o relay não consegue distinguir uma sem som de outra, pois só a
  mensagem criptografada diz isso.
- **Links:** um endereço web numa mensagem fica sublinhado, também um simples como t.me/name ou example.org/page, como
  o Telegram e o Signal os mostram; um endereço de e-mail ou o nome de um arquivo (photo.jpg) não. Toque nele e o
  Erevos o mostra inteiro, para abrir no navegador só se for para onde você quer ir. Nada é buscado antes disso.
- **Compartilhar de outro app** (Android): no **Compartilhar** de outro app, como o do navegador para uma página,
  escolha **Erevos**. Assim que um espaço estiver aberto, **Enviar para** lista as conversas{~, os grupos e as conversas
  de SMS| e os grupos} que a tela inicial mostrou por último, depois todas as outras conversas e grupos{+, e as conversas das suas
  contas de Matrix, XMPP e Nostr}, com uma busca; nunca as conversas ocultas. Palavras e links abrem no campo de
  mensagem da que você escolher, para ler e enviar ali; uma foto ou um arquivo vai assim que essa conversa ou grupo
  abrir, uma foto na qualidade que você escolheu para as fotos{~, e nunca como SMS}. Um arquivo pode ter no máximo 100 MB{+
  numa conversa do Erevos, 50 MB no Matrix e no XMPP e 20 MB no Nostr}. Ele é criptografado assim que chega, com uma
  chave só na memória do Erevos, e espera assim no celular, também enquanto você digita a senha se o Erevos bloquear
  antes; é removido depois do envio, ou quando você sai de **Enviar para**.
- **A pessoa vê quando você lê:** o seu celular avisa o dela, como o dela avisa o seu, a menos que essa conversa
  apareça offline (abaixo).
- **Quando chegam mensagens:** o Erevos olha o relay a cada poucos segundos enquanto está aberto e desbloqueado, em
  qualquer tela, e a tela inicial leva a conversa para o topo sozinha. No Android, cada mensagem nova toca, com um
  aviso que diz só quantas chegaram, também enquanto o Erevos está na tela; na conversa ou grupo aberto na tela só toca
  o som, e abrir uma conversa tira da contagem o que chegou ali. Digitar, e que uma mensagem chegou ou foi lida, não
  tocam nada. No Android isso continua também em segundo plano, enquanto **Em segundo plano** está em **Receber e
  tocar** (abaixo): ali ele espera no relay até algo chegar, um minuto de cada vez, em vez de perguntar a cada poucos
  segundos, e não pergunta mais nada quando nada chegou, para a bateria durar, e um aviso diz só quantas mensagens
  chegaram. Fechado, bloqueado, ou muito tempo em segundo plano de outra forma, não: as mensagens esperam no relay, até
  14 dias, e chegam quando o Erevos abrir de novo. Uma pergunta ao relay sem resposta a tempo (uma espera ali, o seu
  minuto e mais meio minuto, qualquer outra coisa 45 segundos, uma parte de um arquivo 2 minutos) conta como falha e é
  feita de novo, para que uma conexão que morreu no caminho, como quando a rede do celular dorme ou muda, não segure
  nada.

### Online, visto por último, e aparecer offline

Enquanto a conversa de um contato está aberta na sua tela, o Erevos pergunta de vez em quando ao celular da pessoa se
ela está aberta lá, e diz que a sua está. Se a dela estiver, a conversa diz **Online** abaixo do nome dela com um ponto
verde, e a tela inicial mostra o ponto na imagem dela. Escrever para alguém também mostra você online para essa pessoa
por dois minutos. Tudo isso vai dentro da criptografia, só entre você e esse contato: o relay vê uma mensagem de vez em
quando, como em qualquer conversa.

Quando um contato não está online, a conversa dele diz quando ele esteve com o Erevos aberto pela última vez, até o
minuto: **visto por último hoje às 14:32**. O seu celular diz o seu aos seus contatos do mesmo jeito, dentro do que já
vai para eles de qualquer forma (uma mensagem, ou que uma chegou), e uma vez quando um deles abre a sua conversa
enquanto o Erevos está fechado no seu celular, só se ele esteve aberto desde a última vez que foi dito. Fica
desativado em um espaço novo até você ativar, em **Configurações** → **Privacidade e segurança** → **Visto por
último**, ou nos detalhes de qualquer conversa; um espaço criado antes da 7.0.1 o mantém como estava, ativado a não
ser que você tivesse desativado. Vale nos dois sentidos: desativado, ninguém vê o seu, e você também não vê o de
ninguém; quem o via o perde com a sua próxima mensagem. É definido para todo o espaço e seus dispositivos conectados,
cada espaço separadamente. Cada lugar de conversas ocultas tem o seu próprio interruptor, nos detalhes de uma conversa
de lá, e a sua própria hora: enquanto estão abertas, só elas contam como abertas, não o espaço.

Com **Avisar quando eu abrir e fechar o Erevos** ligado (em **Visto por último**, ligado a não ser que você desligue), abrir o Erevos
também avisa seus contatos na hora, sem esperar uma mensagem: só aqueles com quem você conversou nos últimos 30 dias e
que também mostram o próprio horário, cada um depois de uma espera aleatória de até um minuto, no máximo a cada 15
minutos, nunca uma conversa que aparece offline nem uma solicitação de mensagem. Quando o Erevos fecha, ou as
conversas ocultas dele, quem foi avisado enquanto estava aberto fica sabendo na hora quando fechou, então o **Visto por
último** dele é esse horário. O relay então vê algo ir para eles quando você abre e fecha o Erevos, então pode saber
quando você faz isso: desligue, e seu horário vai só com o que já vai para
eles de qualquer forma.

Enquanto você digita para um contato que aparece online, a conversa dele mostra **digitando…** abaixo do seu nome por
alguns segundos, e a sua abaixo do nome dele quando ele digita. Isso é dito no máximo a cada poucos segundos, só
enquanto ele aparece online, nunca para uma solicitação de mensagem, e não nos grupos.

**Por quê:** estar online só é dito entre você e um contato cuja conversa está aberta, dentro da criptografia, então o
relay não vê mais do que uma mensagem de vez em quando entre duas pessoas conversando. A hora em que você foi visto
por último viaja dentro dessas mesmas mensagens, criptografada de ponta a ponta: o relay nunca a conhece. Ela conta
aos seus contatos quando você dorme ou trabalha, e de dois contatos vistos no mesmo minuto dá para supor que conversam
entre si: desative se isso importa para você. Alguém que só tem o seu link, escrevendo como solicitação de mensagem,
não recebe nada de volta até você aceitar: nem que você leu, nem que está online ou digitando, nem quando foi visto
por último. Até você aceitar, só as palavras aparecem: fotos e arquivos esperam sem ser baixados, e os links não
mostram prévia. Se as primeiras mensagens pedem um código, um PIN, uma senha ou dinheiro, prometem dinheiro fácil, ou
o nome parece o de um dos seus contatos, **Cuidado** avisa acima delas. O Erevos procura isso só no seu celular, e não
bloqueia nada.

Para esconder isso de um contato, abra a conversa dele, toque no nome dela e depois em **Aparecer offline**. Com isso
ativado:

- **Ele não vê você online**, nem que você está digitando, e o seu celular não envia nada a ele enquanto você lê.
- **As mensagens dele ficam ✓** no celular dele, não ✓✓ nem ✓✓✓, enquanto você as lê.
- **Quando você escreve para ele**, você aparece online por dois minutos, e todas as mensagens dele que você leu viram
  ✓✓✓ na hora.
- **Você também não o vê online**, já que o seu celular não pergunta, nem quando ele foi visto por último; e ele não
  recebe nenhum horário seu.

É definido para cada conversa, só neste celular. Desative de novo e ele vê o que você leu na sua próxima olhada no
relay.

### Nomes e apagar

Abra uma conversa, toque no nome dela e depois em **Renomear** para dar um nome a ela. O nome fica neste celular,
selado com a conversa: o outro celular não o vê. Um nome vazio traz de volta o começo da chave da pessoa, a menos que um
dos seus contatos esteja vinculado a ela: então ela volta a ter o nome dele na próxima vez que o cartão dele abrir,
enquanto o vínculo durar (veja [Contatos](#contacts)).

**O meu nome:** em Configurações → Privacidade e segurança → **O meu nome** podes escolher o nome que os teus contactos veem em vez de um código. É dito cifrado, só aos contactos que aceitaste, e os teus grupos privados também o ficam a saber: aí, quem não é teu contacto aparece como «Nome · 1a2b», com o início da sua chave. Se deste a um contacto um nome só teu (**Renomear**), continuas a ver o teu; o que ele escolheu aparece nos seus **Detalhes** como «Chama-se a si mesmo» e como sugestão no campo de renomear. Cada espaço tem o seu nome, e cada lugar de conversas ocultas também (nas suas configurações, junto a **Receber quando fechadas**): um lugar oculto nunca toma o nome do espaço e começa vazio, e o mesmo nome em dois deles diz a quem vê ambos que são teus. Um nome tem no máximo 40 caracteres.

Toque no nome dela e depois em **Imagem** para dar à pessoa uma imagem da sua escolha, um sinal sobre uma cor, em vez
da desenhada a partir da chave dela. Ou toque em **Foto** (ou **Tirar foto**) para uma foto: cortada em quadrado,
reduzida e redesenhada, para que nada do que ela dizia além da imagem (um lugar, um celular) fique guardado, e depois
selada num arquivo próprio. Ela também fica neste celular, e vai para os backups; **Imagem a partir da chave** traz de
volta a desenhada.

Cada conversa também pode ter a sua própria aparência: toque no nome dela e depois em **Aparência da conversa** para as
mesmas opções de **Aparência** (estilo, tema, cores, tipo de letra, papel de parede, mensagens e o tamanho do texto
delas), só para essa conversa. Um grupo tem **Aparência da conversa** onde o nome dele se abre (num grupo público, em
**⋯**), a Conversa comigo tem no topo{+, e uma conversa no Matrix, XMPP ou Nostr bem no fim, ao lado de **Notificações**}.
Como o nome, ela fica neste celular, selada com a conversa. **Igual ao app** devolve a ela a aparência do app.

Para guardar uma conversa fora do Erevos, toque no nome dela e depois em **Exportar conversa**: as mensagens dela vão
para um arquivo de texto, cada dia sob a sua data e cada mensagem com o horário e quem a escreveu, salvo na pasta que
você escolher (num computador, onde você escolher). O arquivo não é criptografado: qualquer pessoa que o tenha, ou
qualquer app que leia essa pasta, pode lê-lo. Fotos, arquivos e mensagens de voz só são nomeados, as mensagens que
desaparecem ficam de fora, e as conversas ocultas não são exportadas, para que nenhum arquivo fora do Erevos mostre que
elas estão ali.

**Por quê:** uma mensagem que desaparece fica de fora, e uma citação dela também, porque quem a enviou queria que ela
desaparecesse, não que ficasse num arquivo.

Para apagar uma mensagem, toque nela e segure, e toque em **Apagar**. Para apagar todas as mensagens de uma conversa,
toque no nome dela e depois em **Apagar mensagens**. De qualquer forma, o Erevos pergunta onde:

- **Este celular:** só aqui. O outro celular fica com as dele.
- **Os dois celulares:** o celular da pessoa também as apaga, na próxima vez que olhar o relay. O Erevos dela faz
  isso, mas um app modificado, uma captura de tela ou uma cópia ainda podem guardá-las.

### Apagar e bloquear um contato

Toque no nome de uma conversa e depois em **Apagar contato** para esquecê-lo: a conversa dele sai deste celular, e o
Erevos dá a você uma nova fila no relay na hora. Os seus outros contatos são avisados discretamente, numa mensagem sem
nada dentro, e de novo 7, 14 e 21 dias depois enquanto não tiverem escrito para a nova; o que eles escreveram para a
antiga nesse meio-tempo ainda aparece por 14 dias. Quem você apagou não é avisado, e nada do que ele envia para lá
aparece. O seu link de contato continua como estava, então ele ainda pode pedir para conversar de novo com esse link,
como solicitação de mensagem, como qualquer pessoa que o tenha.

**Por quê:** todos os seus contatos escrevem na sua única fila, então quem você apaga ainda sabe onde ela está; depois
que ela muda, ele não pode mais escrever para você ali, nem quem enviou o lixo descrito abaixo. O seu link de contato
nomeia uma fila própria, que uma exclusão deixa em paz, então todo link e código QR que você deu continua funcionando.

**Uma fila para cada contato:** num relay atualizado para isso, cada contato escreve numa fila própria, que só ele
conhece, informada dentro das suas mensagens criptografadas; a fila do seu link de contato fica então só para as
primeiras mensagens. Assim o relay não consegue saber, pelo destino das mensagens, que dois contatos escrevem para o
mesmo celular, e apagar ou bloquear alguém apaga só a fila dele: a sua própria só muda se ele também a conhecia, como
os contatos de antes disso conhecem, e alguém que veio pelo seu link de contato antes da primeira mudança dela. Os
contatos de antes ganham uma própria por sua vez, alguns de cada vez, discretamente, e um Erevos deles de antes também
a aceita. Essas filas são lidas sem token, para que o token, que nomeia o seu celular, não as ligue entre si; pelo Tor,
oito de cada vez, cada oito em circuitos próprios. Elas ainda são criadas e apagadas com o token, então um relay que
guarda registros pode ligá-las entre si nesse momento. As conversas ocultas e os computadores conectados mantêm uma
fila para todos, por enquanto. O app web não tem Tor, então enquanto está aberto ele espera em todas as filas dos seus
contatos juntas, a partir de um endereço; com as notificações com o app fechado ativadas, o seu relay também tem um
endereço de push para todas as filas dos seus contatos (veja [Num iPhone](#iphone)).

- **Bloquear contato**, abaixo dele, faz o mesmo, e também descarta o que ele enviar depois, uma solicitação também.
  **Bloquear**, ao lado de **Recusar**, bloqueia uma solicitação de mensagem: uma solicitação só conhece o seu link de
  contato, então ela muda a sua fila só enquanto o link ainda nomeia essa, como acontece até a sua primeira mudança.
  Quem você bloqueou fica em **Contatos bloqueados** na tela **Nova conversa**, com **Desbloquear**. Adicioná-lo de
  novo pelo link dele pede que você o desbloqueie antes; até lá nada o adiciona, {~nem a resposta dele a um convite por
  SMS, nem o link de contato dele|nem sequer o link de contato dele} num grupo. Cada pessoa que escreve pelo seu link de contato pode fazer o celular
  tocar, como qualquer mensagem: **Recusar** ou **Bloquear** detém essa pessoa, **Notificações** → **Em silêncio** na
  conversa dela a silencia sem recusá-la, e **Novo link de contato** detém quem tem o link antigo assim que terminam
  os 14 dias dele.
- **Grupos:** alguém num dos seus grupos ainda pode escrever para você ali. O Erevos diz em quantos vocês estão
  juntos: saia deles, ou peça ao admin para tirá-lo.
- **Quando o relay não está acessível**, a fila muda assim que ele responde, e até lá nada do que ele envia aparece.
- **As mensagens agendadas** que você tinha para ele são retiradas do relay, na hora ou assim que ele responder, para
  que nunca saiam.
- **Lixo:** quando a sua fila se enche do que não é para ninguém aqui, o Erevos dá a você uma nova do mesmo jeito e
  avisa, no máximo uma vez por dia. Quando o lixo enche a fila que o seu link de contato nomeia, você ganha um novo
  link em vez disso. Uma enxurrada de solicitações de mensagem inventadas também conta como lixo, enquanto um lote de
  solicitações reais ainda chega.
- **Novo link de contato**, ao lado de **Compartilhar meu link de contato**, dá a você um novo link: os links e
  códigos QR que você deu antes funcionam por mais 14 dias, e depois não mais. Os seus contatos não são afetados. Se o
  relay perder a fila que o seu link nomeia, você ganha um novo link do mesmo jeito, mas os que você deu antes param
  de funcionar na hora.
- **Link para um site**, ao lado, nas conversas do espaço, dá a você um link para pôr numa página web, como sua página
  de contato, com o nome que escolher. Ele abre uma página que oferece o {=Erevos} a quem ainda não o tem, no Android, num
  iPhone ou num computador, e depois adiciona você. Qualquer pessoa que o veja pode escrever para você, então o que
  enviar chega como solicitação de mensagem, que você aceita, recusa ou bloqueia. Não dá lugar no seu relay e vale
  enquanto valer seu link de contato: **Novo link de contato** também o anula.
- **Num computador conectado** isso vai para o celular, que também o apaga ou bloqueia e muda as filas dele, também as
  do computador. O celular guarda quem está bloqueado e avisa o computador: adicioná-lo ali pelo link dele também pede
  que você o desbloqueie, e **Desbloquear** o desbloqueia no celular também.
- **Nas conversas ocultas** só as filas daquela posição mudam, a fila de toque dela na hora, para que quem você apagou
  não possa mais fazer o celular tocar. Nada do espaço ou das outras posições muda.

O **Apagar** do cartão de contato (veja [Contatos](#contacts)) tira só o cartão, não a conversa. Um backup feito antes
de uma exclusão ou de um bloqueio traz esse contato de volta: apague-o ou bloqueie-o de novo depois de restaurá-lo.
Depois de restaurada, a sua fila diz que é mais nova do que qualquer uma que os seus contatos conheçam, e cada um é
avisado de novo, para que todos escrevam onde você lê.

### O menu de uma mensagem

Toque e segure uma mensagem para abrir o menu dela: as reações no topo, depois o que você pode fazer com ela.

- **Reações:** toque numa, ou em **+** para mais. Ela aparece abaixo da mensagem nos dois celulares, a sua destacada;
  toque nela de novo para retirá-la. Cada um de vocês tem uma reação numa mensagem. Ela vai na hora, ou não vai:
  quando nem o relay nem o celular da pessoa por perto podem pegá-la, nada muda.
- **Responder:** a sua próxima mensagem responde a ela, e a mostra citada acima das suas palavras, nos dois celulares.
  Toque na citação para ir à mensagem que ela responde; **✕** a descarta. Um Erevos de antes disso mostra a resposta
  sem a citação.
- **Responder no tópico:** responde-lhe num tópico, como num grupo: o tópico aparece sozinho, com **Tópico** no topo, e o
  que enviar ali responde-lhe. Sob uma mensagem com respostas, **n respostas no tópico** abre-o; Voltar mostra de
  novo toda a conversa. Um Erevos anterior mostra cada resposta com a sua citação.
- **Encaminhar:** envia uma cópia dela para outra conversa: escolha um contato, ou um grupo. As palavras, a figurinha
  ou o lugar dela vão de novo, uma enquete como uma nova sem respostas ainda, e o som de uma mensagem de voz ou os
  bytes de uma foto ou arquivo são enviados de novo, criptografados com uma chave nova, para que nada ligue a cópia à
  mensagem de onde ela veio. A cópia diz **Encaminhada** abaixo dela, não de onde; um Erevos de antes disso a mostra
  sem isso. Uma mensagem que desaparece não é encaminhada, e das conversas ocultas uma mensagem só vai para as mesmas
  conversas ocultas.
- **Favoritar:** marca-a como favorita, só neste celular, para encontrá-la de novo: **Mensagens favoritas** no menu da
  tela inicial as lista de todas as suas conversas, e os detalhes de uma conversa listam as dela. Um toque vai para a
  mensagem. As mensagens favoritas das conversas ocultas só aparecem nos detalhes das conversas delas.{~ }{-{~As }}{+As conversas do
  Matrix, XMPP e Nostr, e as }{~conversas por SMS}{+,}{~ também têm **Favoritar**, guardado criptografado só neste celular: as
  **Mensagens favoritas** de uma conversa listam as dela, e as da tela inicial as listam com todas as outras, cada uma
  abrindo sua conversa na mensagem. Nessas conversas, segurar uma foto, um vídeo, uma mensagem de voz, um arquivo ou a
  imagem de um MMS também oferece **Salvar na Coleção**, e segurar uma figurinha ou foto que chegou oferece
  **Adicionar às minhas figurinhas**; o seletor de figurinhas do SMS também oferece as suas, para enviar como MMS.}
- **Fixar:** fixa-a no topo da conversa, nos dois celulares; qualquer um de vocês pode **Desafixar**. Com mais de uma
  fixada, aparece a mais recente; toque nela para ir até ela, e a seguinte aparece.
- **Copiar:** põe as palavras dela na área de transferência, para colar em outro app. No Android a cópia é marcada
  como privada, então o aviso do celular sobre ela não mostra as palavras, mas qualquer app que leia a área de
  transferência pode lê-las.
- **Selecionar:** escolhe esta mensagem, e um toque em outras as acrescenta; uma barra oferece então **Copiar**, que põe
  todas as palavras delas num só texto com a hora e o autor de cada uma, **Encaminhar**, que as envia para uma conversa,
  e **Apagar**, que pergunta uma vez antes de apagá-las. **Voltar** para de escolher.
- **Editar:** para uma mensagem sua, até um dia depois de enviá-la. As palavras dela vão para o campo em **Editar
  mensagem**: mude-as e envie, ou **✕** para deixá-la como estava. Os dois celulares mostram as palavras novas, com
  **Editada** ao lado do horário. Só se editam palavras, não uma figurinha, um lugar, uma enquete, uma mensagem de voz,
  uma foto ou um arquivo, nem palavras que você encaminhou. Uma que ainda aguarda para ir vai com as palavras novas,
  sem marca; uma enviada para mais tarde não é editada. A edição vai na hora, ou não vai, como uma reação, e os seus
  dispositivos conectados também a mostram. Um Erevos de antes disso mantém as palavras antigas.
  **Por quê:** um dia é tempo suficiente para corrigir um erro, e ninguém pode mudar o que disse dias atrás. A marca
  mostra que as palavras não são as primeiras.
- **Encerrar enquete:** para uma enquete sua: nenhum voto a mais conta, e os resultados finais aparecem. Um Erevos de
  antes disso ainda a vê aberta, e um voto enviado naquele momento pode contar só em alguns celulares.
- **Apagar:** neste celular, ou nos dois, como acima.

As reações, respostas, mensagens fixadas e edições viajam dentro da criptografia, como as mensagens.

### Como as palavras aparecem

As marcas digitadas em volta das palavras mudam como elas aparecem, em conversas e grupos, como no WhatsApp e no Signal:
\`*negrito*\`, \`_itálico_\`, \`~riscado~\`, uma palavra entre crases como código (três crases em volta de linhas para
um bloco de código) e \`||palavras||\`, escondidas atrás de uma barra cinza até você tocar, na tela, na linha da tela
inicial e numa citação (ali como ▒▒▒).

- **Só em volta de palavras:** uma marca vale quando começa uma palavra e termina uma, então \`2*3*4\`,
  \`snake_case\` e endereços da web ficam como estão. Negrito, itálico e riscado ficam numa linha só.
- **Os outros veem as marcas:** um Erevos de antes e outros apps mostram as palavras com as marcas, como digitadas.
- **Foto escondida:** em **+**, **Foto escondida** envia uma foto que aparece borrada na conversa, nas conversas com
  contatos e nos grupos, até você tocar nela, e aí ela abre sozinha. Em **Mídia, links e arquivos** ela também
  aparece borrada. Um Erevos de antes a mostra como qualquer foto.
- **Foto de visualização única:** em **+**, **Foto de visualização única** envia uma foto que nunca aparece na
  conversa, nas conversas com contatos e nos grupos. **Câmera, visualização única** envia do mesmo jeito uma que você
  tira na hora. Quem a recebe toca nela e a vê uma vez, sozinha, sem capturas de tela onde o telefone o permite; ao
  fechar, o Erevos apaga-a do telefone dessa pessoa, e a conversa diz **Foto vista uma vez**. Não pode ser
  reencaminhada{~, guardada nem posta na Coleção| nem guardada}, e o seu próprio telefone apaga-a assim que chega. Nada impede uma
  câmera apontada para a tela, e um Erevos anterior a mostra como foto escondida.

**Por quê:** uma marca digitada nas palavras viaja nelas, dentro da criptografia, sem nada ao lado que a distinga.

### Mensagens temporárias

Abra uma conversa, toque no nome dela e depois em **Mensagens temporárias** para escolher quanto tempo as novas
mensagens dela duram depois de lidas: 5 minutos, 1 hora, 1 dia ou 1 semana. Para fazer só a próxima mensagem
desaparecer, toque no cronômetro ao lado do campo de mensagem (ou em **Mensagem temporária** em **+**, ou em
**Temporária** no menu da seta de enviar): **Desaparece 1 hora depois de lida** aparece sobre o campo. Toque no tempo
para escolher outro, ou em **✕** para desativar. Vale para a próxima mensagem que você enviar: palavras, uma mensagem
de voz, uma foto ou arquivo, uma figurinha, um lugar ou uma enquete, agora ou mais tarde.{~ Um SMS não pode desaparecer:
enviado como SMS, ele fica nos dois celulares (o Erevos avisa antes), e o cronômetro volta a ficar desativado.} O tempo
dela começa quando o outro celular a mostra na tela, e a sua cópia começa quando o celular da pessoa avisa (**✓✓✓**).
Cada mensagem diz quando desaparece. O outro celular fica sabendo da configuração da conversa na próxima vez que olhar
o relay, e qualquer um dos celulares pode mudá-la: a mudança mais recente vale. As mensagens que já estão na conversa
ficam.

- **Até ser lida**, uma mensagem temporária fica nos dois celulares, selada como o resto. Se o {=Erevos} da pessoa nunca
  disser que a leu, a sua cópia fica.
- **Enquanto o Erevos está fechado:** uma mensagem cujo tempo chegou é apagada quando a conversa abrir de novo. Até lá
  ela fica no celular, selada como o resto.
- **Não é uma garantia:** o {=Erevos} da pessoa as apaga, mas um app modificado, uma captura de tela ou uma cópia ainda
  podem guardá-las.

### Bloquear capturas de tela

Abra uma conversa, toque no nome dela e depois em **Bloquear capturas de tela**: no Android, nenhum dos dois celulares consegue fazer captura nem gravação de tela da conversa enquanto ela aparece, e os apps recentes a mostram em branco. O outro celular fica sabendo com a sua próxima mensagem, e qualquer um de vocês pode desativar de novo: vale a mudança mais recente. A conversa avisa quando a outra pessoa muda.

**Por quê:** o que você escreve fica entre vocês dois, a não ser que alguém queira copiar de propósito.

- **Só no Android:** o {=Erevos} em um iPhone, em um computador, em um navegador ou no Sailfish não consegue bloquear capturas de tela, e a conversa avisa isso lá.
- **Não é garantia:** uma foto da tela tirada com outra câmera, ou um app modificado, ainda guarda a conversa.

### Notificações desta conversa

No Android, abra uma conversa, toque no nome dela e depois em **Notificações**; num grupo, toque no nome dele (num
grupo público, em **⋯**) e depois em **Notificações**. **Em silêncio** por 8 horas, 1 semana ou **Sempre**: as
mensagens dela não tocam nem mostram notificação, então o ícone do Erevos também não as conta; a lista continua
mostrando, com um sino riscado, e as chamadas continuam tocando. **Som das mensagens** e **Toque** dão a ela um som
próprio para as mensagens e para as chamadas, da própria lista de sons do Android, ou **Sem som**. Nos detalhes de uma
conversa a linha diz então **Em silêncio até** e a hora, ou **Sons próprios**.

**Por quê:** uma conversa em silêncio continua contando na lista, para que nada do que chegou se perca: só o celular
para de chamar você até ela. Os sons dela ficam só neste celular, com a conversa nos dados criptografados do espaço,
porque cada celular tem os próprios sons: um dispositivo conectado guarda os dele, e o outro celular não sabe nada
deles.

- **Nas conversas ocultas** só existe **Em silêncio**: um som próprio diria a quem estiver perto qual conversa é.{+ O
  mesmo vale para as conversas das contas próprias de Matrix, XMPP e Nostr de uma posição oculta: em silêncio, elas não
  dizem nada, nem “Nova mensagem”.}
- **Um espaço fechado, e as conversas ocultas enquanto estão fechadas,** não sabem em que conversa chegou uma mensagem,
  então avisam dela como dizem as configurações do app.
- **Só no Android** por enquanto: o app web avisa de cada conversa como dizem as configurações dele.

### Mensagens de voz

Na conversa de um contato, sem nada digitado, toque e segure o microfone no fim da barra de mensagem enquanto fala, e
solte para enviar; deslize para a esquerda antes de soltar para descartá-la. Um toque de menos de um segundo é tomado
como engano e não envia nada. Depois de um minuto ela é enviada sozinha. Na primeira vez, o Android pergunta se o
Erevos pode usar o microfone: ele só grava enquanto você o segura. Com o TalkBack, toque nele uma vez para começar e
de novo para enviar. Toque numa mensagem de voz para ouvi-la, e toque de novo para parar. As mensagens de voz têm as
mesmas marcas que o resto, e seguem a configuração de mensagens temporárias da conversa.

**Mudar minha voz:** nos detalhes da conversa com um contato, **Mudar minha voz** envia suas mensagens de voz nessa
conversa **Mais grave** ou **Mais aguda**, com a mesma duração. Seu telefone muda o som antes de a mensagem sair,
então sua própria voz nunca sai dele; se a mudança falhar, a mensagem não é enviada. Só o seu telefone conhece o
ajuste. Deixa sua voz difícil de reconhecer de ouvido, mas alguém com a gravação e tempo poderia desfazer parte. No
Android 10 e posteriores, e em navegadores que fazem Opus sozinhos (WebCodecs); o walkie-talkie mantém sua voz.

**Em palavras:** segure uma mensagem de voz, no chat de um contato ou em um grupo, e escolha **Em palavras**: o
telefone escreve o que foi dito, para você ler ou copiar. Na primeira vez ele baixa um modelo de voz de 268 MB, quando
você disser, do próprio servidor do Erevos, que vê o seu endereço como em qualquer download; depois tudo é feito no
seu telefone, e nem o som nem as palavras dele saem do aparelho. Entende cerca de cem idiomas, entre eles o grego, e
reconhece o que está sendo falado. Pode errar, e as palavras não são guardadas. **Apagar o modelo de voz**, logo
abaixo, libera o espaço. Só no Android, e precisa de um telefone com cerca de 2 GB de memória livre, pois enquanto
escreve ocupa cerca de 1,5 GB; se falhar, a próxima tentativa abre o modelo de novo. Onde ninguém fala, em silêncio ou
ruído, não escreve nada, em vez de palavras que ninguém disse.

**Fale para escrever:** toque no microfone ao lado do campo da mensagem, em um chat ou em um grupo, e escolha **Fale para escrever**: a partir daí, segurar o microfone escuta em vez de gravar uma mensagem de voz, até você escolher **Mensagem de voz** no mesmo menu. Fale; toque em **Pronto**, e suas palavras são escritas no campo, para você mudar antes de enviar. Usa o
mesmo modelo de voz de **Em palavras**, baixado uma vez quando você diz, e tudo é feito no seu celular: nem sua voz
nem as palavras dela saem dele, e o som não é guardado. Ouve por até dois minutos e pode errar. Só no Android.

**Traduzir:** segure uma mensagem, no chat de um contato ou em um grupo, e escolha **Traduzir**: o seu celular traduz
para o seu idioma, ou para o inglês, para você ler ou copiar, entre grego, inglês, alemão, espanhol, francês e
italiano. Ele adivinha o idioma da mensagem; toque em outro em **De** ou **Para** para mudar qualquer um dos dois. Na
primeira vez para um idioma ele baixa os modelos de tradução dele, de 60 a 95 MB cada, quando você mandar, do próprio
servidor do Erevos, que vê o seu endereço como em qualquer download; dois idiomas que não são o inglês passam pelo
inglês, com um modelo para cada. Depois tudo acontece no seu celular, e nem a mensagem nem a tradução saem dele. Os
modelos são OPUS-MT, da Universidade de Helsinque (CC-BY 4.0). Pode errar, e a tradução não é guardada. **Apagar os
modelos de tradução**, embaixo, libera o espaço. Só no Android.

**Por quê:** no Android 10 e posteriores, no app web e num computador, uma mensagem de voz é Opus a 32 kbit/s, cerca de
240 KB por minuto, como Telegram, Element e Conversations as enviam: tão clara quanto a fala pode ser. No Android 9 e
anteriores, e no Safari antes do iOS 18.4 e do macOS 15.4, é AAC a 64 kbit/s, cerca de 480 KB por minuto. Mais do que
isso não se ouviria numa voz, mas seria mais lento de enviar, sobretudo por Bluetooth. Todo Erevos reproduz os dois: o
Safari antes do 18.4 reproduz Opus depois que o Erevos o reempacota para ele, e onde um navegador não pode reproduzir
um, o Erevos avisa.

- **Pelo relay, ou por perto,** criptografadas de ponta a ponta como as palavras, em vários pedaços. Ninguém no meio
  pode ouvi-las, mas pelos pedaços o relay, ou quem estiver escutando por perto, consegue saber que algo longo foi
  enviado, e mais ou menos de que duração. Por perto elas só vão para o celular de um contato que se sabe estar perto.
- **No celular**, cada som fica num arquivo próprio, selado com uma chave própria, que só o histórico selado da
  conversa guarda. Quando a mensagem some, apagada, desaparecida ou por ser a mais antiga, o arquivo dela também some.
  Quantos desses arquivos há, e os tamanhos deles, mostram mais ou menos quantas mensagens de voz o celular guarda, em
  todos os espaços juntos, não em qual.
- **Enquanto toca**, o som fica desselado no cache do Erevos, e é apagado assim que para. Se o Erevos for fechado
  enquanto grava ou toca, o que sobrou é apagado na próxima vez que uma conversa abrir.

### Fotos e arquivos

Na conversa de um contato, toque em **+** ao lado do campo de mensagem, que abre onde estava o teclado, e depois em
**Foto** para escolher uma das fotos do celular, **Câmera** para tirar uma, ou **Arquivo** para qualquer outra coisa,
até 100 MB. Abaixo deles, **Qualidade da foto** define como as fotos vão, e o Erevos se lembra disso:

- **Original** (o padrão): a foto exatamente como era, em tamanho real, sem perda de qualidade. Só o que ela diz além
  da imagem é retirado: onde foi tirada, o celular, a hora, as miniaturas. O nome dela é só "photo".
  Uma foto enviada com **Arquivo** (JPEG, PNG, GIF ou WebP, até 64 MB) também vai sem isso, com o próprio nome; para um
  arquivo HEIC ou AVIF, ou maior, o Erevos pergunta antes, pois não consegue tirá-los dele.
- **90%** e **75%:** uma foto nova, menor, mais rápida de enviar, que não diz nada além da imagem.

As fotos e os arquivos da pessoa de até 16 MB chegam sozinhos; toque num maior para baixá-lo. Toque numa foto para
vê-la na tela inteira, com o tamanho dela: dois dedos ou um toque duplo a ampliam, um dedo a move enquanto está
ampliada, e um toque esconde ou mostra o que há em volta. Toque num arquivo para salvá-lo. O Erevos gira com o
telefone enquanto **Girar automaticamente** estiver ativado nele, e uma foto vista sozinha gira mesmo quando está
desativado. **Salvar** põe uma cópia numa pasta que você escolhe na primeira vez, e **Salvar em outra pasta** a muda.
Fotos e arquivos têm as mesmas marcas que o resto, e seguem a configuração de mensagens temporárias da conversa.

- **Abrir com outro app:** um arquivo que não é foto tem também **Abrir**, no Android: o app do celular para o tipo
  dele, um leitor de PDF por exemplo, lê da memória do Erevos, sem que fique uma cópia no celular, e o link é solto
  quando o próximo arquivo abre ou o espaço é bloqueado. O Erevos pergunta antes, pois esse app está fora do Erevos e da
  criptografia dele, e nunca abre assim páginas web, desenhos nem pacotes de apps, que poderiam acessar a internet fora
  do Tor: salve esses em vez disso.
- **Como eles viajam:** cada arquivo é criptografado no celular com uma chave própria, em pedaços todos do mesmo
  tamanho, e posto no seu relay. Só o lugar onde estão os pedaços e a chave vão para o contato, criptografados de ponta
  a ponta. O celular dele pega os pedaços pelo próprio relay, para que o seu relay nunca veja o endereço do celular
  dele, confere cada pedaço, e depois os apaga do relay. Os pedaços que ninguém pega são apagados depois de 14 dias.
- **O que o relay vê:** quantos pedaços há e o tamanho deles, então mais ou menos o tamanho do arquivo, e quando. Não
  o que ele é nem para quem é.
- **Um arquivo vai como está,** com o que quer que diga por dentro: o autor de um documento, ou o lugar e o celular de
  uma foto se você a enviar com **Arquivo**. Envie fotos com **Foto**.
- **No celular**, cada arquivo fica nos seus pedaços, como viajou, selado com uma chave própria, que só o histórico
  selado da conversa guarda. Quando a mensagem some, os pedaços dela também somem. Quantos pedaços há mostra mais ou
  menos quanto o celular guarda, em todos os espaços juntos, não em qual. Uma foto é mostrada a partir da memória,
  nunca gravada desselada. O seletor de fotos do celular entrega uma cópia no cache do Erevos, apagada depois de lida,
  e uma foto tirada aqui não fica nas fotos do celular.
- **Salvos**, fotos e arquivos ficam fora do Erevos, sem selo: qualquer pessoa com o celular pode abri-los.
- **Só pelo relay:** os arquivos precisam do armazenamento de arquivos dele, mesmo quando o contato está perto. Um
  relay mais antigo que esta versão não aceita arquivos: atualize-o.

### Mais em +

Em **+** há mais para enviar do que fotos e arquivos (o rostinho no fim do campo de mensagem também abre as
figurinhas):

- **Figurinha:** uma das 576 figurinhas embutidas no Erevos, em 24 conjuntos de 24 (entre eles **Luas**,
  **Cachorros**, **Grécia**, **Frases** e **Gostosuras**), desenhadas pelo próprio celular: só o nome dela viaja, então
  nada é baixado nunca. Um Erevos de antes disso mostra o emoji dela no lugar. Todas, menos as frases e as gostosuras,
  se mexem um pouco por alguns segundos quando chegam e quando são tocadas, e depois param; com a configuração de
  reduzir movimento do celular ativada, ficam paradas. As frases aparecem no idioma do app.
- **Como imagem:** numa conversa de outra rede que só aceita imagens, uma figurinha embutida vai no lugar como a imagem
  dela: 512 por 512 com fundo transparente, desenhada no seu celular ou computador a partir das mesmas formas, parada,
  com as palavras dela no idioma do app. Nada é baixado para fazê-la.
- **Minhas**, entre as figurinhas, guarda as que você faz com fotos. **Nova figurinha a partir de uma foto** corta uma
  em quadrado, a reduz (512 por 512, cerca de 100 KB no máximo) e mantém só a imagem dela, nada de onde nem com o que
  foi tirada. Ela fica selada no espaço, ou nas conversas ocultas onde foi feita, e só aparece ali, até 100 delas;
  segure uma para apagá-la. Como o resto, ela vai para um backup, selada, e nunca para os outros dispositivos da
  conta. Ela vai como vai uma foto, criptografada de ponta a ponta pelo relay, marcada como figurinha, para aparecer
  sozinha sem balão; um Erevos de antes disso a mostra como foto. Segure uma figurinha que alguém enviou a você e
  toque em **Adicionar às minhas figurinhas** para guardá-la.
- **Localização** (no Android): envia onde você está, uma vez, como um lugar. Na primeira vez, o Android pergunta se o
  Erevos pode usar a localização. O celular procura de todos os jeitos que tem ao mesmo tempo: por satélite, quando você
  permitiu a localização precisa, e pela localização de rede dele, o que em muitos celulares pergunta ao Google ou ao
  fabricante do celular. Uma folha se abre na hora e diz que está procurando; em lugares fechados, onde os satélites mal
  aparecem, isso pode levar até um minuto. Quando nada chega a tempo, ele oferece o lugar que o celular encontrou nos
  últimos dez minutos, dizendo há quanto tempo, ou diz por que nenhum foi encontrado, com **Tentar de novo** e a tela do
  celular que muda isso. O Erevos só olha quando você toca, mostra o lugar antes de ele ir, e não segue você depois. A
  mensagem leva só as coordenadas, criptografadas de ponta a ponta; nenhum mapa é carregado no Erevos. **Abrir no mapa**
  entrega o lugar ao seu app de mapas, que pode carregar o mapa dele da internet. Um Erevos de antes disso mostra as
  coordenadas como palavras.
- **Cartão de contato:** envia um contato dos contatos do seu celular como cartão, com nome, números e endereços de
  e-mail, criptografados de ponta a ponta. A outra pessoa vê o cartão com **Adicionar aos contatos**; um Erevos de antes
  disso o mostra como palavras. Nas conversas ocultas você escolhe só entre os contatos guardados no lugar oculto, nunca
  os do celular.
- **Enquete:** uma pergunta com duas opções ou mais, até 12, e, com **Mais de uma resposta**, mais de uma para
  escolher. Toque numa opção para escolhê-la, de novo para retirá-la; cada opção mostra quantos a escolheram, e quem.
  Os votos viajam dentro da criptografia, como as reações. Um Erevos de antes disso mostra a pergunta e as opções dela
  como palavras, para responder com palavras.
- [~] **Pedido de pagamento** (pedido por outro app, como o Fasouli): um valor e para quê, como cartão. Quem recebe toca
  **Pago** quando pagar, e o seu telefone fica sabendo; não dá para desfazer. Depois **Marcar no Fasouli**, no Android,
  marca como recebido lá. O Erevos não move dinheiro nem conhece bancos: o cartão só diz o que foi pedido. Só em
  conversas com um contato, nunca nas ocultas. Um Erevos anterior mostra o valor como texto.

**Por quê:** um pacote de figurinhas baixado da internet diria a um servidor que este celular tem o {=Erevos}, então as
figurinhas são embutidas e só os nomes delas viajam. As suas próprias são listadas num único valor selado do mesmo
tamanho para cada espaço e posição oculta, em uso ou não, para que uma lista em uso pareça igual a uma que não está:
100 é o que ela comporta. Um lugar só é enviado do Android: num computador ou no app web, o navegador perguntaria a um
serviço externo onde ele está.

### Prévias de links

Um link numa mensagem fica sublinhado, e só abre depois que você toca nele e confirma. Com **Prévias de links**
ativado, nos detalhes de uma conversa, um link que você envia vai com a prévia dele: no momento em que você o envia,
este celular busca a página e pega o título dela, uma linha sobre ela e uma imagem pequena, e eles vão dentro da
mensagem, criptografados de ponta a ponta. O celular que a recebe não busca nada: mostra o que chegou. Fica desativado
a menos que você o ative, e então fica ativado para todas as conversas do espaço; cada posição de conversas ocultas
tem um interruptor próprio, nos detalhes de uma conversa ali.

**Por quê:** só o celular de quem envia busca a página, então o celular que recebe um link não acessa nenhum site
escolhido por outra pessoa, e não mostra nada de si a esse site, nem mesmo o endereço dele.

- **O site vê o endereço de internet deste celular**, e quando, como veria de um navegador, mas não para quem é a
  mensagem. Com o **Pelo Tor** ligado, nas **Prévias de links**, a página e a imagem dela são buscadas só pelo Tor,
  seja qual for a definição de Tor do espaço, então o site não vê o endereço. Isso é mais lento e espera enquanto o
  Tor inicia; uma página que manda você para outro lugar, ou que não deixa o Tor entrar, fica sem prévia. Enquanto
  tudo no espaço passa pelo Tor (**Tudo** no Tor), as prévias só são feitas com o **Pelo Tor** ligado.
- O {=Erevos} num computador não faz nenhuma, mas mostra do mesmo jeito as que chegam.
- **Por LoRa**, que só leva pouca coisa, uma mensagem vai sem a prévia em vez de esperar, e não guarda nenhuma aqui.
- Uma prévia é o que a página diz de si mesma, verdade ou não. Um Erevos de antes disso mostra o link sem ela.

### Chamadas de voz e de vídeo

Na conversa de um contato, toque no fone verde no topo para uma chamada de voz, ou na câmera azul ao lado dele para
uma videochamada. Na primeira vez, o Android pergunta se o Erevos pode usar o microfone, e a câmera para o vídeo. O
celular da pessoa toca enquanto o {=Erevos} está aberto lá, em qualquer tela do espaço: ela toca em **Atender** ou
**Recusar**. Durante a chamada você pode silenciar, ligar ou desligar o alto-falante, desligar a sua câmera, alternar
entre a câmera frontal e a traseira, e **Encerrar**. Cada chamada deixa uma linha na conversa, como quanto tempo
durou, ou uma chamada perdida.

- **Atender com vídeo ou só com voz:** uma chamada que toca oferece **Atender**, só com voz, e **Atender com vídeo**,
  nas chamadas do Erevos{+ e nas do XMPP e do Matrix}; numa chamada de grupo são **Entrar** e **Entrar com vídeo**. Uma
  chamada de vídeo atendida só com voz começa com a sua câmera desligada.
- **Para onde vai o som** (Android): com fones Bluetooth ou com fio conectados, **Alto-falante** passa a ser **Saída de
  áudio**: mostra para onde vai o som agora, **Telefone**, **Alto-falante**, **Fones de ouvido** ou **Bluetooth**, e um
  toque lista todos, uns fones Bluetooth pelo próprio nome, para escolher. Fones conectados ao começar a chamada, ou
  durante ela, ficam com o som, como numa chamada telefônica, e ligar a câmera o deixa ali; quando se desconectam, o som
  volta ao telefone, ou ao alto-falante numa videochamada.
- **Ligar a câmera depois:** **Ligar câmera**, na tela da chamada, funciona quando o app do outro lado pode mudar uma
  chamada enquanto ela dura; uma chamada de grupo fica como você entrou.
- **Adicionar vídeo a uma chamada de voz:** numa chamada de voz do Erevos, **Adicionar vídeo** liga a sua câmera quando
  a outra pessoa diz sim; se ela diz não, a chamada continua de voz.
- **Sua própria imagem:** numa videochamada sua câmera ocupa a tela até chegar a imagem do outro; depois vai para uma
  janela pequena no canto de cima, nos dois celulares, para cada um ver o outro e a si mesmo.
- **Trocar de câmera:** **Virar** passa para a câmera seguinte. Num computador só aparece quando há mais de uma câmera.
- **Como a chamada se conecta:** segure a tela da chamada por um momento para ver quanto do som do outro se perdeu ou
  precisou ser preenchido, o que se ouve como falhas, quantas vezes isso aconteceu, o tempo de ida e volta, o caminho da
  chamada e quanto demorou para tocar e para conectar. Um toque fecha. É medido só no seu celular e ajuda a descobrir por
  que uma chamada soa mal.

**Uma chamada para um telefone que demora a recebê-la:** quando o telefone deles recebe a sua chamada tarde, por
exemplo porque lê pelo Tor, **Chamando…** aparece por até um minuto e um quarto, e assim que toca lá, toca por 45
segundos a partir daí, para que uma chamada que chegou tarde não toque no telefone deles só para parar logo em
seguida. O telefone deles também lê uma chamada antes de tudo o que tem para enviar, e após uma troca de rede (do
Wi-Fi para dados móveis) volta a esperar chamadas logo em seguida.

**Uma chamada comum pela rede móvel:** quando um contato tem o número de telefone vinculado a ele, ou está vinculado a
um dos seus contatos com número (**Vincular a um dos meus contatos** na conversa dele, primeiro um número de celular),
o teclado laranja no topo da conversa dele, antes da câmera, abre um teclado com esse número digitado{~, e o do topo de
uma conversa de SMS também}. É {~o **Telefone** do Erevos quando o Erevos é o app de telefone, ou senão |}o do próprio
celular: toque na tecla de chamada ali. Uma chamada assim passa pela rede da operadora e não é criptografada{~, como um
SMS comum não é}. As conversas ocultas e os computadores não têm isso.

- **Criptografada de ponta a ponta:** a chamada é estabelecida com mensagens pelo relay, criptografadas como o resto.
  Elas levam a chave que criptografa a própria chamada, então ninguém no meio pode ouvir, nem mesmo o relay de
  chamadas abaixo.
- **Pelo relay de chamadas:** um relay montado com o kit em \`deploy/relay\` tem um relay de chamadas ao lado. A
  chamada passa por ele, então nenhum celular fica sabendo o endereço IP do outro. Por Wi-Fi ou dados móveis, em
  qualquer lugar.
- **Sem relay de chamadas** (um relay no seu próprio computador, por exemplo), o Erevos pergunta antes: a chamada
  então vai direto entre os celulares, só funciona na mesma rede Wi-Fi, e cada celular vê o endereço do outro nela.
- **Sem internet:** na mesma rede Wi-Fi, no hotspot de um celular, ou na rede Wi-Fi que dois celulares criam (Wi-Fi
  Direct), com um espaço aberto nos dois, uma chamada não precisa de relay nenhum: ela é estabelecida pela conexão por
  perto e vai direto entre os celulares (ou computadores). O mesmo vale para mensagens de grupo e chamadas de grupo.
- **Em segundo plano (Android):** enquanto um espaço está aberto, o Erevos continua rodando quando você sai dele, com
  o botão de início, com Voltar na primeira tela dele ou deslizando-o para fora dos apps recentes, com um aviso
  discreto, "Erevos – Ready for calls and messages", que não aparece na tela de bloqueio. Ele espera no relay e nas
  conexões com celulares por perto, para que as mensagens cheguem: um aviso diz só "New message", ou quantas chegaram, e
  num celular bloqueado só "Erevos". Uma solicitação de mensagem, de alguém que só tem o seu link de contato, gera o
  mesmo aviso e som, e conta no ícone, como qualquer mensagem. Uma chamada toca com o toque do celular e um aviso,
  "Incoming call" (ou "Incoming video call") – "Open Erevos to answer", sem nome, também sobre a tela de bloqueio e o
  protetor de tela, e a tela acorda. Toque nele para atender. Com o bloqueio com senha ativado, uma chamada que toca
  aparece antes da senha, e o Erevos bloqueia assim que ela termina. Bloqueado, o espaço continua atrás da tela da
  senha, então mensagens e chamadas ainda chegam, e uma chamada aparece sobre a tela da senha. Só as conversas e os
  grupos desse espaço chegam assim, e as conversas ocultas com **Receber quando fechadas** ativado; as outras conversas
  ocultas só dizem que chegou uma mensagem, ou tocam sem nome, se você permitir (veja Conversas ocultas). Defina isso em
  **Configurações** → **Notificações** → **Em segundo plano**: **Receber e tocar** (o padrão) ou **Só com o Erevos na
  tela**, e **Avisar quando chega mensagem** (o padrão) ou **Sem aviso**, que vale também para quando o Erevos está na
  tela. Ali também, se o Android pedir, **Continuar rodando com economia de bateria** e **Mostrar chamadas sobre a tela
  de bloqueio**. Abaixo, **Só o desperdício** (o padrão), **E os celulares por perto** e **E o sono** definem quanta
  bateria ele poupa em segundo plano: a segunda desliga também os rádios para celulares por perto enquanto o Erevos está
  em segundo plano, a terceira deixa também o celular dormir, de modo que o Erevos olha o relay cerca de uma vez por
  minuto e uma mensagem ou uma chamada pode chegar um ou dois minutos atrasada.
- **E o sono leve:** uma quarta opção ali, entre **E os celulares por perto** e **E o sono**. O celular pode dormir, mas o Erevos deixa aberta a sua espera no relay, de modo que o que chega acorda o celular e uma mensagem ou uma chamada continua a chegar de imediato onde a rede e o Android o permitem; o Erevos também olha por si mesmo a cada poucos minutos. É nova e ainda não foi experimentada em muitos celulares: se com ela as mensagens chegarem tarde, escolhe outra.
- **O número no ícone:** com **Avisar quando chega mensagem** ligado, quando você sai do Erevos com mensagens não
  lidas nas conversas e grupos do espaço aberto, a notificação fica, sem som, e diz quantas são, com as que avisar
  depois; ela some enquanto o Erevos está na tela, e volta quando você sai dele, até você lê-las. Não conta as
  mensagens de uma conversa em silêncio (veja Notificações desta conversa), nem as de uma oculta quando você sai. O
  launcher do Android a mostra no ícone do Erevos, como um número ou, em alguns telefones, como os Pixel, como um
  ponto. **Configurações** → **Notificações** → **Número no ícone** o desliga: aí a notificação só fala do que chegou
  desde a última vez que você teve o Erevos aberto, e o número do launcher some com ela. Uma mensagem apagada para
  todos antes de você lê-la, ou lida num computador conectado, deixa de contar.

  **Por quê:** no Android só uma notificação consegue pôr um número no ícone de um app, então a notificação fica
  enquanto há mensagens esperando; ela não diz mais do que quantas são, como sempre disse.
- **Um espaço que está fechado:** ele não recebe nada, pois a chave dele só está na memória enquanto está aberto: as
  mensagens dele esperam no relay dele e chegam quando você o abre. A menos que você escolha, nesse espaço, **Também
  enquanto outro espaço está aberto** em **Configurações** → **Notificações** → **Em segundo plano** (o padrão é **Este
  espaço só enquanto aberto**): então, enquanto outro espaço está aberto e recebe, ele diz só "New message", ou quantas
  chegaram, com o mesmo aviso desse espaço, nunca qual espaço, e as conversas ocultas dele não dizem nada. O que
  outros celulares levaram até o relay dele conta como mensagem, as exclusões também, e uma mensagem enviada a ele sem
  som toca como sempre (veja **Enviar sem som**). Para isso o celular guarda os endereços das filas dele no relay fora
  da senha dele, entre elas a fila em que cada contato dele escreve, até 64 contatos, nunca as chaves dele, quem são
  os contatos dele ou as mensagens dele, e pergunta ao relay só quantas chegaram, nunca as próprias mensagens: elas
  ficam lá até o espaço abrir. Um espaço que passa pelo Tor (**Mensagens** ou **Tudo**, em **O que passa
  pelo Tor**) só é consultado pelo Tor: enquanto o espaço aberto está com o Tor desativado, ou o Tor dele está
  iniciando ou acabou de falhar, o espaço fechado não diz nada, e o que chegou é avisado assim que o Tor estiver
  pronto ali.

  **Por quê:** um espaço atrás de uma segunda senha não pode mostrar que está ali, então isso fica desativado a menos
  que você o ative, e então ele não diz mais do que o espaço aberto diria. Consultado direto do celular enquanto outro
  espaço está aberto, o relay dele ou alguém que observe a rede poderia ligar os dois espaços pelo endereço de
  internet do celular. Como cada contato escreve numa fila própria, o espaço precisa perguntar também por cada uma
  delas, senão as mensagens deles não diriam nada. O custo é que o relay dele pode perceber que os dois espaços estão
  num mesmo celular, e alguém que examine o celular com ferramentas pode descobrir que um segundo espaço guarda
  endereços ali, e quantos contatos ele tem.
- **Um ponto para os outros espaços:** num espaço com **Também enquanto outro espaço está aberto**, **Ponto nos outros
  espaços**, logo abaixo (o padrão é **Sem ponto**), mostra também um pequeno ponto no cadeado acima das conversas do
  espaço aberto, assim que chegou uma mensagem a este enquanto estava fechado, até você abri-lo: nunca quantas, nem
  qual espaço. Funciona onde o aviso funciona: no Android, enquanto o espaço aberto tem **Receber e tocar** e **Avisar
  quando chega mensagem** ligados. Para isso o celular guarda, ao lado dos endereços acima, só se chegou uma mensagem.
  Quem vê as conversas do espaço aberto vê também o ponto, e pode suspeitar que há outro espaço.
- **Quando o celular liga:** depois que o celular inicia, o Erevos não roda até você abri-lo. Com **Iniciar quando o
  celular ligar** em **Configurações** → **Notificações** → **Em segundo plano** (o padrão é **Esperar até eu
  abrir**), ele inicia sozinho depois que o celular liga, ou depois que o Erevos é atualizado, sem nenhum espaço
  aberto: nenhum espaço pode abrir sem a senha dele, pois o Erevos não guarda nenhuma chave no celular. Então os
  espaços com **Também enquanto outro espaço está aberto** já dizem "New message", ou quantas chegaram, nunca qual
  espaço, nem quem ou o quê, e um aviso discreto diz "Locked". As chamadas não tocam, e nada mais chega, até você
  abrir um espaço; os espaços que passam pelo Tor não dizem nada até lá. Sem nenhum espaço assim, ou com **Sem
  aviso**, ele para na hora. Só no Android.

  **Por quê:** depois de um reinício o Erevos não podia avisar que há mensagens esperando até você por acaso abri-lo.
  Sem a sua senha ele continua sem poder lê-las, então não diz mais do que um espaço fechado diz.
- **Onde ele não consegue tocar:** parado pelo Android (ou pela economia de bateria do celular, ou pela configuração
  própria do fabricante do celular), depois de o celular reiniciar até você abrir o Erevos e o espaço uma vez, em outro
  espaço (ele só diz que chegou uma mensagem, se você permitir, como acima), ou num computador ou no app web enquanto
  fechado. Uma chamada ali aparece como chamada perdida quando o Erevos abrir. Quando o Android fecha o Erevos enquanto
  ele recebe e o inicia de novo, como costuma fazer, um aviso discreto diz isso: abra o Erevos e o espaço para receber
  de novo. Depois de **Forçar parada**, com o uso da bateria definido como Restrito, ou quando a configuração própria
  do fabricante do celular o fecha, o Android não inicia nada de novo, então nenhum aviso diz isso: o aviso "Erevos"
  simplesmente some, e nada toca até você abrir o Erevos. **Permissões** (abaixo) avisa antes se uma dessas coisas
  estiver definida. Também aparece um, "Locked", quando o espaço que recebia fecha (depois de restaurar um backup, por
  exemplo) e o Erevos sai da tela pedindo a senha. Uma solicitação de mensagem não pode ligar para você até você
  aceitá-la.
- **Permissões (Android):** **Configurações** → **Geral** → **Permissões** mostra o que o Android deixa o Erevos fazer
  para chamadas e mensagens em segundo plano (avisos, o aviso de chamada e que ele apareça na tela, o aviso de
  mensagens, com os avisos "Messages without sound" e "Messages with a chat's own sound" dele, que também mantêm o
  número no ícone, chamadas sobre a tela de bloqueio, rodar com economia de bateria, rodar em segundo plano sem o uso
  da bateria definido como Restrito, não ser pausado quando não usado, dados móveis em segundo plano, o microfone) e
  para outras coisas (o som de mensagens novas, avisos na tela de bloqueio, chamadas pelo Não perturbe, câmera,
  celulares por perto, contatos, horários exatos para {~SMS enviados depois e |}lembretes, o aviso de lembretes depois que
  chegou um lembrete), cada um com o motivo e um botão que abre a própria pergunta ou configuração do Android. Também
  diz quando o celular está no silencioso ou no vibrar, quando a economia de bateria está ativada, e quando o Não
  perturbe está ativado sem deixar passar as chamadas do Erevos. Em celulares Huawei, Honor, Xiaomi, OPPO, realme,
  OnePlus, vivo, Samsung e ASUS, também diz onde fica a configuração própria do fabricante, que o Erevos não consegue
  ler: toque em **Já fiz** quando estiver configurada. Depois de cada versão nova, e na primeira vez, abre sozinho
  quando chamadas ou mensagens precisam de algo. No app web mostra o que o navegador permite, veja
  [Num iPhone](#iphone).
- **Uma chamada de cada vez.** Uma chamada continua enquanto você passa entre as telas do espaço. Ela termina quando o
  espaço fecha, e uma chamada nas conversas ocultas quando elas fecham, o que elas não fazem durante uma chamada.
  Deslizar o Erevos para fora dos apps recentes também encerra uma chamada.
- As chamadas não passam por um celular por perto nem por Bluetooth. Ali, **Talkie** em **+** transforma a conversa
  num walkie-talkie, e **Talkie ativado** aparece sobre o campo: segure o walkie-talkie no fim da barra enquanto fala,
  solte, e a sua voz toca no celular da pessoa conforme chega, se a conversa com você estiver aberta lá; senão, ela
  espera como mensagem de voz. É uma mensagem de voz menor (cerca de 3 KB por segundo), então vai para todo lugar
  aonde uma mensagem vai, Bluetooth incluído.

**Por quê:** as chaves que abrem as mensagens de um espaço só estão na memória enquanto ele está aberto, e seladas atrás
da senha dele nos outros momentos. Então, depois de o celular reiniciar, nada pode ser lido e nada toca até você abrir
o Erevos e o espaço uma vez; e as conversas ocultas, cuja chave só está na memória enquanto elas estão abertas, a
menos que **Receber quando fechadas** a guarde com o espaço, nos outros casos só dizem que chegou uma mensagem, ou
tocam sem nome, se você permitir.

> As configurações do relay, a sua fila, os seus contatos e os nomes deles, as chaves das suas conversas e as
> mensagens ficam guardados neste espaço, selados. O histórico não tem limite: ele é guardado em páginas seladas do
> mesmo tamanho, misturadas com as páginas dos outros espaços e das conversas ocultas, então só aparece quanto todos
> ocupam juntos, não de quem são. O resto é guardado com o mesmo tamanho para cada espaço e para as conversas ocultas,
> em uso ou não; o que é maior vai para páginas como as do histórico, no meio delas. As mensagens apagadas podem ficar
> um tempo no armazenamento do celular, seladas como o resto, até que algo seja gravado por cima delas. As mensagens
> enviadas ou recebidas por perto são guardadas do mesmo jeito.

## Conversas em grupo {#groups}

No menu da tela inicial, **Novo grupo**: dê um nome a ele, marque os contatos a convidar e toque em **Criar o grupo**.
Você é o admin dele. O celular de cada contato responde sozinho na próxima vez que o {=Erevos} estiver aberto lá, e entra:
o grupo então aparece na tela inicial da pessoa, com uma nota de quem a adicionou. Um celular só entra num grupo cujo
admin é o contato que o convidou, e um admin só deixa entrar um contato como ele mesmo, nunca como outra pessoa. Os
grupos passam pelo relay, então ele precisa estar definido.

**Por quê:** só o celular do admin muda o grupo (quem está nele, o nome), então nenhum servidor precisa ordenar as
mudanças: todo celular as recebe desse único celular. Por isso um membro sai pedindo ao admin, e só o admin adiciona
ou remove membros.

- **Quem pode ser convidado:** contatos que você aceitou, neste espaço. Membros que não são contatos uns dos outros
  ainda conversam no grupo, e aparecem pelo começo da chave deles.
- **Adicionar como contato:** na lista de membros (**⋯**), **Adicionar como contato** abaixo de um membro que não é
  seu contato pede a ele, numa mensagem que só ele recebe, o link de contato dele, e dá a ele o seu. No celular dele o
  pedido aparece uma vez, no topo do grupo, e ele toca em **Enviar** ou **Não enviar**; se ele tocar em **Não
  enviar**, você não fica sabendo. Assim que ele envia, vocês viram contatos um do outro, com uma conversa própria, e
  **Nome** dá um nome a ele, como faz abaixo de qualquer contato que ainda não tem nome. Nenhuma resposta pode
  significar que ele ainda não abriu o grupo, disse não, tem um {=Erevos} mais antigo, ou ainda tem você como contato, o
  que não mostra nada a ele; depois de uma semana você pode pedir de novo. Assim que vocês viram contatos um do outro,
  em qualquer grupo ou por um link de contato, o que foi pedido nos seus outros grupos some, e o pedido dele deixa de
  aparecer. Um membro removido do grupo não pede mais nada. Se dois membros mostram a mesma chave, um deles não é quem
  diz ser, e nenhum link de contato vai para nenhum deles nem é aceito de nenhum deles. Não nos grupos públicos. Pedir
  é para o celular que tem a conta; **Nome** também funciona num dispositivo conectado.
- **Criptografada de ponta a ponta para o grupo:** MLS (RFC 9420). Cada mensagem é criptografada uma vez para o
  grupo, e depois selada de novo para cada membro, então o que chega à fila de cada membro não se parece com nada que
  os outros recebem, e nenhum relay consegue saber quem está num grupo. Ela vai direto para a fila de cada membro, pelo
  seu relay. Toda semana as chaves de cada celular no grupo são renovadas, as do admin por ele mesmo e as de cada
  membro pelo admin, para que chaves tiradas de um celular uma vez parem de ler o grupo.
- **Membros:** toque no nome do grupo no topo, ou em **⋯** ao lado dele. O admin adiciona contatos, remove membros e
  renomeia o grupo. Um membro removido não lê mais nada do que o grupo diz a partir daí, e o grupo fica no celular
  dele, só para leitura, até ele apagá-lo.
- **Tópicos:** toque e segure uma mensagem e escolha **Responder no tópico** para responder a ela num tópico, ou toque
  em **n respostas no tópico** abaixo de uma mensagem para abri-lo. O tópico aparece sozinho, e o que você envia ali
  responde a ela.
- **Descrição:** o admin do grupo a escreve na folha de membros, em **Descrição**, e toca em **Salvar**. Todo membro a
  lê, também quem entrar depois. Uma mudança feita por qualquer outra pessoa é ignorada.
- **Sair:** **Sair do grupo** pede ao admin, cujo celular remove você na próxima vez que o {=Erevos} estiver aberto lá. O
  botão do próprio admin é **Fechar o grupo**: ele remove todos os membros.
- **Um só admin:** um grupo privado tem um admin, quem o criou. **Por quê:** as mudanças do grupo precisam chegar numa
  só ordem, e com o MLS nenhum servidor as põe em ordem, então dois admins poderiam mudar o grupo ao mesmo tempo e
  parti-lo em dois. Um Erevos de antes disso aceita mudanças só de quem criou o grupo.
- **Chamadas de grupo:** o fone verde no topo do grupo inicia uma chamada de voz nele, e a câmera azul ao lado dele
  uma videochamada (também **Videochamada** em **⋯**). Enquanto uma está em andamento, só o botão dela aparece, para
  entrar nela. Ela toca nos celulares dos membros onde o Erevos está aberto, e quem atende está nela. Uma chamada em
  andamento aparece no topo do grupo, para entrar mais tarde. Até oito pessoas: cada celular se conecta a cada um dos
  outros, pelo relay de chamadas, para que nenhum celular veja o endereço IP de outro; sem relay de chamadas, só na
  mesma rede Wi-Fi. Criptografada de ponta a ponta entre cada dois celulares, com as chaves enviadas na criptografia
  do grupo. Numa videochamada cada celular envia a sua imagem a cada um dos outros, então as imagens aparecem para até
  quatro pessoas; com mais, elas pausam e o som continua, até que um servidor para videochamadas maiores seja montado.
  Uma chamada que toca oferece **Entrar** e **Entrar com vídeo**.
- **Fotos, arquivos e mensagens de voz:** **+** ao lado do campo envia uma foto ou um arquivo, como na conversa de um
  contato, com a mesma **Qualidade da foto**; segure o microfone enquanto fala, e solte para enviar. Cada um é
  criptografado com uma chave própria e posto no seu relay uma vez, e só o lugar onde está e a chave dele vão para o
  grupo, na criptografia dele. O celular de cada membro o pega de lá pelo próprio relay: até 16 MB sozinho enquanto o
  grupo está aberto, um maior quando tocado. Toque numa foto para vê-la inteira, num arquivo para salvá-lo, numa
  mensagem de voz para ouvi-la.
  - **O relay o guarda por 14 dias,** criptografado, pois não tem como saber quando todos os membros o pegaram.
  - **Só pelo relay,** mesmo quando os membros estão perto.
  - **Um membro que entra depois** não recebe o que veio antes, como acontece com as palavras. Um membro cujo {=Erevos} é
    de antes desta versão não vê nada disso.
  - **No celular**, cada um fica nos seus pedaços, selado, como na conversa de um contato. Apagar o grupo aqui os
    apaga.
- **O menu de uma mensagem,** ao segurá-la, como na conversa de um contato: as reações, **Responder**, **Encaminhar**,
  **Favoritar**, **Fixar**, **Copiar**, **Editar** e **Apagar**. Cada membro tem uma reação numa mensagem, e uma
  enquete mostra quem escolheu o quê. Uma mensagem fixada é para todos, e qualquer membro pode **Desafixar**.
  **Editar** troca as suas próprias palavras por novas para todos os membros, até um dia depois de enviadas, marcadas
  **Editada**. **Apagar** pergunta **Este celular** ou, para uma mensagem sua, **Para todos**: o Erevos dos membros
  também a apaga, e uma foto, arquivo ou mensagem de voz sua sai do seu relay na hora em vez de em 14 dias. **+** tem
  **Figurinha**, **Localização** e **Enquete** aqui também. Os links ficam sublinhados e pedem confirmação antes de
  abrir, e as **Prévias de links**, quando ativadas, vão com os seus. Na lista de membros, ou na própria tela de um
  grupo público, **Buscar nesta conversa** percorre as mensagens do grupo e **Exportar conversa** as grava num
  arquivo, e **Mídia, links e arquivos** lista as fotos, vídeos, mensagens de voz, músicas, arquivos e links do grupo, cada tipo à parte, como na conversa de um contato (veja acima), cada um indo até a sua mensagem; **Mensagens favoritas** e a busca da tela inicial também incluem os grupos. Um membro cujo {=Erevos} é de
  antes desta versão vê as palavras, o emoji de uma figurinha, as coordenadas de um lugar e a pergunta de uma enquete,
  e nada das reações, mensagens fixadas, edições e exclusões. **Selecionar** escolhe várias mensagens para copiar,
  encaminhar ou apagar juntas, uma enquete sua tem **Encerrar enquete**, e o **+** tem também **Cartão de contato**.
  **Para todos** só é oferecido ao apagar se tudo o que você escolheu for seu.
- **Citar um membro:** digite **@** no campo da mensagem e os membros cujos nomes começam com o que vem depois
  aparecem acima: toque em um para pôr o nome inteiro. Um membro citado assim é avisado da mensagem mesmo que tenha
  silenciado o grupo. Só valem nomes inteiros, então **@Ana** não cita Ana Maria. Um Erevos de antes mostra só as
  palavras e avisa como dizem as configurações do grupo.
- **Ainda não:** digitando e mensagens temporárias nos grupos, e grupos por um celular por perto.

## Grupos públicos {#public-groups}

Um grupo público é um em que qualquer pessoa com o link dele, ou o código QR dele, pode pedir para entrar: para um
clube, uma rua ou uma turma, onde nem todos são seus contatos. No menu da tela inicial, **Grupos públicos**: dê um nome
a ele e o nome com que você aparece nele, escolha quem entra e toque em **Criar o grupo público**. Você é o dono dele.
As mensagens dele são criptografadas de ponta a ponta com MLS e vão para cada membro como em qualquer grupo, e nenhum
relay fica sabendo quem está nele.

- **O link:** toque no nome do grupo no topo para ver o link e o código QR dele, e em **Compartilhar o link**. Quem o
  abre, ou lê o código com a câmera do celular, escolhe o nome que o grupo vê e toca em **Pedir para entrar**. Um link
  também pode ser colado em **Entrar por um link**. Todo membro tem o link, e pode passá-lo adiante.
- **Descrição:** o dono ou um admin a escreve na tela própria do grupo, em **Descrição**, e toca em **Salvar**; todos no
  grupo a leem.
- **Entradas enquanto você está fora:** o pedido espera no seu relay, selado para que só o seu celular o abra, até o
  Erevos estar aberto no seu celular: ele olha a cada poucos segundos enquanto o Erevos está na tela, e mais ou menos a
  cada minuto em segundo plano. Então ele deixa a pessoa entrar, e o grupo aparece no celular dela.
- **Quem entra:** **Qualquer pessoa com o link**, ou **Um admin aprova a entrada**: então quem pede espera em
  **Pedidos para entrar**, até você ou um admin tocar em **Aceitar** ou **Recusar**. O seu celular ainda deixa a
  pessoa entrar, assim que fica sabendo.
- **Admins:** em **Membros**, toque em **Moderar** ao lado de um membro, depois em **Tornar admin**. Os admins
  silenciam, removem e banem membros, deixam entrar quem pede e apagam uma mensagem para todos; só você modera os
  admins, e ninguém modera você.
  - **Silenciar:** o celular da pessoa não envia nada no grupo, e nenhum celular mostra o que o dela envia mesmo
    assim. **Deixar escrever** desfaz isso.
  - **Remover:** ela não lê mais nada do que o grupo diz a partir daí, e pode pedir para entrar de novo pelo link.
  - **Banir:** removida, e o que o celular dela pedir depois é recusado. **Retirar o banimento**, em **Banidos**,
    desfaz isso. Um banimento barra o mesmo celular, não alguém que volta com uma nova fila no relay: contra isso,
    escolha **Um admin aprova a entrada**, ou troque o link.
  - **Apagar para todos:** as últimas mensagens ficam listadas embaixo; **Apagar** tira uma do celular de todos os
    membros. Quem já a leu pode ter guardado uma cópia.
- **Trocar o link:** o link e o código QR compartilhados até então param de funcionar na hora, e todo membro recebe o
  novo. Os pedidos ainda aguardando no antigo se perdem.
- **Transferir o grupo:** em **Moderar** de um membro. O celular dele passa a ser o dono a partir daí e deixa as
  pessoas entrarem, então o link muda para um no relay dele; você continua admin. Se o seu celular se perder antes de
  você transferi-lo, ninguém mais pode deixar ninguém entrar, embora o grupo continue para quem está nele.
- **Fechar o grupo** remove todos os membros. O **Sair do grupo** de um membro pede ao seu celular que o remova.
- **Um grupo descartável,** para uma ocasião: antes de criá-lo, em **Termina**, escolha **Depois de um dia**, **Depois
  de 3 dias** ou **Depois de 7 dias**. Quando o tempo acaba, o Erevos de cada membro o apaga, cada um pelo relógio do
  próprio celular, com as mensagens, fotos e arquivos, da próxima vez que estiver aberto, e o link deixa de funcionar.
  Quando ele termina é definido ao criar o grupo e nunca muda. A tela do próprio grupo diz quando ele termina. Um
  membro com um {=Erevos} mais antigo o mantém, e até lá qualquer um pode ter guardado uma cópia ou uma captura de tela.
- **Até 100 membros,** pois o grupo inteiro tem de caber na única mensagem que deixa alguém entrar.
- **Todo celular num grupo público precisa desta versão do {=Erevos}.** Os grupos feitos com contatos funcionam como
  antes.

**Por quê:** só o celular do dono muda o grupo e deixa as pessoas entrarem, então as mudanças nunca competem e nenhum
servidor precisa ordená-las. É por isso que o grupo continua sem ele, mas ninguém novo entra: transfira-o antes de
trocar de celular.

### O que um grupo público revela

> Qualquer pessoa com o link pode ler o grupo a partir do momento em que entra, nunca o que foi dito antes, e o link
> pode ser passado adiante: troque-o para impedir isso.

- **O link** mostra o nome do grupo e o endereço do seu relay a quem o vê.
- **Todo membro vê de todos os membros** o nome escolhido, uma chave feita só para este grupo, o endereço do relay e o
  sender id da fila deles. A chave não diz nada de quem eles são nas conversas deles, nem de que outros grupos
  participam. A fila é uma em que só os grupos públicos deles leem, não a do link de contato deles, a mesma em cada um
  dos grupos públicos deles (um Erevos anterior ao 2.0.0 informa a do link de contato).
- **Os nomes são escolhidos, não comprovados:** qualquer pessoa pode se chamar de qualquer coisa. O começo da chave de
  cada membro aparece ao lado do nome, e o dono e os admins ficam marcados.
- **Tudo o que é dito pode ser copiado** por qualquer pessoa no grupo: a criptografia de ponta a ponta deixa os relays
  de fora, não os membros.
- **Os relays** não leem nada e não descobrem ninguém no grupo. O seu vê os pedidos chegarem à porta do grupo, quantos
  e quando, não de quem. Os membros podem encher a fila uns dos outros com o que não pode ser lido, até o que o relay
  aceita.

## Como o Erevos escolhe o caminho {#paths}

Quando você envia uma mensagem, o Erevos escolhe o caminho sozinho:

1. **O celular da pessoa está perto** (o topo da conversa diz **Por perto**): ela vai pela conexão por perto, e também
   pelo relay quando há um.
2. **Senão, com um relay:** ela vai pelo relay, e uma mensagem curta também vai para os celulares com {=Erevos}
   conectados por perto, para que o da pessoa possa responder por perto se for um deles. Se o relay não estiver
   acessível, essa cópia é a que vale, e esses celulares também a levam ao relay do seu contato, como em
   [Conversar com um celular por perto](#nearby).
3. **Senão, sem relay,** ela vai para os celulares com {=Erevos} conectados por perto, como no 2.
4. **E por LoRa,** quando há um rádio configurado e o relay não pôde pegar um texto, como em
   [Por um rádio LoRa](#lora). Sem nenhum caminho, a mensagem aguarda, marcada **Aguardando**, e vai sozinha assim que
   houver um, como em [Enviada, chegou e lida](#relay); uma linha abaixo da conversa diz por quê.
5. [~] **E por SMS,** por último, quando você ativou isso para aquele contato e nada mais levou um texto, como em
   [SMS](#sms).

Todo caminho é criptografado de ponta a ponta: nenhum relay e nenhum celular no meio consegue ler o que você envia.

**Caminhos**, em **Configurações** → **Relay e redes**, mostra cada caminho de relance: um cartão para o relay, o Nostr, os celulares por perto, o LoRa{~, o SMS} e o Tor, cada um com como está agora e uma linha embaixo, cheia quando funciona, fraca quando está ligado mas agora não alcança ninguém, e tracejada quando está desligado. Em cima diz quantas mensagens suas estão esperando para sair, com um ponto laranja para cada uma. Um cartão abre as configurações do seu caminho. Mostra só o espaço aberto, nunca as conversas ocultas. Na tela inicial, a linha abaixo da barra de cima também é **Caminhos**, depois que um relay é definido: um ponto para cada caminho, e quantas mensagens suas esperam; um toque abre.

| Linha abaixo da conversa | O que fazer |
| --- | --- |
| **Enviada por perto, criptografada de ponta a ponta.** | Nada: o celular da pessoa está perto e já a tem. |
| **Enviada pelo relay, criptografada de ponta a ponta.** | Nada: ela está a caminho. |
| **Enviada aos celulares com {=Erevos} por perto, criptografada de ponta a ponta, porque o relay não estava acessível.** | Ela só chega se um deles for o da pessoa: espere o **✓✓**, ou verifique o relay. |
| **… Se o celular da pessoa não estiver entre eles, eles a entregam ao relay dela assim que tiverem internet, e este celular também.** | Nada: ela chega assim que um deles, ou este celular, tiver internet. Espere o **✓✓**. |
| **Enviada por LoRa, criptografada de ponta a ponta, porque o relay não estava acessível.** | Ela chega se o {=Erevos} da pessoa tiver um rádio na mesma malha, ao alcance: espere o **✓✓**, ou verifique o relay. |
[~] | **Foi por SMS, criptografada de ponta a ponta, porque nada mais conseguia levá-la.** | Nada: custa SMS, e a operadora vê que você escreveu para o número dele. **✓✓** chega assim que o relay ou o Nostr estiverem acessíveis. |
| **Aguardando. O relay não está acessível (ou Não há relay), e o celular da pessoa não está por perto.** | Nada: ela sai sozinha assim que o relay ou o celular da pessoa por perto puder recebê-la, e então mostra **✓**. Sem relay, preencha o endereço dele, como em [Conversar por um relay](#relay), ou chegue perto do celular da pessoa. |
| **Aguardando. É longa demais para LoRa.** | Nada: ela sai assim que o relay ou o celular da pessoa por perto puder recebê-la. Ou envie-a em partes mais curtas. |
[~] | **Aguardando. É longa demais para SMS.** | Nada: ela vai assim que o relay ou o celular dele por perto puder levá-la. Ou envie em partes mais curtas. |
| **Não enviada. O relay não tem mais a fila deste contato.** | Peça que ele escreva para você, ou peça o novo link de contato dele. |
| **Esta versão não consegue criptografar, então as conversas pelo relay estão desativadas.** | Compile o app de novo: esta versão é mais antiga que a criptografia dele. |

## Rodar o seu próprio relay {#own-relay}

Um relay que você mesmo roda é o mais seguro, pois quem roda um relay vê quem se conecta a ele. O código-fonte tem
tudo em \`deploy/relay\`.

- **Na sua própria rede:** rode o relay num computador, abra a porta 7879 no firewall dele e digite
  \`ws://<endereço dele>:7879\` em cada celular. Feche a porta de novo quando terminar.
- **Na internet:** um servidor (VPS) com Debian 12 ou Ubuntu 22.04 ou posterior, um nome de domínio (ou um nome
  \`sslip.io\` gratuito) e as portas 80 e 443 abertas. Um único comando instala o relay atrás do Caddy, com um
  certificado do Let's Encrypt e um token aleatório. Cada celular usa então \`wss://<seu domínio>\` e esse token. O
  mesmo comando configura o relay de chamadas, que precisa também da porta 3478 e das portas UDP 50000 a 50999
  abertas.

As filas e as mensagens aguardando ficam no disco do servidor, assim como os pedaços criptografados de fotos e arquivos
até serem pegos (1024 MB juntos no máximo), então um reinício não perde nada, e nenhum pedido é registrado.
As mensagens enviadas para mais tarde também ficam lá até o horário delas, 10.000 ou 256 MB no máximo: o relay vê
quando cada uma deve sair, não o que ela diz.

**Por quê:** o que o relay guarda tem limites, para que os celulares que o usam não possam encher o disco ou a
memória dele.

**A própria chave:** o arquivo de chave do relay (\`EREVOS_RELAY_KEY\`, que o único comando configura) é o que ele
prova em cada conexão, então os celulares o reconhecem por essa chave e não pelo certificado (veja
[A própria chave do relay](#relay)). Guarde esse arquivo, também nos backups: com um novo, todo celular que conhecia a
chave antiga recusa o relay até alguém tocar em **Ele tem uma chave nova** nele.

**Convites:** o relay pode dar a cada celular um token próprio, num arquivo de tokens, e então deixar esses celulares
convidarem mais, cada convite para um celular (veja [Convites para o relay](#relay)). Ative isso com
\`EREVOS_RELAY_INVITES=on\` ao lado de \`EREVOS_RELAY_TOKENS\`; o relay então grava ele mesmo as linhas dos celulares
convidados nesse arquivo, com quem os convidou e quando, e tirar uma linha corta esse celular, só ele: os celulares que
ele convidou ficam com as deles, então para tirá-los também, apague cada uma das linhas deles (cada uma diz quem o
convidou). Ele deixa entrar 100 celulares por convite no máximo (\`EREVOS_RELAY_MAX_INVITED\`). \`erevos-relay free-line
NOME\`, rodado com o relay parado, torna uma linha uma das suas: o celular que a convidou não pode mais revogá-la, e ela
não conta mais entre os 100. Um celular que vem com o token do relay (\`EREVOS_RELAY_TOKEN\`) pede uma vez uma linha
própria, que o relay acrescenta como uma das suas, dizendo que veio com o token do relay e quando, 50 por dia no máximo:
assim você pode distribuir esse token, apagar a linha de qualquer celular, e depois trocar o token sem cortar os outros.
\`deploy/relay/README.md\` explica como.

**Login:** com um arquivo de tokens, o relay também pode deixar os celulares entrarem com um provedor OpenID Connect,
como o Authentik, em troca de um token próprio, e verifica cada conta a cada hora, tirando os celulares dela depois de
3 dias sem resposta e de mais duas verificações de cada celular que falhem com uma hora de intervalo (veja
[Entrar no relay](#relay)). Um navegador pode iniciar 10 logins por minuto. Com \`EREVOS_RELAY_OIDC_GROUP\`, só as
contas desse grupo podem. Precisa de um cliente no provedor, algumas configurações, e de \`/signin/\` repassado ao
relay como HTTP simples: \`deploy/relay/README.md\` explica como.

> Nunca publique o token onde outros possam lê-lo. Quem roda o servidor vê os endereços IP que se conectam, os ids das
> filas, e quando e quanto chega. Não consegue ler as mensagens, que são criptografadas de ponta a ponta.

## Relay de casa {#home-relay}

Em **Configurações** → **Relay e redes** → **Relay de casa**, um espaço pode ter um segundo relay com uma fila
própria: um em casa, num Raspberry Pi ou num computador velho, ou qualquer outro relay em que você confie. É opcional.

- **O que ele faz:** o seu link de contato e cada mensagem informam essa fila ao lado do seu relay. Enquanto o seu
  relay não está acessível, os contatos escrevem ali, e o Erevos pega o que chega ali a cada olhada. O que você envia
  passa por ele quando o seu próprio relay está fora do ar.
- **Como configurar:** rode um relay como em [Rodar o seu próprio relay](#own-relay), digite o endereço dele (e o
  token, se ele tiver um) e escolha **Salvar**. Os contatos ficam sabendo dele pela sua próxima mensagem para eles, ou
  pelo seu novo link de contato.
- **O que ele vê:** o mesmo que o seu relay vê, o endereço deste celular quando ele pega mensagens (mas não quando ele
  só é alcançado pelo Tor), e quando e quanto chega. As conversas ocultas não o usam.
- **Só por Tor:** um interruptor para cada relay de casa. Esse relay nunca vê o endereço deste celular, seja qual for a
  configuração do Tor para o resto. Sem token digitado, ele dá um token por um cupom: o seu relay, o do próprio espaço,
  assina o cupom às cegas, então nenhum dos dois relays consegue saber de quem é o token. O cupom é usado até uma hora depois de assinado, num momento ao acaso, de modo que os horários que os dois relays viram não combinam, e o token vem do
  relay de casa dentro de uma hora. O token dura 90 dias, e o Erevos pega um cupom novo sozinho num dia ao acaso entre o dia 30 e o dia 60. Um
  limite: com poucos celulares em um relay, quem cuida dos dois ainda poderia adivinhar só pelos horários. Assim, dois
  espaços (veja [Segunda senha](#second)) podem usar cada um o relay do outro como relay de casa, e nenhum relay os liga
  entre si. Os dois relays precisam ter os cupons ativados, e é preciso uma versão com Tor, no Android (veja
  [Pelo Tor](#tor)).
- **Automaticamente pelo seu relay:** um interruptor, desligado a menos que você o ligue, no Android, onde o Erevos tem
  Tor. Quando o seu relay nomeia um relay pareado com ele (quem o administra configura isso), um espaço sem relay de
  casa pega esse sozinho, só por Tor, com o token dele de um cupom como acima: nada para digitar, e nada a fazer quando
  o seu relay nomear outro. Desligá-lo larga o relay de casa que ele pegou, e remover o relay de casa à mão desliga isso para esse espaço; um relay de casa que você
  digitou fica como está. Posições ocultas nunca pegam um assim.
- **Para as conversas ocultas:** cada posição oculta pode ter um relay de casa próprio, em **Para usuários avançados**
  na tela dela sem nenhuma conversa escolhida, enquanto ela está aberta. Ele fica guardado só com aquela posição,
  selado com o PIN dela, então o espaço não sabe nada dele, e é consultado enquanto a posição está aberta. Use um
  relay diferente do do espaço: um relay que visse as duas filas as ligaria entre si.

**Mais de um:** **Adicionar outro relay de casa** dá até mais dois, cada um com sua própria fila, por exemplo um em
casa e outro na casa de um amigo. Os contatos tentam na ordem mostrada, e o Erevos pega o que chega em cada um. Seu
link de contato cita os outros só enquanto continua curto o bastante para um código QR; o resto chega aos contatos com
sua próxima mensagem. Um contato com um {=Erevos} mais antigo usa só o primeiro.

## Pelo Tor {#tor}

Em **Configurações** → **Relay e redes** → **Tor**, **O que passa pelo Tor** escolhe quais pedidos deste espaço aos
relays dele passam pela rede Tor. Cada espaço tem a sua própria escolha:

| Opção | O que passa pelo Tor |
| --- | --- |
| **Nada** | A menos que você mude. O relay e os relays Nostr veem o endereço IP do seu celular para tudo. |
| **Mensagens** | O que você escreve, e o que diz algo aos seus contatos, como que uma mensagem foi lida. Imagens, arquivos e mensagens de voz vão direto, o que é mais rápido: para eles o relay vê o endereço IP do seu celular. |
| **Tudo** | Os arquivos também. Nada vai para um relay sem o Tor. |

**Por quê:** um espaço novo começa com **Nada**, pois o Tor deixa as mensagens mais lentas; um espaço feito antes
mantém a sua escolha. Com **Mensagens**, o que você escreve fica escondido pelo Tor e nunca espera por ele, enquanto
imagens, arquivos e mensagens de voz, que são grandes, vão direto e por isso mais rápido.

- **Ativar o Tor:** de **Nada** para **Mensagens** ou **Tudo**, o Erevos pergunta antes **Ativar o Tor?** e diz que as
  mensagens ficam mais lentas; **Cancelar** mantém **Nada**.

- **Uma só conversa pelo Tor:** numa conversa do Erevos, **Detalhes** → **Pelo Tor** envia as mensagens e os arquivos
  dessa conversa só pelo Tor, em circuitos do Tor próprios, seja qual for a escolha deste espaço; fica desativado a
  menos que você ative. O relay então não vê o endereço IP do seu celular para essa conversa, e nenhuma saída do Tor a
  leva junto com outra conversa. É mais lento, e o que sai espera enquanto o Tor inicia. As chamadas não passam pelo
  Tor. As conversas ocultas também o têm, cada uma nos seus próprios **Detalhes**.
  É igual nos seus dispositivos conectados: ativado ou desativado em um, fica assim em todos. Num dispositivo sem Tor,
  como o app web, essa conversa não envia nada enquanto estiver ativado.
  Vale também para os textos Nostr dessa conversa e para as fotos e os arquivos dela em servidores de arquivos Nostr,
  mesmo quando a escolha deste espaço é **Nada**: o Tor é iniciado para eles e nada vai direto. Até o seu contato
  escrever pela primeira vez na fila própria da conversa, as primeiras mensagens dele chegam à fila do espaço, que é
  lida do jeito que o espaço diz. Veja [Quem vê o seu endereço de internet](#ip).

- **O que ele esconde:** o relay não vê mais o endereço IP do seu celular, só uma saída do Tor (ou nada, para um relay
  com endereço \`.onion\`). A sua operadora ou a rede Wi-Fi só veem que você usa o Tor, não qual relay.
- **O que ele custa:** o que passa pelo Tor chega e sai mais devagar, e o primeiro início do Tor demora um pouco. A
  tela mostra até onde o Tor chegou. Para poupar a bateria, o Erevos envia o preenchimento reduzido que o Tor criou
  para celulares: o tráfego de enchimento que o Tor envia para esconder quando você fala vai a cada 9 a 14 segundos,
  não a cada poucos, e nenhum chega ao celular.
- **O que ele não cobre:** as chamadas, cujo som e imagem vão direto entre os celulares ou pelo relay de chamadas; os
  celulares por perto{~ e o SMS}, que não usam a internet.
- **Só no Android:** o {=Erevos} num computador e o app web ainda não têm Tor, então ali tudo vai direto.

> Com **Mensagens**, uma mensagem nunca espera pelo Tor: uma que o Tor não conseguiu levar ao relay vai direto na
> hora, e também as mensagens enquanto o Tor inicia, ou por um minuto depois de ele não conseguir chegar ao relay;
> então o Tor é tentado de novo. Com **Tudo**, nada vai para um relay sem o Tor: quando o Tor não consegue chegar ao
> relay, a mensagem espera e é tentada de novo; o Erevos nunca volta sozinho para a sua própria conexão.

### Pontes

Onde o próprio Tor está bloqueado, **Pontes** na mesma tela deixa o Tor chegar à rede dele por pontes. Fica em **Sem
pontes** a menos que você escolha, cada espaço tem a sua escolha, e só conta enquanto algo passa pelo Tor.

| Opção | O que é |
| --- | --- |
| **Automático** | O Erevos tenta os caminhos um por vez até o Tor conectar: direto, as pontes obfs4, Snowflake, depois suas próprias linhas, se tiver. Lembra por 30 dias o que funcionou no Wi-Fi e nos dados móveis, e tenta ele primeiro; em outra rede procura de novo. Com **Minha rede é vigiada** ligado, nunca tenta direto, e a rede vê só uma ponte. |
| **obfs4** | As pontes obfs4 que vêm com o Tor Browser. Para quem vigia a rede, o Tor parece bytes aleatórios. Um censor que as conheça pode bloqueá-las. |
| **Floco de neve** | Pelos navegadores de voluntários, via WebRTC, como passa uma videochamada. Para encontrar um, o Erevos pergunta ao broker do Snowflake por uma CDN, atrás do nome de outro site, e servidores STUN dizem ao celular o próprio endereço dele: eles veem esse endereço, nunca as suas mensagens. Mais lento, e difícil de bloquear. |
| **Minhas** | Linhas de pontes de bridges.torproject.org, de bridges@torproject.org por e-mail, ou de @GetBridgesBot no Telegram, coladas uma por linha; depois toque em **Usar estas pontes**. Funcionam pontes obfs4, Snowflake, WebTunnel, meek e simples. |

- **Só por elas:** com pontes, o Tor nunca vai direto aos relays dele. Quando nenhuma ponte responde, com **Tudo** as
  mensagens esperam, como quando o Tor não consegue chegar ao relay; com **Mensagens** elas vão para o relay sem o Tor
  até uma responder. Linhas que não são pontes não são aceitas, e o Tor fica desligado.
- **Verificar minha conexão**, embaixo, diz se o Tor conecta, e por qual caminho, nunca o endereço do celular. Com
  **Automático**, procura de novo desde o começo.
- **Trocá-las** enquanto o Tor roda fecha as conexões dele e as refaz do novo jeito.
- **Só no Android:** o app traz o lyrebird, o próprio programa do Tor para obfs4, Snowflake, WebTunnel e meek. Um
  computador e o app web ainda não têm Tor, então também não têm pontes.

## Pelo Nostr {#nostr}

Em **Configurações** → **Relay e redes** → **Nostr**, **Textos pelo Nostr** fica **Ativado** a menos que você mude.
Então o que você escreve para um contato cujo {=Erevos} também lê no Nostr passa primeiro pelos seus relays: o seu relay,
depois os relays de casa do contato, depois o seu relay de casa; e por relays Nostr públicos só quando nenhum deles o
aceitou. Cada espaço tem a sua própria escolha, e os seus próprios relays Nostr.

- **Como é selado:** criptografado de ponta a ponta como sempre, depois selado mais uma vez para uma chave que o seu
  contato deu só a esta conversa, e assinado por uma chave feita para aquele único texto (um gift wrap NIP-59). Os
  relays Nostr veem que alguém escreveu para uma chave que não nomeia ninguém, quando, e de que tamanho; não quem
  escreveu, nem para quem. O seu relay não vê o que foi por esse caminho.
- **O que os relays Nostr podem saber:** o seu celular pede a cada um deles todas as chaves dele de uma vez:
  um relay pode saber que essas chaves são lidas juntas. Pelo Tor, nunca de onde: cada relay é acessado por circuitos
  do Tor próprios, então nenhuma saída do Tor leva o que vai para dois deles, e nenhum pode saber que é de um mesmo
  celular. Com **Nada** vai direto, então eles veem o endereço IP do seu celular, mas ainda não quem escreveu para quem.
  Alguns relays recusam algumas saídas do Tor, e algumas saídas não conseguem chegar a um relay: depois de uma falha
  assim, a próxima tentativa passa por outra saída.
- **Como vai:** com **Nada**, os textos vão direto aos relays Nostr. Com **Mensagens**, pelo Tor quando o Tor está
  pronto, e pelo seu relay enquanto o Tor inicia. Com **Tudo**, só pelo Tor. Quando a via muda, as conexões Nostr se
  fecham e se abrem de novo pela via nova.
- **Nostr pelo Tor:** na tela **Nostr**, **Nostr pelo Tor** fica **Desativado** a menos que você ative. **Ativado**, o
  Erevos acessa os relays Nostr e os servidores de arquivos Nostr só pelo Tor e inicia o Tor para isso, mesmo quando o
  Tor do espaço é **Nada**; um texto que vai para lá espera enquanto o Tor inicia. Isso só acrescenta o Tor: com o Tor
  ativado para o espaço, o Nostr passa pelo Tor seja o que for que isto diga, e uma conversa com **Pelo Tor** passa
  pelo Tor seja o que for que isto diga. Veja [Quem vê o seu endereço de internet](#ip).
- **Os relays:** relay.damus.io, nos.lol e relay.primal.net a menos que você os mude; você pode acrescentar os seus,
  cinco no máximo. Os seus contatos ficam sabendo dos relays em que você lê, e escrevem para você ali; basta que um
  aceite um texto.
- **O que fica no seu relay:** chamadas, reações, e as marcas de que uma mensagem chegou ou foi lida; e o que você escreve para contatos num iPhone ou num computador, que não leem no Nostr. Imagens, arquivos e mensagens de voz vão pelo seu relay quando há um entre vocês; sem relay entre vocês, vão também pelo Nostr (veja Sem nenhum relay).
- **Por onde foi:** segure uma mensagem: o menu dela diz **Foi pelo Nostr** ou **Veio pelo Nostr** quando um relay Nostr
  a pegou. De agora em diante ela também diz **Foi pelo relay**, **Veio pelo relay**, **Foi para o telefone dele por
  perto**, **Veio de um telefone por perto** ou **Foi por LoRa**; uma mensagem de antes não diz nada. A nota abaixo das
  mensagens também diz **Enviada pelo Nostr**. Dois celulares lado a lado trocam textos por perto primeiro, depois
  pelos relays; o Nostr leva um texto só quando os relays não o aceitaram.
- **O que os relays fizeram por último:** a tela **Nostr** mostra, para cada relay, se ele aceitou o último texto que
  recebeu e quantos segundos depois, ou por que não, e se o seu celular lê nele. Isso fica guardado só neste celular,
  até o Erevos fechar. Um texto nunca espera pelos relays Nostr enquanto os seus relays o aceitam.
- **Só no Android,** como o Tor.

**Por quê:** os relays Nostr são públicos, então, com o Tor ativado no espaço, o Erevos os acessa pelo Tor, e eles nunca
ficam sabendo onde está o seu celular; com **Nada** os acessa direto. Só os textos vão para lá, como reserva dos seus
relays: um texto que foi para lá passa de novo pelo seu relay, caso não chegue, enquanto as marcas de que uma mensagem
chegou ou foi lida não teriam nenhuma, e uma mensagem enviada para mais tarde precisa do seu relay para guardá-la até o
horário dela. Sem relay entre vocês, imagens, arquivos e mensagens de voz vão para lá também (veja Sem nenhum relay).

> Um texto que passou pelo Nostr passa de novo pelo seu relay se o celular do seu contato não disser em cinco minutos
> que ele chegou, e o contato o vê uma vez. Quando nem os seus relays nem nenhum relay Nostr o aceitam, ele espera e vai
> de novo, como qualquer mensagem.

- **As conversas ocultas:** elas também leem no Nostr, enquanto estão abertas, e fechadas também enquanto **Receber
  quando fechadas** está ativado para elas e o espaço está aberto (veja [Conversas ocultas](#hidden)). Fechadas,
  ainda mostram "New message": a cada texto pelo Nostr, o seu contato também envia ao seu relay um sino, uma mensagem
  que não diz nada, que o seu relay conta como uma, como antes. Sem relay, o link de contato e o código QR delas dizem
  onde elas leem no Nostr, com uma chave só daquela posição, e textos, reações e as marcas de que uma mensagem chegou
  vão para lá, como de um celular sem relay.

### Sem nenhum relay {#nostr-only}

Um celular sem relay, sem convite e sem conta LPHL ainda pode começar: o link de contato e o código QR dele dizem onde
ele lê no Nostr, e isso basta para conversar.

- **Para começar:** em **Nova conversa**, toque em **Começar sem relay**, depois em **Mostrar meu código QR** ou
  **Compartilhar meu link de contato**, e dê para alguém que usa o {=Erevos}. Quem o adiciona escreve para você pelo
  Nostr, e aparece como solicitação de mensagem, que você aceita. Você também pode adicionar o link ou o
  código QR da pessoa, do mesmo jeito.
- **O que vai:** textos, figurinhas, reações, edições, e as marcas de que uma mensagem chegou ou foi lida, tudo pelo Nostr; e fotos, arquivos e mensagens de voz. Uma mensagem de voz vai em wraps como um texto. Uma foto de até 3 MB vai em pedaços de 32 KB, um wrap cada, enviados antes da mensagem que a oferece; o outro celular os guarda, criptografados com o resto do espaço ou das conversas ocultas para os quais vieram, até chegarem todos, quatro dias no máximo. Uma foto maior, um vídeo ou qualquer outro arquivo, de até 20 MB, vai como um só blob, cifrado no celular, para um servidor de arquivos Blossom (blossom.primal.net, blossom.band ou nostr.download), pelo Tor como diz a escolha de Tor do espaço (direto com **Nada**): o servidor guarda só o que não consegue ler. Chamadas e grupos precisam de um relay, ou do outro celular por perto. As conversas ocultas também funcionam assim, só pelo Nostr (veja [Conversas ocultas](#hidden)).
- **Quando não chega:** os relays Nostr guardam um texto por dois dias. Até o celular do seu contato dizer que ele
  chegou, o Erevos o entrega de novo uma vez por dia, por duas semanas.
- **Um relay sozinho:** quando o seu contato tem um relay que o deixa convidar, o {=Erevos} dele envia ao seu um convite
  para esse relay sozinho, uma vez, na conversa, quer vocês tenham se conhecido pelo Nostr ou por perto, por
  Bluetooth, Wi-Fi ou um código QR. O seu celular o aceita sozinho, e a partir daí fotos, mensagens de voz e chamadas
  também funcionam, com todo mundo. Conta como um dos convites dele. Alguém cuja solicitação de mensagem você não
  aceitou não escolhe nenhum relay para você: o convite dele espera até você aceitá-lo, uma semana no máximo.
- **Um Erevos mais antigo** não lê a parte do Nostr de um link: ele só alcança você por perto, até você ter um relay.

**Por quê:** o Nostr é só a porta de entrada. Ninguém precisa de convite para começar, e assim que um de vocês tem um
relay, ele leva o que é grande demais para o Nostr.

## Quem vê o seu endereço de internet {#ip}

O endereço de internet do seu celular, o endereço IP dele, mostra mais ou menos onde você está e qual provedor você
usa. Não mostra o que você escreve. Quem se conecta ao seu celular o vê, a menos que a conexão passe pelo Tor.

- **O seu relay e os relays dos seus contatos:** eles o veem. Para escondê-lo, ative o Tor para o espaço
  (**Configurações** → **Relay e redes** → **Tor**) ou **Pelo Tor** nos **Detalhes** de uma conversa. Veja [Pelo
  Tor](#tor).

- [+] **XMPP:** seu servidor XMPP o vê enquanto o Erevos está conectado, a não ser que a conta passe pelo Tor; os
  servidores dos seus contatos e grupos não, já que o seu servidor leva suas mensagens até eles. O Erevos avisa antes de
  você enviar em uma conversa enquanto a conta não passa pelo Tor (com **Pelo Tor** para essa conversa como solução),
  antes de cada chamada e antes de baixar um arquivo de outro servidor que não o seu. Veja [XMPP](#xmpp).

- **Os relays Nostr públicos e os servidores de arquivos Nostr:** eles o veem, a menos que a conexão passe pelo Tor.
  Ative **Nostr pelo Tor** em **Configurações** → **Relay e redes** → **Nostr**, ou **Pelo Tor** para uma conversa.
  Veja [Pelo Nostr](#nostr).
- **Parear com um código:** os dois celulares se encontram nesses mesmos relays públicos do Nostr, então sem Nostr pelo
  Tor eles veem o endereço, mas não o código nem os links de contato. O Erevos avisa antes da primeira vez.

- [+] **Matrix:** só o seu próprio servidor Matrix o vê, não os servidores dos seus contatos: fotos e arquivos de outros
  servidores também chegam a você pelo seu. Escolha **Tor para esta conta do Matrix** na tela do Matrix, ou ative **Pelo
  Tor** sob os botões de uma conversa, que leva toda a conta pelo Tor. Veja [Matrix](#matrix).
- [+] **Telegram:** os servidores do Telegram o veem, a não ser que a conta vá pelo Tor: escolha **Sempre pelo Tor** em
  **Tor para esta conta do Telegram**, nas configurações do Telegram, ou ligue **Pelo Tor** nas informações de uma
  conversa, que leva a conta inteira pelo Tor. Veja [Telegram](#telegram).
- [+] **Conversas com outros apps Nostr e o feed Público:** seus relays e servidores de arquivos o veem, a menos que a conta
  passe pelo Tor (**Tor** na tela **Conversas Nostr**) ou o **Pelo Tor** da conversa esteja ligado. Publicar, curtir ou
  votar no feed Público, e suas fotos e prévias de links sem Tor, também o mostram. Veja [Conversas com outros apps
  Nostr](#nostr-chats).
- [+] **Messenger, Signal e Session** (Erevos+): os servidores deles o veem (os da Meta, os do Signal, ou o primeiro nó do
  Session), não os seus contatos, a não ser que a conta vá pelo Tor: escolha **Sempre pelo Tor** em **Tor para esta
  conta do …** na tela dela, ou ative **Pelo Tor** em uma conversa, o que envia a conta inteira pelo Tor. A entrada, o
  captcha do Signal, as fotos do Messenger e **Abrir Facebook** vão do mesmo jeito. O Erevos avisa antes de você enviar em uma conversa
  enquanto a conta não vai pelo Tor, e antes de cada chamada. Veja [Messenger](#messenger), [Signal](#signal) e [Session](#session).

- **As chamadas:** nunca passam pelo Tor. O relay de chamadas, o seu ou o do seu contato, vê o endereço, mas não o que
  é dito. Uma chamada entre celulares próximos na mesma rede fica nessa rede.

- **Um arquivo num servidor que seu contato escolheu:** o servidor vê o endereço quando o seu celular baixa o arquivo.
  O Tor o esconde.

- **Os links da web que você abre:** o site o vê, como qualquer página da web. Para escondê-lo, abra os links no Tor
  Browser. A prévia de um link também é baixada do site dele, e o site vê o endereço do mesmo jeito.
  Com o **Pelo Tor** ligado nas prévias de links, ele não vê.

- **O relay de um contato:** enquanto o seu espaço não tem relay próprio, ou só um lugar emprestado em um, um contato
  pode lhe dar um lugar no dele, e ele vem com a mensagem dele. O relay dele então vê o endereço, por isso o Erevos
  pergunta antes de aceitá-lo, a menos que o espaço envie tudo pelo Tor. Se não for aceito, o convite é deixado de
  lado.

- **Os grupos:** uma mensagem num grupo do Erevos passa por um servidor, que vê o endereço. O Tor para o espaço o
  esconde; um grupo não tem botão próprio.

- **Backups, {~o servidor da Coleção, listas de rádio e TV, |}prévias de links e atualizações:** cada um tem a sua própria
  chave **Pelo Tor**, na sua própria tela, desligada a menos que você a ligue. Veja [Backups](#backup),
  {~[Coleção](#collection), |}[Conversar por um relay](#relay) e [Atualizações](#updates).

- [~] **Estações de rádio e canais de TV:** cada um vê o endereço enquanto toca. **Tocar pelo Tor**, nas configurações da
  Coleção no Android, desligado a menos que você o ligue, toca-os só pelo Tor. Veja [Coleção](#collection).

O Erevos avisa uma vez antes de cada um desses casos, com o título **Seu endereço de internet pode ser visto**, um
botão **Guia** que abre esta seção e, onde pode, um botão que resolve, como **Pelo Tor para esta conversa**.
**Prosseguir** segue em frente; para uma conversa isso é dito uma vez e não de novo para essa conversa.

Depois do guia, a mesma pergunta volta, e o que você estava enviando, como uma mensagem de voz ou um arquivo, espera
por ela. Uma chamada que toca aqui diz isso embaixo da chamada, e atender segue em frente. As conversas ocultas
guardam o que foi dito com elas, separado do espaço.

Celulares próximos{~, LoRa e SMS| e LoRa} não usam a internet, então não mostram endereço de internet.

## Matrix {#matrix}

Em **Configurações** → **Relay e redes** → **Matrix**, um espaço pode entrar numa conta Matrix, para conversar com pessoas
que usam o Element ou outro app Matrix. O Erevos fala ele mesmo com o servidor Matrix, como o Element: nenhuma ponte
fica no meio.

- **Entrar:** seu ID Matrix, como @nome:matrix.org, e a senha dele. O Erevos vira um novo dispositivo da conta,
  chamado Erevos. A sessão e as chaves do dispositivo ficam criptografadas neste espaço, e estão nos backups: depois de
  restaurar, o espaço entra de novo, como um novo dispositivo. As conversas ocultas dele podem ter uma conta Matrix
  própria, veja [Conversas ocultas](#hidden).
- **Login único:** no Android, quando seu servidor Matrix faz as pessoas entrarem em outro lugar (como o matrix.org
  pede em contas novas), **Entrar com login único (SSO)** abre o navegador nessa página, e volta para o Erevos quando
  você tiver entrado lá; um servidor com vários provedores deixa você escolher um. O navegador não passa pelo Tor,
  então essa página vê seu endereço. Como não há senha a dar, o Erevos cria as chaves de assinatura cruzada da conta
  só quando o servidor as aceita sem pedir de novo; senão, verifique este dispositivo por emoji ou código QR a partir
  de outro seu, ou digite a chave de segurança.
- **Conversas:** **Nova conversa** começa uma conversa criptografada com um ID Matrix. Os convites aparecem primeiro,
  com **Entrar** e **Recusar**. Escreva um nome em vez de um ID do Matrix para procurar pessoas no diretório de usuários
  do seu servidor Matrix, que fica sabendo quem você procurou; **Iniciar** começa a conversa com a pessoa em quem você
  tocar.
- **Grupos:** **Novo grupo**, na tela do Matrix, cria um grupo criptografado com um nome e os IDs do Matrix que você
  escrever, cada um convidado a entrar, como o Element cria um; todos nele veem quem são os outros. **Entrar num
  grupo** entra em um pelo endereço, como #name:matrix.org. Um grupo público pode não ser criptografado, e então a
  tela dele diz isso. Num grupo, **Convidar** convida outra pessoa, se o grupo deixar.
  Ao digitar **@** num grupo aparecem os membros; uma mensagem cita quem foi escrito por inteiro, e os apps dessas
  pessoas avisam.
- **Membros:** num grupo, **Membros** lista as pessoas dele e mostra quem é **dono**, **admin** ou **moderador**, como
  dizem os níveis de poder delas. Onde o seu nível permite, você renomeia o grupo, define o **Assunto** dele, **Tornar
  admin** ou **Remover como admin**, **Remover** alguém (as mensagens do grupo deixam de chegar a ela) ou **Banir** (ela
  não pode entrar de novo até um admin deixar).
- **Criptografia:** as mensagens são criptografadas de ponta a ponta com a criptografia do próprio Matrix (Olm e
  Megolm, pelo vodozemac). Uma conversa sem criptografia avisa.
- **Não anônimo:** o servidor Matrix vê sua conta, quem fala com quem e quando, e, sem Tor, de onde. Numa conversa com
  pessoas de outros servidores, esses servidores também veem.
- **Pelo Tor:** no Android, a tela do Matrix, também antes de entrar, tem a escolha de Tor que toda conta tem:
  **Desativado** (o padrão) vai direto, e o servidor Matrix vê o seu endereço; **Como o espaço** segue
  **Configurações** → **Relay e redes** → **Tor**: com **Mensagens**, pelo Tor assim que está pronto e direto enquanto
  inicia, fotos e arquivos diretos; com **Tudo**, tudo só pelo Tor; **Sempre pelo Tor** manda esta conta só pelo Tor,
  também ao entrar, e nada sem ele. O Tor usa as pontes do espaço. **Pelo Tor** de uma conversa, sob seus botões, faz
  toda a conta ir só pelo Tor enquanto estiver ativado: o Matrix tem uma conexão para todas as conversas de uma conta.
  As chamadas nunca passam pelo Tor.
- **Mensagens de antes:** uma mensagem enviada antes de o Erevos entrar, ou cuja chave ainda não chegou, aparece
  bloqueada.
- **Fotos e arquivos:** **Foto** e **Arquivo** os enviam, até 50 MB, criptografados no celular antes de irem ao
  servidor Matrix, que assim guarda só o que não consegue ler. Uma foto recebida só é baixada ao tocar em
  **Mostrar foto**; **Salvar** guarda qualquer arquivo no celular.
  Toque numa foto mostrada para vê-la na tela inteira, como na conversa de um contato: dois dedos ou um toque duplo a
  ampliam, ela gira com o celular, e **Salvar** a guarda (veja Fotos e arquivos, em [Conversar por um relay](#relay)).
- **Figurinhas:** uma figurinha que o Element, o FluffyChat ou o Element X enviam aparece na conversa; **Mostrar
  figurinha** a busca pelo seu servidor Matrix. **Figurinha** envia as suas próprias figurinhas feitas de fotos
  (**Minhas**) como imagens, criptografadas onde a conversa é. Os conjuntos embutidos também estão lá: cada figurinha
  vai como a imagem dela, feita no seu aparelho, com as palavras dela para os apps que só mostram essas.
- **Reações, respostas, alterações e apagar:** segure uma mensagem para abrir o menu dela: escolha uma reação no alto,
  **Responder** para respondê-la, **Copiar** para as palavras dela, e numa mensagem sua **Editar** ou **Apagar**. Uma
  resposta mostra a mensagem a que responde acima das palavras dela, e um toque nisso vai até a mensagem. As reações
  aparecem abaixo de uma mensagem; toque numa para reagir igual, ou toque na sua para retirá-la. Elas não são
  criptografadas, como o Element as envia, nem numa conversa criptografada: o servidor do Matrix vê qual mensagem
  recebeu qual reação, e de quem. Só você pode alterar as suas próprias mensagens, e uma alterada diz **Editada**.
  **Apagar** retira uma mensagem sua para todos na conversa, depois que você confirma; não dá para desfazer, e a
  conversa mantém uma linha dizendo que ela foi apagada.
- **Várias mensagens:** **Selecionar**, no menu de uma mensagem, a escolhe, e um toque acrescenta outras; depois
  **Copiar**, **Encaminhar** ou **Apagar**. **Apagar** as retira para todos na conversa, depois que você confirma: as
  suas e, onde o seu nível permite, as de outros. Não dá para desfazer.
- **Este celular ou todos:** **Apagar**, para uma mensagem ou várias, pergunta antes: **Este celular** as apaga só
  aqui, e elas ficam ocultas se chegarem de novo; **Para todos** as retira como dito acima, oferecido só quando cada
  uma pode ser retirada.
- **Digitando:** quem está escrevendo agora no chat, como o servidor Matrix diz, aparece embaixo com **digitando…**. O
  Erevos só diz isso de você se você ativar **Avisar quando estou escrevendo** na tela do Matrix; no início fica
  desligado, pois passa pelo servidor Matrix sem criptografia, então o servidor fica sabendo cada vez que você
  escreve.
- **Online:** numa conversa com uma pessoa, embaixo do nome dela aparece **Online**, **Ausente** ou **Não incomodar**,
  com as palavras que ela pôs, ou quando esteve online pela última vez, como o servidor Matrix dela diz, e a foto dela
  na lista de conversas tem um ponto verde enquanto está online. Alguns servidores não dizem isso. O Erevos só diz
  isso de você se você ativar **Avisar quando estou online** na tela do Matrix; no início fica desligado, pois passa
  pelo servidor Matrix sem criptografia.
- **Marcas:** as suas mensagens mostram **✓** quando o servidor Matrix as recebeu e **✓✓✓** quando todos os outros
  membros da conversa as leram, como o app Matrix de cada um avisa o servidor dele (confirmações de leitura). O Matrix
  não tem marca para uma mensagem que chegou a um celular, então não existe **✓✓**. Segure uma mensagem sua e escolha
  **Quem leu** para ver quem a leu e quando, e quem não leu (os primeiros 100). Um app Matrix pode ser configurado
  para não enviar confirmações de leitura: o membro dele aparece então como quem não leu.
- **Fotos de perfil:** uma sala do Matrix, ou a pessoa numa conversa com uma pessoa, mostra a foto na lista de
  conversas, e o mesmo vale para um contato do XMPP. **Escolher uma foto**, na tela do Matrix, põe a sua para seus
  contatos; **Remover** a tira. As fotos não são criptografadas em nenhum app Matrix ou XMPP: o servidor as vê, e seus
  contatos veem a sua.
- **Mensagens anteriores:** uma conversa com mais histórico no servidor do Matrix mostra **Carregar mensagens
  anteriores** no alto; cada toque traz mais, e a conversa fica onde você estava lendo. Uma mensagem cuja chave ainda
  não chegou aparece bloqueada.
- **Mensagens de voz:** toque e segure o microfone abaixo do campo de mensagem para gravar, e solte para enviar; deslize
  para a esquerda antes de soltar para descartar a gravação. Um minuto é o máximo, e um toque de menos de um segundo não
  envia nada. Com o TalkBack, toque nele uma vez para começar e de novo para enviar. Numa conversa criptografada ela é
  criptografada como uma foto, e o Element e outros apps Matrix a tocam como mensagem de voz. Uma que chega toca com
  **Reproduzir**, e só é buscada quando você a reproduz. A forma de onda vai com ela, como o Element a desenha, e uma
  que chega com forma de onda a mostra abaixo de **Reproduzir**, colorida enquanto toca.
- **Verificar por emoji:** numa conversa com uma pessoa, **Verificar por emoji** mostra aos dois sete imagens; se
  forem iguais, na mesma ordem, toquem em **São iguais** nos dois celulares. Assim ninguém pode ficar no meio sem ser
  notado, e a conversa diz **Verificado por emoji**. **Verificar este dispositivo com outro seu**, na tela do Matrix,
  faz o mesmo com o seu próprio Element, para que ele confie no dispositivo do Erevos. O Element também pode começar
  qualquer uma das duas.
- **Verificar por código QR:** quando os dois lados aceitaram uma verificação, e os dois apps conseguem, o cartão
  mostra um código e **Fotografar o código deles**. Deixe o outro app fotografar o código mostrado aqui (no Element:
  **Escanear**) e responda **Sim, diz** quando ele disser que a verificação deu certo; ou fotografe o código que o app
  deles mostra. **Comparar emoji em vez disso** vai pelo outro caminho. O código tem as chaves das duas contas (ou
  dispositivos) e um segredo de uso único, então um código de alguém no meio não confere. Nada é considerado confiável
  até os dois lados dizerem que terminaram.
- **Chave de segurança:** em **Chave de segurança**, na tela do Matrix, digite a chave (ou frase) de segurança que o
  Element criou: as mensagens anteriores abrem a partir do backup de chaves da conta, as chaves novas vão para ele, e
  seus outros dispositivos confiam neste. Uma conta sem ela pode **Criar uma chave de segurança** aqui; anote-a,
  porque o Erevos não a guarda.
- **Chamadas:** os dois blocos no topo da conversa ligam por voz ou com vídeo, com o Element Call, o app de chamadas
  do Element e do Element X, que o Erevos leva dentro dele e mostra por cima do app, numa janela própria: no Android,
  no app web e num computador (Windows, macOS e Linux). A seta de voltar dele, ou a tecla Esc, deixa a janela pequena,
  num canto por cima do Erevos, para você continuar usando o Erevos durante a chamada; um toque na janela pequena a traz
  de volta ao tamanho cheio. Até a chamada começar, um botão **Fechar** embaixo dela a encerra, caso ela nunca comece.
  As chamadas para você tocam aqui como as do próprio Erevos, enquanto este espaço está aberto: **Atender** abre o
  Element Call na chamada, **Recusar** avisa quem liga. Som e imagem são criptografados de ponta a ponta, com chaves
  que só quem está na chamada tem, e passam pelo servidor de mídia (LiveKit) que o seu servidor Matrix indica, que vê o
  endereço deste dispositivo; um servidor Matrix sem um não consegue ligar. O que o Element Call diz ao servidor Matrix
  passa pelo Erevos, e pelo Tor como o resto do Matrix, mas a chamada em si nunca passa pelo Tor. O Element Call não
  chega a nenhum rastreador. As chamadas Matrix mais antigas entre duas pessoas, como o FluffyChat faz, tocam aqui também (veja **Chamada antiga**).
  Enquanto uma chamada Matrix está em andamento ou tocando, outra chamada, do próprio Erevos ou no XMPP, não toca e
  aparece como perdida, e vice-versa. No Android, Voltar ou sair do Erevos deixa a janela da chamada pequena sobre
  outros apps (picture in picture). O Sailfish OS não tem chamadas Matrix.
- **No app web e num computador:** o navegador ou o computador pede uma só vez a câmera e o microfone; num computador,
  só a janela da chamada pode usar a câmera. Para onde vai o som e qual microfone é usado, quem decide é o computador ou
  o navegador. No app web, o Element Call vem de um segundo endereço só dele, erevos-call.lphl.nekten.eu, e num
  computador de uma parte separada do app, de modo que não consegue ler nada do Erevos: nem as chaves dele, nem as
  conversas. O app web confere os arquivos do Element Call com a mesma versão assinada do próprio app antes de
  executá-lo; por isso a primeira chamada no app web demora um pouco mais, enquanto ele busca e confere o Element Call.
  **Por quê:** o código do Element Call não é escrito pelo Erevos, então ele roda separado do Erevos, onde nunca chega
  perto das chaves e das conversas dele.
- **Notificações:** uma mensagem que chega mostra um aviso e conta no número do ícone do Erevos, como nas conversas do
  próprio Erevos, enquanto este espaço está aberto; num computador, enquanto o Erevos roda. No Android,
  **Notificações**, no fim de uma conversa, silencia ela ou dá a ela um som próprio; uma conversa silenciada não conta.
  **Aparência da conversa**, ao lado, dá à conversa uma aparência própria.
- **Enquanto este espaço está fechado:** no Android, **Avisar quando chega mensagem**, em **Enquanto este espaço está
  fechado** na tela do Matrix, deixa este espaço dizer “Nova mensagem” quando chega algo no Matrix enquanto outro
  espaço está aberto, como fazem as conversas dele com **Também enquanto outro espaço está aberto** em
  **Configurações** → **Notificações** → **Em segundo plano**, que também é preciso. Nunca diz o quê, de quem ou em
  qual conversa, e uma chamada não toca então: só a chave do espaço abre o que chegou. Para isso o servidor Matrix
  avisa o relay deste espaço de cada mensagem, sem nenhuma palavra dela, então o servidor Matrix fica sabendo o
  endereço do relay, e o relay quando chegam mensagens. Desligado até você ligar; precisa de um relay atualizado para
  isso, que o servidor Matrix alcance.
- **Tópicos:** segure uma mensagem e escolha **Responder no tópico** para responder em um tópico. Um tópico abre em
  uma tela própria, e uma mensagem com respostas diz quantas são; toque nela para abrir o tópico. Aplicativos sem
  tópicos mostram as respostas como respostas simples.
- **Enquetes:** **Enquete**, sob a caixa de mensagem, faz uma pergunta com várias opções. Toque em uma opção no balão
  para escolhê-la, e toque de novo para tirá-la; todos veem quem escolheu o quê. Quem fez uma enquete pode segurá-la e
  escolher **Encerrar enquete**: depois disso nenhum voto conta.
- **Localizações:** **Localização** envia onde você está, uma vez, como o Element faz; vai criptografada como a
  conversa e aparece com **Abrir no mapa** no Android.
- **Prévias de links:** com as **Prévias de links** ligadas, como nas conversas com seus contatos, o primeiro link de
  uma mensagem vai com uma prévia feita pelo seu celular, criptografada também em uma conversa criptografada. Pelo Tor só com o **Pelo Tor** ligado nas **Prévias de links**, e nunca em um lugar oculto.
- **Fixar e encaminhar:** **Fixar**, no menu de uma mensagem, a fixa no alto da sala para todos, se a sala deixar; uma
  barra sobre a conversa mostra a última mensagem fixada, e um toque vai até ela e depois mostra a seguinte.
  **Desafixar** a tira. **Encaminhar** envia uma cópia para outra conversa desta conta; a cópia não compartilha nada
  com a original. Uma conversa sem criptografia diz isso ao lado do nome, pois o servidor dela lê uma cópia enviada
  para lá.
- **Encontrar grupos:** **Encontrar um grupo**, na tela do Matrix, busca entre as salas públicas do seu servidor
  Matrix, ou de outro que você escrever, que então fica sabendo o que você procura. **Espaços** lista as salas dos
  espaços em que você está, para entrar. **Buscar mensagens** busca só entre as mensagens guardadas neste celular, e
  não pergunta a ninguém.
- **Favoritos:** segure uma conversa na lista para **Tornar favorito** (vai primeiro), **Baixa prioridade** (vai por
  último) e **Sair e esquecer**, que faz o servidor Matrix esquecê-la também, e seus outros aplicativos Matrix deixam
  de mostrá-la. Ficam guardados na sua conta, então seus outros aplicativos Matrix ordenam igual.
- **Uma conta nova:** na tela de entrada, **Criar uma conta nova** cria uma em um servidor Matrix que permita, a
  partir de um servidor, um nome e uma senha. Se o servidor pedir, o Erevos pede que você aceite os termos dele, dê um
  token de registro ou faça uma etapa na página própria do servidor, como um captcha, que abre no navegador, não pelo
  Tor. Um servidor que pede um e-mail cria contas só no site dele; crie uma lá e depois entre aqui.
- **Dispositivos:** **Dispositivos**, na tela do Matrix, lista os dispositivos da conta com a última vez em que cada
  um foi visto. **Renomear** dá um nome novo a um. **Desconectar os outros dispositivos** os tira da conta: perdem as
  chaves e não conseguem mais ler o que chega. O servidor Matrix pede primeiro a sua senha.
- **Chamadas antigas:** em uma conversa com uma pessoa, os ícones de chamada perguntam **Element Call** ou **Chamada
  antiga**. A chamada antiga funciona com o FluffyChat, o Nheko e o Element no computador, e toca aqui quando eles
  ligam. Os sinais dela vão como a conversa, criptografados em uma conversa criptografada, pelo seu relay quando o
  espaço tem um, senão pelo relay de chamadas do seu servidor Matrix; a chamada em si é criptografada (DTLS-SRTP).

**Por quê:** as conversas do próprio Erevos escondem quem fala com quem; um servidor Matrix não consegue. Por isso as
conversas Matrix ficam à parte e marcadas, para as pessoas que você só alcançaria pelo Matrix.

- **O que uma mensagem leva:** as marcas de como as palavras aparecem, como negrito e palavras ocultas, aparecem como
  numa conversa do Erevos (veja [Conversar por um relay](#relay)) e vão com a mensagem, então o Element também as
  mostra. Do que outro app envia, só aparecem negrito, itálico, riscado, código e palavras ocultas: nada nele é
  executado, nenhuma imagem é buscada, e um link mostra para onde leva de verdade. Endereços web podem ser tocados, e
  o Erevos pergunta antes de abrir um. Ao lado de **Foto** e **Arquivo** ficam **Câmera**, **Vídeo**, **Cartão de
  contato** e **Qualidade da foto**: um cartão de contato vai como um arquivo .vcf que qualquer app abre, e um que
  chega aparece como cartão assim que você toca em **Mostrar**, com **Adicionar aos contatos**; um vídeo vai sem as
  partes que dizem onde foi filmado ou com qual celular. Uma mensagem que você encaminha fica marcada **Encaminhada**
  só no seu celular, então os outros nunca sabem de onde veio.
- **Fixadas, por último e com nome:** fixar uma sala a torna sua favorita no Matrix, então seus outros apps do Matrix
  também a mostram fixada, e as salas de prioridade baixa vêm por último. Na lista da tela inicial sua última mensagem
  mostra ✓✓✓ assim que todos na sala a leram. **Dar um nome aqui** (uma pessoa) ou **Nomear aqui** (um grupo), no pé
  da conversa, dá a uma sala um nome seu, só neste celular; ninguém fica sabendo.
- **Rascunhos:** o que você digita e não envia fica como rascunho da conversa, criptografado só neste celular. Ele
  volta quando você abre a conversa de novo, também depois que o Erevos fechou, e a lista da tela inicial o mostra na
  linha da conversa como **Rascunho**. Um tópico do Matrix não guarda rascunho próprio.
- **Enviar mais tarde:** segure **Enviar**, escolha uma hora (**Daqui a 1 hora**, **Hoje à noite 20:00**, **Amanhã
  09:00** ou qualquer dia e hora) e toque em **Enviar mais tarde**. A mensagem espera neste celular, criptografada,
  tracejada depois das mensagens da conversa com sua hora, e sai deste celular nessa hora enquanto o Erevos está
  desbloqueado, no Android também em segundo plano; senão assim que for desbloqueado de novo. Só texto. Toque nela
  para enviá-la agora ou apagá-la. Nas conversas ocultas ela sai só enquanto elas estão abertas, a não ser que recebam
  também fechadas. Uma que um backup restaurado trouxe de volta, cuja hora veio antes da restauração, não sai sozinha:
  o celular de onde veio o backup pode já tê-la enviado.
- **Enviar de novo:** uma mensagem sua que mostra **Não enviada** tem **Enviar de novo** e **Apagar** no menu.
- **Lembrar-me:** o menu de uma mensagem tem **Lembrar-me**. Escolha uma hora: a mensagem, com o nome da conversa
  dela, vai para **Conversa comigo** e lembra você nessa hora. Precisa do **Erevos** ligado em [Módulos](#modules).
- **Mensagens temporárias:** **Mensagens temporárias**, abaixo do campo de mensagem, define um tempo para as mensagens
  novas, enviadas ou recebidas: 5 minutos, 1 hora, 1 dia ou 1 semana depois de cada uma ser enviada. Aí elas saem
  deste celular, e as suas também são retiradas para todos na conversa (os apps deles as mostram como apagadas), ou
  assim que o Erevos voltar a rodar. O que os outros enviaram fica com eles. **Temporária**, ao lado de **Enquete** e
  **Localização**, faz isso só para a próxima mensagem. As mensagens que já estão na conversa ficam.
- **Bloquear:** **Bloquear**, numa conversa com uma pessoa, a coloca na lista de ignorados da sua conta: nada dela
  chega à sua conta do Matrix, em nenhum dos apps dela, e ela não fica sabendo. **Contatos bloqueados**, na tela do
  Matrix, os lista, com **Desbloquear**.

## XMPP {#xmpp}

Em **Configurações** → **Relay e redes** → **XMPP**, um espaço pode entrar numa conta XMPP, para conversar com pessoas
que usam o Conversations, o Monal, o Gajim, o Dino ou outro app XMPP. O Erevos fala ele mesmo com o servidor XMPP, como
esses apps: nenhuma ponte fica no meio.

- **Entrar:** seu endereço XMPP, como name@example.org, e a senha dele. O Erevos acha o servidor pelo endereço;
  **Servidor** só é preciso se ele não achar (um nome, nome:porta ou um endereço wss://). O Erevos vira um novo
  dispositivo da conta. A sessão e as chaves do dispositivo ficam criptografadas neste espaço, e estão nos backups:
  depois de restaurar, a conta segue como um novo dispositivo. As conversas ocultas dele podem ter uma conta XMPP
  própria, veja [Conversas ocultas](#hidden).
- **Conversas:** **Nova conversa** adiciona o endereço aos seus contatos, pede à pessoa que deixe você ver quando ela
  está online, como fazem os outros apps XMPP, e abre a conversa. Quem pede para adicionar você aparece no topo da lista
  e na tela do XMPP, com **Aceitar** e **Recusar**. Os contatos que a conta já tem estão em **Contatos**.
- **Criptografia:** as mensagens são criptografadas com OMEMO, para cada um dos dispositivos da pessoa e para os outros
  dispositivos da sua conta, que leem junto: com OMEMO 2 para um dispositivo cujo app o tem, como o Kaidan, e com a
  versão 0.3, a que o Conversations, o Monal, o Gajim e o Dino falam, para os outros. É código próprio do Erevos, sem
  auditoria, conferido com outras bibliotecas OMEMO. Se os apps deles não têm OMEMO, o Erevos avisa e só escreve quando
  você escolhe **Escrever sem criptografia** para aquela conversa; **Criptografar de novo** volta atrás.
- **As chaves deles:** no fim da conversa estão as impressões digitais dos dispositivos. Compare-as com o que o app
  deles mostra, por outro meio que não a conversa. Uma chave que mudou desde que foi vista pela primeira vez avisa. A
  chave deste dispositivo está na tela do XMPP, duas vezes: como os apps com OMEMO 0.3 a mostram e como o Kaidan a
  mostra. Um dispositivo tem uma só chave nos dois, escrita de duas maneiras.
- **Marcas:** uma marca ao enviar, duas quando o app deles recebeu, três quando leram, como nas conversas do próprio
  Erevos, para apps que enviam essas marcas.
- **Responder, editar, reagir, apagar:** segure uma mensagem para ver o menu dela: **Responder** a responde,
  **Editar** muda as palavras de uma sua, **Apagar** retira uma sua para todos na conversa, e os emojis reagem a ela;
  tocar em uma reação sob uma mensagem reage igual, ou retira a sua. Funcionam com apps que fazem o mesmo, como
  Conversations, Dino, Gajim, Monal e Kaidan; outros apps mostram uma resposta com uma citação do que ela responde, e
  uma edição como uma mensagem nova. As palavras de uma resposta e de uma edição são criptografadas como a conversa,
  mas a qual mensagem se refere uma resposta, edição, reação ou exclusão, e o emoji de uma reação, vão como esses apps
  os enviam, sem criptografia, então os servidores XMPP os veem. Em um grupo, uma mensagem pode ser respondida,
  receber uma reação ou ser apagada depois que o grupo a devolveu. Tocar na citação de uma resposta vai à mensagem que
  ela responde. **Encaminhar** envia uma ou várias mensagens para outra conversa XMPP. **Fixar só para mim** mantém uma
  mensagem no topo da conversa, só neste celular. **Selecionar** escolhe várias mensagens para copiar, encaminhar ou
  apagar; **Apagar** ali retira só as suas.
- **Este celular ou todos:** **Apagar**, para uma mensagem ou várias, pergunta antes: **Este celular** as apaga só
  aqui, e elas ficam ocultas se chegarem de novo; **Para todos** as retira como dito acima, oferecido só quando cada
  uma pode ser retirada.
- **Escrevendo:** quando o app da outra pessoa diz que ela está escrevendo, **digitando…** aparece sob a conversa. O
  Erevos só diz isso de você se você ativar **Avisar quando estou escrevendo** na tela do XMPP, e só para um contato
  que vê sua presença, nunca num grupo; no início fica desligado, pois passa pelo servidor XMPP sem criptografia,
  então o servidor fica sabendo cada vez que você escreve.
- **Online:** embaixo do nome de um contato aparece **Online**, **Ausente** ou **Não incomodar**, com as palavras que
  ele pôs, ou quando esteve online pela última vez, como os apps dele dizem, e a foto dele na lista de conversas tem
  um ponto verde enquanto está online; só de um contato que deixa você ver a presença dele. Como em todo app XMPP, os
  contatos que veem sua presença veem quando o Erevos está conectado; passa pelos servidores XMPP sem criptografia.
- **Fotos de perfil:** uma sala do Matrix, ou a pessoa numa conversa com uma pessoa, mostra a foto na lista de
  conversas, e o mesmo vale para um contato do XMPP. **Escolher uma foto**, na tela do XMPP, põe a sua para seus
  contatos; **Remover** a tira. As fotos não são criptografadas em nenhum app Matrix ou XMPP: o servidor as vê, e seus
  contatos veem a sua.
- **Bloquear:** **Bloquear**, no fim de um chat, impede que as mensagens, chamadas e pedidos dessa pessoa cheguem à
  sua conta XMPP, em qualquer um dos apps dela, como o servidor XMPP faz (XEP-0191); ela não é avisada.
  **Desbloquear** a deixa passar de novo. Quem foi bloqueado em outro app da conta também fica bloqueado aqui.
- **Mensagens de antes:** o que chegou enquanto o Erevos estava fechado é buscado no arquivo do servidor ao conectar,
  se o servidor guarda um. Uma mensagem enviada antes de este dispositivo entrar, ou que não era para ele, aparece
  bloqueada.
- **Fotos e arquivos:** **Foto** e **Arquivo**, sob a caixa da mensagem, enviam um de até 50 MB, ou menos se o seu
  servidor XMPP aceitar menos, pelo envio de arquivos do servidor. Numa conversa criptografada ele é criptografado
  antes neste celular, com uma chave feita só para ele, e a chave vai na mensagem, criptografada com OMEMO, então o
  servidor guarda só o que não consegue ler; Conversations, Monal, Gajim e Dino o abrem. Numa conversa escrita sem
  criptografia o arquivo vai como está. Uma foto, um som ou um arquivo que chega só é baixado ao tocar em
  **Mostrar foto**, **Reproduzir** ou **Salvar**. No Android, os arquivos passam pelo Tor como a conversa.
  Toque numa foto mostrada para vê-la na tela inteira, como na conversa de um contato: dois dedos ou um toque duplo a
  ampliam, ela gira com o celular, e **Salvar** a guarda (veja Fotos e arquivos, em [Conversar por um relay](#relay)).
- **Figurinhas:** **Figurinha** envia as suas próprias figurinhas feitas de fotos (**Minhas**) como fotos,
  criptografadas como a conversa; outros apps XMPP as mostram como fotos. Os conjuntos embutidos também estão lá: cada
  figurinha vai como a imagem dela, feita no seu aparelho. Um pacote de figurinhas que outro app envia (XEP-0449) não é
  baixado: ele mostra as suas palavras.
- **Mensagens de voz:** segure o microfone abaixo da caixa de mensagem para gravar, e solte para enviar, como numa
  conversa do Matrix. Vai como arquivo de som, criptografado como a conversa, do jeito que o Conversations envia. Uma
  mensagem de voz do Conversations ou de outro app XMPP (um arquivo .m4a ou .ogg) também aparece como mensagem de voz,
  com **Reproduzir** e a duração dela.
- **Grupos:** um **grupo privado** é só para os seus membros, e cada um vê quem são os outros. Cada mensagem nele é
  criptografada com OMEMO para os dispositivos de cada membro, como fazem os grupos privados do Conversations, então os
  servidores XMPP não conseguem lê-la; o que foi escrito antes de você entrar aparece bloqueado. Um **canal** é qualquer
  outro grupo: não é criptografado, então todos nele, e os servidores, podem ler, e a tela dele diz isso. Na tela do
  XMPP, **Novo grupo** cria um grupo privado no seu servidor XMPP a partir de um nome e dos contatos que você escolher, e
  **Entrar num grupo** entra em um pelo endereço, como nome@conference.example.org, com a senha dele se ele pedir. Sob um
  grupo privado, **Membros** lista as pessoas dele com as chaves delas, para comparar como numa conversa, e avisa de
  quem não tem chaves OMEMO e não consegue ler o que é criptografado; o administrador dele pode **Adicionar pessoas**. Um
  contato que convida você para um grupo aparece em **Convites para grupos**, com **Entrar** e **Recusar**; o convite de
  qualquer outra pessoa não é mostrado. Seus grupos acompanham os outros apps XMPP da sua conta pelos favoritos dela: um
  grupo em que você entra lá aparece aqui também, e **Sair do grupo** sai dele lá também. Um canal avisa só das
  mensagens que citam você. Num grupo, **dono** e **admin** aparecem ao lado dos membros que são, e a **Descrição** do
  grupo aparece abaixo do assunto dele.
- **Gerenciar um grupo:** os admins de um grupo veem **Gerenciar o grupo** na tela dele. Eles definem o **Assunto**; o
  dono também pode **renomeá-lo**. Num grupo privado, cada membro tem **Remover** (as mensagens do grupo não chegam
  mais a essa pessoa, e um admin pode adicioná-la de novo) e **Banir** (ela não pode voltar até que um admin permita);
  o dono pode **Tornar admin** um membro ou **Remover como admin**. Num canal, **Gerenciar o grupo** lista quem está
  dentro, cada um com **Remover**. Admins não podem remover outros admins; só o dono. O dono também define a
  **Descrição** do grupo; alguns servidores não permitem uma, e o Erevos avisa.
- **Chamadas:** os dois blocos no topo da conversa ligam para a pessoa, por voz ou com vídeo, na mesma tela de chamada
  das chamadas do próprio Erevos, e as chamadas dela tocam aqui do mesmo jeito, enquanto este espaço está aberto; uma
  chamada de alguém que não está nos seus contatos aparece só como perdida. Funciona com apps que ligam como o
  Conversations (Jingle, com o toque do XEP-0353). A chamada em si é criptografada (DTLS-SRTP), mas a impressão digital
  da chave dela passa pelos servidores XMPP como está, sem criptografia de ponta a ponta, então esses servidores
  poderiam se colocar no meio. Ela passa pelo relay de chamadas deste espaço quando há um, senão pelo servidor TURN do
  servidor XMPP, e só por ele, então a outra pessoa não fica sabendo seu endereço; sem nenhum dos dois, vai direto, e
  ela fica sabendo. Uma chamada nunca passa pelo Tor: o relay de chamadas ou o servidor TURN vê o endereço deste
  celular.
  Numa chamada de voz, qualquer um dos dois pode ligar o vídeo: **Adicionar vídeo**, na tela da chamada, liga a sua
  câmera e pergunta primeiro à outra pessoa, que escolhe **Agora não** ou **Ativar vídeo**. O vídeo só começa se ela
  disser que sim, e um não deixa a chamada como estava. Funciona com apps que adicionam vídeo a uma chamada como o
  Conversations.
- **Chamadas de grupo:** num grupo privado em que você está, os dois blocos no topo iniciam uma chamada de voz ou de
  vídeo no grupo, e uma chamada iniciada em um dos seus grupos toca aqui, enquanto este espaço está aberto. Enquanto uma
  chamada acontece num grupo, um bloco no topo e uma linha sob o nome dele dizem isso, e tocar em qualquer um dos dois
  entra na chamada, até a última pessoa sair. Funciona com o Dino, que liga em grupos do mesmo jeito (MUJI): cada
  chamada tem uma sala própria no serviço de grupos, na qual só os membros do grupo podem entrar, e cada celular da
  chamada se conecta direto a cada um dos outros, como nas chamadas de grupo do próprio Erevos, pelo relay de chamadas
  deste espaço ou pelo servidor TURN do servidor XMPP, no máximo oito pessoas. Como numa chamada com uma pessoa, a
  chamada é criptografada (DTLS-SRTP), mas as impressões digitais das suas chaves, e os convites, passam pelos
  servidores XMPP como estão, e o serviço de grupos vê quem está na chamada e quando. A conta XMPP própria das conversas
  ocultas liga nos grupos dela do mesmo jeito, enquanto as conversas ocultas estão abertas; enquanto estão fechadas, com
  **Receber quando fechadas** ativado, uma chamada que chega num dos grupos dela aparece como perdida.
- **Não anônimo:** o servidor XMPP vê sua conta, seus contatos, quem fala com quem e quando, e, sem Tor, de onde. O
  servidor da outra pessoa vê o mesmo das conversas dele com você.
- **Pelo Tor:** no Android, a tela do XMPP, e a de antes de entrar, escolhe o Tor da conta: **Desativado** (o padrão:
  direto, e o servidor vê seu endereço), **Como o espaço** (como diz a escolha deste espaço em **Configurações** →
  **Relay e redes** → **Tor**: com **Mensagens** pelo Tor assim que o Tor está pronto, os arquivos direto; com **Tudo**
  só pelo Tor, os arquivos também; com **Nada** direto) ou **Sempre pelo Tor** (só pelo Tor, faça o espaço o que fizer,
  ao entrar também, e nada sai enquanto o Tor não conseguir se conectar). A conexão, a busca do servidor e os arquivos
  seguem a escolha; o Tor usa as pontes do espaço. As chamadas nunca passam pelo Tor, e não é feita prévia de links
  enquanto a conta não puder ir direto. Onde o Erevos não pode abrir uma conexão própria (o app web, um computador), usa
  o WebSocket do servidor, direto, e um servidor sem ele não é alcançado.
- **Uma conversa pelo Tor:** **Pelo Tor** sob uma conversa ou grupo, desativado até você ativar, a manda só pelo Tor. Uma
  única conexão com o servidor leva todas as conversas da conta, então enquanto uma conversa o tiver ativado, a conta
  inteira passa só pelo Tor, seja qual for a escolha dela, e a tela do XMPP diz isso.
- **Notificações:** uma mensagem que chega mostra um aviso e conta no número do ícone do Erevos, como nas conversas do
  próprio Erevos, enquanto este espaço está aberto; num computador, enquanto o Erevos roda. No Android,
  **Notificações**, no fim de uma conversa, silencia ela ou dá a ela um som próprio; uma conversa silenciada não conta.
  **Aparência da conversa**, ao lado, dá à conversa uma aparência própria.
- **Enquanto este espaço está fechado:** no Android, **Avisar quando chega mensagem**, em **Enquanto este espaço está
  fechado** na tela do XMPP, deixa este espaço dizer “Nova mensagem” quando chega algo no XMPP enquanto outro espaço
  está aberto, como fazem as conversas dele com **Também enquanto outro espaço está aberto** em **Configurações** →
  **Notificações** → **Em segundo plano**, que também é preciso. Nunca diz o quê, de quem ou em qual conversa, e uma
  chamada não toca então: só a chave do espaço abre o que chegou. Para isso o servidor XMPP avisa o relay deste espaço
  de cada mensagem enquanto nenhum app da conta está ativo, então o servidor XMPP fica sabendo o nome do relay, e o
  relay quando chegam mensagens. Desligado até você ligar; precisa de um relay atualizado para isso, que os servidores
  XMPP alcancem (quem o administra abre uma porta para eles), e de um servidor XMPP que envie avisos a apps inativos,
  como quase todos.
- **Uma conta nova:** na tela de entrada, **Criar uma conta nova** cria uma em um servidor XMPP que permita
  (XEP-0077), a partir de um endereço e uma senha. Um servidor que pede um captcha, ou cria contas só no site dele,
  avisa e dá a página dele se tiver; crie a conta lá e depois entre aqui.
- **Senha e exclusão:** **Conta**, na tela do XMPP, tem **Alterar a senha** e **Apagar a conta**, que apaga a conta do
  servidor de vez, depois de duas perguntas, a segunda pedindo o endereço. O Erevos esquece as chaves dela; talvez o
  endereço não possa ser criado de novo.
- **Encontrar grupos:** **Encontrar um grupo** tem **Grupos no seu servidor**, os que o servidor deixa qualquer um
  achar, e **Buscar grupos públicos**, que consulta o search.jabber.network: ele fica sabendo as palavras que você
  procura e vê o nome do seu servidor, e o seu servidor não. Um grupo público é um canal, sem criptografia.
- **Localizações:** **Localização** envia onde você está como um link geo:, como o Conversations faz, criptografado
  como a conversa; uma que chega assim aparece como localização, com **Abrir no mapa** no Android.
- **Prévias de links:** em uma conversa escrita sem criptografia, com as **Prévias de links** ligadas, o primeiro link
  vai com a prévia dele (XEP-0511), e uma que chega assim aparece sob as palavras. Uma conversa criptografada não
  envia nenhuma, pois diria aos servidores o que é o link.

**Por quê:** as conversas do próprio Erevos escondem quem fala com quem; um servidor XMPP não consegue. Por isso as
conversas XMPP ficam à parte e marcadas, para as pessoas que você só alcançaria pelo XMPP.

- **O que uma mensagem leva:** as marcas de como as palavras aparecem e endereços web para tocar, como numa conversa
  do Matrix, com **Câmera**, **Vídeo**, **Cartão de contato** e **Qualidade da foto** (veja [Matrix](#matrix)). Num
  grupo, digitar @ mostra seus membros, e um toque escreve o nome desse membro no grupo, como faz o Conversations.
- **Um nome seu:** **Dar um nome aqui**, no pé da conversa de um contato, guarda um nome seu para ele nos seus
  contatos do seu servidor XMPP, então seus outros apps de XMPP também o mostram. Ele não fica sabendo. Deixe vazio
  para mostrar o endereço dele de novo.
- **Rascunhos:** o que você digita e não envia fica como rascunho da conversa, criptografado só neste celular. Ele
  volta quando você abre a conversa de novo, também depois que o Erevos fechou, e a lista da tela inicial o mostra na
  linha da conversa como **Rascunho**.
- **Enviar mais tarde:** segure **Enviar**, escolha uma hora (**Daqui a 1 hora**, **Hoje à noite 20:00**, **Amanhã
  09:00** ou qualquer dia e hora) e toque em **Enviar mais tarde**. A mensagem espera neste celular, criptografada,
  tracejada depois das mensagens da conversa com sua hora, e sai deste celular nessa hora enquanto o Erevos está
  desbloqueado, no Android também em segundo plano; senão assim que for desbloqueado de novo. Só texto. Toque nela
  para enviá-la agora ou apagá-la. Nas conversas ocultas ela sai só enquanto elas estão abertas, a não ser que recebam
  também fechadas. Uma que um backup restaurado trouxe de volta, cuja hora veio antes da restauração, não sai sozinha:
  o celular de onde veio o backup pode já tê-la enviado.
- **Enviar de novo:** uma mensagem sua que mostra **Não enviada** tem **Enviar de novo** e **Apagar** no menu.
- **Lembrar-me:** o menu de uma mensagem tem **Lembrar-me**. Escolha uma hora: a mensagem, com o nome da conversa
  dela, vai para **Conversa comigo** e lembra você nessa hora. Precisa do **Erevos** ligado em [Módulos](#modules).
- **Mensagens temporárias:** **Mensagens temporárias**, abaixo do campo de mensagem, apaga deste celular as mensagens
  novas esse tempo depois de enviadas, e **Temporária** faz isso só para a próxima mensagem. O outro lado as guarda: o
  XMPP não tem como apagá-las lá. As mensagens que já estão aqui ficam.
- **Aparecer offline:** no pé de uma conversa com uma pessoa, **Aparecer offline** mostra você offline para ela, seja
  o que for que sua conta mostre aos outros, e não diz nada a ela do que você lê ou digita, nem que as mensagens dela
  chegaram. Um grupo em comum ainda mostra você. Vale só para a conexão deste celular.
- **Conferir pessoalmente:** abaixo de **As chaves deles**, **Conferir pessoalmente** mostra um código do seu endereço
  e das suas chaves, como o Conversations faz. Fotografe o deles ali: cada aparelho deles cuja chave confere é marcado
  como conferido. Uma chave diferente não marca nada e avisa: alguém pode estar no meio, ou eles trocaram de app. Nada
  é enviado.
- **Contatos bloqueados:** a tela do XMPP lista quem a conta bloqueia, com **Desbloquear**.

## Conversas com outros apps Nostr {#nostr-chats}

Em **Configurações** → **Relay e redes** → **Conversas Nostr**, um espaço pode ter uma chave Nostr própria, para
conversar a dois ou em grupo com pessoas que usam Damus, Amethyst, Primal, 0xchat ou outro app Nostr que envia mensagens
privadas como o NIP-17 pede. Não é o [Pelo Nostr](#nostr), que leva as conversas do próprio Erevos.

- **A chave:** **Criar uma chave Nostr** cria uma para este espaço; **Ou trazer uma chave de outro app Nostr** pega o
  nsec de uma chave que você já tem, e lê o que os relays dela ainda guardam. A chave e as conversas dela ficam
  guardadas criptografadas neste espaço, e estão nos backups: depois de restaurar, voltam como estavam. As conversas
  ocultas dele podem ter uma chave Nostr própria, veja [Conversas ocultas](#hidden). **Mostrar a chave secreta (nsec)**
  a mostra, para anotar ou levar para outro app: quem a tiver lê estas conversas e escreve como você.
- **Sua chave Nostr:** dê o npub dela às pessoas que devem escrever para você, com **Copiar** ou **Mostrar o código
  QR**. **Seu nome**, se você der um, é público: outros apps Nostr o mostram no lugar do seu npub. Lá só o nome muda: uma foto ou
  palavras que outro app da sua chave pôs no seu perfil continuam.
- **Conversas:** **Nova conversa** recebe o npub da pessoa (ou nprofile), do perfil dela no app dela, ou um nome como
  nome@example.org (NIP-05). **Mostrar as pessoas que você segue**, logo abaixo, lista as pessoas que a sua chave Nostr
  segue (a lista pública dela, procurada também em relays que reúnem essas listas e nos relays onde a sua chave
  escreve), com os nomes: toque numa para escrever para ela. Quando não encontra ninguém, diz por quê, de quem procurou
  a lista e como cada relay respondeu. Nada é carregado até você tocar nesse botão, nem fotos de perfil. As conversas
  também ficam na lista da tela inicial, cada uma marcada **Nostr**; o botão **Nostr** mostra só elas, e ali **Nova conversa** abre esta tela. **Dar um nome aqui** dá a uma conversa um nome que só você vê.
- **Grupos:** **Novo grupo** cria um com duas ou mais das pessoas com quem você conversa, vinte no máximo, com um nome
  se quiser. Grupos Nostr não têm administradores: um grupo são as pessoas que suas mensagens nomeiam, cada mensagem vai
  para cada uma, criptografada para cada uma, e ninguém pode ser adicionado ou removido depois; um grupo com outras
  pessoas é um grupo novo. **Dê um nome ao grupo** muda o nome dele para todos, com sua próxima mensagem. Uma mensagem
  que outro app manda para você e para outros também aparece como grupo, cada mensagem com quem a escreveu.
- **Fotos e arquivos:** **Foto** e **Arquivo**, abaixo do campo de mensagem de uma conversa, enviam um de até 20 MB. Ele
  é criptografado neste telefone com uma chave feita só para ele (AES-GCM, como o NIP-17 pede) e colocado num servidor
  de arquivos Blossom, que guarda só o que não consegue ler; a chave dele vai na mensagem, criptografada como as
  mensagens, e o envio é assinado por uma chave feita só para isso, então o servidor não sabe de quem é. No Android, os
  arquivos vão pelo Tor como estas conversas. **Servidores de arquivos** diz para onde vão, para o primeiro que aceitar
  um: blossom.primal.net, blossom.band e nostr.download, se você não os mudar. Uma foto ou um arquivo que chega só é
  buscado quando você toca em **Mostrar foto** ou **Salvar**, e só abre se for o que foi enviado.
  Toque numa foto mostrada para vê-la na tela inteira, como na conversa de um contato: dois dedos ou um toque duplo a
  ampliam, ela gira com o celular, e **Salvar** a guarda (veja Fotos e arquivos, em [Conversar por um relay](#relay)).
- **Reações:** segure uma mensagem para abrir o menu dela e reagir com 👍, ❤️, 😂, 😮, 😢 ou 🙏, ou com uma das outras atrás
  de **+**; embaixo aparecem as reações, a última de cada pessoa, como outros apps Nostr as enviam (NIP-25). Toque numa
  reação abaixo de uma mensagem para acrescentar a mesma, ou na sua para retirá-la; os apps dos outros são solicitados a
  removê-la.
- **Respostas:** **Responder**, no menu de uma mensagem que você segura, a responde. A mensagem aparece acima do campo
  de mensagem, com um ✕ para soltá-la, e depois acima da sua resposta na conversa, onde um toque vai até ela. Outros
  apps Nostr também a mostram como resposta (o NIP-17 a marca como resposta). Uma foto, um arquivo ou uma mensagem de
  voz enviada enquanto ela aparece também a responde. **Copiar**, no mesmo menu, leva as palavras de uma mensagem.
- **Mensagens de voz:** toque e segure o microfone abaixo do campo de mensagem para gravar, e solte para enviar; deslize
  para a esquerda antes de soltar para descartar a gravação. Um minuto é o máximo, e um toque de menos de um segundo não
  envia nada. Ela vai como um arquivo: criptografada neste celular e colocada num servidor de arquivos, com a duração
  dela na mensagem; se outro app a toca como mensagem de voz ou como arquivo de som, isso é com esse app. Uma que chega
  com a duração toca com **Reproduzir**, e só é buscada quando você a reproduz.
- **Fixar só para mim:** mantém uma mensagem no topo da conversa, só neste celular; mais ninguém a vê.
- **Selecionar:** escolhe várias mensagens para **Copiar**, **Encaminhar** para outra conversa do Nostr (fotos e
  arquivos são enviados de novo) ou **Apagar**. Apagar as tira deste celular e pede aos apps dos outros que apaguem
  também as suas: os apps deles podem fazê-lo ou não.
- **Este celular ou todos:** **Apagar** pergunta antes: **Este celular** as apaga só aqui, e elas ficam ocultas se
  chegarem de novo; **Para todos** também pede aos apps dos outros que apaguem as suas (NIP-09), o que eles podem
  fazer ou não.
- **Figurinhas:** **Figurinha** envia as suas próprias figurinhas feitas de fotos (**Minhas**) como fotos,
  criptografadas: outros apps do Nostr as mostram como fotos. Os conjuntos embutidos também estão lá: cada figurinha vai
  como a imagem dela, feita no seu aparelho.
- **Criptografia:** cada mensagem é criptografada para a outra pessoa e assinada por você, e depois embrulhada de novo
  por uma chave criada só para aquela mensagem, com a hora atrasada em até dois dias (NIP-17, com NIP-44 e NIP-59). Os
  relays veem para quem ela é, não quem a escreveu, quando nem o que diz. Uma cópia vai para os seus relays, para que
  seus outros apps Nostr com esta chave leiam também. É código próprio do Erevos, não auditado, conferido com o exemplo
  do próprio NIP-17 e com o nostr-tools.
- **Onde chegam suas mensagens:** os relays para onde outros apps mandam suas mensagens: relay.damus.io, nos.lol e
  relay.primal.net se você não os mudar, no máximo três. O Erevos os informa a outros apps (uma lista kind 10050) quando
  mudam e uma vez por semana. Ele envia para os relays que o app da outra pessoa indica; um app que não indica nenhum
  ainda não pode receber mensagem, e o Erevos avisa. Uma chave trazida de outro app lê onde esse app indicou que chegam
  suas mensagens (a lista kind 10050 dele), a menos que você as tenha mudado aqui, e informa essa lista de novo, para
  que os dois apps recebam as mesmas mensagens; ela lê esses relays desde o começo deles, e busca uma vez o que os
  relays indicados em listas anteriores da chave ainda guardam.
- **Mensagens privadas antigas:** muitos apps ainda mandam e guardam mensagens privadas do jeito antigo (NIP-04, kind
  4); o Damus e o Primal as mostraram por anos. O Erevos também as lê, passadas e novas, e as mostra nas mesmas
  conversas: nos relays onde chegam suas mensagens e em até mais quatro, os que o outro app da sua chave lê (a lista
  kind 10002 dele, para uma chave trazida de outro app) e relay.damus.io, nos.lol e relay.primal.net. Essas mensagens
  também são criptografadas, mas os relays veem quem escreveu para quem e quando. O próprio Erevos manda só do jeito do
  NIP-17.
- **Publicações públicas:** numa conversa com uma pessoa, **Publicações públicas** mostra o que ela publica para todos
  (kind 1) e as publicações de outras pessoas que ela compartilhou de novo, das mais recentes às mais antigas, de trinta
  em trinta, com **Publicações mais antigas** para ver mais. É somente leitura: daqui não dá para responder, reagir nem
  publicar nada. Isso é buscado quando a tela abre, nos relays usados para buscas e naqueles em que, segundo a lista de
  relays dela (NIP-65), ela escreve, como diz a escolha do Tor deste espaço, e nada disso é guardado. Nenhuma imagem ou
  link é aberto: eles aparecem como endereços, que podem ser copiados. Uma publicação com aviso de conteúdo mostra as
  palavras dela depois de um toque em **Mostrar**. Uma conta que só publica para todos, como a de um projeto, não manda
  mensagens privadas: a conversa dela fica vazia, e as publicações dela estão aqui.
- **O feed público:** na tela inicial, o botão **Público** mostra um só feed com o que as pessoas que a sua chave Nostr
  segue publicam para todos, e o que compartilharam de novo, e com as mensagens das salas Matrix públicas em que você
  está (salas em que qualquer pessoa pode entrar), das mais recentes às mais antigas, como no Amethyst: o rosto de quem
  escreveu, com um pequeno **N** ou **M**, o nome, quando, as palavras, as fotos dentro da publicação (uma na largura
  toda, de duas a quatro numa grade) e, para o primeiro link, um cartão com imagem, site, título e uma linha. No Matrix,
  a linha sob o nome diz a sala e o seu servidor: toque nela para abrir a sala. Vêm mais ao chegar ao fim, ou com
  **Publicações mais antigas**; puxe a lista para baixo para as mais recentes (num navegador, **Procurar de novo**).
  Seguir pessoas continua a se fazer em outro app Nostr com a mesma chave. Sua lista de quem você segue, onde elas
  escrevem (suas listas NIP-65) e suas publicações são buscadas só enquanto o feed aparece, nos relays das buscas, nos
  que reúnem listas e nos que elas escrevem, como diz a escolha de Tor do espaço; os nomes só para as publicações que
  aparecem. Nada é guardado.
  **Fotos**, acima do feed, é a escolha que importa para a privacidade. Uma foto ou um cartão de link vem do servidor
  onde quem escreveu a publicação a colocou, e esse servidor vê o endereço de onde ela foi buscada, pelo Tor o de uma
  saída do Tor, e que alguém a abriu. **Sempre** as mostra na hora, pelo Tor quando o Tor está ligado neste espaço;
  **Só por Tor** as mostra só quando o Tor está ligado, e senão com um toque; **Com um toque** não busca nenhuma antes
  de você tocá-la. **Prévias de links** liga ou desliga os cartões. Nada é buscado enquanto o feed não aparece, uma foto
  é mantida só enquanto a sua publicação aparece, e nenhuma é guardada; a que não vem mostra **Mostrar a foto** para
  tentar de novo. Só endereços na internet são buscados, nunca um deste telefone ou da sua rede doméstica.
  Sob uma publicação Nostr: **Responder** escreve uma resposta, **Compartilhar de novo** a mostra aos seus seguidores
  (pergunta antes), o coração a curte, e a seta compartilha um link para ela. Seus três pontos: **Copiar texto**, as
  **Publicações públicas** de quem a escreveu, **Enviar mensagem**, e **Revogar** para uma publicação sua. Toque numa
  publicação para abri-la com quantos a curtiram e a compartilharam de novo, e as respostas a ela. **Nova publicação**,
  a caneta, escreve uma publicação pública, com até quatro fotos. As respostas, os compartilhamentos, as curtidas e as
  publicações são públicos e assinados com a chave Nostr do espaço: qualquer pessoa pode lê-los, e eles mostram que são
  seus; uma foto que você adiciona é posta sem criptografia no servidor de arquivos do espaço, como deve ser numa
  publicação pública. Sob uma mensagem Matrix: **Responder**, **Reagir** (uma escolha de seis) e compartilhar (um link
  matrix.to), e nos seus três pontos **Copiar texto** e **Abrir a sala**. É sempre a chave e a conta deste espaço, nunca
  as próprias das conversas ocultas.
- **Enquetes:** no feed público uma enquete aparece com as suas respostas, para **Votar** e, enquanto está aberta, com
  **Resultados**. **Nova publicação** e depois **Enquete** cria uma: até 10 respostas, uma ou mais para escolher, aberta
  por 1, 3 ou 7 dias. Os votos são públicos: qualquer um pode ver o que você escolheu. Uma reação sua abaixo de uma
  publicação se retira tocando nela de novo.
- **Emojis personalizados:** no feed público, os emojis que outros apps criam são carregados como as fotos das
  publicações, como **Fotos** e o Tor dizem acima. Nas conversas privadas aparecem como :nome: e nunca são carregados.
- **Marcas:** um ✓ assim que um dos relays da pessoa aceitou a mensagem. O NIP-17 não devolve nada: nem quando o app
  dela a tem, nem quando ela lê. Ler uma conversa aqui não avisa ninguém.
- **Não anônimo:** sua chave é a mesma para todos com quem você fala, e qualquer um que tenha um npub pode escrever para
  ele. Os relays onde chegam suas mensagens veem sua chave lê-las e, sem Tor, de onde. Só a conexão que lê os seus relays
  diz a eles quem lê, quando um relay pede (NIP-42); enviar e procurar pessoas, nunca.
- **Pelo Tor:** no Android, **Tor** nesta tela escolhe como esta conta Nostr chega aos seus relays e servidores de
  arquivos, como a conta de cada rede: **Desativado**, o padrão para uma chave nova, direto; **Como o espaço**, como diz
  a escolha do espaço em **Configurações** → **Relay e redes** → **Tor** (com **Mensagens** pelo Tor assim que o Tor
  está pronto, com **Tudo** só pelo Tor); **Sempre pelo Tor**, só pelo Tor, iniciado para ela, nunca direto. Uma chave
  de antes desta escolha também começa em **Desativado**. A tela diz por onde vão agora. No app web e num computador vão
  direto.
  **Pelo Tor**, no pé de uma conversa, envia só essa conversa apenas pelo Tor, seja qual for o modo do espaço, em
  circuitos próprios, para que nenhuma saída do Tor leve as mensagens dela junto com as de outra conversa: o que você
  envia nela, a busca de onde a pessoa lê, e as fotos e arquivos dela; sem Tor, nada dela sai. O que chega para você
  continua seguindo o modo do espaço, já que uma só conexão lê suas mensagens para todas as conversas. Fica só neste
  telefone.
- **Notificações:** uma mensagem que chega mostra um aviso e conta no número do ícone do Erevos, como nas conversas do
  próprio Erevos, enquanto este espaço está aberto; num computador, enquanto o Erevos roda. No Android,
  **Notificações**, no fim de uma conversa, silencia ela ou dá a ela um som próprio; uma conversa silenciada não conta.
  **Aparência da conversa**, ao lado, dá à conversa uma aparência própria.
- **Ainda não:** arquivos que outro app criptografa de outro jeito (aparecem como um arquivo que o Erevos não abre).

**Por quê:** muita gente está no Nostr e vai continuar lá. Assim você escreve para elas pelo Erevos, à parte e marcado,
porque uma chave Nostr é a mesma para todos com quem você fala, enquanto as conversas do próprio Erevos escondem quem
fala com quem.

- **O que uma mensagem leva:** como numa conversa do Matrix (veja [Matrix](#matrix)), e **Localização**, que envia
  onde você está como um endereço geo: e um link de mapa que qualquer app do Nostr pode mostrar; um lugar enviado
  assim aparece como um lugar. Num grupo, digitar @ mostra seus membros, nomeados de modo que qualquer app do Nostr
  saiba quem é. Uma mensagem que você encaminha fica marcada **Encaminhada** só no seu celular.
- **Rascunhos:** o que você digita e não envia fica como rascunho da conversa, criptografado só neste celular. Ele
  volta quando você abre a conversa de novo, também depois que o Erevos fechou, e a lista da tela inicial o mostra na
  linha da conversa como **Rascunho**.
- **Enviar mais tarde:** segure **Enviar**, escolha uma hora (**Daqui a 1 hora**, **Hoje à noite 20:00**, **Amanhã
  09:00** ou qualquer dia e hora) e toque em **Enviar mais tarde**. A mensagem espera neste celular, criptografada,
  tracejada depois das mensagens da conversa com sua hora, e sai deste celular nessa hora enquanto o Erevos está
  desbloqueado, no Android também em segundo plano; senão assim que for desbloqueado de novo. Só texto. Toque nela
  para enviá-la agora ou apagá-la. Nas conversas ocultas ela sai só enquanto elas estão abertas, a não ser que recebam
  também fechadas. Uma que um backup restaurado trouxe de volta, cuja hora veio antes da restauração, não sai sozinha:
  o celular de onde veio o backup pode já tê-la enviado.
- **Lembrar-me:** o menu de uma mensagem tem **Lembrar-me**. Escolha uma hora: a mensagem, com o nome da conversa
  dela, vai para **Conversa comigo** e lembra você nessa hora. Precisa do **Erevos** ligado em [Módulos](#modules).
- **Mensagens temporárias:** **Mensagens temporárias**, abaixo do campo de mensagem, apaga deste celular as mensagens
  novas, enviadas ou recebidas, esse tempo depois de enviadas. As suas levam esse tempo (NIP-40), então o app deles e
  os relays que o respeitam as apagam nessa hora; os que não respeitam as guardam. **Temporária** faz isso só para a
  próxima mensagem. Uma mensagem que chega com seu próprio tempo sai nessa hora.
- **Bloquear:** **Bloquear**, no pé de uma conversa, descarta neste celular o que essa chave envia, sem ler; não volta
  se você desbloquear. Ela não fica sabendo: o Nostr não pode impedir ninguém de escrever para você. **Contatos
  bloqueados**, na tela de conversas do Nostr, os lista, com **Desbloquear**.
- **Conferir pessoalmente:** numa conversa com uma pessoa, **Conferir pessoalmente** mostra o código da sua chave.
  Fotografe o código que o app deles mostra (nostr:npub…): a conversa é marcada como conferida quando é a chave desta
  conversa. Nada é enviado.

## Telegram {#telegram}

Só no Erevos+, no Android, um espaço pode entrar na tua conta do Telegram e conversar com pessoas no Telegram, em **Configurações** → **Relay e redes** → **Telegram**. O Erevos não é feito pelo Telegram e usa a API do Telegram. As conversas juntam-se à lista do ecrã inicial, marcadas como **Telegram**, com um chip próprio.

- **Iniciar sessão:** toca em **Iniciar sessão no Telegram**, escreve o teu número de telefone com o indicativo do país e depois o código que o Telegram envia: para a sua aplicação nos teus outros dispositivos, por SMS ou por chamada; **Enviar o código outra vez** pede-o de novo. Se a tua conta tem uma palavra-passe de dois passos, o Erevos pede-a e mostra a tua dica. Se o Telegram quiser que confirmes noutro dispositivo, o Erevos mostra a ligação a abrir lá. Uma conta nova do Telegram ou entrar com e-mail, o Erevos ainda não consegue: faz isso uma vez na aplicação oficial do Telegram. O que o Telegram guarda neste telemóvel fica cifrado neste espaço.
- **Conversas normais:** o Telegram pode lê-las. Uma conversa normal do Telegram só é cifrada entre ti e os servidores do Telegram, e os grupos e canais nunca são cifrados de ponta a ponta. Uma conversa privada di-lo no topo: **O Telegram pode ler esta conversa**.
- **Cifragem ErevosGram:** numa conversa privada, **Cifragem ErevosGram** envia um convite à outra pessoa. Se ela usar o {=Erevos} ou a aplicação ErevosGram e tocar em **Aceitar**, a conversa passa a **Cifrada de ponta a ponta (ErevosGram)**: o que os dois escrevem é selado com o protocolo próprio do Erevos antes de chegar ao Telegram, que só vê texto que não consegue ler. Quando são eles a convidar, a conversa mostra **Querem a cifragem ErevosGram**, com **Aceitar** e **Recusar**. É código do próprio Erevos, sem auditoria. O que foi escrito antes continua legível para o Telegram.
- **Número de segurança:** toca no cadeado no topo de uma conversa cifrada para ver o seu número de segurança. Compara-o com o do telemóvel deles, por outra via que não o Telegram, e toca em **Marcar como verificada** quando os dois forem iguais. Se as chaves deles mudarem, a conversa avisa-te: compara de novo antes de confiares.
- **Chamadas:** numa conversa privada, o botão de chamada no topo inicia uma chamada de voz do Telegram, e uma a chegar aparece sobre qualquer ecrã com **Atender** e **Recusar**. A chamada é feita pelo próprio sistema do Telegram, cifrada de ponta a ponta pela cifragem de chamadas do Telegram. Compara os quatro emojis do teu ecrã com os do outro telemóvel: se forem iguais, ninguém está a ouvir. **Videochamada**, ao lado, começa uma com sua câmera ligada; uma videochamada toca com **Atender com vídeo** ao lado de **Atender**. Em qualquer chamada, **Câmera** liga ou desliga sua câmera e **Trocar** alterna entre a frontal e a traseira; a imagem da outra pessoa ocupa a tela enquanto a câmera dela estiver ligada.
- **Conversas e Configurações:** o ecrã do Telegram mostra as tuas conversas em linhas, como o ecrã inicial, e traz mais ao deslizar para baixo. **Configurações**, ao lado do título, tem **Anúncios em canais**, **Pastas do Telegram**, as **Chaves do ErevosGram** e **Sair do Telegram neste telemóvel**; **Conversas** aí, ou Voltar, regressa à lista.
- **Trazer chaves da app ErevosGram:** no ecrã do Telegram, **Trazer chaves da app ErevosGram**. Na app ErevosGram exporta as chaves, o que escreve erevosgram-keys.txt e mostra um código de 20 caracteres; cola a linha do ficheiro no Erevos e escreve o código. As conversas cifradas lá abrem aqui. Depois não uses a app ErevosGram para essas conversas. Se este espaço já tem chaves ErevosGram, substituí-las pede-se à parte e as conversas cifradas aqui até então deixam de abrir.
- **Anúncios em canais:** desligados, a menos que ligues **Anúncios em canais** no ecrã do Telegram. O Telegram pede às apps que mostrem os seus anúncios em canais públicos grandes; ligados, um canal pode mostrar no topo um cartão pequeno marcado **Anúncio**, que podes fechar.
- **Pastas:** as pastas que criaste no Telegram aparecem como separadores no ecrã do Telegram, entre **Conversas** e **Arquivar**. Em **Pastas do Telegram**, liga as que queres: cada uma aparece como separador próprio aí e no ecrã inicial. Assim que houver uma pasta ligada, só notificam as conversas dessas pastas. No Telegram as pastas ficam como estão.
- **Informações da conversa:** toca no nome de uma conversa para ver quando a pessoa esteve online pela última vez, o nome, o número e a bio, ou a descrição, os membros e as ligações de um grupo. Aí podes silenciar a conversa, afixá-la, arquivá-la, marcá-la como lida ou não lida, pô-la nas tuas pastas do Telegram (o Telegram altera-as em todos os teus dispositivos), fazer com que as mensagens novas se apaguem sozinhas ao fim de um dia, uma semana ou um mês, bloquear a pessoa, limpar o histórico e apagar a conversa ou sair do grupo ou do canal.
- **Enviar fotos e ficheiros:** **Anexar**, ao lado de **Enviar**, oferece **Foto**, **Câmera** e **Arquivo**. O que escreveste vai por baixo como o seu texto. A cifra do ErevosGram cobre apenas o texto: numa conversa cifrada o Erevos pergunta primeiro, porque o Telegram pode ler fotos e ficheiros.
- **Editar, reencaminhar, pesquisar:** mantém premida uma mensagem tua e toca em **Editar** para mudar o texto (não numa conversa cifrada), ou mantém premida uma mensagem normal e toca em **Encaminhar** para a mandar a outra conversa. **Buscar**, no topo de uma conversa, percorre as suas mensagens.
- **Mensagens de voz:** com nada digitado, o microfone ao lado de **Enviar** grava enquanto você o segura; solte para enviar, deslize para a esquerda para cancelar. Como um arquivo, uma mensagem de voz não é coberta pela cifragem do ErevosGram, então numa conversa cifrada o Erevos pergunta antes.
- **Reações:** segure uma mensagem e toque em **Reagir** para escolher um emoji. As reações aparecem sob a mensagem; toque numa para dar ou retirar a sua.
- **Enquetes e figurinhas:** num grupo ou canal, **Anexar** → **Enquete** pede uma pergunta, de duas a dez opções e se os votos são anônimos e se várias respostas são permitidas. Toque numa opção para votar (**Votar**, se várias forem permitidas); **Retirar voto** o tira e **Fechar sondagem**, no menu da sua própria enquete, a encerra. **Anexar** → **Figurinha** envia uma dos seus pacotes.
- **Tópicos:** uma mensagem com respostas mostra quantas; toque nela para lê-las e escrever uma. **Responder no tópico**, no menu de uma mensagem, abre ou continua um tópico num grupo ou canal.
- **Mensagem fixada:** uma mensagem fixada aparece numa barra no alto da conversa; toque nela para ir até ela. **Fixar** e **Desafixar** estão no menu da mensagem; numa conversa privada você escolhe entre **Para os dois** e **Só para mim**.
- **Várias mensagens:** **Selecionar**, no menu de uma mensagem, deixa você tocar em mais e depois **Copiar**, **Encaminhar** ou **Apagar** juntas. Mensagens cifradas não podem ser encaminhadas e ficam de fora.
- **Membros e administradores:** num grupo ou canal, as informações da conversa listam os **Membros**, marcados como **Dono** ou **Administrador**; toque num para escrever a ele. O dono e os administradores podem **Editar** o título e a descrição e **Remover** um membro.
- **Mais em grupos e conversas:** com a permissão de adicionar administradores, **Tornar admin** ao lado de um membro escolhe o que pode fazer, e **Permissões** ao lado de um administrador altera-o ou, com **Remover de administrador**, torna-o membro outra vez. **Adicionar membro** adiciona um dos teus contactos, ou qualquer pessoa pelo seu @nome; se a privacidade dela não deixar, envia-lhe o link de convite. **Anexar** → **Sondagem** pode criar um **Quiz**: toca na caixa ao lado da resposta certa e, se quiseres, junta uma explicação; quando alguém responde, a resposta certa aparece com ✅. Os stickers animados mexem-se na conversa. **Anexar** → **Sticker do Erevos** envia um dos stickers do Erevos; o Telegram recebe-o como um sticker de imagem parada. Uma reação com emoji personalizado mostra a sua imagem. Com várias mensagens fixadas, a barra no topo mostra-as uma a uma: cada toque vai a uma e passa à anterior. Um tópico tem **Anexar**, o microfone e um menu de mensagem, como uma conversa. No ecrã inicial, no separador Telegram ou numa das suas pastas, o menu tem **Marcar tudo como lido**. As fotos aparecem sozinhas na conversa e os GIFs tocam ali; um vídeo mostra sua imagem com ▶ e quanto dura, e um toque o reproduz em tela cheia, com som. O nome e os botões da conversa ficam no topo enquanto você rola. **Bloquear com um PIN**, nas informações de uma conversa, a bloqueia como uma conversa do Erevos: pede o PIN cada vez que abre, e o início não mostra nada do que ela diz. **Mover para conversas ocultas**, também ali, guarda a conversa nas conversas ocultas que o PIN delas abre: ela sai das listas e contagens deste espaço e só aparece ali; **Voltar para minhas conversas** a traz de volta. O Telegram ainda a tem, em todos os seus dispositivos. No **+** de uma conversa do Telegram, **Foto escondida** envia uma foto que aparece desfocada até ser tocada, e as que você recebe aparecem da mesma forma. **Localização** e **Cartão de contato** em **+** enviam um local ou um dos seus contatos para uma conversa do Telegram, como as apps do Telegram os mostram; o Telegram pode ler os dois, e um cartão só vai com número de telefone. **Enviar mais tarde** no **+** de uma conversa do Telegram envia o que foi digitado no horário que você escolher: o Telegram guarda e envia nesse horário, mesmo com este celular desligado, e **serão enviadas mais tarde** acima da caixa de mensagem mostra essas mensagens, com **Enviar agora** e **Apagar**. Não em uma conversa com criptografia ErevosGram. Em uma conversa do Telegram, o botão de busca também mostra **Mídia, links e arquivos**: **Fotos**, **Vídeos**, **Mensagens de voz**, **Arquivos** ou **Links**, cada tipo separado, todos do Telegram e não só os deste celular; toque em um para ir até ele na conversa. Com **Prévias de links** ativadas nas Configurações, o primeiro link de uma mensagem enviada a uma conversa do Telegram vai com a prévia que os servidores do Telegram fazem, como nos apps do próprio Telegram; as que chegam aparecem abaixo do texto, sem a imagem, e perguntam antes de abrir o link. **Bloquear capturas de tela** nas informações de uma conversa do Telegram a mantém fora de capturas e da prévia de apps recentes neste celular, no Android; o Telegram não pode pedir o mesmo ao outro lado. Uma conversa do Telegram aberta com seu PIN, ou guardada nas conversas ocultas, também fica de fora, como uma conversa do Erevos. **Notificações** nas informações de uma conversa do Telegram define som e toque próprios neste celular, ou a silencia aqui por um tempo, como em uma conversa do Erevos; **Silenciar notificações** acima a silencia no Telegram, em todos os seus dispositivos. Em uma conversa do Telegram, o que foi digitado e deixado volta quando a conversa abre de novo: o Telegram guarda como rascunho em todos os seus dispositivos, exceto em uma conversa com criptografia ErevosGram, onde só este celular guarda enquanto o Erevos roda. Uma mensagem que não pôde ser enviada tem **Enviar de novo** e **Apagar** no menu, e o botão de busca tem **Ir para um dia**. Mantenha pressionada uma foto, um vídeo ou um arquivo em uma conversa do Telegram e escolha **Salvar na Coleção** para guardar ali uma cópia criptografada; a de uma conversa oculta vai para a Coleção delas. **Enviar para**, a partir do Compartilhar de outro app, lista também as conversas do Telegram do espaço, exceto as bloqueadas com PIN, guardadas nas conversas ocultas ou canais: o texto vai para a caixa de mensagem da conversa, e uma foto ou arquivo de até 100 MB vai na hora. Em uma conversa do Telegram, um @nome pode ser tocado, e um link t.me (uma pessoa, um grupo ou canal, uma mensagem, um convite) abre dentro do Telegram do Erevos, perguntando antes de entrar por convite; os outros links perguntam antes de abrir no navegador. **Tor para esta conta do Telegram**, nas configurações do Telegram e antes de entrar, tem **Desativado** (o inicial), **Como o espaço** e **Sempre pelo Tor**, como toda conta de outra rede: com Sempre, ou enquanto o espaço manda Tudo pelo Tor, o Telegram é alcançado só pelo Tor, com circuitos próprios, também ao entrar, e nunca direto, nem quando o Tor não consegue conectar; a conta de cada lugar oculto escolhe por si. **Pelo Tor** nas informações de uma conversa do Telegram leva essa conversa só pelo Tor: o Telegram tem uma conexão para todas as conversas de uma conta, então a conta inteira vai pelo Tor enquanto estiver ligado. Mais lento, e as chamadas não passam pelo Tor.
- **Procurar por @nome:** no alto da tela do Telegram, escreva um nome em **Procurar por @nome** para abrir a conversa com essa pessoa ou canal.
- **Conversas ocultas:** cada lugar oculto pode ter uma conta do Telegram própria, que não aparece em lado nenhum fora das suas conversas ocultas. Vê [Conversas ocultas](#hidden).
- **Sair:** **Sair do Telegram neste telemóvel**, no fundo do ecrã do Telegram, pede-te que escolhas: **Terminar sessão também no Telegram** tira este telemóvel dos teus dispositivos no Telegram, e **Só esquecer aqui** deixa-o na lista de lá até o removeres na aplicação do Telegram. Nos dois casos o Erevos apaga o que o Telegram guardava neste telemóvel e as chaves do ErevosGram, por isso as conversas cifradas já não podem ser lidas.
- **Fotos e ficheiros:** uma foto, uma mensagem de voz, um vídeo ou um ficheiro só é descarregado do Telegram quando o pedes, e depois é mostrado ou guardado. As mensagens de voz e os vídeos aparecem por agora como ficheiros.

## Messenger {#messenger}

Só no Erevos+, no Android, o Erevos pode entrar na tua conta do Facebook Messenger e conversar com pessoas no Messenger, em **Configurações** → **Relay e redes** → **Messenger**, ou a partir do seu cartão no ecrã inicial. O Erevos fala ele próprio com os servidores da Meta, sem ponte no meio; não é feito pela Meta. A conta pertence ao telemóvel, não a um espaço: as suas conversas juntam-se à lista do ecrã inicial do primeiro espaço, marcadas como **Messenger**, com um cartão próprio. Ativa ou desativa o Messenger em **Configurações** → **Geral** → **Módulos**.

- **Iniciar sessão:** **Iniciar sessão no Messenger** abre a página de entrada do próprio Facebook. Entra lá como no facebook.com, com qualquer código ou verificação que o Facebook pedir, e o Erevos guarda a sessão, cifrada, neste telemóvel. Se o Messenger a terminar mais tarde, o ecrã do Messenger diz **O Messenger pede-te que inicies sessão de novo**.
- **O que a Meta pode ler:** por baixo do nome de uma conversa, o Erevos diz se ela é cifrada ponta a ponta. A Meta não pode ler uma conversa cifrada ponta a ponta, mas sabe quem fala com quem e quando; qualquer outra conversa, a Meta pode lê-la.
- **Conversas:** o ecrã do Messenger lista as tuas conversas, as mais recentes primeiro. **Nova conversa** encontra pessoas pelo nome: escreve-o, toca em **Buscar** e depois na pessoa para começar.
- **Escrever:** **+** ao lado da caixa da mensagem oferece **Foto**, **Câmera**, **Arquivo** (até 100 MB) e **Figurinha**. Sem nada escrito, mantém premido o microfone para gravar uma mensagem de voz. Mantém premida uma mensagem para o seu menu: uma reação, **Responder**, **Copiar** e **Apagar**, com **Apagar para todos** nas tuas mensagens e **Apagar para mim** em qualquer uma. Respostas, reações, edições e eliminações aparecem à medida que chegam. As chamadas do Messenger não estão no Erevos.
- **Abrir Facebook:** no ecrã do Messenger, **Abrir Facebook** mostra a própria página do Facebook com a mesma sessão. Os links do Messenger lá voltam ao Erevos; os outros links abrem no teu navegador, sem as marcas de rastreamento do Facebook e nunca pelo Tor, por isso esse site vê o teu endereço de internet. Se o ecrã primeiro te pedir para sair e entrar de novo, faz isso uma vez: o Messenger agora entra pelo facebook.com. O Facebook tem também um cartão próprio na janela **Serviços** do ecrã inicial, ao lado do Messenger, que o abre logo.
- **Messenger na sua capa:** no ecrã do Messenger, em **Como o Messenger é usado aqui**, com **Pelo Erevos** (o predefinido) o Erevos fala o Messenger ele mesmo, e **Na sua capa** mostra em vez disso a própria página do Messenger da Meta, como num computador, fechada dentro do Erevos com o mesmo início de sessão; **Abrir Messenger** abre-a. Só os sites da Meta carregam nela, as ligações para fora abrem no teu navegador sem as marcas de rastreio do Facebook, e o que a página da Meta guarda fica só na capa, à parte de qualquer outra página, para que reconheça o teu telemóvel e não peça sempre o PIN das tuas conversas encriptadas; apaga-se quando terminas a sessão do Messenger ou outra conta a abre. As chamadas funcionam nela, mas não através do Tor: se o Messenger passa pelo Tor, a página passa só pelo Tor, sem chamadas, e as ligações para fora não abrem. O Erevos continua a avisar-te de mensagens novas, mesmo que a capa nunca tenha sido aberta: uma conversa com mensagens por ler aparece no início até ser lida, e um toque abre-a na capa; enquanto a capa está aberta, o Erevos não avisa, porque a página já o mostra. Os bloqueios de conversa, as conversas ocultas e a Coleção não se aplicam às suas conversas. Fecha-se assim que o espaço se bloqueia ou se fecha, e com o botão de pânico, e fica fora das capturas de ecrã e da pré-visualização das apps recentes sempre que o ecrã do próprio Erevos fica; o mesmo a página do Facebook. Aparece sob a barra do próprio Erevos, com as cores do Erevos: **←** volta ao Erevos, e **Facebook** na barra mostra o feed do Facebook na mesma página, com **Messenger** para voltar. A página fica à largura do telemóvel, para se ler sem ampliar. A própria página da Meta assume toda a tua aparência: as suas cores, escura ou clara como o Erevos, a forma dos teus balões, o tamanho do texto, as letras do teu estilo e o que está por trás dos teus ecrãs, e muda com ela mesmo enquanto está aberta; uma foto tua fica no Erevos e a página mostra em vez dela um degradê suave. Onde a Meta mudar a sua página, algumas partes podem manter a aparência da Meta.
- **Notificações e leitura:** as mensagens novas notificam-te e contam no ícone do Erevos, como as outras conversas. Abrir uma conversa marca-a como lida, e ela fica lida até alguém escrever de novo, mesmo antes de o Messenger saber. Cada conversa tem as suas próprias **Notificações** por baixo da caixa da mensagem: silenciada, ou com um som próprio.
- **Pelo Tor:** **Tor para esta conta do Messenger**, no ecrã do Messenger e também antes de iniciar sessão, está **Desativado** por padrão, e os servidores da Meta veem o teu endereço de internet; **Como o espaço** segue **Configurações** → **Relay e redes** → **Tor**; **Sempre pelo Tor** leva a conta, a sua sessão e as suas fotos só pelo Tor. **Pelo Tor** numa conversa leva a conta inteira pelo Tor, porque o Messenger tem uma só ligação para todas as suas conversas. A Meta pode pedir confirmação, ou bloquear por um tempo, uma conta que entra pelo Tor. Veja [Quem vê o seu endereço de internet](#ip).
- **Terminar sessão:** **Terminar sessão no Messenger neste telemóvel** tira as suas conversas do Erevos; podes iniciar sessão de novo. As cópias de segurança guardam as notificações de cada conversa e a escolha do Tor, não a sessão: depois de restaurar, inicia sessão de novo.

## Signal {#signal}

Só no Erevos+, no Android, o Erevos pode ter a tua conta do Signal e conversar com pessoas no Signal, em **Configurações** → **Relay e redes** → **Signal**, ou a partir do seu cartão no ecrã inicial. O Erevos fala o próprio protocolo do Signal com os servidores do Signal, e toda conversa é cifrada ponta a ponta; não é feito pelo Signal. A conta pertence ao telemóvel, não a um espaço: as suas conversas juntam-se à lista do ecrã inicial do primeiro espaço, marcadas como **Signal**, com um cartão próprio. Ativa ou desativa o Signal em **Configurações** → **Geral** → **Módulos**.

- **Duas maneiras de entrar:** **Conta nova do Signal com o meu número** faz do Erevos o Signal desse número, e a aplicação Signal de outro telemóvel com o mesmo número deixa de funcionar. **Ligar ao Signal de outro telemóvel** deixa o teu Signal onde está e junta o Erevos como um dos seus dispositivos ligados.
- **Uma conta nova:** escreve o teu número com o indicativo do país, como +351 9…, e escolhe se o código chega por SMS ou, com **O código chega por chamada**, por chamada. O Signal primeiro pede-te que resolvas um captcha na sua própria página. Depois escreve o código que o Signal enviou, e o nome que os outros veem no Signal (o apelido é opcional).
- **Ligar:** no outro telemóvel, no Signal, abre **Definições** → **Dispositivos ligados** → **Ligar novo dispositivo** e lê o código que o Erevos mostra. As mensagens novas chegam então aos dois.
- **Conversas e grupos:** o ecrã do Signal lista as tuas conversas e grupos, os mais recentes primeiro. **Nova conversa** encontra uma pessoa pelo número de telefone ou pelo nome; toca nela para começar. Os grupos em que estás funcionam como conversas; os grupos novos criam-se na aplicação Signal.
- **Escrever:** **+** oferece **Foto**, **Câmera**, **Arquivo** (até 100 MB) e **Figurinha**; sem nada escrito, mantém premido o microfone para uma mensagem de voz. Mantém premida uma mensagem para uma reação, **Responder**, **Copiar** e **Apagar**, com **Apagar para todos** nas tuas mensagens e **Apagar para mim** em qualquer uma.
- **Chamadas:** numa conversa com uma só pessoa, **Chamada de voz** e **Videochamada** ligam-lhe pelo Signal, cifradas ponta a ponta. Uma chamada do Signal recebida aparece sobre qualquer ecrã, com **Atender**, **Atender com vídeo** e **Recusar**. As chamadas não passam pelo Tor, e o Erevos avisa antes de cada uma.
- **Notificações e leitura:** como no Messenger, as mensagens novas notificam-te e contam no ícone, uma conversa lida aqui fica lida, e cada conversa tem as suas **Notificações**, com um toque próprio para as chamadas.
- **Pelo Tor:** **Tor para esta conta do Signal**, também antes de iniciar sessão, funciona como no Messenger: **Desativado** por padrão, por isso os servidores do Signal veem o teu endereço de internet. Com **Sempre pelo Tor**, o registo, o seu captcha e a ligação passam também pelo Tor. **Pelo Tor** numa conversa leva a conta inteira pelo Tor.
- **Terminar sessão:** **Terminar sessão no Signal neste telemóvel** tira as suas conversas do Erevos. As cópias de segurança guardam as notificações de cada conversa e a escolha do Tor, não a conta: depois de restaurar, regista-te ou liga de novo.

## Session {#session}

Só no Erevos+, no Android, o Erevos pode ter uma conta do Session e conversar com pessoas no Session, em **Configurações** → **Relay e redes** → **Session**, ou a partir do seu cartão no ecrã inicial. O Session não pede número de telefone nem e-mail: a conta são 13 palavras de recuperação, e as suas mensagens vão cifradas ponta a ponta pelo encaminhamento em cebola dos nós do Session. O Erevos não é feito pelo Session. A conta pertence ao telemóvel, não a um espaço: as suas conversas juntam-se à lista do ecrã inicial do primeiro espaço, marcadas como **Session**, com um cartão próprio. Ativa ou desativa o Session em **Configurações** → **Geral** → **Módulos**.

- **Uma conta nova:** toca em **Conta nova do Session**, escreve o teu nome no Session e toca em **Criar a conta**. O Erevos mostra **As tuas 13 palavras de recuperação**: escreve-as, guarda-as bem e toca em **Já as escrevi**. São a única forma de recuperar a conta, e quem as tiver pode ler as tuas conversas.
- **Uma conta que já tens:** **Recuperar uma conta com as suas 13 palavras** pede as palavras, com espaços entre elas, e o teu nome; depois toca em **Recuperá-la**.
- **O teu Session ID:** o ecrã do Session mostra-o, com **Copiar**. Os outros começam uma conversa contigo por ele.
- **Conversas:** **Nova conversa** pede um Session ID ou um nome ONS, e **Abrir** começa a conversa.
- **Grupos:** **Novo grupo do Session** cria um grupo a partir de um nome e das pessoas que escolhes entre as tuas conversas do Session. Elas recebem um convite e entram quando o aceitam, e tu és o administrador. Num grupo, o seu botão mostra os **Membros**; um administrador pode usar **Adicionar pessoas**, **Renomear** o grupo, e **Tornar admin** ou **Remover do grupo** alguém que não é administrador. **Sair do grupo** sai dele, e voltar precisa de um convite novo.
- **Escrever:** **+** oferece **Foto**, **Câmera**, **Arquivo** (até 10 MB) e **Figurinha**; sem nada escrito, mantém premido o microfone para uma mensagem de voz. Mantém premida uma mensagem para uma reação, **Responder**, **Copiar** e **Apagar**.
- **Chamadas:** numa conversa com uma só pessoa, **Chamada de voz** e **Videochamada** ligam-lhe pelo Session. O Session toca ele próprio as suas chamadas, em silêncio numa conversa silenciada. As chamadas não passam pelo Tor, e o Erevos avisa antes de cada uma.
- **Notificações e leitura:** como no Messenger e no Signal, com as **Notificações** próprias de cada conversa e um toque próprio para as chamadas.
- **Pelo Tor:** **Tor para esta conta do Session** funciona como no Messenger e no Signal, **Desativado** por padrão. O encaminhamento em cebola do Session já esconde o teu endereço de internet de quem escreves; o primeiro nó do Session vê-o, a não ser que a conta vá pelo Tor.
- **Terminar sessão:** **Terminar sessão no Session neste telemóvel** pergunta primeiro, porque sem as tuas 13 palavras de recuperação a conta não pode voltar. As cópias de segurança não guardam a conta: depois de restaurar, recupera-a com as suas palavras.

## SMS {#sms}

No Android, o Erevos pode ser o app de SMS do celular: em **Configurações** → **Telefone e SMS** → **SMS** → **O
Erevos como app de SMS**, toque em **Tornar o Erevos o app de SMS**. A tela inicial passa então a mostrar os SMS e as
conversas do Erevos numa lista só.

> **O Erevos não criptografa SMS nem MMS.** Eles viajam como todo SMS, e ficam no armazenamento de SMS do próprio
> Android, onde qualquer app com permissão para ler SMS os vê e os backups do Android os guardam. Só as conversas do
> Erevos são criptografadas de ponta a ponta.

- **SMS de antes:** nada para importar. O Erevos mostra os SMS e MMS que já estão no celular, do armazenamento do
  próprio Android, onde eles ficam para qualquer outro app de SMS. O Android os guarda, sem selo do Erevos, como com
  todo app de SMS.
- **Se o Erevos não se tornar o app de SMS:** o Android 15 e posteriores podem bloquear isso para um app instalado
  pelo navegador. Em **Configurações** → **Telefone e SMS** → **SMS** → **O Erevos como app de SMS**, toque em **Abrir
  Apps padrão** → **App de SMS** → Erevos. Se o Android chamar isso de configuração restrita, abra as **informações do
  app Erevos**, toque em **⋮** no canto superior direito → **Permitir configurações restritas**, e escolha o Erevos de
  novo.
- **Quando chega um SMS:** um aviso diz "New message", sem quem o enviou nem o que diz. Se nenhum aparecer, **O
  Erevos como app de SMS** mostra **Permitir notificações** enquanto o Android os bloqueia.
- **Códigos de uso único:** um SMS que diz conter um código (de um banco, de um login), em qualquer um dos idiomas do
  app, ganha **Copiar código** abaixo dele na conversa, e no aviso dele também, sem que o código apareça ali; no
  Android 12 e posteriores, o botão do aviso pede para desbloquear o celular antes. Só os 4 a 8 dígitos dele são
  copiados, nunca um número de telefone, um valor, uma data ou uma hora, e o Android não mostra prévia deles. Qualquer
  app que leia a área de transferência pode lê-los, então cole o código logo.
- **Responder pelo aviso:** **Configurações** → **Telefone e SMS** → **SMS** → **O que um SMS diz, no seu aviso**,
  desligado no início, mostra no aviso de um SMS quem escreveu e o quê enquanto este espaço está aberto, com
  **Responder**, que envia um SMS simples pelo SIM em que chegou, e **Marcar como lida**. Quem vê a tela vê;
  bloqueado, ou com outro espaço aberto, o aviso volta a dizer só “Nova mensagem”, e um com código de uso único
  sempre.
- **Se nenhum SMS aparecer:** o Android 15 e posteriores bloqueiam a permissão de SMS para um app instalado pelo
  navegador. Em **Configurações** → **Telefone e SMS** → **SMS** → **O Erevos como app de SMS**, toque em **Permitir
  SMS**. Se o Android chamar isso de configuração restrita, abra as **informações do app Erevos**, toque em **⋮** no
  canto superior direito → **Permitir configurações restritas**, e permita SMS em **Permissões**. As conversas
  enviadas como RCS ("chat" no Google Messages) ficam nesse app e não aparecem. **O Erevos como app de SMS** diz
  quantas conversas de SMS o Erevos lê, ou por que não conseguiu lê-las.
- **Escrever para alguém com {=Erevos}:** vai pelo {=Erevos}, criptografado de ponta a ponta, assim que o número da pessoa
  estiver vinculado ao contato dela. Vincule-o à mão na conversa de SMS, ou deixe um convite oculto encontrá-lo. A
  partir daí a conversa de SMS dela abre a conversa dela no {=Erevos}.
- **Os SMS dela na conversa:** os SMS e MMS com o número dela, os de antes e os que chegam, aparecem entre as
  mensagens da conversa por ordem de hora, cada um com uma borda e marcado **SMS (sem criptografia)**, com o ✓ e as
  fotos dele. Segure um para copiá-lo, encaminhá-lo ou apagá-lo, como na conversa de SMS. Eles ficam nos SMS do
  celular, nunca no histórico selado da conversa; só aparece a conversa com aquele único número, não um MMS em grupo,
  e só enquanto o Erevos é o app de SMS ou pode ler SMS, nunca nas conversas ocultas. Os mais recentes aparecem
  primeiro: **Mostrar SMS anteriores**, acima deles, traz mais, e a busca da conversa também os encontra. Abrir a
  conversa lê todos os dela, também os anteriores, para que nenhum fique contado na tela inicial. Um número no cartão
  de contato dela faz o mesmo, sem vinculá-lo.
- **Um SMS comum para ela:** quando não há internet, por exemplo. **SMS comum** nos **Detalhes** da conversa abre a
  conversa de SMS dela para escrevê-lo ali, e **+** → **Enviar como SMS**, ou **Como SMS** quando você segura a seta
  de enviar, envia o que você digitou como SMS, depois de perguntar. Ele aparece na conversa como SMS. A operadora
  pode lê-lo. Um SMS não pode desaparecer nem responder a uma mensagem: com o cronômetro ativado, ou uma mensagem
  sendo respondida, o Erevos avisa quando pergunta.
- **Convites ocultos:** com o primeiro SMS para um número que não é contato, o Erevos também envia um convite oculto
  curto. Nenhum vai para o número de um contato do Erevos, vinculado ou no cartão de contato dele. Um celular sem
  {=Erevos} não mostra nada; um celular com {=Erevos} responde pelo relay e os dois viram contatos. Ele responde sozinho só
  a um número que conhece, entre os seus contatos ou um para o qual você escreveu por SMS; para qualquer outro
  pergunta antes, **Um convite por SMS**, porque o remetente de um SMS pode ser falsificado. Cada número é consultado
  no máximo uma vez por mês, e **Desativar convites**, em **Configurações** → **Telefone e SMS** → **SMS** →
  **Descobrir o Erevos num número**, os interrompe.

**Por quê:** para que dois celulares com {=Erevos} se encontrem só a partir de um número de telefone, sem nenhum servidor
que conheça números. O convite é um SMS de dados, que os apps de mensagens não mostram, então um celular sem {=Erevos} não
mostra nada.

- **Todos os outros:** um SMS comum, marcado SMS. A operadora pode lê-lo, como lê todo SMS.
- **✓ e ✓✓✓:** um SMS seu mostra ✓ assim que foi enviado, e ✓✓✓ assim que o relatório de entrega da rede diz que ele
  chegou ao celular da pessoa, ou "não entregue". Algumas operadoras não enviam relatórios de entrega; então ele fica
  em ✓. O SMS não tem como dizer se foi lido.
- **Fotos, mensagens de voz e cartões de contato (MMS):** **+** → **Foto** acrescenta uma foto, reduzida para caber num
  MMS (cerca de 280 KB), sem nada nela além da imagem. Segure o microfone, sem nada digitado, para gravar uma mensagem
  de voz de até um minuto, enviada como MMS em AMR, o formato que os apps de mensagens dos celulares reproduzem. **+** →
  **Cartão de contato** envia um contato dos contatos do celular como vCard, sem as suas anotações sobre ele nem os
  grupos dele, e com a imagem dele só se ainda couber. **+** → **Figurinha** envia uma das figurinhas embutidas como a
  imagem dela, sozinha num MMS. As fotos, mensagens de voz e cartões de contato que chegam aparecem na conversa, para
  reproduzir ou salvar (**Salvar** abre um novo contato com os dados do cartão). Um MMS é tão aberto quanto um SMS: a
  operadora pode vê-lo.
- **Vídeos (MMS):** **+** → **Gravar um vídeo** pede ao app de câmera do celular um vídeo em qualidade de MMS, até
  30 segundos de imagem pequena, o que a maioria das câmeras respeita; **Vídeo do celular** só pega um que já seja
  pequeno o bastante, cerca de 280 KB, pois o Erevos não diminui vídeos. Um vídeo que chega mostra ▶ na conversa, e
  um toque o reproduz no app de vídeo do celular.
- **MMS no exterior:** um MMS espera na operadora até o celular baixá-lo pelos dados móveis, que no exterior podem
  custar. **Configurações** → **Telefone e SMS** → **SMS** → **MMS** os baixa na hora mas, a menos que você ligue,
  não em roaming: então um aparece na conversa como **MMS** com o tamanho e **Baixar (pode custar)**, e também em
  **MMS**, para um número ainda sem conversa. Desligado de todo, cada MMS espera um toque.
- **Onde você está:** **+** → **Localização** envia onde você está como um SMS com um endereço geo: e um link do
  OpenStreetMap, que qualquer celular abre. Um endereço geo:, ou um link do OpenStreetMap, Google Maps, Apple Maps ou
  Waze, num SMS que chega aparece como um lugar, para abrir no app de mapas; um link curto continua sendo um link,
  porque teria de ser buscado para saber o lugar.
- **Reações de um iPhone ou do Google Messages:** quando alguém sem Erevos reage a um SMS seu, o celular dele a
  envia como palavras, Liked “Até às 8” ou Reacted 😂 to “Até às 8”: a conversa a mostra como 👍 ou 😂 sob a mensagem
  citada, a mais recente com essas palavras, e não como uma mensagem à parte; uma retirada (Removed a like from …)
  some. Por enquanto só são lidas as escritas em inglês; uma cuja mensagem não é encontrada fica como chegou.
- **Fixadas para você:** toque e segure uma mensagem e escolha **Fixar só para mim** para fixá-la acima da conversa. SMS
  não têm fixadas: ela fica só neste celular, criptografada com os dados de SMS do espaço, e a outra pessoa nunca fica
  sabendo.
- **Várias mensagens:** toque e segure uma mensagem e escolha **Selecionar**, depois toque em outras: **Copiar** as põe
  num só texto, **Encaminhar** as envia como uma só para o rascunho de outra conversa, e **Apagar** as apaga do celular,
  com **Desfazer** por alguns segundos.
- **Novo SMS:** na parte **SMS** da lista de conversas, o botão em baixo é **Novo SMS** e abre só isso, também com
  as conversas do Erevos ligadas.
- **Escolher o destinatário:** em **Novo SMS**, toque em **Contatos** para escolher entre seus contatos, com busca, ou
  apenas digite: os contatos cujo nome ou número combina com o que você digita aparecem sob o campo, e um toque o
  preenche. Um contato com vários números mostra uma linha para cada um. Em um grupo, cada contato escolhido é
  acrescentado aos números que já estão ali. São os contatos do telefone e, com o Erevos desbloqueado, os guardados só
  no Erevos e seus contatos do Erevos com número, nunca os nomes de conversas ocultas. Com só os SMS abertos, aparecem
  só os contatos do telefone. O Android pergunta antes se o Erevos pode lê-los.
- **MMS em grupo:** em **Configurações** → **Telefone e SMS** → **SMS** → **Novo SMS**, digite vários números
  separados por vírgulas e toque em **Escrever**. Toda mensagem vai para todos eles como um MMS, mesmo só texto, e as
  respostas deles chegam na mesma conversa, cada uma com quem a escreveu. Todos ali veem o número de todos, e a
  operadora vê tudo.
- **Dois chips:** o chip pelo qual enviar aparece acima do campo de mensagem; toque em **Escolher o chip** uma vez
  para deixar o Erevos vê-los. A sua escolha fica guardada para aquele número; até lá, o Erevos responde pelo chip em
  que chegou a última mensagem. Cada mensagem mostra o chip dela.
- **SMS mais tarde:** segure o **Enviar** redondo depois do campo e escolha um horário, como numa conversa. O SMS
  aparece no fim da conversa marcado **Agendada**; toque nele para cancelá-lo. Ele vai nesse horário, também com o
  Erevos fechado e bloqueado; se o celular estiver desligado então, assim que for ligado e desbloqueado de novo. Até
  lá ele não está nos SMS do celular, onde outros apps o veriam, e a operadora não o tem. Ele espera trancado com uma
  chave do próprio celular (Android Keystore), não com a senha do seu espaço, pois o Android precisa enviá-lo enquanto
  o Erevos está bloqueado: a proteção que todo SMS tem depois de enviado, já que os SMS enviados ficam nos SMS do
  celular. Só texto, para um número.
- **Links:** um endereço web num SMS fica sublinhado, e abre como numa conversa, depois de você vê-lo inteiro.
- **Nomes dos seus contatos:** desativado no início, então os números de SMS aparecem como números. **Nomes**, acima
  da lista na parte **SMS**, os desbloqueia (assim como **Mostrar nomes dos meus contatos** em **Configurações** → **Telefone e SMS** →
  **SMS** → **Nomes dos seus contatos**): os nomes que os contatos do seu celular dão aos números de SMS, e as imagens
  que eles têm para eles, ou senão os dos seus contatos guardados só no Erevos, na lista e na conversa. Toque em
  **Nomes** de novo para ver só números. O Erevos só os lê para mostrá-los, e não guarda cópia.
- **Remetentes com nome:** um SMS de um nome em vez de um número, como o de um banco, abre para leitura, mas não pode
  ser respondido.
- **Lembrar-me:** segure uma mensagem para **Lembrar-me**: ela vai para **Conversa comigo** com o nome da conversa, e
  lembra você na hora que escolher.
- **Mensagens temporárias:** com o Erevos como app de SMS, **Mensagens temporárias**, abaixo da linha **SMS comum** de
  uma conversa, apaga deste celular os SMS novos dela esse tempo depois de enviados, ou assim que o Erevos voltar a
  rodar. O outro celular os guarda: um SMS não pode ser apagado lá. As mensagens que já estão aqui ficam.

### SMS criptografados quando nada mais funciona

Quando o relay, o Nostr, os celulares por perto e o LoRa falham todos, um texto para um contato do Erevos com número
vinculado pode ir por SMS, criptografado de ponta a ponta como qualquer mensagem do Erevos. Fica desativado até você
ativar: para todos esses contatos em **Configurações** → **Telefone e SMS** → **SMS** → **SMS quando nada mais
funciona** (**Ativar para todos os contatos**), ou para um só nos **Detalhes** da conversa dele → **SMS quando nada
mais funciona**.

- **Quanto custa:** cada SMS custa o que diz o seu plano. Um texto curto ocupa 3 SMS e um mais longo até 10; no
  exterior um SMS pode custar bem mais.
- **O que a operadora vê:** qual número escreveu para qual, quando e quantos SMS, como em qualquer SMS; nunca o que foi
  escrito, que vai como a mesma mensagem criptografada que o relay teria levado.
- **O que vai:** só textos e exclusões. Não fotos, arquivos, mensagens de voz, chamadas, reações nem as marcas de que
  uma mensagem chegou ou foi lida, nem textos com mais de umas 800 letras latinas (400 gregas), nem a primeiríssima
  mensagem para um contato novo, que leva as chaves. Essas esperam, marcadas **Aguardando**, como em
  [Como o Erevos escolhe o caminho](#paths). As conversas ocultas nunca vão por SMS.
- **Os dois celulares** precisam do {=Erevos} como app de SMS, e do número do contato vinculado à conversa dele. Os SMS
  são SMS de dados ocultos para o Erevos, que nenhum app de SMS mostra, e nada deles fica nos SMS do celular.
- **Por onde foi:** toque e segure a mensagem: o menu dela diz **Foi por SMS** ou **Veio por SMS**. **✓✓** chega assim
  que o relay ou o Nostr estiverem acessíveis de novo: nenhum SMS volta sozinho.

**Por quê:** o SMS chega a um celular sem internet nenhuma, onde houver rede móvel. Mas custa dinheiro e conta à
operadora quem fala com quem, o que o Erevos de outro modo esconde; por isso o SMS é o último caminho, e só quando você
escolhe.

> Ative só para quem você precisa alcançar assim. A operadora, e quem puder ver os registros dela, sabe por esses SMS
> que os seus dois números conversam, e quando.

### Manter os SMS em ordem

- **Segurar:** na lista, segure uma conversa de SMS para ver o que ela pode fazer: **Fixar no topo**, **Arquivar**,
  **Marcar como spam**, **Bloquear** e **Apagar**, e **Adicionar aos contatos** para um número que não é de nenhum dos
  seus contatos. Numa conversa, **⋮** no topo mostra o mesmo, e primeiro **Buscar nesta conversa**, **Mídia, links e
  arquivos**, **Ir para um dia** e **Exportar conversa** (veja [Primeiros passos](#start)), e um número assim também
  tem **Adicionar aos contatos** abaixo do nome: um novo contato com o número dentro.
- **Fixadas:** até 10 conversas de SMS ficam no topo da lista, com um alfinete. **Desafixar** deixa uma voltar ao seu
  lugar.
- **Conversas arquivadas:** fora da lista, em **Arquivadas** no topo da tela inicial. Uma volta à lista sozinha quando
  chega um novo SMS daquele número, ou com **Desarquivar**.
- **Nomes de MMS em grupo:** segure um MMS em grupo e escolha **Nomear aqui** para dar a ele um nome seu, só neste
  celular.
- **O próprio de uma conversa:** abaixo da linha **SMS comum**, uma conversa tem **Aparência da conversa**, como uma
  conversa do Erevos, e, com um número só, **Notificações**: silencie-a por um tempo ou sempre, ou dê a ela um som
  próprio, ou nenhum. Valem enquanto o espaço está aberto; com ele fechado, cada SMS avisa como dizem as
  configurações.
- **Lixeira:** uma conversa apagada espera na **Lixeira** 30 dias, e depois o Erevos a apaga dos SMS do celular. Até
  lá, **Recuperar** a põe de volta na lista; **Apagar agora** e **Esvaziar a lixeira** apagam na hora, de vez. Um SMS
  que chega depois de ela ir para a Lixeira aparece na lista de novo. Só o app de SMS pode apagar SMS.
- **Spam:** um filtro que funciona só no celular, por regras, e não envia nada a lugar nenhum. Um SMS de um número que
  não é contato e a que você nunca respondeu vai para o **Spam** quando tem um link com palavras que tentam enganar,
  como uma encomenda retida ou um prêmio, ou uma das palavras que você acrescenta em **Configurações** → **Telefone e
  SMS** → **SMS** → **Filtro de spam**. **Marcar como spam** e **Não é spam** decidem de vez para um número. Um SMS
  que as palavras do próprio filtro pegam (um link com palavras que tentam enganar, de um número de telefone que não está em nenhum contato do celular e a que você nunca respondeu) chega sem aviso e sem som, pois o celular também conhece essas palavras; qualquer outro spam, pelas suas palavras, suas regras ou do exterior, ainda mostra "New message", pois esse aviso chega antes de o Erevos ser aberto e o resto do filtro fica criptografado no espaço. Um número que você marcou como **Não é spam** ou deixa passar também chega em silêncio quando manda essas palavras, a não ser que esteja nos contatos do celular. Com o **Filtro de spam** desligado, todo SMS tem o seu aviso: o celular guarda só se o filtro está ligado, como diz o último espaço aberto.
  Cada conversa no **Spam**, na
  pasta e no topo da conversa, diz por que está ali: o número está bloqueado, você o marcou, a sua regra nomeia o
  remetente, um número do exterior, a sua palavra, ou um link e quais palavras.
- **Letras parecidas:** um SMS de golpe que troca uma letra por outra de outro alfabeto que parece igual, como um а cirílico numa palavra latina, ou esconde numa palavra uma marca que não se vê, não passa pelo filtro: ele lê as palavras como elas aparecem. Quem envia nunca é comparado assim, pois um remetente parecido com um permitido não é esse remetente.
- **Regras sobre quem envia:** em **Filtro de spam**, **Remetentes** aceita o nome de um remetente, como as lojas e os
  bancos enviam (letras, sem acentos nem maiúsculas), ou um número, onde \`*\` vale por qualquer coisa: \`+4470*\` é
  todo número que começa assim, \`1234*\` todo código curto que começa assim, e com o código do seu país conhecido,
  \`69*\` é também todo número \`+3069...\`. **Para o Spam** manda os dele para lá; **Deixar passar** tira dele as
  regras do filtro, como os do seu banco ou da sua família, embora um número que você marcou como spam, ou bloqueou,
  ainda vá para lá. **Mandar para o Spam números do exterior** manda todo número escrito com outro código de país que
  não o **Código do seu país**, que o Erevos tira dos números a que você responde e que você pode mudar. Um número
  escrito sem código é daqui. Toque numa regra para removê-la.
- **Bloquear:** **Bloquear** no menu de uma conversa, ou **Configurações** → **Telefone e SMS** → **SMS** → **Números
  bloqueados**, põe um número na lista de números bloqueados do próprio Android: o Android rejeita os SMS, MMS e
  chamadas dele, e todos os espaços e o app de telefone veem a mesma lista. Só o app de SMS ou o app de telefone podem
  vê-la e mudá-la.
- **Rascunhos:** o que você digita e não envia fica com aquela conversa, e a lista o mostra como **Rascunho**. Um SMS
  que não pôde ir também fica ali como rascunho.
- **Textos rápidos:** segure o **+** ao lado do campo, ou escolha **Textos rápidos** nele, para palavras curtas que
  você escreve com frequência (Estou a caminho, Te ligo depois): um toque põe um no campo, para enviar como está ou
  com mais. **Adicionar** guarda um seu, e segurar um o remove; a partir daí a lista é sua, guardada criptografada
  com os SMS do espaço, cada espaço a sua.
- **Desfazer envio de SMS:** um SMS que você envia espera antes 5 segundos no fim da conversa: toque nele nesse
  momento para trazê-lo de volta ao campo de mensagem. **Configurações** → **Telefone e SMS** → **SMS** → **Desfazer
  envio de SMS** define **Desativado**, 5 ou 10 segundos. Quando você sai do Erevos, ele vai na hora.
- **Quanto custa enviar:** um SMS mais longo mostra acima do campo uma linha com quantos caracteres tem e em quantos
  SMS vai: 160 caracteres num SMS, ou 153 em cada parte de um mais longo, mas 70, ou 67, assim que tem uma minúscula
  grega, um acento ou um emoji. **Configurações** → **Telefone e SMS** → **SMS** → **Sem acentos (mais barato)**
  envia um SMS simples sem acentos e o grego em maiúsculas, como os celulares antigos escreviam (ΚΑΛΗΜΕΡΑ), e volta
  a comportar 160; não um com emoji, nem um MMS.
- **Enviar de novo:** uma mensagem sua que não foi, ou não foi entregue, diz isso: toque nela para enviá-la de novo.
  Segure qualquer mensagem para **Encaminhar**, **Enviar de novo** e **Apagar**, com as palavras dela para selecionar
  e copiar; uma mensagem apagada também tem **Desfazer**.
- **Encaminhar:** segure uma mensagem → **Encaminhar**, depois digite um número e toque em **Escrever**, ou escolha um
  contato em **Numa conversa do Erevos**. Ela abre nessa conversa, para ler e enviar ali. Para um número, a imagem
  dela vai também, como MMS; para uma conversa, só as palavras.
- **Cada espaço com os seus:** os fixados, as conversas arquivadas, a Lixeira, as marcas de spam e os rascunhos
  pertencem ao espaço, selados com a senha dele. Os próprios SMS ficam nos SMS do celular: outro espaço os vê como
  estão, e um que está na Lixeira aqui aparece lá até ser apagado do celular.

### Nos seus dispositivos conectados

Os SMS do celular podem aparecer também nos [dispositivos conectados](#devices) deste espaço: um computador, um
navegador, um tablet. Lá você os lê e responde, e o celular envia a resposta como SMS. Fica desativado até você
ativar, no celular: **Configurações** → **Telefone e SMS** → **SMS** → **Também nos meus dispositivos conectados** →
**Enviar também os meus SMS aos meus dispositivos**.

- **O que vai:** as últimas 50 conversas da lista e de **Arquivadas**, cada uma com as suas últimas 50 mensagens, com
  criptografia de ponta a ponta como tudo o que os dispositivos compartilham. As mais antigas, as da **Lixeira** e do
  **Spam**, e as fotos ficam no celular: uma mensagem com foto diz **📷 Uma foto, no celular**. Os nomes vão só
  enquanto o celular os mostra (**Nomes dos seus contatos**).
- **Responder:** o que você escreve em um dispositivo aparece como enviando até o celular enviar, no chip que ele usa
  para esse número, e depois fica entre os do próprio celular. Uma que o celular não conseguiu enviar diz isso: toque
  nela para enviá-la de novo. O celular envia cada uma só uma vez, e no máximo 60 por hora dos dispositivos, para que
  um dispositivo perdido não mande uma enxurrada de SMS; uma que esperou mais de um dia não sai.
- **Lido:** uma conversa lida em um dispositivo fica marcada como lida também no celular.
- **Avisos:** um novo SMS dá um aviso também no dispositivo, como dizem as configurações de notificação dele.
- **Pelo celular:** os SMS vêm e vão só enquanto este espaço está aberto no celular, como tudo o que passa pelo
  celular. Num dispositivo as telas são as do celular, sem o que só o celular faz: apagar, bloquear, enviar mais
  tarde, fotos e convites.
- **Cada espaço com o seu:** o interruptor pertence ao espaço. Um lugar de conversas ocultas nunca envia os SMS aos
  dispositivos.
- **Desativar:** **Parar os SMS nos meus dispositivos**, no celular, tira os SMS de todos os dispositivos.

**Por quê:** só o celular tem um chip, então só o celular envia e recebe SMS. Os dispositivos os veem pelo celular,
com criptografia de ponta a ponta como o resto, e a operadora não vê nada além do que via antes.

## Telefone {#phone}

No Android, o Erevos pode ser o app de telefone do celular: em **Telefone** no menu, toque em **Configurações** →
**Tornar o Erevos o app de telefone**. Toda chamada passa então a aparecer na tela de chamada do próprio Erevos, e os
links tel: e o botão de chamada do celular abrem o teclado do Erevos. **Telefone** também abre pelo fone no topo da
tela inicial, e tem um ícone próprio nos apps do celular, **Telefone**, verde com um fone sobre a marca do Erevos, que
abre o teclado. Cada um deles, como um link tel:, o abre assim que o Erevos estiver desbloqueado: com uma senha, depois
de você digitá-la, a menos que o Telefone abra sem ela (veja A senha do Erevos, abaixo). Até lá, um cartão no topo diz
**O Erevos não é o app de telefone**; num celular pequeno ele mostra só esse título, e tocar nele abre as
**Configurações** do Telefone.

- **Chamadas de emergência:** um número de emergência (112, ou o do seu país) é chamado na hora, sem perguntar o
  SIM: o Android escolhe. Com o Erevos bloqueado e o Telefone atrás da senha, **Chamada de emergência** na tela da
  senha abre o teclado de emergência do Android, sem senha.
- **Buscar contatos:** no topo do Telefone, digite um nome, um número ou parte de um deles: os contatos com número
  aparecem no lugar das abas, cada número numa linha própria. Toque num para ligar, ou segure-o para pô-lo no
  teclado. Procura nos contatos do celular e, com o Erevos desbloqueado, nos guardados só no Erevos e nos seus
  contatos do Erevos com número; nunca nas conversas ocultas.
- **Contatos ao discar:** enquanto você digita no **Teclado**, os contatos que ele encontra aparecem numa lista acima do
  número: um cujo número contém os dígitos digitados, ou cujo nome começa com eles nas letras das teclas, como 2 para ABC
  (e ΑΒΓ). Cada tecla mostra suas letras no idioma do app. Toque num contato para ligar, ou segure para pôr o número dele
  no teclado. Numa tela pequena, onde não há espaço acima do número, o primeiro aparece acima das teclas e **mais**, ao
  lado, lista os outros.
- **A tela de chamada:** quem liga, ou para quem você liga, com o nome e a foto que os contatos do seu celular dão a
  essa pessoa; enquanto o Erevos está desbloqueado, um número vinculado a um dos seus contatos do Erevos mostra o nome
  que você deu a ele, e o número de um contato guardado só no Erevos também; o de um contato de conversas ocultas
  abertas, só enquanto elas estão abertas. Ela aparece sobre a tela de bloqueio e não precisa de senha, pois uma
  chamada tem de ser atendida com o Erevos bloqueado. Uma chamada que chega mostra **Answer**, **Decline** e
  **Message**, e o Android toca com o toque próprio do contato; as teclas de volume o silenciam. Numa chamada:
  **Mute**, **Keypad** para os tons que um menu pede, **Speaker**, **Hold**, **Add call** e
  **End**. No ouvido, a tela se apaga.
- **Para onde vai o som:** com um dispositivo Bluetooth ou um fone de ouvido, o botão ao lado de **Keypad** diz para
  onde vai o som, e um toque deixa você escolher: o celular, o alto-falante, o fone de ouvido ou o dispositivo
  Bluetooth.
- **Uma segunda chamada:** uma que chega durante uma chamada mostra **Hold and answer**, **End and
  answer** e **Decline**. Com uma chamada em espera, a linha abaixo do nome diz isso: toque nela, ou em **Swap**,
  para falar com a outra. **Merge** junta as duas numa chamada, quando a sua operadora permite.
- **Uma conferência:** com as chamadas mescladas, a tela de chamada lista as pessoas que estão nela no lugar da
  foto. Ao lado de cada uma, **Separar** fala só com ela enquanto as outras aguardam em espera, e **Encerrar** tira
  só ela; cada um aparece só onde a operadora permite.
- **Videochamadas pela operadora:** onde o seu chip e a rede as suportam (ViLTE, por 4G ou 5G), uma videochamada
  recebida mostra **Atender com vídeo** e **Só áudio**; na chamada, o outro lado aparece em tela cheia e a sua
  câmera num canto, com **Desligar câmera** e **Trocar câmera**. Uma chamada sem vídeo mostra **Vídeo** quando os
  dois lados podem, e quando o outro pede, o Erevos pergunta a você: **Ligar vídeo** ou **Continuar só com áudio**.
  Para começar uma, digite o número e toque em **⋯** → **Videochamada**. O Android pede a câmera uma vez. Como
  qualquer chamada telefônica, a operadora a transporta e pode vê-la; nada disso aparece onde a rede não tem
  videochamadas.
- **Recusar com uma mensagem:** **Message**, numa chamada que toca, a recusa com uma resposta rápida, ou uma que você
  escreve, que o seu celular envia a quem liga como SMS; ela aparece entre os seus SMS. Em **Telefone** →
  **Configurações**, **Respostas rápidas** as muda: **Adicionar uma resposta**, **Remover**, **Salvar** e **Usar as
  respostas de sempre**. Elas ficam guardadas no celular, sem selo, pois a tela de chamada as mostra com o Erevos
  bloqueado.
- **O teclado:** em **Telefone**, digite um número e toque em **Ligar**; segure **0** para o +. Ao segurar, o campo
  do número cola um. **Add call**, durante uma chamada, o abre assim que o Erevos estiver desbloqueado.
- **Correio de voz:** com o teclado vazio, segure o **1** (marcado oo) para ligar para o seu correio de voz, pelo
  chip escolhido acima de **Ligar**. Se o chip não tiver número de correio de voz, o Telefone diz: a operadora o
  fornece. Onde a sua operadora envia as mensagens como gravações (correio de voz visual), **Correio de voz**
  aparece ao lado de **Favoritos**: cada mensagem com quem deixou, quando, quanto dura e as palavras dela quando
  vieram. **▶** toca, **■** para; um toque na linha oferece **Retornar a ligação**, **Enviar um SMS** e **Apagar
  esta mensagem de voz**. **Ligar para o correio de voz** no alto liga para ele. O Erevos toca do armazenamento do
  Android e não guarda cópia; com o Erevos bloqueado a aba não aparece.
- **Discagem rápida:** com o teclado vazio, segure uma tecla de 2 a 9 para ligar para o número dela. Uma tecla sem
  número deixa você escolher um: digite um nome ou um número e toque no contato, ou **Usar** o número digitado. Em
  **Telefone** → **Configurações**, **Discagem rápida** mostra as oito teclas; toque numa para mudá-la ou
  esvaziá-la. A discagem rápida fica criptografada no espaço e funciona com o Erevos desbloqueado.
- **Configurações de chamada:** em **Telefone** → **Configurações**, **Configurações de chamada** abre as telas do
  próprio Android para o que a operadora guarda das chamadas de cada chip: **Encaminhamento, espera e o seu número**
  e **Número do correio de voz**; com dois chips, toque primeiro no chip. Em **Perguntar à operadora**, cada botão
  disca o código da rede (**Verificar** o encaminhamento \`*#21#\`, **Desativar tudo** \`##002#\`; chamada em espera
  \`*#43#\`, **Ativado** \`*43#\`, **Desativado** \`#43#\`; mostrar o seu número \`*#31#\`), e a resposta aparece
  numa mensagem do Android. Para ocultar o seu número em uma só chamada, digite \`#31#\` antes do número.
- **Dois chips:** acima de **Ligar**, toque no chip pelo qual ligar; na primeira vez, **Escolher o chip** pede ao
  Android que deixe o Erevos vê-los. Um número para o qual você liga sem escolher pergunta **Ligar com** qual. O
  Erevos guarda o chip que você usou para cada número, selado no espaço, e liga por ele da próxima vez. A tela de
  chamada nomeia o chip de cada chamada.
- **As chamadas:** em **Telefone**, **Recentes** lista o histórico de chamadas do Android, as mais novas primeiro, sob
  cada dia: quem, que chamada foi, por qual chip, e como. **Todas**, **Perdidas**, **Recebidas**, **Realizadas** e,
  depois que uma chamada foi bloqueada, **Bloqueadas** a filtram; com dois chips, **Chip 1** ou **Chip 2** mantém as
  chamadas desse chip. Chamadas seguidas com o mesmo número aparecem uma vez, com quantas foram. **☏** retorna a
  ligação; um toque na linha mostra as chamadas dela, quanto tempo durou cada uma, e **Ligar** (com dois chips, um
  para cada), **Enviar um SMS**, **Adicionar aos contatos** para um número que não é de nenhum dos seus contatos, e
  **Alterar o número antes de ligar**. Vistas ali, as chamadas perdidas saem do aviso do Android, e esse aviso abre
  **Recentes**.
- **Apagar chamadas:** nas chamadas da linha, **Apagar esta chamada** (ou **Apagar estas 3 chamadas**, para uma linha
  de várias) as apaga do histórico de chamadas do Android, **Apagar** ao lado de uma de várias apaga só essa, e
  **Apagar todas as chamadas com este número**, quando ele tem mais, apaga todas, também as mais antigas.
  **Desfazer** aparece por alguns segundos antes; até lá elas só ficam escondidas.
- **Favoritos:** os contatos com estrela nos contatos do seu celular, com as fotos deles. Um toque liga para o número
  padrão do contato, ou pergunta qual quando há vários e nenhum é o padrão; ao segurar, mostra todos.
- **Mais para um número:** assim que um número é digitado no teclado, **⋯** ao lado oferece **Adicionar aos contatos**, **Adicionar a um contato existente** (os seus contatos se abrem: toque naquele a que juntar o número, ou crie um novo), **Enviar um SMS** e **Copiar o número**. Em **Recentes**, as chamadas da linha oferecem o mesmo, e **Abrir o contato** para um número que é um dos seus contatos. Em **Favoritos**, mantenha pressionado um contato para ver os números dele, cada um com **Enviar um SMS** e **Copiar o número**, e **Abrir o contato**. Com o Erevos bloqueado, o Telefone só liga e copia um número: sem SMS, sem alterações nos seus contatos. Cada tecla, **Ligar** e o Enter do teclado dão uma vibração curta; em **Configurações** → **Aparência** → **Vibrar ao tocar** desliga isso. Veja [Aparência](#appearance).
- **Chamadas por Wi-Fi e voz HD:** a tela de chamada diz isso abaixo do nome quando uma chamada passa pelo Wi-Fi ou
  com voz HD, e **Recentes** diz isso para cada chamada.
- **Bloqueio:** em **Telefone** → **Configurações**, **Bloquear telemarketing** bloqueia chamadas dos números que
  alguns países reservam para telemarketing: França (01 62, 01 63, 02 70, 02 71, 03 77, 03 78, 04 24, 04 25, 05 68,
  05 69, 09 48, 09 49 e 09 475 a 09 479, pela decisão 2022-1583 da ARCEP), Espanha (400, desde 17 de outubro de
  2026), Chile (809), Índia (140) e Brasil (0303, que quem faz essas ligações lá pode omitir desde agosto de 2025).
  Outros países não reservam esses números, ou o Erevos não tem certeza de que reservam, então nada é bloqueado para
  eles. Em **Números que começam com**, digite o começo de mais números a bloquear, com o código do país (+33 162) ou
  como você o disca aqui (0162), e toque em **Bloquear**; **Remover** tira um. Eles nunca bloqueiam um número que
  está nos contatos do seu celular. Uma chamada bloqueada não toca e não deixa aviso; ela aparece em **Recentes**, em
  **Bloqueadas**. O Android pergunta uma vez se o Erevos pode filtrar chamadas (**Deixar o Erevos filtrar
  chamadas**): sem isso, uma chamada bloqueada toca um instante antes de o Erevos encerrá-la. O que está bloqueado é
  o mesmo em todos os espaços, então não diz nada de outro, e fica guardado no celular sem nomes.
- **Números bloqueados:** em **Telefone** → **Configurações**, **Números bloqueados** é a própria lista do Android, a
  mesma de **Configurações** → **Telefone e SMS** → **SMS** → **Números bloqueados**: digite um número e toque em
  **Bloquear**, ou toque num para desbloqueá-lo. Em **Recentes**, as chamadas de uma linha mostram **Bloquear este
  número** ou **Desbloquear este número**, com **Desfazer**. O Android rejeita as chamadas deles antes de tocarem, e
  os SMS e MMS deles. Todos os espaços veem a mesma lista.
- **Números desconhecidos e spam:** para um número que não está nos seus contatos, a tela de chamada diz abaixo do
  número de onde ele é (o país e a bandeira, e a cidade de um fixo quando o número indica) e se é celular, fixo,
  gratuito ou de tarifa premium: lido só do número, no celular. Em **Telefone** → **Configurações**, **Lista de
  spam** baixa inteira uma lista de números conhecidos por spam do endereço https:// que você digita: um número por
  linha com o código do país, ou o começo de números seguido de \`*\`, e depois que tipo de chamadas são. O Erevos
  não tem uma própria; escolha uma lista em que confie. Sem Tor, o servidor da lista vê o endereço de internet do
  celular, e o Erevos avisa antes. A tela de chamada de um número da lista mostra **Possível spam**; **Chamadas de
  spam em silêncio** as faz tocar sem som (Android 10 em diante), nunca as de um contato. Em **Recentes**,
  **Denunciar como spam** num número que não está nos seus contatos o adiciona só neste celular, e **Não é spam** o
  tira; **Esquecer minhas denúncias** as apaga. Nenhum número é procurado em lugar nenhum. **Baixá-la de novo toda
  semana** a traz de novo do mesmo endereço quando ela tem uma semana, com o Erevos desbloqueado, pelo Tor quando o
  caminho Tor do espaço está ligado; fica desligado até você ligar.
- **Um grupo de contatos por um tempo:** em **Telefone** → **Configurações**, **Bloquear um grupo de contatos** lista
  os grupos (os marcadores) dos contatos do seu celular. **Bloquear** ao lado de um bloqueia as chamadas dos contatos
  dele **Por uma hora**, **Até amanhã de manhã** (7:00) ou **Até eu liberar**; a linha abaixo do grupo diz até
  quando, e **Liberar** termina antes. Uma chamada assim é bloqueada como as outras: não toca, e aparece em
  **Recentes**, em **Bloqueadas**. O Erevos só lê os grupos, e guarda o id do grupo e a hora, não o nome dele.
  Enquanto um grupo está bloqueado, a tela **Telefone** diz isso no topo, até quando, com **Liberar**.

**Por quê:** uma chamada é filtrada também com o Erevos bloqueado, então o que está bloqueado não pode ser selado
dentro de um espaço; e guardado igual para todos os espaços, não mostra nada de nenhum deles.

- **A senha do Erevos:** a tela **Telefone**, com o teclado, as chamadas e os favoritos, fica atrás dela como o resto
  do Erevos. Só a tela de chamada não fica, a menos que você deixe o Telefone abrir sem ela: em **Telefone** →
  **Configurações**, **Abrir o Telefone sem a senha** (desativado no início, e mostrado só enquanto o Erevos tem
  senha). Com o Erevos bloqueado, o ícone do Telefone, um link tel: e o aviso de uma chamada perdida abrem então o
  teclado, **Recentes** e **Favoritos**, que o Android guarda para todo app de telefone, só com os nomes dos contatos
  do celular: nunca os guardados só no Erevos ou das conversas ocultas, e nenhum chip guardado para um número. Ali
  você pode ligar, nada mais: nada de apagar, bloquear, SMS ou adicionar aos contatos. **Abrir o Erevos** no topo
  mostra a tela da senha, assim como o próprio ícone do Erevos depois que o Erevos ficou em segundo plano por mais de
  30 segundos, a menos que tenha sido uma chamada feita ali que o tirou da tela. **Proteger o Telefone com a senha de
  novo** desativa isso.
- **Se o Erevos não se tornar o app de telefone:** como no SMS, o Android 15 e posteriores podem bloquear isso para um
  app instalado pelo navegador. Em **Configurações**, toque em **Abrir Apps padrão** → **App de telefone** → Erevos.
  Se o Android chamar isso de configuração restrita, abra as **informações do app Erevos**, toque em **⋮** no canto
  superior direito → **Permitir configurações restritas**, e escolha o Erevos de novo. **Permitir chamadas e
  contatos** aparece enquanto o Android ainda bloqueia as chamadas, o histórico de chamadas ou os contatos.
- **Depois de o celular reiniciar:** até você desbloquear o celular pela primeira vez, quem atende é a tela de
  chamada do próprio Android.
- **O que é uma chamada telefônica:** uma chamada telefônica comum, como em todo app de telefone: a operadora a leva e
  pode ouvir. As chamadas para os seus contatos do Erevos a partir de uma conversa são outra coisa: criptografadas de
  ponta a ponta, pela internet.

## Contatos {#contacts}

No Android, **Contatos** no menu mostra os contatos do celular: os que estão nos contatos do próprio Android, que os
seus outros apps também usam, então não há nada para importar. O Android pergunta uma vez se o Erevos pode lê-los e
alterá-los (**Permitir contatos**). Eles também abrem pela pessoa no topo da tela inicial, e têm um ícone próprio nos
apps do celular, **Contatos**, violeta com uma pessoa sobre a marca do Erevos, que os abre atrás do bloqueio do
Erevos: com uma senha, depois de você digitá-la.

- **Encontrar alguém:** **Buscar contatos** procura em todos os campos: nomes, números (seja qual for a forma como
  estão escritos, com ou sem o código do país), e-mails, endereços, a empresa, o aniversário e a nota. **Favoritos**
  mostra só os contatos com estrela.
- **Um contato:** toque num para ver tudo dele. Toque num número para ligar{~, ou em **SMS** ao lado dele para escrever
  para ele no Erevos}; toque num e-mail ou num endereço para abri-lo. **Adicionar aos favoritos** no topo dá a ele uma
  estrela, nos contatos do Android, para que o app de telefone também o liste entre os favoritos.
- **Novo contato** e **Editar:** nome e sobrenome, empresa e cargo, quantos números, e-mails e endereços você
  precisar, cada um com o seu tipo (**Celular**, **Casa**, **Trabalho**, **Outro**), um aniversário (dia/mês/ano, ou
  dia/mês) e uma nota. Um contato novo fica guardado **Só neste celular**, ou numa conta com a qual o celular
  sincroniza contatos (Google), como você escolher. O que o Erevos não mostra de um contato, como os dados próprios de
  outro app, fica como estava.
- **Foto:** toque na imagem no topo de um contato para **Escolher uma foto** das fotos do celular, **Tirar foto** com
  a câmera, ou **Remover a foto**. Você a corta em quadrado, e o Erevos a redesenha, para que nada do que a foto
  dizia além da imagem (um lugar, um celular) fique guardado. Ela fica com o contato nos contatos do Android, onde o
  celular a mostra quando a pessoa liga.
- **Toque:** num contato, **Escolher toque** abre o seletor do próprio Android, com os sons do celular e os que você
  adicionou; o celular toca com ele quando esse contato liga. **Toque padrão** ali devolve o do próprio celular.
- **Arquivos .vcf:** **Importar de um arquivo .vcf** no menu de Contatos lê um arquivo vCard que outro celular ou app
  salvou (qualquer versão dele, também a de celulares gregos antigos) e salva os que ainda não estão no celular, com
  as fotos e os grupos deles, só neste celular ou numa conta. **Salvar como arquivo .vcf** ali salva os contatos
  mostrados (todos, os favoritos, um grupo, ou o que a busca encontrou) num único arquivo, numa pasta que você
  escolhe; num contato, salva só esse. O arquivo fica fora do Erevos e sem selo: qualquer pessoa que o tenha pode ler
  os contatos.
- **Códigos QR:** **Código QR** num contato mostra o vCard dele como código QR, que a câmera de outro celular lê como
  um contato a adicionar: o nome, os números, os e-mails, os endereços e a nota dele, sem a foto (uma nota longa ou
  muitos endereços ficam de fora para caber). Quem o vê pode lê-lo. **Ler o código QR de um contato** no menu lê um a
  partir de uma foto que você tira ou escolhe, aqui no celular, e começa um novo contato com ele, salvo só quando você
  o salva. O código QR do Erevos de alguém começa um com o ID do {=Erevos} dele.
- **Duplicados:** **Encontrar duplicados** no menu lista os contatos que parecem ser a mesma pessoa guardada duas
  vezes: o mesmo nome (as palavras dele em qualquer ordem), número ou e-mail. **Mesclar** mantém o mais completo
  deles, com todos os números, e-mails e endereços dos outros, as notas deles, e a foto, o toque, a estrela e os
  grupos deles quando ele não tem, e apaga os outros; **Mesclar todos** faz isso para todos os conjuntos. **Não são
  iguais** esconde um conjunto até você abrir a lista de novo.
- **Aniversários:** o chip **Aniversários** abaixo da busca lista os contatos com aniversário, o próximo primeiro, com
  quantos dias faltam e a idade que a pessoa faz. **Lembretes de aniversário** no menu (desativado no início) põe um
  aviso na manhã de cada um, a partir das 9:00, mesmo com o Erevos fechado; na tela de bloqueio ele diz só que há um
  aniversário. São só os aniversários dos contatos do celular, nunca os de contatos guardados só no Erevos.
- **Contatos do chip** no menu lê os contatos dos chips do celular e copia os que ainda não estão no celular (todos
  escolhidos no início) para os contatos do Android, só neste celular ou numa conta. O chip fica com os dele.
- **Só no Erevos:** em **Salvo em**, um contato novo pode ser guardado **Só no Erevos** em vez disso: selado neste
  espaço como as conversas dele, nunca nos contatos do Android, para que nenhum outro app ou conta o veja, e outros
  apps mostrem só o número dele; a tela de chamada do Erevos mostra o nome dele enquanto o Erevos está desbloqueado.
  Ele tem um cadeado na lista, e o chip **Só no Erevos** mostra só esses.
  **Guardar só no Erevos** num contato do celular o traz para dentro, com a foto e a estrela, e o apaga dos contatos
  do celular; **Mover para os contatos do celular** o leva de volta para fora. A foto dele fica selada com ele.
  Grupos, toques e lembretes de aniversário são do Android, então ele não tem nenhum. Uma chamada{~ ou SMS} para ele
  ainda passa pelo celular, e aparece no registro de chamadas{~ e nos SMS do celular} como qualquer outra. Um backup do
  Erevos guarda esses contatos, selados.
- **Nas conversas ocultas:** **Contatos** no topo das conversas ocultas abertas lista os próprios contatos delas,
  guardados só ali e selados com elas: eles não aparecem em nenhum outro lugar, nem nos contatos do espaço, e a tela
  não mostra nada assim que as conversas ocultas fecham. Um contato novo ali é sempre um dos delas. Pode-se dar uma
  foto a um, pois as conversas ocultas continuam abertas enquanto você a escolhe ou tira. O menu delas tem só o que é
  delas: **Importar de um arquivo .vcf** guarda os contatos de um arquivo com elas, selados, nunca nos contatos do
  celular; **Salvar como arquivo .vcf** salva os mostrados, ou um no cartão dele, numa pasta que você escolhe (fora do
  Erevos e sem criptografia); **Ler o código QR de um contato** começa um dos contatos delas. Um ID do {=Erevos}
  digitado ou lido ali adiciona a pessoa às conversas ocultas, nunca às do espaço. Ligar para um deles pelo app de
  telefone fecha as conversas ocultas assim que o Erevos fica fora da tela por mais de 30 segundos, e aparece no
  registro de chamadas dele.
- **ID do {=Erevos}:** o ID do {=Erevos} de um contato é o link de contato que o {=Erevos} dele mostra, em **Copiar meu link de
  contato** ou como o código QR dele. No cartão de um contato, ou em **ID do {=Erevos}** quando você escreve um, cole-o,
  ou leia-o com **Tirar foto do código QR** ou **Escolher foto do código QR**: **Adicionar ao Erevos** (ou
  **Salvar**) o adiciona às suas conversas do Erevos, que abrem com ele, e vincula o contato a ele, e a conversa
  recebe o nome do contato se não tiver um próprio. Um contato que é um contato do Erevos mostra o começo da chave
  dele como **ID do {=Erevos}**.
- **Contatos do Erevos:** um contato que é a mesma pessoa que um dos contatos do Erevos das suas conversas aparece
  como um só cartão com ele: por um número vinculado a ele no Erevos, pelo ID do {=Erevos} dele, ou com **Escolher nas
  minhas conversas no Erevos** no cartão dele, um vínculo selado no espaço, nunca nos contatos do Android (**Não é
  este contato do Erevos** o desfaz). O cartão tem então **Mensagem**, **Ligar** e **Vídeo**, criptografados de ponta
  a ponta pelo Erevos em vez da operadora. Um contato das conversas que não corresponde a nenhum contato tem um cartão
  próprio, com o escudo, onde **Adicionar aos contatos** cria um e **Vincular a um dos meus contatos** o vincula a um
  que você tem, cujo cartão passa então a mostrá-lo; o chip **Contatos do Erevos** lista todos eles. Um contato do
  Erevos sem nome próprio recebe o nome do contato vinculado a ele, quando são vinculados ou quando o cartão desse
  contato abre; um nome que você deu a ele no Erevos fica, e um que você esvaziou volta do contato nesse momento. Nas
  conversas ocultas, estes são os próprios contatos das conversas ocultas, e a conversa deles abre ali.
- **Histórico:** o cartão de um contato lista {~as últimas chamadas dele no registro de chamadas do celular, os SMS e |}as
  mensagens dele no Erevos, os mais novos primeiro; toque num para {~retornar a ligação, escrever um SMS ou |}abrir a
  conversa.{~ As chamadas aparecem depois que você deixa o Erevos ler o registro de chamadas (**Mostrar chamadas**). O
  Erevos só os lê para mostrá-los, e não guarda cópia.}
- **Outros apps:** o **Adicionar aos contatos** de outro app (um número no app de telefone, um e-mail no app de
  e-mail) pode abrir no Erevos: um contato novo com o que aquele app deu, ou a lista para tocar no contato a que
  acrescentá-lo. Um app que mostra ou altera um contato também pode abri-lo no Erevos, atrás do bloqueio do Erevos. O
  Android pergunta que app usar; escolha o Erevos. Um app que pede para você escolher um contato, ou um número, e-mail
  ou endereço, recebe só o que você tocar, dos contatos do celular: os guardados só no Erevos nunca aparecem ali.
- **Apagar** tira o contato do celular, de todas as contas em que ele está guardado; um guardado só no Erevos, do
  Erevos.
- **Grupos:** **Grupos** no menu de Contatos (os três pontos) lista os próprios grupos do Android, como Família ou
  Trabalho, com quantos há em cada um, e cria novos. Abra um para **Adicionar contatos**, tirar um com **×**,
  **Renomear** o grupo ou **Apagar grupo** (os contatos dele ficam). Num contato, **Escolher grupos** o põe em grupos
  ou o tira deles. Os chips abaixo da busca mostram os contatos de um grupo. Um grupo fica guardado numa conta, como
  os contatos dele: um contato só entra nele se também estiver guardado nessa conta.

## Bloqueio com senha {#lock}

Em **Configurações** → **Privacidade e segurança** → **Bloqueio e segunda senha**, **Bloquear ao abrir o Erevos** tem
duas opções: **Sem bloqueio** e **Senha**.

1. Toque em **Senha**, digite-a duas vezes (pelo menos 4 caracteres) e toque em **Salvar**.
2. A partir daí o Erevos a pede toda vez que abre, e de novo depois de 30 segundos em segundo plano.
3. **Alterar senha** a muda, e **Bloquear agora** bloqueia o Erevos na hora.

- **Uma frase, não um PIN curto:** o que confere a senha fica guardado no cofre de chaves do telefone, então uma cópia
  do armazenamento não basta para testar senhas. Mas quem quebrar a segurança do próprio telefone, como fazem
  ferramentas forenses em alguns telefones, poderia testar em computadores próprios, e um PIN de 6 dígitos, um milhão
  de combinações, cai em dias. Uma frase de 4 ou 5 palavras não. Abaixo de uma senha nova curta, ou de um PIN de
  conversas ocultas, o Erevos avisa, e só a aceita depois de **Usar mesmo assim**. Quem tiver uma cópia de segurança e
  a sua senha pode fazer as mesmas tentativas nela: aí um PIN curto é mais fraco.
- **Bloqueado, ainda recebendo:** quando o Erevos bloqueia, a tela da senha vem para a frente do espaço aberto, que
  continua por trás dela: mensagens e chamadas ainda chegam, com os avisos delas, e uma chamada aparece sobre a tela
  da senha. As telas dele fecham, as conversas ocultas também, e a tela de chamada não mostra mais os nomes dos
  contatos dele. A senha dele o abre de novo; a senha de outro espaço o fecha antes, sem nada dele guardado na
  memória.
- [~] **Só os SMS:** com o Erevos bloqueado, o ícone de SMS, o botão **SMS** do widget e o aviso de um SMS novo ainda pedem
  a senha, mas depois abrem só os SMS: a lista das conversas de SMS do celular, cada uma em uma linha própria, as
  próprias conversas, **Arquivadas**, **Spam** e **Lixeira**, e **Novo SMS**. Nada mais do espaço aparece. Qualquer
  outra coisa, um contato, uma conversa, **Configurações**, o ícone do próprio Erevos ou o cadeado laranja **Desbloquear
  tudo** no topo, pede a senha de novo e depois abre todo o espaço. Assim um código que chegou por SMS pode ser lido com
  alguém ao lado, e o resto do Erevos continua fechado.
- **Só os Contatos:** do mesmo jeito, o ícone de Contatos, o botão **Contatos** do widget e o aviso de um aniversário
  pedem a senha, e depois abrem só os contatos: a lista deles, o cartão de um contato (sem suas conversas e chamadas
  com ele), **Editar**, grupos, duplicados, o chip e a importação. **Ligar** ainda abre o discador do celular. Uma
  conversa{~, um SMS|}, **Configurações** ou o cadeado laranja **Desbloquear tudo** no topo pede a senha de novo e depois
  abre todo o espaço. Outro ícone, o widget ou um aviso, com {~só os SMS ou |}só os Contatos abertos, pede a senha como
  quando o Erevos está bloqueado e depois abre o que indica: o ícone de Contatos só os contatos, {~o ícone de SMS só os
  SMS, |}o ícone do próprio Erevos todo o espaço.

- **Ver o que você digita:** cada campo de senha, PIN ou token, aqui e em todo o Erevos, tem um olho no fim: toque
  nele para ver o que você digita, e de novo para esconder. Ele volta a ficar escondido cada vez que o campo aparece
  de novo, e no Android o teclado é instruído a não aprendê-lo.
- **Senhas erradas:** depois de 5 tentativas erradas, cada nova faz você esperar, 30 segundos no início e o dobro a
  cada vez, até uma hora. A contagem sobrevive a um reinício. A espera segue o relógio próprio do celular desde que
  ele ligou, que ninguém pode ajustar, então adiantar a data e a hora não a encerra; se o celular for desligado e
  ligado durante uma espera, ele a espera de novo desde o começo, pois o tempo já esperado não pode ser conhecido. No
  app web e num computador ela funciona do mesmo jeito enquanto o Erevos continua aberto, e recomeça do começo quando
  o Erevos abre de novo.
- **O que é selado:** os contatos de cada espaço, as chaves das conversas dele, as mensagens, as configurações do
  relay e a aparência dele ficam no celular selados com uma chave que só a senha dele abre.
- **A lista na hora:** a tela inicial guarda uma cópia selada das primeiras linhas dela, para que a lista apareça
  assim que o espaço abre e depois se atualize. Ela tem sempre o mesmo tamanho, então não diz a ninguém quantas
  conversas há nem quais espaços são usados, e nunca guarda o que uma mensagem temporária dizia.

**Por quê:** cada senha testada custa tempo e muita memória de propósito (PBKDF2, depois Argon2id), para que quem copia
o que o celular guarda não possa testar senhas rápido; e alguém com o celular na mão espera mais depois de cada
tentativa errada. A contagem é uma só para o celular inteiro, mantida entre reinícios, pois a tela da senha vem antes
de qualquer espaço abrir, e a espera é medida onde mexer no relógio não pode encurtá-la.

> Não há como recuperar uma senha esquecida: nada é guardado que possa abrir os dados sem ela. Só uma impressão
> digital ou rosto, enquanto estiver ativada, ainda abre o primeiro espaço (veja abaixo).

### Capturas de tela

Com o bloqueio com senha ativado, o Android mantém o Erevos fora das capturas de tela, das gravações de tela e dos
apps recentes: ali a última tela do Erevos aparece em branco, para que quem segura o celular desbloqueado por um
momento não veja as suas conversas nela. Em **Configurações** → **Privacidade e segurança** → **Capturas de tela**,
**Desativar** deixa as capturas de tela funcionarem de novo (para enviar uma, por exemplo), e **Ativar** traz a
proteção de volta. Enquanto está ativada, as conversas ocultas também ficam fora delas, mesmo num espaço sem bloqueio com senha;
desativada, as capturas de tela funcionam nelas também. A configuração é do celular, a mesma em todos os espaços. Num computador e no app web ela não existe.

**Por quê:** sem ela, a última tela do Erevos fica como uma imagem entre os apps recentes até o Erevos abrir de novo,
por isso as conversas ocultas sempre ficam de fora, para nunca aparecerem ali sem o PIN delas. A configuração é a
mesma em todos os espaços para não dizer nada sobre qual espaço abriu.

### Impressão digital ou rosto

No Android 11 e posteriores, com uma impressão digital ou um rosto configurados nas configurações do celular, o Erevos
também pode abrir com eles. Fica desativado a menos que você o ative.

1. Com o bloqueio com senha ativado, em **Impressão digital ou rosto**, toque em **Ativar**.
2. Digite a senha do espaço em que você está, toque em **Ativar** e toque no sensor (ou olhe para o celular).
3. A partir daí a tela da senha tem um botão **Impressão digital ou rosto**. A senha também sempre funciona, e
   **Desativar** desativa isso.

- **Só o espaço da primeira senha:** uma impressão digital nunca abre o espaço de uma segunda senha, nem as conversas
  ocultas. Ativada no espaço que uma segunda senha abre, ela não abre nada: na primeira vez que é testada ela se
  desativa sozinha, e a senha abre o Erevos. A configuração parece igual em todos os espaços.
- **Sob pressão:** alguém que segure você pode pressionar o seu dedo no celular, ou segurá-lo diante do seu rosto. Se
  isso puder acontecer, mantenha-a desativada: então a pessoa precisa de uma senha, e você pode dar a segunda.
- **Como é guardada:** a chave do primeiro espaço é selada por uma chave no hardware seguro do celular (o Android
  Keystore) que só funciona logo depois de uma verificação forte de impressão digital ou rosto, uma vez para cada uso.
  Adicionar ou remover uma impressão digital ou um rosto faz o Android descartar essa chave: ela fica então
  desativada, e você a ativa de novo. Nada sai do celular.
- **Que rosto:** um rosto só conta onde o Android classifica o desbloqueio facial dele como forte, como no Pixel 8 e
  posteriores; nos outros, é a impressão digital.
- **As senhas erradas** são contadas como antes: uma impressão digital não muda a contagem.
- **Não num computador nem na web:** só é oferecido no Android. Desativar o bloqueio também o desativa.

**Por quê:** um dedo é mais fácil de forçar do que uma senha, e qualquer pessoa cujo dedo ou rosto o celular conheça
poderia usá-lo, por isso ela nunca abre o espaço de uma segunda senha nem as conversas ocultas. Ativada em outro
espaço, ela guarda uma chave que não abre nada, no mesmo formato, para que o que está guardado não mostre em que
espaço ela foi ativada.

## Segunda senha {#second}

Se alguém forçar você a abrir o Erevos, digite a segunda senha em vez da sua. Ela abre um Erevos separado e vazio,
com os próprios contatos, relay e aparência. As suas conversas reais ficam escondidas, e nada no app mostra que elas
existem.

1. Com o bloqueio com senha ativado, toque em **Definir segunda senha**.
2. Digite-a duas vezes e toque em **Salvar**. Ela tem de ser diferente da sua própria senha.

- **A aparência:** o segundo espaço começa com a aparência do espaço em que foi definido, para não chamar atenção.
- **Uma de cada vez:** definir uma segunda senha de novo substitui a anterior. **Remover a segunda senha** a remove.
- **Pela busca:** num espaço aberto, digite a senha de outro espaço em **Buscar conversas** e toque em Enter: o espaço
  aberto se fecha, sem que nada dele fique, e o outro se abre, como com **Bloquear agora** e a senha dele. Leva o
  mesmo tempo seja o que for digitado, então o tempo não mostra se existe outro espaço. Uma senha errada, ou a do
  espaço aberto, é só uma busca; a senha de pânico funciona só na tela da senha.
- **Mover uma conversa para lá:** nos **Detalhes** de uma conversa, toque em **Mover para outro espaço**, digite a senha
  do outro espaço e toque em **Mover**. A conversa vai para lá com as mensagens, o nome, a imagem e a aparência dela, e
  as conversas importadas nela, criptografada com a chave desse espaço, e esse espaço continua fechado. O número de
  segurança continua o mesmo, e o celular da pessoa é avisado na hora para escrever para lá a partir de agora. A opção
  aparece em todo espaço, e a senha é testada como na busca: uma errada, ou a do espaço aberto, não move nada. Uma
  conversa com alguém com quem o outro espaço já tem uma conversa própria fica onde está. Quem ler o outro espaço com
  uma ferramenta forense poderia perceber que a conversa veio de outro lugar: o contato dela ainda a conhece pela chave
  deste espaço.
  Se esse espaço ainda não tem relay, o Erevos oferece o deste espaço: **Mover com o relay deste espaço** move a
  conversa e dá a esse espaço este relay para manter, e o relay pode então saber que os dois espaços estão num mesmo
  telefone.
- **Discrição:** por privacidade, o app nunca mostra se há uma segunda senha definida. No app web com as notificações
  com o app fechado ativadas, o número no ícone do Erevos fica enquanto o Erevos está fechado: se não bater com o
  espaço que você abre, pode denunciar outro (**Número no ícone** o desliga).

## Conversas ocultas {#hidden}

Cada espaço tem 4 posições para conversas ocultas, cada uma aberta só com o próprio PIN, e elas nunca aparecem entre
as suas outras conversas. Não há botão para elas em lugar nenhum. Cada posição pode guardar uma conversa ou várias,
então 2 espaços têm 8 posições.

**Por quê:** cada posição já tem um PIN próprio, então uma conversa sozinha numa posição tem uma chave própria, e uma
posição também pode guardar várias conversas sob um PIN. O número de posições é fixo por dois motivos:

- **Para que nada apareça.** As 4 posições existem desde a primeira vez que o app abre, preenchidas com dados
  aleatórios enquanto não usadas. Quem obrigar você a abrir o celular, ou copiar o que ele guarda, não consegue saber
  se você tem conversas ocultas, nem quantas. Com uma chave para cada conversa, os arquivos selados cresceriam a cada
  nova conversa oculta, e revelariam quantas há.
- **Para que continue rápido.** Um PIN digitado na busca é testado em cada posição, e cada teste é lento de propósito
  (Argon2id, que usa muita memória e tempo, para que os PINs não possam ser adivinhados rápido). Com 4 posições,
  abrir continua curto e sempre leva o mesmo tempo, então o tempo também não diz quantas estão em uso.

O número pode ser aumentado depois sem perder nada, ao custo de abrir um pouco mais devagar; diminuí-lo apagaria o que
as posições retiradas guardam.

1. Comece uma posição de uma de duas formas: em **Configurações** → **Privacidade e segurança** → **Conversas
   ocultas**, escolha de **Posição 1** a **Posição 4**, toque em **Definir PIN das conversas ocultas**, digite-o duas
   vezes e toque em **Salvar**; ou abra os **Detalhes** de uma conversa, toque em **Mover para conversas ocultas**,
   digite um PIN de 4 caracteres ou mais, toque em **Novas conversas ocultas**, escolha uma posição, e depois **Criar
   e mover**. Lembre-se de quais posições você usa: por privacidade, o Erevos não consegue saber quais estão livres.
2. Para abri-las, digite o PIN em **Buscar conversas** na tela inicial e pressione Enter (a tecla de busca do
   teclado). Ou segure **Nova conversa** por um instante: abre-se um campo para o PIN, com uma vibração curta no Android, o mesmo em todos os espaços;
   digite-o e toque em **Abrir**. Abre só a posição com esse PIN. Um PIN errado é só uma busca, ou só fecha o campo:
   nada acontece.
3. Elas abrem com o título **Conversas ocultas**, com **Contatos** e **Alterar PIN** no topo, e listam as conversas e
   os grupos delas como a tela inicial lista os seus: os mais novos primeiro, cada um com o que foi dito por último,
   quando, e quantas não foram lidas. Toque numa para abri-la. A seta de voltar as fecha.
4. Para mover outra conversa para uma posição, abra os **Detalhes** dela, toque em **Mover para conversas ocultas**,
   digite o PIN daquela posição e toque em **Mover**. A conversa sai da sua lista com as mensagens, o nome, a imagem e
   a aparência dela, e as conversas importadas nela, e o número de segurança dela continua o mesmo. O celular da
   pessoa é avisado na hora para escrever para as conversas ocultas a partir de agora; uma mensagem que ela envie
   nesse exato momento pode não chegar.
5. Para mover uma conversa de volta para as conversas do espaço, abra-a nas conversas ocultas, depois os **Detalhes**
   dela, toque em **Voltar para minhas conversas** e em **Mover**. Ela vai com as mensagens, o nome, a imagem, a
   aparência e as conversas importadas dela, e o celular da pessoa é avisado de onde escrever.

- **Relay, Nostr e celulares por perto:** as conversas ocultas têm a própria fila no relay e as próprias chaves.
  Enquanto estão abertas, ou recebem fechadas, também chegam ao celular de um contato por perto, como suas outras
  conversas (veja [Conversar com um celular por perto](#nearby)), mas outros celulares nunca as levam, e elas nunca vão
  por LoRa{~ nem por SMS}. Sem relay, o link de contato delas diz onde elas leem no Nostr, com uma chave só daquela
  posição, e os textos vão para lá, como de um celular sem relay; fotos, mensagens de voz, chamadas e grupos precisam
  de um relay. Enquanto elas estão fechadas, as mensagens delas esperam no relay, ou no Nostr por dois dias, a menos
  que **Receber quando fechadas** esteja ativado.
- **Receber quando fechadas:** um interruptor no topo de cada posição. Ativado, as conversas ocultas dela recebem
  como as suas outras conversas enquanto o espaço está aberto, seja qual for a tela e com o Erevos em segundo plano:
  os contatos delas veem na hora que uma mensagem chegou, um aviso diz só "New message", no Android uma chamada toca
  com "Incoming call" e sem nome (na tela da chamada, **Atender** atende sem PIN, numa tela sem nome nem rosto, e as conversas ocultas continuam fechadas; o pequeno sinal, o PIN e **Conectar** as abrem e atendem ali), e um lembrete da Conversa comigo delas mostra um aviso que diz só **Reminder**. O que chega a elas pelo
  Nostr também é lido então{+, e as contas Matrix, XMPP e Nostr próprias delas continuam conectadas (veja abaixo)}. Uma
  chamada que terminou antes de você abri-las, ou que tocou tempo demais, aparece como perdida. Nada delas aparece em
  lugar nenhum até o PIN abri-las. Uma posição nova começa com isso ativado; as posições definidas antes ficam como
  estavam até você ativar. Para isso, a chave da posição fica guardada criptografada com o espaço, entre uma chave
  aleatória para cada outra posição, para que abrir o espaço não mostre quais posições recebem, ou estão definidas. Mas
  quem abrir o espaço e copiar o que o celular guarda poderia abrir essa posição também, sem PIN: o PIN então as mantém
  fora da vista de quem estiver com o celular, não de uma ferramenta forense. Desativado, a chave delas fica só atrás do
  PIN, e as mensagens delas esperam no relay até você abri-las. Os backups guardam o interruptor.
- **Ponto para não lidas:** com **Receber quando fechadas** ligado, um interruptor logo abaixo (desligado, a menos que
  você o ligue). Ligado, enquanto uma das conversas ou grupos do lugar tiver uma mensagem não lida{+, ou uma das suas
  próprias conversas de Matrix, XMPP ou Nostr tiver tido uma desde a última vez que você o abriu}, um pequeno ponto
  aparece na lupa de **Buscar conversas** na tela inicial: nunca quantas, nem onde. Some assim que você as lê. Quem vê
  as conversas do espaço também o vê, e pode suspeitar que há conversas ocultas. Os lugares que só têm **Avisar quando
  chega uma mensagem** não têm ponto: o interruptor teria de ficar onde o espaço pode lê-lo.
- **Elas fecham sozinhas** depois que o Erevos fica em segundo plano por mais de 30 segundos, como o PIN próprio de
  uma conversa bloqueia de novo, mas não durante uma chamada, nem enquanto você escolhe uma foto ou um arquivo para
  elas ou tira uma foto.
- **Enquanto estão abertas,** uma mensagem que chega toca o som de mensagens novas, como nas suas outras conversas.
  Com o Erevos em segundo plano antes de elas fecharem, um aviso diz "New message" só se **Receber quando fechadas**
  ou **Avisar quando chega uma mensagem** estiver ativado para aquela posição.
- **Como as suas outras conversas:** o que não pode ir agora aguarda, marcado **Aguardando**, só pelo relay delas, ou
  pelo Nostr sem relay (veja **Aguardando** em [Conversar por um relay](#relay)), **Enviar mais tarde** funciona como
  ali, e uma conversa exportada de outro app pode ser importada nos detalhes de uma conversa oculta (veja
  [Conversas importadas](#import)). Um contato também pode ser adicionado ali a partir de uma foto do código QR dele,
  tirada ou escolhida enquanto elas continuam abertas. Cada posição tem a sua própria **Conversa comigo**, a primeira
  na lista dela (veja **Conversa comigo e lembretes** em [Primeiros passos](#start)).
- **Grupos:** **Novo grupo**, abaixo da lista delas, cria um grupo com os contatos delas, como na tela inicial (veja
  [Conversas em grupo](#groups)), e ele aparece na lista delas entre as conversas delas. Os membros dele são só
  contatos daquela posição, e um que você adiciona como contato a partir dele vira contato daquela posição. O que se
  escreve nele passa só pelo relay da posição, para uma fila própria ali, nunca para um celular por perto; enquanto a
  posição está fechada ele só é lido com **Receber quando fechadas** ativado, e **Avisar quando chega uma mensagem**
  não o conta. As chamadas dele só tocam enquanto as conversas ocultas estão abertas: uma iniciada enquanto estão
  fechadas aparece como perdida. Um grupo ali não tem PIN próprio, e nenhum é público.
- [+] **Matrix, XMPP e Nostr:** abaixo da lista delas, **Matrix**, **XMPP** e **Nostr** abrem as telas dessas redes (veja
  [Matrix](#matrix), [XMPP](#xmpp) e [Conversas com outros apps Nostr](#nostr-chats)) para contas próprias das conversas
  ocultas, separadas das do espaço: uma conta Matrix e uma XMPP para entrar, e uma chave Nostr. As sessões e a chave
  ficam guardadas criptografadas com a chave das conversas ocultas, e nada delas aparece fora das conversas ocultas: as
  conversas delas ficam só na lista das conversas ocultas, e não somam ao número no ícone do Erevos nem à lista da tela
  inicial. As contas se conectam enquanto as conversas ocultas estão abertas, e também enquanto estão fechadas se
  **Receber quando fechadas** estiver ativado, como as próprias conversas ocultas recebem: então uma mensagem ali mostra
  um aviso que diz só "New message", e no Android uma chamada Matrix ou XMPP toca com "Incoming call" e sem nome, e é
  atendida com o PIN como as outras chamadas delas; uma não atendida a tempo aparece como perdida, e também uma chamada
  de grupo XMPP que chega enquanto elas estão fechadas. Desativado, as contas se conectam só enquanto as conversas
  ocultas estão abertas, e, fechadas, nada chega. As conversas delas ligam como as do espaço, pela conta própria das
  conversas ocultas; uma chamada para ela, enquanto as conversas ocultas estão abertas, toca com o toque do telefone, e
  elas ficam abertas até a chamada acabar. Uma conta Matrix delas não tem **Avisar quando chega mensagem**.
- **Dispositivos conectados:** abaixo da lista delas, **Dispositivos conectados** conecta estas conversas ocultas por
  conta própria à mesma posição num computador ou num navegador, de dentro, à parte do espaço e dos dispositivos
  conectados dele: as conversas, mensagens e contas próprias delas vão para lá, e nada disso aparece no espaço (veja
  **Conversas ocultas e segundas senhas** em [Dispositivos conectados](#devices)). Sem conexão, ficam só neste
  celular.
- **As prévias de links** têm um interruptor próprio nos detalhes de uma conversa oculta, para todas as conversas
  daquela posição, desativado a menos que você o ative (veja **Prévias de links** em
  [Conversar por um relay](#relay)).
- **Avisar quando chega uma mensagem** (Android): no topo de uma posição enquanto **Receber quando fechadas** está
  desativado. Ativado, enquanto a posição está fechada um aviso diz só "New message", ou quantas chegaram, como para
  as outras conversas, com o Erevos em segundo plano ou na tela, cada mensagem uma vez, também quando o Erevos foi
  fechado e aberto de novo; o que chegou enquanto a posição estava aberta não gera nenhum depois que ela fecha. Que
  uma mensagem sua chegou a eles ou foi lida, digitando e chaves novas não geram nenhum, nem uma chamada que tocou
  (veja **Tocar as chamadas quando fechadas**); uma que não tocou conta como mensagem. Uma mensagem ou uma exclusão
  que outros celulares com {=Erevos} levaram até o relay (veja **Levadas por outros celulares** em
  [Conversar com um celular por perto](#nearby)) não consegue dizer o que leva, pois os celulares que a levam não
  podem saber: ela conta como mensagem, então uma exclusão também mostra "New message", e a primeira mensagem de uma
  conversa pode contar como duas; e uma enviada sem som toca como sempre (veja **Enviar sem som**). Precisa de
  **Receber e tocar** e **Avisar quando chega mensagem** em **Em segundo plano**, o que o interruptor avisa quando não
  estão ativados, e de um relay que espera (de 18 de outubro de 2026 em diante); um de antes de 23 de outubro de 2026
  só consegue dizer que algo espera, então "New message" aparece também para isso, uma vez até você abrir aquela
  posição. Para isso, o espaço guarda uma fila no relay para cada uma das 4 posições dele, as que não estão em uso
  criadas à toa no mesmo relay, para que abrir o espaço não mostre nem se há conversas ocultas definidas nem quais,
  desde que elas usem o relay do espaço; ao relay só se pergunta quantas mensagens chegaram, já que ele as conta pelo
  byte que cada uma leva (veja o que o relay vê, acima), nunca as próprias mensagens. Quem vê o aviso e não encontra
  nada novo nas suas conversas pode supor que há mais. Depois que você apaga ou bloqueia alguém na posição, a primeira
  mensagem de alguém novo, pelo link de contato ou pelo código QR da posição, não faz nenhum: ela aparece quando você
  abre a posição. Os backups guardam isso.
- **Tocar as chamadas quando fechadas** (Android): abaixo de **Avisar quando chega uma mensagem**, enquanto **Receber
  quando fechadas** está desativado. Ativado, enquanto a posição está fechada, com o Erevos em segundo plano ou em
  qualquer tela, uma chamada de um dos contatos dela faz o celular tocar e mostrar "Incoming call" sem nome, como faz
  uma chamada das suas outras conversas. Na tela da chamada, toque em **Atender** ou no pequeno sinal, digite o
  PIN e toque em **Conectar** para atender; **Recusar** para o toque. Quem toca em **Atender** sem o PIN não passa do
  campo do PIN. O toque dura
  cerca de 45 segundos. Precisa de **Receber e tocar** em **Em segundo plano**, o que o interruptor avisa quando não
  está ativado, e de um relay que espera, e usa uma fila no relay própria para cada uma das 4 posições, as que não
  tocam criadas à toa no mesmo relay, como no aviso de mensagens acima, para que abrir o espaço não revele nada. Quem
  liga só faz tocar uma fila ali; a própria chamada espera na fila da própria conversa até o PIN abri-la. Um contato
  que você apagou ainda pode fazê-lo tocar, mas a chamada nunca consegue se conectar. Uma chamada feita de um
  computador conectado só toca enquanto as conversas ocultas estão abertas. Os backups guardam
  isso.
- **Um PIN novo para uma posição** (em **Conversas ocultas** nas **Configurações**, ou **Novas conversas ocultas**) a
  começa vazia e substitui o que havia nela. Para manter as conversas e mudar só o PIN, abra-as e use **Alterar PIN**
  ali. Cada PIN tem de ser diferente dos outros e da senha que abre o Erevos.
- **PINs errados na busca** são contados separadamente dos da tela de bloqueio: depois de cinco, as buscas param de
  testar por um tempo, em silêncio, e a tela de bloqueio nunca espera por causa deles.
- **Um PIN mantém de fora quem pega o celular,** não quem copia o que ele guarda: com uma ferramenta forense num
  celular desbloqueado ou com root, os PINs podem ser testados sem espera. Cada teste custa Argon2id (muita memória e
  tempo), mas um PIN de 4 dígitos é só 10.000 testes. Se é isso que você teme, use um PIN mais longo, ou algumas
  palavras.
- **Discrição:** todo espaço tem todas as 4 posições desde o início, as não usadas preenchidas com dados aleatórios
  que parecem usados, e a busca testa todas as posições toda vez. Assim nada mostra se há conversas ocultas
  definidas, nem quantas.

### Conversa bloqueada com um PIN {#chat-pin}

Uma conversa ou um grupo pode ter um PIN próprio, à parte das conversas ocultas: fica entre as suas conversas, mas só
abre com o PIN dele.

1. Abra a conversa, toque em **⋮** no topo para os **Detalhes** dela, depois em **Bloquear com um PIN** (num grupo: o
   nome do grupo no topo, depois **Bloquear com um PIN**).
2. Digite duas vezes um PIN de pelo menos 4 caracteres, depois **Bloqueio**.

- **Abrir:** ela pede o PIN. Ela bloqueia de novo assim que você sai dela, abre outra conversa, ou o Erevos fica fora
  da tela por mais de meio minuto (como o bloqueio com senha).
- **Atrás do PIN** nada da conversa aparece: nenhuma das mensagens dela é desenhada até o PIN ser digitado, e com
  vidro, um papel de parede ou a cena própria de um estilo, a tela do PIN fica sobre um fosco denso que não deixa ver
  nada.
- **Na lista** ela mostra o nome com um cadeado e **Bloqueada com um PIN**, nada das mensagens dela, nem na busca, em
  **Mensagens favoritas** ou em **Conversas importadas**. O aviso diz só **New message**, como para toda conversa.
- **PINs errados** são contados no celular, para todas as conversas de uma vez e separadamente dos da tela de
  bloqueio: depois de cinco, a próxima tentativa espera, mais a cada vez.
- **Esqueceu o PIN?** Abaixo do PIN, onde o espaço tem senha, **Esqueceu o PIN?** o remove com a senha que abre o
  espaço. Sem senha, nada pode abri-la de novo: apagar o contato é então a única saída.
- **Para as conversas ocultas:** uma conversa que você move para as conversas ocultas leva o PIN dela junto, que não
  pede nada ali, pois o próprio PIN das conversas ocultas as protege. Movida de volta para as conversas, o mesmo PIN
  volta a pedir.
- **Para removê-lo:** **Detalhes** → **Bloquear com um PIN** de novo, e digite o PIN dela.
- **Só este celular o conhece,** e cada dispositivo conectado tem o seu. Os backups o guardam.
- [~] **Também no {+Matrix, XMPP, Nostr e }SMS:** {+uma conversa do Matrix, XMPP ou Nostr tem **Bloquear com um PIN** no pé, e
  }uma conversa por SMS {-tem **Bloquear com um PIN** }abaixo da linha **SMS comum**, e funciona do mesmo jeito: na lista o nome dela com um cadeado,
  nenhuma mensagem dela na busca, e a senha do espaço tira um PIN esquecido. **Bloquear capturas de tela** fica ao
  lado, só neste celular (Android): os outros não ficam sabendo. As conversas de um lugar oculto não oferecem nenhum
  dos dois, pois o PIN dele as protege e elas ficam fora das capturas
  de tela enquanto **Capturas de tela** estiver ativado.

**Por quê:** algumas conversas devem ficar onde estão, mas não abertas para quem segura o celular por um momento. O
PIN só é guardado como Argon2id dele, para que não possa ser lido do celular, e as tentativas de adivinhar são lentas.
É um bloqueio na tela, não uma chave própria: as mensagens da conversa continuam criptografadas com o resto do espaço,
e quem copiar o que o celular guarda enquanto o espaço está aberto ainda poderia lê-las. Para uma conversa que não
deve nem ser vista, use as conversas ocultas.

## Coleção {#collection}

A Coleção é um lugar criptografado para suas fotos, arquivos e pastas, em cada espaço e em cada lugar oculto, cada um com a sua: a do espaço só abre no espaço, a de um lugar oculto só nesse lugar oculto, e nada no telefone diz que um lugar tem uma. O ícone dela, duas imagens com um minúsculo cadeado, fica na tela inicial à esquerda do cadeado e no alto das conversas de um lugar oculto. É um módulo, no Android, no app para computador, no app web e no Sailfish OS: **Configurações** → **Geral** → **Módulos**.

- **Dentro:** abas no alto: as **Fotos** em uma grade por mês, os **Vídeos**, a **Música** e os demais **Arquivos** em listas, cada uma com em cima as pastas que têm algo dela (**Arquivos** também as vazias). O **+** tira uma foto com a câmera, que vai direto para cá e nunca para a galeria, traz um arquivo dos arquivos do telefone, de até 4 GB, criptografado enquanto é lido, sem cópia antes, ou cria uma pasta nova. Toque e segure para escolher vários, para movê-los, enviá-los ou apagá-los; toque e segure uma pasta para renomeá-la ou apagá-la, o que mantém os arquivos dela.
- **Criptografada:** cada arquivo é criptografado com uma chave própria, em pedaços com nomes aleatórios entre os pedaços das conversas, de modo que nada no telefone distingue um arquivo da Coleção de uma foto de uma conversa. Só o catálogo próprio da Coleção, selado como as conversas, diz qual é qual. A Coleção fica fora das capturas de tela e fecha quando o espaço bloqueia.
- **Pede de novo:** onde o espaço tem senha, a Coleção pede a senha toda vez que abre, e de novo quando o Erevos ficou fora por mais de 30 segundos, antes de mostrar qualquer coisa; impressão digital ou rosto também servem onde desbloqueiam o Erevos. Senhas erradas contam como na tela de bloqueio. A Coleção de um lugar oculto não pede mais nada, porque as conversas ocultas fecham assim que você sai do Erevos.
- **De uma conversa ou de outro app:** toque e segure uma foto ou um arquivo numa conversa e depois **Salvar na Coleção**: ele é copiado para a Coleção do lugar dessa conversa. Pelo Compartilhar de outro app, o **Enviar para** tem a **Coleção** primeiro e pergunta em qual pasta; ele entra como chegou, já criptografado, por isso nunca fica sem criptografia no celular. Pode ter até 4 GB; um maior que 100 MB só pode ir para a Coleção, pois uma conversa aceita no máximo 100 MB.
- **Fora da Coleção:** uma foto abre em tela cheia, para deslizar e dar zoom, com **Enviar para uma conversa**, **Salvar no telefone**, **Informações** e **Apagar**. Salvar no telefone ou abrir um arquivo com outro app o tira sem criptografia, e o Erevos avisa antes. Enviar para uma conversa deixa a cópia da Coleção onde está. Da Coleção de um lugar oculto os arquivos vão só para as conversas e os grupos desse lugar oculto, nunca para os do espaço, e a Coleção do espaço nunca para um lugar oculto. Deslize, ou use as setas, para a foto seguinte ou a anterior; **Apresentação** no topo as mostra uma após a outra, a cada 4 segundos, até um toque.
- **De uma conversa:** **+** sob o campo da mensagem e depois **Coleção** abre a Coleção do lugar dessa conversa: toque nas fotos ou arquivos a enviar e depois em **Enviar**, e eles vão para essa conversa.
- **Backups:** um backup guarda a Coleção com o resto do telefone. **Configurações** → **Dados e dispositivos** → **Coleção**, ou os três pontos dentro da Coleção, podem deixar essa Coleção fora dos backups feitos enquanto ela está aberta: cada Coleção tem a sua escolha.
- **Num servidor WebDAV:** nas definições da Coleção, **Também num servidor WebDAV** copia os ficheiros dessa Coleção tal como estão, ainda cifrados, para uma pasta num servidor que escolhes, Nextcloud, ownCloud ou qualquer um que fale WebDAV: indica o endereço da pasta, um nome de utilizador e, de preferência, uma palavra-passe de aplicação, e toca em **Conectar**; **Testar a ligação** verifica-os primeiro. Cada espaço e cada lugar oculto tem a sua escolha e o seu servidor; primeiro é sugerido o servidor das cópias de segurança. Só vai o que ainda lá não está, uma peça de cada vez, enquanto o lugar está aberto, e retoma onde parou depois de a rede cair; um ficheiro apagado aqui é apagado também lá. Nada mais na pasta é tocado. O servidor só vê peças com nomes aleatórios, numa subpasta com nome aleatório, e não as pode abrir. Um telemóvel a que falte um ficheiro, como depois de restaurar uma cópia num telemóvel novo, vai buscá-lo lá ao abri-lo, e só guarda peças que abrem com a chave do ficheiro. O Erevos mostra quanto já chegou, com **Cancelar**: o que chegou fica, e da próxima vez só chega o resto; música, vídeos, PDF e **Abrir com outro app** também o trazem primeiro. Enquanto tudo está copiado, as cópias de segurança feitas com o lugar aberto podem deixar de fora as suas peças, também depois de o Erevos voltar a iniciar, até que um ficheiro seja adicionado ou apagado. Ele tem uma chave **Pelo Tor** própria, desligada a menos que você a ligue: ligada, a cópia vai só pelo Tor, seja qual for a definição de Tor do espaço, então o servidor não vê o seu endereço IP; é mais lento e espera enquanto o Tor inicia. Onde não há Tor, no app de computador e no app web, um servidor com a chave ligada não recebe nada.
- **Com Nextcloud, como o do LPHL:** nesse formulário, e em **Adicionar um servidor** dos backups, digite o endereço do seu Nextcloud em **Seu Nextcloud** e toque em **Entrar com Nextcloud**: entre no navegador, como no Fasouli, pelo Authentik ou como ele faz login, e escolha **Conceder acesso**. O Erevos recebe uma senha de app própria e preenche o formulário com a pasta dele nos seus arquivos, **Erevos/Collection** ou **Erevos/Backups**, criada se não existir, ao lado da do Fasouli, que ele nunca lê; depois toque em **Conectar**. Essa senha é revogada em Nextcloud → Configurações → Segurança. A entrada segue a chave **Pelo Tor** do servidor para o qual se entra: ligada, o Erevos pergunta ao seu Nextcloud só pelo Tor, mas a página no navegador em si vai como sempre.
- **Nos seus dispositivos conectados:** nas configurações da Coleção, **Também nos meus dispositivos conectados** envia essa Coleção para os [dispositivos conectados](#devices) do seu espaço ou lugar oculto, e a chave vale para todos. Um arquivo adicionado, renomeado, movido ou apagado em um fica assim em todos. As miniaturas chegam na hora; o arquivo em si chega na hora na mesma Wi-Fi, senão quando você o abre, do servidor WebDAV se a Coleção tiver um, ou pelo relay até 100 MB. Cada pedaço só é guardado quando abre com a chave do arquivo, e uma transferência interrompida continua do pedaço que faltava. Um arquivo só é apagado em outro lugar quando é apagado em um dos seus dispositivos, nunca porque falta lá. A Coleção de um lugar oculto vai só para os dispositivos conectados desse lugar.
- **Músicas, vídeos e PDFs:** um PDF é lido página por página dentro do Erevos (Android 11 ou mais recente), descriptografado só na memória. Músicas e vídeos tocam direto dos seus pedaços criptografados, nunca de uma cópia: um vídeo em tela cheia, a música com as próximas da pasta, continuando com a tela apagada, com reproduzir, pausar, próximo e anterior na notificação e na tela de bloqueio do telefone, e só isso lá. A lista continua depois que o espaço é bloqueado, a não ser que **Parar a reprodução quando o espaço é bloqueado** esteja ativado nas configurações da Coleção; **Parar** e o botão de pânico a encerram. A notificação mostra só **Reproduzindo**, a não ser que **Mostrar o título na notificação** esteja ativado. **Abrir com outro app** entrega o arquivo enquanto ele é descriptografado, sem cópia no telefone, até você sair da Coleção; o outro app pode guardar uma própria.
- **Originais da galeria:** com **Apagar o original da galeria depois de importar** ativado, uma foto ou um vídeo escolhido nos arquivos do telefone é apagado da galeria assim que está na Coleção, depois que o Android pede que você confirme. É preciso Android 11 ou mais recente. Uma foto da câmera nunca vai para a galeria. Se o Android não disser qual foto da galeria é (como em **Recentes** no seletor de arquivos), o original fica e o Erevos avisa: escolha-a em **Imagens** ou no armazenamento do telefone.
- **Fotos e vídeos:** em **+**, **Câmera** é a do próprio Erevos: fotos e vídeos um depois do outro, com flash e câmera frontal, direto na Coleção, nunca na galeria, e nenhum outro app os vê; uma foto nunca é gravada em lugar nenhum, nem por um instante, e não leva nada além da imagem. Onde o fabricante do telefone os oferece, como num Pixel, **Noite** e **Retrato** ficam ao lado de **Foto**, e em cima **HDR ligado**: são do próprio telefone, feitos nele, e nada sai. Um toque foca e acerta a luz ali; dois dedos dão zoom, e os botões acima do obturador vão para a grande angular (**0.5×**), **1×**, **2×** e **5×** onde o telefone os tem. **Mais** tem timer de 3 ou 10 segundos, grade, obturador silencioso onde a lei permite, **Mais escuro** e **Mais claro** e, para vídeos, HD, Full HD ou 4K, e **Vídeo HDR ligado** onde o telefone grava; no vídeo a luz pode ficar ligada. **Da galeria** traz muitas fotos e vídeos de uma vez; com **Apagar o original da galeria depois de importar** ligado, o Android pergunta uma só vez por todos. Fotos HEIC e AVIF aparecem em **Fotos** (o Android mostra HEIC a partir do 9 e AVIF a partir do 12); uma que o dispositivo não consegue mostrar oferece **Abrir com outro app**. Embaixo de uma foto, **Editar** gira um quarto de cada vez e corta com uma moldura que você arrasta pelos cantos: ela fica como nova foto, e a original fica como estava. **Informações** diz se uma foto ou um vídeo diz onde foi feito. Uma foto JPEG, PNG, WebP ou GIF salva fora ou aberta com outro app sai sem onde e quando foi tirada nem o telefone, a não ser que **As fotos saem com local e hora** esteja ligado nas configurações da Coleção; um vídeo ou uma foto HEIC sai como está, e o Erevos avisa antes se cita um lugar. A câmera, a galeria e **Editar** estão no Android; no app de computador e no navegador as fotos AVIF também aparecem.
- **No app para computador:** no Linux, macOS e Windows a Coleção também funciona, com seus arquivos criptografados na pasta do próprio Erevos no computador. O **+** traz um arquivo do computador, criptografado um pedaço por vez; não há câmera. Fotos, textos, PDFs (no visualizador de PDF embutido), músicas e vídeos abrem só na memória do Erevos, nunca como cópia sem criptografia no disco, até 1 GB cada, e músicas e vídeos de qualquer tamanho, lidos um pedaço por vez dos seus pedaços criptografados enquanto tocam; o arquivo fecha, e a música ou um vídeo para, quando o espaço bloqueia ou com o botão de pânico. **Salvar no computador** pergunta antes, como no telefone; **Abrir com outro app** não existe lá.
- **Num navegador e no Sailfish OS:** o app web, também na tela inicial de um iPhone, e o {=Erevos} no Sailfish OS têm a Coleção também. O **+** traz um arquivo com o seletor do próprio navegador, lido e criptografado um pedaço por vez, então um grande nunca fica inteiro na memória; seus pedaços ficam no armazenamento do navegador, ou no Sailfish OS na pasta do próprio Erevos. Um navegador dá a um site um espaço limitado: quando acaba, nada do arquivo é guardado, e o Erevos avisa. Fotos, textos, músicas e vídeos abrem só na memória, até 256 MB cada, e fecham quando o espaço bloqueia; um PDF não é mostrado lá: salve-o para lê-lo com outro app. **Salvar neste dispositivo** (no Sailfish OS **Salvar no telefone**) pergunta antes; num navegador aceita até 256 MB, enquanto o Sailfish OS grava em Downloads um arquivo de qualquer tamanho um pedaço por vez. Num navegador o servidor WebDAV precisa deixar o app web entrar, como para os backups; o Sailfish OS não tem cópia no WebDAV.
- **Formatos:** no Android tocam MP3, AAC e M4A, FLAC, Ogg e Opus, WAV, AMR, MP4, MKV, WebM e 3GP, também um arquivo que chegou sem tipo, reconhecido pelo final do nome, como os arquivos de outros apps costumam chegar. No app para computador e num navegador, o que o navegador toca deles: nem 3GP nem AMR.
- **A tela de reprodução:** toque na barra da música que está tocando embaixo na Coleção, ou em **Tocando agora** sob um arquivo de música, para ver a capa, o título, o artista e o álbum como o arquivo os diz (senão, o nome), uma barra para tocar ou arrastar até outro ponto, anterior, tocar ou pausar e próxima, **Aleatório**, **Repetir** (a lista, ou o arquivo) e a velocidade, de 0.5× a 2×, e a lista, com a que está tocando marcada: toque em outra para ouvi-la. Um vídeo, ou música de 10 minutos ou mais, começa onde você parou: o ponto fica no catálogo da Coleção, criptografado com ele, em nenhum outro lugar do telefone, e só para este aparelho. A notificação e a tela de bloqueio mostram o título, o artista e a capa só com **Mostrar o título na notificação** ligado; senão, só **Reproduzindo**.
- **Legendas:** um arquivo .srt ou .vtt na mesma pasta de um vídeo, com o nome dele (film.mkv e film.srt, ou film.en.srt), aparece como suas legendas, lido dos seus pedaços criptografados como o vídeo; **Legendas ligadas** no alto as desliga, e liga de novo.
- **Playlists:** no alto de **Música**, **Nova playlist** cria uma; as músicas entram pelo menu delas (**Adicionar a uma playlist**) ou escolhidas juntas (segure uma, depois **Playlist**). Abra-a para tocá-la em ordem ou em ordem aleatória, mover uma música para cima ou para baixo, ou tirá-la: ela fica na Coleção. As playlists ficam criptografadas com a Coleção, nunca sem criptografia.
- **Rádio:** a aba **Rádio** tem estações de rádio pela internet, cada uma pelo link dela; **+** ali adiciona uma. Só links https: o Erevos não abre http sem criptografia, então uma estação que tem só um link http não pode ser adicionada. Um link de playlist (.m3u, .pls) é lido uma vez, ao ser adicionado, para pegar o link do próprio fluxo; um fluxo HLS (.m3u8) toca no telefone. Uma estação toca como a música, com a mesma notificação, o mesmo **Parar a reprodução quando o espaço é bloqueado** e o botão de pânico; o título que ela envia aparece na tela de reprodução, e na notificação só quando **Mostrar o título na notificação** está ligado. A menos que **Tocar pelo Tor** esteja ligado, mais abaixo, a estação, e quem mantém o servidor dela, vê o endereço IP do seu aparelho enquanto toca, como qualquer site, e o Erevos avisa antes de tocar a primeira. O Erevos não envia mais nada a uma estação, e só “Erevos” como nome. As estações ficam criptografadas com a Coleção.
- **Encontrar uma estação:** **Adicionar uma estação** também busca no Radio Browser (radio-browser.info), um diretório livre de estações a que qualquer um pode adicionar: ele recebe só as palavras que você digita, quando aperta **Buscar**, e vê o endereço IP do seu aparelho, como a estação. Só aparecem estações para as quais ele tem um link https; um toque adiciona uma. Com o **Pelo Tor** ligado em **Listas de rádio e TV**, mais abaixo, a busca vai pelo Tor e o Radio Browser não vê o seu endereço IP.
- **Uma lista pronta de um país:** **Adicionar uma estação** também adiciona, com **Adicionar as estações deste país**, as estações mais ouvidas do Radio Browser no país que você escolher, até 100, cada uma com um link https. O Radio Browser é consultado uma vez, quando você toca, e vê o endereço IP do seu dispositivo, a menos que **Pelo Tor** esteja ligado em **Listas de rádio e TV**.
- **Uma playlist com muitas estações:** um link de playlist (.m3u, .pls) que traz muitas estações adiciona todas, e **Importar um arquivo de playlist** adiciona as estações de um arquivo .m3u ou .pls do seu aparelho, lido ali e não enviado a lugar nenhum. Só estações com link https são adicionadas (no máximo 500 de uma lista), e o Erevos diz quantas ficaram de fora.
- **Quando um fluxo cai:** se o servidor de uma estação, ou um proxy no caminho, encerra o fluxo, ou a rede cai por um instante, o Erevos pede a estação de novo sozinho depois de 1, 2, 4… segundos (no máximo 30), enquanto você quiser ouvir, no Android, no computador e no navegador. Depois de 12 tentativas seguidas, ele para e avisa.
- **TV:** a aba **TV** guarda canais de TV, cada um pelo seu link https, nos grupos que a lista deles dá, com uma fileira para mostrar um grupo e uma busca pelo nome. Um toque toca um canal na tela inteira, como um vídeo, com o mesmo **Parar a reprodução quando o espaço é bloqueado** e o botão de pânico; não há guia de programação. Toca no Android, no app de computador e em um navegador; lá um fluxo HLS toca pelo hls.js, e só quando o servidor dele deixa o app web lê-lo.
- **Adicionar canais:** o **+** em **TV** adiciona uma lista pelo link (.m3u), lida uma vez ao ser adicionada, um arquivo de lista do seu aparelho (**Importar um arquivo de lista (.m3u)**), lido ali e não enviado para lugar nenhum, ou um canal pelo link. Só são adicionados canais com link https, cada link uma vez, até 15.000 em cada Coleção, e o Erevos diz quantos ficaram de fora. Segure um canal para renomeá-lo, apagá-lo ou apagar todo o grupo dele, ou mandar com **Enviar para uma conversa** o nome e o link dele; o menu de uma estação de rádio também tem **Enviar para uma conversa**.
- **iptv-org:** **Adicionar canais** oferece o iptv-org (github.com/iptv-org/iptv), uma lista pública de canais gratuitos: **iptv-org por país**, primeiro a região do seu aparelho, ou **iptv-org: todos os canais**, mais de 10.000. O servidor dele vê o endereço IP do seu aparelho quando a lista é buscada, e cada canal quando toca, a menos que **Tocar pelo Tor** esteja ligado. Com o **Pelo Tor** ligado em **Listas de rádio e TV**, mais abaixo, a lista é buscada pelo Tor, então o servidor dela não vê o seu endereço IP; cada canal ainda vê quando toca, a menos que **Tocar pelo Tor** também esteja ligado.
- **O que um canal vê:** a menos que **Tocar pelo Tor** esteja ligado, mais abaixo, o canal, e quem mantém o servidor dele, vê o endereço IP do seu aparelho enquanto toca, como qualquer site, e o Erevos avisa antes de tocar o primeiro. Os logotipos só aparecem com **Mostrar os logotipos dos canais** ligado nos ajustes da Coleção, porque o servidor de cada logotipo também vê o seu endereço IP; senão, um ícone de TV. Os canais são guardados criptografados com a Coleção.
- **Listas de rádio e TV pelo Tor:** nas configurações da Coleção, o cartão **Listas de rádio e TV** tem o **Pelo Tor**, desligado a menos que você o ligue. Ligado, o Erevos pede só pelo Tor, seja qual for a definição de Tor do espaço, a busca no Radio Browser, uma playlist ou lista de TV buscada pelo link, a lista do iptv-org e os logotipos dos canais, então os servidores deles não veem o endereço IP do seu aparelho. É mais lento e espera enquanto o Tor inicia. Tocar as próprias estações e canais tem a sua própria chave, logo a seguir.
- **Tocar pelo Tor:** no Android, as configurações da Coleção também têm o **Tocar pelo Tor**, desligado a menos que você o ligue. Ligado, as estações e os canais tocam só pelo Tor, então nem eles nem quem mantém os servidores deles veem o endereço IP do seu aparelho; se o Tor não iniciar, nada toca direto no lugar. É mais lento e espera enquanto o Tor inicia, e um canal de TV pode demorar a começar ou travar por um momento. Enquanto o espaço envia tudo pelo Tor, eles tocam pelo Tor mesmo com ele desligado. Desligado, tocam direto: antes de tocar o primeiro, o Erevos avisa que o servidor dele vê o seu endereço IP, com um botão **Tocar pelo Tor** que o liga e toca pelo Tor, e **Prosseguir**, que toca direto. Só o Android os toca pelo Tor: em outros lugares, com ele ligado, eles não tocam, e o Erevos diz por quê; num computador também não enquanto o espaço envia tudo pelo Tor.

**Por quê:** algumas fotos e arquivos, um passaporte, um contrato, uma imagem, não devem ficar na galeria para qualquer app ler nem viajar numa conversa. A Coleção os guarda com a mesma criptografia das conversas, separados delas. Quando um arquivo é salvo no telefone ou aberto com outro app, ele está fora do Erevos, sem criptografia.

## Backups {#backup}

Um backup guarda tudo o que o Erevos mantém neste celular: todos os espaços, com os contatos, as chaves das conversas,
as mensagens, as fotos, os arquivos, as mensagens de voz, as conversas importadas, as conversas ocultas{-,}{+ e as contas
Matrix, XMPP e Nostr de cada um,} a Conversa comigo dele, o bloqueio e a senha de pânico, e as configurações que vão com
você para outro celular. Dentro dele cada espaço continua selado com a própria senha, e o backup é selado de novo com
uma senha própria. As fotos, os arquivos e as mensagens de voz dele vão em arquivos próprios ao lado dele, de até 4 MB
cada, cujos nomes começam como o dele; um backup automático usa também os arquivos dos anteriores: mantenha junta a
pasta toda. Fica em **Configurações** → **Dados e dispositivos** →
**Backups**.

1. **Fazer um backup:** toque em **Fazer um backup**, escolha uma pasta (no celular, num cartão de memória, ou num app
   de nuvem que mostre as pastas dele ali; num computador, qualquer pasta), digite duas vezes uma senha para o backup
   (pelo menos 12 caracteres, ou quatro palavras) e toque em **Salvar**. Num navegador, o backup e os arquivos dele vão para o menu de compartilhamento ou para os downloads: o primeiro na hora, e cada um dos seguintes depois de um toque em **Salvar**.
   Enquanto é feito, o cartão diz o que faz e quanto falta; quando termina, um aviso diz.
2. **Backups automáticos:** escolha **A cada 6 horas**, **Todo dia** ou **Toda semana**, depois uma pasta e uma senha.
   O Erevos faz um enquanto está aberto, assim que o último é mais antigo que isso: quando um espaço abre, a cada 15
   minutos e quando vai para o segundo plano, antes de bloquear; nunca sem um espaço aberto. Cada um escreve só as
   fotos, os arquivos e as mensagens de voz que são novos desde o anterior, e nomeia de novo os arquivos dos
   anteriores para o resto, então um a cada 6 horas custa pouco. A pasta guarda os 3 mais recentes, com todos os
   arquivos de que eles precisam, e apaga os arquivos de que nenhum precisa. Um que falhou é tentado de novo quando um
   espaço abre, ou uma hora depois. Abaixo deles ficam **Fazer
   backup agora**, **Mudar de pasta** e **Alterar senha**; **Desativado** os interrompe, e os já feitos ficam na
   pasta.
3. **Também para um servidor:** no Android e no app para computador, com os backups automáticos ligados, **Adicionar
   um servidor** em **Também para um servidor** envia cada um também para uma pasta num servidor que você escolher e
   que fale WebDAV, como o seu próprio Nextcloud: informe o endereço da pasta, um nome de usuário e, melhor, uma senha
   de aplicativo só para o Erevos, e toque em **Conectar**. O servidor guarda os 3 mais recentes, com todos os
   arquivos de que eles precisam, e cada um envia só o que é novo; **Parar de enviar**
   interrompe, e os que estão lá ficam. No web app, que não faz backups sozinho, **Enviar um backup agora** envia um
   para lá, com uma senha que você digita a cada vez.
   Cada servidor tem uma chave **Pelo Tor**, no seu cartão e no formulário que adiciona um, desligada a menos que você
   a ligue (veja **Num servidor** mais abaixo).
4. **Restaurar:** toque em **Restaurar um backup**, escolha o arquivo e digite a senha dele. O Erevos pergunta mais
   uma vez, encontra os arquivos do backup ao lado dele, ou pede que você os escolha, ou a pasta deles (para um backup
   automático, escolha todos os arquivos da pasta, pois alguns dos arquivos dele podem começar como o nome de um
   backup anterior), depois põe o
   backup no lugar de tudo o que há no celular, e abre como estava quando o backup foi feito, com as senhas usadas
   então. Se um dos arquivos dele faltar, estiver danificado ou for de outro backup, o Erevos diz qual, e nada muda, a não ser que você escolha restaurar o resto sem ele: então as fotos, os arquivos e as mensagens de voz do celular ficam como estão, e os que ele contém não voltam. **Restaurar de um
   servidor** procura na pasta para onde vão os backups automáticos, ou numa que você indicar com usuário e senha, e
   mostra os backups que estão lá, os mais recentes primeiro: escolha um, digite a senha dele, e ele é restaurado do
   mesmo jeito, com os arquivos dele de lá.

- **Guarde a senha do backup:** nada abre um backup sem ela, e ninguém pode recuperá-la. Sem bloqueio com senha, a
  senha do backup é tudo o que o protege. Quem tem o arquivo pode testar senhas nele tão rápido quanto o computador
  dele permite, sem nenhum celular para atrasá-lo, então uma curta não resiste: o Erevos não aceita nenhuma com menos
  de 12 caracteres.
- **Os backups automáticos guardam a senha deles no celular,** para não precisarem de senha a cada vez. Quem abrir a
  pasta deles ainda precisa das senhas dos espaços para ler as conversas.
- **O que ocupa espaço:** no Android, **Medir** em **O que ocupa espaço** mostra quanto espaço o Erevos ocupa no telefone, por tipo: {~a Coleção com |}as fotos e ficheiros das conversas, as mensagens de voz, o histórico das conversas, o Tor e os restos de escritas que não terminaram. Cada cópia automática contém tudo isto, assim vê-se porque é grande. Só se olham os nomes e tamanhos dos ficheiros, no telefone, e nada é enviado.
- **Restos:** fotos e ficheiros que já nenhuma conversa{~, Coleção|} ou importação nomeia, como os de uma importação que parou a meio, ficam no telefone e em cada cópia. Em **Restos**, escreve um de cada vez, ou vários de uma vez separados por vírgulas ou espaços, o PIN de cada uma das tuas conversas ocultas e a palavra-passe de qualquer outro espaço, e toca em **Procurar restos**: o Erevos lê que ficheiros cada um deles e este espaço nomeiam, e mostra quanto nenhum nomeia. **Apagá-los** apaga-os, depois de confirmares mais uma vez. Um lugar que não abriste ali perde as suas fotos e ficheiros: abre todos primeiro. Um ficheiro escrito no último dia nunca é tomado, e as cópias já feitas guardam tudo.
- **Verificar as cópias:** depois de cada cópia automática, o Erevos volta a lê-la da pasta: abre com a sua palavra-passe, cada parte que nomeia está lá, com o seu tamanho, e duas partes escolhidas ao acaso são lidas por inteiro. De um servidor só olha então para a lista, por isso nada é descarregado. **Verificar agora** descarrega também a cópia mais recente do servidor e dez das suas partes. Uma parte em falta ou danificada aparece a vermelho: faz uma cópia agora e verifica de novo. **Verificação completa da pasta** lê por inteiro cada parte lá e compara-a com o SHA-256 que a cópia anotou para ela: alguns minutos com muitos GB, e nada sai do telefone.
- **Num servidor:** o backup que vai para lá é selado com a senha dele como os outros, e essa senha nunca sai do
  celular, então o servidor não consegue abri-lo. O nome é aleatório e o arquivo parece bytes aleatórios, de um entre
  poucos tamanhos, então nenhum dos dois diz que é do Erevos nem exatamente quanto guarda. As fotos, os arquivos e as
  mensagens de voz dele vão como envios próprios, todos do mesmo tamanho, cada um também com um nome aleatório e selado
  com a senha do backup, preso a esse backup e ao lugar dele nele, para que nenhum possa ser trocado, tirado ou vir de
  outro backup sem que se perceba; o servidor guarda cada um enquanto algum dos backups que ele guarda precisar dele,
  e depois o apaga. Os nomes deles têm o mesmo comprimento que o do backup, mas o tamanho os distingue dele, então o servidor pode contá-los e saber assim mais ou menos quanto o backup guarda. O que um backup interrompido deixou lá é apagado antes que o próximo vá, então um servidor que ficou sem espaço volta a ter. O servidor ainda
  vê sua conta, quando chega um e mais ou menos o tamanho. No Android, os backups vão para lá como diz a escolha do espaço em
  **Configurações** → **Relay e redes** → **Tor**{+, como o Matrix}: com **Tudo** só pelo Tor, então o servidor não vê o
  endereço do celular; com **Mensagens** pelo Tor assim que o Tor está pronto, e direto enquanto o Tor inicia ou
  quando falha; com **Nada** direto, e o servidor vê o endereço do celular. Um backup espera primeiro até dois minutos
  o Tor iniciar, e **Também para um servidor** diz por onde vai agora. No app para computador quem os envia é o
  próprio app, não a página dele, pois uma página não pode chegar a um servidor assim; no web app quem os envia é o
  navegador, que só chega a um servidor configurado para deixar o web app entrar (CORS), o que o Nextcloud não é de
  fábrica. Nenhum dos dois tem Tor para isso: enquanto um espaço envia **Tudo** pelo Tor, nenhum vai de lá. No web app
  a senha do servidor fica guardada no navegador, selada com uma chave que o navegador não entrega. **Restaurar de um
  servidor** baixa o que você escolher do mesmo jeito, pelo Tor como diz o espaço, e não escreve nada lá; uma senha
  digitada para isso serve só para essa restauração e não fica guardada. Pelo Tor nenhum arquivo de um backup maior que
  64 MB chega, e direto nenhum maior que 100 MB, o máximo que o Erevos aceita num download: então baixe o backup e os
  arquivos dele do servidor e toque em **Restaurar um backup**. Um Erevos anterior a esta versão não abre um backup
  assim. O Google Drive ficou de fora de propósito: o Google liga o arquivo ao seu nome, e o Erevos precisaria dos
  apps do Google e de um login no Google no celular.
  A chave **Pelo Tor** de cada servidor, desligada a menos que você a ligue, vale mais que a escolha do espaço para
  esse servidor: ligada, os backups dele vão só pelo Tor, seja qual for a definição de Tor do espaço, e esperam o Tor
  iniciar, então o servidor não vê o endereço do celular. **Restaurar de um servidor** e o formulário que adiciona um
  servidor têm a mesma chave, e a entrada com Nextcloud segue a chave do servidor para o qual se entra: a página no
  navegador em si vai como sempre. O app de computador e o app web não têm Tor: um servidor com a chave ligada não
  recebe nada de lá. As partes do backup que você dá a amigos ([Partes do backup com amigos](#backup-pieces)) não
  levam a chave.
- **Conversas que continuaram depois do backup:** restaurar devolve as chaves de cada conversa como estavam então. As
  mensagens que chegaram depois do backup e já foram lidas não estão nele. Uma conversa que continuou depois do backup
  deixaria de abrir mensagens novas, então cada conversa restaurada, a do espaço e a de cada lugar oculto quando abre,
  começa sozinha e em silêncio uma conversa nova com cada contato, a partir das chaves mais novas que ele deu a ela, e
  o {=Erevos} dele segue nela. Com um contato cujo {=Erevos} é mais antigo, peça de novo o link de contato dele. Antes de uma conversa restaurada
  escrever de novo, as conversas dela pulam adiante das chaves que podem ter usado desde o backup, para que nenhuma
  chave sele duas mensagens: uma selada duas vezes deixaria quem guardou os dois pacotes ler os dois juntos. Em um
  grupo, um membro restaurado pede ao Erevos do administrador que o ponha de novo, o que funciona enquanto o grupo
  avançou só um pouco; se não, peça para ser adicionado de novo.
- [+] **Matrix, XMPP e Nostr:** as contas de cada espaço e de suas conversas ocultas estão no backup. Uma chave **Nostr**
  volta com as conversas dela, como estavam. Uma conta **XMPP** volta com a sessão, os contatos, as conversas e as
  chaves que ela conhece dos outros, e segue como um novo dispositivo da conta: mantém a chave de identidade, então os
  apps dos seus contatos ainda conhecem a chave dela, mas pega um novo ID de dispositivo, um novo resource e novas
  chaves, cada conversa recomeça, e o dispositivo antigo sai das listas de dispositivos da conta assim que ela se
  conecta. Ela não consegue ler as mensagens criptografadas para o dispositivo antigo depois do backup. Uma conta
  **Matrix** é solta neste celular, sem sair no servidor, o que encerraria o dispositivo no celular de onde veio o
  backup; o espaço entra de novo, como um novo dispositivo, e a chave de segurança dele abre as mensagens de antes.
  Postas de volta como estavam, as conversas de um dispositivo assim usariam de novo chaves de mensagem que os outros
  recusam, e o celular de onde veio o backup pode ainda estar usando o dispositivo.
- **Conversas fechadas:** um backup guarda também o que **Tocar as chamadas quando fechadas** e **Avisar quando chega
  uma mensagem** das conversas ocultas, e **Também enquanto outro espaço está aberto**, precisam. Assim, depois de uma
  restauração, também em outro celular, eles continuam como estavam. Um backup de antes desta versão não tem nada
  disso: restaurá-lo os deixa como o celular os tem.
- **Configurações:** um backup guarda as configurações que são suas e não do celular: o idioma,{~ os módulos,} a
  vibração, os avisos em segundo plano e o número no ícone, a economia de bateria, a privacidade da tela, a qualidade
  das fotos, se o Telefone abre sem a senha, e como o Erevos chega aos celulares por perto (levando as mensagens deles,
  na mesma Wi-Fi, por Wi-Fi Direct, Wi-Fi Aware e um rádio LoRa, que só volta a ligar onde este celular o conhece). No
  Android ele guarda também as respostas rápidas do Telefone e as chamadas que ele recusa, as de um grupo de contatos
  só onde este celular tem um grupo com esse nome na mesma conta. Os backups automáticos e o servidor deles voltam com
  a senha deles, mas não com a pasta, na qual o Android só deixa gravar o celular em que ela foi escolhida: em outro
  celular, **Backups** pede que você escolha uma, e até lá eles vão só para o servidor.
- **Um celular de cada vez:** um backup restaurado num segundo celular lê as mesmas filas do relay que o primeiro, e
  cada um pega mensagens que o outro então nunca recebe. Use-o para mudar para um celular novo, não para manter dois.
- **O celular antigo foi perdido:** um celular que foi perdido ou roubado e ainda está ligado continua lendo as filas
  do relay que conhecia, então mensagens enviadas para lá podem chegar a ele e nunca ao celular novo. Depois de
  restaurar o backup no celular novo, toque em **O celular antigo foi perdido** em **Backups** (depois de restaurar um
  backup de outro celular, o Erevos aponta para isso) e diga **Trocar as filas**. Cada espaço e suas conversas ocultas
  passam então para filas novas do relay, cada um na próxima vez que abre aqui, e os seus contatos e grupos são
  avisados em silêncio. As filas antigas são lidas aqui até cada contato escrever nas novas, 14 dias no máximo, e os
  links de contato e os QR codes que você deu antes valem por 14 dias, depois não mais. O que chega por Nostr{+, XMPP ou
  Matrix} ainda chega ao celular antigo. Depois de outra restauração, toque nele de novo.
- **Discrição:** todos os espaços mostram a mesma tela de Backups, e um backup guarda todos os espaços, então nenhum
  dos dois diz quantos espaços há nem se há conversas ocultas definidas. Os nomes dos arquivos dizem que são um backup do
  Erevos, e a quantidade e o tamanho deles mostram mais ou menos quanto está guardado.
- [~] **Os SMS do celular:** no Android, **Incluir os SMS nos backups** acrescenta os SMS e MMS do celular a cada backup a
  partir daí, com até 32 MB das imagens deles, enquanto o Erevos é o app de SMS. Eles são selados com a senha do
  backup como o resto. Restaurar o backup devolve aos SMS do celular cada mensagem que ele ainda não tem, e não apaga
  nenhuma; o Erevos tem de ser o app de SMS então também, ou o resto é restaurado sem eles. Os SMS são do celular, os
  mesmos em todos os espaços. Um Erevos mais antigo não abre um backup que contém SMS.
- [~] **As chamadas do celular:** no Android, **Incluir as chamadas nos backups**, em **As chamadas do celular**,
  acrescenta a cada backup a partir daí o histórico de chamadas do celular (as 10.000 chamadas mais recentes dele, sem
  o correio de voz) e a própria lista de números bloqueados do Android, enquanto o Android deixa o Erevos ler o
  histórico de chamadas; os números bloqueados só enquanto o Erevos é o app de Telefone ou SMS. Fica desligado até
  você ligar, e a escolha vai nos backups. Eles são selados com a senha do backup como o resto. Restaurar o backup
  acrescenta ao celular cada chamada e cada número bloqueado que ele ainda não tem, e não apaga nenhum; o Erevos tem
  de ser o app de Telefone então (**Configurações** → **Telefone e SMS** → **Telefone**), ou o resto é restaurado sem
  eles. O Android guarda mais ou menos as 500 chamadas mais recentes de cada SIM, então as mais antigas restauradas
  podem sumir conforme chegam chamadas novas. Um Erevos mais antigo não abre um backup que contém chamadas.
- [~] **Os SMS em ordem:** os fixados, as conversas arquivadas, a Lixeira, os rascunhos, o filtro e as marcas de spam de
  cada espaço, quanto tempo um SMS espera para poder ser desfeito, os SMS para enviar mais tarde (**SMS mais tarde**),
  os convites, os nomes dos seus contatos, se as mensagens para contatos do Erevos podem ir por SMS, e o chip escolhido
  para cada número estão em todo backup, selados com a senha do espaço como o resto. O chip escolhido só volta no mesmo celular, pois cada celular dá aos seus chips identificadores próprios: em outro, os SMS e as chamadas vão pelo chip padrão dele até você escolher um lá. Um SMS para mais tarde cuja hora
  chegou antes da restauração não sai sozinho, pois o celular de onde veio o backup pode já tê-lo enviado: ele aparece
  como não enviado, e um toque nele o envia ou o apaga. Um cuja hora ainda não chegou sai na hora dele. Um Erevos mais
  antigo não abre um backup que os contém; um feito por um {=Erevos} mais antigo restaura como sempre, sem eles.
- **O que nunca volta:** o que pertence ao próprio celular não vem com nenhum backup, então uma restauração em outro
  celular não consegue trazê-lo: a digital ou o rosto, cuja chave o Android guarda no chip daquele celular; as pastas
  em que o Erevos pode gravar, como a dos backups automáticos, nas quais o Android só o deixa entrar no celular em que
  foram escolhidas; o que o Android permite ao Erevos{~ e quais apps fazem as chamadas e enviam os SMS}, que só você pode
  permitir em cada celular, por isso depois de uma restauração no Android abre **Permissões**{~ para os módulos ativados};
  {~o histórico de chamadas e a própria lista de números bloqueados do Android, a menos que **Incluir as chamadas nos
  backups** estivesse ligado, como acima; |}e a contagem de senhas erradas.{+ Uma conta XMPP volta como um novo dispositivo dela mesma e o Matrix entra de novo, como
  acima,}{- Os dispositivos conectados se conectam de novo, como abaixo.}{+ e os dispositivos conectados se conectam de novo, como abaixo.}
- **Dispositivos conectados:** uma conexão fica com o celular e o computador em que foi feita, e nenhum backup a
  guarda, mas um backup guarda o que permite ao celular em que é restaurado pedir a cada um deles que se conecte de
  novo. Depois de restaurar um backup em outro celular, abra lá **Configurações** → **Dados e dispositivos** →
  **Dispositivos conectados**: em **Do backup**, toque em **Pedir para conectar de novo** para cada dispositivo que
  ainda é seu, ou em **Esquecer** para um que não é. O dispositivo, que tem de estar ligado, mostra o pedido: toque lá
  em **Conectar de novo** só se foi você que restaurou o backup, senão em **Agora não**. Ele se conecta então ao
  celular novo sem código para ler, mantém as conversas dele e recebe o que veio desde então; as mensagens que
  chegaram ao celular antigo depois do backup ficam só nele. Depois de conectado de novo, nem o celular antigo nem
  quem tiver o mesmo backup chega a ele. Um pedido vale por 14 dias, e os dispositivos de um lugar oculto são pedidos
  de dentro desse lugar. Um dispositivo com um {=Erevos} mais antigo não mostra pedido: toque nele em **Desconectar este
  dispositivo**, depois conecte-o como na primeira vez, veja [Dispositivos conectados](#devices). Os contatos com esta
  versão param de escrever para os seus computadores até eles se conectarem de novo: o celular lhes dá
  uma nova lista dos dispositivos dele que não nomeia nenhum. Se o relógio deste celular estiver atrasado em relação
  ao do perdido, essa lista só vai para eles quando escreverem para ele, e os detalhes da conversa deles podem dizer
  que ela mudou no dia depois de você restaurar. O próprio backup de um computador conectado guarda as conversas do
  celular como estavam, mas não a conexão para escrever nelas: restauradas, elas podem ser lidas ali mas não se pode
  escrever nelas, e o Erevos avisa uma vez. Para escrever nelas, conecte esse computador ao celular de novo: as
  conversas que o celular ainda tem ficam, com o que chegou desde então, e as outras somem. No celular, desconecte o
  dispositivo que ele era antes. Faça os backups no celular.
- **Versões:** um backup só abre num Erevos tão novo quanto o que o fez, ou mais. Um feito por um {=Erevos} mais novo é
  recusado, sem mudar nada: atualize primeiro o Erevos para a versão mais recente. Um Erevos anterior à 6.0.0 diz de um
  backup da 6.0.0 em diante que não é um backup do Erevos: atualize-o também.

## Partes do backup com amigos {#backup-pieces}

A senha dos seus backups pode ir para amigos em partes, em **Configurações** → **Dados e dispositivos** → **Partes do
backup**: escolha **2 de 3**, **2 de 4**, **3 de 4** ou **3 de 5**, depois o mesmo número de contatos, e toque em
**Dar as partes**. Com os backups automáticos ligados, o Erevos confere se a senha que você digita é a deles. Com um
servidor em **Também para um servidor**, as partes podem guardar também o endereço, o nome de usuário e a senha dele,
para que com elas os backups de lá possam ser encontrados e abertos. Cada contato recebe uma mensagem que diz o que é,
e o {=Erevos} dele guarda a parte separada da conversa, em **Partes que você guarda para amigos**.

1. **Para recuperá-la:** peça as partes a um número suficiente deles. Cada um toca em **Mostrar o código** ao lado da
   sua, e você toca em **Escanear um código** em **Juntar suas partes**; ou tocam em **Copiar** e mandam o texto para
   você de outro jeito, e você cola e toca em **Adicionar**; ou, enquanto seu celular ainda tiver a conta, tocam em
   **Devolver na conversa**. Depois toque em **Juntar**: o Erevos mostra a senha e, com um servidor nas partes,
   **Restaurar desse servidor** lista os backups de lá.
2. **Uma senha nova:** assim que seus backups tiverem uma senha nova, as partes dadas antes deixam de servir: dê
   novas.

- **O que uma parte mostra:** nada. Menos partes do que as necessárias não dizem nada da senha, por mais poder de
  computação que se use: com elas, qualquer senha é tão provável quanto outra. Toda parte tem o mesmo tamanho, seja
  qual for a senha, e nada nela nomeia você ou os outros amigos.
- **No seu celular:** a mensagem fica na conversa, mas a parte dela não: depois de enviada, nada no seu celular
  guarda as partes, só para quem foram. Quem abrir um dos seus espaços fica sabendo para quem você deu partes, não a
  senha. As partes vão só para contatos do espaço, não para conversas ocultas.
- **O que isso não impede:** amigos suficientes juntos podem abrir seus backups se também conseguirem o arquivo:
  escolha pessoas que não se conheçam todas entre si. Alguém pode fingir ser você, de um número ou conta novos, para
  conseguir as partes: um amigo deve devolver a parte só para você pessoalmente, ou na conversa que já tem com você. Um
  amigo com um {=Erevos} mais antigo que esta versão vê a mensagem mas não guarda nenhuma parte.

**Por quê:** um backup é tão seguro quanto a senha dele, e uma senha forte se perde com facilidade. Dividida assim (o
compartilhamento de segredos de Shamir), nenhum amigo sozinho, e nenhum relay, tem algo que o abra.

## Mudar para um celular novo {#new-phone}

Tudo o que o Erevos guarda vai para um celular novo em um só backup: cada espaço com as conversas ocultas, os contatos,
as mensagens, as fotos{~, os arquivos e a Coleção| e os arquivos}, as contas e os relays, o bloqueio, a senha de pânico e as suas
configurações. Nenhum servidor guarda uma cópia disso para você, então nada chega sozinho: o backup leva tudo, selado
com a própria senha.

1. **No celular novo, instale o {=Erevos}:** a mesma versão do celular antigo, ou uma mais nova, pois um {=Erevos} mais antigo
   recusa um backup feito por um mais novo. Sem internet, o celular antigo pode dá-lo, veja
   [O Erevos para um telefone próximo](#give-app).
2. [~] **No celular antigo, prepare-o:** para os SMS do celular também irem, ative **Incluir os SMS nos backups** em
   **Backups**, e para o histórico de chamadas dele **Incluir as chamadas nos backups**. Uma Coleção deixada fora dos backups fica para trás: coloque-a de volta, ou dê a ela um servidor
   WebDAV, veja [Coleção](#collection).{+ Deixe a sua chave de segurança do Matrix à mão, pois o Matrix entra de novo no
   celular novo.}
3. **No celular antigo, faça o backup:** em **Configurações** → **Dados e dispositivos** → **Backups**, toque em
   **Fazer um backup**, ou em **Fazer backup agora** com backups automáticos. Faça-o por último, logo antes de mudar, e
   daí em diante não abra o Erevos no celular antigo: o que chega depois espera nos relays pelo novo.
4. **Leve-o para lá:** copie o backup e todo arquivo cujo nome comece como o dele, todos em uma pasta, para o celular
   novo, por cabo, cartão de memória ou app de nuvem. Um backup no seu servidor não precisa ser copiado.
5. **No celular novo, restaure:** na primeira abertura, toque em **Eu já tenho o {=Erevos} em outro celular** (ou faça a
   primeira abertura).{~ No Android, para os SMS, deixe o Erevos ser também lá o app de SMS.} Depois, em **Configurações**
   → **Dados e dispositivos** → **Backups**, toque em **Restaurar um backup** e escolha o arquivo, ou em **Restaurar de
   um servidor** e dê o endereço, o nome de usuário e a senha do servidor; digite a senha do backup e diga que sim. O
   Erevos abre como o celular antigo estava, com as mesmas senhas.
6. **No celular novo, configure de novo o que é do celular:** **Permissões** abre para o que o Android deve permitir.
   Depois ative de novo a digital ou o rosto (veja [Bloqueio com senha](#lock)), escolha de novo a pasta dos backups
   automáticos em **Backups**, e o chip de cada número{+, e entre no Matrix com a chave de segurança dele}.
7. **No celular antigo, apague o Erevos:** quando o celular novo mostrar as suas conversas e as mensagens novas
   chegarem lá, toque em **Apagar tudo agora** em **Configurações** → **Privacidade e segurança** → **Botão de
   pânico**. Não em **Apagar-me de todos os lugares**: isso apaga as filas dos relays que o celular novo lê.

- **Um celular de cada vez:** os dois celulares leem as mesmas filas dos relays, e uma mensagem vai para o que a pegar
  primeiro, então o outro nunca a recebe. Deixe o antigo fechado a partir do backup, e apague-o no fim.
- **Seus contatos:** cada espaço mantém o seu relay, o seu token e o seu relay de casa, então não há nada para digitar
  de novo nem convite para pedir. Seus contatos escrevem para você como antes.
- **Conversas ocultas:** cada lugar oculto vem com o backup, cada um com o seu PIN, e nada no celular novo diz que
  existe algum, veja [Conversas ocultas](#hidden).
- [+] **Matrix, XMPP e Nostr:** uma chave Nostr continua como estava, uma conta XMPP como um novo dispositivo dela mesma, e
  o Matrix entra de novo como novo dispositivo, com a chave de segurança dele abrindo as mensagens de antes, veja
  [Backups](#backup).
- **Dispositivos conectados:** no celular novo, em **Configurações** → **Dados e dispositivos** → **Dispositivos
  conectados**, toque em **Pedir para conectar de novo** para cada computador ou navegador que ainda é seu, depois em
  **Conectar de novo** nele: ele mantém as conversas dele, sem código para ler. Os dispositivos de um lugar oculto, de
  dentro desse lugar. Um dispositivo com um {=Erevos} mais antigo: toque nele em **Desconectar este dispositivo**, depois
  conecte-o ao celular novo como na primeira vez. Veja [Backups](#backup).
- [~] **A Coleção:** vem nos arquivos do backup. Uma deixada fora dos backups vem só do servidor WebDAV dela, cada arquivo
  quando é aberto; uma sem nenhum dos dois fica no celular antigo, e o apagamento a elimina.
- **{~Módulos e configurações:** os módulos ativados, o|Configurações:** o} idioma e as outras configurações vêm com o backup. O que o
  Android guarda para cada celular fica lá, como o que ele deixa o Erevos fazer{~; o histórico de chamadas e os números
  bloqueados dele vêm também com **Incluir as chamadas nos backups** ligado}.
- **Um arquivo faltando:** se um arquivo do backup faltar ou estiver danificado, o Erevos diz qual e não muda nada, a
  não ser que você escolha restaurar o resto sem ele.
- **Se o celular antigo se perdeu:** restaure o seu backup mais novo no celular novo assim que puder, também do seu
  servidor, depois toque em **O celular antigo foi perdido** em **Backups**, para ele não ler mais nada seu nos
  relays. Se você perdeu a senha do backup, os amigos que têm as partes dela podem devolvê-la, veja
  [Partes do backup com amigos](#backup-pieces).

**Por quê:** o Erevos não guarda nada seu em um servidor que possa devolvê-lo, então nenhuma conta leva as suas
conversas para um celular novo. Um só backup, selado com a própria senha, leva tudo, e só você pode abri-lo.

## Botão de pânico {#panic}

Quando você está em perigo, o Erevos pode se apagar na hora, em **Configurações** → **Privacidade e segurança** →
**Botão de pânico**: toque em **Apagar tudo agora** e confirme com **Apagar**. No Android, no app web, num computador e
no Sailfish OS.

Para achá-lo rápido numa emergência, ele também é o primeiro, em vermelho, no menu **⋯** da tela inicial, e manter o
cadeado do topo da tela inicial pressionado o abre na hora. Um toque no cadeado ainda bloqueia; só mantê-lo pressionado
abre o botão de pânico, e ali **Apagar tudo agora** ainda pergunta mais uma vez.

- **O que é apagado:** cada espaço com suas conversas ocultas, com seus contatos, mensagens, fotos, arquivos e chaves;
  o bloqueio e suas senhas; {+as contas de Matrix, XMPP e Nostr e }os tokens do relay; as configurações e a senha dos
  backups automáticos, e do servidor deles. No Android, o Erevos depois se fecha e da próxima vez abre como
  recém-instalado. Com **Também os backups automáticos em** escolhido, os arquivos de backup de lá são apagados
  primeiro.
- **O que fica:** o que o Erevos não alcança: backups que você copiou para outro lugar ou enviou a um servidor (a senha
  deles ainda os protege), o que o relay guarda para você até expirar, e o que seus contatos têm.

1. **Por um app de pânico:** no Android, um app de pânico como o Ripple apaga os apps que você escolher com um só
   gesto. Instale um e escolha o Erevos nele: o Erevos abre esta tela, depois da senha dele, e pergunta. Toque em
   **Dizer sim**.
2. **Só esse app:** só o app a que você disse sim pode apagar o Erevos, e só enquanto **Um app de pânico pode apagar o
   Erevos** estiver ligado. O Erevos confere o nome do app e a assinatura dele: outro app, ou o mesmo nome instalado de
   novo por outra pessoa, não consegue. Uma atualização do app que passa a uma chave nova do jeito que o Android permite
   (rotação de chave) continua de confiança. **Parar de confiar** encerra isso.
4. **Quando o Erevos recusou:** se o app de confiança pediu para apagar com o interruptor desligado, ou assinado com
   outra chave, esta tela avisa em vermelho, com o dia e a hora. Quando o app está assinado com outra chave, **Confiar
   em … como está agora** volta a confiar nele: diga sim só se você mesmo o atualizou.
3. **Depois de apagar:** o app de pânico também é esquecido: diga sim a ele de novo quando configurar o Erevos outra
   vez.

- **Num computador e no Sailfish OS:** não há app de pânico, só **Apagar tudo agora**, com **Também os backups
  automáticos em** a pasta deles, se você escolher. Num computador, o Erevos depois começa de novo como recém-instalado;
  no Sailfish OS, ele se fecha. O item do chaveiro para o Erevos fica num computador, mas o que ele selava sumiu, então
  não abre nada.
- **O que ele não pode esconder:** no telefone, sem a senha, ainda dá para ver que o Erevos está instalado e que um
  app de pânico pode apagá-lo, mas não o que havia nele.
- **Avisar outros apps (Android):** em **Avisar outros apps** você escolhe os apps que o Erevos avisa ao apagar, como
  um app de pânico, pelo botão, pela senha de pânico ou por um app de pânico. Cada um pergunta antes se o Erevos pode.
  O Fasouli então se bloqueia: fecha e pede de novo o seu bloqueio ao abrir.

**Por quê:** numa fronteira ou numa prisão pode não haver tempo de abrir cada conversa. Um toque, ou o gesto de um app
de pânico, não deixa nada para abrir.

### Senha de pânico

Com o bloqueio com senha ativado, a mesma tela oferece uma **Senha de pânico**: uma senha própria que, digitada na
tela de bloqueio, apaga o Erevos como **Apagar tudo agora**. No Android, no app web, num computador e no Sailfish OS.

1. Toque em **Definir a senha de pânico**, digite-a duas vezes (pelo menos 4 caracteres) e toque em **Salvar**. Ela
   precisa ser diferente de todas as senhas dos seus espaços: o Erevos recusa uma que abra um espaço, e a senha de
   nenhum espaço poderá se tornar ela depois.
2. Digitada na tela de bloqueio, ela mostra **Senha incorreta**, como qualquer senha errada, e o Erevos apaga tudo na
   hora. No Android, o Erevos depois se fecha e da próxima vez abre como recém-instalado, e os backups automáticos na
   pasta deles também são apagados quando **Também os backups automáticos em** está ligado em **Por um app de
   pânico**; em outros lugares eles ficam.
3. **Desativar a senha de pânico** faz dela de novo só uma senha errada. Defini-la de novo substitui a anterior.
   Desativar o bloqueio com senha também a desativa.

- **Nada a mostra:** o Erevos guarda um lugar para uma senha de pânico desde a primeira vez que inicia, aleatório até
  que uma seja definida e com a mesma forma depois, e o confere com toda senha digitada na tela de bloqueio, do mesmo
  jeito e pelo mesmo tempo. Então nem o que o celular guarda nem o tempo de uma conferência mostram se há uma
  definida, e esta tela também não pode dizer: se você não tem certeza, defina-a de novo.
- **Só na tela de bloqueio:** digitada em qualquer outro lugar onde o Erevos pede uma senha, ela é só uma senha
  errada. Os backups a guardam como estava quando foram feitos. Enquanto tentativas erradas fazem a tela
  de bloqueio esperar (veja [Bloqueio com senha](#lock)), ela também espera.

**Por quê:** alguém pode obrigar você a abrir o Erevos. Com uma senha de pânico você pode parecer dar a sua, e o que a
pessoa veria já sumiu antes de a tela mudar.

## Apagar-me de todos os lugares {#forget}

Quando você quiser que sumam os dados que os servidores guardam sobre você, em **Configurações** → **Privacidade e segurança**
→ **Apagar-me de todos os lugares**: toque em **Apagar-me de todos os lugares** e diga sim duas vezes. Seu celular mantém tudo o
que tem; este não é o [Botão de pânico](#panic), que apaga o celular.

- **O que some:** cada fila que este espaço tem nos relays, com as mensagens que esperam nela: a sua, a que seu link de contato
  nomeia, as dos seus grupos, as dos seus contatos, a do seu relay de casa, {+as dos avisos do Matrix e do XMPP, }as portas dos seus
  grupos públicos e as dos seus dispositivos vinculados. Também as mensagens que um relay guarda para enviar depois, os arquivos
  que chegaram e esperam nele, e os convites que você fez e ninguém usou. As conversas ocultas que recebem mesmo fechadas vão com
  o espaço; as outras quando você as abrir com o espaço parado. As listas da tela deixam de fora as conversas ocultas, para nunca
  mostrar que existem. O Erevos também pede a cada relay do Nostr que esqueça as chaves em que suas conversas leem (um
  pedido para desaparecer, NIP-62): pelo Tor quando o Tor está ativado, direto quando está desativado. Com o Tor ativado
  mas ainda não pronto, o Nostr não é consultado; espere até estar e apague de novo.
- [+] **Matrix, XMPP, Nostr:** com **Sair também do Matrix e do XMPP e apagar a conta Nostr criada aqui**, essas contas saem daqui.
  As contas continuam nos servidores delas, que são delas, não do Erevos. Uma conta Nostr que você trouxe de outro app fica como está.
- **O espaço fica parado:** não recebe nem envia nada, para que nenhuma fila seja refeita logo em seguida (o Erevos refaz sozinho
  uma fila perdida). **Iniciar de novo** encerra isso: filas novas são criadas, como quando um relay as perdeu, e seus contatos são
  avisados em silêncio. Dê a eles também um novo link de contato, porque os antigos nomeiam filas que não existem mais.
- **O que não alcança:** os celulares dos seus contatos, relays do Nostr que não fazem o que lhes é pedido{- e}{+,} arquivos que você
  enviou por um servidor de arquivos{+ e os servidores Matrix e XMPP}. A tela lista o que foi apagado, o que já não existia e o que
  não foi alcançado; **Apagar de novo** tenta o resto.

**Por quê:** um relay, mesmo de confiança, é um lugar que guarda algo sobre você. Este é o único toque que leva tudo de volta sem
apagar o celular, para quando você deixa um relay ou fecha um capítulo da vida.

## Conversas importadas {#import}

As suas conversas antigas do Telegram e do WhatsApp podem vir para o Erevos, para leitura, com as fotos, vídeos,
mensagens de voz e arquivos delas, e as do Viber com as palavras. Elas ficam neste celular, seladas no espaço para onde
você as traz, e não vão para ninguém, a não ser que você compartilhe uma com a pessoa com quem ela foi (abaixo).

Primeiro exporte a conversa do outro app:

- **WhatsApp:** abra a conversa, depois **Mais**, **Exportar conversa**, **Anexar mídia**, e salve o .zip no
  celular. **Sem mídia** traz só as palavras.
- **Telegram Desktop:** **Exportar histórico do chat**, formato **JSON**, com as fotos, vídeos, mensagens de voz e
  arquivos que você quiser. Depois faça um .zip da pasta que ele criou (no Windows: clique com o botão direito nela,
  **Enviar para**, **Pasta compactada (zipada)**) e copie o .zip para o celular. **result.json** sozinho traz só as
  palavras.
- **Viber:** o próprio Viber não exporta conversas. No Android, o app **Backup Text for Viber** salva uma como
  arquivo .html: copie-o para o celular. Só as palavras vêm, com os emoticons do Viber como emoji. As suas próprias
  mensagens ali não têm nome, então vêm como **Eu**, já escolhido como você. Mensagens de um dia antes de o Viber
  existir, como 1970, são de um celular cujo relógio estava errado: elas vêm sem hora.

Depois:

1. No Erevos, abra **Configurações** → **Dados e dispositivos** → **Conversas importadas** e toque em **Importar um
   arquivo**, depois escolha o arquivo.
2. O Erevos diz o que encontrou, com quantas fotos e arquivos e o tamanho deles juntos. Toque no seu próprio nome,
   para que as suas mensagens apareçam à direita, e toque em **Guardar**. Os arquivos chegam um depois do outro, e ele
   diz quantos e que parte deles já chegou. **Cancelar** interrompe então, e não guarda nenhum deles.
3. Apague você mesmo o arquivo exportado do celular: o Erevos guarda uma cópia selada própria, mas o arquivo que você
   salvou não é selado.

Para continuar a conversa no Erevos, a outra pessoa também precisa do Erevos:

1. Com **Nova conversa**, adicione-a como contato pelo relay, como em [Conversar por um relay](#relay).
2. Abra a conversa importada, toque em **Continuar no Erevos** e escolha a pessoa.
3. A conversa dela agora mostra as mensagens antigas antes das novas, como se sempre tivessem estado no Erevos: em
   balões, por dia, com os horários, e **Continua no Erevos** entre elas e as novas. **Abrir a conversa** leva você
   até lá, e um contato que você não nomeou recebe o nome da conversa importada.

**De dentro da conversa:** a conversa de um contato tem **Conversas importadas** nos **Detalhes** dela, acima de
**Privacidade**. **Importar uma conversa aqui** traz um arquivo direto para essa conversa, sem passar pelas
**Configurações**: quando o arquivo contém várias conversas, como uma exportação do Telegram de todas elas, ele
pergunta qual continua aqui, e sugere a mais longa. Cada conversa importada que continua ali é listada com três
botões:

- **Só na conversa** a tira de **Configurações** → **Dados e dispositivos** → **Conversas importadas**: ela só
  aparece naquela conversa, como se sempre tivesse estado ali. Uma conversa trazida pelos detalhes da conversa fica
  assim desde o início. **Mostrar também em Conversas importadas** a põe de volta na lista, e a própria lista também,
  quando aquele contato não existe mais.
- **Desvincular** faz com que ela pare de aparecer na conversa; ela fica em **Conversas importadas**, para ler ou
  para continuar com outra pessoa.
- **Apagar** a apaga do celular, com as fotos e os arquivos dela, depois de perguntar.

**Por quê:** uma conversa antiga pertence à pessoa com quem ela foi, então ela é trazida, guardada e apagada onde você
fala com essa pessoa, e a lista nas **Configurações** guarda só o que não tem outro lugar para ir. Nada dela sai do
celular, a não ser que você a compartilhe.

- **Fotos, vídeos, mensagens de voz e arquivos** vêm de um .zip, cada um selado neste espaço como um arquivo numa
  conversa. As fotos aparecem na conversa conforme você rola até elas, e as figurinhas como figurinhas; toque numa
  foto ou num arquivo para vê-lo sozinho e **Salvar**. Mensagens de voz e músicas tocam ali mesmo na conversa com um
  toque; um vídeo toca no próprio app do celular depois de salvo. Segure uma mensagem importada para **Copiar** ou
  **Abrir** o arquivo dela. **Buscar nesta conversa** também encontra as mensagens importadas. Arquivos com mais de
  4 GB, e os que a exportação não contém, ficam para trás, e a conversa diz onde havia um.
- **Espaço no celular:** enquanto um .zip chega, o celular precisa de cerca do dobro do tamanho dele livre, pois o
  Erevos lê uma cópia dele e guarda os arquivos selados. Os arquivos importados também estão nos backups, como os
  outros arquivos.
- **Só para ler:** as mensagens importadas não são enviadas como mensagens, então o outro celular só as tem se você
  compartilhar a conversa com ele. O Erevos não tem como mostrar quem realmente as escreveu.
- **Avisos e chamadas** do outro app ficam de fora, e a conversa diz quantos.
- **Nas conversas ocultas** também: nos **Detalhes** de uma conversa oculta, **Importar uma conversa aqui** guarda a
  conversa com aquela posição, criptografada com a chave dela, e a mostra só naquela conversa, nunca em
  **Configurações** → **Dados e dispositivos** → **Conversas importadas**; ali ela só pode ser apagada. Uma conversa
  movida para as conversas ocultas leva junto as conversas importadas nela, guardadas só nela ali, e as traz de volta
  se voltar.
- **Apagar mensagens** numa conversa deixa as importadas: apague-as nos **Detalhes** da conversa, em **Conversas
  importadas**, ou em **Configurações** → **Dados e dispositivos** → **Conversas importadas**.

**Compartilhe com essa pessoa:** a pessoa com quem uma conversa importada continua também pode tê-la. Nos **Detalhes**
da conversa com ela, em **Conversas importadas**, toque em **Compartilhar com** e o nome dela; em **Configurações** →
**Dados e dispositivos** → **Conversas importadas**, uma conversa que continua com alguém tem o mesmo botão, que abre a
conversa com essa pessoa. O Erevos diz quantas mensagens e quantos MB vão, e pergunta antes. Depois todas as conversas
importadas com ela vão juntas, seja qual for o tamanho, cada mensagem com cada foto, vídeo, mensagem de voz e arquivo
guardado, só para ela, criptografadas de ponta a ponta pelo seu relay, e a conversa diz que você a compartilhou.

- **Do lado dela** não há nada a fazer: o {=Erevos} dela guarda as mensagens na hora, diz na conversa quem as compartilhou,
  de onde e quantas, e as mostra antes das novas, só para ler, como uma conversa importada. As fotos e os arquivos vão
  chegando aos poucos, e embaixo dessa linha diz quantos chegaram, **Arquivos: 3 de 10**. Os lados se invertem: o que
  você escreveu aparece como seu, à esquerda dela, e numa conversa a dois o que ela escreveu aparece como dela, à
  direita; num grupo, cada um mantém o nome. Fica só na conversa de vocês lá, e ela pode apagá-la nos **Detalhes** dela.
  Os dispositivos conectados dela guardam só as mensagens.
- **Compartilhada de novo**, ela toma o lugar da cópia que havia, então nunca está lá duas vezes. Uma conversa que
  alguém compartilhou com você não é compartilhada adiante.
- **Só com ela:** só com um contato do Erevos com quem a conversa continua, nunca com um grupo, e não pode ser
  encaminhada. Nas conversas ocultas funciona igual, e do lado dela fica no lugar onde a conversa de vocês está, também
  nas ocultas.
- **Em rodadas:** as fotos e os arquivos vão depois das mensagens, algumas dezenas de MB por vez: cada rodada espera no
  seu relay até o celular dela pegá-la e apagá-la lá, e então vai a próxima. Assim vai uma conversa de qualquer tamanho,
  cada arquivo de até 4 GB, e ela precisa de pouco do espaço do relay, que outros arquivos dividem; quando o relay está
  cheio, o Erevos espera e pede de novo, um pouco mais tarde a cada vez. Continua sempre que os dois celulares estão com
  o Erevos rodando, também depois de um ficar desligado ou offline por um tempo; uma rodada não pega em 12 dias é posta
  de novo no relay antes de expirar. Um arquivo apagado deste celular desde então é citado como um que ficou para trás.
- **Até onde foi** aparece embaixo da sua linha na conversa, **Compartilhando, 40%**. Toque nela para **Parar de
  compartilhar**: o que espera no relay é tirado, e o {=Erevos} dela apaga o que chegou. Se ela apagar as conversas, para
  do mesmo jeito.
- **De um relay do qual o Erevos deles não pega sozinho**, as conversas esperam do lado deles um toque na linha; então
  ela diz até onde chegaram, **Chegando, 40%**, e a sua linha diz **Compartilhando · o telefone de lá está recebendo**. Se
  não deu para pegar, os dois celulares dizem e o deles vibra duas vezes: eles tocam para tentar de novo. Pegá-las de lá
  sem Tor mostra a esse servidor o endereço de internet deles, e o Erevos avisa antes.
- **Um Erevos anterior** recebe um arquivo no lugar, **Conversa de Telegram.json**, com as mensagens dentro como texto,
  e nenhuma das fotos e dos arquivos.

> O arquivo das conversas importadas cresce com o que você traz, então o tamanho dele diz mais ou menos quanto foi
> importado, mas não para qual espaço.

## Aparência {#appearance}

A **Aparência** segue o Fasouli e o site do LPHL. Fica em **Configurações** → **Aparência**, em partes que abrem
cada uma sozinha: **Estilo e cores** (o acabamento, o vidro, o estilo, o tema, as cores e o texto em áreas coloridas
abaixo, com a **Prévia**), **Papel de parede**, **Mensagens**, e no Android **Ícones do launcher** e **Widget**.

| Configuração | Opções |
| --- | --- |
| **Acabamento** | **Plano**, ou **Glass** como em lphl.nekten.eu. O vidro vem em dois tipos: **Painéis** (cada cartão um painel de vidro sobre o papel de parede) e **Um painel** (cada tela sobre um único painel fosco). |
| **Estilo** | **Classic** (o escuro e dourado do Erevos), **Modernist** (Inter Tight), **Nocturne** (sempre escuro, com as próprias cores), **Neon** (LEDs ciano e magenta que brilham, sobre uma grade que corre até um sol poente), **Matrix** (verde sobre preto em fonte monoespaçada, com código chovendo atrás), **Paper** (azul de caneta-tinteiro sobre creme, numa fonte serifada, sobre linhas pautadas com uma margem vermelha), **Aurora** (violeta sobre quase branco, suave e arredondado, sobre manchas de luz menta, lilás e pêssego), **Material You** (as próprias cores do celular, no Android 12 e posteriores) e **Personalizado** (o seu próprio fundo e destaque). |
| **Tema** | **Sistema**, **Claro** ou **Escuro**. Nocturne, Neon e Matrix são sempre escuros, Paper e Aurora sempre claros, e Personalizado é claro ou escuro conforme o fundo dele. O Material You o segue. |
| **Cores** | As do próprio estilo, uma das doze paletas do LPHL, ou **Minha cor**. Escolher uma paleta num estilo com cores próprias volta ao estilo escolhido antes. |
| **Personalizado** | Com **Personalizado** escolhido: o **fundo** dele (oito claros, oito escuros) e o **destaque** dele. O texto e as superfícies são feitos a partir do fundo, e cada cor é verificada para ser legível sobre ele. |
| **Texto em áreas coloridas** | **Branco**, **Como a paleta**, ou **Minha cor**. |
| **Tipo de letra** | As letras de todo texto: **A do estilo**, **A do telefone**, **Com serifa** (pequenos traços nas pontas das letras, como nos livros) ou **Monoespaçada** (cada letra com a mesma largura, como numa máquina de escrever). |
| **Papel de parede** | O que fica atrás de cada tela: **Como o estilo** (a cena ou o brilho próprio do estilo), **Liso**, ou um padrão desenhado de leve na cor de destaque: **Pontos**, **Grade**, **Listras**, **Estrelas**, **Luzes** (círculos suaves de luz) ou **Degradê**; ou **Foto**, uma foto sua, reduzida, redesenhada e selada, sob um véu para o texto ser legível (**Trocar foto** escolhe outra). A tela da senha mostra a do próprio estilo no lugar. |
| **Mensagens** | Como uma conversa desenha as mensagens: balões em formato **Arredondado** ou **Quadrado**, ou **Linha**, sem balão mas com uma linha ao lado do texto, como um registro. |
| **Tamanho do texto** | Qual o tamanho do texto das mensagens: **Pequeno**, **Normal**, **Grande** ou **Maior**. O resto da tela continua como está. |

O Erevos recém-instalado começa com **Glass** (**Painéis**), **Modernist**, **Sistema**, **Minha cor** em azul-céu, texto **Como a paleta**, letra **A do telefone** e mensagens **Quadrado**. Uma aparência escolhida antes fica como estava.

Neon, Matrix, Paper e Aurora desenham a própria cena atrás de cada tela, o Personalizado mantém o fundo que você
escolheu e o Material You as cores do celular, por isso o **Glass** fica em espera enquanto eles estão escolhidos. A
chuva fica parada quando o celular está configurado para reduzir movimento.

A **Prévia** mostra algumas mensagens e botões no visual que você escolheu. Cada combinação é verificada para que o
texto seja sempre bem legível, também sobre o vidro.

- **Cada espaço guarda a sua própria aparência.**
- **A tela da senha** mostra a aparência usada por último. Para isso ela fica guardada fora dos dados selados: não
  diz nada sobre as suas conversas, mas quem abre o celular vê que aparência você usa.
- **Material You** usa as cores que o Android faz a partir do seu papel de parede (Android 12 e posteriores), claras
  ou escuras como diz o **Tema**, com botões redondos e cartões com cantos suavemente arredondados, na fonte do
  próprio celular. Um papel de parede novo também as muda no Erevos, assim que ele aparece de novo. Elas são lidas no
  celular e não vão para lugar nenhum. Em Androids mais antigos e num computador ele não é oferecido.
- **Ícones do launcher** (Android): a cor de cada um dos ícones do Erevos entre os apps do celular, **Erevos**
  (vermelho, abre as conversas do Erevos, ou a conversa que você deixou aberta){~, **Telefone** (verde, abre o teclado),
  **SMS** (azul, abre a lista de SMS)} e **Contatos** (violeta): vermelho, laranja, verde, azul, violeta ou escuro.
  Cada toque abre o que o ícone dele nomeia, também quando o Erevos mostrava outro deles. A cor é do celular, não de
  cada espaço, pois os ícones aparecem antes de o Erevos ser desbloqueado. Depois de uma mudança, alguns launchers
  tiram o ícone da tela inicial: adicione-o de novo pela lista de apps.
- **Pontos e números nos ícones** (Android): o Android dá o ponto ou o número de uma notificação ao app, não a um dos
  ícones dele, então na maioria dos launchers, como os dos Pixel e do GrapheneOS, o da Samsung, o da Xiaomi e o
  Kvaesitso, cada notificação do Erevos (uma mensagem, {~um SMS, |}uma chamada, um aniversário) aparece igual nos ícones
  Erevos{~, Telefone, SMS e| e} Contatos; ali o Erevos não pode mudar isso. Para deixar o ponto só em algumas notificações,
  desative-o para as outras nas configurações do Android para as notificações do Erevos, onde cada tipo de notificação
  tem sua própria chave. Os launchers da Huawei e da Honor aceitam um número para cada ícone: ali, com
  **Configurações** → **Notificações** → **Número no ícone** → **Mostrar o número**, o próprio ícone do Erevos mostra
  as mensagens que a notificação dele conta, {~o do SMS os SMS não lidos, o do Telefone as chamadas perdidas e |}o dos
  Contatos um aniversário de hoje, cada número só no seu ícone.
- **Calculadora no lugar do Erevos** (Android, em **Ícones do launcher**): uma calculadora que funciona aparece entre
  os apps do celular em vez do ícone do Erevos. Toque em **Pôr a calculadora no lugar dele**, digite duas vezes um
  código de 4 a 12 dígitos e toque em **Salvar**. Daí em diante, abra a calculadora, digite o código e depois **=**: o
  Erevos abre, pedindo a senha dele como sempre. Qualquer outra conta é só uma conta. **Mudar o código** o muda;
  **Mostrar de novo o ícone do Erevos** traz o ícone de volta, na cor dele, e esquece o código. Só o ícone fica
  escondido: a lista de apps do Android, os avisos, os apps recentes e {~os ícones Telefone, SMS e Contatos continuam|o ícone Contatos continua}
  mostrando o Erevos. O celular guarda só um hash do código: é uma porta, não a fechadura. Depois que o Erevos é
  apagado, pela senha de pânico ou pelo **Limpar armazenamento** do Android, nenhum código o abre mais: a calculadora
  então abre o Erevos, como novo, e o ícone do próprio Erevos volta ao lugar dela.

  **Por quê:** quem der uma olhada no celular vê uma calculadora, não um mensageiro; a senha continua guardando o que
  há dentro.
- **Widget** (Android): a ordem dos {~quatro|dois} botões do widget, da esquerda para a direita, com o widget desenhado como
  vai ficar. Toque em ↑ ou ↓ para mover um botão; **Ordem inicial** os põe de volta.
- **Vibrar ao tocar** (Android): uma vibração curta ao tocar numa tecla do teclado, em Enviar, Enter ou num interruptor, e quando se abre um menu; nunca ao deslizar. Ligada, a menos que você a desligue aqui. É do telefone, igual em cada espaço.

## Num computador {#desktop}

O Erevos também roda num computador, Linux, macOS ou Windows, como um app próprio. Ele conversa por um relay,
criptografado de ponta a ponta como no celular, e guarda os contatos, as mensagens e as configurações dele selados do
mesmo jeito.

1. Instale-o. No Linux: o pacote para sistemas baseados em Arch (\`erevos-linux-x86_64.pacman\`, com
   \`sudo pacman -U\`) ou o AppImage. Num Mac: abra a imagem de disco e arraste o Erevos para Aplicativos. Ele não tem
   assinatura paga da Apple, então na primeira vez permita-o em
   **Ajustes do Sistema → Privacidade e Segurança → Abrir Mesmo Assim**. No Windows 10 ou 11: rode
   \`erevos-windows-x64-setup.exe\`, que instala o Erevos só para você, sem administrador, e o põe no menu Iniciar; ou
   guarde \`erevos-windows-x64-portable.exe\` onde quiser e rode-o, sem nada instalado. Nenhum dos dois tem assinatura
   paga, então na primeira vez o Windows diz que protegeu o seu computador: toque em **Mais informações**, depois em
   **Executar assim mesmo**.
2. Defina o relay e adicione contatos como no celular, veja [Conversar por um relay](#relay). **Copiar meu link de
   contato** copia o seu link, para colar onde ele deve ir.

- **O que só o celular faz:** Bluetooth, Wi-Fi Aware e LoRa, e os testes deles. Os contatos na mesma rede Wi-Fi ele
  alcança como um celular, veja [Conversar com um celular por perto](#nearby). O resto é igual: espaços e a segunda
  senha, conversas ocultas, mensagens de voz, conversas importadas e backups.
- **Onde ele guarda as coisas:** numa pasta própria (no Linux \`~/.config/Erevos\`, num Mac
  \`~/Library/Application Support/Erevos\`, no Windows \`%APPDATA%\\Erevos\`), selado como no celular. O keystore dele
  é selado com o chaveiro do sistema (num Mac o Keychain, no Windows a chave da sua conta do Windows). Num sistema
  Linux sem chaveiro (KWallet ou GNOME Keyring), ou com um que o Erevos não encontra, o Erevos abre com uma nota e não
  guarda nada: inicie o chaveiro, ou passe ao Erevos \`--password-store=gnome-libsecret\`. Iniciado com
  \`--plain-secrets\`, ele guarda o keystore ali como está, legível pelo seu usuário: então defina um bloqueio com
  senha. O app portátil do Windows guarda as coisas dele na mesma pasta que o instalado, e desinstalar as deixa ali.

**Por quê:** sem chaveiro, o keystore ficaria no disco como está, legível pelo seu usuário, então o Erevos não guarda
nada ali a menos que você escolha isso com \`--plain-secrets\`: nenhum slot de senha fica ali sem selo por surpresa.

- **O firewall do Windows** pergunta, na primeira vez que o Erevos abre, se ele pode usar a rede. Permita nas redes
  privadas, ou celulares e computadores na mesma rede Wi-Fi não conseguem alcançá-lo; os relays funcionam de qualquer
  jeito.
- **As mensagens de voz** gravadas num computador são Opus, num celular AAC. As duas tocam nos dois.
- **As fotos** vêm dos arquivos do computador; não há câmera. **Salvar** pergunta onde pôr uma foto ou um arquivo.
- **Um computador e um celular podem compartilhar uma conta:** conecte o computador ao celular, e os dois têm as
  mesmas conversas e contatos, veja [Dispositivos conectados](#devices). Ou um backup move tudo de um para o outro,
  veja [Backups](#backup), e a partir daí use só um deles.
- **Em segundo plano:** fechar a janela dele deixa o Erevos rodando na bandeja do sistema (num Mac, no Dock), a menos
  que você desligue: **Configurações** → **Notificações** → **Em segundo plano** → **Sair ao fechar**. Ele continua
  esperando no relay: uma chamada toca, com um toque próprio, e traz a janela de volta, e uma notificação diz quantas
  mensagens não foram lidas, nunca de quem nem o quê, até o Erevos aparecer de novo. Você o abre pelo ícone dele na
  bandeja, ou iniciando o Erevos de novo, e sai pelo menu desse ícone (num Mac, pelo menu dele). Onde a área de trabalho
  não mostra bandeja, como o GNOME sem uma extensão para isso, iniciar o Erevos de novo traz a janela de volta. Depois
  de sair, ele não recebe nada: as mensagens esperam no relay, e uma chamada aparece como chamada perdida quando ele
  abrir.
- **As chamadas** tocam enquanto o Erevos está à vista, com um toque próprio: dois toques curtos a cada 3 segundos,
  até a chamada ser atendida ou terminar.
- **Testado até agora** no Linux. As versões para Mac e Windows são compiladas e abertas nos computadores do GitHub,
  ainda não por uma pessoa.

## Dispositivos conectados {#devices}

A mesma conta no celular e num computador, ou num navegador: as mesmas conversas, contatos e mensagens nos dois. O
celular continua sendo a conta: só ele adiciona contatos, e conecta e desconecta dispositivos. Cada dispositivo
conectado tem chaves próprias, que o celular assina numa lista dos dispositivos da conta e entrega aos contatos dele.
Os contatos nesta versão então escrevem também para cada dispositivo, criptografado de ponta a ponta, e assim ele
recebe as mensagens deles com o celular desligado; para os que estão em versões mais antigas, o celular repassa ao
computador o que chega, e sela para eles o que o computador escreve. Os contatos veem a mesma conta e o mesmo número
de segurança, seja qual for a versão do Erevos que tenham.

**Por quê:** cada dispositivo tem chaves próprias, nunca uma cópia das da conta: o Erevos não tem servidor que pudesse
cortar um dispositivo perdido, então um dispositivo nunca é mais do que uma entrada numa lista que o celular assina, e
desconectá-lo basta. A lista sempre tem quatro lugares, e os que nenhum dispositivo ocupa guardam chaves feitas para
nada, então os contatos não conseguem saber quantos dispositivos você tem. E com o celular como a conta, os contatos
em qualquer Erevos mais antigo alcançam você como antes.

Para conectar um computador:

1. No computador, num espaço sem conversas próprias (uma instalação nova, um espaço que uma senha nova abre, ou as
   conversas de um computador conectado restauradas do backup dele), abra **Configurações** → **Dados e
   dispositivos** → **Dispositivos conectados**. Ali, **Conectar ao meu celular** vem primeiro e mostra na hora um
   pequeno código QR: não há nada para digitar.
2. No celular, escaneie o código com a câmera: o Erevos pergunta **Conectar … a este celular?** Escolha o que do
   histórico vai (**Todas**, **Do último mês**, **Da última semana** ou **Nenhuma**) e se vão **Fotos e arquivos
   também**, depois toque em **Conectar**. É só isso: o celular dá ao computador o que ele precisa pelo Nostr,
   criptografado de ponta a ponta, o computador mostra ao celular o próprio código e os códigos de segurança são
   comparados sozinhos, então você não digita nem compara nada.
3. Se o Nostr não puder ser alcançado, ou o computador não puder usar o relay, ele avisa. Ali toque em **Conectar de
   outro jeito**: se ele pedir um relay, o do LPHL já vem preenchido, então toque em **Entrar com LPHL** para um token
   próprio do computador, ou digite outro relay e o token dele. Dê um nome ao dispositivo e toque em **Conectar ao meu
   celular**: ele mostra então um código QR maior. Escaneie-o com o celular, ou copie o código, cole-o no celular em
   **Código do computador** e toque em **Avançar**. O celular mostra o nome do computador e um código de quatro grupos
   de cinco dígitos; escolha como acima e toque em **Conectar**.
4. Só assim o computador mostra também um código: se for o do celular, toque em **São iguais**. Se não, toque em **São
   diferentes**: outra pessoa pode ter lido o código QR dele, e nada foi para ela. As conversas ocultas se conectam só
   assim, por dentro delas, com o código completo.

Então as conversas chegam ao computador, e depois delas as mensagens escolhidas.

- **Mensagens** dos contatos chegam aos dois, e cada um as guarda uma vez: uma que chega de novo dentro de 30 dias
  (até 2000 de um contato) não é guardada de novo, mesmo depois de ter desaparecido ou sido apagada ali. Para isso
  cada um guarda, por 30 dias, quais mensagens chegaram e em que dia, não o que diziam, também depois de terem
  desaparecido ou sido apagadas, e num backup feito nesse meio-tempo; o celular também guarda isso para um contato que
  conectou um dispositivo. O que você escreve no computador vai para um contato nesta versão direto dele, depois que o
  contato escreveu para o computador, e pelo celular nos outros casos: o celular a mostra como sua, e o contato a
  recebe da conta. O que você escreve no celular aparece também no computador. Marcas de leitura, reações, fixações,
  votos, apagar dos dois celulares, nomes, temporizadores, visual e fotos das conversas, aparecer offline e aceitar
  solicitações vão nos dois sentidos. Uma estrela, ou apagar em **Este celular**, feito no celular vai também para o
  computador; feito no computador, fica lá.
- **Com o celular desligado**, os contatos nesta versão ainda alcançam o computador, e o computador a eles: o que eles
  escrevem, leem e aquilo a que reagem chega, e o que você escreve vai. Se o celular fica desligado tanto tempo que a
  fila dele no relay enche (1000 mensagens), o que eles escrevem e leem ainda chega ao computador, uma mensagem de voz
  longa inteira; aquilo a que reagem, o que fixam, votam ou apagam, e as chamadas deles, não passam até o celular estar
  ligado de novo. Para contatos em versões mais antigas (adicioná-los também) e grupos, **o celular precisa estar ligado** e alcançar o relay: o que o computador escreve nesse meio-tempo
  espera no relay, e vai assim que o celular volta. Alguém novo cujo link de contato é desta versão o computador adiciona também com o
  celular desligado: ele mesmo começa a conversa, a pessoa vê sua conta como uma solicitação, e o celular a adiciona
  também assim que liga. Dois ou mais dispositivos conectados também se alcançam direto:
  com o celular desligado, cada um ainda mostra o que os outros escrevem, leem e aquilo a que reagem, e as mudanças que
  fazem nos contatos; um que perdeu a primeira mensagem de outro recebe uma nova um dia ou mais depois. Um computador
  que ficou desligado por mais tempo do que o relay guarda mensagens (14 dias), ou que perdeu a primeira mensagem de
  um contato para ele, ainda recebe o que o contato escreve depois: o {=Erevos} do contato recomeça com ele um dia ou mais
  depois, e então cada vez com menos frequência, até ele responder. Depois que um contato apaga você e o adiciona de
  novo, o computador também recomeça com os dispositivos dele.
- **Fotos e arquivos** que chegam ficam no relay até o celular e o computador os pegarem; então o celular os apaga de
  lá. Um que o computador nunca pega some quando ele é desconectado, ou depois de 14 dias, como qualquer um não pego.
- **Conversa comigo** é igual em cada dispositivo: uma nota, foto, arquivo ou mensagem de voz escrita em um vai para
  os outros, e também um lembrete definido, mudado ou visto e uma nota apagada; de duas mudanças na mesma nota, fica a
  mais recente. O que foi escrito antes de conectar vai uma vez, nos dois sentidos, assim que os dois têm esta versão.
  Um lembrete aparece em cada dispositivo no horário dele, e visto em um sai dos outros. A foto ou o arquivo de uma
  nota vai como cópia no relay, apagada de lá assim que é pega, ou, para dois dispositivos ou mais, deixada lá até
  expirar (14 dias). As notas das conversas ocultas vão só dentro da própria conexão delas, mais abaixo.
- **Configurações:** o idioma, a aparência (o estilo, as cores, o tamanho do texto) e **Visto por último** são os
  mesmos em todos os dispositivos do espaço: mudados em um, mudam também nos outros. Uma foto atrás das telas fica no
  dispositivo onde foi escolhida, assim como tudo o que diz respeito a um só dispositivo: senhas, PINs e o código de
  pânico, o tempo do bloqueio, a vibração, o relay e o Tor,{~ os módulos,} o nome do dispositivo. Um dispositivo que deve
  manter as suas: **Configurações** → **Dados e dispositivos** → **Dispositivos conectados** → **As mesmas
  configurações em todos os dispositivos** desligado. Ligado de novo, pega na hora as dos outros. As conversas ocultas
  mantêm as suas.
- **Pelo Tor para uma conversa:** o interruptor **Pelo Tor** nos **Detalhes** de uma conversa do Erevos é igual em cada
  dispositivo: ativado ou desativado em um, fica assim em todos. Num dispositivo sem Tor, como o app web, essa
  conversa não envia nada enquanto estiver ativado. Um dispositivo com uma versão mais antiga nunca o desativa nos
  outros. Veja [Pelo Tor](#tor).
- **No mesmo Wi-Fi:** o celular e um computador no mesmo Wi-Fi ou hotspot (com **Encontrar Erevos na mesma rede Wi-Fi** ligado)
  passam um ao outro o que muda direto ali, também sem internet; o relay recebe mesmo assim a cópia dele, que então
  não muda mais nada. Só os do espaço: as conexões das conversas ocultas vão pelo relay.
- **Chamadas** tocam no celular e no computador. Atenda em qualquer um: o outro para de tocar, e diz que ela foi
  atendida em outro dispositivo. Recusar uma chamada num deles a recusa nos dois. Com um contato nesta versão, o
  computador liga e recebe chamadas sozinho, com o celular desligado também; com um contato numa versão mais antiga
  ele liga pelo celular, que só precisa ficar ligado para estabelecer a chamada. Nos dois casos a chamada em si vai
  direto entre o computador e o contato, criptografada entre eles.
- **Enviar mais tarde** funciona no computador também. Para um contato nesta versão o computador mesmo entrega a
  mensagem ao relay, com uma cópia para cada dispositivo dele, então ela sai na hora certa com o seu celular desligado
  e chega aos dispositivos dele com o celular dele desligado; para um contato numa versão mais antiga ela vai pelo
  celular. Cada dispositivo seu a mostra como agendada, e apagá-la em qualquer um antes da hora a cancela em todos.
- **Grupos** também estão no computador, com as mensagens, fotos, arquivos e mensagens de voz deles. Escreva neles,
  responda, reaja, vote, fixe, apague as suas para todos, adicione e tire membros, renomeie um ou saia dele, ali como
  no celular: o celular faz isso pelo computador, como se fosse seu. Uma foto ou arquivo que o celular guarda vai para
  o computador como uma cópia no relay, apagada de lá assim que o computador a pegou. O que os membros fazem depois
  com uma mensagem (reagir, votar, fixar, apagá-la para todos) aparece também no computador, assim como uma estrela ou
  apagar em **Este celular** feito no celular. Uma mensagem que o celular não conseguiu enviar ao grupo (um grupo
  fechado nesse meio-tempo, por exemplo) aparece no computador como **Não enviada pelo celular**. Criar um grupo, os
  grupos públicos e as chamadas em grupo ficam no celular por enquanto.
- **Os grupos ficam em** um dispositivo à sua escolha: no celular, em **Configurações** → **Dados e dispositivos** →
  **Dispositivos conectados** → **Os grupos ficam em**, escolha **Este celular** ou um computador conectado. As chaves dos
  grupos vão então para lá, nunca copiadas, então os grupos funcionam lá com o celular desligado, e dá para criar novos
  lá; o celular e os outros dispositivos escrevem neles por meio dele, então ele precisa estar ligado. Os membros não
  veem nada novo: você, como sempre, só que suas mensagens de grupo chegam a outra fila. Para movê-los, os dois precisam
  estar ligados e o relay, e os grupos públicos ficam no celular (saia deles primeiro). Para desconectar esse
  computador, traga primeiro os grupos de volta para o celular. Se ele foi perdido, desconecte-o mesmo assim: os grupos
  aparecem então como abandonados no celular. Um computador com um {=Erevos} mais antigo não pode guardá-los.
- **Conversas ocultas e segundas senhas** nunca vão com a conexão do espaço: cada uma se conecta por conta própria, de
  dentro. Para uma posição de conversas ocultas: no computador, abra essa posição com o PIN dela, nova e vazia como um
  PIN novo a deixa, e dê a ela uma fila própria no relay em **Para usuários avançados** lá; depois toque em
  **Dispositivos conectados** abaixo da lista dela, e em **Conectar ao meu celular**. No celular, abra a mesma posição
  com o PIN dela, toque em **Dispositivos conectados** abaixo da lista dela e escaneie o código do computador com a
  câmera enquanto a posição continua aberta, ou cole lá; depois como acima. Um código mostrado numa posição conecta só
  uma posição, e o de um espaço só um espaço: lido pelo outro, ele simplesmente some, e **Conectar ao meu celular** começa de novo no computador. A
  posição passa a ter uma conexão própria, com chaves próprias e sua própria lista de dispositivos, assinada pela
  própria conta dela, então os contatos dela nesta versão escrevem diretamente para a posição do computador. As
  mensagens, contatos, grupos, chamadas, fotos e arquivos e a Conversa comigo dela vão entre as duas posições como os do
  espaço entre dispositivos conectados{+, e também as próprias contas Matrix, XMPP e Nostr dela, sempre, e de novo quando mudam}. Nada disso aparece no espaço, nas telas dele ou nos dispositivos conectados
  dele, e a conexão do espaço nunca leva nada de uma posição: o que uma posição guarda da conexão dela é criptografado
  com a própria chave dela, entre valores feitos para nada para as outras posições, num arquivo do mesmo tamanho haja
  posição conectada ou nenhuma. A conexão funciona enquanto a posição está aberta, e também fechada se **Receber quando
  fechadas** estiver ativado; fechada sem isso, nada dela se sincroniza, e o que chega espera no relay (14 dias) até ela
  abrir, dos dois lados. No computador, novos grupos e chamadas em grupo ficam no celular, uma conversa não pode ser
  movida para a posição nem para fora dela (mova pelo celular), e uma chamada atendida lá para o toque do celular só
  enquanto a posição está aberta no celular. As conversas ocultas escrevem para os dispositivos de um contato nesta
  versão como as suas outras conversas, então esses as recebem com o celular do contato desligado, e para o contato elas
  parecem as conversas de um celular que nunca conectou um dispositivo. Uma conversa movida para as conversas ocultas no
  celular sai do computador. Movida para as conversas ocultas, ou delas para as suas conversas, uma conversa escreve só
  para o celular do contato, como faz um {=Erevos} mais antigo, até voltar para onde foi criada: o {=Erevos} do contato é
  avisado primeiro, então os dispositivos dele param de escrever para os seus, e ele pode perceber por isso que a
  conversa deixou de saber de dispositivos conectados: se ela lhe deu a lista dos seus dispositivos, que ela foi para as
  conversas ocultas. Um espaço que uma segunda senha abre só conecta de dentro dele, a dispositivos próprios.
- **Trazer as mensagens de novo**, no celular, envia de novo um período do histórico, com as reações, fixações, votos
  e estrelas dele; o que o computador já tem não é guardado duas vezes.
- [+] **Matrix, XMPP e Nostr**: todos os dispositivos conectados as recebem, e elas seguem as mudanças no celular: uma conta da qual se sai lá, ou trocada por outra, sai também dos dispositivos. O computador entra nas
  contas Matrix e XMPP deste espaço e leva a chave das conversas Nostr dele, cada uma como um novo dispositivo
  próprio: o celular fica com o seu. Para um computador já conectado, toque em **Enviar as contas** embaixo dele no
  celular. XMPP e Nostr chegam sozinhos. Um servidor Matrix raramente deixa o celular fazer entrar um novo
  dispositivo: então **Dispositivos conectados** no computador avisa, e **Entrar no Matrix** ali abre o Matrix com o
  ID já preenchido, para a senha dela, uma vez só. As chaves da conta vêm do celular, então não é preciso chave de
  segurança nem verificar por emoji, e as mensagens de antes abrem pelo backup de chaves dela. Um computador que já
  tem uma conta própria em uma delas a mantém, e o que ainda não pôde chegar (por estar offline, por exemplo) é
  tentado de novo toda vez que ele abre. Depois de desconectado, o computador sai das contas que trouxe. Uma posição
  de conversas ocultas conectada por conta própria dá as próprias contas do mesmo jeito, pelos próprios **Dispositivos
  conectados**, para a mesma posição no computador: nunca as do espaço, e as do espaço nunca vão para ela. Cada
  dispositivo entra como ele mesmo, nunca com uma cópia das chaves do celular, que seria usada duas vezes e quebraria
  a criptografia; assim cada um pode ser desconectado sozinho, a partir dos dispositivos da conta.
- [~] **SMS**: os SMS do celular podem aparecer também nos dispositivos, e ser respondidos de lá pelo celular, depois de
  ativar em **Configurações** → **Telefone e SMS** → **SMS** → **Também nos meus dispositivos conectados**, veja
  [SMS](#sms).
- **Desvincular**, no celular, desconecta um dispositivo na hora: nada mais vai para ele, e nada que ele envia é
  aceito. Os contatos nesta versão ficam sabendo na próxima vez que o celular alcança o relay: param de escrever para
  ele, e não aceitam mais nada dele. É assim que se desconecta um computador perdido. Se ele estiver ligado, ele é
  avisado, e as conversas da conta saem dele. No computador, **Desconectar este dispositivo** faz o mesmo de lá.
- **Até quatro** dispositivos se conectam a um celular. Um backup não leva as conexões, mas depois de restaurar um em
  outro celular, esse celular pede a cada dispositivo que ainda é seu que se conecte de novo, com um toque em cada um,
  veja [Backups](#backup).

## Num iPhone, pelo navegador {#iphone}

O Erevos não tem app na App Store. Num iPhone ele roda como um app web, adicionado à tela de início pelo Safari, sem
conta Apple. Ele conversa por um relay, criptografado de ponta a ponta como no celular, e guarda os contatos, as
mensagens e as configurações dele selados do mesmo jeito, no armazenamento do Safari para o app.

1. Abra no **Safari** o endereço do servidor do Erevos que você recebeu. O Erevos mostra como adicioná-lo: toque em
   **Compartilhar** (no iOS 26, dentro de **•••**), depois em **Adicionar à Tela de Início**, e então abra o Erevos
   pela tela de início. Precisa do iOS 17 ou posterior.
2. No Erevos, abra **Configurações** → **Privacidade e segurança** → **Este app web** e compare a impressão digital da
   chave de publicação com a que você recebeu junto com o endereço, caractere por caractere. Se for diferente, apague
   o app e avise quem lhe deu o endereço.
3. Defina um bloqueio com senha (no Erevos, **Configurações** → **Privacidade e segurança** → **Bloqueio e segunda
   senha**). Na web é onde ele mais importa: veja abaixo.
4. Defina o relay e adicione contatos como no celular, veja [Conversar por um relay](#relay).

**Como ele verifica a si mesmo.** Um app web é código que o servidor envia, então um servidor invadido, ou obrigado a
isso, poderia enviar código alterado. O Erevos não aceita esse código de confiança:

- Na primeira vez que abre, ele busca o código dele com uma lista de cada arquivo e da impressão digital dele,
  assinada com a chave de publicação, que só a pessoa que faz as versões tem; o servidor não a tem. Ele verifica a
  assinatura e cada arquivo, guarda-os no iPhone, e a partir daí só executa esses. O servidor não pode mudá-los.
- Uma atualização só é aceita se for assinada com a mesma chave e for mais nova que a que está em uso; ela começa na
  próxima vez que o Erevos abre. Uma sem assinatura ou mais antiga é recusada, e o Erevos avisa.
- Quem quiser pode verificar o servidor: \`node pwa/release.mjs verify https://<endereço>\` verifica a assinatura e
  cada arquivo que o servidor entrega, e \`scripts/reproduce-web.sh <versão> https://<endereço>\` compila essa versão de
  novo a partir do código-fonte e verifica se cada arquivo sai igual.

**O que resta.** Estes são limites reais; conheça-os:

- **Na primeira vez** que você o abre, você confia no servidor: é ele que envia a parte que verifica. O passo 2 é
  como você pega um servidor errado.
- **A própria parte que verifica** (o service worker) é buscada de novo pelo Safari pelo menos uma vez por dia, e o
  Safari pode substituí-la sem perguntar ao Erevos. O Erevos então verifica a nova com a versão assinada e avisa você
  (**O Erevos foi adulterado**), mas um servidor que soubesse como poderia passar por essa verificação. Se você vir o
  aviso, não abra mais o Erevos por esse servidor até isso ser explicado. Com um bloqueio com senha, as suas conversas
  continuam seladas.
- **Sem Bluetooth nem conexão por perto**{~, e sem SMS}: o Safari não os permite.
- **Só enquanto está aberto:** o iOS para os apps web em segundo plano, então as mensagens chegam quando você abre o
  Erevos; até lá elas esperam no relay.
- **As chamadas** tocam enquanto o Erevos está aberto, com um toque próprio: dois toques curtos a cada 3 segundos. O
  Safari só deixa tocar depois que você tocou no Erevos desde que ele abriu, e não com o iPhone no silencioso. Com o
  Erevos fechado, uma chamada não toca: só aparece a notificação “Chamada”, se as notificações estiverem ativadas. A
  Apple não permite nada além disso a um app web; para tocar como um telefone seria preciso um app da App Store.
- **As notificações** com o Erevos fechado ficam desativadas a menos que você as ative: no Erevos, **Configurações** →
  **Notificações** → **Notificações com o app fechado** → **Ativar** (iOS 16.4 ou posterior, pela tela de início).
  Quando chegam mensagens, ou toca uma chamada, o seu relay envia um push pela Apple, e o Erevos mostra quantas
  mensagens chegaram desde a última vez que você o abriu (**3 novas mensagens**), ou **Chamada** quando só tocou uma
  chamada, no idioma do app, nada mais. A contagem é criptografada para o seu iPhone: a Apple vê quando chega algo para
  o seu iPhone, e que ele usa o {=Erevos}, nunca o quê nem de quem. Com um relay, ou o {=Erevos} de um remetente, mais antigo
  que a versão 2.0.0, ou com uma mensagem que outros celulares levaram até o relay, não há número: o Erevos mostra
  **Nova mensagem**, ou **Novas mensagens** se chegaram mais, até você abri-lo. Elas são por espaço, nunca para as
  conversas ocultas, e o seu relay precisa estar configurado para enviá-las. Elas chegam também para a fila própria de
  cada contato: o seu relay então tem um endereço de push para todas as filas dos seus contatos, e a Apple recebe um
  push para cada contato que escreveu, com 15 segundos de intervalo, então por uma sequência assim ela pode adivinhar
  quantos escreveram ao mesmo tempo, nunca quem. Com elas, o ícone do Erevos na tela de início também mostra um número:
  as mensagens não lidas do espaço que você tinha aberto, que ficam depois que o Erevos é fechado, e as que chegaram
  depois (o que chegou sem número conta como uma), nunca as de uma conversa oculta. **Configurações** → **Notificações**
  → **Número no ícone** o desliga. As notificações funcionam pelo serviço de push da Apple, pelo do Google (Chrome, e
  Edge no Android, Brave e Opera), pelo da Mozilla (Firefox) e pelo da Microsoft (Edge no Windows): um navegador que use
  outro não pode ativá-las, a não ser que quem cuida do seu relay permita o serviço de push desse navegador. Cada espaço
  que as ativa tem o seu próprio endereço de push, então nenhum relay recebe nunca o de outro espaço, e o endereço não
  liga os seus espaços entre si. Para isso cada um desses espaços tem o seu próprio service worker no navegador: quem
  puder ver as configurações do navegador pode contá-los, e assim quantos espaços têm as notificações ativadas. Uma
  solicitação de mensagem de alguém novo, pelo seu link de contato, pode aparecer só quando o Erevos abrir. O número no
  ícone aparece também num Mac com “Adicionar ao Dock” do Safari, e no app web instalado pelo Chrome ou pelo Edge no
  Windows, macOS ou ChromeOS. Nenhum banner **Nova mensagem** aparece sobre o Erevos enquanto ele está aberto na tela. A
  tela **Notificações com o app fechado** diz quando o navegador ou o celular não as permite e, depois de você
  desativá-las, quando o seu relay ainda não pôde ser avisado e pode ainda enviar uma: o Erevos avisa o relay assim que
  conseguir alcançá-lo. Quando o navegador muda o endereço de push dele, ou o serviço de push o descarta, o Erevos
  entrega ao seu relay o novo por conta própria quando volta à tela.
- **Permissões:** no Erevos, **Configurações** → **Geral** → **Permissões** mostra o que o navegador deixa o Erevos
  fazer: se ele roda pela tela de início, as notificações com o app fechado (necessárias assim que este espaço as
  ativou), o microfone para as chamadas, a câmera para as videochamadas, e se o navegador guarda os dados do Erevos de
  vez. Sem isso, o Safari pode apagar os dados quando o iPhone fica sem espaço, então um backup é a rede de segurança.
  Cada item tem o porquê, e um botão com a pergunta do próprio navegador; onde o navegador não pergunta mais, ele diz
  onde está a configuração (**Ajustes → Notificações → Erevos**, ou **Ajustes → Apps → Safari → Microfone**). Ele só
  lê o que o navegador diz. Um navegador não deixa o Erevos ver a economia de bateria nem o Modo de Pouca Energia,
  então eles não estão ali. Depois de cada nova versão assinada, a tela abre sozinha quando falta algo de que as
  mensagens, as chamadas ou os dados precisam. Em outro navegador (Chrome, Firefox) é igual, com as configurações
  desse navegador.
- **Os backups** são feitos à mão: **Fazer um backup** salva o backup e os arquivos dele pelo menu de compartilhamento (Arquivos,
  iCloud Drive ou outro app). Um navegador só entrega um arquivo depois de um toque, então não há backups automáticos.
- **As mensagens de voz** gravadas num iPhone são AAC; elas tocam em todo lugar.
- **A Apple** faz o Safari e poderia mudá-lo, como com qualquer app num iPhone.

## No Sailfish OS {#sailfish}

Num celular com Sailfish OS, o Erevos é um app próprio: o mesmo app que no navegador, mostrado pelo motor de navegador
do próprio Sailfish dentro de uma janela do Sailfish, com o código dele instalado junto com o app e não buscado de um
servidor. Ele conversa por um relay, criptografado de ponta a ponta como no celular, e guarda os contatos, as
mensagens e as configurações dele selados do mesmo jeito.

1. Permita apps de fora da Jolla Store: **Configurações → Software não confiável → Permitir software não confiável**.
2. Copie \`erevos-sailfish-aarch64.rpm\` para o celular (Downloads) e toque nele em **Arquivos**, depois em
   **Instalar**. Por um terminal (Modo de desenvolvedor) é \`pkcon install-local erevos-sailfish-aarch64.rpm\`.
   Precisa do Sailfish OS 5 na versão de 64 bits (aarch64).
3. Defina um bloqueio com senha (no Erevos, **Configurações** → **Privacidade e segurança** → **Bloqueio e segunda
   senha**). Veja abaixo por que ele importa aqui.
4. Defina o relay e adicione contatos como no celular, veja [Conversar por um relay](#relay).

- **O que só o Android faz:** Bluetooth, Wi-Fi Aware, Wi-Fi Direct{~, LoRa e SMS| e LoRa}. A mesma rede Wi-Fi funciona aqui também,
  como num computador: veja [Conversar com um celular por perto](#nearby). O firewall do Sailfish OS já deixa entrar a
  porta dele, a 47905: só um firewall que você mesmo deixou mais rígido precisa de uma regra para ela. O resto é igual:
  espaços e a segunda senha, conversas ocultas, mensagens de voz, conversas importadas e backups.
- **Onde ele guarda as coisas:** em \`~/.local/share/erevos\` no celular, selado como no celular. O Sailfish não tem
  chaveiro para apps, então o keystore fica guardado ali como está, legível pelo seu usuário, e portanto por qualquer
  app que rode como você: é o bloqueio com senha que o sela.
- **Os backups** vão para \`Documents/Erevos\` no celular, à mão ou todo dia; copie-os de lá para um cartão de memória
  ou outro dispositivo. **Salvar** põe uma foto ou arquivo em Downloads.
- **As chamadas** tocam enquanto o Erevos está à vista, com um toque próprio: dois toques curtos a cada 3 segundos, e
  o celular vibra onde puder, até a chamada ser atendida ou terminar. Uma chamada que chega antes de você tocar no
  Erevos desde que ele abriu pode aparecer sem som.
- **Enquanto está fechado:** com um espaço aberto, um pequeno ajudante do Erevos espera no relay enquanto o Erevos não
  está à vista ou está fechado, e não pega nada. Uma notificação diz só quantas mensagens chegaram, nunca de quem nem
  o quê, e uma chamada toca com o toque do celular, como o perfil dele define, por 45 segundos no máximo; um toque em
  qualquer uma das duas abre o Erevos. As conversas ocultas não dizem nada então. Bloquear o espaço o para, e depois
  de reiniciar o celular ele volta a esperar só quando o Erevos abre o espaço. Como o resto do Erevos aqui, vai
  direto, sem Tor. Cada espera acorda o celular mais ou menos uma vez por minuto, como no Android.
- **Testado até agora** no motor de navegador do Sailfish (Gecko 91) num computador, conversando com um navegador por
  um relay. A mesma rede Wi-Fi foi testada contra a do computador, num computador. Ainda não num celular com Sailfish.

## Atualizações {#updates}

O Erevos só pergunta ao GitHub por atualizações quando você toca no botão, como no Fasouli: uma verificação
regular contaria ao GitHub, todo dia, que este celular ou computador tem o {=Erevos}. No Android ele também avisa quando
sai uma versão nova, sem perguntar ao GitHub, como diz **Aviso quando sai uma versão nova** abaixo. Para atualizar:

1. Abra **Configurações** → **Geral** → **Atualizações** (ou **Procurar atualizações** no fim da primeira tela deste
   guia).
   Ela mostra a versão que você tem, como **Erevos 2.0.0**.
2. Toque em **Procurar atualizações**. O GitHub então vê o endereço de internet deste aparelho, nada mais; no Android
   o servidor do app web também, que guarda a assinatura da atualização feita no computador de versões. Enquanto tudo
   no espaço passa pelo Tor (**Tudo** no Tor), o Erevos não verifica, pois isso contornaria o Tor.
   Com o **Pelo Tor** ligado, nesta tela (desligado a menos que você o ligue), ele pergunta só ao servidor do app web,
   pelo Tor, e não ao GitHub: o GitHub não é consultado e nada vê o endereço. É mais lento e espera enquanto o Tor
   inicia; e funciona também enquanto tudo no espaço passa pelo Tor.
3. Quando há uma versão nova: no Android toque em **Instalar**. Ela é baixada, conferida com a versão publicada (o
   tamanho e o SHA-256 dela), e o instalador do Android abre: toque em **Instalar** ali. O Erevos só a oferece depois
   que o computador de versões, que guarda a chave dele offline, assinou essa compilação e o SHA-256: quem tomasse a
   conta do GitHub sozinho não conseguiria instalar um APK próprio. Até lá ele diz que a versão saiu mas ainda não foi
   assinada. Quando não é possível acessar o servidor do app web, ele diz isso, com o motivo, e quando a assinatura
   ali não confere, diz isso: em ambos os casos nada é instalado. Um download cuja conexão não traz nada durante algum
   tempo recomeça sozinho, do início, três vezes ao todo; depois o Erevos avisa, e nada é instalado. Na primeira vez,
   o Android pede para permitir instalar apps pelo Erevos. Num computador e no Sailfish OS, **Abrir a página de
   download** abre a página de versões: pegue o arquivo que o Erevos indica, o do pacote que você tem, e atualize como
   na tabela abaixo.
   Pelo Tor, uma versão nova é avisada, mas não baixa aqui, pois o pacote dela é maior do que o Tor do Erevos aguenta:
   desligue o **Pelo Tor** por um momento para instalar, ou baixe pela página de versões no Tor Browser.

Uma versão como **4.0.0-rc.1** é uma versão de teste anterior à 4.0.0 (uma versão candidata): instala e atualiza como
qualquer outra, e a 4.0.0 vem depois dela.

### Erevos, Erevos+ ou Erevos Lite, e betas {#update-channel}

No Android, **Atualizações** diz também quais versões são oferecidas a este celular:

- **Próxima atualização**: **Erevos Lite** (as conversas e chamadas do próprio Erevos, nada mais; versões 3.2.x),
  **Erevos** (suas próprias conversas, o Telefone, os SMS e a Coleção; versões 3.0.x) ou **Erevos+** (tudo isso, com
  Telegram, Messenger, Signal, Session, Matrix, XMPP e Nostr; versões 3.1.x). No início está escolhida a que você tem.
  Cada uma é um app à parte, com seus próprios dados, então escolher outra é uma mudança, não uma atualização:
  **Procurar atualizações** a encontra e pergunta **Mudar para o …**. Este Erevos faz então uma cópia de tudo,
  criptografada, aqui no telefone (cada espaço, com seus contatos, mensagens e configurações), e o Android instala o
  outro app ao lado deste, se ele ainda não estiver lá. Abra-o dentro de um dia: ele pergunta se deve trazer suas
  conversas e as pega; nada sai do telefone. Os espaços abrem depois com suas senhas, como após qualquer restauração.
  Os SMS e chamadas do telefone ficam no telefone: torne o novo app o app de SMS e de telefone, se você os usa. Desde
  que a mudança é feita, o app antigo não recebe nem envia nada e só mostra a mudança, para que não fique lá nenhuma
  mensagem que o novo não tenha; **Cancelar a mudança** o abre como antes. Quando o novo a pega, o antigo oferece
  **Apagar tudo aqui** e **Desinstalar**; uma mudança não feita em um dia é apagada, e o app antigo abre como antes.
  Um app novo já configurado também pergunta, e o que ele traz toma o lugar de tudo o que tem. A mudança precisa de
  espaço livre no telefone para uma cópia de tudo: o Erevos avisa antes quando não basta. A versão do F-Droid,
  assinada com outra chave, não pode mudar assim: use os [Backups](#backup).
- **Versões beta**: desativado, só as versões normais são oferecidas. Ativado, as betas também (como
  **7.0.1-beta.1**): saem antes, para teste, e podem ter problemas. Uma beta vem com ele ativado. Desative para sair
  das betas: a próxima versão normal com número de build maior que a beta que você tem é instalada por cima e mantém
  tudo, sem desinstalar.

Do Erevos+ vêm também as redes: o Telegram, o Signal, o Session, o Messenger e o Matrix continuam conectados no novo
app, como estavam (as fotos e arquivos do Telegram são baixados de novo ao abri-los, e a página do Messenger pede o
PIN dela mais uma vez). O Erevos e o Erevos Lite não têm Telegram, Messenger, Signal nem Session: mudar para eles
deixa essas contas no antigo Erevos+, que depois não abre mais nada; então, se você usa o Session, anote primeiro as
13 palavras de recuperação dele.

O Erevos+ precisa do Android 8.0 ou mais recente: num celular mais antigo ele não pode ser escolhido, e o celular fica
no Erevos.

O aviso de nova versão segue a mesma escolha. O computador das versões assina cada edição e suas betas à parte, então
uma nunca é instalada como outra.

### Novidades {#whats-new}

**Configurações** → **Geral** → **Novidades** (também **Novidades** em **Atualizações**) diz em poucas palavras o que
cada versão mudou, a mais nova primeiro, só pelo número dela; a versão que você tem diz **Esta versão**. Cada versão
acrescenta a sua. O CHANGELOG do código-fonte conta cada mudança por inteiro.
Cada versão, lá como aqui, diz primeiro o que muda **Para você**, o que você vê e usa, e depois o que mudou
**Nos bastidores**: correções, velocidade, bateria e segurança por dentro.

### Aviso quando sai uma versão nova {#release-notice}

No Android, uma vez por dia, o Erevos pergunta ao servidor do LPHL, que também roda o relay, se saiu uma versão nova.
Quando saiu, **Erevos** aparece no topo das conversas, fixado, com o ícone dele: **Saiu o Erevos 3.3.0. Toque para ver
o que há de novo e atualizar.**, marcado até você abri-lo, e uma notificação diz também **Saiu o Erevos 3.3.0**. Toque
em qualquer um para ir a **Atualizações**, depois em **Procurar atualizações**. Ele some assim que você tem essa versão.

- **Só quando assinada:** ela só conta depois que o computador de versões assinou tanto a compilação quanto o nome
  dela, a mesma assinatura que deixa **Atualizações** instalá-la. Então ele aparece assim que essa versão pode ser
  instalada, e o servidor sozinho não consegue inventar uma.
- **Só no relay do LPHL:** um espaço só pergunta enquanto usa o relay do LPHL e não manda tudo pelo Tor (**Tudo** no
  Tor): o servidor então não vê nada que já não veja. Um espaço em outro relay, ou sem relay, não pergunta nada; ali
  **Procurar atualizações** avisa você.
  A chave **Pelo Tor** em **Atualizações**, uma só para este aviso e para **Procurar atualizações**, só neste celular,
  faz com que ele pergunte pelo Tor: o servidor então não vê o endereço do celular, e um espaço que manda tudo pelo
  Tor também pergunta. Uma versão nova é avisada, mas só se instala com a chave desligada.
- **Para desativar:** **Configurações** → **Geral** → **Atualizações** → **Avise-me quando sair uma versão nova**.
- Funciona a partir da versão que o tem: a anterior não diz nada. Não na versão do F-Droid, que o F-Droid
  atualiza.

**Por quê:** para que ninguém precise olhar no GitHub, um por um, por cada versão nova, e o GitHub nunca fique sabendo
quais celulares têm o Erevos: o servidor consultado é o mesmo com que o celular já fala, e o que ele diz só vale com a
assinatura do computador de versões, guardada offline.

O resto desta seção é para atualizar à mão.

**Onde estão as versões novas:** na página de versões do Erevos, \`https://github.com/azzinder/erevos-releases/releases\`. A mais nova fica no topo, como **Erevos 2.0.0**, com um arquivo para
cada sistema. As cinco mais novas ficam ali.

**Confira o arquivo** se puder, num computador: cada versão tem \`SHA256SUMS\`, e na pasta com os arquivos baixados
\`sha256sum -c --ignore-missing SHA256SUMS\` deve dizer **OK** para cada um.

**Faça um backup antes** (**Configurações** → **Dados e dispositivos** → **Backups** → **Fazer um backup**), veja
[Backups](#backup). Uma atualização mantém tudo, mas um backup custa um minuto e cobre qualquer surpresa.

| Em | Como atualizar |
| --- | --- |
| **Android** | **Configurações** → **Geral** → **Atualizações** → **Procurar atualizações** → **Instalar**, ou à mão: abra a página de versões no celular, toque em \`erevos-android.apk\`, depois em **Instalar**. Ele se instala por cima do que você tem e mantém tudo. Permita instalar pelo navegador uma vez, quando o Android pedir. |
| **Linux, baseado em Arch** | \`sudo pacman -U erevos-linux-x86_64.pacman\` |
| **Linux, AppImage** | Substitua o \`erevos-linux-x86_64.AppImage\` antigo pelo novo e torne-o executável. |
| **macOS** | Abra \`erevos-macos.dmg\` e arraste o Erevos para Aplicativos, **Substituir**. Depois permita-o de novo em **Ajustes do Sistema → Privacidade e Segurança → Abrir Mesmo Assim**. |
| **Windows, instalado** | Feche o Erevos e rode o novo \`erevos-windows-x64-setup.exe\`: ele se instala por cima do que você tem. O Windows pode avisar de novo: **Mais informações**, depois **Executar assim mesmo**. |
| **Windows, portátil** | Feche o Erevos e ponha o novo \`erevos-windows-x64-portable.exe\` no lugar do antigo. |
| **Sailfish OS** | Toque em \`erevos-sailfish-aarch64.rpm\` em **Arquivos**, depois em **Instalar**, ou \`pkcon install-local erevos-sailfish-aarch64.rpm\`. |
| **iPhone, navegador** | Nada a fazer: o app web pega sozinho uma nova versão assinada quando abre, veja [Num iPhone](#iphone). |

- **Contatos, conversas e configurações ficam** em todo sistema: eles moram na pasta própria do Erevos, não no app.
- **Android, na primeira vez pela página de versões:** um Erevos compilado num computador para testes é assinado com
  outra chave, e o Android se recusa a instalar por cima dele (**App não instalado**). Faça um backup, desinstale o
  {=Erevos}, instale o da página de versões e restaure o backup. Depois disso, cada atualização se instala por cima.
- **O {=Erevos} do F-Droid**, quando estiver lá, é atualizado pelo F-Droid: as **Atualizações** dele mostram a versão e
  dizem isso, sem **Procurar atualizações**. O F-Droid o assina com uma chave própria, então o Android não instala nem
  ele por cima do Erevos da página de versões, nem aquele por cima dele. Para trocar: faça um backup, desinstale o
  {=Erevos}, instale o outro e restaure o backup.
- **Nunca uma mais antiga:** não instale uma versão mais antiga por cima de uma mais nova. Os dados dela podem estar
  numa forma que a mais antiga não consegue ler. Restaure no lugar um backup feito com essa versão mais antiga.
- **Uma versão que não tem o seu sistema** diz isso nas notas: aquela compilação falhou, então pegue a versão anterior.

## O Erevos para um telefone próximo {#give-app}

Sem internet, um telefone Android com o {=Erevos} pode dá-lo a um telefone ao lado, em **Configurações** → **Geral** →
**Dar o Erevos a um telefone próximo** (também em **Atualizações**). Os dois telefones devem estar na mesma Wi-Fi, ou o
outro no hotspot deste: ligue antes o hotspot nas configurações do Android.

1. **No telefone que dá:** toque em **Iniciar**. Aparece um código QR, com o tamanho do pacote, e abaixo os endereços
   para digitar num navegador em vez dele.
2. **Num telefone sem o {=Erevos}:** escaneie o código com a câmera dele. O navegador dele abre uma página, servida pelo
   telefone que dá, com **Baixar o {=Erevos}**: baixe e abra o arquivo, e o Android o instala. Na primeira vez, o Android
   pede para permitir instalar apps desse navegador. A página mostra o SHA-256 do pacote e o do certificado dele: devem
   ser os que o telefone que dá mostra em **Para comparar**.
3. **Num telefone com um {=Erevos} mais antigo:** abra em vez disso **Configurações** → **Geral** → **Atualizações** →
   **De um telefone próximo** e fotografe o código. O Erevos baixa o pacote e abre o instalador do Android só se o
   SHA-256 dele for o do código, se for o Erevos, assinado com o mesmo certificado do Erevos de lá, e mais novo.

- **Por quanto tempo:** o telefone que dá o serve enquanto a tela dele aparece, dez minutos no máximo, e para antes
  com **Parar**. Ele responde só num endereço aleatório que ninguém adivinha, só a telefones da própria rede, e com
  nada além do pacote e da página dele: nenhuma conversa, contato ou configuração vai junto.
- **O que ele não pode conferir por você:** o navegador só baixa. Um telefone com um Erevos alterado mostraria o
  próprio certificado, então quando tiver internet compare o certificado com o do site ou da página de versões do
  Erevos. O próprio Erevos, em **Atualizações**, recusa um pacote assinado de outra forma.
- **Não de uma loja:** um {=Erevos} instalado em partes, como algumas lojas instalam, não pode ser dado inteiro e diz
  isso. O {=Erevos} do F-Droid é assinado pelo F-Droid: pode ir para um telefone sem o {=Erevos}, ou por cima do Erevos do
  F-Droid pelo navegador, mas um Erevos da página de versões o recusa em **Atualizações**, como o Android faria. O
  Erevos do F-Droid não recebe nada em **Atualizações**: o F-Droid o atualiza.
- Só no Android. Qualquer um na mesma rede que veja o código também pode baixar o Erevos; não há mais nada para pegar.

**Por quê:** onde a internet está cortada, ou vigiada, ou um telefone nem chega ao site, o Erevos ainda pode passar de
mão em mão, e o telefone que o recebe pode conferir que é o verdadeiro.

## As telas de teste {#tests}

Duas telas em **Configurações** → **Para testes** servem para testar as conexões, passo a passo.

- **Teste de rádio (Android):** **Permissões** pede ao Android o que o rádio precisa, **Iniciar** e **Parar** ligam e
  desligam o Bluetooth e o Wi-Fi Aware, **Enviar olá** envia uma mensagem de teste simples para o Teste de rádio do
  celular por perto (uma conversa não a mostra), e o **Registro** mostra o que aconteceu.
- **Teste do relay (Wi-Fi):** **Criar fila** cria uma fila num relay e mostra dois IDs. Dê o **ID de remetente** ao
  celular que escreve para você, e guarde o **ID de destinatário** só para você. **Enviar** e **Receber** movem as
  mensagens à mão.

> Com um só celular você ainda pode testar uma conversa pelo relay: as suas conversas e as suas **Conversas ocultas**
> têm cada uma a sua própria fila no relay e as suas próprias chaves. Crie as duas filas no mesmo relay, toque em
> **Compartilhar meu link de contato** numa e copie-o, depois adicione-o na outra, e escreva nos dois sentidos. O link
> próprio de uma conversa é recusado como contato.

## O que está protegido hoje {#privacy}

O Erevos diz claramente o que protege e o que ainda não protege.

| O quê | Hoje | Em breve |
| --- | --- | --- |
| **Conta, número de telefone, e-mail** | Nenhum é necessário. Os contatos são pares de filas de relay de mão única. | |
| **Contatos e os nomes, chaves, configurações de relay e visual deles** | Selados no celular com a chave de cada espaço. | |
| **Mensagens por um relay** | Criptografadas de ponta a ponta: PQXDH com ML-KEM-768 para começar, depois o double ratchet. O relay não consegue lê-las, e depois que os dois celulares receberam uma mensagem um do outro, ele também não consegue distingui-las por conversa: cada uma é selada mais uma vez para o celular a que se destina. Ele vê quais são mensagens que alguém lê, quais são comunicação entre celulares, e quais são chamadas que tocam, como cada uma diz. Ainda não auditado. | Uma auditoria externa. |
| **Mensagens para um celular por perto** | Criptografadas de ponta a ponta, do mesmo jeito que pelo relay. Quem escuta por perto consegue saber que há celulares com o {=Erevos} perto uns dos outros, e quando e quanto eles enviam; na mesma rede Wi-Fi, qualquer um nela também, e pelo Wi-Fi Direct qualquer um que entre na própria rede Wi-Fi dos celulares. Até o celular do seu contato ser conhecido, os outros celulares com o {=Erevos} conectados por perto recebem as suas mensagens curtas, seladas. | |
| **Mensagens levadas por outros celulares** | Seladas duas vezes: de ponta a ponta para o seu contato, e para o relay dele. Um celular que leva uma vê para que relay ela vai, quando, e de que tamanho; não de quem ela é nem para quem. O relay dele vê para que relay ela vai, e esse relay vê o relay de quem a leva, não o celular dele. Guardadas seladas no celular, três dias no máximo: as dos outros num arquivo do celular, cujo tamanho mostra mais ou menos quantas são; as suas no seu espaço, seladas com a chave dele. As conversas ocultas nunca são levadas. | |
| **Mensagens por LoRa** | Criptografadas de ponta a ponta, do mesmo jeito que pelo relay. Qualquer um com um rádio, a quilômetros, consegue saber que o seu envia, quando e quanto, e o sinal dele pode ser rastreado até onde ele está. O Erevos impede o seu rádio de dizer o nome dele e onde está (função Client hidden, GPS desligado, sem posição fixa) a menos que você deixe; ele ainda responde a um rádio que pergunta o nome dele. Todo Erevos na malha recebe as suas mensagens LoRa, seladas. | Definir o nome do rádio pelo Erevos. |
[~] | **Mensagens por SMS, quando nada mais funciona** | Criptografadas de ponta a ponta, como pelo relay, em SMS de dados ocultos. Desativado até você ativar. A operadora vê qual número escreveu para qual, quando e quantos SMS; nunca o que foi escrito. Cada uma custa o que custa um SMS. | |
| **Quem fala com quem** | O relay vê endereços IP, IDs de fila, e quando e quanto. Com um segundo relay, o seu relay nunca vê o seu endereço. De um lugar emprestado no relay de um contato, cada relay para o qual você envia o vê. [Pelo Tor](#tor), depois que você o ativa, com **Mensagens** nenhum relay o vê para o que você escreve, e com **Tudo** também para imagens e arquivos; com pontes, para onde o Tor está bloqueado, a rede só vê uma ponte. O broker e os servidores STUN do Snowflake veem o seu endereço. | O Tor num computador. |
| **A conexão com o relay** | TLS, e dentro dele, assim que a chave do relay é conhecida, um canal para essa chave: o relay prova que a tem a cada conexão, e o token e cada pedido vão criptografados para ela, então alguém no meio com um certificado para o nome do relay não consegue se passar por ele. Um relay que provou a chave dele uma vez nunca mais é acessado sem ela. Um relay mais antigo que este app funciona como antes, e **Como você se conecta agora** diz isso. A primeira chave vem do relay na primeira vez que ele é consultado, ou de um link de contato: quem estiver no meio nessa primeiríssima vez poderia dar uma própria. [A própria chave do relay](#relay). Não auditado. | A chave do nosso relay embutida no app, e nos convites. |
| **Textos pelo Nostr** | Criptografados de ponta a ponta como por um relay, depois embrulhados mais uma vez para uma chave que o seu contato deu só àquela conversa, assinados por uma chave feita só para aquele texto. Os relays Nostr veem quando e de que tamanho, e que uma chave que não nomeia ninguém recebe um texto; o seu celular lê todas as chaves dele numa só conexão, pelo Tor quando o Tor está ativado, então um relay pode saber que elas são lidas juntas, e de onde só com o Tor desativado. O seu relay só os vê como reserva, e um sino para as conversas ocultas. [Pelo Nostr](#nostr). | |
[~] | **SMS** | Um SMS comum é lido pela operadora, como todo SMS. Para um número ligado a um contato do Erevos, ele vai pelo Erevos no lugar. Um convite oculto é mais um SMS curto que a operadora vê. | |
| **Os contatos do celular** | Nos próprios contatos do Android, não selados pelo Erevos, como em todo app de contatos: todo app com permissão para lê-los os vê, e uma conta (Google) pode sincronizá-los. O Erevos não os envia a lugar nenhum. Um arquivo .vcf salvo a partir deles fica fora do Erevos, sem selo.{~ As chamadas e os SMS de um contato são lidos do próprio registro de chamadas e dos SMS do celular só para mostrar o histórico dele, e não ficam guardados em lugar nenhum.} | |
| **Contatos guardados só no Erevos** | Selados com a chave do espaço, ou com a das conversas ocultas para os delas, num arquivo para todos os espaços cujo tamanho mostra mais ou menos quantos há no total, não de quem são; as fotos deles cada uma num arquivo próprio. Nunca nos contatos do Android. Um arquivo .vcf salvo a partir deles, também os das conversas ocultas, fica fora do Erevos, sem criptografia. As chamadas{~ e os SMS} para eles passam pelo celular, e aparecem no registro de chamadas{~ e nos SMS} dele. | |
[~] | **Chamadas telefônicas** | Chamadas telefônicas comuns: a operadora as leva e pode ouvi-las, como em todo app de telefone. O Android guarda o histórico de chamadas, não selado pelo Erevos, como para todo app de telefone; o Erevos o lê, e os favoritos, para mostrá-los, apaga dele só as chamadas que você apaga, e não guarda cópia. O chip escolhido para cada número é selado no espaço; as respostas rápidas, e o que está bloqueado (só prefixos, IDs de grupo e horários, os mesmos para todo espaço), ficam guardados no celular, sem selo. | |
| **Conversas importadas** | Seladas no espaço para o qual foram trazidas, as fotos e os arquivos delas também, cada um nos seus pedaços, como um arquivo de uma conversa. O tamanho do arquivo, e quantos pedaços há, dizem mais ou menos quanto foi importado, não de onde. | As fotos e os arquivos do Viber, e arquivos acima de 4 GB. |
| **Histórico de mensagens** | Guardado no celular, selado no espaço dele, sem limite, em páginas do mesmo tamanho misturadas para todos os espaços. Só o quanto tudo ocupa aparece, não a que espaço pertence. Apagar dos dois celulares, e as mensagens temporárias, dependem do Erevos do outro celular. | |
| **Mensagens por perto** | Abertas só no espaço que tem o contato. Uma para outro espaço espera na memória, seis horas no máximo, até esse espaço abrir. Uma para conversas ocultas só abre enquanto elas estão abertas, ou recebem fechadas, e o espaço nunca fica sabendo que um contato delas está por perto. | |
| **Mensagens de voz** | Criptografadas de ponta a ponta pelo relay ou por perto, em pedaços: o relay, ou quem escuta por perto, consegue saber mais ou menos quanto cada uma dura. Cada som é selado num arquivo próprio; quantos arquivos há, e os tamanhos deles, mostram mais ou menos quantas estão guardadas, não em que espaço. Fora do selo no cache só enquanto toca. | Arquivos de som todos de um mesmo tamanho. |
| **Fotos e arquivos** | Criptografados de ponta a ponta, pelo armazenamento de arquivos do relay, em pedaços de um mesmo tamanho: o relay vê quantos e quando, e assim mais ou menos o tamanho. O seu relay vê o seu endereço, como nas mensagens; o contato os pega pelo próprio relay dele. As fotos perdem o lugar, o celular e a hora, a menos que sejam enviadas como arquivo; um arquivo mantém o que diz por dentro. Selados no celular nos seus pedaços, mostrados a partir da memória. As cópias salvas ficam fora do Erevos. Os backups os incluem, selados com a senha do backup, em arquivos próprios. | |
| **Num computador** | Selado como no celular, na pasta própria do app. O keystore dele é selado com o chaveiro do sistema (no Windows, a chave da sua conta); num sistema Linux sem um, o Erevos não guarda nada a menos que seja iniciado com \`--plain-secrets\`, e então o guarda como está. | |
| **Backups** | Selados com uma senha própria, contêm cada espaço como está selado no celular, com as fotos, os arquivos e as mensagens de voz dele em arquivos próprios ao lado do backup. Os nomes deles dizem que são um backup do Erevos, e a quantidade e o tamanho deles mostram mais ou menos quanto está guardado. Os backups automáticos guardam a senha deles no celular. Vão para um servidor só se você adicionar um: bytes aleatórios com nomes aleatórios, de tamanhos arredondados; o servidor vê sua conta e quando, e seu endereço a não ser que vão pelo Tor. | |
| **Marcas ✓✓ e ✓✓✓** | O celular do contato fica sabendo quando o seu recebeu e leu as mensagens dele, criptografado. Em um grupo que não é público, o celular de quem enviou a mensagem também fica sabendo. O relay, ou quem escuta por perto, vê mais uma mensagem pequena. | Uma opção para não avisar quando você lê. |
| **Impressão digital ou rosto (Android)** | Desativado a menos que seja ativado. Abre só o espaço da primeira senha: a chave dele selada no Android Keystore, utilizável só logo depois de uma verificação forte de impressão digital ou rosto, e descartada quando elas mudam. Alguém que detém você pode usar o seu dedo. | |
| **Avisos (Android)** | Em segundo plano: "Erevos – Ready for calls and messages" (não na tela de bloqueio), "Incoming call" ou "Incoming video call" – "Open Erevos to answer", e "New message" ou quantas chegaram; quando o Android ou a senha o param, "Closed by Android" ou "Locked" – "Open it to receive calls and messages again"; um lembrete, "Reminder" ou quantos; uma versão nova, "Erevos X is out". Nunca quem nem o quê. Num celular bloqueado, o aviso das mensagens diz só "Erevos". As conversas ocultas que podem dizer isso mostram o mesmo aviso, contado com o resto: quem o vê e não encontra nada novo pode adivinhar que há mais. Como app de telefone, o aviso de uma chamada telefônica nomeia quem liga, também sobre a tela de bloqueio, como faz o de todo app de telefone, mas nunca por um nome que só as conversas ocultas conhecem: uma chamada de um dos contatos delas mostra o número. | |
| **Widget{~ e Telefone} (Android)** | O widget, depois de adicionado, mostra quantas {~chamadas perdidas, SMS não lidos e |}mensagens novas há, nunca de quem nem o quê.{~ O Telefone abre sem a senha só se você deixar: então qualquer um com o celular desbloqueado na mão vê as chamadas e os favoritos que o Android guarda, só com os nomes dos contatos do celular.} | |
| **Chamadas** | Criptografadas de ponta a ponta (DTLS-SRTP, com a chave enviada na conversa criptografada). Pelo relay de chamadas, nenhum celular vê o endereço IP do outro; o servidor que o roda vê os dois, quando e por quanto tempo, e quanto passa. Sem relay de chamadas, só na mesma rede Wi-Fi, cada celular vê o endereço do outro. Os relays veem quando uma chamada começa a tocar. | Tocar no app web enquanto fechado. Chamadas por Bluetooth (o walkie-talkie funciona ali). |
| **Conversas em grupo** | Criptografadas de ponta a ponta com MLS (RFC 9420); membros tirados não leem nada depois. A cópia de cada membro é selada à parte, então os relays não conseguem saber quem está num grupo; cada relay ainda vê uma mensagem chegar a uma fila. Os membros veem as chaves e os endereços de relay uns dos outros. Fotos, arquivos e mensagens de voz passam pelo armazenamento de arquivos do relay de quem envia, como para um contato, e ficam ali 14 dias. Não auditado. | |
| **Chamadas em grupo** | Voz e vídeo, criptografados de ponta a ponta entre cada dois celulares na chamada (DTLS-SRTP, com as chaves enviadas na criptografia do grupo). Pelo relay de chamadas, nenhum celular vê o endereço IP de outro; o servidor que o roda vê o de cada celular, quando e por quanto tempo, e quanto passa. Todo membro, na chamada ou não, fica sabendo quem está nela. Os relays veem quando uma começa. | Vídeo com mais de quatro pessoas, por um servidor; mais de oito pessoas. |
| **Grupos públicos** | Como as conversas em grupo, e qualquer um com o link pode pedir para entrar e ler a partir de quando for aceito. Os pedidos chegam ao relay do dono selados para o celular do dono: o relay vê quantos e quando, não de quem. Os membros veem os nomes escolhidos uns dos outros, chaves feitas só para aquele grupo, endereços de relay e IDs de remetente de fila. Não auditado. | |
| **Prévias de links** | Desativadas a menos que sejam ativadas. Então, quando você envia um link, o seu celular busca a página dele direto do site, que vê o seu endereço IP e quando, não para quem é a mensagem. A prévia vai dentro da mensagem criptografada; o celular que a recebe não busca nada. Com o **Pelo Tor** ligado, a página é buscada só pelo Tor e o site não vê o seu endereço IP. Nenhuma enquanto o espaço manda tudo pelo Tor, a menos que o **Pelo Tor** esteja ligado; nas conversas ocultas só com a opção própria da posição delas. | |

## Transparência {#transparency}

O que o servidor por trás do Erevos (lphl.nekten.eu) guarda, e o que já lhe foi pedido. Esta página sai dentro de cada
versão, então é assinada com a versão, como o app.

**Pedidos de autoridades.** Até esta versão: nenhum. Nenhuma autoridade, tribunal ou empresa pediu dados sobre alguém
que usa o {=Erevos}, e ninguém foi solicitado a guardar silêncio sobre um pedido assim. Se este parágrafo um dia sumir,
ou não disser mais "nenhum", tome isso como um sinal. **Por quê:** um pedido que vem com uma ordem de silêncio não
pode ser contado, mas uma frase que deixa de ser escrita pode ser notada. Isso só funciona enquanto ela for renovada:
cada versão a diz de novo.

O que o relay guarda, e por quanto tempo:

| O quê | Por quanto tempo |
| --- | --- |
| **Mensagens que esperam**, criptografadas de ponta a ponta | Até serem pegas, 14 dias no máximo. |
| **Fotos e arquivos**, criptografados, em pedaços | Como as mensagens: até serem pegos, 14 dias no máximo. |
| **Mensagens enviadas para mais tarde**, criptografadas | Até chegar o horário delas. |
| **Filas**, IDs aleatórios sem nome | Até o celular delas ficar 180 dias sem usá-las. |
| **Linhas de acesso**: para cada celular, o SHA-256 do token dele e um nome: letras e números ao acaso para um convidado a partir do Erevos 6.0.0 (antes, o que quem convidou digitou), ou o nome de usuário do LPHL para quem entrou com LPHL | Até a linha ser tirada. |
| **Endereços de push do app web**, para avisos enquanto o app web está fechado | Até serem desativados no app web. |

O que ele não guarda:

- **Nenhuma lista de conexões.** O relay não escreve nenhum registro de quem se conectou nem de quando, e o servidor
  web na frente do relay e do app web não guarda nenhum registro de acesso desde 24 de outubro de 2026. Os erros são
  registrados, e um erro pode citar um endereço.
- **Nenhum contato, nome ou número de telefone.** Ele não tem nenhum para guardar.

O que ele ainda vê enquanto roda: os endereços IP que se conectam, quando as mensagens chegam e saem, e de que tamanho
são, como diz [O que está protegido hoje](#privacy). Durante uma chamada pelo relay de chamadas, os endereços IP dos
celulares nela.

**Cópias.** A pasta do relay tem backup todo dia, com as mensagens que esperam ainda criptografadas de ponta a ponta.
As cópias guardam o que a tabela acima lista, pelo tempo que são mantidas.

**Outros que veem algo:** a empresa de hospedagem (Hetzner), que roda a máquina e a rede dela; o login do LPHL
(Authentik), que vê cada entrada com LPHL; e, para o app web com avisos enquanto fechado, o serviço de push do
navegador (Apple, Google ou Mozilla), que vê que chegou um aviso, nunca o quê.

## Licença {#licence}

**Erevos, by azzinder.** Copyright © 2026 azzinder.

O Erevos é software livre, com a GNU Affero General Public License, versão 3 ou qualquer versão posterior
(AGPL-3.0-or-later): qualquer pessoa pode usá-lo, estudá-lo, compartilhá-lo e alterá-lo. Quem compartilha o Erevos,
alterado ou não, ou roda um Erevos alterado para outros através de uma rede, deve cumprir essa licença e compartilhar
o código-fonte da sua versão com quem a recebe.

### Condições adicionais

Pela seção 7 da licença, estas condições valem também para o Erevos:

- **O nome do autor.** Cópias e versões alteradas mantêm o aviso "Erevos, by azzinder" na parte Sobre o Erevos do app,
  [O que é o Erevos](#about).
- **Uma versão alterada diz isso.** Ela diz claramente que foi alterada, e não se apresenta como o Erevos original.
- **O nome e o logo.** A licença não dá direito ao nome "Erevos" nem ao seu logo: uma versão alterada que é dada a
  outros recebe outro nome.

### Sem garantia

O Erevos é oferecido na esperança de que seja útil, mas **sem nenhuma garantia**: nem mesmo de que possa ser vendido, ou
de que sirva a uma finalidade específica. A licença diz mais.

### Quem o fez

O Erevos é feito com **engenharia agêntica dirigida por pessoas (human-directed agentic engineering)**: azzinder define
o projeto, os limites, o que cada mudança deve fazer e quando está pronta; as ferramentas de IA escrevem, rodam as
verificações e corrigem.

O Erevos é projetado, dirigido e mantido por azzinder, que escolheu as funções dele e como elas funcionam, o modelo de
segurança e a estrutura, o testa em dispositivos reais e decide o que entra em cada versão. Ferramentas de IA foram
usadas amplamente para escrever o código e os textos, sempre por instruções e a partir do projeto de azzinder.

As partes feitas por outros mantêm os seus próprios autores e licenças, veja
[Feito com o código aberto de outros](#about). Os textos completos vêm com o código-fonte do {=Erevos}: \`AUTHORS.md\`,
\`CREDITS.md\` e a pasta \`LICENSES\`. Cada cópia do Erevos traz também o ficheiro \`NOTICES.txt\`, com a licença do Erevos, o \`AUTHORS.md\` e cada pacote de que o Erevos é feito, cada um com o texto da sua licença: dentro da app Android, na pasta das apps de computador e Sailfish, e na app web em \`/NOTICES.txt\`. A própria licença está em
[gnu.org](https://www.gnu.org/licenses/agpl-3.0.html).

**Por quê:** uma licença livre só protege você se você puder lê-la. Ela diz o que você pode fazer com o Erevos, e o que
quem o altera deve a você.

Esta parte também abre em **Configurações** → **Geral** → **Licença**.

## O que vem por aí {#coming}

A criptografia de ponta a ponta já está aqui, pelo relay e pela conexão por perto, e a maior parte do que segue é
construída sobre ela.

- **Mais formas de manter contato:** as pontes do Tor, para onde o Tor está bloqueado, já estão aqui, veja
  [Pelo Tor](#tor). Próximo: o Tor num computador.
  - **Rádios LoRa (Meshtastic):** já estão aqui, veja [Por um rádio LoRa](#lora). Próximo: definir o nome do rádio
    pelo Erevos.
  - [~] **SMS:** o Erevos como app de SMS já está aqui, com fotos MMS, MMS em grupo e dois chips, veja [SMS](#sms).
  - [~] **Telefone:** o Erevos como app de telefone já está aqui, com a própria tela de chamada, veja [Telefone](#phone).
  - **E-mail, códigos QR, USB, NFC:** para quando nada mais passa.
- **Chamadas:** as chamadas de voz e de vídeo já estão aqui, e no Android elas tocam em segundo plano, veja
  [Conversar por um relay](#relay), e também um walkie-talkie que funciona até por Bluetooth.
- **Grupos:** as conversas em grupo, com fotos, arquivos e mensagens de voz, e as chamadas de voz e de vídeo em grupo
  já estão aqui, veja [Conversas em grupo](#groups). Próximo: vídeo com mais de quatro pessoas, por um servidor para o
  qual a chamada passa sozinha, ainda criptografada de ponta a ponta.
- **Trazer as suas conversas:** o Telegram e o WhatsApp já entram, com as fotos e os arquivos deles, e o Viber com as
  palavras, veja [Conversas importadas](#import). Próximo: as fotos e os arquivos do Viber.
- **Mais sistemas:** grupos públicos e chamadas em grupo também nos dispositivos conectados; a conta, as chamadas e os
  grupos dela já estão num computador, veja [Dispositivos conectados](#devices). Linux, macOS e Windows já estão aqui,
  veja [Num computador](#desktop), o iPhone pelo navegador, veja [Num iPhone](#iphone), e o Sailfish OS, veja
  [No Sailfish OS](#sailfish); e os backups também, veja [Backups](#backup).

## Perguntas {#faq}

### Esqueci a minha senha.

Não há como recuperá-la. O Erevos não guarda nada que possa abrir os seus dados sem ela. Só se o desbloqueio com
[impressão digital ou rosto](#lock) estiver ativado ele ainda abre o primeiro espaço: defina uma senha nova ali com
**Alterar senha**.

### Um contato que está perto nunca mostra "Por perto".

- Escreva para ele: os celulares descobrem quem é quem pela primeira mensagem que
  chega por perto. Só contatos são encontrados, então adicionem um ao outro primeiro.
- Mantenha um espaço aberto nos dois celulares: o Erevos na tela, ou em segundo plano com **Em segundo plano** em
  **Receber e tocar**.
- Verifique se o Bluetooth está ligado (e, no Android 12 e anteriores, a localização), e se o Erevos pode encontrar
  dispositivos por perto (configurações do Android → Apps → Erevos → Permissões).
- Aproxime os celulares. Se um deles não tem Wi-Fi Aware, eles se encontram por Bluetooth, que demora mais para
  começar.
- Ou conecte os dois a uma mesma rede Wi-Fi, ou ao hotspot de um celular, com **Encontrar Erevos na mesma rede
  Wi-Fi** ativado. Algumas redes Wi-Fi públicas mantêm os dispositivos nelas separados: ali não tem como funcionar.
  Sem rede Wi-Fi em comum, **Criar uma rede Wi-Fi com celulares por perto** deixa que eles criem uma (Android 10 e
  posteriores); dê a isso até um ou dois minutos.

### Nada chega pelo LoRa.

- Os dois rádios precisam da mesma região e do mesmo primeiro canal (nome e chave) no app Meshtastic, e de estar ao
  alcance um do outro, ou de rádios no meio.
- **Rádio LoRa**, em **Configurações** → **Relay e redes**, deve dizer **Conectado**. Se não disser, feche o app
  Meshtastic: um rádio se conecta a um app de cada vez.
- Só vão textos, e só quando o relay não está acessível e nenhum celular está perto.
- Na UE um rádio só pode enviar uma certa quantidade a cada hora: depois de muitas mensagens, ele espera.

### Um código de contato não foi adicionado.

Um contato em outro relay precisa de um link com a chave desse relay, que os links de um {=Erevos} atualizado têm: a
linha abaixo da conversa nomeia esse relay. Um código de um {=Erevos} mais antigo não tem chaves e é recusado: peça um
novo.

### O relay pode ler as minhas mensagens?

Não. As mensagens por um relay são criptografadas de ponta a ponta, e só os dois celulares têm as chaves. O relay
ainda vê quais filas são usadas, e quando e quanto chega ([Rodar o seu próprio relay](#own-relay)). Compare o número
de segurança, como em [Conversar por um relay](#relay), para ter certeza de que ninguém está no meio. Nada foi auditado
ainda.

### Por que o Erevos não pede o meu número de telefone?

Porque nada precisa dele. Cada contato é um par de filas de relay de mão única, então nenhum servidor tem uma lista de
quem conhece quem.

### Funciona num iPhone ou num computador?

Num computador, sim: Linux, macOS e Windows, veja [Num computador](#desktop).
Num iPhone, sim, pelo navegador, como um app web, veja [Num iPhone](#iphone).
`;
