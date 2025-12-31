// const handleCloseOtherAmenitiesModal = () => {
//   if (modalData.compIndex !== null && modalData.expenseIndex !== null) {
//     setValues((oldValues) => {
//       const comp = oldValues.tableData[modalData.compIndex];
//       const expenses = [...comp.expenses];

//       // Get the extra_amenities array
//       const extraAmenities = comp.extra_amenities || [];

//       // Calculate total from all adjustments - FIXED: removed useMemo
//       let totalValue = 0;
//       extraAmenities.forEach((item: any) => {
//         if (
//           item.another_amenity_value &&
//           typeof item.another_amenity_value === 'string' &&
//           item.another_amenity_value.trim() !== ''
//         ) {
//           const numValue = parseFloat(
//             item.another_amenity_value.replace(/[$,]/g, '')
//           );
//           if (!isNaN(numValue)) {
//             totalValue += numValue;
//           }
//         }
//       });

//       // Format total with $ sign
//       const formattedValue =
//         totalValue !== 0 ? `$${totalValue.toFixed(2)}` : '';

//       // Update the other_amenities expense with the total value
//       const otherAmenitiesIndex = expenses.findIndex(
//         (exp) => exp.another_amenity_name === 'other_amenities'
//       );
//       if (otherAmenitiesIndex !== -1) {
//         expenses[otherAmenitiesIndex].another_amenity_value = formattedValue;
//       }

//       // Calculate totals and update state
//       const weight = comp.weight;
//       const { total, expenses: updatedExpenses } = getExpensesTotal(
//         expenses,
//         modalData.expenseIndex,
//         totalValue.toString()
//       );

//       const calculatedCompData = calculateCompData({
//         total,
//         weight,
//         comp,
//       });

//       // Create final updated comp data
//       const updatedComp = {
//         ...comp,
//         ...calculatedCompData,
//         expenses: updatedExpenses,
//         total,
//         // Preserve the extra_amenities array
//         extra_amenities: extraAmenities,
//       };

//       // Update the comp in tableData
//       const updatedTableData = [...oldValues.tableData];
//       updatedTableData[modalData.compIndex] = updatedComp;

//       return {
//         ...oldValues,
//         tableData: updatedTableData,
//         averaged_adjusted_psf: updatedTableData.reduce(
//           (acc, item) => acc + item.averaged_adjusted_psf,
//           0
//         ),
//       };
//     });
//   }

//   // Reset modal data
//   setModalData({
//     isOpen: false,
//     compIndex: null,
//     expenseIndex: null,
//     compItem: null,
//   });
// };