import {
  capitalizeWords,
  formatNumber,
  formatNumberAcre,
  formatValue,
} from '@/utils/sanitize';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { APPROACHURL } from '@/pages/evaluation/Enum/evaluation-enums';
const SubjectPropertyComparitiveAttributes = ({
  values,
  appraisalData,
  landDimensions,
  fullStateName,
  getLabelFromValue,
  //   maxUnitCount,
}: any) => {
  const [searchParams] = useSearchParams();

  const currentUrl = window.location.href;
  const evaluationSalesId = searchParams.get(APPROACHURL.SALESID);
  const evaluationCostId = searchParams.get(APPROACHURL.COSTID);
  const evaluationLeaseId = searchParams.get(APPROACHURL.LEASEID);
  const evaluationId = searchParams.get(APPROACHURL.MULTIFAMILYID);
  const evaluationCapId = searchParams.get(APPROACHURL.CAPID);

  const costId = currentUrl.includes('evaluation/sales-approach')
    ? evaluationSalesId
    : currentUrl.includes('cost-approach')
      ? evaluationCostId
      : currentUrl.includes('lease-approach')
        ? evaluationLeaseId
        : currentUrl.includes('cap-approach')
          ? evaluationCapId
          : evaluationId;
  const id = searchParams.get('id');

  const [rentRollData, setRentRollData] = useState<
    Array<{
      sq_ft: number;
      beds: number;
      baths: number;
      unit_count: number;
      avg_monthly_rent: number;
    }>
  >([]);

  const totalSqFt = rentRollData.reduce((sum, item) => sum + item.sq_ft, 0);

  const fetchRentRollData = async () => {
    try {
      const response = await axios.get(
        `evaluations/get-rent-roll?evaluationId=${id}&evaluationScenarioId=${costId}`
      );
      if (
        response?.data?.data?.statusCode === 200 &&
        response?.data?.data?.data?.rent_rolls
      ) {
        const rentRolls = response.data.data.data.rent_rolls;

        // Extract sq_ft, beds, and baths values
        const extractedData = rentRolls.map((item: any) => ({
          sq_ft: item.sq_ft,
          beds: item.beds,
          baths: item.baths,
          unit_count: item.unit_count,
          avg_monthly_rent: item.avg_monthly_rent,
        }));

        // Set the data to state
        setRentRollData(extractedData);
        return extractedData;
      }
    } catch (error) {
      console.error('Error fetching rent roll data:', error);
    }
  };
  useEffect(() => {
    fetchRentRollData();
  }, [costId]);
  return (
    <>
      {values.appraisalSpecificAdjustment.map(
        (adjustments: any, index: number) => {
          const isStreetAddress =
            adjustments.comparison_key === 'street_address';
          const isLandSizeSF = adjustments.comparison_key === 'land_size_sf';
          const isLandSizeAcre =
            adjustments.comparison_key === 'land_size_acre';
          const isCityState = adjustments.comparison_key === 'city_state';
          const isDateSold = adjustments.comparison_key === 'date_sold';
          const isYearBuiltRemodeled =
            adjustments.comparison_key === 'year_built_year_remodeled';
          const isBuildingSize = adjustments.comparison_key === 'building_size';
          const isSalePrice = adjustments.comparison_key === 'sale_price';
          const isPricePerSF = adjustments.comparison_key === 'price_per_sf';
          const isQualityCondition =
            adjustments.comparison_key === 'quality_condition';
          const isUnit = adjustments.comparison_key === 'unit';
          const isBed = adjustments.comparison_key === 'beds';
          const isHighestBestUse =
            adjustments.comparison_key === 'highest_best_use';
          const isBusinessName = adjustments.comparison_key === 'business_name';
          const isEffectiveAge = adjustments.comparison_key === 'effective_age';
          const isSalesPrice = adjustments.comparison_key === 'sale_price';
          const isCapRate = adjustments.comparison_key === 'cap_rate';
          const isUnitMix = adjustments.comparison_key === 'unit_mix';
          const isPricePerUnit =
            adjustments.comparison_key === 'price_per_unit';
          const isTopography = adjustments.comparison_key === 'topography';
          const isServices = adjustments.comparison_key === 'services';
          const isUtilitiesSelect =
            adjustments.comparison_key === 'utilities_select';
          const isZoningType = adjustments.comparison_key === 'zoning_type';
          const isCityCounty = adjustments.comparison_key === 'city_county'; // New condition
          const netOperatingIncome =
            adjustments.comparison_key === 'net_operating_income';
          const frontage = adjustments.comparison_key === 'frontage';
          const parking = adjustments.comparison_key === 'parking';
          const isBuildingSizeLandSize = adjustments.comparison_key === 'building_size_land_size';
          const isPropertyType = adjustments.comparison_key === 'property_type';
          let landSize = 'N/A';

          if (appraisalData.land_size && appraisalData.land_dimension === 'SF') {
            landSize = `${appraisalData.land_size?.toLocaleString()} SF`;
          } else if (appraisalData.land_size && appraisalData.land_dimension === 'ACRE') {
            landSize = `${Number(appraisalData.land_size).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} AC`;
          }

          return (
            <p
              key={index}
              className={`text-xs !m-0 font-bold h-[18px] flex items-center text-ellipsis overflow-hidden whitespace-nowrap ${!appraisalData.appraisalSpecificAdjustment?.[index]?.names
                  ? 'text-gray-500 text-xs font-medium'
                  : ''
                }`}
            >
              <span className="overflow-hidden whitespace-nowrap text-ellipsis block">
                {
                  isPropertyType
                    ? `${getLabelFromValue(appraisalData?.zonings[0]?.zone)} / ${getLabelFromValue(appraisalData?.zonings[0]?.sub_zone)}`
                    : isBuildingSizeLandSize
                      ? `${appraisalData.building_size?.toLocaleString() +' '+'SF' || 0} / ${landSize}`
                      : isStreetAddress
                        ? appraisalData.street_address
                        : frontage
                          ? capitalizeWords(appraisalData.frontage)
                          : parking
                            ? capitalizeWords(appraisalData.parking)
                            : netOperatingIncome &&
                              appraisalData?.net_operating_income
                              ? `$${Number(
                                appraisalData.net_operating_income
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                              : isLandSizeSF
                                ? appraisalData.land_size != null
                                  ? `${landDimensions === 'ACRE'
                                    ? Math.round(
                                      appraisalData.land_size * 43560
                                    ).toLocaleString() // Convert to integer
                                    : parseInt(
                                      appraisalData.land_size,
                                      10
                                    ).toLocaleString() // No decimals for SF
                                  }`
                                  : 'N/A'
                                : isLandSizeAcre
                                  ? appraisalData.land_size != null
                                    ? `${landDimensions === 'SF'
                                      ? formatNumberAcre(
                                        (
                                          appraisalData.land_size / 43560
                                        ).toFixed(3) // Retain three decimal places
                                      )
                                      : appraisalData.land_size
                                        .toFixed(3)
                                        .toLocaleString('en-US') // Integer for Acre
                                    } AC`
                                    : 'N/A'
                                  : isCityState
                                    ? `${appraisalData.city}, ${fullStateName}`
                                    : isCityCounty
                                      ? `${appraisalData.city}, ${appraisalData.county}`
                                      : isDateSold
                                        ? appraisalData.date_sold
                                        : isYearBuiltRemodeled
                                          ? `${appraisalData.year_built || APPROACHESENUMS.NA} / ${appraisalData.year_remodeled ||
                                          APPROACHESENUMS.NA
                                          }`
                                          : isBuildingSize
                                            ? formatValue(appraisalData.building_size)
                                            : isSalePrice
                                              ? APPROACHESENUMS.SPACE
                                              : isPricePerSF
                                                ? appraisalData.price_square_ft
                                                : isQualityCondition
                                                  ? getLabelFromValue(
                                                    appraisalData.condition
                                                  ) || ''
                                                  : isBed
                                                    ? appraisalData.total_beds
                                                      ? formatValue(
                                                        appraisalData.total_beds
                                                      )
                                                      : ''
                                                    : isUnit
                                                      ? appraisalData.total_units
                                                        ? formatValue(
                                                          appraisalData.total_units
                                                        )
                                                        : ''
                                                      : isHighestBestUse
                                                        ? capitalizeWords(
                                                          appraisalData.high_and_best_user
                                                        )
                                                        : isBusinessName
                                                          ? appraisalData.business_name
                                                          : isEffectiveAge
                                                            ? appraisalData.effective_age
                                                            : isSalesPrice
                                                              ? APPROACHESENUMS.SPACE
                                                              : isCapRate
                                                                ? appraisalData.cap_rate
                                                                  ? `${formatNumber(appraisalData.cap_rate)}%`
                                                                  : 'N/A'
                                                                : isUnitMix
                                                                  ? `${appraisalData?.total_property_beds !=
                                                                    null &&
                                                                    appraisalData?.total_property_baths !=
                                                                    null
                                                                    ? appraisalData.total_property_beds +
                                                                    ' / ' +
                                                                    appraisalData.total_property_baths
                                                                    : 'N/A / N/A'
                                                                  }`
                                                                  : isPricePerUnit
                                                                    ? appraisalData?.sale_price !=
                                                                      null &&
                                                                      appraisalData?.total_units !=
                                                                      null
                                                                      ? formatNumber(
                                                                        (
                                                                          appraisalData.sale_price /
                                                                          appraisalData.total_units
                                                                        ).toFixed(2)
                                                                      )
                                                                      : null
                                                                    : isTopography
                                                                      ? getLabelFromValue(
                                                                        appraisalData.topography
                                                                      )
                                                                        ? getLabelFromValue(
                                                                          appraisalData.topography
                                                                        )
                                                                        : APPROACHESENUMS.NA
                                                                      : isUtilitiesSelect ||
                                                                        isServices
                                                                        ? appraisalData.utilities_select
                                                                          ? appraisalData.utilities_select
                                                                          : APPROACHESENUMS.NA
                                                                        : isZoningType
                                                                          ? appraisalData.zoning_type
                                                                            ? appraisalData.zoning_type
                                                                            : APPROACHESENUMS.NA
                                                                          : adjustments.comparison_key ===
                                                                            'unit_size_sq_ft'
                                                                            ? totalSqFt
                                                                              ? formatValue(
                                                                                totalSqFt
                                                                              )
                                                                              : APPROACHESENUMS.NA // Add this condition
                                                                            : appraisalData
                                                                              .appraisalSpecificAdjustment?.[
                                                                              index
                                                                            ]
                                                                              ?.names ||
                                                                            null}
              </span>
            </p>
          );
        }
      )}
    </>
  );
};
export default SubjectPropertyComparitiveAttributes;
