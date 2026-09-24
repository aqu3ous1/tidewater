// Screenshot every location. NODE_PATH=$(npm root -g) node tools/tour.js outdir [filter]
const path = require('path');
const { chromium } = require('playwright');
const SHOTS = [
  ['town_house', 'day=2&map=town&spawn=house'],
  ['town_main', 'day=2&map=town&spawn=diner'],
  ['town_aq', 'day=2&map=town&spawn=aquarium&x=-8&z=-58'],
  ['town_park', 'day=2&map=town&spawn=house&x=-26&z=58'],
  ['town_school', 'day=2&map=town&spawn=school'],
  ['town_pier', 'day=2&map=town&spawn=house&x=46&z=-94'],
  ['town_gas', 'day=2&map=town&spawn=gas'],
  ['town_evening', 'day=2&tod=evening&map=town&spawn=house&x=0&z=20'],
  ['town_night', 'day=5&tod=night&map=town&spawn=house&x=0&z=-16'],
  ['town_d7', 'day=7&map=town&spawn=aquarium&x=-4&z=-60'],
  ['town_d8', 'day=8&map=town&spawn=house&x=10&z=22'],
  ['town_d8n', 'day=8&tod=night&map=town&spawn=aquarium&x=0&z=-40&flags=leftAquariumFinal'],
  ['house_living', 'day=2&map=house&spawn=front'],
  ['house_kitchen', 'day=2&map=house&spawn=front&x=-4.5&z=-2'],
  ['house_hall', 'day=2&map=house&spawn=front&x=0&z=-6'],
  ['house_bed', 'day=2&map=house&spawn=bed'],
  ['evanroom', 'day=7&tod=night&map=evanroom&spawn=front'],
  ['aq_lobby', 'day=2&map=aquarium&spawn=front&x=0&z=10'],
  ['aq_hall', 'day=2&map=aquarium&spawn=hall'],
  ['aq_hall2', 'day=2&map=aquarium&spawn=hall&x=0&z=-22'],
  ['aq_pengu', 'day=2&map=aquarium&spawn=hall&x=-19&z=-12'],
  ['aq_corr', 'day=2&map=aquarium&spawn=corridor&x=30&z=-25'],
  ['aq_kitchen', 'day=4&map=aquarium&spawn=kitchen'],
  ['aq_office', 'day=6&map=aquarium&spawn=kitchen&x=31.5&z=-32&flags=officeOpen,walterSpot=asleep'],
  ['aq_staff', 'day=2&map=aquarium&spawn=kitchen&x=49.5&z=-33'],
  ['aq_old', 'day=8&map=aquarium&spawn=hall&x=0&z=-20'],
  ['aq_night7', 'day=7&tod=night&map=aquarium&spawn=hall&x=0&z=-18'],
  ['pump', 'day=8&map=basement&spawn=stairs'],
  ['chamber', 'day=8&map=basement&spawn=chamber&flags=tunnelOpen'],
  ['diner', 'day=3&map=diner&spawn=front'],
  ['market', 'day=3&map=market&spawn=front'],
  ['gas', 'day=7&map=gas&spawn=front&flags=garageOpen'],
  ['garage', 'day=7&map=gas&spawn=garage&flags=garageOpen'],
  ['laundry', 'day=3&map=laundry&spawn=front'],
  ['church', 'day=3&map=church&spawn=front'],
  ['kessler', 'day=7&map=kessler&spawn=front'],
  ['miller', 'day=2&tod=afternoon&map=miller&spawn=front'],
  ['school_hall', 'day=3&map=school&spawn=front'],
  ['school_room5', 'day=3&map=school&spawn=front&x=-7&z=-4'],
  ['under_arrive', 'day=8&tod=night&map=underneath&spawn=arrive'],
  ['under_hub', 'day=8&tod=night&map=underneath&spawn=hub&x=0&z=-26'],
];
(async () => {
  const out = process.argv[2] || '.';
  const filt = process.argv[3];
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, q] of SHOTS) {
    if (filt && !name.includes(filt)) continue;
    const p = await b.newPage({ viewport: { width: 640, height: 480 } });
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('file://' + path.resolve(__dirname, '..', 'index.html') + '?debug&' + q);
    await p.waitForTimeout(1300);
    await p.screenshot({ path: path.join(out, name + '.png') });
    if (errs.length) console.log(name, errs.join(' | '));
    await p.close();
  }
  await b.close();
  console.log('done');
})();
