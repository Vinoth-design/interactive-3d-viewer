# Everdale Product Platform: Configuration Rules & Compatibility Specification
**Version**: 3.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-24  
**Applicability**: Configuration Engine, Client & Server Validation, Compatibility Graph

---

## 1. Overview & Validation Philosophy

Everdale products feature complex interdependencies between physical carcass dimensions, hardware drillings, plumbing fixtures, and electrical mirrors. The **Configuration Engine** guarantees that:
1. No impossible, incompatible, or mechanically unmanufacturable option combination can be added to cart or submitted for quotation.
2. Incompatible selections trigger transparent, user-friendly resolution dialogues rather than silent error drops or silent corrupted states.
3. Configuration validation is deterministic, pure, and shared identically between client-side UI and server-side order processing.

---

## 2. Declarative Rule Typology

The system evaluates four distinct rule types:

### 2.1 `VariantConstraint` (Dimension & Sizing Scoping)
Restricts which option values are physically valid for a given size variant.
- **Rule V01 (Depth Availability)**: Flagship Everdale vanities are manufactured strictly at $19.0″$ ($482.6\text{ mm}$) depth. Selections of $16″$ or $22″$ depth options are marked `disabled: true` and rejected by the validator.
- **Rule V02 (Basin Scaling)**:
  - If `variantId === 'vanity-61'`, `basinCount = 2`.
  - Faucet selections require two units (or dual-set package). Faucet price delta is multiplied by 2.
  - Mirror selections require two mirrors or an oversized dual-vanity mirror ($1.7\times$ price factor).

### 2.2 `DependencyRule` (Option Pairing)
Requires a secondary option to be enabled when a primary option is selected.
- **Rule D01 (Mirror Frame Finish)**:
  - When `mirror === 'rectangle'`, the frame type is `wood`. Available frame finishes must belong to `MIRROR_FRAMES_WOOD` (or dynamic `match-vanity`).
  - When `mirror === 'arched' | 'round'`, the frame type is `metal`. Available frame finishes must belong to `MIRROR_FRAMES_METAL`.
  - When `mirror === 'none' | 'led-backlit'`, `frame` option is deactivated.

### 2.3 `MutualExclusion` (Incompatible Selections)
Prohibits co-existence of two options.
- **Rule M01 (Backsplash vs Custom Tile)**:
  - If `backsplash === 'none'`, the rear mounting flange is unclipped, intended for full-wall architectural tile installations.

### 2.4 `ModularAdjacency` (Kitchen Specific)
Governs side-by-side modular installation for future kitchen cabinetry.
- **Rule K01 (Corner Filler Requirement)**: A corner base cabinet (`kitchen-corner-cabinet`) requires a minimum $3.0″$ filler strip adjacent to a drawer bank to ensure drawer handles clear adjacent doors.

---

## 3. Resolution & Conflict Resolution Policy

When a customer selects an option that invalidates a previously chosen dependent option:
1. **Preserve Unrelated Selections**: All unaffected option values remain unchanged.
2. **Deterministic Fallback**: If the dependent option has a valid default for the new state, it is automatically switched to the default.
   - *Example*: Switching from a rectangular wood mirror to an arched mirror automatically updates `frame` from `match-vanity` to `antique-brass` (the default metal finish).
3. **User Notification**: The UI dispatches an informational toast: *"Frame finish updated to Antique Brass to match metal arched mirror design."*

---

## 4. Configuration Validation Algorithm

```javascript
export function validateConfiguration(product, rawConfig) {
  const errors = [];
  const sanitized = { ...rawConfig };
  
  // 1. Resolve variant
  const variant = product.variants.find(v => v.id === sanitized.width) || product.variants[0];
  sanitized.width = variant.id;
  
  // 2. Validate required option groups
  for (const group of product.optionGroups) {
    if (group.required && !sanitized[group.id]) {
      sanitized[group.id] = group.defaultValue;
    }
  }
  
  // 3. Evaluate compatibility rules
  for (const rule of product.compatibilityRules) {
    const isTriggered = evaluateCondition(rule.condition, sanitized, variant);
    if (isTriggered) {
      applyRuleResult(rule.result, sanitized, errors);
    }
  }
  
  return {
    isValid: errors.length === 0,
    sanitizedConfig: sanitized,
    errors
  };
}
```
