// SPDX-FileCopyrightText: 2026 azzinder
// SPDX-License-Identifier: AGPL-3.0-or-later
// Additional terms under AGPL-3.0 section 7 apply: see AUTHORS.md.

// The French of the panic password (app/panic.tsx), the calculator in place of Erevos
// (components/launcher-icons.tsx), starting when the phone turns on (app/security.tsx), and their
// settings (lib/settings.ts) (i18n/fr/index.ts).
export const guard: Record<string, string> = {
  // The panic password.
  "Panic password": "Mot de passe de panique",
  "Set the panic password": "Définir le mot de passe de panique",
  "Turn off the panic password": "Désactiver le mot de passe de panique",
  "Panic password set. Typed on the lock screen, it wipes Erevos.": "Mot de passe de panique défini. Saisi sur l’écran de verrouillage, il efface Erevos.",
  "Typed on the lock screen, it will then be only a wrong password.": "Saisi sur l’écran de verrouillage, il ne sera plus alors qu’un mot de passe incorrect.",
  "No panic password now.": "Plus de mot de passe de panique.",
  "A password of its own that, typed on the lock screen, wipes Erevos as the button above does. The screen then looks as after a wrong password, and checking it takes as long as any other. It must differ from every password of your spaces.":
    "Un mot de passe distinct qui, saisi sur l’écran de verrouillage, efface Erevos comme le bouton ci-dessus. L’écran apparaît alors comme après un mot de passe incorrect, et la vérification dure aussi longtemps que pour n’importe quel autre. Il doit être différent de chaque mot de passe de vos espaces.",
  "Erevos keeps nothing that shows whether one is set, so this screen cannot say either. Setting it again replaces the one before.":
    "Erevos ne garde rien qui montre s’il y en a un de défini, donc cet écran ne peut pas le dire non plus. Le définir de nouveau remplace le précédent.",
  "Typed on the lock screen, it wipes everything Erevos keeps here.": "Saisi sur l’écran de verrouillage, il efface tout ce qu’Erevos garde ici.",
  // Starting when the phone turns on.
  "Start when the phone turns on": "Démarrer à l’allumage du téléphone",
  "Wait until I open it": "Attendre que je l’ouvre",
  "After the phone turns on, or Erevos is updated, Erevos starts by itself, with no space open: the spaces set to say a message came also while another is open already say \"New message\", never which space, nor who or what. Everything else waits for a password, as Erevos keeps no key on the phone. Meanwhile a quiet notice says \"Locked\". Spaces that go through Tor say nothing until a space is open. With no such space, only a quiet notice says it is locked, and a tap on it opens Erevos.":
    "Une fois le téléphone allumé, ou Erevos mis à jour, Erevos démarre tout seul, sans espace ouvert : les espaces réglés pour dire qu’un message est arrivé aussi pendant qu’un autre est ouvert disent déjà « New message », jamais quel espace, ni qui ou quoi. Tout le reste attend un mot de passe, car Erevos ne garde aucune clé sur le téléphone. En attendant, une notification discrète dit « Locked ». Les espaces qui passent par Tor ne disent rien tant qu’aucun espace n’est ouvert. S’il n’y a aucun espace de ce genre, seule une notification discrète dit qu’il est verrouillé, et un appui dessus ouvre Erevos.",
  "After the phone turns on, Erevos waits until you open it.": "Une fois le téléphone allumé, Erevos attend que tu l’ouvres.",
  // The calculator in place of Erevos.
  "Calculator in place of Erevos": "Calculatrice à la place d’Erevos",
  "A calculator that works shows among the phone's apps instead of Erevos's icon. Type your code in it, then =, and Erevos opens, asking for its password as always. Only the icon is hidden: Android's list of apps, the notices and the recent apps still say Erevos.":
    "Une calculatrice qui fonctionne apparaît parmi les applications du téléphone à la place de l’icône d’Erevos. Tape ton code dedans, puis =, et Erevos s’ouvre en demandant son mot de passe comme toujours. Seule l’icône est cachée : la liste des applications d’Android, les notifications et les applications récentes disent toujours Erevos.",
  "On: the calculator stands in place of Erevos.": "Activé : la calculatrice est à la place d’Erevos.",
  "Change the code": "Changer le code",
  "Show Erevos's icon again": "Réafficher l’icône d’Erevos",
  "Put the calculator in its place": "Mettre la calculatrice à sa place",
  "Calculator code": "Code de la calculatrice",
  "Digits only, 4 to 12 of them. Type them in the calculator, then =.": "Chiffres seulement, de 4 à 12. Tape-les dans la calculatrice, puis =.",
  "Use digits only, 4 to 12 of them.": "Utilise uniquement des chiffres, de 4 à 12.",
  "The calculator could not be set. Try again.": "La calculatrice n’a pas pu être mise en place. Réessaie.",
  "New code saved.": "Nouveau code enregistré.",
  "Done. Within a few seconds Erevos's icon leaves the phone's apps, and the calculator takes its place: open Erevos from it from now on.":
    "Terminé. Dans quelques secondes, l’icône d’Erevos quitte les applications du téléphone et la calculatrice prend sa place : ouvre désormais Erevos depuis elle.",
  "Erevos's icon is back among the phone's apps.": "L’icône d’Erevos est de retour parmi les applications du téléphone.",
  "Hide Erevos's icon behind a calculator that works": "Cacher l’icône d’Erevos derrière une calculatrice qui fonctionne",
  "Erevos's camera at a tap, behind Erevos's password and the Collection's, as from the Collection. Holding Erevos's icon down also offers Camera. Neither shows while the Collection is off or the calculator stands in place of Erevos.":
    "L’appareil photo d’Erevos d’un geste, derrière le mot de passe d’Erevos et celui de la Collection, comme depuis la Collection. Un appui long sur l’icône d’Erevos propose aussi Appareil photo. Aucun des deux ne s’affiche tant que la Collection est désactivée ou que la calculatrice tient la place d’Erevos.",
  "Put the Camera among the phone's apps":
    "Mettre l’Appareil photo parmi les applications du téléphone",
  "Take the Camera off the phone's apps":
    "Retirer l’Appareil photo des applications du téléphone",
  "After the phone turns on, or Erevos is updated, Erevos starts by itself, with no space open, and a quiet notice says it is locked: a tap on it opens Erevos. Nothing comes until a space is open.": "Une fois le téléphone allumé, ou Erevos mis à jour, Erevos démarre tout seul, sans espace ouvert, et une notification discrète dit qu’il est verrouillé : un appui dessus ouvre Erevos. Rien n’arrive tant qu’aucun espace n’est ouvert.",
  "Erevos's camera at a tap, even while Erevos and the Collection are locked: what it takes shows only after the password, in the Collection (Open the camera without the password, in its settings). Holding Erevos's icon down also offers Camera. Neither shows while the Collection is off or the calculator stands in place of Erevos.":
    "L’appareil photo d’Erevos d’un geste, même quand Erevos et la Collection sont verrouillés : ce qu’il prend ne s’affiche qu’après le mot de passe, dans la Collection (« Ouvrir l’appareil photo sans le mot de passe », dans ses réglages). Un appui long sur l’icône d’Erevos propose aussi Appareil photo. Aucun des deux ne s’affiche tant que la Collection est désactivée ou que la calculatrice tient la place d’Erevos.",
};
