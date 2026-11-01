export type Category = "dyslexie" | "begaiement" | "langage" | "parentalite" | "autisme";

export const categories: { id: Category; label: string }[] = [
  { id: "langage", label: "Langage" },
  { id: "dyslexie", label: "Dyslexie" },
  { id: "begaiement", label: "Bégaiement" },
  { id: "parentalite", label: "Parentalité" },
  { id: "autisme", label: "Autisme" },
];

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: Category;
  date: string;
  readMinutes: number;
  hasVideo?: boolean;
};

export const articles: Article[] = [
  {
    slug: "reconnaitre-retard-de-langage",
    title: "Comment reconnaître un retard de langage chez mon enfant ?",
    excerpt:
      "Les repères clés selon l'âge, et les signaux qui doivent inciter à consulter un orthophoniste.",
    category: "langage",
    date: "2026-05-12",
    readMinutes: 6,
    hasVideo: true,
    content: [
      "Chaque enfant développe son langage à son rythme, mais certains repères permettent d'identifier un retard qui mérite un avis professionnel.",
      "Vers 2 ans, un enfant devrait associer deux mots. Vers 3 ans, il devrait pouvoir construire de courtes phrases compréhensibles par un adulte extérieur à la famille.",
      "Si votre enfant utilise très peu de mots, ne combine pas de mots entre eux, ou reste difficile à comprendre après 3 ans, un bilan orthophonique permet d'y voir plus clair, sans attendre l'entrée à l'école.",
    ],
  },
  {
    slug: "dyslexie-premiers-signes",
    title: "Dyslexie : les premiers signes à l'école primaire",
    excerpt:
      "Confusions de lettres, lecture lente, fatigue à l'écrit : quand s'inquiéter et que faire.",
    category: "dyslexie",
    date: "2026-04-28",
    readMinutes: 7,
    content: [
      "La dyslexie se manifeste souvent en CP-CE1, quand l'apprentissage de la lecture devient plus exigeant.",
      "Confusions entre lettres proches (b/d, p/q), lecture hachée, fatigue importante lors des devoirs ou évitement de la lecture sont des signaux à observer dans la durée, pas ponctuellement.",
      "Un bilan permet de distinguer une difficulté passagère d'un trouble spécifique nécessitant une rééducation adaptée.",
    ],
  },
  {
    slug: "aider-enfant-qui-begaie",
    title: "5 attitudes qui aident un enfant qui bégaie",
    excerpt:
      "Le rôle des parents est essentiel : voici comment réagir au quotidien, sans pression.",
    category: "begaiement",
    date: "2026-04-10",
    readMinutes: 5,
    content: [
      "Face au bégaiement, la réaction de l'entourage compte autant que la rééducation elle-même.",
      "Laisser l'enfant terminer ses phrases, ralentir son propre débit de parole en modèle, et éviter de faire répéter sont des attitudes simples mais efficaces.",
      "Le plus important reste de préserver le plaisir de communiquer, quel que soit le rythme de la parole.",
    ],
  },
  {
    slug: "ecrans-et-langage",
    title: "Écrans et développement du langage : ce que dit la recherche",
    excerpt:
      "Un temps d'écran excessif est associé à un développement du langage plus lent chez le jeune enfant.",
    category: "parentalite",
    date: "2026-03-22",
    readMinutes: 8,
    content: [
      "Plusieurs études associent un temps d'écran important avant 3 ans à un vocabulaire plus restreint et des interactions verbales réduites.",
      "Ce n'est pas l'écran en lui-même qui pose problème, mais le temps qu'il retire aux échanges verbaux directs avec l'enfant.",
      "Privilégier les moments d'échange, de lecture partagée et de jeu verbal reste le meilleur soutien au développement du langage.",
    ],
  },
  {
    slug: "quand-consulter-orthophoniste",
    title: "À partir de quel âge consulter un orthophoniste ?",
    excerpt:
      "Il n'y a pas d'âge minimum : plus une difficulté est repérée tôt, plus la prise en charge est efficace.",
    category: "langage",
    date: "2026-02-15",
    readMinutes: 4,
    content: [
      "Contrairement à une idée reçue, il n'est jamais trop tôt pour consulter un orthophoniste, dès lors qu'un parent ou un pédiatre observe un doute sur le développement du langage.",
      "Un premier bilan peut être proposé dès 18-24 mois en cas d'inquiétude marquée, et la plupart des prises en charge démarrent entre 3 et 5 ans.",
    ],
  },
  {
    slug: "jeux-stimuler-langage-maison",
    title: "10 jeux simples pour stimuler le langage à la maison",
    excerpt:
      "Des activités du quotidien, sans matériel spécifique, pour enrichir le vocabulaire de votre enfant.",
    category: "parentalite",
    date: "2026-01-30",
    readMinutes: 6,
    content: [
      "Nommer les objets du quotidien, raconter sa journée, jouer à 'je devine ce que c'est' ou chanter des comptines sont autant d'occasions naturelles de stimuler le langage.",
      "L'essentiel est la régularité et le plaisir partagé, plus que la sophistication des activités proposées.",
    ],
  },
  {
    slug: "autisme-communication-orthophonie",
    title: "Autisme et communication : le rôle de l'orthophonie",
    excerpt:
      "Comment l'orthophonie soutient le langage, la communication alternative et les interactions sociales chez l'enfant autiste.",
    category: "autisme",
    date: "2026-06-02",
    readMinutes: 7,
    hasVideo: true,
    content: [
      "Chez l'enfant autiste, les besoins de communication sont très variables : certains parlent peu, d'autres ont un langage fluide mais peinent dans les échanges sociaux.",
      "L'orthophonie s'intéresse autant au langage oral qu'aux outils de communication alternative (pictogrammes, tablettes) et aux habiletés conversationnelles.",
      "Un bilan précoce permet d'identifier les points d'appui de l'enfant et d'accompagner la famille avec des stratégies concrètes au quotidien.",
    ],
  },
];
