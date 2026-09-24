'use strict';
// ---------------------------------------------------------------------------
// Items. cat: undefined = inventory; collection cats = counted in COLLECTION.
// Secret things are ordinary inventory items with almost nothing to say.
// ---------------------------------------------------------------------------

const late = (st) => st.day >= 8 || st.flags.ghostMet;

const ITEMS = {
  // ---------------------------------------------------------- everyday
  key_house: { name: 'HOUSE KEY', icon: 'key_house', desc: (st) => late(st) ? 'The key to 12 Maple Street. The paper tag says VANE. It always did.' : 'The key to 12 Maple Street. There is a paper tag on the ring, but the writing has faded.' },
  milk: { name: 'MILK', icon: 'milk', desc: 'A carton of whole milk. Cold.' },
  trash: { name: 'TRASH BAG', icon: 'trash', desc: 'Packing paper and flattened boxes.' },
  fish_bucket: { name: 'BUCKET OF FISH', icon: 'bucket', desc: 'Smelt, on ice. For the penguins.' },
  filter: { name: 'TANK FILTER', icon: 'filter', desc: 'A new filter cartridge. The box says TANK 3.' },
  umbrella: { name: 'UMBRELLA', icon: 'umbrella', desc: "Mrs. Miller's purple umbrella. The handle is a little wooden duck." },
  cookie: { name: 'OATMEAL COOKIE', icon: 'cookie', desc: 'From Mrs. Miller. Still soft.', verbs: () => ['EAT'], use: async (S) => { S.take('cookie'); S.sfx('eat'); await S.wait(1.2); await S.say(null, 'You eat the cookie. It\'s very good.'); } },
  lettuce: { name: 'LETTUCE', icon: 'lettuce', desc: 'Romaine lettuce. For the turtles.' },
  tuna: { name: 'TUNA MELT', icon: 'tuna', desc: "Walter's lunch from Hal's Diner. It's wrapped in wax paper and still hot." },
  sandwich: {
    name: 'SANDWICH', icon: 'sandwich',
    desc: (st) => st.flags.knowsCat ? 'A sandwich on white bread, wrapped in wax paper. It is still warm.' : 'A sandwich on white bread, wrapped in wax paper. It\'s still warm.',
    verbs: () => ['EAT', 'THROW AWAY'], use: async (S, v) => Story.sandwich(S, v),
  },
  brochures: { name: 'BROCHURES', icon: 'brochure', desc: 'A stack of aquarium brochures for Bellwood Elementary.' },
  bulbs: { name: 'LIGHT BULBS', icon: 'bulbs', desc: (st) => 'Replacement bulbs for the main hall. ' + (3 - (st.flags.bulbsDone || 0)) + ' left.' },
  notebook: { name: "EVAN'S NOTEBOOK", icon: 'notebook', desc: 'A blue spiral notebook from the school lost and found. EVAN V. is written on the cover in marker.', doc: 'notebook' },
  garage_key: { name: 'GARAGE KEY', icon: 'key_garage', desc: "Gus's key to the back garage. A tag says 'W.V. CAR'." },
  kessler_key: { name: 'SPARE KEY', icon: 'key_small', desc: 'A spare key to the house at 9 Maple Street. The tag says KESSLER.' },
  room_key: { name: 'SMALL BRASS KEY', icon: 'key_small', desc: 'The key to the locked room in your house. It\'s warm, like someone was holding it for a long time.' },
  key_t6: { name: 'KEY', icon: 'key_t6', desc: 'A key with a strange label: T6 ↓' },
  backpack: {
    name: 'BLUE BACKPACK', icon: 'backpack', desc: 'A child\'s blue backpack. It has been kept very clean.',
    verbs: (st) => (st.flags.backpackOpened ? [] : ['OPEN']), use: async (S) => Story.openBackpack(S),
  },
  tape12: {
    name: "CASSETTE: 'RADIO SHOW #12'", icon: 'tape', desc: (st) => st.flags.playedTape ? "Handwritten label: RADIO EVAN #12 — 8/14. You've heard it." : 'Handwritten label: RADIO EVAN #12 — 8/14. It\'s still in the tape recorder.',
    verbs: () => ['PLAY'], use: async (S) => Story.playTape12(S),
  },
  inhaler: { name: 'INHALER', icon: 'inhaler', desc: "A child's asthma inhaler. The pharmacy label says: VANE, EVAN. CARRY AT ALL TIMES." },
  radio3: {
    name: "TAPE: 'RADIO EVAN #3'", icon: 'tape', cat: 'hood', inv: true, desc: 'A cassette from the laundromat lost and found. The label is in marker: RADIO EVAN #3.',
    verbs: () => ['PLAY'], use: async (S) => Story.playRadio3(S),
  },
  bday_card: { name: 'BIRTHDAY CARD', icon: 'card', cat: 'hood', inv: true, desc: 'Addressed to EVAN VANE, 12 MAPLE STREET. No return address.', doc: 'bday_card' },
  photo_you: { name: 'PHOTOGRAPH (A)', icon: 'photo', photo: 'ph_you_walter', desc: 'Walter, and a child in a brass diving helmet, in front of the aquarium.' },
  photo_family: { name: 'PHOTOGRAPH (B)', icon: 'photo_old', photo: 'ph_family', desc: 'Walter, a woman, and a boy holding an orange kitten. On the back: "Ruth, Evan & the new cat. Easter 1987."' },
  photo_gap: { name: 'PHOTOGRAPH (C)', icon: 'photo', photo: 'ph_gap', desc: 'Walter alone in front of the aquarium. Someone standing next to him has been cut out with scissors.' },

  // ---------------------------------------------------------- evidence
  feeding_log: { name: 'FEEDING LOG, 1991', icon: 'log', desc: 'A green binder of feeding logs from 1991. The last page is in a child\'s handwriting.', doc: 'feeding_log' },
  work_order: { name: 'WORK ORDER #0419', icon: 'workorder', desc: 'A yellow work order from the pump room clipboard.', doc: 'work_order' },
  phone_bill: { name: 'PHONE BILL, AUG 1991', icon: 'phonebill', desc: 'An old phone bill from Walter\'s filing cabinet.', doc: 'phone_bill' },
  concrete: { name: 'DELIVERY TICKET', icon: 'receipt', desc: 'A delivery ticket from Harbor Concrete & Supply, from the glovebox of Walter\'s old car.', doc: 'concrete' },
  report: { name: 'MISSING PERSON REPORT', icon: 'report', desc: 'A photocopy of a sheriff\'s report, folded into quarters and kept in Walter\'s desk.', doc: 'report' },
  toby_letter: { name: 'LETTER TO TOBY', icon: 'letter', desc: 'A letter folded into a triangle, the way kids pass notes. It was in a desk drawer at the Kessler house.', doc: 'toby_letter' },
  tooth: { name: 'TOOTH', icon: 'tooth', desc: 'A small tooth.' },
  fabric: { name: 'FABRIC', icon: 'fabric', desc: 'A piece of striped fabric. Stained.' },
  shoe: { name: 'SHOE', icon: 'shoe', desc: "A small child's shoe." },

  // ---------------------------------------------------------- secret
  collar: { name: 'COLLAR', icon: 'collar', desc: 'A small bell on a red collar. The tag says MARM—. The rest is worn off.' },
  recipe: { name: 'RECIPE CARD', icon: 'recipe', desc: 'An index card that was held to the staff fridge with a magnet.', doc: 'recipe' },
  vet: { name: 'VET PAPERS', icon: 'vet', desc: 'A checkup form from the Bellwood Animal Clinic.', doc: 'vet' },
  burned_photo: { name: 'BURNED PHOTOGRAPH', icon: 'photo_old', desc: 'Most of it is gone. What\'s left: a small hand, holding an orange kitten.' },
  toby_diary: { name: "TOBY'S DIARY", icon: 'notebook', desc: 'A small diary with a lock that doesn\'t work.', doc: 'toby_diary' },

  // ---------------------------------------------------------- AQUARIUM collection
  badge: { name: 'STAFF BADGE', icon: 'badge', cat: 'aquarium', desc: (st) => late(st) ? 'BELLWOOD AQUARIUM - STAFF. Your name is typed on it. It was typed before you ever came to Bellwood.' : 'BELLWOOD AQUARIUM - STAFF. Your name is already typed on it.' },
  ticket: { name: 'OPENING DAY TICKET', icon: 'ticket', cat: 'aquarium', desc: 'ADMIT ONE. Bellwood Aquarium grand opening, June 12, 1976. Fifty cents.' },
  brochure_old: { name: 'OLD BROCHURE', icon: 'brochure', cat: 'aquarium', desc: 'A faded brochure from the storage room.', doc: 'brochure_old' },
  mitten: { name: 'LOST MITTEN', icon: 'mitten', cat: 'aquarium', desc: "A child's red mitten. It's the middle of August." },
  sunglasses: { name: 'TOURIST SUNGLASSES', icon: 'sunglasses', cat: 'aquarium', desc: 'Big plastic sunglasses left on the penguin bench. There\'s still a $4.99 sticker on one lens.' },
  photo_staff: { name: 'STAFF PHOTO, 1991', icon: 'photo_old', cat: 'aquarium', photo: 'ph_staff_1991', desc: 'Summer 1991. Walter, two teenagers in aquarium shirts, and a boy in a JUNIOR KEEPER shirt. On the back: "The crew. E. insisted on being in it."' },
  photo_cat: { name: 'WALTER & MARMALADE', icon: 'photo', cat: 'aquarium', photo: 'ph_walter_cat', desc: 'Walter on a porch with an orange cat on his shoulder. On the back: "Marm, 14 years young!"' },
  memo: { name: 'STAFF MEMO, 1991', icon: 'doc_old', cat: 'aquarium', desc: 'A memo from a file folder marked THE DEEP.', doc: 'memo' },
  fossil: { name: 'SHARK TOOTH FOSSIL', icon: 'fossil', cat: 'aquarium', desc: 'From the FREE! bowl in the gift shop. The card says it is ten million years old.' },
  game_disc: { name: 'TIDEWATER (GAME)', icon: 'brochure', cat: 'aquarium', photo: (st) => late(st) ? 'game_box_you' : 'game_box', desc: (st) => late(st) ? 'TIDEWATER: A Bellwood Aquarium Adventure. The cover shows a child in a diving helmet holding an old man\'s hand.' : 'TIDEWATER: A Bellwood Aquarium Adventure. "For ages 6 and up." The cover has a cartoon fish on it.' },

  // ---------------------------------------------------------- NEIGHBORHOOD collection
  news1: { name: 'BEACON, AUG 10', icon: 'newspaper', cat: 'hood', desc: 'The Bellwood Beacon.', doc: 'news1' },
  news2: { name: 'BEACON, AUG 13', icon: 'newspaper', cat: 'hood', desc: 'The Bellwood Beacon.', doc: 'news2' },
  news3: { name: 'BEACON, AUG 15', icon: 'newspaper', cat: 'hood', desc: 'The Bellwood Beacon. The paper is yellow.', doc: 'news3' },
  poster_cat: { name: 'MISSING POSTER', icon: 'poster', cat: 'hood', desc: 'Mrs. Miller made these herself.', doc: 'poster_cat' },
  drawing_cat: { name: 'CRAYON DRAWING', icon: 'drawing', cat: 'hood', photo: 'dr_cat', desc: 'A crayon drawing of a boy and an orange cat. It was under the locked door in your house.' },
  postcard: { name: 'POSTCARD, 1981', icon: 'postcard', cat: 'hood', desc: 'Found behind the radiator in your living room. On the front: the Bellwood Aquarium.', doc: 'postcard' },
  bus_schedule: { name: 'BUS SCHEDULE', icon: 'schedule', cat: 'hood', desc: 'Peeled off the old sign on Main Street.', doc: 'bus_schedule' },
  toy_octopus: { name: 'TOY OCTOPUS', icon: 'toy_octo', cat: 'hood', desc: 'A purple rubber octopus. One of its legs has been chewed flat.' },
  spelling: { name: 'SPELLING TEST', icon: 'doc', cat: 'hood', desc: 'Found in a desk in Room 5.', doc: 'spelling' },

  // ---------------------------------------------------------- FISH CARDS
  fc1: { name: '#1 CLOWNFISH', icon: 'fishcard', cat: 'fish', desc: 'Clownfish live safely inside stinging sea anemones. Every clownfish is born a boy.' },
  fc2: { name: '#2 BLUE TANG', icon: 'fishcard', cat: 'fish', desc: 'When a blue tang is scared, it lies on its side and plays dead.' },
  fc3: { name: '#3 MOON JELLY', icon: 'fishcard', cat: 'fish', desc: 'Moon jellies are 95% water. Jellyfish were here before the dinosaurs.' },
  fc4: { name: '#4 SEAHORSE', icon: 'fishcard', cat: 'fish', desc: 'Seahorse dads carry the babies until they are born.' },
  fc5: { name: '#5 GREEN SEA TURTLE', icon: 'fishcard', cat: 'fish', desc: 'A green sea turtle can hold its breath for five hours while it sleeps.' },
  fc6: { name: '#6 OCTOPUS', icon: 'fishcard', cat: 'fish', desc: 'An octopus has three hearts and blue blood. It can remember faces for months.' },
  fc7: { name: '#7 PENGUIN', icon: 'fishcard', cat: 'fish', desc: 'Penguins cannot fly, but they can swim 22 miles per hour.' },
  fc8: { name: '#8 MOORISH IDOL', icon: 'fishcard', cat: 'fish', desc: 'Moorish idols hate living in tanks. Some stop eating.' },
  fc9: { name: '#9 HERMIT CRAB', icon: 'fishcard', cat: 'fish', desc: 'Hermit crabs move into bigger shells as they grow. They leave the old ones behind.' },
  fc10: { name: '#10 SEA STAR', icon: 'fishcard', cat: 'fish', desc: 'If a sea star loses an arm, it grows a new one.' },
  fc11: { name: '#11 LANTERNFISH', icon: 'fishcard', cat: 'fish', desc: 'Lanternfish live in the deep, dark water. At night they come up to the surface.' },
  fc12: { name: '#12 ANGLERFISH', icon: 'fishcard', cat: 'fish', desc: 'THE DEEP. This card was never printed.' },

  // ---------------------------------------------------------- SHELLS
  shell1: { name: 'BLUE SHELL', icon: 'shell', cat: 'shells', desc: 'A small blue shell from the beach by the pier.' },
  shell2: { name: 'BLUE SHELL', icon: 'shell', cat: 'shells', desc: 'A small blue shell. It was half buried near the pier.' },
  shell3: { name: 'BLUE SHELL', icon: 'shell', cat: 'shells', desc: 'A small blue shell from the reeds by the park pond. Nobody knows how it got there.' },
};

const COLLECTION_CATS = {
  aquarium: { name: 'AQUARIUM', icon: 'badge', items: ['badge', 'ticket', 'brochure_old', 'mitten', 'sunglasses', 'photo_staff', 'photo_cat', 'memo', 'fossil', 'game_disc'] },
  hood: { name: 'NEIGHBORHOOD', icon: 'drawing', items: ['news1', 'news2', 'news3', 'poster_cat', 'drawing_cat', 'bday_card', 'postcard', 'bus_schedule', 'toy_octopus', 'spelling', 'radio3'] },
  fish: { name: 'FISH CARDS', icon: 'fishcard', items: ['fc1', 'fc2', 'fc3', 'fc4', 'fc5', 'fc6', 'fc7', 'fc8', 'fc9', 'fc10', 'fc11', 'fc12'] },
  shells: { name: 'BLUE SHELLS', icon: 'shell', items: ['shell1', 'shell2', 'shell3'] },
};

// Items that prove something. Used by REMEMBER.
const EVIDENCE = ['feeding_log', 'toby_letter', 'work_order', 'tape12', 'tooth', 'fabric', 'phone_bill', 'concrete', 'shoe', 'report', 'inhaler'];
