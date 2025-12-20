
// import * as React from 'react';
// import InputLabel from '@mui/material/InputLabel';
// import MenuItem from '@mui/material/MenuItem';
// import FormControl from '@mui/material/FormControl';
// import ListItemText from '@mui/material/ListItemText';
// import Select, { SelectChangeEvent } from '@mui/material/Select';
// import Checkbox from '@mui/material/Checkbox';
// import { useFormikContext } from 'formik';

// const names = ['Electricity', 'Water', 'Sewer', 'Gas'];

// export default function IncludedUtilities({ passData }: any) {
//   const { setFieldValue } = useFormikContext<any>();
//   const [personName, setPersonName] = React.useState<string[]>([
//     'No Included Utilities',
//   ]);

//   React.useEffect(() => {
//     if (passData === 'appraisal') {
//       console.log('app');
//     } else {
//       if (passData?.id) {
//         const res_comp_amenities = passData.comps_included_utilities.map(
//           (ele: any) => ele.utility
//         );
//         if (res_comp_amenities.length > 0) {
//           setPersonName(res_comp_amenities);
//           setFieldValue('included_utilities', res_comp_amenities);
//         }
//       }
//     }
//   }, [passData?.id, setFieldValue]);

//   const handleChange = (event: SelectChangeEvent<typeof personName>) => {
//     const {
//       target: { value },
//     } = event;

//     let newPersonNames = typeof value === 'string' ? value.split(',') : value;

//     if (
//       newPersonNames.includes('No Included Utilities') &&
//       newPersonNames.length > 1
//     ) {
//       newPersonNames = newPersonNames.filter(
//         (name) => name !== 'No Included Utilities'
//       );
//     }

//     if (newPersonNames.length === 0) {
//       newPersonNames.push('No Included Utilities');
//     }

//     setPersonName(newPersonNames);
//     setFieldValue('included_utilities', newPersonNames);
//   };

//   return (
//     <div>
//       <FormControl sx={{ width: '100%' }}>
//         <InputLabel
//           id="demo-multiple-checkbox-label"
//           className="text-customGray mt-[6px] ml-[-16px]"
//         >
//           Included Utilities
//         </InputLabel>
//         <Select
//           labelId="demo-multiple-checkbox-label"
//           id="demo-multiple-checkbox"
//           variant="standard"
//           name="included_utilities"
//           multiple
//           value={personName}
//           onChange={handleChange}
//           renderValue={(selected) => selected.join(', ')}
//         >
//           <MenuItem
//             className="text-black-300"
//             value="No Included Utilities"
//             style={{ cursor: 'pointer' }}
//           >
//             <Checkbox />
//             <ListItemText primary="No Included Utilities" />
//           </MenuItem>
//           {names.map((name) => (
//             <MenuItem key={name} value={name} style={{ cursor: 'pointer' }}>
//               {/* <Checkbox checked={personName.indexOf(name) > -1} /> */}
//               <Checkbox />
//               <ListItemText primary={name} />
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>
//     </div>
//   );
// }


import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { useFormikContext } from 'formik';

const names = ['Electricity', 'Water', 'Sewer', 'Gas'];

export default function IncludedUtilities({ passData }: any) {
  const { setFieldValue } = useFormikContext<any>();
  const [personName, setPersonName] = React.useState<string[]>([
    'No Included Utilities',
  ]);

  React.useEffect(() => {
    if (passData === 'appraisal') {
      console.log('app');
    } else {
      if (passData?.id) {
        const res_comp_amenities = passData.comps_included_utilities.map(
          (ele: any) => ele.utility
        );
        if (res_comp_amenities.length > 0) {
          setPersonName(res_comp_amenities);
          setFieldValue('included_utilities', res_comp_amenities);
        }
      }
    }
  }, [passData?.id, setFieldValue]);

  const handleChange = (event: SelectChangeEvent<typeof personName>) => {
    const {
      target: { value },
    } = event;

    let newPersonNames = typeof value === 'string' ? value.split(',') : value;

    // Ensure "No Included Utilities" is not selectable
    newPersonNames = newPersonNames.filter(
      (name) => name !== 'No Included Utilities'
    );

    if (newPersonNames.length === 0) {
      newPersonNames.push('No Included Utilities');
    }

    setPersonName(newPersonNames);
    setFieldValue('included_utilities', newPersonNames);
  };

  return (
    <div>
      <FormControl sx={{ width: '100%' }}>
        <InputLabel
          id="demo-multiple-checkbox-label"
          className="text-customGray mt-[7px] ml-[-16px]"
        >
          Included Utilities
        </InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          variant="standard"
          name="included_utilities"
          multiple
          value={personName}
          onChange={handleChange}
          renderValue={(selected) => selected.join(', ')}
        >
          <MenuItem
            className="text-black-300"
            value="No Included Utilities"
          >
            <Checkbox
            disabled
              // checked={personName.includes('No Included Utilities')}
            />
            <ListItemText primary="No Included Utilities" />
          </MenuItem>
          {names.map((name) => (
            <MenuItem key={name} value={name} style={{ cursor: 'pointer' }}>
              <Checkbox checked={personName.includes(name)} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}


