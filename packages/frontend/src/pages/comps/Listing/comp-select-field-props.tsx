import React, { useEffect, useState } from 'react';
import { Select, MenuItem } from '@mui/material';
import DatePickerComp from '@/components/date-picker';
import moment from 'moment';
import { landTypeOptionsComps } from './Comps-table-header';
import { dateFields } from './filter-initial-values';
import {
  conditionOptions,
  frontageOptions,
  leaseRateUnitOptions,
  leaseStatusOptions,
  leaseTypeOptions,
  lotshapeOptions,
  parkingOption,
  propertyCommercialOptions,
  propertyOptions,
  saleStatus,
  sellerTyoeOptions,
  TIAllowanceOptions,
  topographyOptions,
} from '../create-comp/SelectOption';
import { usa_state } from '../comp-form/fakeJson';
import {
  landDimensionOption,
  privateComp,
  sizeTypeOptions,
} from './filter-initial-values';

import {
  multifamilyOptions,
  residentialOptions,
  hospitalityOptions,
  officeOptions,
  retailOptions,
  industrialOptions,
  specialOptions,
  selectTypeOptions,
} from '../create-comp/SelectOption';
import { BuildingDetailsEnum } from '../enum/CompsEnum';
import { UtilitiesTypeOptions } from '@/pages/appraisal/overview/SelectOption';
import {
  BarthroomOptions,
  BedroomOptions,
  ElectricalOptions,
  ExteriorOptions,
  FencingOptions,
  FireplaceOptions,
  GarageOptions,
  HeatingCoolingOptions,
  PlumbingOptions,
  RoofOptions,
  WindowOptions,
} from '@/pages/residential/create-comp/SelectOption';
interface CompSelectFieldProps {
  index: number;
  col: string;
  row: any;
  formik: any;
  handleFieldChange: (index: number, col: string, value: any) => any;
  currentColumns: string[];
  totalGroups: number;
  currentColumnGroup: number;
  setCurrentColumnGroup: React.Dispatch<React.SetStateAction<number>>;
}

const usaStateOptions = Object.entries(usa_state[0]).map(
  ([abbr, fullName]) => ({
    value: abbr.toLowerCase(),
    label: fullName,
  })
);

// ...existing code...

// Common dropdown options
const dropdownOptions: Record<
  string,
  { value: string | number; label: string }[]
> = {
  land_type: landTypeOptionsComps,
  frontage: frontageOptions,
  parking: parkingOption,
  state: usaStateOptions,
  comparison_basis: landDimensionOption,
  lease_type: leaseTypeOptions,
  offeror_type: sellerTyoeOptions,
  acquirer_type: sellerTyoeOptions,
  lease_status: leaseStatusOptions,
  land_dimension: sizeTypeOptions.length
    ? sizeTypeOptions
    : [{ value: 'SF', label: 'SF' }],
  sale_status: saleStatus.length
    ? saleStatus
    : [{ value: 'Closed', label: 'Closed' }],
  building_type: propertyCommercialOptions,

  utilities_select: UtilitiesTypeOptions,
  lot_shape: lotshapeOptions,
  condition: conditionOptions,
  private_comp: privateComp || 0,
  TI_allowance_unit: TIAllowanceOptions,
  exterior: ExteriorOptions,
  roof: RoofOptions,
  electrical: ElectricalOptions,
  plumbing: PlumbingOptions,
  heating_cooling: HeatingCoolingOptions,
  windows: WindowOptions,
  garage: GarageOptions,
  topography: topographyOptions,
  fencing: FencingOptions,
  fireplace: FireplaceOptions,
  bedrooms: BedroomOptions,
  bathrooms: BarthroomOptions,
  asking_rent_unit: leaseRateUnitOptions.length
    ? leaseRateUnitOptions
    : [{ value: 'year', label: '$/SF/Year' }],
  lease_rate_unit: leaseRateUnitOptions.length
    ? leaseRateUnitOptions
    : [{ value: 'year', label: '$/SF/Year' }],
};

// Date fields list

const CompSelectField: React.FC<CompSelectFieldProps> = ({
  index,
  col,
  row,
  formik,
  handleFieldChange,
}) => {
  const isDateField = dateFields.includes(col);

  const isDropdownField = Object.keys(dropdownOptions).includes(col);

  const isTouched =
    Array.isArray(formik.touched.comps) && formik.touched.comps[index]?.[col];
  const error = isTouched && Boolean(formik.errors.comps?.[index]?.[col]);

  // Manage subZoneOptions state
  const [subZoneOptions, setSubZoneOptions] = useState<{
    [key: number]: any[];
  }>({});

  // Function to get building_sub_type options based on building_type
  const getOptionsByZone = (zone: string) => {
    switch (zone.toLowerCase()) {
      case BuildingDetailsEnum.MULTIFAMILY:
        return multifamilyOptions;
      case BuildingDetailsEnum.RESIDENTIAL:
        return residentialOptions;
      case BuildingDetailsEnum.HOSPITALITY:
        return hospitalityOptions;
      case BuildingDetailsEnum.OFFICE:
        return officeOptions;
      case BuildingDetailsEnum.RETAIL:
        return retailOptions;
      case BuildingDetailsEnum.INDUSTRIAL:
        return industrialOptions;
      case BuildingDetailsEnum.SPECIAL:
        return specialOptions;
      default:
        return selectTypeOptions;
    }
  };

  // Update building_sub_type options when building_type changes
  useEffect(() => {
    const newSubZoneOptions: { [key: number]: any[] } = {};
    formik.values.comps.forEach((row: any, idx: number) => {
      const selectedBuildingType = row?.building_type || '';
      if (selectedBuildingType) {
        newSubZoneOptions[idx] = getOptionsByZone(selectedBuildingType);
      }
    });

    setSubZoneOptions(newSubZoneOptions);
  }, [formik.values.comps]); // Runs when `comps` data changes

  useEffect(() => {
    const updatedComps = formik.values.comps.map((comp: any) => {
      const isValidLandType = landTypeOptionsComps.some(
        (option) => option.value === comp.land_type
      );

      return {
        ...comp,
        land_type: isValidLandType ? comp.land_type : '', // Set to empty string if invalid
      };
    });

    // ✅ Prevent infinite loop by checking if values changed
    if (JSON.stringify(updatedComps) !== JSON.stringify(formik.values.comps)) {
      formik.values.comps = updatedComps;
    }
  }, [formik.values.comps]);

  useEffect(() => {
    const newSubZoneOptions: { [key: number]: any[] } = {};

    formik.values.comps.forEach((row: any, idx: number) => {
      const selectedBuildingType = row?.building_type || '';

      // Ensure building_type is set in formik values
      if (!selectedBuildingType) {
        formik.setFieldValue(
          `comps[${idx}].building_type`,
          propertyOptions[0]?.value || ''
        );
      }

      if (selectedBuildingType) {
        newSubZoneOptions[idx] = getOptionsByZone(selectedBuildingType);
      }
    });

    setSubZoneOptions(newSubZoneOptions);
  }, [formik.values.comps]);

  // show colums in pair of six

  // Render Date Picker
  if (isDateField) {
    return (
      <div className="date-picker">
        <DatePickerComp
          label=""
          name={`comps[${index}].${col}`}
          value={row[col] ? moment(row[col]) : null}
          onChange={(value: Date | null) => {
            const formattedDate = value
              ? moment(value).format('YYYY-MM-DD')
              : '';
            handleFieldChange(index, col, formattedDate);
          }}
        />
        {error && (
          <span className="text-red-500 text-[11px] absolute block">
            {formik.errors.comps?.[index]?.[col]}
          </span>
        )}
      </div>
    );
  }

  // Render Dropdowns
  if (isDropdownField || col === 'building_sub_type') {
    const options =
      col === 'building_sub_type'
        ? subZoneOptions[index] || []
        : dropdownOptions[col] || [];

    // Ensure options is always an array
    const validOptions = Array.isArray(options) ? options : [];
    // const currentValue =
    //   col === 'state' ? (row[col] || '').toLowerCase() : row[col];

    // Check if the current value exists in the options (check both value and label), otherwise set it as an empty string
    const selectedValue = validOptions.some(
      (option) => option.value === row[col] || option.label === row[col]
    )
      ? row[col]
      : '';

    return (
      <>
        <Select
          fullWidth
          value={selectedValue}
          onChange={(e) => {
            console.log(`Selected value for ${col}:`, e.target.value);

            // First update the field value
            formik.setFieldValue(
              `comps.${index}.${col}`,
              e.target.value,
              false
            );

            // Then manually clear any error for this field
            if (formik.errors.comps?.[index]?.[col]) {
              const newErrors = { ...formik.errors };
              if (newErrors.comps && newErrors.comps[index]) {
                delete newErrors.comps[index][col];
                formik.setErrors(newErrors);
              }
            }

            // Force a re-render to update the UI
            setTimeout(() => {
              handleFieldChange(index, col, e.target.value);
            }, 0);
          }}
          error={error}
        >
          {validOptions.map((option) => (
            <MenuItem key={option.value || option.label} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
          {/* Add an additional option if selectedValue matches a label */}
          {selectedValue &&
            validOptions.some((option) => option.label === selectedValue) && (
              <MenuItem key={`label-${selectedValue}`} value={selectedValue}>
                {selectedValue}
              </MenuItem>
            )}
        </Select>

        {error && (
          <span className="text-red-500 text-[11px] absolute block bottom-[-3px]">
            {formik.errors.comps?.[index]?.[col]}
          </span>
        )}
      </>
    );
  }

  return null;
};

export default CompSelectField;
