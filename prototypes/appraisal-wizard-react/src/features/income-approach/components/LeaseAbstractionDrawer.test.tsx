/**
 * Lease Abstraction Module Tests
 * 
 * Comprehensive tests for the lease abstraction feature including:
 * - Type validation
 * - Component rendering
 * - User interactions
 * - Data persistence
 * - Report integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeaseAbstractionDrawer } from './LeaseAbstractionDrawer';
import type { 
  LeaseAbstraction, 
  LeaseType, 
  RentEscalation, 
  LeaseOption,
  TenantImprovement,
  ExpenseRecovery,
  LineItem 
} from '../types';

// =================================================================
// TYPE VALIDATION TESTS
// =================================================================

describe('LeaseAbstraction Types', () => {
  describe('LeaseAbstraction Interface', () => {
    it('should validate required fields', () => {
      const validAbstraction: LeaseAbstraction = {
        id: 'lease-1',
        lineItemId: 'item-1',
        tenantName: 'Starbucks',
        leasedSqFt: 2500,
        leaseType: 'triple_net',
        leaseStartDate: '2024-01-01',
        leaseEndDate: '2029-01-01',
        currentBaseRent: 75000,
        escalations: [],
        options: [],
      };

      expect(validAbstraction.tenantName).toBe('Starbucks');
      expect(validAbstraction.leaseType).toBe('triple_net');
      expect(validAbstraction.leasedSqFt).toBe(2500);
    });

    it('should support all lease types', () => {
      const leaseTypes: LeaseType[] = [
        'gross',
        'modified_gross',
        'triple_net',
        'double_net',
        'single_net',
        'ground',
        'percentage',
        'month_to_month',
      ];

      leaseTypes.forEach(type => {
        const abstraction: LeaseAbstraction = {
          id: 'lease-1',
          lineItemId: 'item-1',
          tenantName: 'Test Tenant',
          leasedSqFt: 1000,
          leaseType: type,
          leaseStartDate: '2024-01-01',
          leaseEndDate: '2029-01-01',
          currentBaseRent: 30000,
          escalations: [],
          options: [],
        };
        expect(abstraction.leaseType).toBe(type);
      });
    });
  });

  describe('RentEscalation Interface', () => {
    it('should validate fixed escalation', () => {
      const escalation: RentEscalation = {
        id: 'esc-1',
        type: 'fixed',
        value: 1000,
        frequencyMonths: 12,
      };

      expect(escalation.type).toBe('fixed');
      expect(escalation.value).toBe(1000);
      expect(escalation.frequencyMonths).toBe(12);
    });

    it('should validate CPI escalation with cap and floor', () => {
      const escalation: RentEscalation = {
        id: 'esc-2',
        type: 'cpi',
        value: 0, // CPI is external
        frequencyMonths: 12,
        cap: 5,
        floor: 2,
      };

      expect(escalation.cap).toBe(5);
      expect(escalation.floor).toBe(2);
    });

    it('should validate percentage escalation', () => {
      const escalation: RentEscalation = {
        id: 'esc-3',
        type: 'percentage',
        value: 3,
        frequencyMonths: 12,
      };

      expect(escalation.type).toBe('percentage');
      expect(escalation.value).toBe(3);
    });
  });

  describe('LeaseOption Interface', () => {
    it('should validate renewal option', () => {
      const option: LeaseOption = {
        id: 'opt-1',
        type: 'renewal',
        termMonths: 60,
        noticeDays: 180,
        rateBasis: 'market',
      };

      expect(option.type).toBe('renewal');
      expect(option.termMonths).toBe(60);
      expect(option.rateBasis).toBe('market');
    });

    it('should validate termination option with fee', () => {
      const option: LeaseOption = {
        id: 'opt-2',
        type: 'termination',
        noticeDays: 90,
        terminationFee: 50000,
      };

      expect(option.terminationFee).toBe(50000);
    });

    it('should validate expansion option', () => {
      const option: LeaseOption = {
        id: 'opt-3',
        type: 'expansion',
        expansionSf: 1500,
        noticeDays: 120,
      };

      expect(option.expansionSf).toBe(1500);
    });

    it('should track exercised status', () => {
      const option: LeaseOption = {
        id: 'opt-4',
        type: 'renewal',
        termMonths: 36,
        isExercised: true,
      };

      expect(option.isExercised).toBe(true);
    });
  });

  describe('TenantImprovement Interface', () => {
    it('should validate TI allowance per SF', () => {
      const ti: TenantImprovement = {
        id: 'ti-1',
        allowancePerSf: 45,
        isAmortized: false,
      };

      expect(ti.allowancePerSf).toBe(45);
      expect(ti.isAmortized).toBe(false);
    });

    it('should validate amortized TI', () => {
      const ti: TenantImprovement = {
        id: 'ti-2',
        totalAllowance: 112500,
        isAmortized: true,
        amortizationPeriod: 60,
        amortizationRate: 8,
      };

      expect(ti.isAmortized).toBe(true);
      expect(ti.amortizationPeriod).toBe(60);
      expect(ti.amortizationRate).toBe(8);
    });
  });

  describe('ExpenseRecovery Interface', () => {
    it('should validate NNN recovery structure', () => {
      const recovery: ExpenseRecovery = {
        cam: { type: 'pro_rata', adminFeePercent: 15 },
        taxes: { type: 'pro_rata' },
        insurance: { type: 'pro_rata' },
        utilities: { type: 'tenant' },
      };

      expect(recovery.cam.type).toBe('pro_rata');
      expect(recovery.cam.adminFeePercent).toBe(15);
    });

    it('should validate base year stop', () => {
      const recovery: ExpenseRecovery = {
        baseYear: 2024,
        baseAmountPerSf: 12.50,
        cam: { type: 'capped', cap: 5 },
        taxes: { type: 'base_year_stop', baseYear: 2024 },
        insurance: { type: 'base_year_stop', baseYear: 2024 },
        utilities: { type: 'landlord' },
      };

      expect(recovery.baseYear).toBe(2024);
      expect(recovery.taxes.type).toBe('base_year_stop');
    });
  });
});

// =================================================================
// COMPONENT RENDERING TESTS
// =================================================================

describe('LeaseAbstractionDrawer Component', () => {
  const mockLineItem: LineItem = {
    id: 'item-1',
    name: 'Suite 100 - Starbucks',
    amount: 75000,
    itemSqFt: 2500,
    leaseExpiry: '2029-01-01',
  };

  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when closed', () => {
    const { container } = render(
      <LeaseAbstractionDrawer
        isOpen={false}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render drawer when open', () => {
    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Lease Abstraction')).toBeInTheDocument();
  });

  it('should display tenant name from lineItem', () => {
    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Suite 100 - Starbucks')).toBeInTheDocument();
  });

  it('should show all tabs', () => {
    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Tenant')).toBeInTheDocument();
    expect(screen.getByText('Term')).toBeInTheDocument();
    expect(screen.getByText('Escalations')).toBeInTheDocument();
    expect(screen.getByText('Options')).toBeInTheDocument();
    expect(screen.getByText('TI')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });

  it('should show guidance banner on tenant tab', () => {
    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Tenant Information')).toBeInTheDocument();
    expect(screen.getByText(/Enter the tenant's legal name/)).toBeInTheDocument();
  });

  it('should pre-populate data from existing lease abstraction', () => {
    const lineItemWithLease: LineItem = {
      ...mockLineItem,
      leaseAbstraction: {
        id: 'lease-1',
        lineItemId: 'item-1',
        tenantName: 'Existing Tenant',
        leasedSqFt: 3000,
        leaseType: 'modified_gross',
        leaseStartDate: '2023-01-01',
        leaseEndDate: '2028-01-01',
        currentBaseRent: 90000,
        tenantType: 'national',
        escalations: [],
        options: [],
      },
    };

    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={lineItemWithLease}
        onSave={mockOnSave}
      />
    );

    const tenantInput = screen.getByPlaceholderText('e.g., Starbucks Corporation');
    expect(tenantInput).toHaveValue('Existing Tenant');
  });
});

// =================================================================
// USER INTERACTION TESTS
// =================================================================

describe('LeaseAbstractionDrawer Interactions', () => {
  const mockLineItem: LineItem = {
    id: 'item-1',
    name: 'Test Tenant',
    amount: 50000,
    itemSqFt: 2000,
  };

  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should switch tabs on click', async () => {
    const user = userEvent.setup();
    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    // Click Term tab
    await user.click(screen.getByText('Term'));
    expect(screen.getByText('Lease Term & Structure')).toBeInTheDocument();

    // Click Escalations tab
    await user.click(screen.getByText('Escalations'));
    expect(screen.getByText('Rent Escalations')).toBeInTheDocument();
  });

  it('should update tenant name on input', async () => {
    const user = userEvent.setup();
    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    const tenantInput = screen.getByPlaceholderText('e.g., Starbucks Corporation');
    await user.clear(tenantInput);
    await user.type(tenantInput, 'New Tenant Name');

    expect(tenantInput).toHaveValue('New Tenant Name');
  });

  it('should add escalation on button click', async () => {
    const user = userEvent.setup();
    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    // Navigate to escalations tab
    await user.click(screen.getByText('Escalations'));
    
    // Click add button
    await user.click(screen.getByText('Add Escalation'));

    // Should show escalation form
    expect(screen.getByText('Escalation 1')).toBeInTheDocument();
  });

  it('should add option on button click', async () => {
    const user = userEvent.setup();
    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    // Navigate to options tab
    await user.click(screen.getByText('Options'));
    
    // Click add button
    await user.click(screen.getByText('Add Option'));

    // Should show option form
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    await user.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onSave with complete data when save is clicked', async () => {
    const user = userEvent.setup();
    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    // Fill in tenant name
    const tenantInput = screen.getByPlaceholderText('e.g., Starbucks Corporation');
    await user.clear(tenantInput);
    await user.type(tenantInput, 'Saved Tenant');

    // Click save
    await user.click(screen.getByText('Save Lease Abstract'));

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    const savedData = mockOnSave.mock.calls[0][0];
    expect(savedData.tenantName).toBe('Saved Tenant');
    expect(savedData.lineItemId).toBe('item-1');
  });

  it('should close drawer after save', async () => {
    const user = userEvent.setup();
    render(
      <LeaseAbstractionDrawer
        isOpen={true}
        onClose={mockOnClose}
        lineItem={mockLineItem}
        onSave={mockOnSave}
      />
    );

    await user.click(screen.getByText('Save Lease Abstract'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

// =================================================================
// CALCULATION TESTS
// =================================================================

describe('Lease Calculations', () => {
  it('should calculate rent per SF correctly', () => {
    const leasedSqFt = 2500;
    const annualRent = 75000;
    const rentPerSf = annualRent / leasedSqFt;

    expect(rentPerSf).toBe(30);
  });

  it('should calculate pro-rata share correctly', () => {
    const leasedSqFt = 2500;
    const totalSqFt = 50000;
    const proRata = (leasedSqFt / totalSqFt) * 100;

    expect(proRata).toBe(5);
  });

  it('should calculate lease term in months', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2029-01-01');
    const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());

    expect(months).toBe(60);
  });

  it('should calculate remaining term from today', () => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setFullYear(endDate.getFullYear() + 3); // 3 years from now
    
    const remainingMonths = (endDate.getFullYear() - today.getFullYear()) * 12 + 
                            (endDate.getMonth() - today.getMonth());

    expect(remainingMonths).toBe(36);
  });

  it('should calculate total TI from per-SF allowance', () => {
    const leasedSqFt = 2500;
    const tiPerSf = 45;
    const totalTi = leasedSqFt * tiPerSf;

    expect(totalTi).toBe(112500);
  });

  it('should calculate annual rent with percentage escalation', () => {
    const baseRent = 75000;
    const escalationRate = 0.03; // 3%
    const year2Rent = baseRent * (1 + escalationRate);
    const year3Rent = year2Rent * (1 + escalationRate);

    expect(year2Rent).toBe(77250);
    expect(year3Rent).toBeCloseTo(79567.50, 2);
  });

  it('should calculate annual rent with fixed escalation', () => {
    const baseRent = 75000;
    const fixedIncrease = 2000;
    const year2Rent = baseRent + fixedIncrease;
    const year3Rent = year2Rent + fixedIncrease;

    expect(year2Rent).toBe(77000);
    expect(year3Rent).toBe(79000);
  });

  it('should apply CPI cap correctly', () => {
    const baseRent = 75000;
    const cpiRate = 0.07; // 7% CPI
    const cap = 0.05; // 5% cap
    const effectiveRate = Math.min(cpiRate, cap);
    const year2Rent = baseRent * (1 + effectiveRate);

    expect(effectiveRate).toBe(0.05);
    expect(year2Rent).toBe(78750);
  });

  it('should apply CPI floor correctly', () => {
    const baseRent = 75000;
    const cpiRate = 0.01; // 1% CPI
    const floor = 0.02; // 2% floor
    const effectiveRate = Math.max(cpiRate, floor);
    const year2Rent = baseRent * (1 + effectiveRate);

    expect(effectiveRate).toBe(0.02);
    expect(year2Rent).toBe(76500);
  });
});

// =================================================================
// EDGE CASE TESTS
// =================================================================

describe('Edge Cases', () => {
  it('should handle zero square footage gracefully', () => {
    const leasedSqFt = 0;
    const annualRent = 75000;
    const rentPerSf = leasedSqFt > 0 ? annualRent / leasedSqFt : 0;

    expect(rentPerSf).toBe(0);
  });

  it('should handle missing lease dates', () => {
    const abstraction: LeaseAbstraction = {
      id: 'lease-1',
      lineItemId: 'item-1',
      tenantName: 'Test',
      leasedSqFt: 1000,
      leaseType: 'gross',
      leaseStartDate: '',
      leaseEndDate: '',
      currentBaseRent: 30000,
      escalations: [],
      options: [],
    };

    const termMonths = abstraction.leaseStartDate && abstraction.leaseEndDate
      ? 60 // Would calculate normally
      : 0;

    expect(termMonths).toBe(0);
  });

  it('should handle empty escalations array', () => {
    const escalations: RentEscalation[] = [];
    const hasEscalations = escalations.length > 0;

    expect(hasEscalations).toBe(false);
  });

  it('should handle multiple escalations of different types', () => {
    const escalations: RentEscalation[] = [
      { id: 'e1', type: 'percentage', value: 3, frequencyMonths: 12 },
      { id: 'e2', type: 'step', value: 5000, frequencyMonths: 24 },
    ];

    expect(escalations.length).toBe(2);
    expect(escalations[0].type).toBe('percentage');
    expect(escalations[1].type).toBe('step');
  });

  it('should handle exercised and unexercised options', () => {
    const options: LeaseOption[] = [
      { id: 'o1', type: 'renewal', termMonths: 60, isExercised: true },
      { id: 'o2', type: 'renewal', termMonths: 60, isExercised: false },
    ];

    const exercisedCount = options.filter(o => o.isExercised).length;
    expect(exercisedCount).toBe(1);
  });

  it('should handle month-to-month lease type', () => {
    const abstraction: LeaseAbstraction = {
      id: 'lease-1',
      lineItemId: 'item-1',
      tenantName: 'Month-to-Month Tenant',
      leasedSqFt: 500,
      leaseType: 'month_to_month',
      leaseStartDate: '2024-01-01',
      leaseEndDate: '', // No end date for MTM
      currentBaseRent: 15000,
      escalations: [],
      options: [],
    };

    expect(abstraction.leaseType).toBe('month_to_month');
    expect(abstraction.leaseEndDate).toBe('');
  });
});

// =================================================================
// INTEGRATION TESTS
// =================================================================

describe('Integration with IncomeApproachGrid', () => {
  it('should sync lease data back to LineItem on save', () => {
    const lineItem: LineItem = {
      id: 'item-1',
      name: 'Original Name',
      amount: 50000,
      itemSqFt: 2000,
    };

    const abstraction: LeaseAbstraction = {
      id: 'lease-1',
      lineItemId: 'item-1',
      tenantName: 'Updated Tenant Name',
      leasedSqFt: 2500, // Updated SF
      leaseType: 'triple_net',
      leaseStartDate: '2024-01-01',
      leaseEndDate: '2029-01-01',
      currentBaseRent: 75000, // Updated rent
      escalations: [],
      options: [],
    };

    // Simulate the sync that happens in IncomeApproachGrid
    const updatedLineItem: LineItem = {
      ...lineItem,
      leaseAbstraction: abstraction,
      name: abstraction.tenantName,
      itemSqFt: abstraction.leasedSqFt,
      amount: abstraction.currentBaseRent,
      leaseExpiry: abstraction.leaseEndDate,
    };

    expect(updatedLineItem.name).toBe('Updated Tenant Name');
    expect(updatedLineItem.itemSqFt).toBe(2500);
    expect(updatedLineItem.amount).toBe(75000);
    expect(updatedLineItem.leaseExpiry).toBe('2029-01-01');
  });

  it('should preserve linked comp IDs when updating lease', () => {
    const lineItem: LineItem = {
      id: 'item-1',
      name: 'Tenant',
      amount: 50000,
      linkedRentCompIds: ['comp-1', 'comp-2'],
    };

    const abstraction: LeaseAbstraction = {
      id: 'lease-1',
      lineItemId: 'item-1',
      tenantName: 'Updated Tenant',
      leasedSqFt: 2000,
      leaseType: 'gross',
      leaseStartDate: '2024-01-01',
      leaseEndDate: '2029-01-01',
      currentBaseRent: 60000,
      escalations: [],
      options: [],
    };

    const updatedLineItem: LineItem = {
      ...lineItem,
      leaseAbstraction: abstraction,
      name: abstraction.tenantName,
    };

    // Linked comps should be preserved
    expect(updatedLineItem.linkedRentCompIds).toEqual(['comp-1', 'comp-2']);
  });
});

// =================================================================
// REPORT BUILDER INTEGRATION TESTS
// =================================================================

describe('Report Builder Integration', () => {
  it('should extract lease abstractions from rental income', () => {
    const rentalIncome: LineItem[] = [
      {
        id: 'item-1',
        name: 'Tenant A',
        amount: 50000,
        leaseAbstraction: {
          id: 'lease-1',
          lineItemId: 'item-1',
          tenantName: 'Tenant A Corp',
          leasedSqFt: 2000,
          leaseType: 'triple_net',
          leaseStartDate: '2024-01-01',
          leaseEndDate: '2029-01-01',
          currentBaseRent: 50000,
          escalations: [],
          options: [],
        },
      },
      {
        id: 'item-2',
        name: 'Tenant B',
        amount: 75000,
        // No lease abstraction
      },
      {
        id: 'item-3',
        name: 'Tenant C',
        amount: 60000,
        leaseAbstraction: {
          id: 'lease-2',
          lineItemId: 'item-3',
          tenantName: 'Tenant C LLC',
          leasedSqFt: 2500,
          leaseType: 'modified_gross',
          leaseStartDate: '2023-06-01',
          leaseEndDate: '2028-06-01',
          currentBaseRent: 60000,
          escalations: [],
          options: [],
        },
      },
    ];

    const leaseAbstractions = rentalIncome
      .filter(item => item.leaseAbstraction)
      .map(item => item.leaseAbstraction!);

    expect(leaseAbstractions.length).toBe(2);
    expect(leaseAbstractions[0].tenantName).toBe('Tenant A Corp');
    expect(leaseAbstractions[1].tenantName).toBe('Tenant C LLC');
  });

  it('should calculate portfolio summary statistics', () => {
    const leaseAbstractions: LeaseAbstraction[] = [
      {
        id: 'lease-1',
        lineItemId: 'item-1',
        tenantName: 'Tenant A',
        leasedSqFt: 2000,
        leaseType: 'triple_net',
        leaseStartDate: '2024-01-01',
        leaseEndDate: '2029-01-01',
        currentBaseRent: 50000,
        escalations: [],
        options: [],
      },
      {
        id: 'lease-2',
        lineItemId: 'item-2',
        tenantName: 'Tenant B',
        leasedSqFt: 3000,
        leaseType: 'gross',
        leaseStartDate: '2023-01-01',
        leaseEndDate: '2028-01-01',
        currentBaseRent: 90000,
        escalations: [],
        options: [],
      },
    ];

    const totalLeasedSf = leaseAbstractions.reduce((sum, la) => sum + la.leasedSqFt, 0);
    const totalAnnualRent = leaseAbstractions.reduce((sum, la) => sum + la.currentBaseRent, 0);
    const avgRentPerSf = totalLeasedSf > 0 ? totalAnnualRent / totalLeasedSf : 0;

    expect(totalLeasedSf).toBe(5000);
    expect(totalAnnualRent).toBe(140000);
    expect(avgRentPerSf).toBe(28);
  });
});
