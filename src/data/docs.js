'use strict';
// ---------------------------------------------------------------------------
// Documents. style: typed | hand | child | news. Pages are wrapped for you.
// ---------------------------------------------------------------------------

const DOCS = {
  news1: {
    title: 'THE BELLWOOD BEACON', style: 'news',
    pages: [
      'AUGUST 10, 2001 ........ 25 CENTS\n\nAQUARIUM OWNER TO BE HONORED\n\nWalter Vane, 67, founder of the Bellwood Aquarium, will receive the Town Service Award at the Rotary dinner on August 14.\n\n"I just feed the fish," Vane joked.',
      'The aquarium opened in 1976 and still draws visitors from as far as the city. Its octopus, "Mister Eight," has appeared on television twice.\n\nALSO: Pie of the week at Hal\'s is peach. Bake sale Saturday at the church. Lost: one red mitten.',
      'TIDES: High 6:12 AM, 6:40 PM.\nWEATHER: Sunny, 81.\n\nWELCOME to our newest resident, {name}, who moved into the house on Maple Street this weekend!',
    ],
  },
  news2: {
    title: 'THE BELLWOOD BEACON', style: 'news',
    pages: [
      'AUGUST 13, 2001 ........ 25 CENTS\n\nTEN YEARS LATER, NO WORD ON VANE BOY\n\nIt has been ten years since Evan Vane, then 11, left his father\'s home on Maple Street.',
      'Walter Vane told police at the time that his son packed a bag after an argument and took the evening bus to the city on Tuesday, August 13, 1991. He was never located.\n\n"We still keep him in our prayers," said Pastor Ellis.\n\nMr. Vane declined to comment for this story.',
      'ROTARY TO HONOR VANE TOMORROW - see page 4.\n\nANIMAL CLINIC reminds pet owners that cats can wander in the summer heat. Keep them indoors after dark.',
    ],
  },
  news3: {
    title: 'THE BELLWOOD BEACON', style: 'news', paper: '#e0d6b4',
    pages: [
      'AUGUST 15, 1991 ........ 25 CENTS\n\nTHE DEEP: FOUNDATION POURED\n\nA crew from Harbor Concrete worked at dawn this morning to pour the foundation for "The Deep," the Bellwood Aquarium\'s new 40,000-gallon exhibit.',
      '"This is the finish line," said owner Walter Vane, 57, who was at the site by 7 a.m. "After this, everything is going to be fine."\n\nThe exhibit is expected to open next spring.\n\nAsked about the rush, Vane said only: "It was ready."',
      'ROTARY dinner raises $2,000 for the new library.\n\nWEATHER: Rain overnight. Clearing by afternoon.',
    ],
  },
  poster_cat: {
    title: 'MISSING!', style: 'typed', paper: '#f8f8f0',
    pages: ['MARMALADE\n\nOrange tabby, 14 years old. Red collar with a little bell. VERY friendly. Answers to "Marm."\n\nLast seen Sunday evening, August 9, at the Bellwood Aquarium.\n\nPlease call Margaret Miller\n555-0142\n\nHe gets his breakfast at 7!'],
  },
  bday_card: {
    title: 'HAPPY BIRTHDAY SON!', style: 'hand',
    pages: ['Happy 21st, Evan.\n\nThe door is always open. Your room is just how you left it.\n\nCome home.\n\n- Dad'],
  },
  postcard: {
    title: 'GREETINGS FROM BELLWOOD!', style: 'hand',
    pages: ['June 1981\n\nTo: W. & E. Vane\n12 Maple Street, Bellwood\n\nWalt -\nSister is feeling better. Home Sunday.\nKiss Evan for me and don\'t let him eat the sand.\nProud of you and your fish.\n\nLove, Ruth'],
  },
  bus_schedule: {
    title: 'BELLWOOD LINE', style: 'typed', paper: '#e8e0c0',
    pages: ['DEPARTS MAIN STREET:\n7:15 AM\n12:40 PM\n6:15 PM\n\n* * * NOTICE * * *\nSERVICE TO BELLWOOD DISCONTINUED AS OF DECEMBER 31, 1984.\nTHANK YOU FOR RIDING.'],
  },
  spelling: {
    title: 'SPELLING - EVAN V.', style: 'child',
    pages: ['MAY 1991 - ROOM 5\n\n1. aquarium\n2. octopus\n3. tentacle\n4. family\n5. secret\n6. promise\n7. breathe\n\n100%!! Great job Evan! - Ms. O'],
  },
  notebook: {
    title: 'EVAN V. - PRIVATE!!!', style: 'child',
    pages: [
      '(that means you TOBY)\n\nTHINGS MISTER EIGHT CAN DO\n- open a jar\n- change color\n- squirt ink\n- know who I am\n\nHe knows me. He hides from the other kids but not me.',
      'Dad yelled because the new tank is late. He yells when the money is bad.\n\nMarm hid under my bed all night.',
      'Dad grabbed my arm again. It has fingers on it now. I told Ms. O I fell off my bike.\n\nI dont have a bike.',
      'When I grow up I am going to be a marine biologist. Or a guy who fixes pumps.\n\nThe pumps are the heart of the aquarium. Dad said that.',
      'Toby says the Deep is haunted.\n\nIt isnt even built yet!!\n\nDad says when the Deep opens everything will be ok.',
    ],
  },
  feeding_log: {
    title: 'FEEDING LOG - 1991', style: 'hand',
    pages: [
      '8/10 TANK 5 - 1 crab, 4 shrimp - W.V.\n8/11 TANK 5 - 1 crab, 4 shrimp - W.V.\n8/12 TANK 5 - a WHOLE crab because its my BIRTHDAY - E.\n8/13 TANK 5 - 1 crab - W.V.',
      '8/14  9:40 PM\nTANK 5 - 2 crabs\n\nHe took both. He knows its me.\nDad is at Rotary.\nDONT TELL.\n- E.',
      '8/15 TANK 5 - W.V.\n8/16 TANK 5 - W.V.\n8/17\n8/18\n8/19\n\n(The rest of the page is empty.)',
    ],
  },
  work_order: {
    title: 'WORK ORDER #0419', style: 'typed', paper: '#f0e0a0',
    pages: ['DATE: 7/29/91\nITEM: MAIN INTAKE VALVE (PUMP ROOM)\nPROBLEM: Cracked housing. Leaking under pressure. RISK OF FAILURE.\nACTION: REPLACE IMMEDIATELY.\nEST. COST: $1,850\n\nSTATUS: DEFERRED\n"After the Deep opens." - W.V.'],
  },
  phone_bill: {
    title: 'BELLWOOD TELEPHONE CO.', style: 'typed',
    pages: [
      'STATEMENT: W. VANE\nBELLWOOD AQUARIUM\nPERIOD: 8/1/91 - 8/31/91\n\nLOCAL CALLS:\n8/12  2:10 PM  HARBOR CONCRETE  2 MIN\n8/13  9:02 AM  ROTARY CLUB      5 MIN',
      '8/14  (NO CALLS)\n8/15  6:02 AM  HARBOR CONCRETE  4 MIN\n8/15  6:31 AM  HARBOR CONCRETE  1 MIN\n8/16  (NO CALLS)\n8/17 10:40 AM  SHERIFF          12 MIN',
    ],
  },
  concrete: {
    title: 'HARBOR CONCRETE & SUPPLY', style: 'typed', paper: '#f4f0e8',
    pages: ['DELIVERY TICKET #2217\nCUSTOMER: Bellwood Aquarium / W. Vane\nSITE: Tank 6 foundation (service pit)\n\nORDERED: 8/15/91 6:02 AM\nDELIVERED: 8/15/91 7:30 AM\n3 cubic yards\n\nNOTE: RUSH. Customer moved pour up from 8/22. Says pit is "ready now, no need to inspect."\n\nPAID CASH'],
  },
  report: {
    title: "BELLWOOD SHERIFF'S DEPT.", style: 'typed',
    pages: [
      'MISSING PERSON REPORT\nFILED: 8/17/91 10:48 AM\nSUBJECT: VANE, EVAN R.  AGE 11\nREPORTED BY: VANE, WALTER (FATHER)\n\nLAST SEEN: Evening of 8/13/91 at home, per father.',
      'Father states subject "packed a bag and took the bus to the city" after an argument. Father states subject "has problems" and "has done this before." No prior reports on file.\n\nNOTE: Bus service to Bellwood ended 1984. Father advised. Father states: "Then he hitched."',
      'Subject has asthma. Father states subject took inhaler with him.\n\nSTATUS: RUNAWAY.\nNo further action.',
    ],
  },
  toby_letter: {
    title: 'TOBY!!!', style: 'child',
    pages: ['Aug 12 (my BIRTHDAY)\n\nWednesday night Dad has the Rotary thing till late. I am going to the aquarium to feed Mister Eight at NIGHT. I have the back door key.\n\nYou HAVE to come. Meet at the fish statue 9:30. Bring your walkie.\n\nDONT TELL\n- E.V. (Radio Evan)'],
  },
  toby_diary: {
    title: 'PRIVATE - TOBY K.', style: 'child',
    pages: [
      'Aug 14\nI didnt go. Mom wouldnt let me out. I waited on the walkie til 11. He never answered.',
      'Aug 18\nMr. Vane says Evan ran away on the 13th. Thats not true. He was going to the aquarium on the 14th. I told the sheriff. The sheriff said Mr. Vane is a good man and I should stop.',
      'Sept 2\nWe are moving. Dad says its because of his job. I think its because of what I said.\n\nSept 3\nI left Evans letter in my desk in case somebody ever looks.',
    ],
  },
  recipe: {
    title: 'BRAISED', style: 'hand',
    pages: ['Aug 10\n\n3 hrs, low.\nCarrot, onion, thyme.\n\nMakes good sandwiches.\nNothing wasted.'],
  },
  vet: {
    title: 'BELLWOOD ANIMAL CLINIC', style: 'typed',
    pages: ['PATIENT: MARMALADE\nFELINE, MALE, 14 YRS\nOWNER: W. VANE\n\nVISIT: 7/30/01 - annual checkup\nWEIGHT: 11 lb\nTEETH: good\nHEART: good\n\nHEALTHY! See you next year!\n\n(A drawing of a smiling cat in the corner.)'],
  },
  memo: {
    title: 'MEMO', style: 'typed', paper: '#e8dcb0',
    pages: ['AUG 20, 1991\nTO: ALL STAFF\n\nEffective immediately, Tank 6 (THE DEEP) is closed indefinitely. The foundation work is complete.\n\nDo NOT open the service tunnel.\nDo not discuss with visitors.\n\n- W.V.'],
  },
  brochure_old: {
    title: 'COMING SUMMER 1991!', style: 'typed', paper: '#c8d8f0', ink: '#1a2a5a',
    pages: ['THE DEEP\n\nBellwood\'s biggest tank ever! 40,000 gallons of dark, cold water.\n\nMeet the strange creatures that live at the very bottom of the sea, where the light never reaches!\n\nBELLWOOD AQUARIUM - Where every visit is a family visit.'],
  },
  staff_rules: {
    title: 'STAFF RULES', style: 'typed',
    pages: ['1. WASH YOUR HANDS.\n2. DO NOT TAP ON THE GLASS.\n3. DON\'T FEED THE OCTOPUS AFTER 6 PM.\n4. OWNER ONLY MEANS OWNER ONLY.\n\nHours: 9 AM - 5 PM.\n\n- W.V.'],
  },
  records: {
    title: 'VANE, EVAN R. - GRADE 5', style: 'typed', paper: '#e8e4d8',
    pages: ['HEALTH: Asthma. Inhaler must be carried at all times.\n\nNOTES:\n5/2/91 - bruising, left forearm. Father says bicycle.\n6/10/91 - bruising, left forearm. Father says bicycle.\n\nRecommend follow-up.\n\n(No follow-up recorded.)'],
  },
  // --- things found in the Underneath
  design1: {
    title: 'TIDEWATER - DESIGN NOTES', style: 'typed', paper: '#e8e8e8',
    pages: ['SOFT HARBOR EDUCATIONAL SOFTWARE\nCLIENT: Bellwood Aquarium (W. Vane)\n\nGOAL: A gentle exploration game for kids who visit the aquarium. The player moves to Bellwood, gets a job at the aquarium, and learns about fish!'],
  },
  design2: {
    title: 'CLIENT NOTES', style: 'typed', paper: '#e8e8e8',
    pages: [
      '3/12/01 - Mr. Vane wants the town "exactly as it was." He mailed us four hundred photographs. He wants himself in the game as the guide. Fine.\n\nHe does NOT want his son in the game. Remove any reference.\n(We didn\'t know he had a son.)',
      '5/02/01 - Client asked for a locked room in the player\'s house. "Storage." He asked for a level under Tank 6. We said kids can\'t go down there. He said: "Good."',
      '5/30/01 - Client calls at 3 AM now. Wants a sandwich scene. We don\'t have a sandwich scene. He says: "You will."',
    ],
  },
  design3: {
    title: 'QA NOTES', style: 'typed', paper: '#e8e8e8',
    pages: ['8/13/01 - Build 0.9 contains a room none of us made. It\'s under the aquarium. Tim says it\'s a leftover. It isn\'t.\n\n8/15/01 - Mr. Vane passed away yesterday. We are shipping as is.\n\n- J.'],
  },
  note_kaylee: { title: '', style: 'child', paper: '#f0d8e0', pages: ['DO NOT FINISH THE GAME\n\nhe asks you to fix things.\ndont fix them.\n\nthe photo on the wall is not you'] },
  note_marcus: { title: '', style: 'hand', paper: '#d8e8d0', pages: ['day 3. why was my name on the badge already\n\ni ate the sandwich\ni ate the sandwich\ni ate the sandwich'] },
  kid_letter: { title: '', style: 'child', pages: ['is it morning yet'] },
};
