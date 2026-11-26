# Existing Product Configuration & Specification Audit (Phase 01)

**Document Version:** 1.0.0  
**Status:** Complete & Verified  
**Author:** Product Systems Lead & Technical Architect  
**Source File:** `src/config/productConfig.js`  
**Date:** November 2026  

---

## 1. Executive Summary

This document audits the complete product catalog, options, dimensions, finishes, and pricing rules implemented in `everdale-configurator/src/config/productConfig.js`. It establishes the authoritative baseline of existing configurable parameters and validates them against the actual 3D model geometry.

---

## 2. Complete Option Catalog & Pricing Matrix

### 2.1 Sizing & Width Options
| Option ID | Display Label | Base Cabinet W (mm / in) | Countertop W (mm / in) | Bounding Box Width (mm) | Model Asset File | Base Price (USD) | Basin Count | Sizing Notes |
| :---: | :---: | :---: | :---: | :---: | :--- | :---: | :---: | :--- |
| `24` | **24″** | $609.6\text{ mm}$ ($24.0″$) | $635.0\text{ mm}$ ($25.0″$) | $635.0\text{ mm}$ | `Everdale_24_Vanity_Interactive.glb` | **$699.00** | 1 | $24″$ base $+ 25″$ top |
| `31` | **31″** | $762.0\text{ mm}$ ($30.0″$) | $787.4\text{ mm}$ ($31.0″$) | $787.4\text{ mm}$ | `Everdale_31_Vanity_Interactive.glb` | **$799.00** | 1 | $30″$ base $+ 31″$ top (Hero default) |
| `37` | **37″** | $914.4\text{ mm}$ ($36.0″$) | $939.8\text{ mm}$ ($37.0″$) | $939.8\text{ mm}$ | `Everdale_37_Vanity_Interactive.glb` | **$929.00** | 1 | $36″$ base $+ 37″$ top |
| `49` | **49″** | $1219.2\text{ mm}$ ($48.0″$) | $1244.6\text{ mm}$ ($49.0″$) | $1244.6\text{ mm}$ | `Everdale_49_Vanity_Interactive.glb` | **$1,149.00** | 1 | $48″$ base $+ 49″$ top |
| `61` | **61″** | $1524.0\text{ mm}$ ($60.0″$) | $1549.4\text{ mm}$ ($61.0″$) | $1549.4\text{ mm}$ | `Everdale_61_Vanity_Interactive.glb` | **$1,399.00** | 2 | $60″$ base $+ 61″$ top (Dual Basin) |

### 2.2 Depth Options
| Option ID | Display Label | Stated Depth | Status | Technical Reality in Existing Models |
| :---: | :---: | :---: | :---: | :--- |
| `16` | **16″** | $16.0\text{ in}$ | Disabled | Theoretical slim powder-room variant; no model currently modeled. |
| `19` | **19″** | $19.0\text{ in}$ ($482.6\text{ mm}$) | **Enabled** | Standard depth for all five current GLB models. |
| `22` | **22″** | $22.0\text{ in}$ | Disabled | Theoretical deep residential variant; no model currently modeled. |

### 2.3 Cabinet Finishes
| Option ID | Finish Name | Color Code | Carcass Hex | Leg Hex | Roughness | Price Delta | Availability |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `evergreen-fog` | **Evergreen Fog** | SW 9130 | `#899281` | `#848d7c` | 0.42 | **+$0.00** | In Stock (Default) |
| `matte-white` | **Matte White** | MW-01 | `#efeee9` | `#e7e5df` | 0.36 | **+$0.00** | In Stock |
| `light-gray` | **Dove Gray** | DG-14 | `#c2c6c5` | `#b8bdbc` | 0.42 | **+$0.00** | In Stock |
| `midnight-blue` | **Midnight Blue** | MB-88 | `#2b3d52` | `#253548` | 0.39 | **+$30.00** | Quickship / In Stock |
| `warm-beige` | **Almond Latte** | AL-22 | `#cec2b1` | `#c4b7a5` | 0.44 | **+$0.00** | In Stock |

### 2.4 Hardware Finishes (Drawer & False Drawer Pulls)
| Option ID | Finish Name | Base Hex | Metalness | Roughness | Price Delta |
| :---: | :--- | :---: | :---: | :---: | :---: |
| `antique-brass` | **Antique Brass** | `#b08b4f` | 0.88 | 0.32 | **+$0.00** (Default) |
| `matte-black` | **Matte Black** | `#232528` | 0.35 | 0.45 | **+$24.00** |
| `brushed-nickel` | **Brushed Nickel** | `#c4c8cc` | 0.88 | 0.28 | **+$24.00** |
| `brushed-gold` | **Satin Gold** | `#d5b36a` | 0.92 | 0.24 | **+$32.00** |

### 2.5 Countertop Finishes
| Option ID | Countertop Name | Texture Type | Swatch Hex | Roughness | Price Delta |
| :---: | :--- | :--- | :---: | :---: | :---: |
| `white-engineered-stone` | **White Engineered Stone** | Solid White Stone | `#f4f3ef` | 0.18 | **+$0.00** (Included) |
| `carrara-marble` | **White Carrara CM** | Procedural Carrara Veining | `#ecece9` | 0.15 | **+$45.00** |
| `light-gray-quartz` | **Light Gray Quartz** | Procedural Mineral Speckles | `#d9dad8` | 0.20 | **+$45.00** |

### 2.6 Backsplash Options
| Option ID | Option Name | Description | Price Delta |
| :---: | :--- | :--- | :---: |
| `included` | **4″ Matching Backsplash** | Engineered stone backsplash slab mounted on rear counter | **+$0.00** (Default) |
| `none` | **No Backsplash** | Flush installation for fully tiled walls | **+$0.00** |

### 2.7 Faucet Options
| Option ID | Option Name | Description | Price Delta |
| :---: | :--- | :--- | :---: |
| `none` | **Pre-drilled Only (No Faucet)** | Standard 4″ centerset 3-hole drilling | **+$0.00** |
| `centerset-4` | **4″ Centerset Faucet + Drain** | Two-handle high-arc spout with pop-up trim | **+$89.00** ($178 for 61″) |

### 2.8 Mirror Options
| Option ID | Mirror Name | Description | Frame Type | Price Delta |
| :---: | :--- | :--- | :---: | :---: |
| `none` | **No Mirror** | Vanity combo only | None | **+$0.00** |
| `rectangle` | **Rectangle** | 24″ $\times$ 32″ framed wall mirror | Wood frame | **+$119.00** (Default) |
| `arched` | **Arched** | 24″ $\times$ 34″ slim metal arch | Metal frame | **+$139.00** |
| `round` | **Round** | 28″ diameter metal circular mirror | Metal frame | **+$109.00** |
| `led-backlit` | **LED Backlit** | 24″ $\times$ 32″ halo defogger mirror | Frameless | **+$249.00** |

### 2.9 Mirror Frames
- **Wood Frames (for Rectangle)**:
  - `match-vanity` (Dynamically matches cabinet color hex)
  - `almond-latte` (`#cbbba5`)
  - `matte-white` (`#f0efe9`)
  - `warm-walnut` (`#6c4d38`)
- **Metal Frames (for Arched & Round)**:
  - `antique-brass` (`#b08b4f`, Metalness: 0.88, Roughness: 0.30)
  - `matte-black` (`#222427`, Metalness: 0.40, Roughness: 0.42)
  - `brushed-nickel` (`#c4c8cc`, Metalness: 0.88, Roughness: 0.26)
  - `brushed-gold` (`#d5b36a`, Metalness: 0.92, Roughness: 0.24)

### 2.10 Room Staging & Lighting Presets
- **Wall Finishes**: `microcement`, `plain`, `cottage`, `classic`, `stone`, `marble`.
- **Floor Materials**: `checker`, `room-default` (Warm Oak), `limestone`, `marble-hex`.
- **Lighting Presets**:
  - `warm-bath`: 2700K incandescent warmth, illuminated wall sconces (Default).
  - `studio`: High-contrast showroom lighting with crisp reflections.
  - `daylight`: Fresh 5500K morning window daylight.
  - `evening`: Moody evening ambience with brass specular glints.

---

## 3. Product Dimension Verification

### 3.1 31-Inch Hero Vanity Verification
| Component | Stated Drawing Specification | 3D Model Bounding Box | Variance | Verification Status |
| :--- | :---: | :---: | :---: | :---: |
| **Countertop Width** | $787.4\text{ mm}$ ($31.0\text{ in}$) | $787.4\text{ mm}$ ($[-393.7, +393.7]$) | $0.0\text{ mm}$ | **VERIFIED ACCURATE** |
| **Base Cabinet Width** | $762.0\text{ mm}$ ($30.0\text{ in}$) | $762.0\text{ mm}$ ($[-381.0, +381.0]$) | $0.0\text{ mm}$ | **VERIFIED ACCURATE** |
| **Overall Depth** | $482.6\text{ mm}$ ($19.0\text{ in}$) | $482.6\text{ mm}$ (Excl. pulls) | $0.0\text{ mm}$ | **VERIFIED ACCURATE** |
| **Vanity Height (No Splash)**| $863.6\text{ mm}$ ($34.0\text{ in}$) | $863.6\text{ mm}$ ($0.0\text{ to }0.8636\text{m}$) | $0.0\text{ mm}$ | **VERIFIED ACCURATE** |
| **Backsplash Height** | $101.6\text{ mm}$ ($4.0\text{ in}$) | $101.6\text{ mm}$ ($0.8636\text{ to }0.9652\text{m}$) | $0.0\text{ mm}$ | **VERIFIED ACCURATE** |
| **Leg Height** | $104.775\text{ mm}$ ($4.125\text{ in}$) | $104.775\text{ mm}$ ($0.0\text{ to }0.1048\text{m}$) | $0.0\text{ mm}$ | **VERIFIED ACCURATE** |
| **Faucet Drilling** | 4″ Centerset (3 holes) | Pre-drilled at 4″ centers | $0.0\text{ mm}$ | **VERIFIED ACCURATE** |

---

## 4. Configuration Validation & Integrity Analysis

1. **Dual-Basin Multiplication Rule**:
   - For 61″ double-basin vanity, `calculatePricing` properly multiplies the faucet price delta by $2$ (`faucet.priceDelta * 2`), and adjusts the mirror delta by $1.7\times$ to reflect dual mirrors.
2. **Promotional Rebate Calculation**:
   - `BRAND_CONFIG.rebateRate = 0.11` (11% savings).
   - `rebateValue = subtotal * 0.11`.
   - `afterRebate = subtotal - rebateValue`.
   - Client-side pricing is strictly for front-end estimation. Server-side validation must be implemented in Phase 02 before checkout.
3. **URL State Parameter Validation**:
   - Currently, `readConfigFromUrl()` reads query parameters without validating them against option IDs.
   - Injecting an unknown ID (e.g. `?width=100`) leads to unselected buttons in the configurator UI.
   - Sanitizing inputs against `WIDTH_OPTIONS.map(w => w.id)` in `readConfigFromUrl` resolves this issue.
