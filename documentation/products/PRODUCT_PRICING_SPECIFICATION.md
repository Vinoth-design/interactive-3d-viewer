# Everdale Product Platform: Pricing Specification & Cost Architecture
**Version**: 3.0.0  
**Status**: APPROVED & ACTIVE  
**Last Updated**: 2026-11-24  
**Applicability**: Configurator Pricing Engine, Quotation Estimates, Server-Authoritative Billing

---

## 1. Executive Summary & Principles

The Everdale Pricing Architecture decouples pricing evaluation from UI rendering components. The pricing engine provides:
1. **Immediate Indicative Feedback**: High-frequency client-side recalculation ($< 2\text{ ms}$) as options toggle.
2. **Deterministic Mathematical Formulas**: Zero rounding ambiguity; prices evaluate to identical cents across web client, Node.js backend, and PDF quotation generators.
3. **Immutable Price Snapshots**: Persists frozen itemized pricing breakdown records (`ProductConfiguration.price_snapshot`) for cart, checkout, and quote persistence.
4. **Server Authority**: The frontend calculation is an indicative estimate; production orders and quote submissions are re-evaluated and validated server-side.

---

## 2. Mathematical Cost Evaluation Formula

$$\text{Subtotal} = P_{\text{base}}(V) + \sum \Delta P_{\text{finish}} + \sum \Delta P_{\text{hardware}} + \sum \Delta P_{\text{top}} + (\Delta P_{\text{faucet}} \cdot M_{\text{basin}}) + (\Delta P_{\text{mirror}} \cdot F_{\text{mirror}})$$

Where:
- $P_{\text{base}}(V)$ = Base price of selected physical variant $V$ ($24″: \$699$, $31″: \$799$, $37″: \$929$, $49″: \$1149$, $61″: \$1399$).
- $\Delta P_{\text{finish}}$ = Finish premium ($\$0.00$ baseline; $+\$30.00$ for Midnight Blue).
- $\Delta P_{\text{hardware}}$ = Hardware upgrade ($\$0.00$ for Antique Brass; $+\$24.00$ for Matte Black/Brushed Nickel; $+\$32.00$ for Satin Gold).
- $\Delta P_{\text{top}}$ = Countertop finish delta ($\$0.00$ for White Stone; $+\$45.00$ for Carrara Marble / Quartz).
- $M_{\text{basin}}$ = Basin scaling multiplier ($1$ for single-basin $24″-49″$; $2$ for dual-basin $61″$).
- $F_{\text{mirror}}$ = Dual-basin mirror sizing factor ($1.0$ for single basin; $1.7$ for double basin when mirror is selected).

### Promotional Rebate Calculation
$$\text{Rebate} = \text{round}(\text{Subtotal} \cdot R_{\text{rebate}}, 2)$$
$$\text{Total After Rebate} = \text{Subtotal} - \text{Rebate}$$
Where default promotional rebate rate $R_{\text{rebate}} = 0.11$ ($11\%$).

---

## 3. Flagship Price Verification Benchmarks

| Variant Size | Configuration Profile | Subtotal | 11% Rebate | Net After Rebate |
| :--- | :--- | :--- | :--- | :--- |
| **24″ Single Vanity** | Evergreen Fog, Antique Brass, White Stone, No Faucet, No Mirror | $\$699.00$ | $\$76.89$ | $\$622.11$ |
| **31″ Single Vanity** | Evergreen Fog, Antique Brass, White Stone, 4″ Faucet, Rectangle Mirror | $\$1007.00$ | $\$110.77$ | $\$896.23$ |
| **37″ Single Vanity** | Midnight Blue ($+\$30$), Matte Black ($+\$24$), Carrara Marble ($+\$45$) | $\$1028.00$ | $\$113.08$ | $\$914.92$ |
| **49″ Single Vanity** | Matte White, Brushed Nickel ($+\$24$), Quartz ($+\$45$), Faucet ($+\$89$) | $\$1307.00$ | $\$143.77$ | $\$1163.23$ |
| **61″ Double Vanity** | Evergreen Fog, Antique Brass, White Stone, Dual Faucet ($+\$178$), Dual Mirror ($+\$202.30$) | $\$1779.30$ | $\$195.72$ | $\$1583.58$ |

All benchmarks are automated in `scripts/test_catalog_suite.js` and verified passing with $0.00$ cent discrepancy.

---

## 4. Multi-Category Pricing Modes

1. **`configurable` (Bathroom Vanities)**: Base variant price plus dynamic add-on option deltas.
2. **`variant-based` (Standard Accessories)**: Flat price per size without sub-options.
3. **`quote-required` (Modular Kitchen Cabinetry)**: Pricing requires project take-off, linear footage estimation, or custom quotation confirmation before purchase.
4. **`price-on-request` (Architectural Commercial)**: High-volume contract orders.
