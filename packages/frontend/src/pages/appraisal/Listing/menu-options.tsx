import { Icons } from '@/components/icons';
import { Box, Typography } from '@mui/material';
import { ListingHeaderEnum } from '@/pages/comps/enum/CompsEnum';
import AppraisalListingTable from './index';
import { useEffect, useState } from 'react';
import MapFilterAppraisal from './filter';
import { FilterComp } from './interface/appraisal-listing';
// import { CustomSelectSearch } from '@/components/custom-select-search';
// import { SortingTypeJsonAppraisal } from '@/pages/comps/comp-form/fakeJson';
// import { SelectChangeEvent } from '@mui/material/Select';
import { useNavigate } from 'react-router-dom';
import { SortingEnum } from '@/pages/comps/enum/CompsEnum';
import { AppraisalListingEnum } from '../Enum/AppraisalEnum';
const MapHeaderOptionsAppraisal = () => {
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
    navigate('/appraisal-set-up');
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
              {AppraisalListingEnum.APPRAISAL_LISTING}
            </Typography>
            <Box className="mx-9">
              <div className="items-end flex">
                <Icons.SearchIcon className="text-[#0DA1C7] mr-1 pointer-events-none" />
                <Icons.Input
                  className="text-xs !pb-[6px] w-80"
                  placeholder="Search Appraisal"
                  onChange={handleInputChange}
                />
              </div>
            </Box>

            {/* <Box className="mr-9 selectDropdown">
                            <CustomSelectSearch
                                label="Sort By"
                                options={SortingTypeJsonAppraisal}
                                value={sortingOrder}
                                onChange={(e: SelectChangeEvent<string>) => {
                                    setSortingOrder(e.target.value as string);
                                }}
                            />
                        </Box>
 */}

            {/* <Box className="mx-4">
                            <button
                                className="border border-[#0DA1C7] text-[#0DA1C7] bg-white font-semibold h-[34px] px-5 rounded-[6px] pr-9 relative cursor-pointer"
                                onClick={openNav}>
                                <div className="mr-5 cursor-pointer">{ListingHeaderEnum.FILTERS}</div>
                                <img
                                    src={image1}
                                    alt="image1"
                                    className="h-[20px] w-[20px] absolute top-[7px] right-[8px] mr-2"
                                />
                            </button>
                        </Box> */}
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
      <MapFilterAppraisal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onApplyFilter={(filter) => {
          setSidebarFilters(filter);
        }}
      />
    </>
  );
};
export default MapHeaderOptionsAppraisal;
