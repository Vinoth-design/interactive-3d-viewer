# Everdale 31-Inch Bathroom Vanity – Animation Specifications

## 1. Overview
The vanity includes 6 glTF-compatible animation clips exported via NLA tracks. Each animation controls translation along the negative $Y$ travel axis (front-facing direction).

---

## 2. Animation Clip Index

| Clip Name | Target Node(s) | Duration | Frames (30 fps) | Motion Profile | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `Drawer01_Open` | `Drawer_01_Root` | 0.70 s | 1 – 21 | Smooth Bezier (Ease In-Out) | Opens upper functional drawer by 275 mm |
| `Drawer01_Close` | `Drawer_01_Root` | 1.00 s | 1 – 30 | Soft-Close (Decelerating) | Closes upper drawer; decelerates in final 20% |
| `Drawer02_Open` | `Drawer_02_Root` | 0.70 s | 1 – 21 | Smooth Bezier (Ease In-Out) | Opens lower functional drawer with trays by 275 mm |
| `Drawer02_Close` | `Drawer_02_Root` | 1.00 s | 1 – 30 | Soft-Close (Decelerating) | Closes lower drawer; decelerates into flush seal |
| `All_Drawers_Open` | `Drawer_01_Root`, `Drawer_02_Root` | 0.70 s | 1 – 21 | Multi-channel Bezier | Simultaneously extends both drawers |
| `All_Drawers_Close` | `Drawer_01_Root`, `Drawer_02_Root` | 1.00 s | 1 – 30 | Multi-channel Soft-Close | Simultaneously soft-closes both drawers |

---

## 3. Kinematic Curves

### 3.1 Opening Travel Profile
- **Rest Position**: $Y = -238.075\text{ mm}$ ($0.0\text{ mm}$ travel offset).
- **Peak Extension**: $Y = -513.075\text{ mm}$ ($275.0\text{ mm}$ extension).
- **Interpolation**: Clamped auto-Bezier tangent with zero start/end velocity.

### 3.2 Soft-Close Damper Profile
Simulates mechanical undermount hydraulic soft-close damping:
1. **Free Travel (Frames 1–18)**: Rapid, uniform return over 80% of travel distance ($220\text{ mm}$ covered in $0.6\text{ s}$).
2. **Damper Engagement (Frames 18–25)**: Soft-close piston engages at $55\text{ mm}$ from face; speed drops sharply.
3. **Controlled Catch (Frames 25–30)**: Gentle, controlled crawl into rest flush face ($10\text{ mm}$ in $0.17\text{ s}$), zero bounce, zero overshoot.
