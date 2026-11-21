// SPDX-License-Identifier: AGPL-3.0-or-later
// Every text of the page in English, the shape the other languages follow.

export const en = {
  description: 'A lightweight, private notes app for your computer and your phone.',
  lead: 'A lightweight, private notes app for your computer and your phone.',
  source: 'Source code on GitHub',
  language: 'Language',
  screenshots: 'Screenshots',
  desktopShot:
    'Ficelle on a computer, a note with a checklist, a callout and a cat, beside the list of notes',
  phoneShot: 'The same note on a phone',

  downloadFor: (system: string) => `Download for ${system}`,
  allDownloads: 'See all downloads',
  everySystem: 'Every system, on GitHub',
  otherSystems: 'Other systems',
  installer: 'Installer',
  portable: 'Portable',
  diskImage: 'Disk image',
  untested: 'Untested',
  downloadFrom: 'Download from',
  mirror: 'Mirror',
  githubDown: 'GitHub cannot be reached',
  obtainium: 'Get it on Obtainium',
  obtainiumDetail: 'Automatic updates',
  web: 'Web version',
  webDetail: 'In your browser',
  webMain: 'Use Ficelle in your browser',
  webMainDetail: 'Nothing to install',

  macNote:
    'The web version is recommended on a Mac, your notes stay on this device. The Mac app is no longer made: its last version, 0.7.1, untested, is under the other systems.',
  linuxNote: 'A package for the AUR is coming soon.',
  iosNote:
    'There is no iPhone or iPad app, I have no Apple device to test one on. Ficelle works in Safari instead, and your notes stay on this device. Add it to your Home Screen, or Safari may delete them after a week away.',
  noAppNote:
    'There is no app for this system. Ficelle works in your browser instead, and your notes stay on this device.',
  unknownNote: 'Your system could not be detected, or Ficelle does not support it yet.',
}

export type Messages = typeof en
