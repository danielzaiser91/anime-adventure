export interface GlossaryTerm {
  id: string;
  pattern: RegExp;
  label: string;
  description: string;
}

const EN: GlossaryTerm[] = [
  {
    id: 'hanamura',
    pattern: /Hanamura/g,
    label: 'Hanamura',
    description: "Your home village — once peaceful, now ravaged by the Void.",
  },
  {
    id: 'master_soren',
    pattern: /Master Soren/g,
    label: 'Master Soren',
    description: "Your mentor and teacher. He foresaw the Void's return long before anyone believed him.",
  },
  {
    id: 'void',
    pattern: /\bVoid\b/g,
    label: 'The Void',
    description: 'A destructive force from beyond reality. It unmakes everything it touches.',
  },
  {
    id: 'celestial_blade',
    pattern: /Celestial Blade/g,
    label: 'Celestial Blade',
    description: 'An ancient weapon of immense power, bound to a single chosen wielder.',
  },
  {
    id: 'void_wraith',
    pattern: /Void Wraiths?/g,
    label: 'Void Wraith',
    description: 'Creatures born from Void energy. They dissolve the fabric of reality on contact.',
  },
  {
    id: 'void_seal',
    pattern: /Void Seal/g,
    label: 'Void Seal',
    description: 'An ancient ward that contains Void energy. Once broken, Void corruption floods the area.',
  },
  {
    id: 'aethoria',
    pattern: /Aethoria/g,
    label: 'Aethoria',
    description: 'The world you inhabit — a realm of spirits, ancient power, and now, the Void.',
  },
  {
    id: 'malachar',
    pattern: /Malachar/g,
    label: 'Malachar',
    description: 'The Void sovereign. A being consumed by grief, determined to unmake all existence.',
  },
];

const DE: GlossaryTerm[] = [
  {
    id: 'hanamura',
    pattern: /Hanamura/g,
    label: 'Hanamura',
    description: "Dein Heimatdorf — einst friedlich, jetzt von der Leere verwüstet.",
  },
  {
    id: 'meister_soren',
    pattern: /Meister Soren/g,
    label: 'Meister Soren',
    description: "Dein Mentor und Lehrer. Er sah die Rückkehr der Leere voraus, bevor irgendjemand ihm glaubte.",
  },
  {
    id: 'leere',
    pattern: /\bLeere\b/g,
    label: 'Die Leere',
    description: 'Eine zerstörerische Kraft jenseits der Realität. Sie vernichtet alles, was sie berührt.',
  },
  {
    id: 'himmelsklinge',
    pattern: /Himmelsklinge/g,
    label: 'Himmelsklinge',
    description: 'Eine uralte Waffe von immenser Kraft, an einen einzigen auserwählten Träger gebunden.',
  },
  {
    id: 'leere_geister',
    pattern: /Leere-Geister?/g,
    label: 'Leere-Geist',
    description: 'Wesen aus Leere-Energie. Sie zerfressen das Gewebe der Wirklichkeit bei Berührung.',
  },
  {
    id: 'leere_siegel',
    pattern: /Leere-Siegel/g,
    label: 'Leere-Siegel',
    description: 'Ein uralter Schutzwall der Leere-Energie eindämmt. Einmal gebrochen, flutet Leere-Korruption die Umgebung.',
  },
  {
    id: 'aethoria',
    pattern: /Aethoria/g,
    label: 'Aethoria',
    description: 'Die Welt, in der du lebst — ein Reich der Geister, uralter Macht und nun der Leere.',
  },
  {
    id: 'malachar',
    pattern: /Malachar/g,
    label: 'Malachar',
    description: 'Der Leere-Herrscher. Ein von Trauer verzehrtes Wesen, das alle Existenz auslöschen will.',
  },
];

export const GLOSSARY: Record<string, GlossaryTerm[]> = { en: EN, de: DE };
