// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of the panic password (app/panic.tsx), the calculator in place of Erevos
// (components/launcher-icons.tsx), starting when the phone turns on (app/security.tsx), and their
// settings (lib/settings.ts) (i18n/pt/index.ts).
export const guard: Record<string, string> = {
  // The panic password.
  "Panic password": "Senha de pânico",
  "Set the panic password": "Definir a senha de pânico",
  "Turn off the panic password": "Desativar a senha de pânico",
  "Panic password set. Typed on the lock screen, it wipes Erevos.": "Senha de pânico definida. Digitada na tela de bloqueio, ela apaga o Erevos.",
  "Typed on the lock screen, it will then be only a wrong password.": "Digitada na tela de bloqueio, ela será então só uma senha errada.",
  "No panic password now.": "Agora não há senha de pânico.",
  "A password of its own that, typed on the lock screen, wipes Erevos as the button above does. The screen then looks as after a wrong password, and checking it takes as long as any other. It must differ from every password of your spaces.":
    "Uma senha própria que, digitada na tela de bloqueio, apaga o Erevos como o botão acima faz. A tela fica então como depois de uma senha errada, e conferi-la leva o mesmo tempo que qualquer outra. Ela precisa ser diferente de todas as senhas dos seus espaços.",
  "Erevos keeps nothing that shows whether one is set, so this screen cannot say either. Setting it again replaces the one before.":
    "O Erevos não guarda nada que mostre se há uma definida, então esta tela também não pode dizer. Defini-la de novo substitui a anterior.",
  "Typed on the lock screen, it wipes everything Erevos keeps here.": "Digitada na tela de bloqueio, apaga tudo o que o Erevos guarda aqui.",
  // Starting when the phone turns on.
  "Start when the phone turns on": "Iniciar quando o celular ligar",
  "Wait until I open it": "Esperar até eu abrir",
  "After the phone turns on, or Erevos is updated, Erevos starts by itself, with no space open: the spaces set to say a message came also while another is open already say \"New message\", never which space, nor who or what. Everything else waits for a password, as Erevos keeps no key on the phone. Meanwhile a quiet notice says \"Locked\". Spaces that go through Tor say nothing until a space is open. With no such space, only a quiet notice says it is locked, and a tap on it opens Erevos.":
    "Depois que o celular liga, ou que o Erevos é atualizado, o Erevos inicia sozinho, sem nenhum espaço aberto: os espaços configurados para avisar que chegou uma mensagem também enquanto outro está aberto já dizem “New message”, nunca qual espaço, nem quem ou o quê. Todo o resto espera uma senha, pois o Erevos não guarda nenhuma chave no celular. Enquanto isso, um aviso discreto diz “Locked”. Os espaços que passam pelo Tor não dizem nada até um espaço ser aberto. Sem nenhum espaço assim, só um aviso discreto diz que está bloqueado, e um toque nele abre o Erevos.",
  "After the phone turns on, Erevos waits until you open it.": "Depois que o celular liga, o Erevos espera até você abri-lo.",
  // The calculator in place of Erevos.
  "Calculator in place of Erevos": "Calculadora no lugar do Erevos",
  "A calculator that works shows among the phone's apps instead of Erevos's icon. Type your code in it, then =, and Erevos opens, asking for its password as always. Only the icon is hidden: Android's list of apps, the notices and the recent apps still say Erevos.":
    "Uma calculadora que funciona aparece entre os apps do celular em vez do ícone do Erevos. Digite nela o seu código, depois =, e o Erevos abre, pedindo a senha dele como sempre. Só o ícone fica escondido: a lista de apps do Android, os avisos e os apps recentes continuam dizendo Erevos.",
  "On: the calculator stands in place of Erevos.": "Ativado: a calculadora está no lugar do Erevos.",
  "Change the code": "Mudar o código",
  "Show Erevos's icon again": "Mostrar de novo o ícone do Erevos",
  "Put the calculator in its place": "Pôr a calculadora no lugar dele",
  "Calculator code": "Código da calculadora",
  "Digits only, 4 to 12 of them. Type them in the calculator, then =.": "Só dígitos, de 4 a 12. Digite-os na calculadora, depois =.",
  "Use digits only, 4 to 12 of them.": "Use só dígitos, de 4 a 12.",
  "The calculator could not be set. Try again.": "Não foi possível configurar a calculadora. Tente de novo.",
  "New code saved.": "Novo código salvo.",
  "Done. Within a few seconds Erevos's icon leaves the phone's apps, and the calculator takes its place: open Erevos from it from now on.":
    "Pronto. Em poucos segundos o ícone do Erevos sai dos apps do celular e a calculadora ocupa o lugar dele: de agora em diante, abra o Erevos por ela.",
  "Erevos's icon is back among the phone's apps.": "O ícone do Erevos voltou para os apps do celular.",
  "Hide Erevos's icon behind a calculator that works": "Esconder o ícone do Erevos atrás de uma calculadora que funciona",
  "Erevos's camera at a tap, behind Erevos's password and the Collection's, as from the Collection. Holding Erevos's icon down also offers Camera. Neither shows while the Collection is off or the calculator stands in place of Erevos.":
    "A câmera do Erevos com um toque, atrás da senha do Erevos e da Coleção, como pela Coleção. Segurando o ícone do Erevos, também aparece Câmera. Nenhum dos dois aparece enquanto a Coleção está desligada ou a calculadora está no lugar do Erevos.",
  "Put the Camera among the phone's apps":
    "Pôr a Câmera entre os apps do celular",
  "Take the Camera off the phone's apps":
    "Tirar a Câmera dos apps do celular",
};
