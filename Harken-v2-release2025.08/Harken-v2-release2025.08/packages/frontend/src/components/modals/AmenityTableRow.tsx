import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete'; // Import the delete icon

interface AmenityTableRowProps {
  item: {
    another_amenity_name: string;
    another_amenity_value: string;
    subject_property_check: number;
    comp_property_check: number;
    isExtra: number;
    is_extra: number;
    adj_value?: string; // Add optional adj_value property
  };
  index: number;
  onNameChange: (index: number, name: string) => void;
  onCheckboxChange: (index: number, field: string, checked: boolean) => void;
  onAdjustmentChange: (index: number, value: string) => void;
  onDeleteRow?: (index: number) => void;
  compDetails: any;
  evaluationAmenities?: any[]; // Add this prop for API data
}

const AmenityTableRow: React.FC<AmenityTableRowProps> = ({
  item,
  index,
  onNameChange,
  onCheckboxChange,
  onAdjustmentChange,
  onDeleteRow,
  compDetails,
  evaluationAmenities = [],
}) => {
  // Check if amenity exists in evaluation amenities
  console.log('evaluationAmenities:', evaluationAmenities);
  console.log('item.another_amenity_name:', item);

  const hasSubjectAmenity = evaluationAmenities.some((amenity: any) => {
    console.log('amenity.additional_amenities:', amenity.additional_amenities);
    return amenity.additional_amenities === item.another_amenity_name;
  });

  // Check if amenity exists in comp amenities
  const hasCompAmenity =
    compDetails?.res_comp_amenities?.some(
      (amenity: any) =>
        amenity.additional_amenities === item.another_amenity_name
    ) || false;

  console.log('hasSubjectAmenity:', hasSubjectAmenity);
  console.log('hasCompAmenity:', hasCompAmenity);
  return (
    <tr>
      <td className="border px-2 py-1">
        {item.isExtra === 1 || item.is_extra === 1 ? (
          <input
            type="text"
            className="w-full p-1 border rounded"
            value={item.another_amenity_name}
            placeholder="Enter amenity name"
            onChange={(e) => onNameChange(index, e.target.value)}
          />
        ) : (
          item.another_amenity_name
        )}
      </td>
      <td className="border px-2 py-1 text-center">
        {item.isExtra === 1 || item.is_extra === 1 ? (
          <input
            type="checkbox"
            className="w-5 h-5"
            checked={item.subject_property_check === 1}
            onChange={(e) =>
              onCheckboxChange(
                index,
                'subject_property_check',
                e.target.checked
              )
            }
          />
        ) : hasSubjectAmenity ? (
          'Yes'
        ) : (
          'No'
        )}
      </td>
      <td className="border px-2 py-1 text-center">
        {item.isExtra === 1 || item.is_extra === 1 ? (
          <input
            type="checkbox"
            className="w-5 h-5"
            checked={item.comp_property_check === 1}
            onChange={(e) =>
              onCheckboxChange(index, 'comp_property_check', e.target.checked)
            }
          />
        ) : hasCompAmenity ? (
          'Yes'
        ) : (
          'No'
        )}
      </td>
      <td className="border px-2 py-1">
        <input
          type="text"
          className="w-full p-1 border rounded"
          value={(() => {
            const rawValue = item.adj_value || item.another_amenity_value || '';
            if (!rawValue || rawValue === '0' || rawValue === '') {
              return '$0.00';
            }
            const numValue = parseFloat(rawValue);
            if (isNaN(numValue)) {
              return '$0.00';
            }
            return numValue.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          })()}
          placeholder="$0.00"
          onFocus={(e) => {
            e.target.select(); // Select all text on focus
          }}
          onKeyDown={(e) => {
            const { selectionStart, selectionEnd, value }: any = e.target;
            const currentValue =
              item.adj_value || item.another_amenity_value || '';
            const isFullySelected =
              selectionStart === 0 && selectionEnd === value.length;

            // Handle number input when text is fully selected or field is empty - start fresh
            if (
              /^[0-9]$/.test(e.key) &&
              (isFullySelected || !currentValue || currentValue === '0')
            ) {
              e.preventDefault();
              const newValue = (parseFloat(e.key) / 100).toString(); // Start with cents
              onAdjustmentChange(index, newValue);
              return;
            }

            // Handle number input when starting with negative
            if (
              /^[0-9]$/.test(e.key) &&
              (currentValue === '-0' ||
                currentValue === '-0.00' ||
                currentValue === '-$0.00')
            ) {
              e.preventDefault();
              const newValue = (-parseFloat(e.key) / 100).toString(); // Start with negative cents
              onAdjustmentChange(index, newValue);
              return;
            }

            // Handle number input when adding digits (calculator style)
            if (/^[0-9]$/.test(e.key) && !isFullySelected) {
              e.preventDefault();
              const currentNum = parseFloat(currentValue) || 0;
              const isNegative = currentNum < 0 || currentValue.includes('-');
              const absoluteValue = Math.abs(currentNum);

              // Convert to cents, shift left by multiplying by 10, add new digit, then convert back to dollars
              const currentCents = Math.round(absoluteValue * 100);
              const newCents = currentCents * 10 + parseInt(e.key);
              const newValue = newCents / 100;
              const finalValue = isNegative ? -newValue : newValue;

              onAdjustmentChange(index, finalValue.toString());
              return;
            }

            // Handle backspace
            if (e.key === 'Backspace') {
              e.preventDefault();

              if (isFullySelected) {
                // If all text is selected, clear the field
                onAdjustmentChange(index, '0');
                return;
              }

              const currentNum = parseFloat(currentValue) || 0;
              const isNegative = currentNum < 0;
              const absoluteValue = Math.abs(currentNum);

              // Convert to cents, remove rightmost digit by dividing by 10 and flooring, then convert back
              const currentCents = Math.round(absoluteValue * 100);
              const newCents = Math.floor(currentCents / 10);
              const newValue = newCents / 100;
              const finalValue = isNegative ? -newValue : newValue;

              onAdjustmentChange(index, finalValue.toString());
              return;
            }

            // Handle negative sign
            if (e.key === '-') {
              e.preventDefault();

              // If field is empty or showing $0.00, start with negative
              if (
                isFullySelected ||
                !currentValue ||
                currentValue === '0' ||
                currentValue === ''
              ) {
                onAdjustmentChange(index, '-0');
                return;
              }

              // Otherwise, toggle the sign of existing value
              const currentNum = parseFloat(currentValue) || 0;
              onAdjustmentChange(index, (-currentNum).toString());
              return;
            }

            // Allow navigation keys
            if (
              ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'].includes(e.key)
            ) {
              return;
            }

            // Prevent all other keys
            e.preventDefault();
          }}
          onChange={() => {}}
        />
      </td>
      {/* Add delete icon for new rows */}
      {(item.isExtra === 1 || item.is_extra === 1) && onDeleteRow && (
        <td className="border px-2 py-1 text-center">
          <DeleteIcon
            className="text-red-500 cursor-pointer"
            onClick={() => onDeleteRow(index)}
          />
        </td>
      )}
    </tr>
  );
};

export default React.memo(AmenityTableRow);
