import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormikContext } from 'formik';

interface OtherAmenitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenityOptions: string[];
  appraisalData: any;
  selectedItem: any;
  compIndex: number;
}

const OtherAmenitiesModal: React.FC<OtherAmenitiesModalProps> = ({
  isOpen,
  onClose,

  compIndex,
}) => {
  // Get values and setValues from Formik context
  const { values, setValues } = useFormikContext<any>();
  // Get extra_amenities from tableData for this comp
  const extraAmenities =
    compIndex !== null && values.tableData[compIndex]
      ? values.tableData[compIndex].extra_amenities || []
      : [];
  // Get extra_amenities from tableData for this comp

  // Calculate total from all amenities
  const calculateTotal = () => {
    let total = 0;

    // Add values from all amenities
    extraAmenities.forEach((item: any) => {
      if (
        item.another_amenity_value &&
        item.another_amenity_value.trim() !== ''
      ) {
        const numValue = parseFloat(
          item.another_amenity_value.replace(/[$,]/g, '')
        );
        if (!isNaN(numValue)) {
          total += numValue;
        }
      }
    });

    return total;
  };

  const totalAdjustment = calculateTotal();

  // Handle amenity value changes
  const handleAdjustmentChange = (index: number, value: string) => {
    const updatedTableData = [...values.tableData];
    const updatedExtraAmenities = [
      ...updatedTableData[compIndex].extra_amenities,
    ];

    updatedExtraAmenities[index] = {
      ...updatedExtraAmenities[index],
      another_amenity_value: value,
    };

    updatedTableData[compIndex] = {
      ...updatedTableData[compIndex],
      extra_amenities: updatedExtraAmenities,
    };

    setValues({
      ...values,
      tableData: updatedTableData,
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (
    index: number,
    field: string,
    checked: boolean
  ) => {
    const updatedTableData = [...values.tableData];
    const updatedExtraAmenities = [
      ...updatedTableData[compIndex].extra_amenities,
    ];

    updatedExtraAmenities[index] = {
      ...updatedExtraAmenities[index],
      [field]: checked ? 1 : 0,
    };

    updatedTableData[compIndex] = {
      ...updatedTableData[compIndex],
      extra_amenities: updatedExtraAmenities,
    };

    setValues({
      ...values,
      tableData: updatedTableData,
    });
  };

  // Handle custom amenity name changes
  const handleNameChange = (index: number, name: string) => {
    const updatedTableData = [...values.tableData];
    const updatedExtraAmenities = [
      ...updatedTableData[compIndex].extra_amenities,
    ];

    updatedExtraAmenities[index] = {
      ...updatedExtraAmenities[index],
      another_amenity_name: name,
    };

    updatedTableData[compIndex] = {
      ...updatedTableData[compIndex],
      extra_amenities: updatedExtraAmenities,
    };

    setValues({
      ...values,
      tableData: updatedTableData,
    });
  };

  // Add a new custom amenity
  const handleAddCustomAmenity = () => {
    const updatedTableData = [...values.tableData];
    const updatedExtraAmenities = [
      ...updatedTableData[compIndex].extra_amenities,
    ];

    updatedExtraAmenities.push({
      another_amenity_name: '',
      another_amenity_value: '',
      subject_property_check: 0,
      comp_property_check: 0,
      isExtra: 1,
    });

    updatedTableData[compIndex] = {
      ...updatedTableData[compIndex],
      extra_amenities: updatedExtraAmenities,
    };

    setValues({
      ...values,
      tableData: updatedTableData,
    });
  };

  // Delete amenity row
  const handleDeleteRow = (index: number) => {
    const updatedTableData = [...values.tableData];
    const updatedExtraAmenities = [
      ...updatedTableData[compIndex].extra_amenities,
    ];

    updatedExtraAmenities.splice(index, 1);

    updatedTableData[compIndex] = {
      ...updatedTableData[compIndex],
      extra_amenities: updatedExtraAmenities,
    };

    setValues({
      ...values,
      tableData: updatedTableData,
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Other Amenities</DialogTitle>
      <DialogContent>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 text-left">Amenity</th>
              <th className="border p-2 text-left">Subject Property</th>
              <th className="border p-2 text-left">Comp Property</th>
              <th className="border p-2 text-left">Adjustment $</th>
              <th className="border p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {extraAmenities.map((item: any, index: number) => (
              <tr key={index}>
                <td className="border p-2">
                  {item.isExtra === 1 ? (
                    <input
                      type="text"
                      className="w-full p-1 border rounded"
                      value={item.another_amenity_name}
                      placeholder="Enter amenity name"
                      onChange={(e) => handleNameChange(index, e.target.value)}
                    />
                  ) : (
                    item.another_amenity_name
                  )}
                </td>
                <td className="border p-2 text-center">
                  {item.isExtra === 1 ? (
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={item.subject_property_check === 1}
                      onChange={(e) =>
                        handleCheckboxChange(
                          index,
                          'subject_property_check',
                          e.target.checked
                        )
                      }
                    />
                  ) : item.subject_property_check === 1 ? (
                    'Yes'
                  ) : (
                    'No'
                  )}
                </td>
                <td className="border p-2 text-center">
                  {item.isExtra === 1 ? (
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={item.comp_property_check === 1}
                      onChange={(e) =>
                        handleCheckboxChange(
                          index,
                          'comp_property_check',
                          e.target.checked
                        )
                      }
                    />
                  ) : item.comp_property_check === 1 ? (
                    'Yes'
                  ) : (
                    'No'
                  )}
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    className="w-full p-1 border rounded"
                    value={item.another_amenity_value || ''}
                    placeholder="$0.00"
                    onChange={(e) =>
                      handleAdjustmentChange(index, e.target.value)
                    }
                  />
                </td>
                {item.isExtra === 1 && (
                  <td className="border p-2 text-center">
                    <DeleteIcon
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleDeleteRow(index)}
                    />
                  </td>
                )}
              </tr>
            ))}

            {/* Total row */}
            <tr>
              <td colSpan={3} className="border p-2 text-right font-bold">
                Total Adjustment:
              </td>
              <td className="border p-2 font-bold">
                ${totalAdjustment.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Add more button */}
        <div
          className="mt-4 flex items-center text-blue-500 cursor-pointer"
          onClick={handleAddCustomAmenity}
        >
          <AddIcon fontSize="small" className="mr-1" />
          <span>Add Extra Amenity</span>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
            onClick={onClose}
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OtherAmenitiesModal;
