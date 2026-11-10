// SPDX-License-Identifier: AGPL-3.0-or-later
// Every text of the page in French. Non-breaking spaces (U+00A0) go before
// : ; ! ? and inside « ».

import type { Messages } from './en'

export const fr: Messages = {
  description:
    'Une application de notes légère et privée, pour votre ordinateur et votre téléphone.',
  lead: 'Une application de notes légère et privée, pour votre ordinateur et votre téléphone.',
  source: 'Code source sur GitHub',
  language: 'Langue',
  screenshots: 'Captures d’écran',
  desktopShot:
    'Ficelle sur un ordinateur, une note avec une liste de tâches, un encadré et un chat, à côté de la liste des notes',
  phoneShot: 'La même note sur un téléphone',

  downloadFor: (system: string) => `Télécharger pour ${system}`,
  allDownloads: 'Voir tous les téléchargements',
  everySystem: 'Tous les systèmes, sur GitHub',
  otherSystems: 'Autres systèmes',
  installer: 'Installateur',
  portable: 'Portable',
  diskImage: 'Image disque',
  untested: 'Non testé',
  macDetail: (version: string) => `Image disque ${version}, non testée`,
  channel: 'Canal de version',
  stable: 'Stable',
  beta: 'Bêta',
  betaNote:
    'La toute dernière version, avant sa sortie officielle. Elle peut contenir des bugs, gardez une sauvegarde de vos notes.',
  betaNoMac: (version: string) => `Le Mac n’a pas de version bêta, il reste en ${version}.`,
  noNewerBeta: (version: string) =>
    `Aucune bêta n’est plus récente que la version stable pour l’instant, la bêta est donc aussi la ${version}.`,
  obtainium: 'Obtenir sur Obtainium',
  obtainiumDetail: 'Mises à jour automatiques',
  web: 'Version web',
  webLater: 'À venir',

  macNote: {
    before: 'L’application Mac n’est pas testée, voir ',
    link: 'Ficelle sur Mac',
    after: '.',
  },
  linuxNote: 'Des paquets pour Debian, Fedora, l’AUR et Flathub arrivent bientôt.',
  iosNote:
    'Il n’y a pas d’application iOS, je n’ai aucun appareil Apple pour la tester. La version web, adaptée aux téléphones, sera le moyen d’utiliser Ficelle sur iPhone ou iPad, jusqu’à ce qu’une personne sur Mac ou iOS rejoigne le projet ou que j’aie le matériel.',
  unknownNote:
    'Votre système n’a pas pu être détecté, ou Ficelle ne le prend pas encore en charge.',
}
