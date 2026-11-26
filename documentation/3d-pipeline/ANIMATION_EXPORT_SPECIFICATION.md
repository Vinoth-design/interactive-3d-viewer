# Everdale 3D Pipeline: Animation Export Specification
**Version**: 2.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-23  
**Applicability**: Kinetic Cabinetry Interactions, Soft-Close Kinematics, Three.js AnimationMixer

---

## 1. Overview & Kinetic Principles

Everdale interactive models support fluid, physics-inspired kinetic interactions for sliding drawer assemblies and hinged swinging doors. The animation subsystem utilizes glTF 2.0 animation channels driving translation and rotation tracks on root empties, controlled in real-time by the Three.js `AnimationMixer` and spring interpolation curves.

---

## 2. Animation Track Definitions

Every interactive product model exports standardized animation clips:

| Action Name | Target Node | Transform Track | Range (Blender) | Range (Three.js) | Duration | Interpolation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `Drawer01_Open` | `Drawer_01_Root` | Translation | $Y: 0.0 \to -0.300\text{ m}$ | $Z: 0.0 \to +0.300\text{ m}$ | $0.80\text{ s}$ ($24\text{ frames}$) | Cubic Ease-Out |
| `Drawer01_Close`| `Drawer_01_Root` | Translation | $Y: -0.300 \to 0.0\text{ m}$ | $Z: +0.300 \to 0.0\text{ m}$ | $0.70\text{ s}$ ($21\text{ frames}$) | Soft-Close Damped |
| `Drawer02_Open` | `Drawer_02_Root` | Translation | $Y: 0.0 \to -0.320\text{ m}$ | $Z: 0.0 \to +0.320\text{ m}$ | $0.85\text{ s}$ ($25\text{ frames}$) | Cubic Ease-Out |
| `Drawer02_Close`| `Drawer_02_Root` | Translation | $Y: -0.320 \to 0.0\text{ m}$ | $Z: +0.320 \to 0.0\text{ m}$ | $0.75\text{ s}$ ($22\text{ frames}$) | Soft-Close Damped |
| `Door_Left_Open`| `Door_Left_Root` | Rotation Euler / Quat | $Z: 0^\circ \to -75^\circ$ | $Y: 0.0 \to -1.309\text{ rad}$| $0.90\text{ s}$ ($27\text{ frames}$) | Cubic Ease-Out |
| `Door_Left_Close`| `Door_Left_Root`| Rotation Euler / Quat | $Z: -75^\circ \to 0^\circ$ | $Y: -1.309 \to 0.0\text{ rad}$| $0.80\text{ s}$ ($24\text{ frames}$) | Soft-Close Damped |

---

## 3. Soft-Close Kinematics & Damping Model

To emulate commercial undermount soft-close slide hardware (e.g. Blum Movento or Grass Dynapro):
1. **Initial Acceleration Phase ($0\% - 40\%$ of stroke)**: Moderate linear momentum as the user initiates the push.
2. **Fluid Damping Deceleration Phase ($40\% - 95\%$ of stroke)**: Exponential velocity deceleration governed by:
   $$v(t) = v_0 \cdot e^{-\zeta \omega_n t}$$
   where damping ratio $\zeta = 1.15$ (slightly overdamped) prevents bounce.
3. **Magnetic Pull-In ($95\% - 100\%$ of stroke)**: Soft asymptotic glide into the carcass reveal stop, landing exactly at local $Z = 0.0000\text{ m}$.

---

## 4. Three.js Runtime Integration Protocol

In `VanitySceneManager.js`:
- Interactive meshes (`interactiveTargets`) register click event listeners mapped to root empties.
- When an open action is triggered:
  ```javascript
  const clip = THREE.AnimationClip.findByName(this.animations, actionName);
  const action = this.mixer.clipAction(clip, rootObject);
  action.setLoop(THREE.LoopOnce);
  action.clampWhenFinished = true;
  action.timeScale = 1.0;
  action.play();
  ```
- Re-clicking triggers the complementary closing clip with inverted timeScale or transition cross-fading (`action.crossFadeTo()`).
- All active animations update via `this.mixer.update(delta)` inside the render loop.
