# Regression Testing Checklist — Everdale Platform (Phase 01)

**Document Version:** 1.0.0  
**Status:** Verification Ready  
**Tester:** Quality Assurance Lead & Three.js Systems Engineer  
**Execution Date:** November 2026  

---

## 1. Product 3D Viewer & Model Lifecycle

| Test ID | Test Scenario | Verification Procedure | Expected Outcome | Execution Result |
| :---: | :--- | :--- | :--- | :---: |
| **REG-01** | **Initial Model Load** | Launch app at `http://localhost:5173` | Everdale 31″ model renders centered with soft shadows | **PASS** |
| **REG-02** | **24″ Variant Load** | Select 24″ width pill | 24″ model loads, camera frames proportionally | **PASS** |
| **REG-03** | **31″ Variant Load** | Select 31″ width pill | 31″ model loads, camera frames proportionally | **PASS** |
| **REG-04** | **37″ Variant Load** | Select 37″ width pill | 37″ model loads, camera frames proportionally | **PASS** |
| **REG-05** | **49″ Variant Load** | Select 49″ width pill | 49″ model loads, camera frames proportionally | **PASS** |
| **REG-06** | **61″ Variant Load** | Select 61″ width pill | 61″ double-basin vanity with 4 moving drawers loads | **PASS** |
| **REG-07** | **Rapid Size Switching** | Rapidly click 24″ -> 37″ -> 61″ -> 24″ | Final visual model strictly matches latest UI selection | **PASS (VERIFIED AFTER FIX)** |
| **REG-08** | **No Duplicate Models** | Inspect scene graph after 10 switches | Exactly one `modelRoot` exists in scene at all times | **PASS (VERIFIED AFTER FIX)** |
| **REG-09** | **Camera Orbit & Pan** | Drag mouse / touch across viewport | View rotates smoothly with inertia, clamped to floor | **PASS** |
| **REG-10** | **Camera Zoom** | Scroll wheel & click +/- zoom buttons | Smoothly zooms between $0.85\text{m}$ and $4.4\text{m}$ | **PASS** |
| **REG-11** | **Camera Presets** | Click 3/4 View, Front, Basin, Drawers | Camera lerps smoothly to target coordinates | **PASS** |
| **REG-12** | **Idle Auto-Turntable** | Leave viewer idle for 6.5 seconds | Subtle turntable rotation starts; stops on touch | **PASS** |

---

## 2. Product Customization & PBR Shading

| Test ID | Test Scenario | Verification Procedure | Expected Outcome | Execution Result |
| :---: | :--- | :--- | :--- | :---: |
| **REG-13** | **Cabinet Paint Swap** | Click all 5 cabinet finish swatches | Body and legs update color and roughness in < 1ms | **PASS** |
| **REG-14** | **Hardware Metalness** | Switch Antique Brass, Black, Nickel, Gold | Handles reflect HDRI studio highlights accurately | **PASS** |
| **REG-15** | **Countertop Veining** | Switch White Stone, Carrara, Quartz | Procedural canvas texture updates; sink stays white | **PASS** |
| **REG-16** | **Backsplash Toggle** | Toggle 4″ Backsplash vs None | Mesh visibility toggles cleanly with zero artifacts | **PASS** |
| **REG-17** | **Interior Trays** | Toggle Show / Hide Interior Storage Trays | 2 modular caddies in lower drawer toggle visibility | **PASS** |
| **REG-18** | **Faucet Placement** | Toggle Pre-drilled vs Centerset Faucet | Faucet renders; 61″ model renders dual faucets | **PASS** |
| **REG-19** | **Mirror Placement** | Switch Rectangle, Arched, Round, LED, None | Mirror renders; 61″ model renders dual mirrors | **PASS** |
| **REG-20** | **Room Finishes** | Change wall and floor presets | Architectural room shell updates textures | **PASS** |
| **REG-21** | **Lighting Presets** | Switch Warm Bath, Studio, Sun, Evening | Lights, background, and HDRI environment switch | **PASS** |
| **REG-22** | **Price Consistency** | Observe price ticker during option toggles | Subtotal matches sum of option deltas accurately | **PASS** |

---

## 3. Kinematic Animations & Interactions

| Test ID | Test Scenario | Verification Procedure | Expected Outcome | Execution Result |
| :---: | :--- | :--- | :--- | :---: |
| **REG-23** | **Drawer 01 Open/Close** | Click upper drawer in 3D viewport | Smooth 275mm slide extension and soft-close return | **PASS** |
| **REG-24** | **Drawer 02 Open/Close** | Click lower drawer in 3D viewport | Smooth 275mm slide extension revealing trays | **PASS** |
| **REG-25** | **61″ Dual Drawer Clicks**| Click L1, L2, R1, R2 drawers on 61″ | Respective drawer triggers independently | **PASS** |
| **REG-26** | **3D Dimensions** | Toggle Dimension Overlay button | 3D dimension lines and width/height tags render | **PASS** |
| **REG-27** | **Snapshot Capture** | Click Camera snapshot icon | Downloads crisp, unblanked PNG screenshot | **PASS** |
| **REG-28** | **Share Modal URL** | Copy share link and open in new tab | State and 3D scene reproduce identically | **PASS** |
| **REG-29** | **Cart Drawer Trigger** | Click Add to Cart / Request Quote | Drawer slides in with correct line items & price | **PASS** |

---

## 4. Technical Quality & Code Integrity

| Test ID | Test Scenario | Verification Procedure | Expected Outcome | Execution Result |
| :---: | :--- | :--- | :--- | :---: |
| **REG-30** | **Console Errors** | Monitor browser DevTools console | Zero uncaught exceptions or WebGL warnings | **PASS** |
| **REG-31** | **Asset Loading** | Monitor Network DevTools tab | Zero 404 HTTP errors on any GLB or texture | **PASS** |
| **REG-32** | **Production Build** | Run `npm run build` in CLI | Builds successfully without Rollup syntax errors | **PASS** |
| **REG-33** | **VRAM Leak Prevention** | Switch sizes 30 times in DevTools | Geometries and cloned materials cleanly disposed | **PASS (VERIFIED AFTER FIX)** |
| **REG-34** | **URL Parameter Safety** | Pass invalid parameters in URL | Fallbacks apply safely without breaking UI buttons | **PASS (VERIFIED AFTER FIX)** |
| **REG-35** | **Git Working Copy** | Run `git status` | Source Blender file uncorrupted; no user work lost | **PASS** |
