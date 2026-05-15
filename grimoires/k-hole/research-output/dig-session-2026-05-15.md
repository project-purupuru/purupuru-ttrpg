
## Dig: Genshin Impact stylized lighting and post-processing pipeline in React Three Fiber — bloom, tone mapping, color grading, rim/fresnel lighting for a cozy hand-painted 3D world
_2026-05-15T01:58:39.765Z | 13 sources | 833.8s | depth: ±_

### Findings

*Guilty Gear Xrd* (2014) established the technical gold standard for 3D anime by manually editing vertex normals because, fundamentally, "standard 3D lighting makes 2D anime faces look terrible." For open-world dynamic lighting, *Genshin Impact* abandoned vertex normals and utilized Signed Distance Field (SDF) Textures to dictate exactly when a shadow crawls across a face. Within React Three Fiber, Faraz Shaikh's `THREE-CustomShaderMaterial` (CSM) is critical for implementing these SDF facial shadows, as it injects custom GLSL while retaining standard Three.js shadow calculations. The reliance on 1D Color Ramps and SDF maps translates rigid 2D animator rules into 3D math, a compositing philosophy that structurally mirrors traditional cel painting techniques where shading is determined by pre-defined palettes rather than light simulation (adjacent).

Paul Henschel's `@react-three/postprocessing` framework utilizes Look-Up Tables (LUTs) to achieve the vibrant "cozy" atmosphere inherent to *Genshin*'s aesthetics. Instead of sticking with default Three.js tonemapping, developers apply custom LUTs so that bright anime hair and vibrant environments don't wash out to white under extreme virtual sunlight. This requirement for maintaining high-saturation under extreme light borrows from John Hable's introduction of "Filmic" tone mapping in *Uncharted 2* (2009), ensuring the final color palette feels like a "living illustration." By configuring a high `luminanceThreshold` within the Bloom effect, developers ensure "only specifically targeted emissive materials" trigger bloom, an approach echoing high-contrast traditional illustration where only magical or focal elements are permitted to bleed light (bridge).

Nuno Pinho's `Lamina` library allows R3F developers to build materials structurally like Photoshop layers, stacking base colors and Fresnel layers to easily achieve soft rim lighting. The Fresnel implementation in this NPR pipeline "hacks" real-world reflectivity, instead calculating the dot product of the camera view and mesh surface to create a stark "halo" separating characters from backgrounds. This mathematical "halo" structure is identical to anisotropic shaders used for visualizing spun metal in automotive design, proving that highly stylized game techniques often co-opt precise mathematical models from non-entertainment visualization fields (adjacent).

### Pull Threads

- Faraz Shaikh THREE-CustomShaderMaterial implementation of SDF facial shadows — Explores the specific GLSL injection techniques required to map a 2D shadow atlas onto a 3D R3F mesh over time.
- Maxime Heckel "Study of Shaders" on dithering — Investigates how specific 2D illustrative styles are translated into declarative R3F architectures for performance-optimized stylized rendering.
- Arc System Works Guilty Gear Xrd vertex normal editing — Provides historical context on how manually sculpted normals solved the "ugly shadow" problem before dynamic open-world SDF solutions became viable.
- Inverted Hull outline rendering via @react-three/drei — Examines the vertex shader performance advantages of duplicating and culling backfaces compared to expensive post-processing edge detection.
- Anderson Mancini's Fake Glow Material optimization — Explores how heavy stylized effects like soft bloom can be faked with mesh-based shaders to maintain 60FPS on the web.

### Sources
- [Faraz Shaikh Portfolio](https://farazzshaikh.com/)
- [Wawa Sensei - Cell Shading Water](https://wawasensei.dev/tutorials/cell-shading-water)
- [Maxime Heckel Blog - R3F Shaders](https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/)
- [GitHub - water-anime-shader](https://github.com/cortiz2894/water-anime-shader)
- [YouTube - R3F Toon Shader Basics](https://youtube.com/watch?v=F3_l-F_A6s8)
- [GitHub - THREE-CustomShaderMaterial](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial)
- [Poimandres Lamina](https://github.com/pmndrs/lamina)
- [Codrops - Three.js Tutorials](https://tympanus.net/codrops/)
- [Building the "Genshin" Shader - YouTube](https://youtube.com/watch?v=AUZIYQFmngplnS1rXt_fb3E5FEIbHgymR_zrlE2o1bKUBa6TwgQarRDKaWsVcK3OUxjwsDRO93ItsWaWcq3c5Ya6FDR-PKDIKkt2O-CXDGvqbBKIHo5TQPn4tFqfOKWPwZlw4dHcQ--gFAA=)
- [React Three Fiber Stylized Rendering - YouTube](https://youtube.com/watch?v=AUZIYQFPfDFJVQPemREvugut3nSB3EjPjt5IK7_B43eGOaCmTnQ45OwdnRgdxCJf9NzKNJcEFPiE5yq1XAp2fVBhspgARS9FSclDjZZK9lBSQ_xNVxn3n5yQejq0GErHiiIPY3oUl89JGi4=)
- [How Toon Shading Works - YouTube](https://youtube.com/watch?v=AUZIYQGHccosbbF5mxA5PF3Pg6Zs4Iwot4-oZrv15YnAy4FCJ9sDk1-C7s6yuovQR8nzdKfdTjAFDMTz7VNQMrJSN70Evwo1oe8Y9Q3SEQ-24kWFk3JW6rKYk53q8fUgssRV0nAH6V3Iwi4=)
- [Inverted Hull Outlines - ArtStation](https://artstation.com/blogs/joshuawatt/aZ2y/outline-rendering-with-inverted-hull-method)
- [The History of HDR and Tone Mapping in Games - Reddit](https://reddit.com/r/gamedev/comments/162p4m/history_of_hdr_and_tone_mapping_in_games/)

---

## Dig: Achieving the For The King + Craftopia mountains + Island Beekeeper aesthetic in React Three Fiber — mid-poly painterly worlds (not low-poly flat, not high-detail PBR): warm directional sunset lighting with rim/edge glow on land, painted-texture terrain, mid-poly trees with leaf-card canopies, drifting cloud layers viewed from above, atmospheric depth fog, flat-shaded icosphere blob vocabulary, Ghibli-warm mood
_2026-05-15T04:03:18.708Z | 13 sources | 715.6s | depth: +++_

### Findings

Faraz Shaikh’s `three-custom-shader-material` (CSM) serves as the technical pivot for the "Sunday Afternoon" aesthetic, enabling the injection of custom GLSL into Three.js’s native lighting chunks. By hijacking the `MeshStandardMaterial`, Shaikh preserves built-in shadow mapping while overriding the fragment shader to calculate a Fresnel-driven "rim glow"—a `dot(normal, viewDir)` calculation that illuminates the edges of a model as if it were caught in a perpetual sunset. (adjacent) This technique mirrors the "Light and Space" movement’s use of light as a tangible material, specifically Larry Bell’s vacuum-coated glass cubes that define volume through edge-glow and refraction rather than surface detail.

Maxime Heckel’s "The Study of Shaders with React Three Fiber" provides the blueprint for "fluffy" mid-poly canopies through spherical normal manipulation. By forcing vertex normals to point outward from a central pivot rather than perpendicular to their actual geometry, the lighting wraps around clusters of "leaf cards" or icosphere blobs as a single organic volume. Heckel emphasizes using "3D Simplex or Perlin noise to displace the vertices along their normals dynamically," creating the "drifting, breathing" quality seen in *Island Beekeeper* clouds. (bridge) The synthesis of Heckel’s displacement logic with Oskar Stålberg’s "Irregular Quad Grids" transforms the mesh from a static shell into a "perceptual container" where the geometry itself acts as a medium for atmospheric turbulence.

Paul Henschel (0xca0a) champions the use of `AccumulativeShadows` to ground the floating hex-grids of *For The King*-style dioramas, arguing that "soft, jittered shadows" are the essential "glue" that makes a digital island feel like a tactile toy. This groundedness is softened by "noise-injected height fog," a technique that replaces standard linear fog with a color gradient (deep purple to warm peach) modulated by noise to simulate "patches" of drifting mist. (adjacent) This layering of atmospheric color echoes the "Luminist" painters of the Hudson River School, such as Albert Bierstadt, who used translucent oil glazes to achieve a "glow of the land"—a physical precursor to the modern Alpha-blended fragment shader.

### Pull Threads

- "Maxime Heckel Kuwahara Filter shader implementation" — How to use variance-based smoothing in a post-processing pass to convert 3D renders into painterly oil strokes.
- "Oskar Stålberg Townscaper vertex color palette" — Achieving a "painted" look without texture maps by encoding colors directly into the mesh geometry for optimized, low-memory dioramas.
- "Faraz Shaikh Sunday Afternoon lighting setup" — The specific `CustomShaderMaterial` configuration for achieving warm, low-contrast, non-PBR global illumination.
- "Kazuo Oga Studio Ghibli poster color clumping" — How to translate the 2D "blob" vocabulary of anime background art into 3D volume modeling and "leaf-card" placement.

### Emergence

A fundamental shift occurs in this aesthetic from "Mathematical Accuracy" to "Perceptual Affect." By hijacking vertex normals and injecting noise into fog, practitioners like Henschel and Heckel are not simulating the physics of light, but the *memory* of a sunset. The tension between the "jagged" mid-poly geometry and the "soft" lighting gradients creates a "haptic visuality"—a world that looks like it would feel warm to the touch.

### Sources
- [Building a stylized scene with React Three Fiber](https://www.youtube.com/watch?v=R2jI00GZ1bQ)
- [React Three Fiber - Shaders - Toon Shading](https://tympanus.net/codrops/2023/11/08/the-study-of-shaders-with-react-three-fiber/)
- [Three.js Fog Hacks](https://medium.com/@_V_S_/three-js-fog-hacks-7424d10e587e)
- [r3f-fog-effect](https://github.com/AxiomeCG/r3f-fog-effect)
- [Drei - Outlines and Edges](https://drei.pmnd.rs/)
- [Lamina documentation](https://github.com/pmndrs/lamina)
- [Bruno Simon's Three.js Journey](https://threejs-journey.com/)
- [Maxime Heckel: The Power of the Kuwahara Filter](https://maximeheckel.com/posts/the-power-of-the-kuwahara-filter/)
- [Faraz Shaikh: THREE-CustomShaderMaterial](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial)
- [Alexander Birke: The Living Painting Technical Breakdown](https://www.gamedeveloper.com/design/creating-the-painterly-art-style-of-11-11-memories-retold)
- [Oskar Stålberg's Townscaper Grid Logic](https://twitter.com/OskarStalberg/status/1164101967205244928)
- [Matt DesLauriers: Generative Impressionism](https://mattdesl.svbtle.com/generative-impressionism)
- [Poimandres: React Three Fiber Examples](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)

---
