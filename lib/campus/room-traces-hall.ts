import type {PhotoObject, PhotoRoom} from './photo-room-layout';

// These coordinates are an explicitly approximate depth trace of the named photos.
// Camera position is (0, 1.65, 0); centre longitude faces -Z.
// A seat and a thin back preserve the visible open spaces better than a chair-shaped block.
const hallChair = (label:string,x:number,z:number):PhotoObject[] => [
  {label:label+' seat',x,y:.47,z,w:.50,h:.09,d:.50},
  {label:label+' back',x,y:.79,z:z+.22,w:.50,h:.56,d:.055},
];

export const hallTraces:PhotoRoom[] = [
  {
    image:'guangqiantang-1.jpg',
    title:'Kong Chen Hall · 光前堂',
    source:'https://www.chonghwakl.edu.my/campusfacilities/cfac-guangqiantang/',
    cameraHeight:1.65,
    yaw:0,
    bounds:{minX:-15,maxX:15,minZ:-23,maxZ:17,height:7.1},
    ceiling:{ridgeHeight:9.2,axis:'z'},
    walkRadius:1.5,
    objects:[
      // The red stage front is at the centre of the panorama, beneath the screen.
      {label:'Red stage platform visible below the stage curtain',x:0,y:.47,z:-18.5,w:18.2,h:.94,d:5.0},
      {label:'Left stage proscenium',x:-9.4,y:3.6,z:-21,w:1.2,h:7.2,d:1.1},
      {label:'Right stage proscenium',x:9.4,y:3.6,z:-21,w:1.2,h:7.2,d:1.1},
      // Long balcony edges and supporting columns are visible on both side walls.
      {label:'Left balcony fascia',x:-13.35,y:3.45,z:-2,w:3.3,h:.60,d:31},
      {label:'Right balcony fascia',x:13.35,y:3.45,z:-2,w:3.3,h:.60,d:31},
      {label:'Left balcony column nearest the side aisle',x:-11.85,y:1.65,z:-1.5,w:.55,h:3.3,d:.55},
      {label:'Right balcony column nearest the side aisle',x:11.85,y:1.65,z:-1.5,w:.55,h:3.3,d:.55},
      // Six individually traced nearby white chairs. Distant rows stay in the photograph.
      ...hallChair('Near left-front white chair',-.72,-.48),
      ...hallChair('Near right-front white chair',.69,-.86),
      ...hallChair('Near left-rear white chair',-.68,.86),
      ...hallChair('Near right-rear white chair',.78,.77),
      ...hallChair('White chair ahead on the left',-1.92,-.71),
      ...hallChair('White chair ahead near the centre aisle',-.80,-2.08),
      ...hallChair('White chair ahead on the right',1.79,-.85),
    ],
    notes:[
      'The source visibly places the black-curtained stage and red stage front straight ahead, side balconies on both sides, and white plastic chairs around the camera.',
      'The nearest visible chairs have separate shallow seat and back surfaces; their spacing is traced individually rather than generated as a seating grid.',
      'Hall dimensions and balcony depth are estimates from a single panorama. The high ceiling is a simple two-plane envelope for the photographed roof profile, not a measured roof model.',
      'Movement stays within 1.5 metres of the capture point because the photograph does not reveal the hidden backs of furniture or a complete floor plan.',
    ],
  },
  {
    image:'xingzhenglouxiaolitang-1.jpg',
    title:'Administration small hall · 小礼堂',
    source:'https://www.chonghwakl.edu.my/campusfacilities/cfac-xingzhenglouxiaolitang/',
    cameraHeight:1.65,
    yaw:0,
    bounds:{minX:-8.5,maxX:8.5,minZ:-9,maxZ:8,height:6.3},
    walkRadius:1.5,
    objects:[
      // The blue-framed artwork exhibition is the dominant near left-hand structure.
      {label:'Nearest blue-framed artwork display on the left',x:-2.3,y:1.40,z:.2,w:.075,h:1.65,d:1.7},
      {label:'Next blue-framed artwork display towards the passage',x:-2.3,y:1.40,z:-1.55,w:.075,h:1.65,d:1.7},
      {label:'Blue-framed artwork display behind the camera left',x:-2.3,y:1.40,z:1.95,w:.075,h:1.65,d:1.7},
      {label:'End artwork panel beside the central passage',x:-1.00,y:1.35,z:-3.80,w:1.65,h:1.50,d:.075},
      // Three cloth-covered display tables can be distinguished in the right half.
      {label:'Cloth-covered table ahead with artwork',x:1.12,y:.40,z:-2.55,w:1.55,h:.80,d:.85},
      {label:'Nearest cloth-covered table to the right',x:1.83,y:.40,z:-.05,w:.95,h:.80,d:1.80},
      {label:'Cloth-covered table behind on the right',x:1.92,y:.40,z:2.25,w:.95,h:.80,d:1.80},
      {label:'Left upper balcony white fascia',x:-6.9,y:3.16,z:-.5,w:3.2,h:.65,d:16},
      {label:'Right upper balcony white fascia',x:6.9,y:3.16,z:-.5,w:3.2,h:.65,d:16},
      {label:'Upper balcony over the passage ahead',x:0,y:3.20,z:-7.8,w:10.6,h:.60,d:2.4},
      {label:'Column at the right of the central passage',x:2.65,y:1.45,z:-5.15,w:.52,h:2.9,d:.52},
    ],
    notes:[
      'This photograph shows an art exhibition in the small hall: blue-framed artwork boards to the left and three cloth-covered display tables to the right.',
      'The visible upper level has a white balcony fascia and railings; those are retained by projecting the original image onto the traced balcony surfaces.',
      'Board positions and table extents are estimated from their visible floor contacts. Objects beyond the photographed passage and unseen rooms are not modelled.',
      'The 1.5-metre walking area allows small shifts between the photographed displays without presenting this trace as a surveyed building interior.',
    ],
  },
  {
    image:'meishifang-1.jpg',
    title:'Food court · 美食坊',
    source:'https://www.chonghwakl.edu.my/campusfacilities/cfac-meishifang/',
    cameraHeight:1.65,
    yaw:0,
    bounds:{minX:-12,maxX:12,minZ:-14,maxZ:7.5,height:4.05},
    walkRadius:1.5,
    objects:[
      // A red-brick pillar with an extinguisher is directly ahead, not at the room edge.
      {label:'Central brick pillar with the photographed fire extinguisher',x:0,y:2.025,z:-2.26,w:.49,h:4.05,d:.49},
      {label:'Brick pillar on the left beyond the steel tables',x:-5.75,y:2.025,z:-2.2,w:.60,h:4.05,d:.60},
      {label:'Brick pillar on the right beyond the steel tables',x:5.8,y:2.025,z:-2.2,w:.60,h:4.05,d:.60},
      // Thin worktops preserve the visible space under the real stainless steel tables.
      {label:'Stainless steel table along the left side of the capture aisle',x:-1.50,y:.91,z:2.40,w:.76,h:.075,d:5.20},
      {label:'Stainless steel table along the right side of the capture aisle',x:1.50,y:.91,z:2.40,w:.76,h:.075,d:5.20},
      {label:'Left front crosswise steel table',x:-2.85,y:.91,z:-2.0,w:3.15,h:.075,d:.72},
      {label:'Right front crosswise steel table',x:2.85,y:.91,z:-2.0,w:3.15,h:.075,d:.72},
      {label:'Long steel table behind the centre pillar',x:0,y:.91,z:-4.65,w:10.3,h:.075,d:.74},
      {label:'Near left table visible front leg',x:-1.82,y:.45,z:.05,w:.045,h:.90,d:.045},
      {label:'Near right table visible front leg',x:1.82,y:.45,z:.05,w:.045,h:.90,d:.045},
      // Food stall counters appear behind to either side, rather than across the room centre.
      {label:'Left food-stall service counter',x:-5.95,y:.51,z:4.75,w:5.9,h:1.02,d:1.25},
      {label:'Right food-stall service counter',x:5.95,y:.51,z:4.75,w:5.9,h:1.02,d:1.25},
    ],
    notes:[
      'The source shows a brick pillar and extinguisher directly ahead, two near stainless steel table rows, more crosswise steel tables, and food counters behind to either side.',
      'The central pillar position is estimated from its visible floor contact and angular width. Table geometry follows visible worktops, without adding dining chairs that are absent here.',
      'Service-counter depth and room boundaries are estimates. The stainless steel reflections, signs, tiles and extinguisher come from the real photograph.',
      'Walking is limited to 1.5 metres around the camera; one panorama cannot supply accurate new views behind the pillar, stalls or tables.',
    ],
  },
];
