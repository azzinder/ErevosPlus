// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Spanish of encrypted messages by SMS when nothing else works (lib/sms-way.ts, app/sms-settings.tsx, app/chat.tsx) (i18n/es/index.ts).
export const smsWay: Record<string, string> = {
  "Went by SMS, end-to-end encrypted.": "Enviado por SMS, cifrado de extremo a extremo.",
  "Came by SMS, end-to-end encrypted.": "Llegó por SMS, cifrado de extremo a extremo.",
  "{what} by SMS, end-to-end encrypted, as nothing else could take it. The phone company sees that you wrote to {name}'s number, and when, as with any SMS.": "{what} por SMS, cifrado de extremo a extremo, porque nada más podía llevarlo. La compañía telefónica ve que escribiste al número de {name}, y cuándo, como con cualquier SMS.",
  "It went without the link’s preview, which is too much for SMS.": "Se ha enviado sin la vista previa del enlace, que es demasiado para SMS.",
  "It is too long for SMS.": "Es demasiado largo para SMS.",
  "SMS is on for every contact with a number. Turn it off in Settings → Phone and SMS → SMS.": "Los SMS están activados para todos los contactos con número. Desactívalos en «Ajustes → Teléfono y SMS → SMS».",
  "SMS can be on for {n} contacts one by one at most. Turn it on for all in Settings → Phone and SMS → SMS.": "Los SMS pueden activarse uno a uno para {n} contactos como máximo. Actívalos para todos en «Ajustes → Teléfono y SMS → SMS».",
  "When nothing else can take a text to {name}, it goes by SMS, end-to-end encrypted. Each SMS costs what your plan says, and the phone company sees that you wrote to their number, and when.": "Cuando nada más pueda llevar un texto a {name}, irá por SMS, cifrado de extremo a extremo. Cada SMS cuesta lo que diga tu tarifa, y la compañía telefónica ve que escribiste a su número, y cuándo.",
  "Messages to {name} no longer go by SMS.": "Los mensajes a {name} ya no van por SMS.",
  "Texts go by SMS to their number, end-to-end encrypted, only when the server, Nostr, the phones nearby and LoRa all fail. Each costs SMS, and the phone company sees who wrote to whom, and when. Both phones need Erevos as the SMS app.": "Los textos van por SMS a su número, cifrados de extremo a extremo, solo cuando fallan el servidor, Nostr, los teléfonos cercanos y LoRa. Cada uno cuesta SMS, y la compañía telefónica ve quién escribió a quién, y cuándo. Ambos teléfonos necesitan Erevos como app de SMS.",
  "SMS when nothing else works": "SMS cuando nada más funciona",
  "Texts to Erevos contacts by SMS, encrypted: off unless turned on": "Textos a contactos de Erevos por SMS, cifrados: desactivado salvo que lo actives",
  "When the server, Nostr, the phones nearby and LoRa all fail, a text to an Erevos contact whose number is linked can go by SMS instead, end-to-end encrypted like any Erevos message, as hidden data SMS their SMS app does not show. Off unless you turn it on, here for all such contacts or in a chat's Details for one.": "Cuando fallan el servidor, Nostr, los teléfonos cercanos y LoRa, un texto a un contacto de Erevos con número vinculado puede ir por SMS, cifrado de extremo a extremo como cualquier mensaje de Erevos, en SMS de datos ocultos que su app de SMS no muestra. Desactivado salvo que lo actives, aquí para todos esos contactos o en los Detalles de un chat para uno.",
  "Mind what it costs: each SMS costs what your plan says, a short text takes 3 SMS and a longer one up to 10. And the phone company sees which number wrote to which, and when, as with any SMS; never what was written.": "Ten en cuenta el coste: cada SMS cuesta lo que diga tu tarifa; un texto corto ocupa 3 SMS y uno más largo hasta 10. Y la compañía telefónica ve qué número escribió a cuál, y cuándo, como con cualquier SMS; nunca lo que se escribió.",
  "Only texts and deletes go so, not photos, files, voice messages, marks or calls, nor long texts (about 800 Latin letters at most, or 400 Greek ones), nor anything from hidden chats. Both phones need Erevos as the SMS app.": "Así solo van textos y borrados, no fotos, archivos, mensajes de voz, marcas ni llamadas, ni textos largos (como mucho unas 800 letras latinas o 400 griegas), ni nada de los chats ocultos. Ambos teléfonos necesitan Erevos como app de SMS.",
  "Turn off for all contacts": "Desactivar para todos los contactos",
  "Turn on for all contacts": "Activar para todos los contactos",
  "Erevos is not the SMS app yet, so nothing goes by SMS.": "Erevos aún no es la app de SMS, así que nada va por SMS.",
  "On for {n} contact in their chat's Details.": "Activado para {n} contacto en los Detalles de su chat.",
  "On for {n} contacts in their chats' Details.": "Activado para {n} contactos en los Detalles de sus chats.",
  "Too long for SMS, which takes only short texts. It can go once the server can be reached, or near their phone.": "Demasiado largo para SMS, que solo llevan textos cortos. Puede ir cuando se pueda llegar al servidor, o cerca de su teléfono.",
  "The SMS did not go.": "El SMS no se envió.",
};
