# MECHA.CHIUBACA // PORTFOLIO

A cyberpunk-themed interactive 3D portfolio built with React Three Fiber, featuring a wireframe mecha robot where each body part represents a different web development skill.

> **Moved into the monorepo.** This app now lives at `apps/mecha.chiubaca.com` in
> [chiubaca-monorepo](https://github.com/chiubaca/chiubaca-monorepo). The standalone
> `chiubaca/mecha-portofolio` repository is deprecated/archived.

![Cyberpunk Terminal Aesthetic](https://img.shields.io/badge/style-cyberpunk-green)
![React Three Fiber](https://img.shields.io/badge/3D-React%20Three%20Fiber-blue)
![TypeScript](https://img.shields.io/badge/lang-typescript-blue)

## Features

- **Interactive 3D Mecha Model**: Procedurally generated wireframe Gundam-style robot
- **Skill Mapping**: Each body part represents a different technology:
  - **Head** → TypeScript
  - **Torso** → React.js
  - **Backpack** → Node.js
  - **Legs** → Cloudflare Workers
  - **Rifle** → GraphQL
  - **Shield** → Databases
  - **Shoulders** → Drizzle.js
  - **Antenna** → Git
  - **Arms** → Docker
- **Dynamic Camera**: Smooth cinematic camera movements on skill selection
- **Terminal UI**: Typewriter text effects with monospace fonts
- **Cyberpunk Aesthetic**: Glowing green wireframes, scanlines, grid floor
- **Mobile Responsive**: Touch-friendly controls for mobile devices

## Tech Stack

- **React 18** + **TypeScript**
- **React Three Fiber** (@react-three/fiber)
- **Drei** (@react-three/drei) - 3D helpers
- **React Spring** (@react-spring/three) - Camera animations
- **Three.js** - 3D rendering engine
- **Vite** - Build tool

## Getting Started

Run these from the **monorepo root** (`chiubaca-monorepo/`).

### Installation

```bash
vp install
```

### Development

```bash
pnpm dev:mecha.chiubaca
```

Open the URL printed in the terminal (usually http://localhost:5173, or the
next free port if another app is already running).

### Build for Production

```bash
pnpm --filter mecha.chiubaca.com build
```

### Deploy to Cloudflare

```bash
pnpm mecha.chiubaca.com:deploy
```

## Controls

- **Hover** over body parts to scan
- **Click** to analyze skill details (camera animates to dramatic angle)
- **ESC** or **[RESET]** button to return to default view

## Customization

### Swapping the Mecha Model

The current implementation uses a procedurally generated wireframe mecha. To use a custom GLTF/GLB model:

1. **Download a model** (recommended: [Gundam RX-78 by Davix](https://sketchfab.com/3d-models/gundam-rx-78-60142fe11f9d41ddb412e1b67ee855ad))
   - Create a free Sketchfab account
   - Download the GLB file
   - Place it in `src/assets/`

2. **Update `GundamModel.tsx`**:

```typescript
import { useGLTF } from "@react-three/drei";

// Replace the procedural generation with:
const { scene } = useGLTF("/assets/gundam-rx78.glb");

// Traverse and apply wireframe materials
scene.traverse((child) => {
  if (child.isMesh) {
    child.material = new MeshBasicMaterial({
      color: 0x00ff41,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });
  }
});
```

3. **Map skills to mesh names** in `src/data/skills.ts`:

```typescript
{
  id: 'react',
  name: 'React.js',
  meshNames: ['torso_mesh_name', 'chest_mesh_name'], // Use actual mesh names from your model
  // ... rest of config
}
```

### Adding New Skills

Edit `src/data/skills.ts`:

```typescript
{
  id: 'my-skill',
  name: 'My Skill',
  category: 'CATEGORY',
  level: 85,
  description: 'Description here',
  details: ['Detail 1', 'Detail 2'],
  bodyPart: 'BODY PART NAME',
  meshNames: ['mesh_name_1', 'mesh_name_2'],
  cameraPosition: new Vector3(x, y, z), // Dramatic camera position
  cameraTarget: new Vector3(x, y, z),   // Where camera looks
  color: '#00ff41'
}
```

### Changing Colors

Edit `src/styles/cyberpunk.css`:

```css
:root {
  --terminal-green: #00ff41; /* Main accent color */
  --terminal-green-dim: #00aa2a; /* Dimmed color */
  --terminal-bg: #0a0a0a; /* Background */
}
```

## Project Structure

```
src/
├── components/
│   ├── GundamModel.tsx       # 3D mecha model (procedural or GLTF)
│   ├── CameraController.tsx  # Smooth camera animations
│   ├── GridFloor.tsx         # Animated grid background
│   └── TerminalUI.tsx        # Terminal-style UI with typewriter
├── data/
│   └── skills.ts             # Skill definitions & camera angles
├── hooks/
│   ├── useTypewriter.ts      # Typewriter text effect hook
│   └── useCameraAnimation.ts # Camera animation hook
├── styles/
│   └── cyberpunk.css         # Terminal green aesthetic styles
├── App.tsx                   # Main scene composition
└── main.tsx                  # Entry point
```

## Performance Tips

- The wireframe mecha is procedurally generated using simple geometries for better performance
- For production with complex GLTF models:
  - Use `useGLTF` with draco compression
  - Implement LOD (Level of Detail)
  - Use `InstancedMesh` for repeated parts
  - Enable `frustumCulled` on meshes

## License

MIT - Feel free to use this as a template for your own portfolio!

## Credits

- **Gundam RX-78 Model Reference**: [Davix on Sketchfab](https://sketchfab.com/3d-models/gundam-rx-78-60142fe11f9d41ddb412e1b67ee855ad)
- **Font**: JetBrains Mono
- **Built with**: React Three Fiber & Three.js
