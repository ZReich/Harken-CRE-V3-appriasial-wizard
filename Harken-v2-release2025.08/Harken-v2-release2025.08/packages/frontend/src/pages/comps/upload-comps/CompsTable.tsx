import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { columnHeaders } from '@/pages/comps/Listing/Comps-table-header';
import axios from 'axios';
import { RequestType, useMutate } from '@/hook/useMutate';
import { toast } from 'react-toastify';
import DatePickerComp from '@/components/date-picker';
import moment from 'moment';
import { Icons } from '@/components/icons';
import {
  hospitalityOptions,
  industrialOptions,
  multifamilyOptions,
  officeOptions,
  residentialOptions,
  retailOptions,
  selectTypeOptions,
  specialOptions,
} from '@/pages/comps/create-comp/SelectOption';

import {
  dateFields,
  dropdownColumns,
} from '@/pages/comps/Listing/filter-initial-values';
import { getRequiredColumns } from '@/pages/comps/Listing/filter-initial-values';
import { useCompsFormik } from '@/pages/comps/Listing/comps-formik';

import {
  CompRow,
  // RowType,
  CompsFormValues,
} from '@/pages/comps/Listing/comps-table-interfaces';
import {
  BuildingDetailsEnum,
  ListingEnum,
  CreateCompsEnum,
  ValidationStatusEnum,
  UploadStatusEnum,
  LocalStorageKeysEnum,
  ToastMessagesEnum,
  RoutePathsEnum,
  ActionStatesEnum,
  CustomFieldsEnum,
  CustomFieldValuesEnum,
  LocalStorageEnum,
  UILabelsEnum,
  ErrorMessagesEnum,
  FieldNamesEnum,
  SiteDetailsEnum,
  UnitsEnum,
  CustomFieldMappingsEnum,
  SellerBuyierEnum,
  ColumnHeaderLabelsEnum,
  // ListingEnum,
} from '@/pages/comps/enum/CompsEnum';
import CompSelectField from '@/pages/comps/Listing/comp-select-field-props';
import CompTextField from '@/pages/comps/Listing/comp-text-field-props';
import AddressAutocomplete from './AddressAutocomplete';
import loadingImage from '../../../images/loading.png';
import { useNavigate, useLocation } from 'react-router-dom';

interface CompsTableProps {
  compsData: any[];
  setUploadCompsStatus: (status: boolean) => void;
  hideSaveButton?: boolean;
  uploadStatuses?: { [key: number]: string };
  setUploadStatuses?: (
    statuses:
      | { [key: number]: string }
      | ((prev: { [key: number]: string }) => { [key: number]: string })
  ) => void;
  showCheckboxes?: boolean;
  onCompSelection?: (selectedIndices: number[]) => void;
  maxSelection?: number;
  selectedCompsFromParent?: number[];
  actionStates?: { [key: number]: string };
  setActionStates?: (
    states:
      | { [key: number]: string }
      | ((prev: { [key: number]: string }) => { [key: number]: string })
  ) => void;
  actionErrors?: { [key: number]: string };
  setActionErrors?: (
    errors:
      | { [key: number]: string }
      | ((prev: { [key: number]: string }) => { [key: number]: string })
  ) => void;
  onFormikValuesChange?: (values: any[]) => void;
  locationState?: {
    operatingExpenses?: any[];
    salesCompQualitativeAdjustment?: any[];
    appraisalSpecificAdjustment?: any[];
  };
  rowLoaders?: { [key: number]: boolean };
  setRowLoaders?: (
    loaders:
      | { [key: number]: boolean }
      | ((prev: { [key: number]: boolean }) => { [key: number]: boolean })
  ) => void;
}

const CompsTable = ({
  compsData,
  setUploadCompsStatus,
  hideSaveButton,
  uploadStatuses = {},
  setUploadStatuses,
  showCheckboxes = false,
  onCompSelection,
  maxSelection = 4,
  selectedCompsFromParent = [],
  actionStates: externalActionStates,
  setActionStates: setExternalActionStates,
  onFormikValuesChange,
  locationState,
  rowLoaders: externalRowLoaders,
  setRowLoaders: setExternalRowLoaders,
}: CompsTableProps) => {
  // Track when compsData prop changes

  const navigate = useNavigate();
  const location = useLocation();
  const [currentColumnGroup, setCurrentColumnGroup] = useState(0);
  const [, setUpdatedComps] = useState<any[]>(
    Array.isArray(compsData) ? compsData : []
  );
  const [, setValidationStatuses] = useState<{
    [key: string]: ValidationStatusEnum;
  }>({});
  const [, setSubZoneOptions] = useState<{
    [key: number]: any[];
  }>({});
  const [validationLoader, setValidationLoader] = useState(false);
  const [internalRowLoaders, setInternalRowLoaders] = useState<{
    [key: number]: boolean;
  }>({});
  // Use external rowLoaders if provided, otherwise use internal
  const rowLoaders = externalRowLoaders || internalRowLoaders;
  const setRowLoaders = setExternalRowLoaders || setInternalRowLoaders;
  const [internalActionStates, setInternalActionStates] = useState<{
    [key: number]: string;
  }>({});

  const validationTimeoutsRef = useRef<{
    [key: number]: number | NodeJS.Timeout;
  }>({});

  const [debounceTimeouts, setDebounceTimeouts] = useState<{
    [key: number]: NodeJS.Timeout;
  }>({});
  const [fieldErrors, setFieldErrors] = useState<{
    [key: number]: { [field: string]: string };
  }>({});
  const [missingRequiredCounts, setMissingRequiredCounts] = useState<{
    [key: number]: number;
  }>({});

  // Use external actionStates if provided, otherwise use internal
  const actionStates = externalActionStates || internalActionStates;
  const setActionStates = setExternalActionStates || setInternalActionStates;
  const [selectedComps, setSelectedComps] = useState<number[]>(
    selectedCompsFromParent
  );
  // Sync with parent's selected comps
  useEffect(() => {
    setSelectedComps(selectedCompsFromParent);
  }, [selectedCompsFromParent]);

  const handleCheckboxChange = (index: number, checked: boolean) => {
    let newSelected: number[];

    if (checked) {
      // Get existing comp length based on URL
      const currentPath = window.location.pathname;
      let existingCompsLength = 0;
      let localStorageKey = '';

      if (currentPath.includes(RoutePathsEnum.EVALUATION_UPLOAD_SALES_COMPS)) {
        localStorageKey = LocalStorageKeysEnum.COMPS_LENGTH_SALES_EVALUATION;
      } else if (
        currentPath.includes(RoutePathsEnum.EVALUATION_UPLOAD_COST_COMPS)
      ) {
        localStorageKey = LocalStorageKeysEnum.COMPS_LENGTH_COST_EVALUATION;
      } else if (
        currentPath.includes(RoutePathsEnum.EVALUATION_UPLOAD_LEASE_COMPS)
      ) {
        localStorageKey = LocalStorageKeysEnum.COMPS_LENGTH_LEASE_EVALUATION;
      } else if (
        currentPath.includes(RoutePathsEnum.EVALUATION_UPLOAD_CAP_COMPS)
      ) {
        localStorageKey = LocalStorageKeysEnum.COMPS_LENGTH_CAP_EVALUATION;
      } else if (
        currentPath.includes(
          RoutePathsEnum.EVALUATION_UPLOAD_MULTI_FAMILY_COMPS
        )
      ) {
        localStorageKey =
          LocalStorageKeysEnum.COMPS_LENGTH_MULTIFAMILY_EVALUATION;
      } else if (
        currentPath.includes(RoutePathsEnum.APPRAISAL_UPLOAD_SALES_COMPS)
      ) {
        localStorageKey = LocalStorageKeysEnum.COMPS_LENGTH_SALES_APPRAISAL;
      } else if (
        currentPath.includes(RoutePathsEnum.APPRAISAL_UPLOAD_COST_COMPS)
      ) {
        localStorageKey = LocalStorageKeysEnum.COMPS_LENGTH_COST_APPRAISAL;
      } else if (
        currentPath.includes(RoutePathsEnum.APPRAISAL_UPLOAD_LEASE_COMPS)
      ) {
        localStorageKey = LocalStorageKeysEnum.COMPS_LENGTH_LEASE_APPRAISAL;
      }

      if (localStorageKey) {
        existingCompsLength = parseInt(
          localStorage.getItem(localStorageKey) || `${ListingEnum.ZERO}`,
          10
        );
      }

      const remainingSlots = maxSelection - existingCompsLength;

      if (selectedComps.length >= remainingSlots) {
        if (existingCompsLength > ListingEnum.ZERO) {
          toast.error(
            `${existingCompsLength} ${ToastMessagesEnum.MAX_SELECTION_WITH_EXISTING} ${remainingSlots} ${ToastMessagesEnum.MORE_SUFFIX}`
          );
        } else {
          toast.error(
            `${ToastMessagesEnum.MAX_SELECTION_EXCEEDED} ${maxSelection} ${ToastMessagesEnum.COMPS_SUFFIX}`
          );
        }
        return;
      }
      newSelected = [...selectedComps, index];
    } else {
      newSelected = selectedComps.filter((i) => i !== index);
    }

    setSelectedComps(newSelected);
    onCompSelection?.(newSelected);
  };

  const activeType = localStorage.getItem(LocalStorageKeysEnum.ACTIVE_TYPE);

  const processedCompsData = React.useMemo(() => {
    if (!compsData || compsData.length === ListingEnum.ZERO) return [{}];

    const processed = compsData.map((comp: any) => {
      if (comp.state && typeof comp.state === 'string') {
        return { ...comp, state: comp?.state?.toLowerCase() };
      }
      return comp;
    });

    return processed;
  }, [compsData]);

  const formik = useCompsFormik(processedCompsData, activeType, () => {
    // ...
  });
  // const compsRef = useRef<CompsFormValues['comps']>(formik.values.comps);
  // useEffect(() => {
  //   compsRef.current = formik.values.comps;
  // }, [formik.values.comps]);

  const [requiredColumns, setRequiredColumns] = useState<string[]>(
    getRequiredColumns(activeType, processedCompsData)
  );

  const validateCompAPIRef = useRef<
    ((index: number, comp: any) => void) | null
  >(null);

  // Check if any row needs an action dropdown (has error status OR has action selected)
  const hasActionDropdowns = useMemo(() => {
    if (!formik.values.comps) return false;
    return formik.values.comps.some((index: number) => {
      const status = uploadStatuses?.[index];
      const actionState = actionStates[index];
      return (
        status?.includes(UploadStatusEnum.ALREADY_EXIST) ||
        status?.includes(UploadStatusEnum.INVALID_ADDRESS) ||
        status?.includes(UploadStatusEnum.ADDRESS_VALIDATION_FAILED) ||
        status === UploadStatusEnum.MISSING_REQUIRED_FIELDS ||
        actionState // Has action selected
      );
    });
  }, [formik.values.comps, uploadStatuses, actionStates]);

  // Notify parent of formik values changes
  useEffect(() => {
    if (onFormikValuesChange && formik.values.comps) {
      onFormikValuesChange(formik.values.comps);
    }
  }, [formik.values.comps, onFormikValuesChange]);

  // Reset action states when new data comes in, but let useCompsFormik handle the formik values
  useEffect(() => {
    if (processedCompsData && processedCompsData.length > ListingEnum.ZERO) {
      // Don't reset actionStates to preserve user selections
      // setActionStates({});
      setValidationStatuses({});
      setFieldErrors({});
      setMissingRequiredCounts({});

      Object.values(debounceTimeouts).forEach((timeout) =>
        clearTimeout(timeout)
      );
      setDebounceTimeouts({});
    }
  }, [processedCompsData]);

  useEffect(() => {
    if (formik.values.comps && formik.values.comps.length > ListingEnum.ZERO) {
      validateRequiredFields();
    }
  }, [formik.values.comps.length]); // Only trigger when number of comps changes

  // Track changes to missingRequiredCounts
  useEffect(() => { }, [missingRequiredCounts]);
  const validateRequiredFields = () => {
    formik.values.comps.forEach((comp: any, index: number) => {
      const missingCount = validateSingleRowRequiredFields(index, comp, false);

      if (missingCount > 0) {
        setUploadStatuses?.((prev) => {
          // If parent already provided a status, don't override it
          if (prev[index]) return prev;
          return { ...prev, [index]: UploadStatusEnum.MISSING_REQUIRED_FIELDS };
        });
        return; // don't auto-validate this row
      }

      // ✅ All required fields present on initial load → optionally auto-validate
      const status = uploadStatuses?.[index];
      const actionState = actionStates[index];

      if (
        status !== UploadStatusEnum.SKIPPED &&
        actionState !== ActionStatesEnum.SKIP
      ) {
        // Small delay to avoid race conditions
        setTimeout(
          () => validateCompAPI(index, comp),
          ListingEnum.TWO_HUNDRED + index * ListingEnum.HUNDRED
        );
      }
    });
  };

  const validateSingleRowRequiredFields = useCallback(
    (index: number, comp: any, updateStatus = true): number => {
      const errors: { [field: string]: string } = {};
      let missingCount = 0;

      requiredColumns.forEach((field) => {
        // Skip custom fields if their parent field is not CustomFieldValuesEnum.TYPE_MY_OWN
        if (field.endsWith('_custom')) {
          const parentField = field.replace('_custom', '');
          if (
            comp[parentField] !== `${CustomFieldValuesEnum.TYPE_MY_OWN}` &&
            comp[parentField] !== `${CustomFieldValuesEnum.TYPE_MY_OWN_LOWER}`
          ) {
            return; // Skip validation for this custom field
          }
        }

        const value = comp[field];
        const isEmpty =
          !value || (typeof value === 'string' && value.trim() === '');

        if (isEmpty) {
          errors[field] = `${CreateCompsEnum.REQUIRED_FIELD}`;
          missingCount++;
        }
      });

      // Check if action is required for error statuses (but not for skipped)
      const status = uploadStatuses?.[index];
      if (
        (status?.includes(UploadStatusEnum.ALREADY_EXIST) ||
          status?.includes(UploadStatusEnum.INVALID_ADDRESS) ||
          status?.includes(UploadStatusEnum.ADDRESS_VALIDATION_FAILED)) &&
        status !== UploadStatusEnum.SKIPPED &&
        (!actionStates[index] || actionStates[index] === '')
      ) {
        errors['action'] = `${CreateCompsEnum.REQUIRED_FIELD}`;
        missingCount++;
      }

      // Always update field errors immediately for UI feedback
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        if (Object.keys(errors).length > ListingEnum.ZERO) {
          newErrors[index] = errors;
        } else {
          delete newErrors[index];
        }
        return newErrors;
      });

      // Update missing required count for this row
      setMissingRequiredCounts((prev) => {
        const newCounts = { ...prev, [index]: missingCount };
        return newCounts;
      });

      // Update upload status based on missing fields
      if (updateStatus) {
        if (missingCount > 0) {
          setUploadStatuses?.((prev) => ({
            ...prev,
            [index]: 'Missing Required Fields',
          }));
        } else {
          // Only clear status if it was Missing Required Fields
          const currentStatus = uploadStatuses?.[index];
          if (currentStatus === 'Missing Required Fields') {
            setUploadStatuses?.((prev) => ({
              ...prev,
              [index]: 'Pending',
            }));
          }
        }
      }

      return missingCount;
    },
    [requiredColumns, uploadStatuses, setUploadStatuses]
  );

  // Track formik changes and trigger validation for dropdown fields - removed to prevent all rows re-rendering

  // Check if comp has all required fields filled
  // const hasAllRequiredFields = (comp: any, index: number) => {
  //   // Check if all required fields are filled for this specific comp
  //   const hasRequiredFieldErrors = requiredColumns.some((field) => {
  //     // Skip custom fields if their parent field is not "Type My Own"
  //     if (field.endsWith('_custom')) {
  //       const parentField = field.replace('_custom', '');
  //       if (
  //         comp[parentField] !== CustomFieldValuesEnum.TYPE_MY_OWN &&
  //         comp[parentField] !== CustomFieldValuesEnum.TYPE_MY_OWN_LOWER
  //       ) {
  //         return false; // Skip validation for this custom field
  //       }
  //     }

  //     const value = comp[field];
  //     return !value || (typeof value === 'string' && value.trim() === '');
  //   });

  //   // Also check action field for error statuses
  //   const status = uploadStatuses?.[index];
  //   const needsAction =
  //     status?.includes('already exist') ||
  //     status?.includes('invalid address') ||
  //     status?.includes('Address validation failed');

  //   if (needsAction && (!actionStates[index] || actionStates[index] === '')) {
  //     return false;
  //   }

  //   return !hasRequiredFieldErrors;
  // };

  // Auto-validate comp when all required fields are filled
  const validateCompAPI = useCallback(
    async (index: number, comp: any, skipActionCheck = false) => {
      const status = uploadStatuses?.[index];
      const actionState = actionStates[index];

      if (actionState === ActionStatesEnum.SKIP) {
        return;
      }

      // Prevent multiple API calls
      if (
        status === UploadStatusEnum.VALIDATING ||
        status === UploadStatusEnum.COMPLETED
      ) {
        return;
      }

      // For non-address changes, if an action is required (existing/invalid) but not selected, don't call
      if (!skipActionCheck) {
        const needsAction =
          status?.includes(UploadStatusEnum.ALREADY_EXIST) ||
          status?.includes(UploadStatusEnum.INVALID_ADDRESS) ||
          status?.includes(UploadStatusEnum.ADDRESS_VALIDATION_FAILED);

        if (
          needsAction &&
          (!actionStates[index] || actionStates[index] === '')
        ) {
          return;
        }
      }

      // ✅ FINAL gate: ALL required fields must be non-empty
      const hasAllRequiredFieldsFilled = requiredColumns.every((field) => {
        // Skip custom fields if their parent isn't Type My Own
        if (field.endsWith('_custom')) {
          const parentField = field.replace('_custom', '');
          if (
            comp[parentField] !== `${CustomFieldValuesEnum.TYPE_MY_OWN}` &&
            comp[parentField] !== `${CustomFieldValuesEnum.TYPE_MY_OWN_LOWER}`
          ) {
            return true;
          }
        }

        const value = comp[field];
        return value && value.toString().trim() !== '';
      });

      if (!hasAllRequiredFieldsFilled) {
        return;
      }

      // ✅ If we reached here, row is complete → go validate
      setValidationStatuses((prev) => ({
        ...prev,
        [index]: UploadStatusEnum.VALIDATING,
      }));
      setUploadStatuses?.((prev) => ({
        ...prev,
        [index]: UploadStatusEnum.VALIDATING,
      }));

      try {
        const formatDateForAPI = (dateStr: string) => {
          if (!dateStr) return dateStr;
          const date = moment(dateStr);
          return date.isValid() ? date.format('MM/DD/YYYY') : dateStr;
        };

        const payload = {
          street_address: comp.street_address,
          city: comp.city,
          state: comp.state,
          latitude: comp.latitude || comp.geometry?.lat || null,
          longitude: comp.longitude || comp.geometry?.lng || null,
          date_sold: formatDateForAPI(comp.date_sold),
        };

        const response = await axios.post('comps/validate-comp', payload);

        if (response.data?.data?.statusCode === ListingEnum.TWO_HUNDRED) {
          setValidationStatuses((prev) => ({
            ...prev,
            [index]: ValidationStatusEnum.SUCCESS,
          }));
          setUploadStatuses?.((prev) => ({
            ...prev,
            [index]: CreateCompsEnum.UPLOAD_AS_NEW,
          }));
        }
      } catch (error: any) {
        setValidationStatuses((prev) => ({
          ...prev,
          [index]: ValidationStatusEnum.ERROR,
        }));

        if (error.response?.status === ListingEnum.FOUR_HUNDRED) {
          const errorData = error.response.data?.data;

          if (
            errorData?.message?.includes(UploadStatusEnum.ALREADY_EXIST) ||
            errorData?.data?.alreadyExist === true
          ) {
            setUploadStatuses?.((prev) => ({
              ...prev,
              [index]: UploadStatusEnum.COMP_ALREADY_EXISTS,
            }));
          } else {
            setUploadStatuses?.((prev) => ({
              ...prev,
              [index]: UploadStatusEnum.ADDRESS_VALIDATION_FAILED,
            }));
          }
        } else {
          setUploadStatuses?.((prev) => ({
            ...prev,
            [index]: UploadStatusEnum.VALIDATION_FAILED,
          }));
        }
      }
    },
    [
      uploadStatuses,
      actionStates,
      setUploadStatuses,
      requiredColumns,
      setValidationStatuses,
    ]
  );

  // Update the ref when validateCompAPI changes
  useEffect(() => {
    validateCompAPIRef.current = validateCompAPI;
  }, [validateCompAPI]);

  // Check if save button should be enabled
  const isSaveButtonEnabled = () => {
    const isEnabled = formik.values.comps.every((index: number) => {
      const status = uploadStatuses?.[index];
      const actionState = actionStates[index];
      const hasFieldErrors =
        fieldErrors[index] &&
        Object.keys(fieldErrors[index]).length > ListingEnum.ZERO;
      const hasActionSelected = actionState && actionState !== '';

      // If user selected "Skip", always allow (skip validation)
      if (actionState === ActionStatesEnum.SKIP) {
        return true;
      }

      // Disable if there are field errors (but not for skipped comps)
      if (hasFieldErrors) {
        return false;
      }

      // Disable if Required field missing status
      if (status === UploadStatusEnum.MISSING_REQUIRED_FIELDS) {
        return false;
      }

      // For error statuses that need action, check if action is selected
      if (
        status === UploadStatusEnum.COMP_ALREADY_EXISTS ||
        status?.includes(UploadStatusEnum.ALREADY_EXIST) ||
        status?.includes(UploadStatusEnum.INVALID_ADDRESS) ||
        status?.includes(UploadStatusEnum.ADDRESS_VALIDATION_FAILED)
      ) {
        return hasActionSelected;
      }

      // Enable for other valid statuses including action-based statuses
      return (
        status === UploadStatusEnum.PENDING ||
        status === UploadStatusEnum.SKIPPED ||
        status === UploadStatusEnum.UPLOAD_AS_NEW ||
        status === UploadStatusEnum.COMPLETED ||
        (hasActionSelected &&
          (actionStates[index] === ActionStatesEnum.RETRY ||
            actionStates[index] === ActionStatesEnum.UPLOAD_ANYWAY ||
            actionStates[index] === ActionStatesEnum.UPLOAD_AS_NEW ||
            actionStates[index] === ActionStatesEnum.UPDATE_EXISTING))
      );
    });

    return isEnabled;
  };

  // Check if any action dropdown needs selection
  const checkActionDropdowns = () => {
    const missingActions = formik.values.comps.filter(
      (index: number) => {
        const status = uploadStatuses?.[index];
        const actionState = actionStates[index];

        // Skip validation if user selected "Skip"
        if (actionState === ActionStatesEnum.SKIP) {
          return false;
        }

        const needsAction =
          status?.includes(UploadStatusEnum.ALREADY_EXIST) ||
          status?.includes(UploadStatusEnum.INVALID_ADDRESS) ||
          status?.includes(UploadStatusEnum.ADDRESS_VALIDATION_FAILED);
        const hasAction = actionState && actionState !== '';
        return needsAction && !hasAction;
      }
    );

    if (missingActions.length > 0) {
      toast.error(ToastMessagesEnum.SELECT_ACTION_DROPDOWN);
      return false;
    }
    return true;
  };

  // Track save button status changes
  const [saveButtonEnabled, setSaveButtonEnabled] = useState(false);

  useEffect(() => {
    const enabled = isSaveButtonEnabled();
    setSaveButtonEnabled(enabled);
  }, [uploadStatuses, fieldErrors, actionStates, formik.values.comps]);

  // Set action error immediately when status requires action selection
  useEffect(() => {
    formik.values.comps.forEach((index: number) => {
      const status = uploadStatuses?.[index];
      const actionState = actionStates[index];

      if (
        (status?.includes('already exist') ||
          status?.includes('invalid address') ||
          status?.includes('Address validation failed')) &&
        status !== 'Skipped' &&
        (!actionState || actionState === '')
      ) {
        setFieldErrors((prev) => ({
          ...prev,
          [index]: {
            ...prev[index],
            action: 'This field is required',
          },
        }));
      } else {
        // Clear action error if action is selected or status doesn't require action
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          if (newErrors[index]?.['action']) {
            delete newErrors[index]['action'];
            if (Object.keys(newErrors[index]).length === 0) {
              delete newErrors[index];
            }
          }
          return newErrors;
        });
      }
    });
  }, [uploadStatuses, actionStates, formik.values.comps]);

  const checkType = localStorage.getItem(LocalStorageEnum.CHECK_TYPE);
  const approachType = localStorage.getItem(LocalStorageEnum.APPROACH_TYPE);

  useEffect(() => {
    const newSubZoneOptions: { [key: number]: any[] } = {};
    formik.values.comps.forEach((row: any, index: number) => {
      const zone = row?.building_type || '';
      if (zone) {
        const newZone = zone.toLowerCase();
        newSubZoneOptions[index] = getOptionsByZone(newZone) || [];
      }
    });

    setSubZoneOptions(newSubZoneOptions);
  }, [formik.values.comps]);

  useEffect(() => {
    setUpdatedComps(formik.values.comps);
  }, [formik.values.comps]);

  // Auto-validate all rows when data is initially loaded from PDF
  useEffect(() => {
    if (formik.values.comps && formik.values.comps.length > ListingEnum.ZERO) {
      formik.values.comps.forEach((comp: any, index: number) => {
        // Only run for rows that don't have any status yet (initial load)
        const currentStatus = uploadStatuses?.[index];
        if (currentStatus) {
          return;
        }

        // Check if there are no field errors for this row
        const hasFieldErrors =
          fieldErrors[index] &&
          Object.keys(fieldErrors[index]).length > ListingEnum.ZERO;
        if (hasFieldErrors) {
          return;
        }

        // Check if all required fields are present
        const requiredForValidation = [
          CreateCompsEnum.STREET_ADDRESS,
          CreateCompsEnum.CITY,
          CreateCompsEnum.STATE,
          CreateCompsEnum.DATE_SOLD,
        ];
        const hasRequired = requiredForValidation.every((field) => {
          const value = comp[field];
          return value && value.toString().trim() !== '';
        });

        // Trigger validation if all required fields are filled AND no field errors
        if (hasRequired) {
          validateCompAPI(index, comp);
        }
      });
    }
  }, [formik.values.comps.length]); // Only trigger when number of comps changes (initial load)

  const { mutate } = useMutate({
    queryKey: 'compsList',
    endPoint: 'comps/list',
    config: {},
    requestType: RequestType.POST,
  });

  // Track formik value changes

  // Handle field change to trigger API validation with debounce when user stops typing
  // const handleFieldDebounce = useCallback(
  //   (index: number, field?: string) => {
  //     // Don't trigger API if skipped or completed
  //     const currentStatus = uploadStatuses?.[index];
  //     const actionState = actionStates[index];
  //     if (currentStatus === 'Completed' || actionState === 'Skip') {
  //       return;
  //     }

  //     // Clear existing debounce timeout for this row
  //     if (debounceTimeouts[index]) {
  //       clearTimeout(debounceTimeouts[index]);
  //     }

  //     // Set new debounce timeout (1 second delay after user stops typing)
  //     const timeoutId = setTimeout(() => {
  //       const comp = formik.values.comps[index];

  //       // Only validate and potentially trigger API for this specific row
  //       const missingCount = validateSingleRowRequiredFields(index, comp);

  //       // Only trigger API if all required fields are filled for this row
  //       if (missingCount === 0) {
  //         validateCompAPI(index, comp);
  //       }
  //     }, 1000);

  //     setDebounceTimeouts((prev) => ({ ...prev, [index]: timeoutId }));
  //   },
  //   [validateCompAPI, debounceTimeouts, uploadStatuses, actionStates]
  // );
  // Handle debounced validation for address fields
  const handleAddressFieldDebounce = useCallback(
    (index: number, field: string, updatedComp?: any) => {
      // Only for address-related fields
      if (!['street_address', 'city', 'state', 'date_sold'].includes(field)) {
        return;
      }

      // Don't trigger API if skipped
      const actionState = actionStates[index];
      if (actionState === ActionStatesEnum.SKIP) {
        return;
      }

      // Clear existing debounce timeout for this row
      if (debounceTimeouts[index]) {
        clearTimeout(debounceTimeouts[index]);
      }

      // Set new debounce timeout (500ms delay after user stops typing)
      const timeoutId = setTimeout(() => {
        // Use the passed updatedComp or get current comp from formik
        const comp = updatedComp || formik.values.comps[index];

        // For address field changes, always trigger API if all required fields are filled
        // Don't rely on validateSingleRowRequiredFields as it might not update status
        const hasAllRequiredFieldsFilled = requiredColumns.every((field) => {
          // Skip custom fields if their parent field is not "Type My Own"
          if (field.endsWith('_custom')) {
            const parentField = field.replace('_custom', '');
            if (
              comp[parentField] !== CustomFieldValuesEnum.TYPE_MY_OWN &&
              comp[parentField] !== CustomFieldValuesEnum.TYPE_MY_OWN_LOWER
            ) {
              return true; // Skip validation for this custom field
            }
          }

          const value = comp[field];
          return value && value.toString().trim() !== '';
        });

        // Only trigger API if all required fields are filled
        if (hasAllRequiredFieldsFilled) {
          validateCompAPI(index, comp, true); // Skip action check for address validation
        }
      }, 500);

      setDebounceTimeouts((prev) => ({ ...prev, [index]: timeoutId }));
    },
    [
      validateCompAPI,
      debounceTimeouts,
      uploadStatuses,
      actionStates,
      validateSingleRowRequiredFields,
      // setValidationTimeouts,
      requiredColumns,
    ]
  );

  let toastDisplayed = false;
  const handleFieldChange = useCallback(
    (index: number, field: string, value: any) => {
      const compsLength = parseInt(
        localStorage.getItem(LocalStorageEnum.COMPS_LENGTH) ||
        ListingEnum.ZERO.toString(),
        10
      );
      const selectedCount = formik.values.comps.filter(
        (comp: any) => comp.selected
      ).length;

      const newTotalSelected = value ? selectedCount + 1 : selectedCount - 1;

      // ✅ selection limit check
      if (
        field === FieldNamesEnum.SELECTED &&
        value &&
        newTotalSelected > ListingEnum.FOUR
      ) {
        if (!toastDisplayed) {
          toast.error(
            `You have already selected ${compsLength}. You can only add ${ListingEnum.FOUR - compsLength} more.`
          );
          toastDisplayed = true;
          setTimeout(() => {
            toastDisplayed = false;
          }, 2000);
        }
        return;
      }

      // ✅ always store state in lowercase
      if (field === 'state' && typeof value === 'string') {
        value = value.toLowerCase();
      }

      // clone current comps + target row
      const updatedComps = [...formik.values.comps];
      const newComp = { ...updatedComps[index], [field]: value };

      // ✅ Auto-update land_size when land_dimension changes
      if (field === SiteDetailsEnum.LAND_DIMENSION && newComp.land_size) {
        newComp.land_size = String(newComp.land_size || '').replace(
          /[^\d.]/g,
          ''
        );
        const currentLandSize =
          parseFloat(newComp.land_size) || ListingEnum.ZERO;

        if (currentLandSize > ListingEnum.ZERO) {
          if (value === UnitsEnum.SF) {
            const landSize = Math.round(currentLandSize).toString();
            newComp.land_size = new Intl.NumberFormat('en-US').format(
              parseFloat(landSize)
            );
          } else {
            const landSize = currentLandSize.toFixed(3);
            newComp.land_size =
              new Intl.NumberFormat('en-US').format(parseFloat(landSize)) +
              '.000';
          }
        }
      }

      // ✅ handle “Type My Own” custom fields
      const customFields = {
        condition: BuildingDetailsEnum.CONDITION_CUSTOM,
        building_sub_type: CustomFieldsEnum.BUILDING_SUB_TYPE,
        parking: CustomFieldsEnum.PARKING,
        utilities_select: CustomFieldsEnum.UTILITIES_SELECT,
        topography: CustomFieldsEnum.TOPOGRAPHY,
        topography_select: CustomFieldsEnum.TOPOGRAPHY_SELECT,
        land_type: CustomFieldsEnum.LAND_TYPE,
        frontage: CustomFieldsEnum.FRONTAGE,
        electrical: CustomFieldsEnum.ELECTRICAL,
        exterior: CustomFieldsEnum.EXTERIOR,
        roof: CustomFieldsEnum.ROOF,
        garage: CustomFieldsEnum.GARAGE,
        heating_cooling: CustomFieldsEnum.HEATING_COOLING,
        plumbing: CustomFieldsEnum.PLUMBING,
        windows: CustomFieldsEnum.WINDOWS,
        fencing: CustomFieldsEnum.FENCING,
        fireplace: CustomFieldsEnum.FIREPLACE,
      } as const;

      Object.entries(customFields).forEach(([key, customKey]) => {
        if (
          newComp[key] === CustomFieldValuesEnum.TYPE_MY_OWN ||
          newComp[key] === CustomFieldValuesEnum.TYPE_MY_OWN_LOWER
        ) {
          if (!(customKey in newComp)) {
            (newComp as any)[customKey] = '';
          }
        } else if (customKey in newComp) {
          delete (newComp as any)[customKey];
        }
      });

      // write back to array
      updatedComps[index] = newComp;

      // push into formik
      formik.setFieldValue('comps', updatedComps);
      formik.setTouched({
        ...formik.touched,
        [`comps.${index}.${field}`]: true,
      });

      // ✅ recompute required columns only when needed
      if (
        [
          'building_type',
          'condition',
          'building_sub_type',
          'land_type',
        ].includes(field)
      ) {
        const newRequiredColumns = getRequiredColumns(activeType, updatedComps);
        setRequiredColumns(newRequiredColumns);
      }

      // 👇 SNAPSHOT of this row at THIS change (to avoid stale formik state)
      const rowSnapshot = { ...newComp };

      // fields that are “address-ish”
      const isAddressField = [
        'street_address',
        'city',
        'state',
        'date_sold',
      ].includes(field);

      // ✅ clear previous debounce for this row
      const timeouts = validationTimeoutsRef.current;
      if (timeouts[index]) {
        clearTimeout(timeouts[index]);
      }

      // ✅ unified debounced validation (300ms)
      const timeoutId = window.setTimeout(() => {
        const currentRow = rowSnapshot; // always use snapshot from this change

        // 1) update per-field errors
        validateSingleRowRequiredFields(index, currentRow, false);

        // 2) check if ANY required field is empty AFTER debounce
        const hasMissingRequiredField = requiredColumns.some((col) => {
          if (col.endsWith('_custom')) {
            const parentField = col.replace('_custom', '');
            if (
              currentRow[parentField] !== CustomFieldValuesEnum.TYPE_MY_OWN &&
              currentRow[parentField] !==
              CustomFieldValuesEnum.TYPE_MY_OWN_LOWER
            ) {
              return false;
            }
          }

          const val = currentRow[col];
          return (
            val === undefined ||
            val === null ||
            (typeof val === 'string' && val.trim() === '')
          );
        });

        if (hasMissingRequiredField) {
          // 🔴 At least one required field is empty → set status once
          setUploadStatuses?.((prev) => ({
            ...prev,
            [index]: UploadStatusEnum.MISSING_REQUIRED_FIELDS,
          }));
          return; // ❗ DO NOT call validateCompAPI
        }

        // 🟢 all required fields have non-empty values → clear missing status if present
        setUploadStatuses?.((prev) => {
          const newStatuses = { ...prev };
          if (newStatuses[index] === UploadStatusEnum.MISSING_REQUIRED_FIELDS) {
            delete newStatuses[index];
          }
          return newStatuses;
        });

        // ✅ Only now call validateCompAPI (user stopped typing & row is complete)
        validateCompAPI(index, currentRow, isAddressField);
      }, 300);

      validationTimeoutsRef.current[index] = timeoutId;
    },
    [
      activeType,
      formik,
      validateSingleRowRequiredFields,
      requiredColumns,
      setUploadStatuses,
      validateCompAPI,
    ]
  );

  useEffect(() => {
    return () => {
      Object.values(validationTimeoutsRef.current).forEach((timeoutId) =>
        clearTimeout(timeoutId)
      );
    };
  }, []);

  const saveComps = async () => {
    // Validate action dropdowns before proceeding
    formik.values.comps.forEach((comp: any, index: number) => {
      validateSingleRowRequiredFields(index, comp);
    });

    // Check if all required action dropdowns are selected
    if (!checkActionDropdowns()) {
      return;
    }

    // Access uploadStatuses from props
    // const currentUploadStatuses = uploadStatuses || {};
    setValidationLoader(true);

    // Add a small delay to ensure loader is visible during validation
    await new Promise((resolve) => setTimeout(resolve, 100));



    formik.values.comps.forEach((comp: any,) => {

      const missingFields: string[] = [];
      requiredColumns.forEach((field) => {
        const value = comp[field];
        const isEmpty =
          !value || (typeof value === 'string' && value.trim() === '');

        if (isEmpty) {
          missingFields.push(field);
        }
      });
    });

    await formik.validateForm();

    // Mark all required fields as touched, including custom fields
    await formik.setTouched({
      comps: formik.values.comps.map((comp: any) => {
        const touchedFields = Object.fromEntries(
          requiredColumns.map((col) => [col, true])
        );

        // Also mark custom fields as touched if their parent field is "Type My Own"
        if (comp.land_type === CustomFieldValuesEnum.TYPE_MY_OWN) {
          touchedFields.land_type_custom = true;
        }
        return touchedFields;
      }),
    });

    const errors = await formik.validateForm();
    console.log('Formik validation errors:', errors);
    console.log('Formik values being validated:', formik.values);
    console.log('Formik touched fields:', formik.touched);

    // Add small delay to show validation process
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Skip formik validation and use custom validation only
    let hasValidationErrors = false;
    formik.values.comps.forEach((comp: any, index: number) => {
      // Skip validation for rows marked as Skip
      if (actionStates[index] === ActionStatesEnum.SKIP) {
        return;
      }

      const missingFields: string[] = [];
      requiredColumns.forEach((field) => {
        if (field.endsWith('_custom')) {
          const parentField = field.replace('_custom', '');
          if (
            comp[parentField] !== CustomFieldValuesEnum.TYPE_MY_OWN &&
            comp[parentField] !== CustomFieldValuesEnum.TYPE_MY_OWN_LOWER
          ) {
            return;
          }
        }
        const value = comp[field];
        const isEmpty =
          !value || (typeof value === 'string' && value.trim() === '');
        if (isEmpty) {
          missingFields.push(field);
          hasValidationErrors = true;
        }
      });
      if (missingFields.length > 0) {
      }
    });

    if (hasValidationErrors) {
      setValidationLoader(false);

      // Console log missing required fields for each comp
      formik.values.comps.forEach((comp: any,) => {
        const missingFields: string[] = [];
        requiredColumns.forEach((field) => {
          // Skip custom fields if their parent field is not "Type My Own"
          if (field.endsWith('_custom')) {
            const parentField = field.replace('_custom', '');
            if (
              comp[parentField] !== CustomFieldValuesEnum.TYPE_MY_OWN &&
              comp[parentField] !== CustomFieldValuesEnum.TYPE_MY_OWN_LOWER
            ) {
              return;
            }
          }

          const value = comp[field];
          const isEmpty =
            !value || (typeof value === 'string' && value.trim() === '');
          if (isEmpty) {
            missingFields.push(field);
          }
        });

        if (missingFields.length > 0) {
        }
      });

      toast.error(ToastMessagesEnum.FILL_REQUIRED_FIELDS);
      return;
    }

    setValidationLoader(false);

    // Ensure formik values are fully updated before processing
    await new Promise((resolve) => setTimeout(resolve, 50));
    await formik.setValues({ ...formik.values });
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const updatedComps = formik.values.comps.map((comp: any) => {
        const processedComp = {
          ...comp,
          state: comp.state ? comp.state.toLowerCase() : comp.state,
          condition_custom:
            comp.condition === CustomFieldValuesEnum.TYPE_MY_OWN
              ? comp.condition_custom
              : undefined,
          building_sub_type_custom:
            comp.building_sub_type === CustomFieldValuesEnum.TYPE_MY_OWN
              ? comp.building_sub_type_custom
              : undefined,
          parking_custom:
            comp.parking === CustomFieldValuesEnum.TYPE_MY_OWN
              ? comp.parking_custom
              : undefined,
          beds: String(comp.beds || '').replace(/\D/g, ''),
          baths: String(comp.baths || '').replace(/\D/g, ''),
          unit_count: String(comp.unit_count || '').replace(/\D/g, ''),
          building_size: String(comp.building_size || '').replace(/\D/g, ''),
          land_size: String(comp.land_size || '').replace(/[^\d.]/g, ''),
        };
        return processedComp;
      });

      // Process each comp individually
      let hasErrors = false;
      const savedCompIds: number[] = [];
      let processedAnyComp = false;

      for (let i = 0; i < updatedComps.length; i++) {
        // Skip if comp is already completed
        if (uploadStatuses?.[i] === UploadStatusEnum.COMPLETED) {
          continue;
        }

        // Get the action state for this comp and map it to boolean flags
        const actionState = actionStates[i];

        // Check if action is required but not selected
        if (
          actionState === ActionStatesEnum.SKIP ||
          uploadStatuses?.[i] === UploadStatusEnum.SKIPPED
        ) {
          continue;
        }

        processedAnyComp = true;

        // Only send comparison_basis as land_dimension if it exists, otherwise fallback to 'SF'.
        const compComparisonBasis =
          updatedComps[i].comparison_basis || UnitsEnum.SF;
        const compPayload = {
          comp_type: localStorage.getItem(LocalStorageKeysEnum.ACTIVE_TYPE),
          type:
            localStorage.getItem(LocalStorageEnum.CHECK_TYPE) ===
              LocalStorageEnum.LEASES_CHECKBOX
              ? ListingEnum.LEASE
              : ListingEnum.SALE,
          ...updatedComps[i],
          land_dimension: compComparisonBasis,
          ai_generated: 1,
        };

        // Add link property for sales upload mode
        if (showCheckboxes) {
          compPayload.link = selectedComps.includes(i);
        }

        // Add flags based on status and action
        if (
          uploadStatuses?.[i] === UploadStatusEnum.PENDING ||
          uploadStatuses?.[i] === ActionStatesEnum.UPLOAD_AS_NEW
        ) {
          compPayload.new = true;
        } else if (actionState === ActionStatesEnum.UPLOAD_AS_NEW) {
          compPayload.new = true;
        } else if (actionState === ActionStatesEnum.UPDATE_EXISTING) {
          compPayload.update = true;
        } else if (actionState === ActionStatesEnum.UPLOAD_ANYWAY) {
          compPayload.uploadAnyway = true;
        }

        // Set loading state for this specific row
        setRowLoaders((prev) => ({ ...prev, [i]: true }));

        try {
          const response = await axios.post(
            `comps/save-extracted-comp`,
            compPayload,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );

          if (response.data?.data?.statusCode === 200) {
            setUploadStatuses?.((prev) => ({
              ...prev,
              [i]: UploadStatusEnum.COMPLETED,
            }));
            // Store compId if this comp was linked
            if (selectedComps.includes(i)) {
              const compId = response.data?.data?.data?.compId;
              if (compId) {
                savedCompIds.push(compId);
              }
            }
            // Clear action state for successfully saved comp
            setActionStates((prev) => {
              const newStates = { ...prev };
              delete newStates[i];
              return newStates;
            });
          } else if (response.data?.data?.statusCode === 400) {
            hasErrors = true;
            const message =
              response.data?.data?.message || ErrorMessagesEnum.ERROR_OCCURRED;
            setUploadStatuses?.((prev) => ({ ...prev, [i]: message }));
          } else {
            hasErrors = true;
            const message =
              response.data?.data?.message || ErrorMessagesEnum.ERROR_OCCURRED;
            setUploadStatuses?.((prev) => ({ ...prev, [i]: message }));
          }

          // Clear row loader
          setRowLoaders((prev) => ({ ...prev, [i]: false }));
        } catch (error: any) {
          hasErrors = true;
          if (error.response?.status === 400) {
            const message =
              error.response?.data?.data?.message ||
              error.response?.data?.message ||
              ErrorMessagesEnum.ERROR_OCCURRED;
            setUploadStatuses?.((prev) => ({ ...prev, [i]: message }));
          } else {
            setUploadStatuses?.((prev) => ({
              ...prev,
              [i]: ErrorMessagesEnum.FAILED_TO_SAVE,
            }));
          }

          // Clear row loader on error
          setRowLoaders((prev) => ({ ...prev, [i]: false }));
        }
      }

      setUploadCompsStatus(true);

      // If no comps were processed (all skipped), navigate immediately
      if (!processedAnyComp) {
        // Navigate with empty data since all comps were skipped
        if (location.pathname.includes('/evaluation/upload-sales-comps')) {
          const urlParams = new URLSearchParams(location.search);
          const id = urlParams.get('id');
          const salesId = urlParams.get('salesId');
          if (id && salesId) {
            localStorage.setItem('updatedCompssales', JSON.stringify([]));
            navigate(`/evaluation/sales-approach?id=${id}&salesId=${salesId}`, {
              state: { updatedCompssales: [] },
            });
            return;
          }
        } else if (
          location.pathname.includes('/evaluation/upload-cost-comps')
        ) {
          const urlParams = new URLSearchParams(location.search);
          const id = urlParams.get('id');
          const costId = urlParams.get('costId');
          if (id && costId) {
            navigate(`/evaluation/cost-approach?id=${id}&costId=${costId}`);
            return;
          }
        } else if (
          location.pathname.includes('/evaluation/upload-lease-comps')
        ) {
          const urlParams = new URLSearchParams(location.search);
          const id = urlParams.get('id');
          const leaseId = urlParams.get('leaseId');
          if (id && leaseId) {
            navigate(`/evaluation/lease-approach?id=${id}&leaseId=${leaseId}`);
            return;
          }
        } else if (
          location.pathname.includes('/appraisal/upload-sales-comps')
        ) {
          const urlParams = new URLSearchParams(location.search);
          const id = urlParams.get('id');
          const salesId = urlParams.get('salesId');
          if (id && salesId) {
            navigate(`/sales-approach?id=${id}&salesId=${salesId}`);
            return;
          }
        } else if (location.pathname.includes('/appraisal/upload-cost-comps')) {
          const urlParams = new URLSearchParams(location.search);
          const id = urlParams.get('id');
          const costId = urlParams.get('costId');
          if (id && costId) {
            navigate(`/cost-approach?id=${id}&costId=${costId}`);
            return;
          }
        } else if (
          location.pathname.includes('/appraisal/upload-lease-comps')
        ) {
          const urlParams = new URLSearchParams(location.search);
          const id = urlParams.get('id');
          const leaseId = urlParams.get('leaseId');
          if (id && leaseId) {
            navigate(`/lease-approach?id=${id}&leaseId=${leaseId}`);
            return;
          }
        }
        navigate(-1);
        return;
      }

      // Handle navigation for sales upload mode
      if (showCheckboxes) {
        if (hasErrors) {
          toast.error(
            'Some comps failed to save. Please check the status column for details.'
          );
          return;
        }

        // Always navigate after processing, regardless of whether comps were linked or skipped
        // Fetch full comp data for linked comps using the new API or handle empty selection
        if (savedCompIds.length > 0) {
          try {
            const getCompsResponse = await axios.post(
              'evaluations/get-selected-comps/',
              { compIds: savedCompIds },
              { headers: { 'Content-Type': 'application/json' } }
            );

            const linkedComps = getCompsResponse.data?.data || [];

            // Handle different evaluation upload screens
            if (location.pathname.includes('/evaluation/upload-sales-comps')) {
              // Get evaluation data from location state or props
              const stateData = locationState || location.state || {};
              const {
                operatingExpenses,
                salesCompQualitativeAdjustment,
                appraisalSpecificAdjustment,
              } = stateData;

              // Get URL parameters
              const urlParams = new URLSearchParams(location.search);
              const id = urlParams.get('id');
              const salesId = urlParams.get('salesId');

              if (
                id &&
                salesId &&
                operatingExpenses &&
                salesCompQualitativeAdjustment
              ) {
                // Transform linked comps for sales approach
                const updatedCompssales = linkedComps.map(
                  ({ id: compId, ...restComp }: any) => ({
                    ...restComp,
                    comp_id: compId,
                    expenses:
                      operatingExpenses?.map((exp: any) => ({
                        ...exp,
                        adj_value: 0,
                        comparison_basis: 0,
                      })) || [],
                    quantitativeAdjustments:
                      salesCompQualitativeAdjustment?.map((qa: any) => ({
                        ...qa,
                        adj_value: 'Similar',
                      })) || [],
                    adjusted_psf: restComp.price_square_foot,
                  })
                );


                localStorage.setItem(
                  'updatedCompssales',
                  JSON.stringify(updatedCompssales)
                );

                // Get navigation data from global window object if available
                const globalNavData = (window as any).globalNavData || {};

                const navigationUrl = `/evaluation/TEST-NAVIGATION-WORKING?id=${id}&salesId=${salesId}`;
                const navigationState = {
                  updatedCompssales,
                  operatingExpenses:
                    globalNavData.operatingExpenses || operatingExpenses,
                  salesCompQualitativeAdjustment:
                    globalNavData.salesCompQualitativeAdjustment ||
                    salesCompQualitativeAdjustment,
                  appraisalSpecificAdjustment:
                    globalNavData.appraisalSpecificAdjustment ||
                    appraisalSpecificAdjustment,
                };

                navigate(navigationUrl, { state: navigationState });
                return;
              } else {
                // Handle case when no operatingExpenses or salesCompQualitativeAdjustment
                const updatedCompssales = linkedComps.map(
                  ({ id: compId, ...restComp }: any) => ({
                    ...restComp,
                    comp_id: compId,
                    expenses: [],
                    quantitativeAdjustments: [],
                    adjusted_psf: restComp.price_square_foot,
                  })
                );

                localStorage.setItem(
                  'updatedCompssales',
                  JSON.stringify(updatedCompssales)
                );
                const fallbackUrl = `/evaluation/TEST-FALLBACK-NAVIGATION?id=${id}&salesId=${salesId}`;
                const fallbackState = { updatedCompssales };

                navigate(fallbackUrl, { state: fallbackState });
                return;
              }
            } else if (
              location.pathname.includes('/evaluation/upload-cost-comps')
            ) {
              // Get evaluation data from location state
              const locationState = location.state || {};
              const { operatingExpenses } = locationState;

              // Get URL parameters
              const urlParams = new URLSearchParams(location.search);
              const id = urlParams.get('id');
              const costId = urlParams.get('costId');

              if (id && costId) {
                // Transform linked comps for cost approach
                const updatedComps = linkedComps.map(
                  ({ id: compId, ...restComp }: any) => ({
                    ...restComp,
                    comp_id: compId,
                    expenses:
                      operatingExpenses?.map((exp: any) => ({
                        ...exp,
                        adj_value: 0,
                        comparison_basis: 0,
                      })) || [],
                    adjusted_psf: restComp.price_square_foot,
                  })
                );

                navigate(
                  `/evaluation/cost-approach?id=${id}&costId=${costId}`,
                  {
                    state: { updatedComps },
                  }
                );
                return;
              }
            } else if (
              location.pathname.includes('/evaluation/upload-lease-comps')
            ) {
              // Get evaluation data from location state
              const locationState = location.state || {};
              const { operatingExpenses, salesCompQualitativeAdjustment } =
                locationState;

              // Get URL parameters
              const urlParams = new URLSearchParams(location.search);
              const id = urlParams.get('id');
              const leaseId = urlParams.get('leaseId');

              if (id && leaseId) {
                // Transform linked comps for lease approach
                const updatedComps = linkedComps.map(
                  ({ id: compId, ...restComp }: any) => ({
                    ...restComp,
                    comp_id: compId,
                    expenses:
                      operatingExpenses?.map((exp: any) => ({
                        ...exp,
                        adj_value: 0,
                        comparison_basis: 0,
                      })) || [],
                    quantitativeAdjustments:
                      salesCompQualitativeAdjustment?.map((qa: any) => ({
                        ...qa,
                        adj_value: 'Similar',
                      })) || [],
                    adjusted_psf: restComp.price_square_foot,
                  })
                );

                localStorage.setItem(
                  'updatedComps',
                  JSON.stringify(updatedComps)
                );
                navigate(
                  `/evaluation/lease-approach?id=${id}&leaseId=${leaseId}`,
                  {
                    state: { updatedComps },
                  }
                );
                return;
              }
            } else if (
              location.pathname.includes('/evaluation/upload-cap-comps')
            ) {
              // Get evaluation data from location state
              const locationState = location.state || {};
              const { operatingExpenses } = locationState;

              // Get URL parameters
              const urlParams = new URLSearchParams(location.search);
              const id = urlParams.get('id');
              const capId = urlParams.get('capId');

              if (id && capId) {
                // Transform linked comps for cap rate approach
                const updatedComps = linkedComps.map(
                  ({ id: compId, ...restComp }: any) => ({
                    ...restComp,
                    comp_id: compId,
                    expenses:
                      operatingExpenses?.map((exp: any) => ({
                        ...exp,
                        adj_value: 0,
                        comparison_basis: 0,
                      })) || [],
                    adjusted_psf: restComp.price_square_foot,
                  })
                );

                localStorage.setItem(
                  'updatedComps',
                  JSON.stringify(updatedComps)
                );
                navigate(`/evaluation/cap-approach?id=${id}&capId=${capId}`, {
                  state: { updatedComps },
                });
                return;
              }
            } else if (
              location.pathname.includes(
                '/evaluation/upload-multi-family-comps'
              )
            ) {
              // Get evaluation data from location state
              const locationState = location.state || {};
              const { operatingExpenses } = locationState;

              // Get URL parameters
              const urlParams = new URLSearchParams(location.search);
              const id = urlParams.get('id');
              const evaluationId = urlParams.get('evaluationId');

              if (id && evaluationId) {
                // Transform linked comps for multi-family approach
                const updatedComps = linkedComps.map(
                  ({ id: compId, ...restComp }: any) => ({
                    ...restComp,
                    comp_id: compId,
                    expenses:
                      operatingExpenses?.map((exp: any) => ({
                        ...exp,
                        adj_value: 0,
                        comparison_basis: 0,
                      })) || [],
                    adjusted_psf: restComp.price_square_foot,
                  })
                );

                localStorage.setItem(
                  'updatedComps',
                  JSON.stringify(updatedComps)
                );
                navigate(
                  `/evaluation/multi-family-approach?id=${id}&evaluationId=${evaluationId}`,
                  {
                    state: { updatedComps },
                  }
                );
                return;
              }
            } else if (
              location.pathname.includes('/appraisal/upload-sales-comps')
            ) {
              // Get appraisal data from location state
              const locationState = location.state || {};
              const {
                operatingExpenses,
                salesCompQualitativeAdjustment,
                appraisalSpecificAdjustment,
              } = locationState;

              // Get URL parameters
              const urlParams = new URLSearchParams(location.search);
              const id = urlParams.get('id');
              const salesId = urlParams.get('salesId');

              if (id && salesId) {
                // Transform linked comps for appraisal sales approach
                const updatedComps = linkedComps.map(
                  ({ id: compId, ...restComp }: any) => ({
                    ...restComp,
                    comp_id: compId,
                    expenses: (operatingExpenses || []).map((exp: any) => ({
                      ...exp,
                      adj_value: 0,
                      comparison_basis: 0,
                    })),
                    quantitativeAdjustments: (
                      salesCompQualitativeAdjustment || []
                    ).map((exp: any) => ({
                      ...exp,
                      adj_value: 'similar',
                      comparison_basis: 0,
                    })),
                    comparativeAdjustmentsList: (
                      appraisalSpecificAdjustment || []
                    ).map((exp: any) => ({
                      ...exp,
                      comparison_value: 0,
                      comparison_basis: 0,
                    })),
                    adjusted_psf: restComp.price_square_foot,
                  })
                );

                navigate(`/sales-approach?id=${id}&salesId=${salesId}`, {
                  state: { updatedComps },
                });
                return;
              }
            } else if (
              location.pathname.includes('/appraisal/upload-cost-comps')
            ) {
              // Get appraisal data from location state
              const locationState = location.state || {};
              const { operatingExpenses } = locationState;

              // Get URL parameters
              const urlParams = new URLSearchParams(location.search);
              const id = urlParams.get('id');
              const costId = urlParams.get('costId');

              if (id && costId) {
                // Transform linked comps for appraisal cost approach
                const updatedComps = linkedComps.map(
                  ({ id: compId, ...restComp }: any) => ({
                    ...restComp,
                    comp_id: compId,
                    expenses: (operatingExpenses || []).map((exp: any) => ({
                      ...exp,
                      adj_value: 0,
                      comparison_basis: 0,
                    })),
                    adjusted_psf: restComp.price_square_foot,
                  })
                );

                navigate(`/cost-approach?id=${id}&costId=${costId}`, {
                  state: { updatedComps },
                });
                return;
              }
            } else if (
              location.pathname.includes('/appraisal/upload-lease-comps')
            ) {
              // Get appraisal data from location state
              const locationState = location.state || {};
              const { operatingExpenses, salesCompQualitativeAdjustment } =
                locationState;

              // Get URL parameters
              const urlParams = new URLSearchParams(location.search);
              const id = urlParams.get('id');
              const leaseId = urlParams.get('leaseId');

              if (id && leaseId) {
                // Transform linked comps for appraisal lease approach
                const updatedComps = linkedComps.map(
                  ({ id: compId, ...restComp }: any) => ({
                    ...restComp,
                    comp_id: compId,
                    expenses: (operatingExpenses || []).map((exp: any) => ({
                      ...exp,
                      adj_value: 0,
                      comparison_basis: 0,
                    })),
                    quantitativeAdjustments: (
                      salesCompQualitativeAdjustment || []
                    ).map((exp: any) => ({
                      ...exp,
                      adj_value: 'similar',
                      comparison_basis: 0,
                    })),
                    adjusted_psf: restComp.price_square_foot,
                  })
                );

                navigate(`/lease-approach?id=${id}&leaseId=${leaseId}`, {
                  state: { updatedComps },
                });
                return;
              }
            }

            // Default navigation for other sales upload screens
            navigate(-1);
          } catch (error) {
            navigate(-1);
          }
        } else {
          // Handle case when no comps are linked (savedCompIds.length = 0)
          if (location.pathname.includes('/evaluation/upload-sales-comps')) {
            // Get URL parameters
            const urlParams = new URLSearchParams(location.search);
            const id = urlParams.get('id');
            const salesId = urlParams.get('salesId');

            if (id && salesId) {
              // Navigate with empty updatedCompssales
              const updatedCompssales: any[] = [];
              localStorage.setItem(
                'updatedCompssales',
                JSON.stringify(updatedCompssales)
              );
              const noCompsUrl = `/evaluation/TEST-NO-COMPS-NAVIGATION?id=${id}&salesId=${salesId}`;
              const noCompsState = { updatedCompssales };

              navigate(noCompsUrl, { state: noCompsState });
              return;
            }
          } else if (
            location.pathname.includes('/evaluation/upload-cost-comps')
          ) {
            const urlParams = new URLSearchParams(location.search);
            const id = urlParams.get('id');
            const costId = urlParams.get('costId');
            if (id && costId) {
              navigate(`/evaluation/cost-approach?id=${id}&costId=${costId}`);
              return;
            }
          } else if (
            location.pathname.includes('/evaluation/upload-lease-comps')
          ) {
            const urlParams = new URLSearchParams(location.search);
            const id = urlParams.get('id');
            const leaseId = urlParams.get('leaseId');
            if (id && leaseId) {
              navigate(
                `/evaluation/lease-approach?id=${id}&leaseId=${leaseId}`
              );
              return;
            }
          } else if (
            location.pathname.includes('/evaluation/upload-cap-comps')
          ) {
            const urlParams = new URLSearchParams(location.search);
            const id = urlParams.get('id');
            const capId = urlParams.get('capId');
            if (id && capId) {
              navigate(`/evaluation/cap-approach?id=${id}&capId=${capId}`);
              return;
            }
          } else if (
            location.pathname.includes('/evaluation/upload-multi-family-comps')
          ) {
            const urlParams = new URLSearchParams(location.search);
            const id = urlParams.get('id');
            const evaluationId = urlParams.get('evaluationId');
            if (id && evaluationId) {
              navigate(
                `/evaluation/multi-family-approach?id=${id}&evaluationId=${evaluationId}`
              );
              return;
            }
          } else if (
            location.pathname.includes('/appraisal/upload-sales-comps')
          ) {
            const urlParams = new URLSearchParams(location.search);
            const id = urlParams.get('id');
            const salesId = urlParams.get('salesId');
            if (id && salesId) {
              navigate(`/sales-approach?id=${id}&salesId=${salesId}`);
              return;
            }
          } else if (
            location.pathname.includes('/appraisal/upload-cost-comps')
          ) {
            const urlParams = new URLSearchParams(location.search);
            const id = urlParams.get('id');
            const costId = urlParams.get('costId');
            if (id && costId) {
              navigate(`/cost-approach?id=${id}&costId=${costId}`);
              return;
            }
          } else if (
            location.pathname.includes('/appraisal/upload-lease-comps')
          ) {
            const urlParams = new URLSearchParams(location.search);
            const id = urlParams.get('id');
            const leaseId = urlParams.get('leaseId');
            if (id && leaseId) {
              navigate(`/lease-approach?id=${id}&leaseId=${leaseId}`);
              return;
            }
          }
          navigate(-1);
        }
        return;
      }

      // Use the first comp's comparison_basis or land_dimension if available, otherwise fallback to 'SF'
      const firstComp =
        formik.values.comps && formik.values.comps.length > 0
          ? formik.values.comps[0]
          : {};
      const landDimensionValue =
        firstComp.comparison_basis || firstComp.land_dimension || UnitsEnum.SF;
      mutate({
        type:
          localStorage.getItem('property_type') === null
            ? 'sale'
            : localStorage.getItem('property_type') === 'salesCheckbox'
              ? 'sale'
              : 'lease',
        comp_type: localStorage.getItem(LocalStorageKeysEnum.ACTIVE_TYPE),
        land_dimension: landDimensionValue,
      });
    } catch (error: any) {
      // For sales upload mode, don't show generic error toasts
      // Individual comp errors are already handled in the processing loop
      if (!showCheckboxes) {
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
    }
  };

  const tableColumns = useMemo(() => {
    // Map of dropdown fields to their custom field
    const customFieldMap: Record<string, string> = {
      condition: CustomFieldsEnum.CONDITION,
      building_sub_type: CustomFieldsEnum.BUILDING_SUB_TYPE,
      parking: CustomFieldsEnum.PARKING,
      topography: CustomFieldsEnum.TOPOGRAPHY,
      land_type: CustomFieldsEnum.LAND_TYPE,
      frontage: CustomFieldsEnum.FRONTAGE,
      electrical: CustomFieldsEnum.ELECTRICAL,
      exterior: CustomFieldsEnum.EXTERIOR,
      roof: CustomFieldsEnum.ROOF,
      garage: CustomFieldsEnum.GARAGE,
      heating_cooling: CustomFieldsEnum.HEATING_COOLING,
      plumbing: CustomFieldsEnum.PLUMBING,
      windows: CustomFieldsEnum.WINDOWS,
      fencing: CustomFieldsEnum.FENCING,
      fireplace: CustomFieldsEnum.FIREPLACE,
      utilities_select: CustomFieldsEnum.UTILITIES_SELECT,
      topography_select: CustomFieldsEnum.TOPOGRAPHY_SELECT,
    };

    // Start with required columns, then add dynamic columns
    const baseColumns = [...requiredColumns];
    const dynamicColumns = Object.keys(columnHeaders).filter((key) =>
      formik.values.comps.some((row: CompRow) => key in row)
    );

    // Build the final columns array, inserting custom fields after their parent
    const finalColumns: string[] = [];
    for (const col of baseColumns.concat(dynamicColumns)) {
      // Avoid duplicates and hide latitude/longitude fields
      if (
        finalColumns.includes(col) ||
        col === ListingEnum.LATITUDE ||
        col === ListingEnum.LONGITUDE
      )
        continue;
      finalColumns.push(col);
      // If this column has a custom field, and any row has CustomFieldValuesEnum.TYPE_MY_OWN, insert the custom field after it
      const customField = customFieldMap[col];
      if (
        customField &&
        formik.values.comps.some(
          (row: CompRow) =>
            row[col as keyof CompRow] === CustomFieldValuesEnum.TYPE_MY_OWN ||
            row[col as keyof CompRow] ===
            CustomFieldValuesEnum.TYPE_MY_OWN_LOWER
        )
      ) {
        finalColumns.push(customField);
      }
    }
    return finalColumns;
  }, [requiredColumns, formik.values.comps, columnHeaders]);

  const { totalGroups, currentColumns } = useMemo(() => {
    const columnsPerPage = 6;
    const totalGroups = Math.ceil(tableColumns.length / columnsPerPage);
    const currentColumns = tableColumns.slice(
      currentColumnGroup * columnsPerPage,
      (currentColumnGroup + 1) * columnsPerPage
    );
    return { totalGroups, currentColumns };
  }, [tableColumns, currentColumnGroup]);

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
    <Box sx={{ position: 'relative' }}>
      {validationLoader && (
        <div
          className="img-update-loader"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            zIndex: 9999,
          }}
        >
          <img src={loadingImage} alt="Loading..." />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Validating data...
          </p>
        </div>
      )}

      <TableContainer
        sx={{
          maxHeight: 'calc(100vh - 120px)',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #E5E7EB',
          overflowX: 'auto',
        }}
        className="table-wrapper h-auto"
      >
        <Table
          stickyHeader
          aria-label="sticky table"
          sx={{ borderCollapse: 'separate' }}
        >
          <TableHead>
            <TableRow>
              {showCheckboxes && (
                <TableCell
                  className="text-nowrap"
                  sx={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                    width: '100px',
                    minWidth: '100px',
                    maxWidth: '100px',
                    backgroundColor: '#F8FAFC',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#374151',
                    borderBottom: '2px solid #E5E7EB',
                    padding: '16px 12px',
                  }}
                >
                  {UILabelsEnum.LINK_COMP}
                </TableCell>
              )}

              <TableCell
                className="text-nowrap"
                sx={{
                  position: 'sticky',
                  left: showCheckboxes ? '100px' : '0px',
                  zIndex: 3,
                  width: '120px',
                  minWidth: '120px',
                  maxWidth: '120px',
                  backgroundColor: '#F8FAFC',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '2px solid #E5E7EB',
                  padding: '16px 12px',
                }}
              >
                Attribute
              </TableCell>

              <TableCell
                className="text-nowrap"
                sx={{
                  position: 'sticky',
                  left: showCheckboxes ? '220px' : '120px',
                  zIndex: 10,
                  width: '200px',
                  minWidth: '200px',
                  maxWidth: '200px',
                  backgroundColor: '#F8FAFC',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#374151',
                  borderBottom: '2px solid #E5E7EB',
                  padding: '16px 12px',
                }}
              >
                Status
              </TableCell>

              {hasActionDropdowns && (
                <TableCell
                  className="text-nowrap"
                  sx={{
                    position: 'sticky',
                    left: showCheckboxes ? '420px' : '320px',
                    zIndex: 3,
                    width: '150px',
                    minWidth: '150px',
                    maxWidth: '150px',
                    backgroundColor: '#F8FAFC',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: '#374151',
                    borderBottom: '2px solid #E5E7EB',
                    padding: '16px 12px',
                  }}
                >
                  Action
                </TableCell>
              )}
              {tableColumns.map((col) => {
                const isLease =
                  localStorage.getItem(LocalStorageEnum.CHECK_TYPE) ===
                  LocalStorageEnum.LEASES_CHECKBOX;
                let displayColumn =
                  isLease && col === ListingEnum.DATE_SOLD
                    ? CreateCompsEnum.Transaction_date
                    : col;

                const columnMappings: Record<string, string> = {
                  summary: ColumnHeaderLabelsEnum.SUMMARY,
                  net_operating_income:
                    ColumnHeaderLabelsEnum.NET_OPERATING_INCOME,
                  utilities_select: ColumnHeaderLabelsEnum.UTILITIES_SELECT,
                  utilities_select_custom:
                    ColumnHeaderLabelsEnum.UTILITIES_SELECT_CUSTOM,
                  topography: ColumnHeaderLabelsEnum.TOPOGRAPHY,
                  topography_custom: ColumnHeaderLabelsEnum.TOPOGRAPHY_CUSTOM,
                  space: ColumnHeaderLabelsEnum.SPACE,
                  est_land_value: ColumnHeaderLabelsEnum.EST_LAND_VALUE,
                  location_desc: ColumnHeaderLabelsEnum.LOCATION_DESC,
                  asking_rent_unit: ColumnHeaderLabelsEnum.ASKING_RENT_UNIT,
                  TI_allowance_unit: ColumnHeaderLabelsEnum.TI_ALLOWANCE_UNIT,
                  date_list: ColumnHeaderLabelsEnum.DATE_LIST,
                  date_expiration: ColumnHeaderLabelsEnum.DATE_EXPIRATION,
                  date_commencement: ColumnHeaderLabelsEnum.DATE_COMMENCEMENT,
                  date_execution: ColumnHeaderLabelsEnum.DATE_EXECUTION,
                  est_building_value: ColumnHeaderLabelsEnum.EST_BUILDING_VALUE,
                  free_rent: ColumnHeaderLabelsEnum.FREE_RENT,
                  term: ColumnHeaderLabelsEnum.TERM,
                  cam: ColumnHeaderLabelsEnum.CAM,
                  street_suite: ColumnHeaderLabelsEnum.STREET_SUITE,
                  basement_finished_sq_ft:
                    ColumnHeaderLabelsEnum.BASEMENT_FINISHED_SQ_FT,
                  basement_unfinished_sq_ft:
                    ColumnHeaderLabelsEnum.BASEMENT_UNFINISHED_SQ_FT,
                  gross_living_sq_ft: ColumnHeaderLabelsEnum.GROSS_LIVING_SQ_FT,
                  weight_sf: ColumnHeaderLabelsEnum.WEIGHT_SF,
                  cap_rate: ColumnHeaderLabelsEnum.CAP_RATE,
                  legal_desc: ColumnHeaderLabelsEnum.LEGAL_DESC,
                  operating_expense_psf:
                    ColumnHeaderLabelsEnum.OPERATING_EXPENSE_PSF,
                  parcel_id_apn: 'Parcel #',
                  date_sold:
                    checkType === 'leasesCheckbox' ||
                      approachType === 'leaseCheck'
                      ? CreateCompsEnum.TRANSACTION_DATE
                      : CreateCompsEnum.DATE_SOLD,
                  acquirer_type:
                    checkType === 'leasesCheckbox' ||
                      approachType === 'leaseCheck'
                      ? SellerBuyierEnum.TENANT_TYPE
                      : SellerBuyierEnum.BUYER_TYPE,
                  offeror_type:
                    checkType === 'leasesCheckbox' ||
                      approachType === 'leaseCheck'
                      ? SellerBuyierEnum.LANDLORD_TYPE
                      : SellerBuyierEnum.SELLER_TYPE,
                };

                if (columnMappings[col]) {
                  displayColumn = columnMappings[col];
                }

                return (
                  <TableCell
                    key={col}
                    className="table-cell-header"
                    sx={{
                      minWidth: '180px',
                      backgroundColor: '#F8FAFC',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#374151',
                      borderBottom: '2px solid #E5E7EB',
                      padding: '16px 12px',
                    }}
                  >
                    {(typeof displayColumn === 'string'
                      ? displayColumn
                      : String(displayColumn)
                    )
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (char) => char.toUpperCase())}{' '}
                    {requiredColumns.includes(col) && (
                      <span className="required-asterisk">*</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody className="h-[90px]">
            {formik.values?.comps.map(
              (row: CompsFormValues['comps'][number], index: number) => (
                <TableRow
                  className="align-center"
                  key={row && row.id ? String(row.id) : `row-${index}`}
                  sx={{
                    '&:nth-of-type(even)': {
                      backgroundColor: '#FAFBFC',
                    },
                    '&:hover': {
                      backgroundColor: '#F1F5F9',
                    },
                    borderBottom: '1px solid #E5E7EB',
                  }}
                >
                  {showCheckboxes && (
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        width: '60px',
                        minWidth: '60px',
                        maxWidth: '60px',
                        padding: '8px 6px',
                        backgroundColor: 'white',
                        borderRight: '1px solid #E5E7EB',
                        textAlign: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedComps.includes(index)}
                        disabled={
                          uploadStatuses[index] === UploadStatusEnum.SKIPPED ||
                          actionStates[index] === ActionStatesEnum.SKIP
                        }
                        onChange={(e) =>
                          handleCheckboxChange(index, e.target.checked)
                        }
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor:
                            uploadStatuses[index] ===
                              UploadStatusEnum.SKIPPED ||
                              actionStates[index] === ActionStatesEnum.SKIP
                              ? 'not-allowed'
                              : 'pointer',
                          opacity:
                            uploadStatuses[index] ===
                              UploadStatusEnum.SKIPPED ||
                              actionStates[index] === ActionStatesEnum.SKIP
                              ? 0.5
                              : 1,
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell
                    className="text-nowrap"
                    sx={{
                      background:
                        'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '13px',
                      padding: '8px 6px',
                      borderRight: '1px solid #E5E7EB',
                      position: 'sticky',
                      left: showCheckboxes ? '100px' : '0px', // ✅ FIXED OFFSET
                      zIndex: 2,
                      width: '120px',
                      minWidth: '120px',
                      maxWidth: '120px',
                      textAlign: 'center',
                    }}
                  >
                    {rowLoaders[index] ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                        }}
                      >
                        <Box
                          sx={{
                            width: '24px',
                            height: '24px',
                            border: '3px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '3px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',

                            // ✅ Correct MUI keyframes syntax
                            '@keyframes spin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' },
                            },
                          }}
                        />
                        <span style={{ fontWeight: 'bold' }}>Saving...</span>
                      </Box>
                    ) : (
                      `Comp ${index + 1}`
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: showCheckboxes ? '220px' : '120px', // ✅ corrected offset
                      zIndex: 4,
                      width: '200px',
                      minWidth: '200px',
                      maxWidth: '200px',
                      padding: '8px 6px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      borderRight: hasActionDropdowns
                        ? '1px solid #E5E7EB'
                        : 'none',
                    }}
                  >
                    {(() => {
                      const status = uploadStatuses[index];
                      const isCompExists = status?.includes(
                        UploadStatusEnum.ALREADY_EXIST
                      );
                      const isRequiredError =
                        status === UploadStatusEnum.MISSING_REQUIRED_FIELDS;
                      const isAddressError =
                        status?.includes(UploadStatusEnum.INVALID_ADDRESS) ||
                        status?.includes(
                          UploadStatusEnum.ADDRESS_VALIDATION_FAILED
                        );

                      // Comp already exists - Orange theme with warning triangle
                      if (isCompExists) {
                        return (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              backgroundColor: '#FFF4E0',
                              color: '#B45E00',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 500,
                              border: '1px solid #FFB85C',
                            }}
                          >
                            <Icons.WarningIcon sx={{ fontSize: '16px' }} />
                            <span>Comp already exists</span>
                          </Box>
                        );
                      }

                      // Required field errors - Red theme with error circle
                      if (isRequiredError) {
                        return (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              backgroundColor: '#FDE7E7',
                              color: '#C70000',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 500,
                              border: '1px solid #FFADAD',
                            }}
                          >
                            <Icons.ErrorIcon sx={{ fontSize: '16px' }} />
                            <span>Missing Required Fields</span>
                          </Box>
                        );
                      }

                      // Address validation failed - Red theme with map pin off
                      if (isAddressError) {
                        return (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              backgroundColor: '#FFECEC',
                              color: '#B30000',
                              padding: '8px 12px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              fontWeight: 500,
                              border: '1px solid #FF9A9A',
                            }}
                          >
                            <Icons.MapPinOff sx={{ fontSize: '14px' }} />
                            <span>Address validation failed</span>
                          </Box>
                        );
                      }

                      // Upload as new - Green theme with check circle
                      if (status === UploadStatusEnum.UPLOAD_AS_NEW) {
                        return (
                          <div className="flex items-center gap-2 bg-[#E9F9EC] border border-[#8ADE93] text-[#1E7A3F] px-3 py-1 rounded-xl">
                            <Icons.CheckCircle sx={{ fontSize: 14 }} />
                            <span>{UploadStatusEnum.UPLOAD_AS_NEW}</span>
                          </div>
                        );
                      }

                      // Default status styling for other states
                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: (() => {
                              if (!status) return '#FEF3C7'; // Pending - yellow
                              if (status === UploadStatusEnum.COMPLETED)
                                return '#D1FAE5'; // Completed - light green
                              if (status === UploadStatusEnum.SKIPPED)
                                return '#F3F4F6'; // Skipped - light gray
                              return 'transparent'; // Other statuses
                            })(),
                            color: (() => {
                              if (!status) return '#92400E'; // Pending - dark orange
                              if (status === UploadStatusEnum.COMPLETED)
                                return '#059669'; // Completed - dark green text
                              if (status === UploadStatusEnum.SKIPPED)
                                return '#6B7280'; // Skipped - gray text
                              return '#6B7280'; // Other statuses
                            })(),
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: (() => {
                              if (!status) return '1px solid #F59E0B';
                              if (status === UploadStatusEnum.COMPLETED)
                                return '1px solid #10B981';
                              if (status === UploadStatusEnum.SKIPPED)
                                return '1px solid #9CA3AF';
                              return '1px solid transparent';
                            })(),
                          }}
                        >
                          <Box
                            sx={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: (() => {
                                if (!status) return '#F59E0B'; // Pending - orange dot
                                if (status === UploadStatusEnum.COMPLETED)
                                  return '#10B981'; // Completed - green dot
                                if (status === UploadStatusEnum.SKIPPED)
                                  return '#9CA3AF'; // Skipped - gray dot
                                return 'transparent'; // Other statuses - no dot
                              })(),
                            }}
                          />
                          {status || UploadStatusEnum.PENDING}
                        </Box>
                      );
                    })()}
                  </TableCell>
                  {hasActionDropdowns && (
                    <TableCell
                      sx={{
                        position: 'sticky',
                        left: showCheckboxes ? '420px' : '320px',
                        zIndex: 2,
                        width: '150px',
                        minWidth: '170px',
                        maxWidth: '150px',
                        padding: fieldErrors[index]?.['action']
                          ? '8px 6px 24px 6px'
                          : '8px 6px',
                        backgroundColor: 'white',
                        borderRight: '1px solid #E5E7EB',
                      }}
                    >
                      {(() => {
                        const status = uploadStatuses[index];
                        const actionState = actionStates[index];
                        // Show dropdown for this specific row if it has error status OR has action selected
                        // BUT NOT for Missing Required Fields status
                        const shouldShowDropdown =
                          status?.includes(UploadStatusEnum.ALREADY_EXIST) ||
                          status?.includes(UploadStatusEnum.INVALID_ADDRESS) ||
                          status?.includes(
                            UploadStatusEnum.ADDRESS_VALIDATION_FAILED
                          ) ||
                          (actionState &&
                            status !==
                            UploadStatusEnum.MISSING_REQUIRED_FIELDS); // Show dropdown if any action has been selected, but not for missing fields

                        if (shouldShowDropdown) {
                          const options = status?.includes(
                            `${UploadStatusEnum.ALREADY_EXIST}`
                          )
                            ? [
                              ActionStatesEnum.UPDATE_EXISTING,
                              ActionStatesEnum.UPLOAD_AS_NEW,
                              ActionStatesEnum.SKIP,
                            ]
                            : [
                              ActionStatesEnum.UPLOAD_ANYWAY,
                              ActionStatesEnum.SKIP,
                            ];

                          // const isAddressValidationFailed = status.includes(
                          //   'Address validation failed'
                          // );
                          // const touchedComps = Array.isArray(
                          //   formik.touched.comps
                          // )
                          //   ? formik.touched.comps
                          //   : [];
                          // const hasAddressFieldsChanged =
                          //   touchedComps[index]?.street_address ||
                          //   touchedComps[index]?.city ||
                          //   touchedComps[index]?.state ||
                          //   touchedComps[index]?.zipcode;

                          return (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                minHeight: '40px',
                                position: 'sticky',
                              }}
                            >
                              <FormControl size="small" fullWidth>
                                <Select
                                  value={actionStates[index] || ''}
                                  onChange={(e) => {
                                    const selectedAction = e.target.value;

                                    setActionStates((prev) => ({
                                      ...prev,
                                      [index]: selectedAction,
                                    }));

                                    // Don't change status when Skip is selected - keep original status

                                    // Clear action field error
                                    setFieldErrors((prev) => {
                                      const newErrors = { ...prev };
                                      if (newErrors[index]) {
                                        delete newErrors[index]['action'];
                                        if (
                                          Object.keys(newErrors[index])
                                            .length === 0
                                        ) {
                                          delete newErrors[index];
                                        }
                                      }
                                      return newErrors;
                                    });
                                  }}
                                  displayEmpty
                                  disabled={false}
                                  sx={{
                                    fontSize: '13px',
                                    '& .MuiOutlinedInput-root': {
                                      fontSize: '14px',
                                    },
                                  }}
                                >
                                  <MenuItem value="" disabled>
                                    {UILabelsEnum.SELECT_ACTION}
                                  </MenuItem>
                                  {options.map((option) => (
                                    <MenuItem
                                      key={option}
                                      value={option}
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {option}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              {fieldErrors[index]?.['action'] && (
                                <Box
                                  sx={{
                                    color: '#ef4444',
                                    fontSize: '11px',
                                    marginTop: '4px',
                                    position: 'absolute',
                                    bottom: '-20px',
                                    left: 0,
                                    whiteSpace: 'nowrap',
                                    zIndex: 10,
                                  }}
                                >
                                  {fieldErrors[index]['action']}
                                </Box>
                              )}
                            </Box>
                          );
                        }
                        return null;
                      })()}
                    </TableCell>
                  )}
                  {tableColumns.map((col) => (
                    <TableCell
                      key={col}
                      className="table-cell-border min-w-40"
                      sx={{
                        minWidth: '180px',
                        padding: '8px 6px',
                        borderRight: '1px solid #E5E7EB',
                        fontSize: '14px',
                      }}
                    >
                      {dateFields.includes(col) ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            minHeight: '40px',
                            marginTop: '4px',
                            position: 'relative',
                          }}
                        >
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
                          {(() => {
                            const hasError = fieldErrors[index]?.[col];

                            // Only show the error if the current value is actually empty
                            const value = row[col];
                            const isEmpty =
                              value === undefined ||
                              value === null ||
                              (typeof value === 'string' &&
                                value.trim() === '');

                            if (!hasError || !isEmpty) return null;

                            return (
                              <Box
                                sx={{
                                  color: '#ef4444',
                                  fontSize: '11px',
                                  marginTop: '2px',
                                  position: 'absolute',
                                  bottom: '-18px',
                                  left: 0,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {fieldErrors[index][col]}
                              </Box>
                            );
                          })()}
                        </Box>
                      ) : dropdownColumns.includes(col) ? (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection:
                              (col === CreateCompsEnum.TOPOGRAPHY &&
                                row[col] ===
                                CustomFieldValuesEnum.TYPE_MY_OWN) ||
                                (col === CreateCompsEnum.FRONTAGE &&
                                  row[col] === CustomFieldValuesEnum.TYPE_MY_OWN)
                                ? 'column'
                                : 'row',
                            alignItems: 'center',
                            minHeight: '40px',
                            gap:
                              (col === CreateCompsEnum.TOPOGRAPHY &&
                                row[col] ===
                                CustomFieldValuesEnum.TYPE_MY_OWN) ||
                                (col === CreateCompsEnum.FRONTAGE &&
                                  row[col] === CustomFieldValuesEnum.TYPE_MY_OWN)
                                ? '8px'
                                : '0',
                          }}
                        >
                          <CompSelectField
                            index={index}
                            col={col}
                            totalGroups={totalGroups}
                            currentColumns={currentColumns}
                            row={row}
                            formik={formik}
                            handleFieldChange={handleFieldChange}
                            currentColumnGroup={currentColumnGroup}
                            setCurrentColumnGroup={setCurrentColumnGroup}
                          />
                          {col === CreateCompsEnum.TOPOGRAPHY &&
                            row[col] ===
                            CustomFieldValuesEnum.TYPE_MY_OWN_LOWER && (
                              <CompTextField
                                index={index}
                                col={SiteDetailsEnum.TOPOGRAPHY_CUSTOM}
                                row={row}
                                formik={formik}
                                handleFieldChange={handleFieldChange}
                                placeholder={
                                  CustomFieldMappingsEnum.ENTER_CUSTOM_TOPOGRAPHY
                                }
                              />
                            )}
                          {col === 'frontage' &&
                            row[col] === CustomFieldValuesEnum.TYPE_MY_OWN && (
                              <CompTextField
                                index={index}
                                col={CustomFieldsEnum.FRONTAGE}
                                row={row}
                                formik={formik}
                                handleFieldChange={handleFieldChange}
                                placeholder={
                                  FieldNamesEnum.ENTER_CUSTOM_FRONTAGE
                                }
                              />
                            )}
                          {/* Only render custom land type input once, not as extra field */}
                          {col === FieldNamesEnum.LAND_TYPE &&
                            row[col] === CustomFieldValuesEnum.TYPE_MY_OWN &&
                            !tableColumns.includes(
                              CustomFieldsEnum.LAND_TYPE
                            ) && (
                              <Box sx={{ position: 'relative', width: '100%' }}>
                                <CompTextField
                                  index={index}
                                  col={SiteDetailsEnum.LAND_TYPE_CUSTOM}
                                  row={row}
                                  formik={formik}
                                  handleFieldChange={handleFieldChange}
                                  placeholder={
                                    SiteDetailsEnum.ENTER_CUSTOM_LAND_TYPE
                                  }
                                />
                                {fieldErrors[index]?.[
                                  SiteDetailsEnum.LAND_TYPE_CUSTOM
                                ] && (
                                    <Box
                                      sx={{
                                        color: '#ef4444',
                                        fontSize: '11px',
                                        marginTop: '2px',
                                        position: 'absolute',
                                        bottom: '-16px',
                                        left: 0,
                                      }}
                                    >
                                      {
                                        fieldErrors[index][
                                        SiteDetailsEnum.LAND_TYPE_CUSTOM
                                        ]
                                      }
                                    </Box>
                                  )}
                              </Box>
                            )}
                          {(() => {
                            const hasError = fieldErrors[index]?.[col];

                            // Only show the error if the current value is actually empty
                            const value = row[col];
                            const isEmpty =
                              value === undefined ||
                              value === null ||
                              (typeof value === 'string' &&
                                value.trim() === '');

                            if (!hasError || !isEmpty) return null;

                            return (
                              <Box
                                sx={{
                                  color: '#ef4444',
                                  fontSize: '11px',
                                  marginTop: '2px',
                                  position: 'absolute',
                                  bottom: '4px',
                                  left: 8,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {fieldErrors[index][col]}
                              </Box>
                            );
                          })()}
                        </Box>
                      ) : col === FieldNamesEnum.STREET_ADDRESS ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            minHeight: '40px',
                            position: 'relative',
                          }}
                        >
                          <AddressAutocomplete
                            value={String(row[col] || '')}
                            placeholder={UILabelsEnum.ENTER_STREET_ADDRESS}
                            onAddressSelected={(location: any) => {
                              if (
                                location.geometry &&
                                location.geometry.lat !== 0 &&
                                location.geometry.lng !== 0
                              ) {
                                const updatedComps = [...formik.values.comps];

                                const updatedRow = {
                                  ...updatedComps[index],
                                  street_address: location.address,
                                  city: location.city,
                                  state: location.state?.toLowerCase(),
                                  zipcode: location.zipCode,
                                  county: location.county,
                                  geometry: location.geometry,
                                };

                                updatedComps[index] = updatedRow;

                                // update formik
                                formik.setFieldValue('comps', updatedComps);

                                // ✅ immediately recompute required-field errors for this row
                                //    this clears city/state errors as soon as they are auto-filled
                                validateSingleRowRequiredFields(
                                  index,
                                  updatedRow,
                                  true
                                );

                                // ✅ keep API validation debounced for the address
                                handleAddressFieldDebounce(
                                  index,
                                  FieldNamesEnum.STREET_ADDRESS,
                                  updatedRow
                                );
                              } else {
                                // manual address text (no geometry)
                                handleFieldChange(
                                  index,
                                  FieldNamesEnum.STREET_ADDRESS,
                                  location.address
                                );
                              }
                            }}
                            onManualInput={(value: string) => {
                              handleFieldChange(
                                index,
                                FieldNamesEnum.STREET_ADDRESS,
                                value
                              );
                            }}
                          />

                          {(() => {
                            const hasError = fieldErrors[index]?.[col];

                            // Only show the error if the current value is actually empty
                            const value = row[col];
                            const isEmpty =
                              value === undefined ||
                              value === null ||
                              (typeof value === 'string' &&
                                value.trim() === '');

                            if (!hasError || !isEmpty) return null;

                            return (
                              <Box
                                sx={{
                                  color: '#ef4444',
                                  fontSize: '11px',
                                  marginTop: '2px',
                                  position: 'absolute',
                                  bottom: '-20px',
                                  left: 0,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {fieldErrors[index][col]}
                              </Box>
                            );
                          })()}
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            minHeight: '40px',
                            position: 'relative',
                          }}
                        >
                          <CompTextField
                            index={index}
                            col={col}
                            row={row}
                            formik={formik}
                            handleFieldChange={handleFieldChange}
                          />
                          {(() => {
                            const hasError = fieldErrors[index]?.[col];

                            // Only show the error if the current value is actually empty
                            const value = row[col];
                            const isEmpty =
                              value === undefined ||
                              value === null ||
                              (typeof value === 'string' &&
                                value.trim() === '');

                            if (!hasError || !isEmpty) return null;

                            return (
                              <Box
                                sx={{
                                  color: '#ef4444',
                                  fontSize: '11px',
                                  marginTop: '2px',
                                  position: 'absolute',
                                  bottom: '-20px',
                                  left: 0,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {fieldErrors[index][col]}
                              </Box>
                            );
                          })()}
                        </Box>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!hideSaveButton && (
        <Box
          sx={{
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
            disabled={!saveButtonEnabled}
            sx={{
              width: '160px',
              height: '50px',
              background: saveButtonEnabled ? '#0DA1C7' : '#9CA3AF',
              '&:disabled': {
                color: 'white',
                opacity: 0.6,
              },
            }}
          >
            Save
          </Button>
        </Box>
      )}
      {hideSaveButton && (
        <Button
          style={{ display: 'none' }}
          onClick={saveComps}
          disabled={!saveButtonEnabled}
          data-save-button
        />
      )}
    </Box>
  );
};

export default CompsTable;
