// import React, { useState } from 'react';
// import Typography from '@mui/material/Typography';
// import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
// import ResidentialMenuOptions from '@/pages/evaluation/set-up/residential-menu-option';
// import ResidentialCostImprovementForm from './residential-cost-improvement-form';

// const ResidentialCostImprovement: React.FC = () => {
//   const [costName, setCostName] = useState('');
//   const [buildingSize, setBuildingSize] = useState('');
//   const [totalCostValuation, setTotalCostValuation] = useState<any>('');

//   // Callback function to receive building size from child component
//   const handleBuildingSizeChange = (size: string) => {
//     setBuildingSize(size);
//   };
//   console.log(setCostName);
//   // Callback function to receive total cost valuation from child component
//   const handleTotalCostValuationChange = (totalCostVal: any) => {
//     setTotalCostValuation(totalCostVal);
//   };

//   return (
//     <ResidentialMenuOptions
//       totalaveragedadjustedpsfCost={buildingSize}
//       totalCostValuation={totalCostValuation}
//     >
//       <div className="flex items-center justify-between h-[60px] w-[100%] xl:pl-[40px] border-0 border-b border-[#eee] border-solid xl:pr-[70px] px-[15px] map-header-sticky">
//         <div>
//           <Typography
//             variant="h1"
//             component="h2"
//             className="text-xl font-bold uppercase"
//           >
//             COST IMPROVEMENTS <span>({costName})</span>
//           </Typography>
//         </div>
//         <div className="flex items-center">
//           <ErrorOutlineIcon className="pr-[10px]" />
//           <span>Value of the improvements based on local market costs.</span>
//         </div>
//       </div>
//       <div>
//         <div className="flex flex-wrap space-x-1.5 xl:px-[60px] px-[15px]">
//           <ResidentialCostImprovementForm
//             onBuildingSizeChange={handleBuildingSizeChange}
//             onTotalCostValuationChange={handleTotalCostValuationChange}
//           />
//         </div>
//       </div>
//     </ResidentialMenuOptions>
//   );
// };

// export default ResidentialCostImprovement;
