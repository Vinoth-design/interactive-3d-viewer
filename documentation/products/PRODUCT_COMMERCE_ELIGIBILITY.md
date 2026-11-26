# Everdale Product Platform: Hybrid Commerce Eligibility Specification
**Version**: 3.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-24  
**Applicability**: Direct Purchase Gateways, Quotation Routing, Supply Chain Availability

---

## 1. Hybrid Commerce Philosophy

Everdale operates a hybrid commerce model catering to two distinct purchase behaviors:
1. **Direct Purchase (E-Commerce)**: Standard catalog configurations manufactured, inventoried, and eligible for immediate online credit card checkout (`in-stock`).
2. **Custom Quotation (Design Studio)**: Built-to-order architectural cabinetry, customized finishes, large-scale kitchen projects, or commercial multi-unit specifications (`quickship` and `semi-custom`).

---

## 2. Eligibility State Machine

```
                              [ Configured Product ]
                                        │
                         Is Product published & active?
                                  /            \
                                YES             NO ────> [ BLOCK / Made-to-Order Quote Only ]
                                 │
                     Evaluate Fulfillment Channel Tab
                     /               │              \
         ['in-stock']          ['quickship']     ['semi-custom']
              │                      │                  │
   Is Variant in-stock?         Quote Enabled?     Quote Enabled?
      /         \                    │                  │
    YES          NO                  │                  │
     │            └──> [ Quote ]     │                  │
     v                               v                  v
[ Direct Purchase ]            [ 3–5 Wk Quote ]   [ 5–7 Wk Custom Quote ]
(100% Checkout)                (50% Deposit)      (Design Confirmation)
```

---

## 3. Evaluated Channel Policies

| Channel ID | Label | Purchase Eligible | Quote Eligible | Lead Time | Deposit Requirement | CTA Label |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `in-stock` | In Stock | **TRUE** | **TRUE** | Immediate ship / pickup | $100\%$ at checkout | `ADD TO CART` |
| `quickship` | Quickship | **FALSE** | **TRUE** | $3 - 5\text{ weeks}$ | $50\%$ deposit, balance at ship | `REQUEST QUOTE` |
| `semi-custom` | Semi-Custom | **FALSE** | **TRUE** | $5 - 7\text{ weeks}$ | $50\%$ deposit + design review | `REQUEST CUSTOM QUOTE` |

---

## 4. Product Category Specific Rules

### Category 01: Bathroom Vanities
- Standard in-stock finish combinations (`evergreen-fog`, `matte-white`, `dove-gray`, `warm-beige`) with standard hardware are fully purchase eligible.
- When `semi-custom` channel is activated, the CTA automatically shifts to quotation mode to allow specialized color matching and non-standard drill spreads.

### Category 02: Kitchen Cabinetry
- All kitchen modules are flagged with `purchaseEnabled: false`, `quoteEnabled: true`, and `status: 'draft'`.
- Prevents premature checkout of unassembled kitchen modules before spatial verification, professional appliance cutouts, and countertop templating are finalized.
