export const createHandleFieldChange = (
  formik: any,
  requiredColumns: string[],
  setUpdatedComps: any
) => {
  let toastDisplayed = false;

  return (index: number, field: string, value: any) => {
    const selectedCount = formik.values.comps.filter(
      (comp: any) => comp.selected
    ).length;
    const newTotalSelected = value ? selectedCount + 1 : selectedCount - 1;

    if (field === 'selected' && value && newTotalSelected > 4) {
      if (!toastDisplayed) {
        toastDisplayed = true;
        setTimeout(() => {
          toastDisplayed = false;
        }, 2000);
      }
      return;
    }

    formik.setFieldValue(`comps.${index}.${field}`, value, true); // set validate = true to run validation immediately

    // Reset _custom field if needed
    if (
      [
        'condition',
        'topography',
        'parking',
        'building_sub_type',
        'frontage',
        'lot_shape',
      ].includes(field) &&
      value !== 'Type My Own'
    ) {
      formik.setFieldValue(`comps.${index}.${field}_custom`, '', true);
    }

    // Mark the field as touched and run validation
    formik.setFieldTouched(`comps.${index}.${field}`, true, true);

    // Force validation to run immediately for this specific field
    formik.validateField(`comps.${index}.${field}`);

    // If this is a required field and now has a value, clear any errors
    if (
      requiredColumns.includes(field) &&
      value !== '' &&
      value !== null &&
      value !== undefined
    ) {
      // Remove the error for this field
      if (
        formik.errors.comps &&
        formik.errors.comps[index] &&
        formik.errors.comps[index][field]
      ) {
        const newErrors = { ...formik.errors };
        if (newErrors.comps && newErrors.comps[index]) {
          delete newErrors.comps[index][field];
        }
        formik.setErrors(newErrors);
      }

      // Force a re-render to update the UI
      setUpdatedComps([...formik.values.comps]);
    }
  };
};
