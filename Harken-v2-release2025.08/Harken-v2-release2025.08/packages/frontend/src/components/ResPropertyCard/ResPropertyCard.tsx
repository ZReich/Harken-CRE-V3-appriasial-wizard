import { Box } from '@mui/material';
import { ListingEnum } from '@/pages/comps/enum/CompsEnum';
import CommonButton from '../elements/button/Button';
import listImage from '../../images/list.jpg';
import AiImage from '../../images/AI SVG.svg';
import { formatResSubZoningTypes } from '@/utils/commonFunctions';
import { formatCurrency } from '@/pages/comps/Listing/comps-utils';

interface PropertyCardProps {
  elem: any;
  index?: number;
  viewListingItem?: (id: number) => void | any;
  viewListingItemUrl?: (id: number) => void | any;
  updateListingItem?: (id: number) => void | any;
  formatLandType?: (landType: string) => string | any;
  formatSubZoningTypes: (types: any[]) => string | any;
  checkType?: any;
  hideEditButton?: boolean;
}

export const ResPropertyCard: React.FC<PropertyCardProps> = ({
  elem,
  index,
  viewListingItem,
  updateListingItem,
  viewListingItemUrl,
  hideEditButton = false,
}) => {
  return (
    <Box
      key={index}
      className="bg-white rounded-lg mb-0 p-2 border border-solid border-[#f3f3f3] relative"
      style={{ width: '100%' }}
    >
      {/* Checkbox positioned opposite to InfoWindow close button */}

      {/* IMAGE */}
      <Box className="w-full">
        <img
          style={{
            width: '100%',
            height: '120px',
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
      <Box className="mt-2">
        <Box className="text-[#0DA1C7] font-semibold leading-tight tracking-normal text-[20px]">
          {elem.street_address}
        </Box>
        <Box className="text-slate-600 font-medium leading-snug text-[14px]">
          {`${elem.city}, ${elem?.state?.toUpperCase()}, ${elem.zipcode}`}
        </Box>
      </Box>

      {/* PRICE (big & bold) */}
      <Box className="mt-2 flex items-baseline">
        {/* SALE/LEASE PRICE */}
        <Box className="font-medium text-gray-700 leading-none text-[22px]">
          {elem.sale_price
            ? formatCurrency(elem.sale_price, elem.sale_price % 1 !== 0)
            : ListingEnum.NA}
        </Box>

        {/* PRICE PER SF */}
      </Box>

      {/* DETAILS */}
      <Box className="mt-2 text-gray-900 leading-snug text-sm">
        <Box>
          <span className="font-semibold text-slate-600">
            {(() => {
              const propertyType =
                elem?.sub_type?.length > 0
                  ? formatResSubZoningTypes(elem.sub_type)
                  : 'Unknown';
              return `${propertyType}-Building:`;
            })()}
          </span>{' '}
          {elem?.building_size
            ? elem.building_size.toLocaleString() + ' SF'
            : 'N/A'}
        </Box>
        <Box>
          <span className="font-semibold text-slate-600">
            {ListingEnum.LOT}:
          </span>{' '}
          {elem.land_dimension === 'ACRE'
            ? elem?.land_size
              ? Math.round(elem.land_size * 43560).toLocaleString() + ' SF'
              : ListingEnum.NA
            : elem?.land_size
              ? elem.land_size.toLocaleString() + ' SF'
              : ListingEnum.NA}
        </Box>

        <Box className="flex gap-1 flex-wrap">
          <span className="font-semibold text-slate-600">
            {ListingEnum.BED_BATH}:
          </span>{' '}
          <p>
            {elem?.bedrooms ? elem.bedrooms : ListingEnum.NA} /{' '}
            {elem?.bathrooms ? elem.bathrooms : ListingEnum.NA}
          </p>
        </Box>
        <Box className="mt-1">
          <span className="font-semibold text-slate-600">
            {ListingEnum.YEAR_BUILT_REMODELED}:
          </span>{' '}
          {elem?.year_built || elem?.year_remodeled
            ? `${elem?.year_built ? elem?.year_built : ListingEnum.NA} / ${elem?.year_remodeled ? elem?.year_remodeled : ListingEnum.NA}`
            : ListingEnum.NA}
        </Box>
        <Box className="mt-1">
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
          <a href={viewListingItemUrl?.(elem.id) || `/res-comps-view/${elem.id}`}
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
                if (e.button === 0 && updateListingItem)
                  updateListingItem(elem.id);
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
    </Box>
  );
};
