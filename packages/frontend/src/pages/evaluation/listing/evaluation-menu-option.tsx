import { Icons } from '@/components/icons';
import { FilterComp } from '@/pages/appraisal/Listing/interface/appraisal-listing';
import { ListingHeaderEnum } from '@/pages/comps/enum/CompsEnum';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import AdnavceFilterEvaluation from './evaluation-advance-filter';
import AppraisalListingTable from './index';
// import { CustomSelectSearch } from '@/components/custom-select-search';
// import { SortingTypeJsonAppraisal } from '@/pages/comps/comp-form/fakeJson';
// import { SelectChangeEvent } from '@mui/material/Select';
import { SortingEnum } from '@/pages/comps/enum/CompsEnum';
import { useNavigate } from 'react-router-dom';
import { EvaluationListingEnum } from '../Enum/evaluation-enums';
const HeaderOptionsEvaluation = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchValuesByfilter, setSearchValuesByfilter] = useState<string>('');
  const [sidebarFilters, setSidebarFilters] = useState<FilterComp | string>('');
  const [sortingOrder] = useState('');

  const [sortingSettings, setSortingSettings] = useState({
    sortingType: '',
    orderSorting: '',
  });

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValuesByfilter(e.target.value);
  };

  // const openNav = () => {
  //     setIsOpen(true);
  // };

  useEffect(() => {
    if (
      sortingOrder === SortingEnum.ASC ||
      sortingOrder === SortingEnum.ASC_0 ||
      sortingOrder === SortingEnum.ASC_1
    ) {
      setSortingSettings((prevSettings) => ({
        ...prevSettings,
        orderSorting: SortingEnum.ASC,
      }));
    } else {
      setSortingSettings((prevSettings) => ({
        ...prevSettings,
        orderSorting: SortingEnum.DESC,
      }));
    }

    if (
      sortingOrder === SortingEnum.ASC_0 ||
      sortingOrder === SortingEnum.DESC_1
    ) {
      setSortingSettings((prevSettings) => ({
        ...prevSettings,
        sortingType: SortingEnum.SALE_PRICE,
      }));
    } else if (
      sortingOrder === SortingEnum.ASC ||
      sortingOrder === SortingEnum.DESC_0
    ) {
      setSortingSettings((prevSettings) => ({
        ...prevSettings,
        sortingType: SortingEnum.STREET_ADDRESS,
      }));
    } else {
      setSortingSettings((prevSettings) => ({
        ...prevSettings,
        sortingType: SortingEnum.Date_SOLD,
      }));
    }
  }, [sortingOrder]);

  const createSales = () => {
    navigate('/evaluation-set-up');
    sessionStorage.setItem('hasSaleType', 'false');
    sessionStorage.setItem('hasIncomeApproch', 'false');
    sessionStorage.setItem('hasCostApproch', 'false');
  };

  return (
    <>
      <Box className="py-5 map-header-sticky">
        <Box className="flex justify-between px-9">
          <Box className="flex items-center">
            <Typography
              variant="h5"
              component="h5"
              sx={{
                marginRight: '50px',
                padding: '0',
                fontSize: '20px',
                fontWeight: '700',
              }}
            >
              {EvaluationListingEnum.EVALUATION_LISTING}
            </Typography>
            <Box className="mx-9">
              <div className="items-end flex">
                <Icons.SearchIcon className="text-[#0DA1C7] mr-1 pointer-events-none" />
                <Icons.Input
                  className="text-xs !pb-[6px] w-80"
                  placeholder="Search Evaluation"
                  onChange={handleInputChange}
                />
              </div>
            </Box>
          </Box>
          <Box className="flex cursor-pointer mt-[0.5px]">
            <Box>
              <button
                onClick={createSales}
                className="border-none text-white bg-[#0DA1C7] flex items-center gap-1 text-xs font-semibold py-2 px-3 rounded cursor-pointer"
              >
                {ListingHeaderEnum.ADD_NEW}
                <Icons.AddIcon className="relative text-lg" />
              </button>
            </Box>
          </Box>
        </Box>
      </Box>
      <AppraisalListingTable
        searchValuesByfilter={searchValuesByfilter}
        sidebarFilters={sidebarFilters}
        sortingSettings={sortingSettings}
      />
      <AdnavceFilterEvaluation
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onApplyFilter={(filter: any) => {
          setSidebarFilters(filter);
        }}
      />
    </>
  );
};
export default HeaderOptionsEvaluation;
