# Chong Hwa Campus World

### 吉隆坡中华独立中学 · An interactive campus to explore

Walk around a playful 3D interpretation of **Chong Hwa Independent High School, Kuala Lumpur**, unfold a globe into a campus map, discover real school panoramas, and shoot some hoops.

**[Explore the live demo](https://chong-hwa-campus-world.vercel.app/)** · **[Report a bug](https://github.com/SmartTradehubSolutions/chong-hwa-campus-world/issues)** · **[Contribute](CONTRIBUTING.md)**

> **School rights and attribution:** All rights to school-owned names, crests, logos, photographs, maps and other school media belong to **Chong Hwa Independent High School, Kuala Lumpur (吉隆坡中华独立中学)**. Where material has a separate rights holder, those rights remain with that holder. These materials are **excluded from the MIT code license**. This is an independent community project; no official school endorsement or authorization is claimed. See [school asset rights](ASSET_RIGHTS.md).

> **版权声明：**学校所属的名称、校徽、标志、照片、校园地图及其他学校媒体素材，其权利均归吉隆坡中华独立中学所有；涉及第三方素材的权利归各自权利人所有。这些素材不属于 MIT 开源代码许可的授权范围。本项目为独立社区项目，不代表学校官方，亦不声称已获学校授权或认可。

## What you can do

- **Explore textured architecture:** photographic brick, concrete, roof, bark, paving and road materials, finer window details, branching trees with individual leaves and natural daylight. These are representative materials on an illustrative reconstruction.
- **Explore three map views:** rotate a world with landmarks spread around the globe, view the 3D campus, or flatten it into a plan.
- **Walk as a student:** choose a boy or girl character, pass uniformed student characters and occasional teachers, and explore in third person.
- **Discover the school:** press **E** at an entrance to open its original school panorama. Look around and use the image picker to choose another photographed location in the same building. The sports arena displays an ordinary official photograph; buildings without a verified panorama show their information.
- **Fill your campus passport:** visit 15 stops, including the basketball court. Progress lasts for the current page session.
- **Play basketball:** aim, charge and release five shots, then try to beat your score.
- **Find your way:** use the directory, labels, minimap and camera controls. Touch controls are available for walking.

The campus buildings and characters are generated in code with Three.js. Students and teachers are fictional characters, not models of real people. The outdoor campus is an illustrative reconstruction. Building visits show the original school photographs: panoramas let you look around from their fixed camera positions, and the image picker moves between available viewpoints. There are no walkable indoor models. Panoramas represent the dates when the original photographs were taken.

## Run locally

Use **Node.js 22.13 or newer**; Node 22 LTS is used in CI. npm is included with Node. You do not need an API key, database, school login or hosting account to run the app.

```bash
git clone https://github.com/SmartTradehubSolutions/chong-hwa-campus-world.git
cd chong-hwa-campus-world
npm ci
npm run dev
```

Open the local URL printed by the development server. For your own copy, click **Fork** on GitHub and clone your fork instead.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm test` | Run geometry, layout, walking and basketball tests |
| `npm run typecheck` | Check TypeScript |
| `npm run build` | Build and verify the static site in `dist/client` |
| `npm run preview` | Serve the built site locally |
| `npm run lint` | Report existing and new source lint findings (see status below) |

The project uses React, TypeScript, Three.js, Tailwind CSS and **Vinext**, a Vite-based implementation of the Next.js app model. Vinext is currently a beta dependency; the lockfile pins the working dependency tree. This repository builds a static site and has no application backend.

## Validation status

Release validation covers automated geometry and behavior tests, TypeScript checking and the static production build. The inherited source currently has lint findings in the app and shared UI components, so `npm run lint` exits nonzero. Lint cleanup is a known contributor task; CI currently gates tests, types and the production build. The test runner also prints a Node experimental-loader warning, and the build warns about the size of the Three.js bundle.

## Controls

| Activity | Controls |
| --- | --- |
| Map exploration | Drag to orbit, scroll to zoom, and use the on-screen camera controls |
| Walking | **WASD** or **arrow keys**; hold **Shift** to run; drag to look |
| Visit a building | Walk to a gold entrance ring, then press **E** or tap to open its panorama, photograph or information |
| Touch walking | Use the on-screen directional pad and interaction buttons |
| Panorama | Drag to look around and scroll to zoom; use the image picker to change viewpoints; keyboard controls are also supported |
| Basketball | **A/D** to aim; hold **Space** or the shot button and release near the marked power target |

## Deploy your fork

The existing demo is hosted on Vercel. To deploy your own copy:

1. Fork this repository, then import your fork as a new Vercel project.
2. Use the repository root as the project root. `vercel.json` supplies the build command and output directory.
3. If asked, choose **Other** as the framework, `npm run build:vercel` as the build command, and `dist/client` as the output directory. Use a supported Node version of at least 22.13.
4. Deploy. No application environment variables are required.

You can also serve the contents of `dist/client` with a static web host. The app currently assumes deployment at the domain root; hosting under a subdirectory needs asset/base-path changes. A deployment of your fork does not update the original live demo. Review [asset rights](ASSET_RIGHTS.md) before redistributing school media or publishing a derivative using the school's identity.

## Where to make changes

```text
app/                     Page, global styles and site metadata
components/              Campus view, building visits, photo viewers and walk UI
components/ui/           Shared UI components
lib/campus/data.ts       Landmarks, descriptions and panorama references
lib/campus/primitives.ts Procedural buildings and court geometry
lib/campus/vegetation.ts Branching trees and individual leaf geometry
lib/campus/photo-sources.ts Original school source pages for photographs
lib/campus/characters.ts Student and teacher models
lib/campus/scene.ts      Cameras, picking and map transitions
lib/campus/walk-*        Walking, collisions, visits and basketball
lib/campus/world-*       Globe layout and surrounding scenery
public/branding/         School-owned logo assets; separate rights apply
public/media/            School-reference photos and map; separate rights apply
public/thumbs/           Photo-derived thumbnails; separate rights apply
public/fonts/            DM Sans fonts and their SIL Open Font License
public/textures/         CC0 photographic material maps from Poly Haven
docs/                    Sources and contributor architecture guide
tests/                   Automated behavior and geometry checks
```

See [architecture and extension notes](docs/ARCHITECTURE.md) and [contributing](CONTRIBUTING.md). Useful contributions include more accurate buildings with references, performance improvements, better touch controls and accessibility fixes.

Possible future activities include a rooftop track challenge, a library clue hunt and a campus history trail. These are ideas, not features already included in this release.

## Credits and sources

- **Chong Hwa Independent High School, Kuala Lumpur:** school identity, campus photographs, map and uniform references from the [official school website](https://www.chonghwakl.edu.my/) and [campus facilities directory](https://www.chonghwakl.edu.my/campusfacilities/).
- **Experience inspiration:** [CLHS campus experience](https://clhs.manfye.com/) and [Jalan KL](https://jalankl.themasterofnone.xyz/). This credit is for inspiration and does not imply collaboration or affiliation.
- **Open-source libraries and fonts:** see [third-party notices](THIRD_PARTY_NOTICES.md).

Original asset URLs and reconstruction notes are in [sources](docs/SOURCES.md) and the [media manifest](docs/media-manifest.json).

## License

**Original project code is open source under the [MIT License](LICENSE).** You may fork, modify and redistribute that code subject to its terms. Existing third-party code retains its own notices and licenses.

**School branding and media are not open-source assets.** All rights in school-owned materials remain with the school; third-party rights remain with their respective holders. The MIT license does not grant rights to school names, crests, photographs, maps, trademarks or other excluded media. See [ASSET_RIGHTS.md](ASSET_RIGHTS.md) for the scope and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for dependency and font licensing.
