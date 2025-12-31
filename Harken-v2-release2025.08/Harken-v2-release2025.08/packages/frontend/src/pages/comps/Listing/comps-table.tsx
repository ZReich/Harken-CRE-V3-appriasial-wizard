import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { columnHeaders } from '@/pages/comps/Listing/Comps-table-header';
import axios from 'axios';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import DatePickerComp from '@/components/date-picker';
import moment from 'moment';
import {
  hospitalityOptions,
  industrialOptions,
  multifamilyOptions,
  officeOptions,
  propertyCommercialOptions,
  residentialOptions,
  retailOptions,
  saleStatus,
  selectTypeOptions,
  sizeTypeOptions,
  specialOptions,
} from '@/pages/comps/create-comp/SelectOption';

import {
  dateFields,
  dropdownColumns,
} from '@/pages/comps/Listing/filter-initial-values';
import { getRequiredColumns } from '@/pages/comps/Listing/filter-initial-values';
import { useCompsFormik } from '@/pages/comps/Listing/comps-formik';

import {
  CompsFormProps,
  CompRow,
  RowType,
  CompsFormValues,
} from '@/pages/comps/Listing/comps-table-interfaces';
import { BuildingDetailsEnum } from '@/pages/comps/enum/CompsEnum';
import CompSelectField from '@/pages/comps/Listing/comp-select-field-props';
import CompTextField from '@/pages/comps/Listing/comp-text-field-props';
import loadingImage from '../../../images/loading.png';
const CompsForm = ({
  handleClose,
  onClose,
  open,
  compsData,
  setUploadCompsStatus,
}: CompsFormProps) => {
  console.log('triggered');
  const [currentColumnGroup, setCurrentColumnGroup] = useState(0);
  const [updatedComps, setUpdatedComps] = useState<any[]>(
    Array.isArray(compsData) ? compsData : []
  );
  const [subZoneOptions, setSubZoneOptions] = useState<{
    [key: number]: any[];
  }>({});
  const [loader, setLoader] = useState(false);
  console.log(subZoneOptions);

  const activeType = localStorage.getItem('activeType');

  // Process compsData to convert state values to lowercase
  const processedCompsData = React.useMemo(() => {
    if (!compsData || compsData.length === 0) return [{}];

    const processed = compsData.map((comp: any) => {
      if (comp.state && typeof comp.state === 'string') {
        return { ...comp, state: comp?.state?.toLowerCase() };
      }
      return comp;
    });

    // Log the original and processed data
    console.log(
      'Original compsData states:',
      compsData.map((comp: any) => comp.state)
    );
    console.log(
      'Processed compsData states:',
      processed.map((comp: any) => comp.state)
    );

    return processed;
  }, [compsData]);

  // Formik with processed compsData and activeType
  const formik = useCompsFormik(
    processedCompsData, // Use processed data with lowercase state values
    activeType,
    (values: { row: RowType }) => {
      console.log('Saved data successfully', values);
    }
  );

  // Ensure business_name defaults to street_address if not present
  // useEffect(() => {
  //   if (formik.values.comps && formik.values.comps.length > 0) {
  //     formik.values.comps.forEach((row: any, index: any) => {
  //       if (!row.business_name && row.street_address) {
  //         formik.setFieldValue(
  //           `comps[${index}].business_name`,
  //           row.street_address
  //         );
  //       }
  //     });
  //   }
  // }, [formik.values.comps]);
  const checkType = localStorage.getItem('checkType');
  const approachType = localStorage.getItem('approachType');
  useEffect(() => {
    const newSubZoneOptions: { [key: number]: any[] } = {}; // Correct typing
    formik.values.comps.forEach((row: any, index: number) => {
      const zone = row?.building_type || ''; // Ensure correct field
      if (zone) {
        const newZone = zone.toLowerCase();
        newSubZoneOptions[index] = getOptionsByZone(newZone) || []; // Ensure default empty array
      }
    });

    setSubZoneOptions(newSubZoneOptions); // ✅ Update state
  }, [formik.values.comps]);

  // Keep this dependency to update options dynamically

  const [requiredColumns, setRequiredColumns] = useState<string[]>(
    getRequiredColumns(activeType, processedCompsData)
  );

  // Update required columns when formik values change
  useEffect(() => {
    console.log('🔄 Formik values changed, checking land_type values:');
    formik.values.comps.forEach((comp: any, index: number) => {
      console.log(`Comp ${index + 1} land_type:`, comp.land_type);
    });

    const newRequiredColumns = getRequiredColumns(
      activeType,
      formik.values.comps
    );
    console.log('🔄 New required columns:', newRequiredColumns);
    setRequiredColumns(newRequiredColumns);
  }, [formik.values.comps, activeType]);

  // Set updated comps using useEffect
  useEffect(() => {
    setUpdatedComps(formik.values.comps);
  }, [formik.values]);

  // Comps list api
  const { mutate } = useMutate({
    queryKey: 'compsList', //  Keep it a unique key
    endPoint: 'comps/list',
    config: {},
    requestType: RequestType.POST, // Since it's a POST request
  });

  // handlefieldchange for all the input fields
  let toastDisplayed = false;
  const handleFieldChange = async (
    index: number,
    field: string,
    value: any
  ) => {
    console.log(`🔄 Field change: ${field} = ${value} for comp ${index + 1}`);
    const compsLength = parseInt(
      localStorage.getItem('compsLenght') || '0',
      10
    );
    const selectedCount = formik.values.comps.filter(
      (comp: any) => comp.selected
    ).length;

    // Ensure accurate selection count
    const newTotalSelected = value ? selectedCount + 1 : selectedCount - 1;

    // Restrict selection to max 4, but allow unchecking
    if (field === 'selected' && value && newTotalSelected > 4) {
      if (!toastDisplayed) {
        toast.error(
          `You have already selected ${compsLength}. You can only add ${
            4 - compsLength
          } more.`
        );
        toastDisplayed = true;
        setTimeout(() => {
          toastDisplayed = false;
        }, 2000);
      }
      return;
    }

    // Convert state field to uppercase if it's a string
    if (field === 'state' && typeof value === 'string') {
      value = value.toLowerCase();
    }

    // Create a shallow copy of the comps array
    const updatedComps = [...formik.values.comps];
    const newComp = { ...updatedComps[index], [field]: value };

    // **Condition to Add or Remove `_custom` Fields**
    const customFields = {
      condition: 'condition_custom',
      parking: 'parking_custom',
      utilities_select: 'utilities_select_custom',
      frontage: 'frontage_custom',
      electrical: 'electrical_custom', // ✅ Electrical Custom Field
      exterior: 'exterior_custom',
      roof: 'roof_custom',
      garage: 'garage_custom',
      heating_cooling: 'heating_cooling_custom',
      plumbing: 'plumbing_custom',
      windows: 'windows_custom',
      fencing: 'fencing_custom',
      fireplace: 'fireplace_custom',
      land_type: 'land_type_custom', // ✅ Land Type Custom Field
    };

    Object.entries(customFields).forEach(([key, customKey]) => {
      if (newComp[key] === 'Type My Own') {
        if (!(customKey in newComp)) {
          newComp[customKey] = ''; // ✅ Ensure the field appears in UI
        }
      } else if (customKey in newComp) {
        delete newComp[customKey]; // ✅ Remove if value is not "Type My Own"
      }
    });

    // ✅ Replace the updated object in the array
    updatedComps[index] = newComp;

    // ✅ Ensure Formik is updated
    await formik.setFieldValue('comps', updatedComps);

    // ✅ Mark the field as touched to trigger UI updates
    formik.setTouched({
      ...formik.touched,
      [`comps.${index}.${field}`]: true,
    });

    // ✅ Update required columns dynamically
    const newRequiredColumns = getRequiredColumns(activeType, updatedComps);
    console.log(
      '🔄 Updated required columns after field change:',
      newRequiredColumns
    );
    setRequiredColumns(newRequiredColumns);
  };

  useEffect(() => {
    const updatedComps = formik.values.comps.map((comp: any) => {
      // Check and set default for sale_status
      const isValidSaleStatus = saleStatus.some(
        (status) => status.value === comp.sale_status
      );
      const updatedSaleStatus = isValidSaleStatus ? comp.sale_status : 'Closed';

      // Check and set default for land_dimension
      const isValidLandDimension = sizeTypeOptions.some(
        (option) => option.value === comp.land_dimension
      );
      const updatedLandDimension = isValidLandDimension
        ? comp.land_dimension
        : 'SF';

      // Check and set default for building_type
      const isValidBuildingType = propertyCommercialOptions.some(
        (option) => option.value === comp.building_type
      );
      const updatedBuildingType = isValidBuildingType ? comp.building_type : '';

      return {
        ...comp,
        sale_status: updatedSaleStatus,
        land_dimension: updatedLandDimension,
        building_type: updatedBuildingType, // Keeps value as "" if not valid
      };
    });

    // ✅ Prevent infinite loops by checking for actual differences
    if (JSON.stringify(updatedComps) !== JSON.stringify(formik.values.comps)) {
      formik.values.comps.length = 0; // Clear the existing array
      formik.values.comps.push(...updatedComps); // Push the updated values
    }
  }, [
    formik.values.comps,
    saleStatus,
    sizeTypeOptions,
    propertyCommercialOptions,
  ]);

  useEffect(() => {
    const activeType = localStorage.getItem('activeType');

    if (activeType === 'residential') {
      const updatedComps = formik.values.comps.map((comp: any) => {
        const newComp = { ...comp };
        delete newComp.comparison_basis; // Remove field dynamically
        return newComp;
      });

      if (
        JSON.stringify(updatedComps) !== JSON.stringify(formik.values.comps)
      ) {
        formik.setValues({
          ...formik.values,
          comps: updatedComps,
        });
      }
    }
  }, [formik.values.comps]);

  // Save API Function
  const saveComps = async () => {
    // Ensure Formik updates state before validation
    await formik.validateForm();

    // Mark all required fields as touched, including nested ones
    await formik.setTouched({
      comps: formik.values.comps.map(() => {
        const touchedFields = Object.fromEntries(
          requiredColumns.map((col) => [col, true])
        );

        // Ensure nested fields (zone & sub_zone) are marked as touched if they exist

        return touchedFields;
      }),
    });

    // Validate Form Again After Marking Fields as Touched
    const errors = await formik.validateForm();

    // Check if there are any validation errors
    if (Object.keys(errors).length > 0) {
      toast.error('⚠️ Please fill in all required fields.');
      return;
    }

    // **Force Formik to apply latest values before saving**
    await formik.setValues({ ...formik.values });

    try {
      setLoader(true); // Show loader while saving
      // Extracting updated comps from Formik values
      const updatedComps = formik.values.comps.map((comp: any) => {
        // Process the comp object
        const processedComp = {
          ...comp,
          // Ensure state is lowercase
          state: comp.state ? comp.state.toLowerCase() : comp.state,
          // Ensure `condition_custom` is removed if `condition` is not "Type My Own"
          condition_custom:
            comp.condition === 'Type My Own'
              ? comp.condition_custom
              : undefined,
          // Ensure `parking_custom` is removed if `parking` is not "Type My Own"
          parking_custom:
            comp.parking === 'Type My Own' ? comp.parking_custom : undefined,
          // Ensure `land_type_custom` is removed if `land_type` is not "Type My Own"
          land_type_custom:
            comp.land_type === 'Type My Own'
              ? comp.land_type_custom
              : undefined,
        };

        return processedComp;
      });

      const payload = {
        comp_type: localStorage.getItem('activeType'),
        type:
          localStorage.getItem('checkType') === 'leasesCheckbox'
            ? 'lease'
            : 'sale',
        properties: updatedComps,
        ai_generated: 1,
      };

      const response = await axios.post(`comps/save-extracted-comps`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      toast.success(response.data.data.data.message);
      setUploadCompsStatus(true);
      setLoader(false);
      onClose(); // Close modal

      // Refresh data after saving
      mutate({
        type:
          localStorage.getItem('property_type') === null
            ? 'sale'
            : localStorage.getItem('property_type') === 'salesCheckbox'
              ? 'sale'
              : 'lease',

        comp_type: localStorage.getItem('activeType'),
        land_dimension: 'SF',
      });
    } catch (error: any) {
      setLoader(false);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          const errorMessage =
            data?.data?.message ||
            data?.error ||
            'Invalid data provided. Please check your inputs and try again.';
          toast.error(errorMessage);
        } else if (status === 401) {
          toast.error('Unauthorized. Please login again.');
        } else if (status === 403) {
          toast.error(
            'Access forbidden. You do not have permission to perform this action.'
          );
        } else if (status === 404) {
          toast.error('Resource not found. Please try again.');
        } else if (status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error(
            `Error ${status}: ${data?.message || 'Failed to save comps. Please try again.'}`
          );
        }
      } else if (error.request) {
        toast.error(
          'Network error. Please check your connection and try again.'
        );
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  // show table headings with required headings

  // Generate table columns with proper ordering
  console.log('🔍 Checking if land_type_custom exists in formik values:');
  formik.values.comps.forEach((comp: any, index: number) => {
    console.log(`Comp ${index + 1}:`, {
      land_type: comp.land_type,
      hasLandTypeCustom: 'land_type_custom' in comp,
      land_type_custom: comp.land_type_custom,
    });
  });

  const allAvailableColumns = Object.keys(columnHeaders)
    .filter(
      (key) => formik.values.comps.some((row: CompRow) => key in row) // Ensure field exists in at least one row
    )
    .filter((key) => {
      // Remove *_custom fields only if their main field is NOT "Type My Own"
      if (key === 'condition_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.condition === 'Type My Own'
        );
      }
      if (key === 'building_sub_type_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.building_sub_type === 'Type My Own'
        );
      }
      if (key === 'parking_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.parking === 'Type My Own'
        );
      }
      if (key === 'utilities_select_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.utilities_select === 'Type My Own'
        );
      }
      if (key === 'frontage_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.frontage === 'Type My Own'
        );
      }
      if (key === 'electrical_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.electrical === 'Type My Own'
        );
      }
      if (key === 'exterior_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.exterior === 'Type My Own'
        );
      }
      if (key === 'roof_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.roof === 'Type My Own'
        );
      }
      if (key === 'garage_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.garage === 'Type My Own'
        );
      }
      if (key === 'heating_cooling_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.heating_cooling === 'Type My Own'
        );
      }
      if (key === 'plumbing_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.plumbing === 'Type My Own'
        );
      }
      if (key === 'windows_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.windows === 'Type My Own'
        );
      }
      if (key === 'fencing_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.fencing === 'Type My Own'
        );
      }
      if (key === 'fireplace_custom') {
        return formik.values.comps.some(
          (row: CompRow) => row.fireplace === 'Type My Own'
        );
      }
      if (key === 'land_type_custom') {
        const hasLandTypeCustom = formik.values.comps.some(
          (row: CompRow) => row.land_type === 'Type My Own'
        );
        console.log('🔍 land_type_custom filter check:', {
          key,
          hasLandTypeCustom,
          compsWithTypeMyOwn: formik.values.comps.filter(
            (row: CompRow) => row.land_type === 'Type My Own'
          ),
        });
        return hasLandTypeCustom;
      }
      return true; // Keep other columns
    });

  // Create ordered columns array starting with required columns
  const orderedColumns: string[] = [];

  // Add required columns first, maintaining their order
  requiredColumns.forEach((col) => {
    if (!orderedColumns.includes(col)) {
      orderedColumns.push(col);
    }
  });

  // Add remaining available columns
  allAvailableColumns.forEach((col) => {
    if (!orderedColumns.includes(col)) {
      orderedColumns.push(col);
    }
  });

  const tableColumns: string[] = orderedColumns;
  console.log('🔍 Final tableColumns:', tableColumns);
  console.log(
    '🔍 Does tableColumns include land_type_custom?',
    tableColumns.includes('land_type_custom')
  );
  console.log(updatedComps);
  // show colums in pair of six
  const columnsPerPage = 6;
  const totalGroups = Math.ceil(tableColumns.length / columnsPerPage);
  const currentColumns = tableColumns.slice(
    currentColumnGroup * columnsPerPage,
    (currentColumnGroup + 1) * columnsPerPage
  );
  const getOptionsByZone = (zone: any) => {
    switch (zone) {
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={false} fullWidth>
      <DialogTitle className="dialog-title">
        Comps Data
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 4 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {loader && (
          <div
            className="img-update-loader"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1000,
            }}
          >
            <img src={loadingImage} alt="Loading..." />
          </div>
        )}
        <Box sx={{ position: 'relative' }}>
          <TableContainer
            sx={{ maxHeight: '55vh' }}
            className="table-wrapper popupTableWrapper"
          >
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell
                    className="text-nowrap"
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 3, // Ensures it stays above other cells
                    }}
                  >
                    Attribute
                  </TableCell>{' '}
                  {tableColumns.map((col) => {
                    // Condition to replace "date_sold" with "transaction_date" if checkType is 'leasesCheckbox'
                    const isLease =
                      localStorage.getItem('checkType') === 'leasesCheckbox';
                    let displayColumn =
                      isLease && col === 'date_sold' ? 'transaction_date' : col;

                    // Custom column name replacements
                    const columnMappings: Record<string, string> = {
                      // business_name: 'Property Name',
                      summary: 'Property Summary',
                      net_operating_income: 'Net Operating Income (NOI)',
                      utilities_select: 'Utilities',
                      utilities_select_custom: 'Other Utilities',
                      space: 'Space(SF)',

                      est_land_value: 'Estimated Land Value',
                      location_desc: 'Location Description',
                      asking_rent_unit: 'Asking Rent Units',
                      TI_allowance_unit: 'TI Allowance Units',
                      date_list: 'List Date',
                      date_expiration: 'Expiration Date',
                      date_commencement: 'Commencement Date',
                      date_execution: 'Execution Date',
                      est_building_value: 'Building Residual',
                      free_rent: 'Free Rent(Months)',
                      term: 'Term(Months)',
                      cam: 'CAM',
                      street_suite: 'Suite Number',
                      basement_finished_sq_ft: 'Basement Finished  (SF)',
                      basement_unfinished_sq_ft: 'Basement Unfinished  (SF)',
                      gross_living_sq_ft: 'Gross Living Area (SF)',
                      weight_sf: 'SF Weighting',
                      cap_rate: 'CAP Rate',
                      legal_desc: 'Legal Description',
                      operating_expense_psf: 'Operating Expense (PSF)',
                      parcel_id_apn: 'Parcel #',
                      date_sold:
                        checkType === 'leasesCheckbox' ||
                        approachType === 'leaseCheck'
                          ? 'Transaction Date'
                          : 'Date Sold',
                      acquirer_type:
                        checkType === 'leasesCheckbox' ||
                        approachType === 'leaseCheck'
                          ? 'Tenant Type'
                          : 'Buyer Type',
                      offeror_type:
                        checkType === 'leasesCheckbox' ||
                        approachType === 'leaseCheck'
                          ? 'Landlord Type'
                          : 'Seller Type',
                    };

                    // Apply custom mappings if present
                    if (columnMappings[col]) {
                      displayColumn = columnMappings[col];
                    }

                    return (
                      <TableCell key={col} className="table-cell-header">
                        {(typeof displayColumn === 'string'
                          ? displayColumn
                          : String(displayColumn)
                        )
                          .replace(/_/g, ' ') // Replace underscores with spaces
                          .replace(/\b\w/g, (char) => char.toUpperCase())}{' '}
                        {requiredColumns.includes(col) && (
                          <span className="required-asterisk">*</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {formik.values?.comps.map(
                  (row: CompsFormValues['comps'][number], index: number) => (
                    <TableRow className="align-top" key={String(row.id)}>
                      <TableCell
                        className="text-nowrap"
                        sx={{
                          background: '#CFECF4',
                          color: '#0DA1C7',
                          fontWeight: 'bold',
                          padding: '20px 60px 20px 45px',
                          borderColor: '#fff',
                          position: 'sticky',
                          left: 0,
                          zIndex: 2, // Ensures it stays above other cells
                        }}
                      >
                        Comps {index + 1}
                      </TableCell>
                      {tableColumns.map((col) => (
                        <TableCell
                          key={col}
                          className="table-cell-border min-w-40"
                        >
                          {col === 'land_size' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CompTextField
                                index={index}
                                col={col}
                                row={row}
                                formik={formik}
                                handleFieldChange={handleFieldChange}
                              />
                              <CompSelectField
                                index={index}
                                col={'land_dimension'}
                                totalGroups={totalGroups}
                                currentColumns={currentColumns}
                                row={row}
                                formik={formik}
                                handleFieldChange={handleFieldChange}
                                currentColumnGroup={currentColumnGroup}
                                setCurrentColumnGroup={setCurrentColumnGroup}
                              />
                            </Box>
                          ) : dateFields.includes(col) ? (
                            <div className="datepicker-wrapper">
                              <DatePickerComp
                                label=""
                                name={`comps[${index}].${col}`}
                                value={
                                  typeof row[col] === 'string' &&
                                  moment(
                                    row[col] as string,
                                    ['MM/DD/YYYY', moment.ISO_8601],
                                    true
                                  ).isValid()
                                    ? moment(row[col] as string, [
                                        'MM/DD/YYYY',
                                        moment.ISO_8601,
                                      ])
                                    : null
                                }
                                onChange={(value: Date | null) => {
                                  const formattedDate = value
                                    ? moment(value).format('YYYY-MM-DD')
                                    : '';
                                  handleFieldChange(index, col, formattedDate);
                                }}
                              />
                            </div>
                          ) : dropdownColumns.includes(col) ? (
                            <CompSelectField
                              index={index}
                              col={col}
                              totalGroups={totalGroups}
                              currentColumns={currentColumns}
                              row={row}
                              formik={formik}
                              handleFieldChange={handleFieldChange}
                              currentColumnGroup={currentColumnGroup} // ✅ Add this
                              setCurrentColumnGroup={setCurrentColumnGroup} // ✅ Add this
                            />
                          ) : (
                            <CompTextField
                              index={index}
                              col={col}
                              row={row}
                              formik={formik}
                              handleFieldChange={handleFieldChange}
                            />
                          )}
                        </TableCell>
                      ))}

                      {/* New Column for "Custom Condition" */}
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'white',
          padding: '16px',
          borderTop: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Button
          className="hover:bg-[#0DA1C7] text-white"
          variant="contained"
          color="primary"
          onClick={saveComps}
          sx={{ width: '160px', height: '50px', background: '#0DA1C7' }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompsForm;
