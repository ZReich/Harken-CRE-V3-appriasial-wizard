import DatePickerComp from '@/components/date-picker';
import { RequestType, useMutate } from '@/hook/useMutate';
import { columnHeaders } from '@/pages/comps/Listing/Comps-table-header';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  hospitalityOptions,
  industrialOptions,
  leaseTypeOptions,
  multifamilyOptions,
  officeOptions,
  residentialOptions,
  retailOptions,
  selectTypeOptions,
  specialOptions,
} from '@/pages/comps/create-comp/SelectOption';
import { useCompsFormik } from '@/pages/comps/Listing/comps-formik';
import {
  dateFields,
  dropdownColumns,
  getRequiredColumns,
} from '@/pages/comps/Listing/filter-initial-values';

import { BuildingDetailsEnum } from '@/pages/comps/enum/CompsEnum';
import CompSelectField from '@/pages/comps/Listing/comp-select-field-props';
import CompTextField from '@/pages/comps/Listing/comp-text-field-props';
import {
  Comp,
  CompRow,
  CompsFormProps,
  CompsFormValues,
  RowType,
} from '@/pages/comps/Listing/comps-table-interfaces';
import { useFormikContext } from 'formik';

const ResidentialAiCostCompsTable = ({
  handleClose,
  onClose,
  open,
  compsData,
  passCompsData,
  compsLength,
}: CompsFormProps) => {
  const [currentColumnGroup, setCurrentColumnGroup] = useState(0);
  const [updatedComps, setUpdatedComps] = useState<any[]>(
    Array.isArray(compsData) ? compsData : []
  );
  const [subZoneOptions, setSubZoneOptions] = useState<{
    [key: number]: any[];
  }>({});

  // ✅ Dependencies include comps to re-run on change
  const { values } = useFormikContext();

  console.log(subZoneOptions);
  const activeType = localStorage.getItem('activeType');
  const checkType = localStorage.getItem('checkType');
  const approachType = localStorage.getItem('approachType');

  // Formik with `compsData` and `activeType
  const formik = useCompsFormik(
    compsData,
    activeType,
    (values: { row: RowType }) => {
      console.log('Saved data successfully', values);
    }
  );
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
    getRequiredColumns(activeType, formik.values.comps)
  );

  // Set updated comps using useEffect
  useEffect(() => {
    setUpdatedComps(formik.values.comps);
  }, [formik.values]);

  // Comps list api
  useMutate({
    queryKey: 'compsList',
    endPoint: 'comps/list',
    config: {},
    requestType: RequestType.POST,
  });

  // handlefieldchange for all the input fields
  let toastDisplayed = false;

  const handleFieldChange = async (
    index: number,
    field: string,
    value: any
  ) => {
    const selectedCount = formik.values.comps.filter(
      (comp: any) => comp.selected
    ).length;

    // Ensure total selection includes both selected comps and stored comps length
    const newTotalSelected =
      (value ? selectedCount + 1 : selectedCount - 1) + compsLength;

    // Prevent selection beyond 4
    if (field === 'selected' && value && newTotalSelected > 4) {
      if (!toastDisplayed) {
        toast.error(
          `You have already linked ${compsLength} comp, so you can select up to ${4 - compsLength} more.`
        );
        toastDisplayed = true;
        setTimeout(() => {
          toastDisplayed = false;
        }, 2000);
      }
      return false; // ⛔ Prevent further updates
    }

    // ✅ Continue only if the selection was valid
    await formik.setFieldValue(`comps.${index}.${field}`, value);
    formik.setTouched({ ...formik.touched, [`comps.${index}.${field}`]: true });

    // Clear corresponding custom fields when selecting a value other than "Type My Own"
    if (field === 'condition' && value !== 'Type My Own') {
      await formik.setFieldValue(`comps.${index}.condition_custom`, '');
    }
    if (field === 'parking' && value !== 'Type My Own') {
      await formik.setFieldValue(`comps.${index}.parking_custom`, '');
    }
    if (field === 'building_sub_type' && value !== 'Type My Own') {
      await formik.setFieldValue(`comps.${index}.building_sub_type_custom`, '');
    }
    if (field === 'frontage' && value !== 'Type My Own') {
      await formik.setFieldValue(`comps.${index}.frontage_custom`, '');
    }
    if (field === 'lot_shape' && value !== 'Type My Own') {
      await formik.setFieldValue(`comps.${index}.lot_shape_custom`, '');
    }

    // Update the comps array
    const updatedComps = [...formik.values.comps];
    updatedComps[index] = { ...updatedComps[index], [field]: value };

    setUpdatedComps((prevComps) =>
      prevComps.map((comp, compIndex) => {
        if (compIndex === index) {
          const newComp = { ...comp };

          if (newComp.condition !== 'Type My Own')
            delete newComp.condition_custom;
          if (newComp.parking !== 'Type My Own') delete newComp.parking_custom;
          if (newComp.building_sub_type !== 'Type My Own')
            delete newComp.building_sub_type_custom;
          if (newComp.frontage !== 'Type My Own')
            delete newComp.frontage_custom;
          if (newComp.lot_shape !== 'Type My Own')
            delete newComp.lot_shape_custom;

          return newComp;
        }
        return comp;
      })
    );

    // Update required columns dynamically
    const newRequiredColumns = getRequiredColumns(activeType, updatedComps);
    setRequiredColumns(newRequiredColumns);

    return true; // ✅ Indicate that the update was successful
  };

  useEffect(() => {
    setUpdatedComps((prevComps) =>
      prevComps.map((comp: any, index: any) => {
        if (!comp.size_type || comp.size_type === '') {
          console.log(
            `🛠 Setting default 'SF' for size_type at index ${index}`
          );
          formik.setFieldValue(`comps.${index}.size_type`, 'SF');
          return { ...comp, size_type: 'SF' };
        }
        return comp;
      })
    );
  }, [formik.values.comps]);

  const SetAllData = (newComps: Comp[]) => {
    const filteredComps = newComps?.filter((comp: any) => comp.link == true); // Filter only linked items

    const updatedCompss = filteredComps.map(({ id, ...restComp }: any) => {
      console.log(id);
      return {
        ...restComp,
        comp_id: restComp?.comp_id,
        expenses: (values as any).operatingExpenses.map((exp: any) => ({
          ...exp,
          adj_value: 0,
          comparison_basis: 0,
        })),
        adjusted_psf: restComp.price_square_foot,
      };
    });

    passCompsData(updatedCompss); // Pass filtered and mapped data
  };
  const saveComps = async () => {
    // Mark required fields as touched
    formik.setTouched({
      comps: formik.values.comps.map(() =>
        Object.fromEntries(requiredColumns.map((col) => [col, true]))
      ),
    });

    // 🔹 Validate form fields
    const errors = await formik.validateForm();

    // 🔥 Step 1: Show required fields error **first**
    if (Object.keys(errors).length > 0) {
      toast.error('Please fill in all required fields.');
      return; // ⬅ Stop execution here if validation fails
    }

    // 🔹 Check if at least one checkbox is selected
    const isAnyCompSelected = formik.values.comps.some(
      (comp: any) => comp.selected
    );

    // 🔥 Step 2: Show "select at least one comp" error **after mandatory fields check**
    if (!isAnyCompSelected) {
      toast.error('Please select at least one comp before saving.');
      return; // ⬅ Stop execution here
    }

    try {
      const payload = {
        comp_type: 'land_only',
        type:
          localStorage.getItem('checkType') === 'leasesCheckbox'
            ? 'lease'
            : 'sale',
        properties: formik.values.comps,
      };

      const response = await axios.post(
        `resComps/save-extracted-comps`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const responseData = response.data?.data;
      const selectedComps = responseData?.data?.selectedComps || [];

      // Show toast message with calculated values
      toast.success(response.data.data.data.message);

      if (selectedComps.length > 0) {
        // Update Formik values with new comp IDs
        const newComps = formik.values.comps.map(
          (comp: Comp, index: number) => ({
            ...comp,
            comp_id: selectedComps[index] || comp.comp_id,
          })
        );

        setUpdatedComps(newComps);
        SetAllData(newComps);
      } else {
        console.warn('No selected comps found, skipping mutation API call.');
      }

      onClose();
    } catch (error: any) {
      // setLoader(false);
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
  useEffect(() => {
    const checkType = localStorage.getItem('checkType');
    const approachType = localStorage.getItem('approachType');

    // Run only when checkType === 'leasesCheckbox' OR approachType === 'leaseCheck'
    if (checkType !== 'leasesCheckbox' && approachType !== 'leaseCheck') return;

    const updatedComps = formik.values.comps.map((comp: any) => {
      if (!comp.lease_rate_unit) {
        return { ...comp, lease_rate_unit: 'year' };
      }
      return comp;
    });

    // Prevent unnecessary re-renders
    if (JSON.stringify(updatedComps) !== JSON.stringify(formik.values.comps)) {
      formik.setValues({
        ...formik.values,
        comps: updatedComps,
      });
    }
  }, [
    formik.values.comps,
    localStorage.getItem('checkType'),
    localStorage.getItem('approachType'),
  ]);
  useEffect(() => {
    const checkType = localStorage.getItem('checkType');
    const approachType = localStorage.getItem('approachType');

    // Run only if checkType matches leasesCheckBox OR approachType matches leasesCheckBox
    if (checkType === 'leasesCheckbox' || approachType === 'leaseCheck') {
      const updatedComps = formik.values.comps.map((comp: any) => {
        const isValidLeaseType = leaseTypeOptions.some(
          (option) => option.value === comp.lease_type
        );

        // Only update lease_type if it's invalid or missing
        if (!isValidLeaseType || comp.lease_type == null) {
          return { ...comp, lease_type: '' }; // Default to "Select Lease Type"
        }
        return comp;
      });

      // Prevent unnecessary re-renders by checking if there's a change
      if (
        JSON.stringify(updatedComps) !== JSON.stringify(formik.values.comps)
      ) {
        formik.setValues({
          ...formik.values,
          comps: updatedComps,
        });
      }
    }
  }, [formik.values.comps]); // Only runs when comps change

  // show table headings with required headings

  const tableColumns: string[] = [
    ...new Set([
      ...requiredColumns, // Ensure required fields are always included
      ...Object.keys(columnHeaders)
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
          return true; // Keep other columns
        }),
    ]),
  ];
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
        <Box sx={{ position: 'relative' }}>
          <TableContainer
            sx={{ maxHeight: '55vh' }}
            className="table-wrapper popupTableWrapper"
          >
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableCell
                  rowSpan={2}
                  className="text-nowrap w-36"
                  sx={{
                    fontWeight: 'bold',
                    color: '#0DA1C7',
                    position: 'sticky',
                    left: '0',
                    zIndex: 3,
                    background: 'white',
                  }}
                >
                  Select
                </TableCell>
                <TableRow>
                  <TableCell
                    className="text-nowrap font-bold"
                    sx={{
                      position: 'sticky',
                      left: '65.89px',
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
                      business_name: 'Property Name',
                      summary: 'Property Summary',
                      basement_finished_sq_ft: 'Basement Finished (SF)',
                      basement_unfinished_sq_ft: 'Basement Unfinished (SF)',
                      gross_living_sq_ft: 'Gross Living Area (SF)',
                      total_sq_ft: 'Total SF',
                      weight_sf: 'SF Weighting',
                      net_operating_income: 'Net Operating Income (NOI)',
                      utilities_select: 'Utilities',
                      utilities_select_custom: 'Other Utilities',
                      space: 'Space(SF)',
                      est_land_value: 'Estimated Land Value',
                      date_list: 'List Date',
                      street_suite: 'Suite Number',
                      cap_rate: 'CAP Rate',
                      asking_rent_unit: 'Asking Rent Units',
                      TI_allowance_unit: 'TI Allowance Units',
                      location_desc: 'Location Description',
                      date_expiration: 'Expiration Date',
                      date_commencement: 'Commencement Date',
                      date_execution: 'Execution Date',
                      est_building_value: 'Building Residual',

                      term: 'Term(Months)',
                      cam: 'CAM',
                      free_rent: 'Free Rent(Months)',

                      legal_desc: 'Legal Description',
                      operating_expense_psf: 'Operating Expense (PSF)',
                      parcel_id_apn: 'Parcel #',
                      acquirer_type:
                        checkType === 'leasesCheckbox' ||
                        approachType === 'leaseCheck'
                          ? 'Tenant Type'
                          : 'Buyer Type',
                      offeror_type:
                        checkType === 'leaseCheckBox' ||
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
                    <TableRow key={String(row.id)}>
                      <TableCell
                        className="text-nowrap"
                        sx={{
                          position: 'sticky',
                          left: 0,
                          background: '#fff',
                          zIndex: 3, // Ensures it stays above other cells
                        }}
                      >
                        <Checkbox
                          className="p-0 selectIdCheckbox"
                          checked={
                            formik.values.comps[index]?.selected || false
                          }
                          onChange={async (e) => {
                            const isChecked = e.target.checked;

                            // ✅ Attempt to update 'selected' field
                            const wasUpdated = await handleFieldChange(
                              index,
                              'selected',
                              isChecked
                            );

                            // ✅ Only update 'link' if 'selected' was successfully changed
                            if (wasUpdated) {
                              await handleFieldChange(index, 'link', isChecked);
                            }
                          }}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell
                        className="text-nowrap"
                        sx={{
                          background: '#CFECF4',
                          color: '#0DA1C7',
                          fontWeight: 'bold',
                          padding: '20px 60px 20px 45px',
                          borderColor: '#fff',
                          position: 'sticky',
                          left: '65.89px',
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
                          {dateFields.includes(col) ? (
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

export default ResidentialAiCostCompsTable;
