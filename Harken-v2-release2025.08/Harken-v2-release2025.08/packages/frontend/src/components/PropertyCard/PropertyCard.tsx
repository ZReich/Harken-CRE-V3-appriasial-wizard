import { Box } from '@mui/material';
import { ListingEnum } from '@/pages/comps/enum/CompsEnum';
import CommonButton from '../elements/button/Button';
import listImage from '../../images/list.jpg';
import AiImage from '../../images/AI SVG.svg';
import { formatCurrency } from '@/pages/comps/Listing/comps-utils';
import React from 'react';

interface PropertyCardProps {
  elem?: any;
  index?: number;
  viewListingItem?: (id: number) => void | any;
  updateListingItem?: (id: number) => void | any;
  formatLandType?: (landType: string) => string | any;
  formatZoningTypes?: (types: string[]) => string | any;
  checkType?: any;
  hideEditButton?: boolean;
  approachType?: any;
  selectedToggleButton?: any;
  isPopup?: boolean;
  zoomLevel?: number;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  elem,
  index,
  viewListingItem,
  updateListingItem,
  formatLandType,
  formatZoningTypes,
  checkType,
  approachType,
  hideEditButton = false,
  selectedToggleButton,
  isPopup = false,
}) => {
  console.log('🔄 PropertyCard selectedToggleButton:', selectedToggleButton);
  console.log('PropertyCard Debug:', {
    selectedToggleButton,
    checkType,
    approachType,
    elem: elem,
    priceSquareFoot: elem?.price_square_foot,
    calculatedPrice:
      selectedToggleButton === 'AC'
        ? (elem?.price_square_foot || 0) * 43560
        : elem?.price_square_foot || 0,
  });

  if (!elem) {
    return <div>Loading property data...</div>;
  }

  // Only apply responsive behavior for popups
  const isSmallScreen = isPopup && window.innerWidth < 768;

  return (
    <Box
      key={index}
      className={`bg-white rounded-lg mb-0 p-2 border border-solid border-[#f3f3f3] relative ${
        isPopup ? 'info-window-with-pointer' : ''
      }`}
      style={{
        width: isPopup && isSmallScreen ? '280px' : '100%',
      }}
    >
      {isPopup && <div className="info-window-pointer" />}
      {/* IMAGE */}
      <Box className="w-full">
        <img
          style={{
            width: '100%',
            height: isPopup && isSmallScreen ? '120px' : '120px',
            objectFit: 'fill',
            borderRadius: '6px',
          }}
          src={
            elem.property_image_url
              ? import.meta.env.VITE_S3_URL + elem.property_image_url
              : listImage
          }
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = listImage;
          }}
          alt="Property"
        />
      </Box>

      {/* ADDRESS */}
      <Box className="mt-2 font-sans">
        {/* STREET ADDRESS */}
        <Box
          className={`text-[#0DA1C7] font-semibold leading-tight tracking-normal ${
            isPopup ? 'text-[17px]' : 'text-[20px]'
          }`}
        >
          {elem.street_address}
        </Box>

        {/* CITY / STATE / ZIP */}
        <Box
          className={`text-slate-600 font-medium leading-snug ${
            isPopup ? 'text-[13px]' : 'text-[14px]'
          }`}
        >
          {`${elem.city}, ${elem?.state?.toUpperCase()}, ${elem.zipcode}`}
        </Box>

        {/* PRICE */}
        <Box className="mt-1 flex items-baseline flex-wrap">
          <Box
            className={`font-medium text-gray-700 leading-none ${
              isPopup ? 'text-[20px]' : 'text-[22px]'
            }`}
          >
            {checkType === 'leasesCheckbox' || checkType === 'leaseCheckBox'
              ? formatCurrency(elem.lease_rate, elem.lease_rate % 1 !== 0)
              : formatCurrency(elem.sale_price, elem.sale_price % 1 !== 0)}
          </Box>

          {elem.price_square_foot && (
            <>
              <Box
                className={`font-medium text-gray-700 ml-1 ${
                  isPopup ? 'text-[20px]' : 'text-[22px]'
                }`}
              >
                {`/ ${formatCurrency(
                  selectedToggleButton === 'AC'
                    ? elem.price_square_foot * 43560
                    : elem.price_square_foot,
                  (selectedToggleButton === 'AC'
                    ? elem.price_square_foot * 43560
                    : elem.price_square_foot) %
                    1 !==
                    0
                )}`}
              </Box>
              <Box
                className={`text-gray-700 ml-1 font-medium ${
                  isPopup ? 'text-[20px]' : 'text-[22px]'
                }`}
              >
                {checkType === 'leasesCheckbox' || checkType === 'leaseCheckBox'
                  ? selectedToggleButton === 'AC'
                    ? 'PAC/YR'
                    : 'PSF/YR'
                  : selectedToggleButton === 'AC'
                    ? 'PAC'
                    : 'PSF'}
              </Box>
            </>
          )}
        </Box>

        {/* DETAILS SECTION */}
        <Box
          className={`mt-0 text-gray-900 leading-snug ${isPopup ? 'text-sm' : 'text-sm'}`}
        >
          {/* Row 1: Building and Lot */}
          <Box className="flex justify-between mb-0 mt-2 flex-col">
            <Box className="flex-1">
              {localStorage.getItem('activeType') === 'land_only' ? (
                <>
                  {elem.land_type
                    ? formatLandType?.(elem.land_type) || ListingEnum.NA
                    : ListingEnum.NA}
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-600 mt-2">
                    {(() => {
                      const propertyType =
                        elem?.type?.length > 0
                          ? formatZoningTypes?.(elem.type) || 'Unknown'
                          : 'Unknown';
                      return `${propertyType}-Building:`;
                    })()}
                  </span>{' '}
                  {elem?.building_size
                    ? elem.building_size.toLocaleString() + ' SF'
                    : 'N/A'}
                </>
              )}
            </Box>

            <Box className="flex-1 mt-0.5">
              {localStorage.getItem('activeType') === 'building_with_land' ? (
                <>
                  <span className="font-semibold text-slate-600">
                    {ListingEnum.LOT}:
                  </span>{' '}
                  {(() => {
                    const size = Number(elem?.land_size);
                    if (
                      elem?.land_size == null ||
                      elem?.land_size === '' ||
                      Number.isNaN(size)
                    ) {
                      return ListingEnum.NA;
                    }
                    const sizeInSF =
                      elem.land_dimension === 'ACRE' ? size * 43560 : size;
                    return Math.round(sizeInSF).toLocaleString() + ' SF';
                  })()}
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-600">
                    {ListingEnum.LOT}:
                  </span>{' '}
                  {selectedToggleButton === 'SF'
                    ? elem.land_dimension === 'ACRE'
                      ? elem?.land_size === null || elem?.land_size === ''
                        ? ListingEnum.NA
                        : Math.round(
                            elem?.land_size * 43560
                          )?.toLocaleString() + ' SF'
                      : elem?.land_size === null || elem?.land_size === ''
                        ? ListingEnum.NA
                        : elem?.land_size?.toLocaleString() + ' SF'
                    : selectedToggleButton === 'AC'
                      ? elem.land_dimension === 'SF'
                        ? elem?.land_size === null || elem?.land_size === ''
                          ? ListingEnum.NA
                          : (elem?.land_size / 43560)
                              ?.toFixed(3)
                              .toLocaleString() + ' AC'
                        : elem?.land_size === null || elem?.land_size === ''
                          ? ListingEnum.NA
                          : elem?.land_size.toFixed(3).toLocaleString() + ' AC'
                      : ListingEnum.NA}
                </>
              )}
            </Box>
          </Box>

          {/* Row 2: Year Built/Remodeled */}
          {elem.comp_type === 'building_with_land' && (
            <Box
              className={`text-gray-700 mt-0 leading-snug ${
                isPopup ? 'text-[13px]' : 'text-[14px]'
              }`}
            >
              <span className="font-semibold text-slate-600">
                Year Built/Remodeled:
              </span>{' '}
              {elem?.year_built || elem?.year_remodeled
                ? `${elem?.year_built ? elem?.year_built : ListingEnum.NA} / ${
                    elem?.year_remodeled ? elem?.year_remodeled : ListingEnum.NA
                  }`
                : ListingEnum.NA}
            </Box>
          )}

          {/* Row 3: Condition */}
          <Box className="flex justify-between gap-1 mb-0 flex-col mt-1">
            <Box className="flex-1">
              <span className="font-semibold text-slate-600">
                {ListingEnum.CONDITION}:
              </span>{' '}
              {elem?.condition
                ? elem.condition
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (char: string) => char.toUpperCase())
                : ListingEnum.NA}
            </Box>
          </Box>

          {/* Row 4: Lease Type */}
          {checkType &&
            checkType !== 'salesCheckbox' &&
            approachType !== 'salesCheck' && (
              <Box className="mt-1">
                <span className="font-semibold text-slate-600">
                  {isPopup ? 'Lease:' : 'Lease Type:'}
                </span>{' '}
                {elem?.lease_type
                  ? elem?.lease_type
                      .replace(/_/g, ' ')
                      .split(' ')
                      .map((word: string) => {
                        if (word.toLowerCase() === 'nnn') return 'NNN';
                        return (
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                        );
                      })
                      .join(' ')
                  : ListingEnum.NA}
              </Box>
            )}
        </Box>
      </Box>

      {/* BUTTONS + AI ICON */}
      <Box className="flex items-center mt-3">
        {elem.ai_generated === 1 && (
          <img
            src={AiImage}
            style={{
              width: '24px',
              height: '24px',
              marginRight: '10px',
            }}
            alt="AI"
          />
        )}

        <Box className="flex items-center justify-start w-full">
          {/* VIEW */}
          <a
            href={`/comps-view/${elem.id}`}
            onClick={(e: any) => {
              e.preventDefault();
              viewListingItem?.(elem.id);
            }}
          >
            <CommonButton
              variant="contained"
              className="text-xs font-medium"
              color="primary"
              style={{
                borderRadius: '0 0 0 10px',
                minWidth: '100px',
                padding: '3px 20px',
                textTransform: 'capitalize',
              }}
            >
              {ListingEnum.VIEW}
            </CommonButton>
          </a>

          {/* EDIT */}
          {!hideEditButton && (
            <a
              href={`/update-comps/${elem.id}`}
              onClick={(e) => {
                e.preventDefault();
                if (e.button === 0) updateListingItem?.(elem.id);
              }}
              className="ml-2"
            >
              <CommonButton
                variant="contained"
                color="primary"
                className="text-xs font-medium"
                style={{
                  minWidth: '100px',
                  borderRadius: '0 0 10px 0',
                  padding: '3px 20px',
                  textTransform: 'capitalize',
                }}
              >
                {ListingEnum.EDIT}
              </CommonButton>
            </a>
          )}
        </Box>
      </Box>

      {/* Custom Pointer for InfoWindow */}
      {isPopup && <div className="info-window-pointer"></div>}
    </Box>
  );
};
