
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
