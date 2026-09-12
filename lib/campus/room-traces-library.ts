import type {PhotoRoom} from './photo-room-layout';

/**
 * Traces of visible surfaces in the school's library panoramas.
 * Camera is at (0, 1.65, 0); the centre of each panorama faces -Z.
 * Distances are estimates from angular position and assumed camera/furniture
 * height, rather than a measured plan. Each photograph has its own trace.
 */
export const libraryTraces:PhotoRoom[] = [
  {
    image:'pusatsumber-1.jpg',
    title:'Library · Level 12',
    source:'https://www.chonghwakl.edu.my/campusfacilities/cfac-pusatsumber/',
    cameraHeight:1.65,
    yaw:0,
    bounds:{minX:-3.65,maxX:4.7,minZ:-25,maxZ:3.8,height:2.9},
    walkRadius:1.7,
    objects:[
      // The near magazine display is visible to the left of the reading aisle.
      {label:'Near magazine display',x:-2.8,y:1.04,z:-2.25,w:.46,h:2.08,d:4.7},
      {label:'Continuing wall magazine display',x:-2.8,y:1.04,z:-9.55,w:.46,h:2.08,d:9.9},

      // Explicitly traced visible study desks; the full distant room is not filled.
      {label:'Near left study tabletop',x:-.95,y:.745,z:-2.05,w:1.28,h:.075,d:.72},
      {label:'Second left study tabletop',x:-1.07,y:.745,z:-3.65,w:1.28,h:.075,d:.72},
      {label:'Third left study tabletop',x:-1.15,y:.745,z:-5.5,w:1.28,h:.075,d:.72},
      {label:'Fourth left study tabletop',x:-1.17,y:.745,z:-7.4,w:1.28,h:.075,d:.72},
      {label:'Near right study tabletop',x:1.32,y:.745,z:-1.72,w:1.28,h:.075,d:.72},
      {label:'Second right study tabletop',x:1.5,y:.745,z:-3.25,w:1.28,h:.075,d:.72},
      {label:'Third right study tabletop',x:1.68,y:.745,z:-4.85,w:1.28,h:.075,d:.72},
      {label:'Fourth right study tabletop',x:1.8,y:.745,z:-6.6,w:1.28,h:.075,d:.72},

      {label:'Near left chair back',x:-.95,y:.69,z:-2.7,w:.46,h:.43,d:.085},
      {label:'Near left chair seat',x:-.95,y:.43,z:-2.52,w:.46,h:.055,d:.43},
      {label:'Near right chair back',x:1.32,y:.69,z:-1.12,w:.46,h:.43,d:.085},
      {label:'Near right chair seat',x:1.32,y:.43,z:-1.3,w:.46,h:.055,d:.43},

      // The photograph shows a dark-front reception counter to camera-right.
      {label:'Service counter front',x:3.2,y:.51,z:1.25,w:.72,h:1.02,d:2.6},
      {label:'Service counter return',x:2.8,y:.51,z:2.45,w:1.45,h:1.02,d:.6},
      {label:'Left entrance display table',x:-2.65,y:.745,z:2.35,w:.62,h:.075,d:2.2},
      {label:'Left entrance computer desk',x:-2.05,y:.745,z:3.15,w:1.3,h:.075,d:.62}
    ],
    notes:[
      'Traced from the school’s 12楼图书馆1 photograph: long reading aisle, pale wood magazine displays on the left, lime blinds on the right, study desks and a dark reception counter near the entrance.',
      'The centre of the panorama points along the reading aisle. Near desk positions are estimated from their photographed angular positions using a 1.65 m camera and approximately 0.78 m tabletops.',
      'The counter is curved in the photograph; its visible footprint is approximated by two joined masses. The room shell and far depth are estimates because furniture hides parts of the perimeter.',
      'Movement stays near the photographed position. Hidden furniture faces and surfaces behind the camera equipment are not captured by this single panorama.'
    ]
  },
  {
    image:'pusatsumber-3.jpg',
    title:'Library · Level 13',
    source:'https://www.chonghwakl.edu.my/campusfacilities/cfac-pusatsumber/',
    cameraHeight:1.65,
    yaw:0,
    bounds:{minX:-6.2,maxX:8.5,minZ:-12.5,maxZ:5.8,height:2.9},
    walkRadius:1.6,
    objects:[
      // Long pale-wood display counter and low divider on the right of the image.
      {label:'Long right display tabletop',x:2.8,y:.765,z:-.15,w:.8,h:.09,d:7.2},
      {label:'Right display divider',x:3.2,y:.64,z:-.15,w:.12,h:1.28,d:7.2},
      {label:'Right display near support',x:2.8,y:.36,z:2.9,w:.8,h:.72,d:.14},
      {label:'Right display middle support',x:2.8,y:.36,z:.1,w:.8,h:.72,d:.14},
      {label:'Right display far support',x:2.8,y:.36,z:-3,w:.8,h:.72,d:.14},

      // Two computer stations are visible ahead-left of the capture point.
      {label:'Front computer counter',x:-1.95,y:.75,z:-3.65,w:2.45,h:.09,d:.72},
      {label:'Left computer counter',x:-3.95,y:.75,z:-1.95,w:.72,h:.09,d:1.8},
      {label:'Front computer monitor left',x:-2.65,y:1.025,z:-3.88,w:.46,h:.34,d:.085},
      {label:'Front computer monitor right',x:-1.1,y:1.025,z:-3.88,w:.46,h:.34,d:.085},

      // These are the specific visible stack ends, not a generated bookshelf grid.
      {label:'Centre-left book stack',x:-1.6,y:1.08,z:-6,w:.65,h:2.16,d:3.6},
      {label:'Centre book stack',x:.15,y:1.08,z:-6,w:.65,h:2.16,d:3.6},
      {label:'Centre-right book stack',x:1.9,y:1.08,z:-6.1,w:.65,h:2.16,d:3.6},
      {label:'Right outer book stack',x:5.2,y:1.08,z:-.45,w:3.4,h:2.16,d:.65},

      // Display shelf against the white partition at camera-left/rear.
      {label:'Left wall display tabletop',x:-2.7,y:.77,z:2.05,w:.68,h:.09,d:3.9},
      {label:'Left display partition',x:-3.08,y:1.32,z:2.05,w:.14,h:2.64,d:3.9},
      {label:'Left display near support',x:-2.7,y:.37,z:.15,w:.68,h:.74,d:.14},
      {label:'Left display rear support',x:-2.7,y:.37,z:3.9,w:.68,h:.74,d:.14}
    ],
    notes:[
      'Traced from the school’s 13楼图书馆1 photograph: book-stack ends ahead, computer stations ahead-left, the long WORLD & ME display counter on the right, and a display table against the partition on the left.',
      'This is a separate photographed part of the resource centre, not the Level 12 reading-room layout. Only the visible foreground furniture and stack ends are given depth.',
      'Camera height, furniture depth and outer shell dimensions are estimates. The photographed book stacks conceal the far perimeter, so the model does not imply a verified floor plan.',
      'Movement is limited to the clear area around the original camera. Unseen reverse faces and gaps behind furniture cannot be recovered faithfully from this one photograph.'
    ]
  }
];
