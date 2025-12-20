import { ResponseType } from '@/components/interface/response-type';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { AllTypeJson } from '@/pages/comps/create-comp/SelectOption';
import { Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ResidentialCostImprovementNetIncome } from './residential-cost-improvement-net-income';
import { ResidentialCostImprovement } from './residential-cost-improvemnt';
const ResidentialCostImprovementForm: React.FC<{
  onBuildingSizeChange?: (size: string) => void;
  onTotalCostValuationChange?: (totalCostValuation: any) => void;
  onTotalAdjustedCost?: (totalAdjustedCost: any) => void;
  updateEvalCostWeightInParent: any;
  totalWeightedValue: any;
}> = ({
  onBuildingSizeChange,
  onTotalCostValuationChange,
  onTotalAdjustedCost,
  updateEvalCostWeightInParent,
  totalWeightedValue,
}) => {
  const [hasCostType, setHasCostType] = useState(false);
  const [filtereCostdData, setFilteredCostsData] = useState<
    { id: any; name: React.ReactNode }[]
  >([]);
  const [hasCostApproch, setHasCostApproch] = useState(false);
  const [updateData, setUpdateData] = useState<any>();
  const [totalSqft, setTotalSqft] = useState<any>(0);
  const [typeSqft, setTypeSqft] = useState<any>(undefined);
  const [costAppraisalData, setCostAppraisalData] = useState();
  const [totalAdjustedCost, setTotalAdjustedCost] = useState<any>();
  const [comparisonBasis, setComparisonBasis] = useState<any>('');
  const [unit, setUnit] = useState<any>();
  const [bed, setBed] = useState<any>();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const costId = searchParams.get('costId');
  const [evalWeight, setEvalWeight] = useState<number | any>(null);

  const navigate = useNavigate();
  const [buildingSize, setBuildingSize] = useState('');
  const [totalCostValuations, setTotalCostValuations] = useState(0); // or null if preferred

  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'save-cost-approach-Improvements',
    endPoint: `res-evaluations/save-cost-approach-Improvements`,
    requestType: RequestType.POST,
  });
  console.log(buildingSize);
  useEffect(() => {
    if (id && costId) {
      // Check for stored data in sessionStorage first
      const storedData = sessionStorage.getItem('costImprovementData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          console.log('Using stored data from sessionStorage:', parsedData);
          // Use the stored data directly
          setCostAppraisalData(parsedData);
        } catch (error) {
          console.error('Error parsing stored data:', error);
        }
      }

      // Still fetch from API for fresh data
      setTimeout(() => {
        refetch();
      }, 100);
    }
  }, [costId]);
  useEffect(() => {
    if (onTotalAdjustedCost && totalAdjustedCost) {
      onTotalAdjustedCost(totalAdjustedCost);
    }
  }, [totalAdjustedCost, onTotalAdjustedCost]);

  useEffect(() => {
    if (onTotalCostValuationChange && totalCostValuations !== undefined) {
      onTotalCostValuationChange(totalCostValuations);
    }
  }, [totalCostValuations, onTotalCostValuationChange]);

  console.log('totalAdjustedCost444444', totalAdjustedCost);
  const { isLoading: loading, refetch } = useGet<any>({
    queryKey: 'evaluation',
    endPoint: `res-evaluations/get-cost-approach?evaluationId=${id}&evaluationScenarioId=${costId}`,
    config: {
      enabled: Boolean(hasCostApproch),
      onSuccess: (response: any) => {
        setCostAppraisalData(response?.data?.data);
        // if (
        //   onTotalCostValuationChange &&
        //   response.data?.data?.total_cost_valuation
        // ) {
        //   onTotalCostValuationChange(response.data?.data?.total_cost_valuation);
        // }
        const costData = response?.data?.data?.eval_weight;
        const evalWeightValue: any = costData * 100;

        setEvalWeight(evalWeightValue);

        if (onTotalCostValuationChange && totalCostValuations) {
          onTotalCostValuationChange(totalCostValuations);
        }
        if (
          response?.data?.data?.cost_improvements &&
          response?.data?.data?.cost_improvements.length > 0
        ) {
          setUpdateData(response?.data?.data?.cost_improvements);
          // Store the data for future use
          try {
            sessionStorage.setItem(
              'costImprovementData',
              JSON.stringify(response?.data?.data)
            );
          } catch (error) {
            console.error('Error storing data in sessionStorage:', error);
          }
        } else {
          setUpdateData(formatZoningData(data_zonings));
        }
      },
      onError: () => {
        setUpdateData(formatZoningData(data_zonings));
      },
    },
  });

  const { mutateAsync } = useMutate<ResponseType, any>({
    queryKey: 'evaluations/update-position',
    endPoint: `evaluations/update-position/${id}`,
    requestType: RequestType.PATCH,
  });

  useEffect(() => {
    const updatePositionWithCurrentUrl = async () => {
      const ApiUrl = window.location.href.replace(window.location.origin, '');
      const response = await mutateAsync({
        position: ApiUrl,
      });
      console.log('Update successful:', response);
    };
    updatePositionWithCurrentUrl();
  }, [id, mutateAsync]);

  const formatZoningData = (zonings: any) => {
    if (zonings?.length) {
      return zonings.map((ele: any) => {
        const findDistributionLabel = (AllTypeJson: any) => {
          const foundItem = AllTypeJson.find(
            (item: { value: string }) => item.value === ele?.sub_zone
          );
          return foundItem ? foundItem.label : ele?.sub_zone;
        };
        return {
          adjusted_cost: 0,
          adjusted_psf: 0,
          depreciation: 0,
          type: findDistributionLabel(AllTypeJson),
          zoning_id: ele?.id,
          sub_zone_custom: '',
          sf_area: ele?.total_sq_ft || 0,
          isDisabled: true,
          structure_cost: 0,
          depreciation_amount: 0,
        };
      });
    }
    return [];
  };

  const { data, isLoading } = useGet<any>({
    queryKey: 'res-evaluations/get',
    endPoint: `res-evaluations/get/${id}`,
    config: {
      refetchOnWindowFocus: false,
      onSuccess: (response: any) => {
        setComparisonBasis(response?.data?.data?.comparison_basis);
        if (response?.data?.data?.res_zonings) {
          const type_sqft = response?.data?.data?.res_zonings?.map(
            (ele: any) => {
              const findDistributionLabel = (AllTypeJson: any) => {
                const foundItem = AllTypeJson.find(
                  (item: { value: string }) => item?.value === ele?.sub_zone
                );
                return foundItem ? foundItem.label : ele?.sub_zone;
              };
              return {
                adjusted_cost: 0,
                adjusted_psf: 0,
                depreciation: 0,
                type: findDistributionLabel(AllTypeJson),
                zoning_id: ele?.id,
                sub_zone_custom: '',
                sf_area: ele?.total_sq_ft,
                isDisabled: true,
                structure_cost: 0,
                depreciation_amount: 0,
              };
            }
          );
          setTypeSqft(type_sqft);
        }
        if (response?.data?.data?.res_zonings) {
          const unit = response?.data?.data?.res_zonings?.map((ele: any) => {
            return {
              unit: ele?.unit,
            };
          });
          setUnit(unit);
        }
        if (response?.data?.data?.res_zonings) {
          const bed = response?.data?.data?.res_zonings?.map((ele: any) => {
            return {
              bed: ele?.bed,
            };
          });
          setBed(bed);
        }
      },
    },
  });
  console.log(data, 'costImprovementdata');

  useEffect(() => {
    if (data?.data?.data?.res_evaluation_scenarios && !data.isStale) {
      const updateData = data.data.data.res_evaluation_scenarios;
      console.log(updateData, 'updateDataupdateDataupdateData');
      const costApproaches = updateData.filter(
        (item: { has_cost_approach: any }) => item.has_cost_approach === 1
      );
      const buildingSize = data?.data?.data?.building_size;
      setBuildingSize(buildingSize);
      setHasCostType(costApproaches.length > 0);
      setFilteredCostsData(costApproaches);
      // Pass building size to parent component
      if (onBuildingSizeChange && buildingSize) {
        onBuildingSizeChange(buildingSize);
      }
    }
  }, [data?.data?.data?.res_evaluation_scenarios]);

  const data_zonings = data?.data?.data?.res_zonings;
  useEffect(() => {}, [data?.data?.data?.res_zonings]);

  useEffect(() => {
    const sq_ft = data_zonings?.map((ele: any) => {
      return {
        sq_ft: ele.total_sq_ft,
      };
    });
    const totalSqFt = sq_ft?.reduce(
      (sum: any, item: any) => sum + item.sq_ft,
      0
    );
    setTotalSqft(totalSqFt);
  }, [data_zonings]);

  useEffect(() => {
    if (data) {
      const hasApproach = data?.data?.data?.res_evaluation_scenarios[0]?.id;
      setHasCostApproch(hasApproach);
    }
  }, [data]);

  let appraisalCostApproachId = 0;
  const mapData = data?.data?.data?.res_evaluation_scenarios;
  mapData &&
    mapData.map((item: any) => {
      if (item.id == costId) {
        appraisalCostApproachId = item.res_evaluation_cost_approach?.id;
      }
    });
  const mapValuesToParams = (values: any) => {
    // const totalDepreciation = values?.improvements?.reduce((sum: any, item: any) => {
    //   const adjustedPsf = parseFloat(item.adjusted_psf.replace(/,/g, '')) || 0;
    //   const area = item.sf_area || 0;
    //   const depreciationRate = item.depreciation || 0;

    //   const depreciationAmount = area * adjustedPsf * (depreciationRate / 100);
    //   return sum + depreciationAmount;
    // }, 0);

    // const roundedTotal = Number(totalDepreciation.toFixed(2));
    const income_source = values?.improvements?.map((ele: any) => {
      return {
        type: ele.type,
        sf_area: ele.sf_area ? ele?.sf_area : 0,
        adjusted_psf: ele.adjusted_psf
          ? parseFloat(String(ele?.adjusted_psf)?.replace(/,/g, ''))
          : 0,
        depreciation: ele?.depreciation ? +ele?.depreciation : 0,
        adjusted_cost: +ele?.adjusted_cost,
        zoning_id: ele?.zoning_id ? ele?.zoning_id : null,
        id: ele?.id,
        structure_cost:
          ele?.sf_area *
          parseFloat(String(ele?.adjusted_psf)?.replace(/,/g, '')),
        depreciation_amount:
          (ele?.sf_area * ele?.adjusted_psf * ele?.depreciation) / 100,
      };
    });
    return {
      // id: appraisalCostApproachId ? appraisalCostApproachId : Number(costId),
      id: appraisalCostApproachId ? appraisalCostApproachId : null,
      res_evaluation_id: id,
      res_evaluation_scenario_id: costId,
      effective_age: values.effective_age
        ? parseFloat(String(values?.effective_age)?.replace(/,/g, ''))
        : null,
      overall_replacement_cost: values?.overall_replacement_cost,
      // total_depreciation: roundedTotal,
      total_depreciation_percentage:
        Number(values?.improvements_total_depreciation / 100) || null,
      total_depreciated_cost: totalAdjustedCost,
      total_cost_valuation: +values?.total_cost_valuation, //
      indicated_value_psf: values?.total_cost_valuation / totalSqft,
      //   indicated_value_punit: values?.indicated_value_punit
      //     ? values?.indicated_value_punit
      //     : null,
      //   indicated_value_pbed: values?.indicated_value_pbed
      //     ? values?.indicated_value_pbed
      //     : null,
      improvements_total_sf_area: totalSqft,
      improvements_total_adjusted_ppsf:
        values?.improvements_total_adjusted_ppsf,
      improvements_total_depreciation: isNaN(
        values.improvements_total_depreciation
      )
        ? null
        : Number(Number(values.improvements_total_depreciation).toFixed(2)),
      improvements_total_adjusted_cost: totalAdjustedCost,
      comments: values.comments,
      cost_improvements: income_source,
      weighted_market_value: totalWeightedValue,

      incremental_value:
        (values?.total_cost_valuation *
          (updateEvalCostWeightInParent !== undefined &&
          updateEvalCostWeightInParent !== 0
            ? updateEvalCostWeightInParent
            : evalWeight || 0)) /
        100,
    };
  };
  const handleSubmit = (values: any) => {
    console.log(values, 'costimprovementvaluess');
    const params = mapValuesToParams(values);
    // Pass total cost valuation to parent component
    console.log(params, 'paramssss');
    mutate(params, {
      onSuccess: (res: any) => {
        toast(res.data.message);

        if (hasCostType && filtereCostdData.length > 1) {
          const costApproachId = searchParams.get('costId');
          const costIndex = filtereCostdData.findIndex(
            (element) => element.id == costApproachId
          );

          // If costId is found and it's not the first element
          if (costIndex < filtereCostdData.length - 1) {
            const costIdRedirectIndex = filtereCostdData[costIndex + 1].id;
            navigate(
              `/residential/evaluation/cost-approach?id=${id}&costId=${costIdRedirectIndex}`
            );
            return; // Exit after navigation
          }
        }
        navigate(`/residential/evaluation-exhibits?id=${id}`);
      },
    });
  };
  const appraisalData = data?.data?.data;
  if (isLoading && loading) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <CostImprovementForm
        appraisalData={appraisalData}
        updateApiData={appraisalData}
        handleSubmit={handleSubmit}
        updateData={updateData}
        typeSqft={typeSqft}
        totalSqft={totalSqft}
        costAppraisalData={costAppraisalData}
        totalAdjustedCost={totalAdjustedCost}
        setTotalAdjustedCost={setTotalAdjustedCost}
        comparisonBasis={comparisonBasis}
        unit={unit}
        bed={bed}
        setTotalCostValuations={setTotalCostValuations} // ✅ pass it here
      />
    </>
  );
};

export default ResidentialCostImprovementForm;

function CostImprovementForm({
  appraisalData,
  updateApiData,
  handleSubmit,
  updateData,
  typeSqft,
  totalSqft,
  costAppraisalData,
  totalAdjustedCost,
  setTotalAdjustedCost,
  comparisonBasis,
  unit,
  bed,
  setTotalCostValuations,
}: any) {
  if (!typeSqft) {
    return null;
  }
  const initialValues = {
    improvements:
      updateData?.length === 0
        ? typeSqft
        : updateData?.map((ele: any) => {
            const findDistributionLabel = (AllTypeJson: any) => {
              const foundItem = AllTypeJson.find(
                (item: { value: string }) => item.value === ele?.type
              );
              return foundItem ? foundItem.label : ele?.type;
            };
            return {
              adjusted_cost: ele?.adjusted_cost,
              adjusted_psf:
                ele?.adjusted_psf === null
                  ? 0
                  : ele?.adjusted_psf?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }),
              depreciation: ele?.depreciation === null ? 0 : ele?.depreciation,
              type: findDistributionLabel(AllTypeJson),
              zoning_id: ele?.zoning_id,
              sub_zone_custom: ele?.sub_zone_custom,
              sf_area: ele.sf_area,
              isDisabled: true,
              id: ele?.id,
            };
          }),
    totalAdjustedCostValue: 0,
    totalAdjustedPPSF: 0,
    year_built: appraisalData?.year_built || null,
    year_remodeled: appraisalData?.year_remodeled || null,
    comments: costAppraisalData?.comments || null,
    effective_age: costAppraisalData?.effective_age?.toLocaleString() || null,
    improvements_total_adjusted_cost:
      updateApiData?.improvements_total_adjusted_cost || '',
    improvements_total_adjusted_ppsf:
      updateApiData?.improvements_total_adjusted_ppsf || '',
    land_value: costAppraisalData?.land_value
      ? costAppraisalData?.land_value
      : null,
    improvements_total_depreciation: '',
    overall_replacement_cost: '',
    total_depreciation: '',
    total_depreciated_cost: '',
    total_cost_valuation: '',
    indicated_value_punit: '',
    indicated_value_pbed: '',
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ values }) => {
        return (
          <>
            <>
              <Form className="w-full">
                {Array.from([
                  <ResidentialCostImprovement
                    updateData={updateData}
                    totalSqft={totalSqft}
                    totalAdjustedCost={totalAdjustedCost}
                    setTotalAdjustedCost={setTotalAdjustedCost}
                  />,
                  <hr style={{ marginTop: '20px' }} />,
                  <ResidentialCostImprovementNetIncome
                    totalAdjustedCostValue={values.totalAdjustedCostValue}
                    totalAdjustedPPSF={values.totalAdjustedPPSF}
                    totalSqft={totalSqft}
                    totalAdjustedCost={totalAdjustedCost}
                    setTotalAdjustedCost={setTotalAdjustedCost}
                    comparisonBasis={comparisonBasis}
                    unit={unit}
                    bed={bed}
                    onTotalCostValuation={console.log(
                      'Total Cost Valuation:',
                      values.total_cost_valuation
                    )}
                    setTotalCostValuations={setTotalCostValuations} // 👈 pass this to child
                  />,
                ])}
              </Form>
            </>
          </>
        );
      }}
    </Formik>
  );
}
