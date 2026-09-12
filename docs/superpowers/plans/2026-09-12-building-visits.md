# Trees and building visits
Goal: E offers a walkable reconstructed room or a verified school panorama, with more natural tree geometry.
Architecture: vegetation.ts builds reusable branch/leaf geometry. interior-layout.ts defines approximate room furniture and collision math; interior-scene.ts owns rendering and input. BuildingVisitDialog owns choice/3D/photo state and keeps campus movement paused.
Tech stack: React, TypeScript, Three.js, existing local materials and school photos.

- Add behavior tests for indoor bounds, furniture collision and eligible interior destinations.
- Replace spherical crowns with individual tapered leaves on varied branches; instance simplified trees on the globe.
- Implement approximate library, hall, classroom, canteen, hostel, office and arena interiors with clear provenance wording.
- Wire E and building details to a choice menu. Preserve verified panorama selection and honest missing-media states.
- Verify types, gameplay tests, desktop/mobile interactions and production build; update docs and publish GitHub/Vercel.

Verification: 27 automated tests, TypeScript and the static production build pass. Desktop and 390 × 844 mobile browser checks cover the E/touch entry menu, walking inside the library, panorama selection, returning to campus and the arena without a verified panorama. Screenshots were visually inspected. Repeated viewer switching passes without browser errors after WebGL resource cleanup.
