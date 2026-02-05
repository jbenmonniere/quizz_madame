import json
import random
from datetime import datetime, timezone
from pathlib import Path

random.seed(42)

LEVELS = [
    "Maternelle",
    "1ère année",
    "2ème année",
    "3ème année",
    "4ème année",
    "5ème année",
    "6ème année",
]

CREATED_AT = datetime(2026, 2, 5, tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")
SUBJECT = "Culture generale"


def pick_wrongs(pool, correct, count=3):
    options = [p for p in dict.fromkeys(pool) if p != correct]
    return random.sample(options, k=count)


def make_mc(question, correct, wrongs):
    choices = [correct] + list(wrongs)
    choices = list(dict.fromkeys(choices))
    if len(choices) < 4:
        if str(correct).isdigit():
            base = int(correct)
            candidate = base + 1
            while len(choices) < 4:
                val = str(candidate)
                if val not in choices:
                    choices.append(val)
                candidate += 1
        else:
            for opt in fallback_pool:
                if opt not in choices:
                    choices.append(opt)
                if len(choices) == 4:
                    break
    if len(choices) < 4:
        raise ValueError("Not enough choices")
    if len(choices) > 4:
        choices = choices[:4]
    random.shuffle(choices)
    answer = choices.index(correct)
    return question, choices, answer


def add_question(bank, qid, level, question, correct, wrongs, difficulty):
    q, choices, answer = make_mc(question, correct, wrongs)
    bank.append(
        {
            "id": qid,
            "subject": SUBJECT,
            "subtheme": level,
            "question": q,
            "text": q,
            "choices": choices,
            "answer": answer,
            "difficulty": difficulty,
            "createdAt": CREATED_AT,
        }
    )


colors = [
    "rouge",
    "bleu",
    "vert",
    "jaune",
    "orange",
    "violet",
    "rose",
    "marron",
    "noir",
    "blanc",
    "gris",
]

objects_colors = [
    ("du ciel", "bleu"),
    ("de l'herbe", "vert"),
    ("du soleil", "jaune"),
    ("de la neige", "blanc"),
    ("de la nuit", "noir"),
    ("de la tomate", "rouge"),
    ("de l'orange", "orange"),
    ("du raisin", "violet"),
    ("du cochon", "rose"),
    ("du chocolat", "marron"),
    ("du nuage", "blanc"),
    ("du charbon", "noir"),
]

shapes_simple = [
    ("3 cotes", "triangle"),
    ("4 cotes egaux", "carre"),
    ("4 cotes pas tous egaux", "rectangle"),
    ("tout rond", "cercle"),
    ("forme allongee", "ovale"),
    ("forme en diamant", "losange"),
    ("forme d'etoile", "etoile"),
    ("forme de coeur", "coeur"),
    ("5 cotes", "pentagone"),
    ("6 cotes", "hexagone"),
]

animal_sounds = [
    ("la vache", "meuh"),
    ("le chat", "miaou"),
    ("le chien", "ouaf"),
    ("le coq", "cocorico"),
    ("le mouton", "bee"),
    ("le cheval", "hii"),
    ("le canard", "coin coin"),
    ("la poule", "cot cot"),
    ("le lion", "roar"),
    ("la grenouille", "croa"),
]

animal_babies = [
    ("du chat", "chaton"),
    ("du chien", "chiot"),
    ("de la vache", "veau"),
    ("du cheval", "poulain"),
    ("du mouton", "agneau"),
    ("de la poule", "poussin"),
    ("du canard", "caneton"),
    ("du cochon", "porcelet"),
    ("de la chevre", "chevreau"),
    ("du lapin", "lapereau"),
    ("du lion", "lionceau"),
    ("de la vache", "veau"),
]

body_parts = [
    ("voit", "les yeux"),
    ("entend", "les oreilles"),
    ("sent", "le nez"),
    ("goute", "la langue"),
    ("touche", "les mains"),
    ("marche", "les pieds"),
    ("pense", "le cerveau"),
    ("respire", "les poumons"),
    ("mache", "les dents"),
    ("tient", "les mains"),
]

opposites = [
    ("grand", "petit"),
    ("chaud", "froid"),
    ("rapide", "lent"),
    ("haut", "bas"),
    ("lourd", "leger"),
    ("propre", "sale"),
    ("plein", "vide"),
    ("ouvert", "ferme"),
    ("loin", "pres"),
    ("jour", "nuit"),
    ("gros", "mince"),
    ("bruyant", "silencieux"),
]

days = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
months = [
    "janvier",
    "fevrier",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "aout",
    "septembre",
    "octobre",
    "novembre",
    "decembre",
]
seasons = ["hiver", "printemps", "ete", "automne"]

fruits = ["pomme", "banane", "orange", "fraise", "poire", "raisin", "peche", "kiwi", "ananas", "cerise", "melon", "pasteque"]
vegetables = ["carotte", "tomate", "brocoli", "salade", "concombre", "patate", "aubergine", "courgette", "poivron", "oignon", "epinard", "haricot"]

transport = ["voiture", "bus", "train", "velo", "avion", "bateau", "moto", "tram", "metro", "trottinette", "camion", "helicoptere"]

countries_capitals = [
    ("France", "Paris"),
    ("Canada", "Ottawa"),
    ("Espagne", "Madrid"),
    ("Italie", "Rome"),
    ("Allemagne", "Berlin"),
    ("Portugal", "Lisbonne"),
    ("Royaume-Uni", "Londres"),
    ("Etats-Unis", "Washington"),
    ("Mexique", "Mexico"),
    ("Bresil", "Brasilia"),
    ("Argentine", "Buenos Aires"),
    ("Chili", "Santiago"),
    ("Japon", "Tokyo"),
    ("Chine", "Pekin"),
    ("Inde", "New Delhi"),
    ("Australie", "Canberra"),
    ("Russie", "Moscou"),
    ("Egypte", "Le Caire"),
    ("Maroc", "Rabat"),
    ("Afrique du Sud", "Pretoria"),
    ("Suisse", "Berne"),
    ("Belgique", "Bruxelles"),
    ("Pays-Bas", "Amsterdam"),
    ("Suede", "Stockholm"),
    ("Norvege", "Oslo"),
    ("Finlande", "Helsinki"),
    ("Irlande", "Dublin"),
    ("Grece", "Athenes"),
    ("Turquie", "Ankara"),
    ("Coree du Sud", "Seoul"),
]

continents = ["Afrique", "Europe", "Asie", "Amerique du Nord", "Amerique du Sud", "Oceanie", "Antarctique"]
oceans = ["Atlantique", "Pacifique", "Indien", "Arctique", "Austral"]
planets = ["Mercure", "Venus", "Terre", "Mars", "Jupiter", "Saturne", "Uranus", "Neptune"]

monuments = [
    ("Tour Eiffel", "France"),
    ("Colisee", "Italie"),
    ("Pyramides de Gizeh", "Egypte"),
    ("Statue de la Liberte", "Etats-Unis"),
    ("Muraille de Chine", "Chine"),
    ("Taj Mahal", "Inde"),
    ("Big Ben", "Royaume-Uni"),
    ("Machu Picchu", "Perou"),
    ("Sagrada Familia", "Espagne"),
    ("Opera de Sydney", "Australie"),
    ("Christ Redempteur", "Bresil"),
    ("Acropole", "Grece"),
]

science_facts = [
    ("Quelle planete est la plus proche du Soleil ?", "Mercure", ["Mars", "Venus", "Jupiter"]),
    ("Quelle planete est surnommee la planete rouge ?", "Mars", ["Venus", "Jupiter", "Neptune"]),
    ("Quel gaz est necessaire pour respirer ?", "Oxygene", ["Azote", "Hydrogene", "Helium"]),
    ("A 0 degre C, l eau est ...", "solide", ["liquide", "gazeuse", "plasma"]),
    ("Quel instrument mesure la temperature ?", "Thermometre", ["Barometre", "Chronometre", "Boussole"]),
    ("Quel organe pompe le sang ?", "Coeur", ["Poumon", "Foie", "Cerveau"]),
    ("Quel est le satellite de la Terre ?", "Lune", ["Mars", "Venus", "Soleil"]),
    ("Quelle force nous attire vers le sol ?", "Gravite", ["Magnetisme", "Electricite", "Inertie"]),
    ("Quelle partie de la plante absorbe l eau ?", "Racines", ["Fleurs", "Feuilles", "Tronc"]),
    ("Quel est l etat de l eau sous forme de vapeur ?", "gazeuse", ["liquide", "solide", "plasma"]),
]

organs = [
    ("Le cerveau sert a", "penser"),
    ("Les poumons servent a", "respirer"),
    ("Le coeur sert a", "pomper le sang"),
    ("Les yeux servent a", "voir"),
    ("Les oreilles servent a", "entendre"),
    ("L estomac sert a", "digestion"),
    ("Les os servent a", "soutenir le corps"),
    ("La peau sert a", "proteger le corps"),
]

instruments = ["piano", "guitare", "violon", "flute", "trompette", "batterie", "harpe", "clarinette", "saxophone", "accordeon"]

sports = ["football", "basketball", "tennis", "natation", "rugby", "handball", "volleyball", "hockey", "badminton", "athletisme"]

environment = [
    ("Le verre se trie dans", "la poubelle a verre"),
    ("Le papier se trie dans", "la poubelle a papier"),
    ("Plastique et metal vont dans", "la poubelle de recyclage"),
    ("Eteindre la lumiere permet", "d economiser l energie"),
    ("Planter des arbres aide", "l air a rester propre"),
    ("Un geste ecolo est de", "reutiliser une gourde"),
    ("Pour economiser l eau on", "ferme le robinet"),
    ("Le compost sert a", "recycler les dechets organiques"),
    ("Les piles usagées vont dans", "un point de collecte"),
    ("Marcher ou pedaler permet", "de moins polluer"),
]

fallback_pool = (
    colors
    + days
    + months
    + seasons
    + fruits
    + vegetables
    + continents
    + oceans
    + planets
    + transport
    + instruments
    + sports
)


def gen_maternelle():
    bank = []
    i = 1
    for n in range(1, 9):
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            f"Quel nombre vient apres {n} ?",
            str(n + 1),
            [str(n + 2), str(max(0, n - 1)), str(n + 3)],
            0,
        )
        i += 1
    for n in range(2, 11):
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            f"Quel nombre vient avant {n} ?",
            str(n - 1),
            [str(n + 1), str(max(0, n - 2)), str(n + 2)],
            0,
        )
        i += 1
    for obj, col in objects_colors[:10]:
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            f"La couleur {obj} est souvent...",
            col,
            pick_wrongs(colors, col),
            0,
        )
        i += 1
    for desc, shape in shapes_simple[:10]:
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            f"Quelle forme a {desc} ?",
            shape,
            pick_wrongs([s for _, s in shapes_simple], shape),
            0,
        )
        i += 1
    for animal, sound in animal_sounds:
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            f"Quel bruit fait {animal} ?",
            sound,
            pick_wrongs([s for _, s in animal_sounds], sound),
            0,
        )
        i += 1
    for animal, baby in animal_babies[:10]:
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            f"Comment s appelle le bebe {animal} ?",
            baby,
            pick_wrongs([b for _, b in animal_babies], baby),
            0,
        )
        i += 1
    for func, part in body_parts[:10]:
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            f"Avec quoi on {func} ?",
            part,
            pick_wrongs([p for _, p in body_parts], part),
            0,
        )
        i += 1
    for idx, day in enumerate(days[:-1]):
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            f"Quel jour vient apres {day} ?",
            days[idx + 1],
            pick_wrongs(days, days[idx + 1]),
            0,
        )
        i += 1
    for idx, season in enumerate(seasons):
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            f"Quelle saison vient apres {season} ?",
            seasons[(idx + 1) % len(seasons)],
            pick_wrongs(seasons, seasons[(idx + 1) % len(seasons)]),
            0,
        )
        i += 1
    for fruit in fruits[:6]:
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            "Lequel est un fruit ?",
            fruit,
            random.sample(vegetables, 3),
            0,
        )
        i += 1
    for veg in vegetables[:6]:
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            "Lequel est un legume ?",
            veg,
            random.sample(fruits, 3),
            0,
        )
        i += 1
    for a, b in opposites[:10]:
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            f"Quel est le contraire de {a} ?",
            b,
            pick_wrongs([o for _, o in opposites], b),
            0,
        )
        i += 1
    while len(bank) < 100:
        fruit = random.choice(fruits)
        add_question(
            bank,
            f"cg-m-{i:03d}",
            LEVELS[0],
            "Lequel est un fruit ?",
            fruit,
            random.sample(vegetables, 3),
            0,
        )
        i += 1
    return bank[:100]


def gen_1ere():
    bank = []
    i = 1
    for n in range(1, 11):
        add_question(
            bank,
            f"cg-1-{i:03d}",
            LEVELS[1],
            f"Quel nombre vient apres {n} ?",
            str(n + 1),
            [str(n + 2), str(max(0, n - 1)), str(n + 3)],
            1,
        )
        i += 1
    for n in range(2, 12):
        add_question(
            bank,
            f"cg-1-{i:03d}",
            LEVELS[1],
            f"Quel nombre vient avant {n} ?",
            str(n - 1),
            [str(n + 1), str(max(0, n - 2)), str(n + 2)],
            1,
        )
        i += 1
    for a in range(1, 6):
        for b in range(1, 3):
            add_question(
                bank,
                f"cg-1-{i:03d}",
                LEVELS[1],
                f"Combien font {a}+{b} ?",
                str(a + b),
                [str(a + b + 1), str(max(0, a + b - 1)), str(a + b + 2)],
                1,
            )
            i += 1
    for a in range(5, 11):
        add_question(
            bank,
            f"cg-1-{i:03d}",
            LEVELS[1],
            f"Combien font {a}-1 ?",
            str(a - 1),
            [str(a - 2), str(a + 1), str(a - 3)],
            1,
        )
        i += 1
    for idx, month in enumerate(months):
        add_question(
            bank,
            f"cg-1-{i:03d}",
            LEVELS[1],
            f"Quel est le mois numero {idx + 1} ?",
            month,
            pick_wrongs(months, month),
            1,
        )
        i += 1
    for idx, season in enumerate(seasons):
        add_question(
            bank,
            f"cg-1-{i:03d}",
            LEVELS[1],
            f"Quelle saison vient apres {season} ?",
            seasons[(idx + 1) % len(seasons)],
            pick_wrongs(seasons, seasons[(idx + 1) % len(seasons)]),
            1,
        )
        i += 1
    basics = countries_capitals[:10]
    capitals = [c for _, c in basics]
    for country, capital in basics:
        add_question(
            bank,
            f"cg-1-{i:03d}",
            LEVELS[1],
            f"Quelle est la capitale de {country} ?",
            capital,
            pick_wrongs(capitals, capital),
            1,
        )
        i += 1
    habitats = [
        ("poisson", "la mer"),
        ("ours", "la foret"),
        ("pingouin", "la banquise"),
        ("chameau", "le desert"),
        ("grenouille", "la mare"),
        ("ecureuil", "les arbres"),
        ("vache", "la ferme"),
        ("cheval", "la ferme"),
        ("lion", "la savane"),
        ("panda", "la foret"),
    ]
    places = [p for _, p in habitats]
    for animal, place in habitats:
        add_question(
            bank,
            f"cg-1-{i:03d}",
            LEVELS[1],
            f"Ou vit souvent le {animal} ?",
            place,
            pick_wrongs(places, place),
            1,
        )
        i += 1
    time_q = [
        ("Combien de minutes dans une heure ?", "60", ["30", "45", "90"]),
        ("Combien de jours dans une semaine ?", "7", ["5", "6", "8"]),
        ("Combien de mois dans une annee ?", "12", ["10", "11", "13"]),
        ("Combien d heures dans une journee ?", "24", ["12", "18", "30"]),
        ("Combien de secondes dans une minute ?", "60", ["30", "100", "45"]),
        ("Quelle saison vient apres le printemps ?", "ete", ["hiver", "automne", "printemps"]),
    ]
    for question, correct, wrongs in time_q:
        add_question(bank, f"cg-1-{i:03d}", LEVELS[1], question, correct, wrongs, 1)
        i += 1
    for t in transport[:11]:
        add_question(
            bank,
            f"cg-1-{i:03d}",
            LEVELS[1],
            "Lequel est un moyen de transport ?",
            t,
            random.sample([x for x in fruits + vegetables if x != t], 3),
            1,
        )
        i += 1
    for a, b in opposites[:8]:
        add_question(
            bank,
            f"cg-1-{i:03d}",
            LEVELS[1],
            f"Quel est le contraire de {a} ?",
            b,
            pick_wrongs([o for _, o in opposites], b),
            1,
        )
        i += 1
    while len(bank) < 100:
        country, capital = random.choice(countries_capitals[:10])
        add_question(
            bank,
            f"cg-1-{i:03d}",
            LEVELS[1],
            f"Quelle est la capitale de {country} ?",
            capital,
            pick_wrongs([c for _, c in countries_capitals[:10]], capital),
            1,
        )
        i += 1
    return bank[:100]


def gen_2eme():
    bank = []
    i = 1
    for a in range(2, 6):
        for b in range(1, 4):
            add_question(
                bank,
                f"cg-2-{i:03d}",
                LEVELS[2],
                f"Combien font {a} x {b} ?",
                str(a * b),
                [str(a * b + a), str(max(0, a * b - a)), str(a * b + 2)],
                2,
            )
            i += 1
    for a in range(12, 22):
        add_question(
            bank,
            f"cg-2-{i:03d}",
            LEVELS[2],
            f"Combien font {a}+{a} ?",
            str(a + a),
            [str(a + a + 2), str(a + a - 2), str(a + a + 1)],
            2,
        )
        i += 1
    for a in range(20, 30):
        add_question(
            bank,
            f"cg-2-{i:03d}",
            LEVELS[2],
            f"Combien font {a}-5 ?",
            str(a - 5),
            [str(a - 4), str(a - 6), str(a - 3)],
            2,
        )
        i += 1
    for idx, month in enumerate(months):
        add_question(
            bank,
            f"cg-2-{i:03d}",
            LEVELS[2],
            f"Quel est le mois numero {idx + 1} ?",
            month,
            pick_wrongs(months, month),
            2,
        )
        i += 1
    basics = countries_capitals[:12]
    capitals = [c for _, c in basics]
    for country, capital in basics:
        add_question(
            bank,
            f"cg-2-{i:03d}",
            LEVELS[2],
            f"Quelle est la capitale de {country} ?",
            capital,
            pick_wrongs(capitals, capital),
            2,
        )
        i += 1
    for cont in continents:
        add_question(
            bank,
            f"cg-2-{i:03d}",
            LEVELS[2],
            "Lequel est un continent ?",
            cont,
            pick_wrongs(continents, cont),
            2,
        )
        i += 1
    for planet in planets:
        add_question(
            bank,
            f"cg-2-{i:03d}",
            LEVELS[2],
            "Lequel est une planete du Systeme solaire ?",
            planet,
            pick_wrongs(planets, planet),
            2,
        )
        i += 1
    for question, correct, wrongs in science_facts:
        add_question(bank, f"cg-2-{i:03d}", LEVELS[2], question, correct, wrongs, 2)
        i += 1
    for sport in sports:
        add_question(
            bank,
            f"cg-2-{i:03d}",
            LEVELS[2],
            "Lequel est un sport ?",
            sport,
            random.sample([x for x in fruits + vegetables], 3),
            2,
        )
        i += 1
    for inst in instruments:
        add_question(
            bank,
            f"cg-2-{i:03d}",
            LEVELS[2],
            "Lequel est un instrument de musique ?",
            inst,
            random.sample([x for x in transport if x != inst], 3),
            2,
        )
        i += 1
    for monument, country in monuments[:11]:
        add_question(
            bank,
            f"cg-2-{i:03d}",
            LEVELS[2],
            f"Dans quel pays se trouve {monument} ?",
            country,
            pick_wrongs([c for _, c in monuments], country),
            2,
        )
        i += 1
    return bank[:100]


def gen_3eme():
    bank = []
    i = 1
    caps = countries_capitals[:15]
    capitals = [c for _, c in caps]
    for country, capital in caps:
        add_question(
            bank,
            f"cg-3-{i:03d}",
            LEVELS[3],
            f"Quelle est la capitale de {country} ?",
            capital,
            pick_wrongs(capitals, capital),
            2,
        )
        i += 1
    for country, capital in countries_capitals[15:30]:
        add_question(
            bank,
            f"cg-3-{i:03d}",
            LEVELS[3],
            f"{capital} est la capitale de quel pays ?",
            country,
            pick_wrongs([c for c, _ in countries_capitals], country),
            2,
        )
        i += 1
    for ocean in oceans:
        add_question(
            bank,
            f"cg-3-{i:03d}",
            LEVELS[3],
            "Lequel est un ocean ?",
            ocean,
            pick_wrongs(oceans, ocean),
            2,
        )
        i += 1
    mountains = ["Everest", "Mont Blanc", "Kilimandjaro", "Alpes", "Himalaya"]
    for m in mountains:
        add_question(
            bank,
            f"cg-3-{i:03d}",
            LEVELS[3],
            "Lequel est une montagne ou chaine de montagnes ?",
            m,
            random.sample([x for x in oceans + continents], 3),
            2,
        )
        i += 1
    rivers = ["Seine", "Loire", "Rhone", "Nil", "Amazone"]
    for r in rivers:
        add_question(
            bank,
            f"cg-3-{i:03d}",
            LEVELS[3],
            "Lequel est un fleuve ?",
            r,
            random.sample([x for x in oceans + mountains], 3),
            2,
        )
        i += 1
    for question, correct, wrongs in science_facts:
        add_question(bank, f"cg-3-{i:03d}", LEVELS[3], question, correct, wrongs, 2)
        i += 1
    for question, correct, wrongs in science_facts[:5]:
        add_question(bank, f"cg-3-{i:03d}", LEVELS[3], question, correct, wrongs, 2)
        i += 1
    for monument, country in monuments:
        add_question(
            bank,
            f"cg-3-{i:03d}",
            LEVELS[3],
            f"Dans quel pays se trouve {monument} ?",
            country,
            pick_wrongs([c for _, c in monuments], country),
            2,
        )
        i += 1
    for inst in instruments[:10]:
        add_question(
            bank,
            f"cg-3-{i:03d}",
            LEVELS[3],
            "Lequel est un instrument de musique ?",
            inst,
            random.sample([x for x in transport if x != inst], 3),
            2,
        )
        i += 1
    for env_q, correct in environment[:10]:
        add_question(
            bank,
            f"cg-3-{i:03d}",
            LEVELS[3],
            env_q + " ...",
            correct,
            ["la poubelle ordinaire", "le lavabo", "la route"],
            2,
        )
        i += 1
    for sport in sports[:10]:
        add_question(
            bank,
            f"cg-3-{i:03d}",
            LEVELS[3],
            "Lequel est un sport ?",
            sport,
            random.sample([x for x in fruits + vegetables], 3),
            2,
        )
        i += 1
    return bank[:100]


def gen_4eme():
    bank = []
    i = 1
    caps = countries_capitals[:20]
    capitals = [c for _, c in caps]
    for country, capital in caps:
        add_question(
            bank,
            f"cg-4-{i:03d}",
            LEVELS[4],
            f"Quelle est la capitale de {country} ?",
            capital,
            pick_wrongs(capitals, capital),
            3,
        )
        i += 1
    for country, capital in countries_capitals[10:20]:
        add_question(
            bank,
            f"cg-4-{i:03d}",
            LEVELS[4],
            f"{capital} est la capitale de quel pays ?",
            country,
            pick_wrongs([c for c, _ in countries_capitals], country),
            3,
        )
        i += 1
    for cont in continents:
        add_question(
            bank,
            f"cg-4-{i:03d}",
            LEVELS[4],
            "Lequel est un continent ?",
            cont,
            pick_wrongs(continents, cont),
            3,
        )
        i += 1
    for ocean in oceans:
        add_question(
            bank,
            f"cg-4-{i:03d}",
            LEVELS[4],
            "Lequel est un ocean ?",
            ocean,
            pick_wrongs(oceans, ocean),
            3,
        )
        i += 1
    for question, correct, wrongs in science_facts:
        add_question(bank, f"cg-4-{i:03d}", LEVELS[4], question, correct, wrongs, 3)
        i += 1
    for q, correct in organs:
        add_question(
            bank,
            f"cg-4-{i:03d}",
            LEVELS[4],
            q + " ...",
            correct,
            ["courir", "parler", "penser"],
            3,
        )
        i += 1
    for monument, country in monuments:
        add_question(
            bank,
            f"cg-4-{i:03d}",
            LEVELS[4],
            f"Dans quel pays se trouve {monument} ?",
            country,
            pick_wrongs([c for _, c in monuments], country),
            3,
        )
        i += 1
    for inst in instruments[:8]:
        add_question(
            bank,
            f"cg-4-{i:03d}",
            LEVELS[4],
            "Lequel est un instrument de musique ?",
            inst,
            random.sample([x for x in transport if x != inst], 3),
            3,
        )
        i += 1
    for env_q, correct in environment[:10]:
        add_question(
            bank,
            f"cg-4-{i:03d}",
            LEVELS[4],
            env_q + " ...",
            correct,
            ["la route", "le placard", "la salle de bain"],
            3,
        )
        i += 1
    for tech in ["internet", "ordinateur", "clavier", "souris", "tablette"]:
        add_question(
            bank,
            f"cg-4-{i:03d}",
            LEVELS[4],
            "Lequel est un outil numerique ?",
            tech,
            random.sample([x for x in fruits + vegetables], 3),
            3,
        )
        i += 1
    while len(bank) < 100:
        planet = random.choice(planets)
        add_question(
            bank,
            f"cg-4-{i:03d}",
            LEVELS[4],
            "Lequel est une planete du Systeme solaire ?",
            planet,
            pick_wrongs(planets, planet),
            3,
        )
        i += 1
    return bank[:100]


def gen_5eme():
    bank = []
    i = 1
    caps = countries_capitals[:20]
    capitals = [c for _, c in caps]
    for country, capital in caps:
        add_question(
            bank,
            f"cg-5-{i:03d}",
            LEVELS[5],
            f"Quelle est la capitale de {country} ?",
            capital,
            pick_wrongs(capitals, capital),
            3,
        )
        i += 1
    rivers = ["Seine", "Loire", "Rhone", "Nil", "Amazone", "Danube", "Gange", "Mississippi", "Volga", "Mekong", "Tigre", "Euphrate", "Congo", "Niger", "Yangtse"]
    for r in rivers[:15]:
        add_question(
            bank,
            f"cg-5-{i:03d}",
            LEVELS[5],
            "Lequel est un fleuve ?",
            r,
            random.sample([x for x in oceans + continents], 3),
            3,
        )
        i += 1
    for question, correct, wrongs in science_facts:
        add_question(bank, f"cg-5-{i:03d}", LEVELS[5], question, correct, wrongs, 3)
        i += 1
    for planet in planets:
        add_question(
            bank,
            f"cg-5-{i:03d}",
            LEVELS[5],
            "Lequel est une planete du Systeme solaire ?",
            planet,
            pick_wrongs(planets, planet),
            3,
        )
        i += 1
    for monument, country in monuments:
        add_question(
            bank,
            f"cg-5-{i:03d}",
            LEVELS[5],
            f"Dans quel pays se trouve {monument} ?",
            country,
            pick_wrongs([c for _, c in monuments], country),
            3,
        )
        i += 1
    for inst in instruments[:10]:
        add_question(
            bank,
            f"cg-5-{i:03d}",
            LEVELS[5],
            "Lequel est un instrument de musique ?",
            inst,
            random.sample([x for x in transport if x != inst], 3),
            3,
        )
        i += 1
    for q, correct in environment[:10]:
        add_question(
            bank,
            f"cg-5-{i:03d}",
            LEVELS[5],
            q + " ...",
            correct,
            ["la poubelle ordinaire", "le lavabo", "la route"],
            3,
        )
        i += 1
    civics = [
        ("Quel est le symbole de la France ?", "drapeau tricolore"),
        ("Quelle devise est sur les mairies ?", "Liberte Egalite Fraternite"),
        ("Quel est le jour de la fete nationale en France ?", "14 juillet"),
        ("Le vote permet de", "choisir des representants"),
        ("La loi sert a", "organiser la vie en societé"),
        ("Les droits de l enfant protegent", "les enfants"),
        ("La democratie signifie", "le pouvoir du peuple"),
        ("Un maire travaille pour", "la ville"),
        ("Le conseil municipal decide", "pour la commune"),
        ("Un citoyen doit", "respecter les lois"),
    ]
    for question, correct in civics:
        add_question(
            bank,
            f"cg-5-{i:03d}",
            LEVELS[5],
            question,
            correct,
            ["manger", "dormir", "jouer"],
            3,
        )
        i += 1
    while len(bank) < 100:
        country, capital = random.choice(countries_capitals)
        add_question(
            bank,
            f"cg-5-{i:03d}",
            LEVELS[5],
            f"{capital} est la capitale de quel pays ?",
            country,
            pick_wrongs([c for c, _ in countries_capitals], country),
            3,
        )
        i += 1
    return bank[:100]


def gen_6eme():
    bank = []
    i = 1
    caps = countries_capitals[5:25]
    capitals = [c for _, c in caps]
    for country, capital in caps:
        add_question(
            bank,
            f"cg-6-{i:03d}",
            LEVELS[6],
            f"Quelle est la capitale de {country} ?",
            capital,
            pick_wrongs(capitals, capital),
            4,
        )
        i += 1
    climates = ["tropical", "temperé", "polaire", "desertique"]
    for climate in climates:
        add_question(
            bank,
            f"cg-6-{i:03d}",
            LEVELS[6],
            "Lequel est un type de climat ?",
            climate,
            pick_wrongs(climates, climate),
            4,
        )
        i += 1
    for ocean in oceans:
        add_question(
            bank,
            f"cg-6-{i:03d}",
            LEVELS[6],
            "Lequel est un ocean ?",
            ocean,
            pick_wrongs(oceans, ocean),
            4,
        )
        i += 1
    for question, correct, wrongs in science_facts:
        add_question(bank, f"cg-6-{i:03d}", LEVELS[6], question, correct, wrongs, 4)
        i += 1
    for q, correct in organs:
        add_question(
            bank,
            f"cg-6-{i:03d}",
            LEVELS[6],
            q + " ...",
            correct,
            ["courir", "parler", "sauter"],
            4,
        )
        i += 1
    for monument, country in monuments:
        add_question(
            bank,
            f"cg-6-{i:03d}",
            LEVELS[6],
            f"Dans quel pays se trouve {monument} ?",
            country,
            pick_wrongs([c for _, c in monuments], country),
            4,
        )
        i += 1
    for tech in ["internet", "navigateur", "mot de passe", "wifi", "serveur", "courriel", "reseaux sociaux", "application", "mise a jour", "antivirus"]:
        add_question(
            bank,
            f"cg-6-{i:03d}",
            LEVELS[6],
            "Lequel est un mot lie au numerique ?",
            tech,
            random.sample([x for x in fruits + vegetables], 3),
            4,
        )
        i += 1
    civics = [
        ("Le pouvoir legislatif sert a", "faire les lois"),
        ("Le pouvoir executif sert a", "appliquer les lois"),
        ("Le pouvoir judiciaire sert a", "juger les conflits"),
        ("La constitution est", "la loi fondamentale"),
        ("Une election sert a", "choisir un representant"),
        ("Un citoyen doit", "respecter les autres"),
        ("L impôt sert a", "financer les services publics"),
        ("La mairie se trouve dans", "la commune"),
        ("L assemblee nationale se trouve a", "Paris"),
        ("Le drapeau europeen a", "12 etoiles"),
    ]
    for question, correct in civics:
        add_question(
            bank,
            f"cg-6-{i:03d}",
            LEVELS[6],
            question,
            correct,
            ["manger", "jouer", "dormir"],
            4,
        )
        i += 1
    for env_q, correct in environment:
        add_question(
            bank,
            f"cg-6-{i:03d}",
            LEVELS[6],
            env_q + " ...",
            correct,
            ["la route", "le placard", "le lavabo"],
            4,
        )
        i += 1
    while len(bank) < 100:
        country, capital = random.choice(countries_capitals)
        add_question(
            bank,
            f"cg-6-{i:03d}",
            LEVELS[6],
            f"{capital} est la capitale de quel pays ?",
            country,
            pick_wrongs([c for c, _ in countries_capitals], country),
            4,
        )
        i += 1
    return bank[:100]


def build_bank():
    bank = []
    bank.extend(gen_maternelle())
    bank.extend(gen_1ere())
    bank.extend(gen_2eme())
    bank.extend(gen_3eme())
    bank.extend(gen_4eme())
    bank.extend(gen_5eme())
    bank.extend(gen_6eme())
    return bank


def build_sql(bank):
    payload = {
        "subjects": {SUBJECT: LEVELS},
        "bank": bank,
    }
    json_payload = json.dumps(payload, ensure_ascii=False)
    sql = f"""
with teacher as (
  select id from teacher_profiles where username = 'jbmonniere'
),
payload as (
  select $$ {json_payload} $$::jsonb as data
)
insert into teacher_content (user_id, data)
select teacher.id, payload.data
from teacher, payload
on conflict (user_id) do update
set data = jsonb_set(
  jsonb_set(
    coalesce(teacher_content.data, '{{}}'::jsonb),
    '{{subjects}}',
    coalesce(teacher_content.data->'subjects', '{{}}'::jsonb) || (excluded.data->'subjects'),
    true
  ),
  '{{bank}}',
  coalesce(teacher_content.data->'bank', '[]'::jsonb) || (excluded.data->'bank'),
  true
);
""".strip()
    return sql


def main():
    bank = build_bank()
    if len(bank) != 700:
        raise SystemExit(f"Expected 700 questions, got {len(bank)}")
    sql = build_sql(bank)
    out = Path("supabase/seed_culture_generale.sql")
    out.write_text(sql, encoding="utf-8")
    print(f"Wrote {out} with {len(bank)} questions.")


if __name__ == "__main__":
    main()
