// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The Portuguese of starting with a server of one's own, or none, and of a web folder of one's own for the models (components/own-server.tsx, components/models-server.tsx, app/chat.tsx, app/first-steps.tsx) (i18n/pt/index.ts).
export const ownServerText: Record<string, string> = {
  "That is not a server address. Type it as you were given it, such as relay.example.org.": "Isso não é um endereço de servidor. Digite como você recebeu, por exemplo relay.example.org.",
  "You are in, with the server at {server}. Now add your contacts: by their invite, or by the contact link or QR code they give you.": "Você entrou, com o servidor {server}. Agora adicione seus contatos: pelo convite deles, ou pelo link de contato ou código QR que eles te derem.",
  "Erevos could not connect to {server}: {error}. Check the address and the code, and that the server is running.": "O Erevos não conseguiu se conectar a {server}: {error}. Confira o endereço e o código, e se o servidor está funcionando.",
  "I have no invite": "Não tenho convite",
  "My account is at another server…": "Minha conta está em outro servidor…",
  "Start without a server": "Começar sem servidor",
  "With an account at a server such as LPHL, with a server of your own, or with no server at all. The next screen says what each one means.": "Com uma conta em um servidor como o LPHL, com um servidor seu, ou sem servidor nenhum. A próxima tela explica o que cada um significa.",
  "That is not a web address. Type the folder as you were given it, such as cloud.example.org/erevos-models.": "Isso não é um endereço web. Digite a pasta como você recebeu, por exemplo cloud.example.org/erevos-models.",
  "Download from another server…": "Baixar de outro servidor…",
  "Back to the usual server": "Voltar ao servidor de sempre",
  "Web folder with the models": "Pasta web com os modelos",
  "A web folder, yours or your group’s, that holds the same files under the same names. Erevos checks every file after the download and refuses one that was changed. That server, not {host}, then sees your IP address.": "Uma pasta web, sua ou do seu grupo, que tem os mesmos arquivos com os mesmos nomes. O Erevos confere cada arquivo depois de baixar e recusa o que foi alterado. Quem vê seu endereço IP então é esse servidor, não {host}.",
  "Where your messages wait": "Onde suas mensagens esperam",
  "A server (Erevos calls it a relay) keeps your messages, encrypted, until the other phone takes them. It cannot read them. Choose how to start: you can change it any time, here.": "Um servidor (o Erevos o chama de relay) guarda suas mensagens, criptografadas, até o outro telefone pegá-las. Ele não consegue lê-las. Escolha como começar: você pode mudar quando quiser, aqui.",
  "If you have neither an account nor a server, start without a server: it needs nothing, and you can add one later.": "Se você não tem conta nem servidor, comece sem servidor: não precisa de nada, e você pode adicionar um depois.",
  "I have a server of my own": "Tenho um servidor meu",
  "Yours, or one of your family, group or workplace. You type its address and the code you were given.": "Seu, ou da sua família, do seu grupo ou do seu trabalho. Você digita o endereço dele e o código que recebeu.",
  "Server address": "Endereço do servidor",
  "Code (if the server has one)": "Código (se o servidor tiver)",
  "Whoever set up the server gives you both; there they are called the relay address and the token. Calls, photos and files then go through that server too. To set one up yourself, see Running your own relay in the user guide.": "Quem montou o servidor te dá os dois; lá eles se chamam endereço do relay e token. Chamadas, fotos e arquivos passam então também por esse servidor. Para montar um você mesmo, veja «Rodar o seu próprio relay» no guia de uso.",
};
