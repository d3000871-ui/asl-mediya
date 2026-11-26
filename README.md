# Frontline: Arena

Original browser-based tactical FPS prototype. Three.js WebGL rendering, procedural textured city, shadows, first-person weapons, animated soldier bots and Canvas compatibility fallback.

## Deploy with Vercel
Import `d3000871-ui/asl-mediya` from GitHub at https://vercel.com/new. Select Other, root directory `.`, no build or install command, output directory `.`. `vercel.json` configures these defaults. Deploy. GitHub commits can trigger redeploys when the integration is connected.

## Play
Desktop: WASD, mouse, left click or Space, R reload, Q switch weapon, Shift sprint, right click aim. Mobile: joystick, drag camera, fire/reload/weapon/aim buttons. Landscape recommended.

## Assets
Three.js r160.1 is loaded from jsDelivr. The animated Soldier.glb demo model is loaded from https://threejs.org/examples/models/gltf/Soldier.glb ; Three.js animation demo credits Mixamo (https://threejs.org/examples/webgl_animation_skinning_blending.html). Confirm model usage rights before commercial publication or replace it with a licensed custom character. A procedural fallback is provided when the external model cannot load. Canvas fallback is provided if the 3D renderer cannot initialize.

## Limitations
Offline single-player bot mode, shared soldier model, no multiplayer server or native APK. External model/CDN needs network access. Syntax checked; live browser/device and Vercel deployment still require testing.
