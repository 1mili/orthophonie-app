export const site = {
  name: "Lisen Wa Kalem",
  tagline: "On t'écoute, on t'entend",
  orthophoniste: "Mme Sarra Ben Ammar",
  ville: "Tunis, Tunisie",
  phone: "+216 71 000 000",
  email: "contact@lisenwakalem.tn",
};

export type Service = {
  slug: string;
  title: string;
  ageRange: string;
  summary: string;
  details: string[];
};

export const services: Service[] = [
  {
    slug: "troubles-du-langage",
    title: "Troubles du langage oral",
    ageRange: "2 – 6 ans",
    summary:
      "Retard de parole, retard de langage, difficultés d'articulation : un accompagnement précoce et ludique.",
    details: [
      "Bilan du langage oral et de l'articulation",
      "Séances individuelles basées sur le jeu",
      "Suivi de la progression avec les parents",
    ],
  },
  {
    slug: "dyslexie-troubles-ecrits",
    title: "Dyslexie & troubles de l'écrit",
    ageRange: "6 – 12 ans",
    summary:
      "Repérage et rééducation de la dyslexie, dysorthographie et difficultés de lecture.",
    details: [
      "Bilan de lecture et d'orthographe",
      "Méthodes multisensorielles adaptées",
      "Lien avec l'école et les enseignants",
    ],
  },
  {
    slug: "begaiement",
    title: "Bégaiement",
    ageRange: "3 – 12 ans",
    summary:
      "Prise en charge du bégaiement dans un cadre bienveillant, sans pression sur l'enfant.",
    details: [
      "Bilan de la fluence",
      "Techniques de gestion du souffle et du rythme",
      "Accompagnement de la confiance en soi",
    ],
  },
  {
    slug: "teleconsultation",
    title: "Téléconsultation",
    ageRange: "Tous âges",
    summary:
      "Séances à distance par appel vidéo, pour les familles éloignées ou aux emplois du temps chargés.",
    details: [
      "Appel vidéo sécurisé intégré à la plateforme",
      "Partage de documents et d'exercices en direct",
      "Historique complet des consultations",
    ],
  },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Amira, maman de Youssef (4 ans)",
    role: "Retard de langage",
    quote:
      "En quelques mois, Youssef a commencé à faire des phrases entières. L'équipe nous a mis en confiance dès la première séance.",
  },
  {
    name: "Karim, papa de Nour (8 ans)",
    role: "Dyslexie",
    quote:
      "Le bilan a enfin mis des mots sur les difficultés de Nour à l'école. Le suivi en ligne nous a fait gagner un temps précieux.",
  },
  {
    name: "Sana, maman de Malek (6 ans)",
    role: "Bégaiement",
    quote:
      "Malek attend ses séances avec impatience, c'est devenu un moment de jeu pour lui, pas une contrainte.",
  },
];

export const parcours = [
  {
    year: "2013",
    label: "Diplôme d'État d'orthophonie",
  },
  {
    year: "2015",
    label: "Spécialisation troubles du langage écrit",
  },
  {
    year: "2018",
    label: "Ouverture du cabinet à Tunis",
  },
  {
    year: "2024",
    label: "Lancement de la plateforme digitale",
  },
];
