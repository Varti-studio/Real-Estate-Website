import { unsplash } from './stays'

/** Something to do near a stay, shown on its booking confirmation ("While you are there"). */
export interface Experience {
  id: string
  /** `Stay.id` it is offered near. */
  stayId: string
  title: string
  hours: number
  /** Per person, in EUR. */
  priceFrom: number
  image: string
  alt: string
}

type Row = [id: string, title: string, hours: number, priceFrom: number, photo: string, alt: string]

/** Compact rows for one stay: id, title, hours, price from (EUR), Unsplash photo id, alt. */
const near = (stayId: string, rows: Row[]): Experience[] =>
  rows.map(([id, title, hours, priceFrom, photo, alt]) => ({ id: `${stayId}-${id}`, stayId, title, hours, priceFrom, image: unsplash(photo, 800), alt }))

/** Four per stay, in card order. A stay without any hides the section. */
export const experiences: Experience[] = [
  {
    id: 'ridge-walk',
    stayId: 'canopy-treehouse',
    title: 'Ridge walk with Ingrid',
    hours: 3,
    priceFrom: 45,
    image: unsplash('1566893702043-ee439a981a31', 800),
    alt: 'A hiker with a backpack on a rocky ridge, looking down at a lake through drifting cloud',
  },
  {
    id: 'fjord-kayak',
    stayId: 'canopy-treehouse',
    title: 'Fjord kayak at dawn',
    hours: 4,
    priceFrom: 90,
    image: unsplash('1661698048545-7c34b2004116', 800),
    alt: 'A red kayak on a fjord under low cloud, with steep green mountains behind',
  },
  {
    id: 'village-bakery',
    stayId: 'canopy-treehouse',
    title: 'Village bakery and cheese',
    hours: 2,
    priceFrom: 30,
    image: unsplash('1743193144224-d2db90ea7784', 800),
    alt: 'A loaf of bread, a cut soft cheese and a honey dipper on a wooden board',
  },
  {
    id: 'flam-railway',
    stayId: 'canopy-treehouse',
    title: 'Flåm railway day trip',
    hours: 6,
    priceFrom: 120,
    image: unsplash('1584060071978-7684c890ecca', 800),
    alt: 'A green train curving along a mountain track below grey rock',
  },

  ...near('ljos-dome', [
    ['silfra-snorkel', 'Silfra fissure snorkel', 3, 150, '1678016315458-3806831fe7fc', 'Clear water over a sandy floor, rocks and green algae, seen from below the surface'],
    ['golden-circle', 'Gullfoss and Geysir by jeep', 6, 120, '1603226851957-1768f812309b', 'A wide waterfall dropping into a misty canyon below green slopes'],
    ['icelandic-horse', 'Icelandic horse ride', 2, 90, '1482779665037-990b5b461e91', 'Two dark horses touching noses on a grassy plain below mountains'],
    ['rye-bread', 'Hot-spring rye bread at Laugarvatn', 2, 35, '1549931319-a545dcf3bc73', 'A sliced loaf of dark bread on a wooden board'],
  ]),
  ...near('speglhus', [
    ['telemark-canal', 'Telemark canal by boat', 5, 75, '1638018621584-f9e0380f46d6', 'A narrow boat moored on a misty canal beside a grassy bank'],
    ['gaustatoppen', 'Gaustatoppen summit hike', 5, 60, '1643793655703-491446d0bc67', 'Rocky peaks under low grey cloud'],
    ['heddal-stave-church', 'Heddal stave church', 2, 25, '1616263674612-842b02a25dbe', 'A dark timber stave church with stacked roofs above a churchyard'],
    ['floating-sauna', 'Floating sauna and lake swim', 2, 40, '1776150870249-642ca0996d71', 'A small black sauna on a pontoon moored on a calm lake'],
  ]),
  ...near('ala-capsule', [
    ['fecha-de-barjas', 'Fecha de Barjas waterfall swim', 3, 20, '1764957080504-1773a29072a3', 'A waterfall falling into a clear pool between mossy rocks'],
    ['geira', 'Geira Roman road walk', 4, 25, '1761324637187-e99575f425b1', 'An old dry-stone wall beside a grassy path'],
    ['lindoso', 'Lindoso castle and granaries', 2, 15, '1686292534295-b744fab83720', 'Granite granaries raised on stone legs below a blue sky'],
    ['canicada-kayak', 'Kayak on the Caniçada reservoir', 3, 40, '1521336575822-6da63fb45455', 'The bow of an orange kayak on a lake between steep hills'],
  ]),
  ...near('kiefer-haus', [
    ['lake-canoe', 'Lake canoe in the Uckermark', 3, 45, '1621114466580-8e1b49318e25', 'A person paddling a red canoe on a calm lake edged with trees'],
    ['grumsin-forest', 'Grumsin beech forest walk', 3, 30, '1599384265346-2fb0ae582540', 'A walker on a dirt track between tall beech trees'],
    ['farm-bakery', 'Farm bakery morning', 2, 30, '1656945731569-d621bfce4ca3', 'A sourdough loaf cut open beside another on a table'],
    ['lake-cycle', 'Cycle between the lakes', 4, 40, '1785844670865-db65fd717050', 'A cyclist on a wet country road between green fields'],
  ]),
  ...near('taiga-domes', [
    ['husky-safari', 'Husky safari', 3, 160, '1647591413270-469a0393da0c', 'A dog team pulling a sled across open snow'],
    ['reindeer-farm', 'Reindeer farm visit', 2, 85, '1591634286615-bc165270d948', 'A harnessed reindeer beside a sleigh in a snowy yard'],
    ['snowmobile', 'Snowmobile into the fells', 3, 140, '1547494668-69e7cca0af05', 'A rider on a snowmobile crossing a snowfield'],
    ['ice-fishing', 'Ice fishing on the lake', 3, 90, '1516912938509-1fee231102aa', 'A person on a stool fishing through a hole in lake ice at dusk'],
  ]),
  ...near('casa-socalco', [
    ['sao-lourenco', 'Ponta de São Lourenço walk', 4, 45, '1630061945673-6b40216122de', 'A green headland falling to the sea under cloud'],
    ['pico-arieiro', 'Pico do Arieiro to Ruivo', 5, 60, '1746523812328-74b97419f828', 'Stone steps along a steep ridge into cloud'],
    ['madeira-wine', 'Madeira wine lodge tasting', 2, 40, '1598915850233-e1e178c0e2c3', 'A bottle of Madeira wine on a table'],
    ['whale-watching', 'Whale and dolphin boat trip', 3, 70, '1520646924857-261be3037bc7', 'A whale tail above dark water below misty mountains'],
  ]),
  ...near('rimal-dome', [
    ['jeep-canyons', 'Jeep through the canyons', 4, 70, '1551171128-2618b95729db', 'A pickup truck parked on red sand below rock walls'],
    ['camel-sunset', 'Camel ride at sunset', 2, 50, '1510952267577-fc96d5ca660a', 'A man leading camels across desert sand'],
    ['petra', 'Petra day trip', 8, 140, '1691783639104-806ca12a9a8f', 'The Treasury carved into a rose-red cliff at Petra'],
    ['bedouin-tea', 'Bedouin tea and zarb supper', 2, 40, '1724618641221-5c3387cb5a9e', 'Tea poured into small glasses on the sand'],
  ]),
  ...near('betonloft', [
    ['brutalist-walk', 'Brutalist Berlin walk', 3, 40, '1546414701-81cc6963c67f', 'A grey concrete building of stacked, stepped blocks'],
    ['neue-nationalgalerie', 'Neue Nationalgalerie', 2, 25, '1723984623268-fd040d21f57c', 'A glass hall under a flat black steel roof'],
    ['spreewald-kayak', 'Spreewald kayak', 4, 45, '1480480565647-1c4385c7c0bf', 'A kayaker on a quiet channel between trees'],
    ['coffee-roastery', 'Coffee roastery tasting', 2, 30, '1511537190424-bbbab87ac5eb', 'Roasted coffee beans turning in a roaster drum'],
  ]),
  ...near('dar-ocre', [
    ['atlas-villages', 'Atlas foothill villages', 5, 60, '1757163565861-20f28c181cc4', 'Earth-coloured houses on a rocky mountainside'],
    ['medina-walk', 'Marrakech medina with a guide', 4, 45, '1548018560-4cb48a8837c1', 'A carved stone courtyard with a tiled arch in a madrasa'],
    ['tagine-class', 'Tagine cooking class', 3, 55, '1519624014191-508652cbd7b5', 'A stew with herbs in a black dish beside a tagine lid'],
    ['agafay-camels', 'Camel ride across Agafay', 2, 50, '1743890914342-8d18f331055a', 'A line of riders on camels crossing stony desert'],
  ]),
  ...near('flyt-cabin', [
    ['hardanger-kayak', 'Hardanger fjord kayak', 4, 90, '1521336575822-6da63fb45455', 'The bow of an orange kayak on a fjord between steep mountains'],
    ['cider-farm', 'Cider farm tasting', 2, 35, '1600917016506-556622b74303', 'Red apples on the grass under orchard trees'],
    ['trolltunga', 'Trolltunga hike', 10, 140, '1502021680532-838cfc650323', 'A person on a rock ledge high above a lake in mist'],
    ['waterfalls', 'Hardanger waterfalls drive', 4, 45, '1589989615298-b6968cbc2865', 'A broad waterfall falling through forest'],
  ]),
  ...near('casa-palafita', [
    ['rice-fields', 'Rice fields by bike', 3, 35, '1592997572594-34be01bc36c7', 'Ripe rice heads in close-up'],
    ['sado-dolphins', 'Sado estuary dolphins', 3, 55, '1580072624564-1fe6b660b7e2', 'Two dolphins surfacing side by side'],
    ['beach-ride', 'Horse ride on the beach', 2, 75, '1618066860737-df4d383c98c3', 'Riders on horseback on a pale sand beach'],
    ['carrasqueira', 'Carrasqueira pier and seafood lunch', 2, 45, '1507911618740-de629a41dd34', 'Small wooden boats tied along a jetty'],
  ]),
  ...near('dimstuga', [
    ['aurora-walk', 'Northern lights photo walk', 3, 85, '1483347756197-71ef80e95f73', 'Green aurora above a dark line of trees'],
    ['moose-safari', 'Moose safari at dusk', 3, 95, '1602391950852-88bf9be72b24', 'A moose wading in a still lake'],
    ['snowshoe', 'Snowshoe trail through the forest', 3, 55, '1576866946478-8d0d015bf3e5', 'Four people on snowshoes in a snowy forest'],
    ['sami-herder', 'Visit a Sámi reindeer herder', 3, 80, '1614587282264-e32c48e2ac79', 'A person kneeling in the snow beside a reindeer'],
  ]),
  ...near('casa-monolite', [
    ['la-maddalena', 'Boat to La Maddalena', 7, 110, '1571831693821-352cc8c08241', 'Pale granite rocks over turquoise water'],
    ['granite-coast', 'Granite coast walk', 3, 35, '1681550406626-b08ec95164a9', 'Rounded granite hills under a hazy sky'],
    ['vermentino', 'Vermentino winery visit', 2, 40, '1563514227147-6d2ff665a6a0', 'Rows of vines in low sun'],
    ['cork-woods', 'Cork oak woods near Tempio', 4, 45, '1698075957695-308d15d0771f', 'A broad old oak standing alone in a field'],
  ]),
  ...near('nordlys-dome', [
    ['orca-safari', 'Orca and whale safari', 5, 160, '1721750887731-a0c76043092d', 'Orcas surfacing in a fjord below green hills'],
    ['ski-touring', 'Ski touring with a guide', 6, 180, '1616429553002-faf23468952d', 'A skier climbing a snowy slope below a peak'],
    ['fjord-fishing', 'Fjord fishing trip', 3, 90, '1616072224282-c2696dc9853b', 'A small boat on a fjord below snowy mountains'],
    ['reindeer-camp', 'Sámi reindeer camp', 3, 110, '1512927638316-b12f8c1abcc4', 'A herd of reindeer on open ground below mountains'],
  ]),
]
