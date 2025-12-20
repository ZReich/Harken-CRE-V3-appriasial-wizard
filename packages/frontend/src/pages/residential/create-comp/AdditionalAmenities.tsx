import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { useFormikContext } from 'formik';
import { ResidentialCreateComp } from '@/components/interface/residential-create-comp';
import { ResidentialComponentHeaderEnum } from '../enum/ResidentialEnum';
const names = [
  'Patio (Uncovered)',
  'Patio (Covered)',
  'Deck (Uncovered)',
  'Deck (Covered)',
  'Underground Sprinklers',
  'Shed',
  'Pool',
  'Hot Tub',
  'Outdoor Kitchen',
  'Landscaping',
];

export default function AdditionalAmenities({ updateData }: any) {
  const { setFieldValue } = useFormikContext<ResidentialCreateComp>();
  const [personName, setPersonName] = React.useState<string[]>([
    ResidentialComponentHeaderEnum.NO_ADDITIONAL_AMENITIES,
  ]);

  React.useEffect(() => {
    if (updateData?.id) {
      if (
        !updateData.res_comp_amenities ||
        updateData.res_comp_amenities.length === 0
      ) {
        setFieldValue('additional_amenities', [
          ResidentialComponentHeaderEnum.NO_ADDITIONAL_AMENITIES,
        ]);
        setPersonName([ResidentialComponentHeaderEnum.NO_ADDITIONAL_AMENITIES]);
      } else {
        const res_comp_amenities = updateData.res_comp_amenities.map(
          (ele: { additional_amenities: any }) => ele.additional_amenities
        );
        setFieldValue('additional_amenities', res_comp_amenities);
        setPersonName(res_comp_amenities);
      }
    }
  }, [updateData?.id, updateData?.res_comp_amenities, setFieldValue]);
  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;

    let newPersonNames = typeof value === 'string' ? value.split(',') : value;

    // Remove "No Included Utilities" if any other options are selected
    if (
      newPersonNames.includes('No Additional Amenities') &&
      newPersonNames.length > 1
    ) {
      newPersonNames = newPersonNames.filter(
        (name) => name !== 'No Additional Amenities'
      );
    }

    // If no options are selected, add "No Included Utilities"
    if (newPersonNames.length === 0) {
      newPersonNames.push('No Additional Amenities');
    }

    setPersonName(newPersonNames);
    setFieldValue('additional_amenities', newPersonNames);
  };
  return (
    <div>
      <FormControl sx={{ width: '100%' }}>
        <InputLabel
          id="demo-multiple-checkbox-label"
          className="text-customGray mt-[6px] ml-[-16px]"
        >
          {ResidentialComponentHeaderEnum.ADDITIONAL_AMENITIES}
        </InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          variant="standard"
          name={ResidentialComponentHeaderEnum.INCLUDED_UTILITIES}
          multiple
          value={personName}
          onChange={handleChange}
          renderValue={(selected) => selected.join(', ')}
        >
          {/* "No Included Utilities" with cursor pointer */}
          <MenuItem
            className="text-slate-300"
            value="No Additional Amenities"
            style={{ cursor: 'pointer' }} // Ensure the cursor is pointer
          >
            <Checkbox disabled />
            <ListItemText
              primary={ResidentialComponentHeaderEnum.NO_ADDITIONAL_AMENITIES}
            />
          </MenuItem>
          {/* Other utility options */}
          {names.map((name) => (
            <MenuItem key={name} value={name} style={{ cursor: 'pointer' }}>
              {' '}
              {/* Add cursor: pointer */}
              <Checkbox checked={personName.indexOf(name) > -1} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
