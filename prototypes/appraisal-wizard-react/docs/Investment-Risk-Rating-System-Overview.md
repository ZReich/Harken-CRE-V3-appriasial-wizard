<p align="center">
  <img src="https://img.shields.io/badge/STATUS-IN%20DEVELOPMENT-0da1c7?style=for-the-badge" alt="Status"/>
</p>

<h1 align="center">
  Investment Risk Rating System
</h1>

<p align="center">
  <strong>"Bond Rating for Buildings"</strong><br/>
  <em>A Proprietary Risk Analysis Framework for Commercial Real Estate</em>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#the-rating-scale">Rating Scale</a> •
  <a href="#data-sources">Data Sources</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#competitive-edge">Competitive Edge</a>
</p>

---

<br/>

## Overview

<table>
<tr>
<td width="60%">

### The Concept

The Investment Risk Rating System applies **Wall Street-style credit analysis** to individual properties, generating a standardized risk rating from **AAA** (Exceptional) to **C** (High Risk).

**Think of it like a credit score for buildings.**

Just as a FICO score tells lenders about a borrower's creditworthiness, our Risk Rating tells lenders about a property's investment quality — in the language they already use.

</td>
<td width="40%" align="center">

```
    ╔═══════════════╗
    ║               ║
    ║      BBB      ║
    ║    ───────    ║
    ║    74 / 100   ║
    ║               ║
    ╚═══════════════╝
      Investment Grade
       Moderate Risk
```

</td>
</tr>
</table>

<br/>

### Why This Matters

| Current Problem | Our Solution |
|:----------------|:-------------|
| Traditional appraisals provide point-in-time values but don't speak the language of risk | Standardized ratings (AAA to C) that banks already understand |
| Lenders must internally translate appraisal data into their risk models | Risk analysis front-loaded in reports for underwriters |
| No competitor offers property-level bond-style ratings | **First-to-market** differentiation |

<br/>

---

<br/>

## The Rating Scale

<table>
<tr>
<th align="center" width="12%">Rating</th>
<th align="left" width="25%">Classification</th>
<th align="left">Typical Properties</th>
</tr>
<tr>
<td align="center"><strong style="color: #10b981; font-size: 1.2em;">AAA</strong></td>
<td>Institutional Grade</td>
<td>Class A CBD office, new construction multifamily in prime markets</td>
</tr>
<tr>
<td align="center"><strong style="color: #10b981;">AA</strong></td>
<td>High Quality</td>
<td>Prime suburban retail, fully stabilized apartments</td>
</tr>
<tr>
<td align="center"><strong style="color: #10b981;">A</strong></td>
<td>Upper Medium Grade</td>
<td>Good location, stable tenancy, minor deferred maintenance</td>
</tr>
<tr>
<td align="center"><strong style="color: #0da1c7; font-size: 1.1em;">BBB</strong></td>
<td>Investment Grade</td>
<td>Solid fundamentals, correlates with market cycles</td>
</tr>
<tr>
<td align="center"><strong style="color: #f59e0b;">BB</strong></td>
<td>Speculative</td>
<td>Older assets, transitional markets, some risk factors</td>
</tr>
<tr>
<td align="center"><strong style="color: #f59e0b;">B</strong></td>
<td>Highly Speculative</td>
<td>Significant deferred maintenance, challenging location</td>
</tr>
<tr>
<td align="center"><strong style="color: #ef4444;">CCC</strong></td>
<td>Substantial Risk</td>
<td>Declining neighborhood, high vacancy</td>
</tr>
<tr>
<td align="center"><strong style="color: #ef4444;">CC</strong></td>
<td>Extremely Speculative</td>
<td>Major physical or location issues</td>
</tr>
<tr>
<td align="center"><strong style="color: #ef4444;">C</strong></td>
<td>Near Default Risk</td>
<td>Obsolete, condemned, or severely distressed</td>
</tr>
</table>

<br/>

---

<br/>

## Data Sources

The rating is calculated from **four key dimensions**, each powered by real data:

<br/>

<table>
<tr>
<td width="50%" valign="top">

### 1️⃣ Market Volatility

**Question:** *How stable is this property's value compared to the broader market?*

| Data Point | Source |
|:-----------|:-------|
| Historical price trends | Market Analysis |
| S&P 500 / REIT comparison | FRED API |
| Local market volatility | Sales Data |

**Cost:** FREE (uses existing data + FRED)

</td>
<td width="50%" valign="top">

### 2️⃣ Liquidity Risk

**Question:** *How quickly could this property sell if needed?*

| Data Point | Source |
|:-----------|:-------|
| Days on Market (DOM) | MLS Data |
| Absorption Rate | Market Analysis |
| Inventory Levels | Market Analysis |

**Cost:** FREE (uses existing appraisal data)

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 3️⃣ Income Stability

**Question:** *How reliable is this property's income stream?*

| Data Point | Source |
|:-----------|:-------|
| Cap Rate | Income Approach |
| 10-Year Treasury Rate | FRED API |
| Yield Spread | Calculated |
| Occupancy Trends | Income Analysis |

**Cost:** FREE (uses existing data + FRED)

</td>
<td width="50%" valign="top">

### 4️⃣ Asset Quality

**Question:** *What is the physical and locational quality?*

| Data Point | Source |
|:-----------|:-------|
| Year Built / Condition | Inspection |
| Recent Permits | Cotality API |
| School Ratings | GreatSchools API |
| Crime Statistics | Crimeometer API |

**Cost:** Optional paid APIs enhance accuracy

</td>
</tr>
</table>

<br/>

---

<br/>

## How It Works

### Dynamic Weighting

> **The weights are NOT fixed** — they are calculated automatically based on the property and available data.

<br/>

<table>
<tr>
<th align="left">Factor</th>
<th align="left">How It Affects Weights</th>
</tr>
<tr>
<td><strong>Property Type</strong></td>
<td>Multifamily emphasizes Income Stability • Land emphasizes Market Volatility</td>
</tr>
<tr>
<td><strong>Income-Producing?</strong></td>
<td>Rental properties get higher weight on income metrics</td>
</tr>
<tr>
<td><strong>Data Completeness</strong></td>
<td>Strong data = more weight • Sparse data = reduced reliance</td>
</tr>
<tr>
<td><strong>Market Conditions</strong></td>
<td>Volatile markets increase weight on Market Volatility dimension</td>
</tr>
</table>

<br/>

### Example Weight Distributions

```
Property Type       │ Market Vol. │ Liquidity │ Income │ Quality │
────────────────────┼─────────────┼───────────┼────────┼─────────┤
Multifamily         │     25%     │    25%    │  35%   │   15%   │
Office              │     30%     │    25%    │  30%   │   15%   │
Retail              │     30%     │    30%    │  25%   │   15%   │
Industrial          │     25%     │    30%    │  30%   │   15%   │
Land                │     40%     │    35%    │   5%   │   20%   │
Residential         │     30%     │    30%    │  10%   │   30%   │
```

*These are starting points — the algorithm adjusts based on actual data.*

<br/>

---

<br/>

## Report Placement

The Risk Rating appears **immediately after the Summary of Appraisal** — right where bankers and underwriters look first.

<br/>

```
┌──────────────────────────────────────────────────────────────────┐
│                    INVESTMENT RISK ANALYSIS                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│    This property has been assigned a risk rating of BBB          │
│    (Investment Grade) based on analysis of market, financial,    │
│    and physical factors.                                          │
│                                                                   │
│                      ┌─────────────────┐                          │
│                      │                 │                          │
│                      │       BBB       │                          │
│                      │    ─────────    │                          │
│                      │    74 / 100     │                          │
│                      │                 │                          │
│                      │ Investment Grade│                          │
│                      └─────────────────┘                          │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  RISK DIMENSION BREAKDOWN                                         │
│  ─────────────────────────────────────────────────────────────    │
│                                                                   │
│  Market Volatility    ████████████░░░░░░░░   68    28%           │
│  Liquidity Risk       ██████████████░░░░░░   72    25%           │
│  Income Stability     ████████████████░░░░   81    32%           │
│  Asset Quality        █████████████░░░░░░░   69    15%           │
│                                                                   │
├──────────────────────────────────────────────────────────────────┤
│  WEIGHTING RATIONALE                                              │
│  Weights determined by: Multifamily property type, strong        │
│  income data availability, current stable market conditions.     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

<br/>

---

<br/>

## Implementation Status

<table>
<tr>
<th align="left">Component</th>
<th align="center">Status</th>
<th align="left">Notes</th>
</tr>
<tr>
<td>Rating Algorithm</td>
<td align="center">✅</td>
<td>Dynamic weighting engine built and deployed</td>
</tr>
<tr>
<td>FRED Data (Treasury, Fed Funds)</td>
<td align="center">✅</td>
<td>Free API, working in production</td>
</tr>
<tr>
<td>Property Data (Montana)</td>
<td align="center">✅</td>
<td>Montana Cadastral integration working</td>
</tr>
<tr>
<td>Wizard UI Panel</td>
<td align="center">✅</td>
<td>Risk Rating panel in Review page</td>
</tr>
<tr>
<td>Report Page Layout</td>
<td align="center">✅</td>
<td>Investment Risk Analysis page ready</td>
</tr>
<tr>
<td>Property Data (Out-of-State)</td>
<td align="center">⏳</td>
<td>Cotality API needs activation</td>
</tr>
<tr>
<td>School Ratings</td>
<td align="center">⏳</td>
<td>GreatSchools API needs setup</td>
</tr>
<tr>
<td>Crime Data</td>
<td align="center">⏳</td>
<td>Crimeometer subscription needed</td>
</tr>
</table>

<br/>

---

<br/>

## Data Costs

| Data Source | Purpose | Cost | Status |
|:------------|:--------|:-----|:------:|
| **FRED API** | Treasury rates, Fed Funds, GDP | FREE | ✅ Live |
| **Census API** | Demographics, income data | FREE | ✅ Live |
| **Montana Cadastral** | MT property data | FREE | ✅ Live |
| **Cotality** | Out-of-state property data | Enterprise | ⏳ Pending |
| **GreatSchools** | School district ratings | Free/Paid | ⏳ Optional |
| **Crimeometer** | Crime statistics | $50-500/mo | ⏳ Optional |

> **Note:** The core rating system works today with FREE data sources. Paid APIs enhance accuracy but are not required.

<br/>

---

<br/>

## Competitive Edge

<table>
<tr>
<th width="50%">What CBRE Does</th>
<th width="50%">What We Do</th>
</tr>
<tr>
<td>❌ Uses historical data only</td>
<td>✅ <strong>Predictive Risk Modeling</strong> with live economic data</td>
</tr>
<tr>
<td>❌ No standardized risk rating</td>
<td>✅ <strong>AAA to C Scale</strong> that banks already understand</td>
</tr>
<tr>
<td>❌ Fixed analysis approach</td>
<td>✅ <strong>Dynamic Weighting</strong> adapts to property type & data</td>
</tr>
<tr>
<td>❌ Reports require translation for bank use</td>
<td>✅ <strong>Front-Loaded Risk Analysis</strong> for credit officers</td>
</tr>
</table>

<br/>

---

<br/>

## USPAP Compliance

Every report includes a required disclosure per Advisory Opinion 18:

> **RISK RATING DISCLOSURE**
>
> The Investment Risk Rating is a statistical model based on aggregated market data, used as a supplementary risk analysis tool. This rating does not replace the appraiser's value conclusion or professional judgment. The appraiser has reviewed all model inputs and outputs and determined them reasonable for this analysis.

<br/>

---

<br/>

## Decision Points

<table>
<tr>
<th align="left" width="30%">Question</th>
<th align="left">Options</th>
</tr>
<tr>
<td><strong>GreatSchools & Crimeometer</strong></td>
<td>Add now for enhanced Asset Quality scoring, or defer to reduce costs?</td>
</tr>
<tr>
<td><strong>Cotality API</strong></td>
<td>When should we activate for out-of-state property data?</td>
</tr>
<tr>
<td><strong>Rating Preview</strong></td>
<td>Show preliminary rating during data entry, or only in final Review?</td>
</tr>
<tr>
<td><strong>Weight Customization</strong></td>
<td>Allow appraisers to override algorithm weights, or keep fully automated?</td>
</tr>
</table>

<br/>

---

<br/>

<p align="center">
  <em>Document prepared for executive review</em><br/>
  <sub>Technical implementation details available in the development plan</sub>
</p>
