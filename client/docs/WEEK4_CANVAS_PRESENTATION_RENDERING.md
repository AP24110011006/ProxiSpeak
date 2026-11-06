# ProxiSpeak Client — Week 4 Canvas Presentation Rendering & Holographic Shaders

**Author**: Leela Sai Likhitha Yekollu <sailikhitha.yekollu@gmail.com>  
**Role**: Canvas Spatial DSP & Audio Engineer  
**Branch**: `likhitha` (mirrored on `likhita`)  

---

## 🎨 Canvas Display Architecture: `canvasScreenShareOverlay.js`

Week 4 integrates live presentation graphics directly onto the 60 FPS HTML5 2D office canvas floor plan, providing clear geospatial awareness of boardroom collaboration.

### Visual Components Rendered
1. **Holographic Presentation Display**:
   - Location: Center table of Executive Glass Boardroom ($x: 580, y: 160$).
   - Dimensions: $140\text{px} \times 75\text{px}$ aspect-ratio bounded display.
   - Dynamic scanlines with oscillating pulse alpha.
2. **Projector Light Cone**:
   - Radiates outward from podium toward the conference table.
   - Dual-stop radial gradient with cyan glow (`#06b6d4`).
3. **Presenter & Resolution HUD**:
   - Displays presenter identity and active resolution ladder (`1080p`, `720p`, or `480p`).
   - Red pulsing broadcast indicator dot.
4. **Sabine Reverb Aura Rings**:
   - Delineates acoustic decay perimeters with color-coded dashed rings (Purple for Boardroom, Blue for Focus Cabins, Gold for Coffee Lounge).
