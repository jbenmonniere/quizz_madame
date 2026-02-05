update teacher_content
set data = jsonb_set(
  coalesce(teacher_content.data, '{}'::jsonb),
  '{subjects}',
  '{
    "Mathématiques": [
      "Numération",
      "Fractions",
      "Nombres décimaux",
      "Opérations",
      "Priorités des opérations",
      "Propriétés des nombres",
      "Facteurs premiers",
      "Critères de divisibilité",
      "Exposants",
      "Conversion de mesures",
      "Masse",
      "Capacité",
      "Température",
      "Heures et durées",
      "Aire",
      "Périmètre",
      "Volume",
      "Angles et triangles",
      "Cercle",
      "Frises et dallages",
      "Moyenne",
      "Plan cartésien",
      "Pourcentage",
      "Probabilités et statistiques"
    ],
    "CCQ (Culture et citoyenneté québécoise)": [
      "Identité",
      "Valeurs",
      "Vie collective",
      "Entraves au dialogue",
      "Puberté",
      "Persévérance scolaire",
      "Avenir",
      "Environnement",
      "Médias",
      "Droits des enfants"
    ],
    "Sciences": [
      "Corps humain",
      "Démarche scientifique",
      "Matériaux isolants",
      "Phénomènes naturels",
      "Nutrition",
      "Propriétés de la matière",
      "Roches et minéraux",
      "Plantes",
      "Machines simples"
    ],
    "Français": [
      "Classes de mots",
      "Constituants de la phrase",
      "Conjugaison",
      "Homophones",
      "Types de phrases",
      "Synonymes et antonymes",
      "Préfixes et suffixes",
      "Stratégies de lecture",
      "Inférence",
      "Vocabulaire"
    ]
  }'::jsonb,
  true
);
