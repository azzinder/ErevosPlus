// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Brazilian Portuguese of encrypted messages by SMS when nothing else works (lib/sms-way.ts, app/sms-settings.tsx, app/chat.tsx) (i18n/pt/index.ts).
export const smsWay: Record<string, string> = {
  "Went by SMS, end-to-end encrypted.": "Foi por SMS, criptografada de ponta a ponta.",
  "Came by SMS, end-to-end encrypted.": "Veio por SMS, criptografada de ponta a ponta.",
  "{what} by SMS, end-to-end encrypted, as nothing else could take it. The phone company sees that you wrote to {name}'s number, and when, as with any SMS.": "{what} por SMS, criptografada de ponta a ponta, porque nada mais conseguia levá-la. A operadora vê que você escreveu para o número de {name}, e quando, como em qualquer SMS.",
  "It went without the link’s preview, which is too much for SMS.": "Foi sem a prévia do link, que é grande demais para SMS.",
  "It is too long for SMS.": "É longa demais para SMS.",
  "SMS is on for every contact with a number. Turn it off in Settings → Phone and SMS → SMS.": "O SMS está ativado para todo contato com número. Desative em “Configurações → Telefone e SMS → SMS”.",
  "SMS can be on for {n} contacts one by one at most. Turn it on for all in Settings → Phone and SMS → SMS.": "O SMS pode ser ativado um a um para no máximo {n} contatos. Ative para todos em “Configurações → Telefone e SMS → SMS”.",
  "When nothing else can take a text to {name}, it goes by SMS, end-to-end encrypted. Each SMS costs what your plan says, and the phone company sees that you wrote to their number, and when.": "Quando nada mais conseguir levar um texto para {name}, ele vai por SMS, criptografado de ponta a ponta. Cada SMS custa o que diz o seu plano, e a operadora vê que você escreveu para o número dele, e quando.",
  "Messages to {name} no longer go by SMS.": "As mensagens para {name} não vão mais por SMS.",
  "Texts go by SMS to their number, end-to-end encrypted, only when the server, Nostr, the phones nearby and LoRa all fail. Each costs SMS, and the phone company sees who wrote to whom, and when. Both phones need Erevos as the SMS app.": "Os textos vão por SMS para o número, criptografados de ponta a ponta, só quando o servidor, o Nostr, os celulares por perto e o LoRa falham todos. Cada um custa SMS, e a operadora vê quem escreveu para quem, e quando. Os dois celulares precisam do Erevos como app de SMS.",
  "SMS when nothing else works": "SMS quando nada mais funciona",
  "Texts to Erevos contacts by SMS, encrypted: off unless turned on": "Textos para contatos do Erevos por SMS, criptografados: desativado até você ativar",
  "When the server, Nostr, the phones nearby and LoRa all fail, a text to an Erevos contact whose number is linked can go by SMS instead, end-to-end encrypted like any Erevos message, as hidden data SMS their SMS app does not show. Off unless you turn it on, here for all such contacts or in a chat's Details for one.": "Quando o servidor, o Nostr, os celulares por perto e o LoRa falham todos, um texto para um contato do Erevos com número vinculado pode ir por SMS, criptografado de ponta a ponta como qualquer mensagem do Erevos, em SMS de dados ocultos que o app de SMS dele não mostra. Desativado até você ativar, aqui para todos esses contatos ou nos Detalhes de uma conversa para um só.",
  "Mind what it costs: each SMS costs what your plan says, a short text takes 3 SMS and a longer one up to 10. And the phone company sees which number wrote to which, and when, as with any SMS; never what was written.": "Atenção ao custo: cada SMS custa o que diz o seu plano; um texto curto ocupa 3 SMS e um mais longo até 10. E a operadora vê qual número escreveu para qual, e quando, como em qualquer SMS; nunca o que foi escrito.",
  "Only texts and deletes go so, not photos, files, voice messages, marks or calls, nor long texts (about 800 Latin letters at most, or 400 Greek ones), nor anything from hidden chats. Both phones need Erevos as the SMS app.": "Assim só vão textos e exclusões, não fotos, arquivos, mensagens de voz, marcas nem chamadas, nem textos longos (no máximo cerca de 800 letras latinas ou 400 gregas), nem nada das conversas ocultas. Os dois celulares precisam do Erevos como app de SMS.",
  "Turn off for all contacts": "Desativar para todos os contatos",
  "Turn on for all contacts": "Ativar para todos os contatos",
  "Erevos is not the SMS app yet, so nothing goes by SMS.": "O Erevos ainda não é o app de SMS, então nada vai por SMS.",
  "On for {n} contact in their chat's Details.": "Ativado para {n} contato nos Detalhes da conversa dele.",
  "On for {n} contacts in their chats' Details.": "Ativado para {n} contatos nos Detalhes das conversas deles.",
  "Too long for SMS, which takes only short texts. It can go once the server can be reached, or near their phone.": "Longa demais para SMS, que só levam textos curtos. Ela pode ir quando o servidor estiver acessível, ou perto do celular da pessoa.",
  "The SMS did not go.": "O SMS não foi.",
};
