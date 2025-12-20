import {
  capitalizeWords,
  formatNumber,
  formatNumberAcre,
  formatPrice,
  formatValue,
  getLabelTopographyValue,
} from '@/utils/sanitize';
import { APPROACHESENUMS } from '@/pages/comps/enum/ApproachEnums';
import { leaseTypeOptions } from '@/pages/comps/create-comp/SelectOption';
import {
  AnalysisTypes,
  LandDimension,
  PropertyTypes,
} from '@/pages/appraisal/overview/OverviewEnum';
const CompsPropertyComparitiveAttributes = ({
  values,
  item,
  fullStateName,
  getLabelFromValue,
  appraisalData,
}: any) => {
  const formatLeaseType = (value: any) => {
    const option = leaseTypeOptions.find((option) => option.value === value);
    if (option) {
      return option.label;
    }
  };
  return (
    <>
      {values.appraisalSpecificAdjustment.map(
        (adjustments: any, index: number) => {
          const price =
            item.type === 'sale' ? item.sale_price : item.lease_rate;
          const dollarPerBed =
            item.type === 'sale'
              ? !price || !item.total_beds
                ? 0
                : price / item.total_beds
              : price === 0 || item.total_beds === 0
                ? 0
                : item.lease_rate_unit === 'monthly'
                  ? price / item.total_beds / 12
                  : price / item.total_beds;
          const dollarPerUnit =
            item.type === 'sale'
              ? !price || !item.total_units
                ? 0
                : price / item.total_units
              : item.lease_rate === 0 || item.total_units === 0
                ? 0
                : item.lease_rate_unit === 'monthly'
                  ? price / item.total_units / 12
                  : price / item.total_units;
          const avgMontlyRent = values.tableData[index]?.avg_monthly_rent
            ? new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(values.tableData[index].avg_monthly_rent)
            : item.property_units && item.property_units[0]?.avg_monthly_rent
              ? new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(item.property_units[0].avg_monthly_rent)
              : '';
          const isDollarPerBed =
            adjustments.comparison_key === 'dollar_per_bed';
          const isDollarPerUnit =
            adjustments.comparison_key === 'dollar_per_unit';
          const isPriceAcrePerYear =
            adjustments.comparison_key === 'price_acre_per_year';
          const isAvgMonthlyRent =
            adjustments.comparison_key === 'avg_monthly_rent';
          const isLeaseType = adjustments.comparison_key === 'lease_type';
          const isLeaseTermMonths = adjustments.comparison_key === 'term';
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
          const isPricePerYear =
            adjustments.comparison_key === 'price_sf_per_year';
          const isQualityCondition =
            adjustments.comparison_key === 'quality_condition';
          const isUnit = adjustments.comparison_key === 'unit';
          const isBed = adjustments.comparison_key === 'beds';
          const isHighestBestUse =
            adjustments.comparison_key === 'highest_best_use';
          const isBusinessName = adjustments.comparison_key === 'business_name';
          const isEffectiveAge = adjustments.comparison_key === 'effective_age';
          const isCapRate = adjustments.comparison_key === 'cap_rate';
          const isUnitMix = adjustments.comparison_key === 'unit_mix';
          const isPricePerUnit =
            adjustments.comparison_key === 'price_per_unit';
          const isCityCounty = adjustments.comparison_key === 'city_county';
          const isGrantee = adjustments.comparison_key === 'grantee';
          const isGrantor = adjustments.comparison_key === 'grantor';
          const isTopography = adjustments.comparison_key === 'topography';
          const isZoningType = adjustments.comparison_key === 'zoning_type';
          const isServices = adjustments.comparison_key === 'services';
          const isUtilitiesSelect =
            adjustments.comparison_key === 'utilities_select';
          const isUnitSizeSF = adjustments.comparison_key === 'unit_size_sq_ft';
          const netOperatingIncome =
            adjustments.comparison_key === 'net_operating_income';
          const frontage = adjustments.comparison_key === 'frontage';
          const parking = adjustments.comparison_key === 'parking';
          const isSpace = adjustments.comparison_key === 'space';
          const isBuildingSizeLandSize =
            adjustments.comparison_key === 'building_size_land_size';

          const isPricePerAcre =
            adjustments.comparison_key === 'price_per_acre'; // New condition for price per acre
          const isPricePerSqFt =
            adjustments.comparison_key === 'price_per_sf_land'; // New condition for price per square foot
          const isPropertyType = adjustments.comparison_key === 'property_type';
          
          let landSizeAcreValue = 0;

          if (item?.land_dimension === LandDimension.SF) {
            landSizeAcreValue = item?.land_size
              ? parseFloat((item?.sale_price / item?.land_size).toFixed(2)) *
                43560
              : 0;
          } else {
            landSizeAcreValue = item?.land_size
              ? parseFloat((item?.sale_price / item?.land_size).toFixed(2))
              : 0;
          }
          let pricePerSqFt;
          if (item?.price_square_foot) {
            pricePerSqFt = `$${item?.price_square_foot.toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
            )}`;
            if (appraisalData?.comp_type === PropertyTypes.LAND_ONLY) {
              if (
                appraisalData?.analysis_type === AnalysisTypes.SF &&
                item.land_dimension === LandDimension.ACRE
              ) {
                pricePerSqFt = `$${(
                  item.sale_price /
                  (item.land_size * 43560)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;
              } else if (
                appraisalData?.analysis_type === AnalysisTypes.ACRE &&
                item.land_dimension === LandDimension.SF
              ) {
                pricePerSqFt = `$${(
                  item.sale_price /
                  parseFloat((item.land_size / 43560).toFixed(3))
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;
              } else {
                pricePerSqFt = `$${item?.price_square_foot.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`;
              }
            }
          } else {
            if (appraisalData?.comp_type === PropertyTypes.LAND_ONLY) {
              if (
                appraisalData?.analysis_type === AnalysisTypes.SF &&
                item.land_dimension === LandDimension.ACRE
              ) {
                pricePerSqFt = `$${(
                  item.sale_price /
                  (item.land_size * 43560)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;
              } else if (
                appraisalData?.analysis_type === AnalysisTypes.ACRE &&
                item.land_dimension === LandDimension.SF
              ) {
                pricePerSqFt = `$${(
                  item.sale_price /
                  parseFloat((item.land_size / 43560).toFixed(3))
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;
              } else {
                pricePerSqFt = `$${(
                  item.sale_price / item.land_size
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;
              }
            } else {
              pricePerSqFt = `$${(
                item.sale_price / item.building_size
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`;
            }
          }
          let landSize = 'N/A';
          if (item.land_size) {
            if (
              appraisalData.land_dimension == 'SF' &&
              item.land_dimension == 'ACRE'
            ) {
              landSize = (item.land_size * 43560)?.toLocaleString() + ' SF';
            } else if (
              appraisalData.land_dimension == 'ACRE' &&
              item.land_dimension == 'SF'
            ) {
              landSize =
                (item.land_size / 43560)?.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) +
                ' AC';
            } else {
              if (item.land_dimension == 'SF') {
                landSize = item.land_size?.toLocaleString() + ' SF';
              } else if (item.land_dimension == 'ACRE') {
                landSize =
                  item.land_size?.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' AC';
              }
            }
          }

          return (
            <p
              key={index}
              className="text-xs font-bold h-[18px] !m-0 flex items-center text-gray-500 text-xs font-medium"
            >
              <span className="overflow-hidden whitespace-nowrap text-ellipsis block">
                {
                  isPropertyType
                  ? `${getLabelFromValue(item?.zonings[0]?.zone)} / ${getLabelFromValue(item?.zonings[0]?.sub_zone)}`
                  : isBuildingSizeLandSize
                  ? `${item.building_size?.toLocaleString()+' '+'SF'} / ${landSize}`
                  : isDollarPerBed
                  ? dollarPerBed
                    ? formatPrice(dollarPerBed || 0)
                    : ''
                  : isDollarPerUnit
                    ? dollarPerUnit
                      ? formatPrice(dollarPerUnit || 0)
                      : ''
                    : isPriceAcrePerYear
                      ? formatPrice(item?.price_square_foot * 43560 || 0)
                      : isAvgMonthlyRent
                        ? avgMontlyRent
                        : isSpace
                          ? `${formatValue(item.space)} ${item.space ? 'SF' : ''}`
                          : isLeaseTermMonths
                            ? item.term
                            : isLeaseType
                              ? formatLeaseType(item.lease_type)
                              : isStreetAddress
                                ? item?.street_address
                                : frontage
                                  ? capitalizeWords(item?.frontage)
                                  : parking
                                    ? capitalizeWords(item?.parking)
                                    : // : utilities
                                      //   ? capitalizeWords(appraisalData.utilities)
                                      netOperatingIncome
                                      ? `$${(
                                          Number(item?.net_operating_income) ||
                                          0
                                        ).toLocaleString(undefined, {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}`
                                      : isLandSizeSF
                                        ? item.land_size !== null &&
                                          item.land_size !== undefined
                                          ? `${
                                              item.land_dimension ===
                                              LandDimension.ACRE
                                                ? Math.round(
                                                    (item.land_size || 0) *
                                                      43560
                                                  ).toLocaleString() // Convert to SF and round to integer
                                                : Math.round(
                                                    item.land_size || 0
                                                  ).toLocaleString() // Round to integer
                                            }`
                                          : 'N/A'
                                        : isLandSizeAcre
                                          ? item.land_size !== null &&
                                            item.land_size !== undefined
                                            ? `${
                                                item.land_dimension ===
                                                LandDimension.SF
                                                  ? formatNumberAcre(
                                                      (
                                                        item.land_size / 43560
                                                      ).toFixed(3)
                                                    )
                                                  : formatNumberAcre(
                                                      item.land_size.toFixed(3)
                                                    )
                                              } AC`
                                            : 'N/A'
                                          : isCityState
                                            ? `${item.city || ''}, ${fullStateName || ''}`
                                            : isDateSold
                                              ? item.sale_status === 'Pending'
                                                ? 'Pending'
                                                : new Intl.DateTimeFormat(
                                                    'en-US',
                                                    {
                                                      month: '2-digit',
                                                      day: '2-digit',
                                                      year: 'numeric',
                                                    }
                                                  ).format(
                                                    new Date(
                                                      new Date(
                                                        item.date_sold
                                                      ).toLocaleString(
                                                        'en-US',
                                                        {
                                                          timeZone: 'UTC',
                                                        }
                                                      )
                                                    )
                                                  )
                                              : isYearBuiltRemodeled
                                                ? `${item.year_built || APPROACHESENUMS.NA} / ${item.year_remodeled || APPROACHESENUMS.NA}`
                                                : isBuildingSize
                                                  ? item.building_size !=
                                                      null &&
                                                    item.building_size !== 0
                                                    ? item.building_size?.toLocaleString() // Format building size
                                                    : 'N/A'
                                                  : isSalePrice
                                                    ? item.sale_price != null &&
                                                      item.sale_price !== 0
                                                      ? `$${item.sale_price.toLocaleString(
                                                          undefined,
                                                          {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          }
                                                        )}` // Format with commas and two decimals
                                                      : 'N/A'
                                                    : // Fallback if no value
                                                      isPricePerSF
                                                      ? pricePerSqFt
                                                      : isPricePerYear
                                                        ? `$${Number(
                                                            item?.price_square_foot ||
                                                              0
                                                          ).toLocaleString(
                                                            undefined,
                                                            {
                                                              minimumFractionDigits: 2,
                                                              maximumFractionDigits: 2,
                                                            }
                                                          )}`
                                                        : // ? item.price_square_foot
                                                          //   ? item.price_square_foot
                                                          //   : 'N/A' // Fallback if no value
                                                          isQualityCondition
                                                          ? getLabelFromValue(
                                                              item.condition
                                                            ) || ''
                                                          : isBed
                                                            ? item.total_beds
                                                              ? formatValue(
                                                                  item.total_beds
                                                                ) // Show total beds for 'beds'
                                                              : ''
                                                            : isUnit
                                                              ? item.total_units
                                                                ? formatValue(
                                                                    item.total_units
                                                                  ) // Show total units for 'unit'
                                                                : ''
                                                              : isHighestBestUse
                                                                ? capitalizeWords(
                                                                    item.high_and_best_user
                                                                  )
                                                                : isBusinessName
                                                                  ? item.business_name
                                                                  : isEffectiveAge
                                                                    ? item.effective_age
                                                                      ? item.effective_age
                                                                      : APPROACHESENUMS.NA
                                                                    : isCapRate
                                                                      ? item.cap_rate
                                                                        ? `${formatNumber(item.cap_rate)}%`
                                                                        : 'N/A'
                                                                      : isUnitMix
                                                                        ? `${item.total_property_beds || APPROACHESENUMS.NA} / ${item.total_property_baths || APPROACHESENUMS.NA}`
                                                                        : isPricePerUnit
                                                                          ? item.total_units
                                                                            ? `$${formatNumber((item.sale_price / item.total_units).toFixed(2))}`
                                                                            : ''
                                                                          : // Or your default fallback here

                                                                            isCityCounty
                                                                            ? `${item.city || APPROACHESENUMS.NA}, ${item.county || APPROACHESENUMS.NA}`
                                                                            : isGrantee
                                                                              ? item.grantee ||
                                                                                APPROACHESENUMS.NA
                                                                              : isGrantor
                                                                                ? item.grantor ||
                                                                                  APPROACHESENUMS.NA
                                                                                : isTopography
                                                                                  ? getLabelTopographyValue(
                                                                                      item.topography
                                                                                    ) ||
                                                                                    APPROACHESENUMS.NA
                                                                                  : isZoningType
                                                                                    ? item.zoning_type ||
                                                                                      APPROACHESENUMS.NA
                                                                                    : isUtilitiesSelect ||
                                                                                        isServices
                                                                                      ? item.utilities_select ||
                                                                                        APPROACHESENUMS.NA
                                                                                      : // : isUnitSizeSF
                                                                                        //   ? item
                                                                                        //     .property_units
                                                                                        //     .length
                                                                                        //     ? formatNumber(
                                                                                        //       Math.max(
                                                                                        //         ...(item.property_units?.map(
                                                                                        //           (
                                                                                        //             unit: any
                                                                                        //           ) =>
                                                                                        //             unit.sq_ft ||
                                                                                        //             0
                                                                                        //         ) || [
                                                                                        //             0,
                                                                                        //           ])
                                                                                        //       )
                                                                                        //     )
                                                                                        isUnitSizeSF
                                                                                        ? item
                                                                                            .property_units
                                                                                            ?.length
                                                                                          ? formatValue(
                                                                                              Math.max(
                                                                                                ...(item.property_units?.map(
                                                                                                  (
                                                                                                    unit: any
                                                                                                  ) =>
                                                                                                    unit.sq_ft ||
                                                                                                    0
                                                                                                ) || [
                                                                                                  0,
                                                                                                ])
                                                                                              )
                                                                                            )
                                                                                          : APPROACHESENUMS.NA // Display the maximum sq_ft value
                                                                                        : isPricePerAcre
                                                                                          ? landSizeAcreValue
                                                                                            ? formatPrice(
                                                                                                landSizeAcreValue ||
                                                                                                  1 // Prevent division by 0
                                                                                              )
                                                                                            : '$0.00'
                                                                                          : isPricePerSqFt
                                                                                            ? item.land_dimension ===
                                                                                              LandDimension.SF
                                                                                              ? item.land_size ===
                                                                                                  null ||
                                                                                                item.land_size ===
                                                                                                  0
                                                                                                ? formatPrice(
                                                                                                    0
                                                                                                  ) // If land_size is null or 0, show $0.00
                                                                                                : formatPrice(
                                                                                                    item.sale_price /
                                                                                                      item.land_size
                                                                                                  )
                                                                                              : item.land_size ===
                                                                                                    null ||
                                                                                                  item.land_size ===
                                                                                                    0
                                                                                                ? formatPrice(
                                                                                                    0
                                                                                                  ) // If land_size is null or 0, show $0.00
                                                                                                : formatPrice(
                                                                                                    item.sale_price /
                                                                                                      (item.land_size *
                                                                                                        43560)
                                                                                                  ) // For Acres
                                                                                            : // Price per square foot for Acres
                                                                                              // Price per square foot for Acres

                                                                                              // Convert land size from acres to square feet for price per sq ft
                                                                                              item
                                                                                                .appraisalSpecificAdjustment?.[
                                                                                                index
                                                                                              ]
                                                                                                ?.names}
              </span>
            </p>
          );
        }
      )}
    </>
  );
};
export default CompsPropertyComparitiveAttributes;
