// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of settings that stand apart: Tor bridges, unlocking with a fingerprint, colors, languages (i18n/pt/index.ts).
export const more: Record<string, string> = {
  // Tor bridges (the Tor screen).
  Bridges: 'Pontes',
  'Automatic': 'Automático',
  'straight': 'direto',
  'your own bridges': 'suas próprias pontes',
  'Tor is off for this space: messages go straight to the server.': 'O Tor está desligado neste espaço: as mensagens vão direto para o servidor.',
  'Tor is connected, {how}.': 'O Tor está conectado, {how}.',
  'Tor is connected.': 'O Tor está conectado.',
  'Tor cannot connect from this network. Try Automatic, or bridges of your own.': 'O Tor não consegue se conectar desta rede. Tente Automático, ou pontes próprias.',
  'Erevos tries the ways in turn until Tor connects: straight, then the obfs4 bridges, then Snowflake, then your own bridges, if you have any. It remembers the one that worked on Wi-Fi and on mobile data for 30 days, and tries it first.': 'O Erevos tenta os caminhos um por vez até o Tor conectar: direto, depois as pontes obfs4, depois o Snowflake, depois suas próprias pontes, se tiver. Lembra por 30 dias o que funcionou no Wi-Fi e nos dados móveis, e tenta ele primeiro.',
  'My network is watched': 'Minha rede é vigiada',
  'On, Tor never goes straight: whoever watches the network sees only a bridge, never that Tor is used.': 'Ligado, o Tor nunca vai direto: quem vigia a rede vê só uma ponte, nunca que o Tor é usado.',
  'Trying: {how}…': 'Tentando: {how}…',
  'Connected: {how}.': 'Conectado: {how}.',
  'No way worked from this network. Add bridges of your own, from bridges.torproject.org.': 'Nenhum caminho funcionou desta rede. Adicione pontes próprias, de bridges.torproject.org.',
  'Check my connection': 'Verificar minha conexão',
  'No bridges': 'Sem pontes',
  'My own': 'Minhas',
  'None of these is a bridge Erevos can use, so Tor stays off and messages wait.':
    'Nenhuma destas é uma ponte que o Erevos possa usar, então o Tor fica desligado e as mensagens aguardam.',
  'None of these is a bridge Erevos can use, so Tor stays off and messages go straight.':
    'Nenhuma destas é uma ponte que o Erevos possa usar, então o Tor fica desligado e as mensagens vão direto.',
  'Tor goes straight to its relays. Where Tor is blocked, choose bridges: Tor then reaches its network only through them.':
    'O Tor vai direto aos retransmissores dele. Onde o Tor é bloqueado, escolha pontes: então o Tor só chega à rede dele por meio delas.',
  'The obfs4 bridges Tor Browser comes with: to whoever watches the network, Tor looks like random bytes. Where a censor blocks these too, choose Snowflake or bridges of your own.':
    'As pontes obfs4 que vêm com o Tor Browser: para quem observa a rede, o Tor parece bytes aleatórios. Onde um censor bloqueia essas também, escolha Snowflake ou pontes suas.',
  "Snowflake goes through volunteers' browsers, over WebRTC, the way a video call does. To find one, Erevos asks Snowflake's broker through a CDN, behind another site's name, and STUN servers tell the phone its own address: they see that address, never your messages. Slower, and hard to block.":
    'O Snowflake passa pelos navegadores de voluntários, por WebRTC, como uma videochamada. Para encontrar um, o Erevos consulta o broker do Snowflake por meio de uma CDN, por trás do nome de outro site, e servidores STUN informam ao celular o próprio endereço dele: eles veem esse endereço, nunca as suas mensagens. Mais lento, e difícil de bloquear.',
  'Bridge lines from bridges.torproject.org, from bridges@torproject.org by email, or from @GetBridgesBot on Telegram, one per line. obfs4, Snowflake, WebTunnel, meek and plain bridges work.':
    'Linhas de ponte do bridges.torproject.org, do bridges@torproject.org por e-mail ou do @GetBridgesBot no Telegram, uma por linha. Funcionam pontes obfs4, Snowflake, WebTunnel, meek e simples.',
  'Bridge lines': 'Linhas de ponte',
  'Not a bridge line Erevos can use: {line}': 'Não é uma linha de ponte que o Erevos possa usar: {line}',
  '{n} bridge': '{n} ponte',
  '{n} bridges': '{n} pontes',
  'Use these bridges': 'Usar estas pontes',
  'Not in use until you tap Use these bridges.': 'Fora de uso até você tocar em “Usar estas pontes”.',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages wait. Bridges count only while Tor is on.':
    'Com pontes, o Tor nunca vai direto aos retransmissores dele: quando nenhuma ponte responde, as mensagens aguardam. As pontes só valem enquanto o Tor está ativado.',
  'With bridges, Tor never goes straight to its relays: when no bridge answers, messages go to the server without Tor until one does.':
    'Com pontes, o Tor nunca vai direto aos retransmissores dele: quando nenhuma ponte responde, as mensagens vão ao servidor sem o Tor até uma responder.',

  // Updates on Windows, and on every computer: the file to take.
  'The download page opens: take {file}, see User guide → Updates.': 'A página de download abre: pegue o {file}, veja “Guia de uso → Atualizações”.',

  // Material You: the phone's own colors (Appearance).
  "Material You takes no glass: its colors are the phone's own.": 'O Material You não usa vidro: as cores dele são as do próprio celular.',
  "Your phone's own colors, which Android makes from its wallpaper: a new wallpaper changes them here too.":
    'As cores do seu próprio celular, que o Android cria a partir do papel de parede: um papel de parede novo muda as cores aqui também.',
  "Material You takes the phone's own colors, on Android 12 and later. Here it shows in Classic's.":
    'O Material You usa as cores do próprio celular, no Android 12 ou mais recente. Aqui ele aparece com as do Classic.',

  // Unlocking with a fingerprint or face (Lock, and the password screen).
  'Fingerprint or face': 'Impressão digital ou rosto',
  'On: Erevos opens with your fingerprint or face too. The password always works.':
    'Ativado: o Erevos também abre com a sua impressão digital ou o seu rosto. A senha sempre funciona.',
  'Open Erevos with your fingerprint or face instead of typing the password. The password always works too.':
    'Abra o Erevos com a sua impressão digital ou o seu rosto em vez de digitar a senha. A senha também sempre funciona.',
  'It opens only what your first password opens, never the space of a second password or hidden chats. Someone who holds you can press your finger to the phone: if that may happen, keep it off.':
    'Abre só o que a sua primeira senha abre, nunca o espaço de uma segunda senha nem conversas ocultas. Quem segurar você pode pressionar o seu dedo no celular: se isso puder acontecer, deixe desativado.',
  'Fingerprint or face for Erevos': 'Impressão digital ou rosto para o Erevos',
  'Erevos opens with your fingerprint or face too.': 'O Erevos agora também abre com a sua impressão digital ou o seu rosto.',
  'Unlock Erevos': 'Desbloquear o Erevos',
  'Use password': 'Usar senha',
  'Unlocking with a fingerprint or face stopped working, so it is off now. Type your password, and turn it on again in Lock.':
    'O desbloqueio por impressão digital ou rosto parou de funcionar, então agora está desativado. Digite a sua senha e ative de novo em “Bloqueio”.',
};
