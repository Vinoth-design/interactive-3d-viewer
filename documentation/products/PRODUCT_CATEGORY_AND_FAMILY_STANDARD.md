# Everdale Product Platform: Category & Family Standard
**Version**: 3.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-24  
**Applicability**: Multi-Category Taxonomy, Bathroom Vanities & Kitchen Cabinetry

---

## 1. Taxonomy & Hierarchical Principles

Everdale organizes architectural cabinetry into a rigid three-tier hierarchy:
$$\text{Category} \longrightarrow \text{Product Family} \longrightarrow \text{Product} \longrightarrow \text{Variants}$$

1. **Category**: Broad market sector defining functional room context (e.g. Bathroom vs Kitchen).
2. **Product Family**: Architectural archetype governing carcass construction, structural mounting, and Three.js interaction kinematics.
3. **Product**: A specific branded offering with defined styling, finish palettes, and hardware compatibility.
4. **Variant**: Specific physical sizing (width, depth, height, carcass partitions).

---

## 2. Category 01: Bathroom Vanities (`bathroom-vanities`)

- **Status**: **LIVE / PUBLISHED**
- **Description**: Luxury residential freestanding and wall-hung bathroom vanity cabinetry featuring integrated stone tops, undermount porcelain basins, and soft-close organizers.

### Supported Product Families
1. **`freestanding-vanity` (Flagship Active Family)**:
   - Mounting: Floor-supported with solid wood tapered legs ($104.78\text{ mm}$ clearance).
   - Countertop: Pre-cut stone or quartz slab with $25.0\text{ mm}$ thickness and $101.6\text{ mm}$ backsplash.
   - Sinks: Single basin ($24″ - 49″$) or dual basin ($61″$).
   - Drawers: Two active undermount soft-close sliding drawers + top fixed false drawer panel.
   - Active Product: `everdale-vanity` (SKU family `605-9530` through `605-9534`).
2. **`wall-mounted-vanity` (Future Architecture)**:
   - Mounting: Heavy-duty steel French cleat wall bracket.
   - Kinematics: Floating carcass with zero floor contact; deeper bottom plumbing reveal.

---

## 3. Category 02: Kitchen Cabinets (`kitchen-cabinets`)

- **Status**: **ARCHITECTURE / DRAFT (UNPUBLISHED)**
- **Description**: Modular frameless architectural kitchen cabinetry engineered to standard 3-inch architectural increments with customizable drawer banks, pull-out larders, and integrated appliances.
- **Publication Policy**: Kitchen products remain in `draft` status until verified factory CAD geometry, certified manufacturing SKUs, and approved pricing tables are onboarded. **Zero fabricated product cards are published.**

### Architectural Family Standards
1. **`kitchen-base-cabinet`**:
   - Mounting: $4.5″$ adjustable toe-kick pedestal.
   - Standard Depth: $24.0″$ ($609.6\text{ mm}$).
   - Standard Height: $34.5″$ ($876.3\text{ mm}$) without countertop ($36.0″$ finished).
   - Modular Widths: $12″, 15″, 18″, 21″, 24″, 30″, 33″, 36″, 42″$.
   - Configurations: 1-Door, 2-Door, 2-Drawer, 3-Drawer, 4-Drawer banks, Sink base.
2. **`kitchen-wall-cabinet`**:
   - Mounting: Heavy-duty wall suspension rail.
   - Standard Depth: $12.0″$ ($304.8\text{ mm}$) or $15.0″$ ($381.0\text{ mm}$) for over-refrigerator.
   - Standard Heights: $30.0″, 36.0″, 42.0″$.
   - Doors: Single or double soft-close Blum hinges ($110^\circ$ swing).
3. **`kitchen-tall-cabinet`**:
   - Standard Depth: $24.0″$ ($609.6\text{ mm}$).
   - Standard Heights: $84.0″, 90.0″, 96.0″$.
   - Types: Full-height pantry with roll-out shelves, double oven housing.
4. **`kitchen-corner-cabinet`**:
   - Types: $36″ \times 36″$ L-shaped Lazy Susan, Blind Corner pull-out mechanism.

---

## 4. Multi-Category Taxonomy Matrix

| Category ID | Family ID | Configuration Model | Kinematic Interaction | Scene Adapter | Current Publication Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bathroom-vanities` | `freestanding-vanity` | Single Assembly | Linear Drawer Slide | `VanitySceneAdapter` | **PUBLISHED** |
| `bathroom-vanities` | `wall-mounted-vanity` | Single Assembly | Linear Slide & Flap | `VanitySceneAdapter` | DRAFT |
| `kitchen-cabinets` | `kitchen-base-cabinet` | Modular Adjacency | Hinge Door & Slide | `KitchenSceneAdapter` | DRAFT |
| `kitchen-cabinets` | `kitchen-wall-cabinet` | Modular Wall Hang | Rotational Hinge | `KitchenSceneAdapter` | DRAFT |
| `kitchen-cabinets` | `kitchen-tall-cabinet` | Modular Vertical | Multi-Tier Hinge | `KitchenSceneAdapter` | DRAFT |
| `kitchen-cabinets` | `kitchen-corner-cabinet`| Modular Corner | Bifold & Carousel | `KitchenSceneAdapter` | DRAFT |
