/* =================================================================
   HARKEN APPRAISAL WIZARD V3 - IMPROVEMENTS CONTRACT (Prototype)
   Canonical model: Parcel → Building → Area/Segment
   This module is intentionally framework-agnostic and backend-ready.
   ================================================================= */

(function () {
  const SCHEMA_VERSION = 1;

  function makeId(prefix = 'id') {
    try {
      if (typeof window !== 'undefined' && typeof window.generateId === 'function') {
        return `${prefix}_${window.generateId()}`;
      }
    } catch (_) {}
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function deepClone(obj) {
    try {
      if (typeof window !== 'undefined' && typeof window.deepClone === 'function') {
        return window.deepClone(obj);
      }
    } catch (_) {}
    return JSON.parse(JSON.stringify(obj));
  }

  function createArea(overrides = {}) {
    return {
      id: makeId('area'),
      useType: 'warehouse',
      useTypeCustom: '',
      sf: 0,
      sfType: 'GBA', // GBA | NRA | Other
      sfTypeCustom: '',
      yearBuiltOverride: null,
      finishes: {},
      systems: {},
      notes: '',
      ...overrides,
    };
  }

  function createBuilding(overrides = {}) {
    return {
      id: makeId('bldg'),
      label: 'Building 1',
      addressOverride: '',
      yearBuilt: null,
      yearRemodeled: '',
      constructionType: '',
      quality: '',
      condition: '',
      notes: '',
      areas: [createArea()],
      ...overrides,
    };
  }

  function createParcel(overrides = {}) {
    return {
      id: makeId('parcel'),
      label: 'Parcel 1',
      taxParcelId: '',
      legalDescription: '',
      address: '',
      notes: '',
      buildings: [createBuilding()],
      ...overrides,
    };
  }

  function createDefaultInventory() {
    return {
      schemaVersion: SCHEMA_VERSION,
      parcels: [createParcel()],
    };
  }

  function normalizeInventory(raw) {
    const inv = raw && typeof raw === 'object' ? deepClone(raw) : createDefaultInventory();
    inv.schemaVersion = SCHEMA_VERSION;
    inv.parcels = Array.isArray(inv.parcels) ? inv.parcels : [];

    if (inv.parcels.length === 0) {
      inv.parcels = [createParcel()];
      return inv;
    }

    inv.parcels.forEach((p, pIdx) => {
      p.id = p.id || makeId('parcel');
      p.label = p.label || `Parcel ${pIdx + 1}`;
      p.buildings = Array.isArray(p.buildings) ? p.buildings : [];
      if (p.buildings.length === 0) p.buildings = [createBuilding({ label: 'Building 1' })];

      p.buildings.forEach((b, bIdx) => {
        b.id = b.id || makeId('bldg');
        b.label = b.label || `Building ${bIdx + 1}`;
        b.areas = Array.isArray(b.areas) ? b.areas : [];
        if (b.areas.length === 0) b.areas = [createArea()];

        b.areas.forEach((a) => {
          a.id = a.id || makeId('area');
          a.useType = a.useType || 'warehouse';
          a.sf = toNumber(a.sf);
          a.sfType = a.sfType || 'GBA';
          if (!a.finishes || typeof a.finishes !== 'object') a.finishes = {};
          if (!a.systems || typeof a.systems !== 'object') a.systems = {};
        });
      });
    });

    return inv;
  }

  function computeRollups(invRaw) {
    const inv = normalizeInventory(invRaw);

    const subjectTotals = {
      parcels: inv.parcels.length,
      buildings: 0,
      areas: 0,
      sfByType: {}, // {GBA: n, NRA: n, Other: n}
      sfTotal: 0,
    };

    const parcelTotals = {}; // parcelId -> totals
    const buildingTotals = {}; // buildingId -> totals

    inv.parcels.forEach((p) => {
      const pTot = {
        parcelId: p.id,
        buildings: 0,
        areas: 0,
        sfByType: {},
        sfTotal: 0,
      };

      (p.buildings || []).forEach((b) => {
        subjectTotals.buildings += 1;
        pTot.buildings += 1;

        const bTot = {
          buildingId: b.id,
          areas: 0,
          sfByType: {},
          sfTotal: 0,
          useTypeBreakdown: {}, // useTypeLabel -> sfTotal
        };

        (b.areas || []).forEach((a) => {
          subjectTotals.areas += 1;
          pTot.areas += 1;
          bTot.areas += 1;

          const sf = toNumber(a.sf);
          const sfType = a.sfType || 'GBA';
          const useLabel = (a.useType === 'custom' ? (a.useTypeCustom || 'Custom') : a.useType) || 'unknown';

          bTot.sfByType[sfType] = toNumber(bTot.sfByType[sfType]) + sf;
          pTot.sfByType[sfType] = toNumber(pTot.sfByType[sfType]) + sf;
          subjectTotals.sfByType[sfType] = toNumber(subjectTotals.sfByType[sfType]) + sf;

          bTot.sfTotal += sf;
          pTot.sfTotal += sf;
          subjectTotals.sfTotal += sf;

          bTot.useTypeBreakdown[useLabel] = toNumber(bTot.useTypeBreakdown[useLabel]) + sf;
        });

        buildingTotals[b.id] = bTot;
      });

      parcelTotals[p.id] = pTot;
    });

    return { subjectTotals, parcelTotals, buildingTotals };
  }

  function validateInventory(invRaw, options = {}) {
    const inv = normalizeInventory(invRaw);
    const { requireImprovements = true } = options; // e.g., false for Land template

    const issues = [];

    const push = (severity, code, message, path = '') => {
      issues.push({ severity, code, message, path });
    };

    // Structural coherence
    if (!Array.isArray(inv.parcels) || inv.parcels.length === 0) {
      push('error', 'NO_PARCELS', 'Add at least one parcel.', 'parcels');
      return { issues, inventory: inv };
    }

    // Require at least one area with SF > 0 for improved property flows
    let anyArea = false;
    let anyPositiveSf = false;

    inv.parcels.forEach((p, pIdx) => {
      if (!p.taxParcelId) {
        push('warning', 'MISSING_PARCEL_ID', 'Parcel Tax/Parcel ID is missing (recommended).', `parcels[${pIdx}].taxParcelId`);
      }

      if (!Array.isArray(p.buildings) || p.buildings.length === 0) {
        push('error', 'NO_BUILDINGS', 'Parcel has no buildings. Add a building or remove the parcel.', `parcels[${pIdx}].buildings`);
        return;
      }

      p.buildings.forEach((b, bIdx) => {
        if (!b.yearBuilt) {
          push('warning', 'MISSING_YEAR_BUILT', 'Building Year Built is missing (recommended).', `parcels[${pIdx}].buildings[${bIdx}].yearBuilt`);
        }

        if (!Array.isArray(b.areas) || b.areas.length === 0) {
          push('error', 'NO_AREAS', 'Building has no areas/segments. Add at least one area.', `parcels[${pIdx}].buildings[${bIdx}].areas`);
          return;
        }

        b.areas.forEach((a, aIdx) => {
          anyArea = true;
          const sf = toNumber(a.sf);
          if (sf > 0) anyPositiveSf = true;
          if (!a.useType || (a.useType === 'custom' && !a.useTypeCustom)) {
            push('warning', 'MISSING_USE_TYPE', 'Area use type is missing (recommended).', `parcels[${pIdx}].buildings[${bIdx}].areas[${aIdx}].useType`);
          }
          if (sf <= 0) {
            push('warning', 'ZERO_SF', 'Area square footage is 0 (verify).', `parcels[${pIdx}].buildings[${bIdx}].areas[${aIdx}].sf`);
          }
        });
      });
    });

    if (requireImprovements) {
      if (!anyArea) {
        push('error', 'NO_IMPROVEMENTS', 'No improvement areas found. Add buildings/areas or switch to Land workflow.', 'parcels');
      } else if (!anyPositiveSf) {
        push('error', 'NO_POSITIVE_SF', 'All areas have 0 SF. Enter square footage for at least one area.', 'parcels');
      }
    }

    return { issues, inventory: inv };
  }

  window.ImprovementsContract = {
    SCHEMA_VERSION,
    makeId,
    createDefaultInventory,
    normalizeInventory,
    computeRollups,
    validateInventory,
    createParcel,
    createBuilding,
    createArea,
  };
})();


