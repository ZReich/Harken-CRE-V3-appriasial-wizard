import { ResponseType } from '@/components/interface/response-type';
import { useGet } from '@/hook/useGet';
import { RequestType, useMutate } from '@/hook/useMutate';
import { AllTypeJson } from '@/pages/comps/create-comp/SelectOption';
import { Form, Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CostImprovementNetIncome } from './evaluation-cost-improvement-net-income';
import { EvaluationCostImprovement } from './evaluation-cost-improvemnt';
interface EvauationCostImprovementFormProps {
  onBuildingSizeChange?: (size: string) => void;
  onTotalCostValuationChange?: (totalCostVal: any) => void;
  onTotalAdjustedCost?: (totalAdjustCost: any) => void;
  totalWeightedValue: any;
  updateEvalCostWeightInParent: any;
}

const EvauationCostImprovementForm: React.FC<
  EvauationCostImprovementFormProps
> = ({
  onBuildingSizeChange,
  onTotalCostValuationChange,
  onTotalAdjustedCost,
  totalWeightedValue,
  updateEvalCostWeightInParent,
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
  const [evalWeight, setEvalWeight] = useState<number | any>(null);

  const id = searchParams.get('id');
  const costId = searchParams.get('costId');
  const navigate = useNavigate();
  const [totalCostValuations, setTotalCostValuations] = useState(0); // or null if preferred

  const { mutate } = useMutate<ResponseType, any>({
    queryKey: 'save-cost-approach-Improvements',
    endPoint: `evaluations/save-cost-approach-Improvements`,
    requestType: RequestType.POST,
  });
  console.log('totalCostValuations', updateEvalCostWeightInParent);

  useEffect(() => {
    if (id && costId) {
      setTimeout(() => {
        refetch();
      }, 500);
    }
  }, [costId]);

  const { isLoading: loading, refetch } = useGet<any>({
    queryKey: 'evaluation',
    endPoint: `evaluations/get-cost-approach?evaluationId=${id}&evaluationScenarioId=${costId}`,
    config: {
      enabled: Boolean(hasCostApproch),
      onSuccess: (response: any) => {
        setCostAppraisalData(response?.data?.data);
        const costData = response?.data?.data?.eval_weight;
        const evalWeightValue: any = costData * 100;

        setEvalWeight(evalWeightValue);

        if (
          response?.data?.data?.improvements &&
          response?.data?.data?.improvements.length > 0
        ) {
          setUpdateData(response?.data?.data?.improvements);
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
          sf_area: ele?.sq_ft || 0,
          isDisabled: true,
          structure_cost: 0,
          depreciation_amount: 0,
        };
      });
    }
    return [];
  };

  const { data, isLoading } = useGet<any>({
    queryKey: 'evaluations/get',
    endPoint: `evaluations/get/${id}`,
    config: {
      refetchOnWindowFocus: false,
      onSuccess: (response: any) => {
        setComparisonBasis(response?.data?.data?.comparison_basis);
        if (response?.data?.data?.zonings) {
          const type_sqft = response?.data?.data?.zonings?.map((ele: any) => {
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
              sf_area: ele?.sq_ft,
              isDisabled: true,
              structure_cost: 0,
              depreciation_amount: 0,
            };
          });
          setTypeSqft(type_sqft);
        }
        if (response?.data?.data?.zonings) {
          const unit = response?.data?.data?.zonings?.map((ele: any) => {
            return {
              unit: ele?.unit,
            };
          });
          setUnit(unit);
        }
        if (response?.data?.data?.zonings) {
          const bed = response?.data?.data?.zonings?.map((ele: any) => {
            return {
              bed: ele?.bed,
            };
          });
          setBed(bed);
        }
      },
    },
  });

  useEffect(() => {
    if (data?.data?.data?.scenarios && !data.isStale) {
      const updateData = data.data.data.scenarios;

      const costApproaches = updateData.filter(
        (item: { has_cost_approach: any }) => item.has_cost_approach === 1
      );
      setHasCostType(costApproaches.length > 0);
      setFilteredCostsData(costApproaches);
    }
  }, [data?.data?.data?.scenarios]);

  const data_zonings = data?.data?.data?.zonings;
  useEffect(() => {}, [data?.data?.data?.zonings]);

  useEffect(() => {
    const sq_ft = data_zonings?.map((ele: any) => ({ sq_ft: ele.sq_ft }));
    const totalSqFt = sq_ft?.reduce(
      (sum: any, item: any) => sum + item.sq_ft,
      0
    );
    setTotalSqft(totalSqFt);

    const comparisonBasis = data?.data?.data?.comparison_basis;

    if (onBuildingSizeChange && comparisonBasis) {
      if (comparisonBasis === 'Bed') {
        const totalBeds = data_zonings?.reduce(
          (sum: number, item: any) => sum + (item?.bed || 0),
          0
        );
        onBuildingSizeChange(totalBeds.toString());
      } else if (comparisonBasis === 'Unit') {
        const totalUnits = data_zonings?.reduce(
          (sum: number, item: any) => sum + (item?.unit || 0),
          0
        );
        onBuildingSizeChange(totalUnits.toString());
      } else {
        onBuildingSizeChange(totalSqFt?.toString());
      }
    }

    console.log('totalsqft', totalSqFt);
  }, [data_zonings, data?.data?.data?.comparison_basis, onBuildingSizeChange]);

  useEffect(() => {
    if (data) {
      const hasApproach = data?.data?.data?.scenarios[0]?.id;
      setHasCostApproch(hasApproach);
    }
  }, [data]);

  // Call onTotalAdjustedCost prop when totalAdjustedCost changes
  useEffect(() => {
    if (onTotalAdjustedCost && totalAdjustedCost !== undefined) {
      onTotalAdjustedCost(totalAdjustedCost);
    }
  }, [totalAdjustedCost, onTotalAdjustedCost]);
  useEffect(() => {
    if (onTotalCostValuationChange && totalCostValuations !== undefined) {
      onTotalCostValuationChange(totalCostValuations);
    }
  }, [totalCostValuations, onTotalCostValuationChange]);

  let appraisalCostApproachId = 0;
  const mapData = data?.data?.data?.evaluation_approaches;
  mapData &&
    mapData.map((item: any) => {
      if (item.id == costId) {
        appraisalCostApproachId = item.evaluation_cost_approach?.id;
      }
    });
  const mapValuesToParams = (values: any) => {
    console.log('valuescostssss', values?.total_cost_valuation * evalWeight);
    const totalDepreciation = values?.improvements?.reduce(
      (sum: any, item: any) => {
        const adjustedPsf =
          parseFloat(item.adjusted_psf.replace(/,/g, '')) || 0;
        const area = item.sf_area || 0;
        const depreciationRate = item.depreciation || 0;

        const depreciationAmount =
          area * adjustedPsf * (depreciationRate / 100);
        return sum + depreciationAmount;
      },
      0
    );

    const roundedTotal = Number(totalDepreciation.toFixed(2));
    const income_source = values?.improvements?.map((ele: any) => {
      return {
        type: ele.type,
        sf_area: ele.sf_area ? ele?.sf_area : 0,
        adjusted_psf: ele.adjusted_psf
          ? parseFloat(String(ele?.adjusted_psf)?.replace(/,/g, ''))
          : null,
        depreciation: ele?.depreciation ? +ele?.depreciation : null,
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
      evaluation_id: id,
      evaluation_scenario_id: costId,
      effective_age: values.effective_age
        ? parseFloat(String(values?.effective_age)?.replace(/,/g, ''))
        : null,
      overall_replacement_cost: values?.overall_replacement_cost,
      total_depreciation: roundedTotal,
      total_depreciation_percentage: Number(
        values?.improvements_total_depreciation / 100
      ),
      // total_depreciated_cost: +values?.improvements_total_adjusted_cost,
      total_depreciated_cost: Number(totalAdjustedCost?.toFixed(2)),
      total_cost_valuation: Number(values?.total_cost_valuation.toFixed(2)), //
      indicated_value_psf: Number(
        (values?.total_cost_valuation / totalSqft)?.toFixed(2)
      ),
      indicated_value_punit: values?.indicated_value_punit
        ? values?.indicated_value_punit
        : null,
      indicated_value_pbed: values?.indicated_value_pbed
        ? values?.indicated_value_pbed
        : null,
      improvements_total_sf_area: totalSqft,
      // improvements_total_adjusted_ppsf:
      //   values?.improvements_total_adjusted_ppsf,
      improvements_total_adjusted_ppsf: Number(
        values?.improvements_total_adjusted_ppsf.toFixed(2)
      ),
      // improvements_total_depreciation: values?.improvements_total_depreciation,
      improvements_total_depreciation: Number(
        values?.improvements_total_depreciation?.toFixed(2)
      ),
      // improvements_total_adjusted_cost: +totalAdjustedCost,
      improvements_total_adjusted_cost: Number(totalAdjustedCost?.toFixed(2)),

      comments: values.comments,
      improvements: income_source,
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
    const params = mapValuesToParams(values);
    // Call the prop functions if they exist
    if (onTotalCostValuationChange && totalCostValuations) {
      onTotalCostValuationChange(totalCostValuations);
    }

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
              `/evaluation/cost-approach?id=${id}&costId=${costIdRedirectIndex}`
            );
            return; // Exit after navigation
          }
        }
        navigate(`/evaluation-exhibits?id=${id}`);
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

export default EvauationCostImprovementForm;

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
              adjusted_psf: ele?.adjusted_psf
                ? ele?.adjusted_psf?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '0',
              depreciation: ele?.depreciation ? ele?.depreciation : '0',
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
                  <EvaluationCostImprovement
                    updateData={updateData}
                    totalSqft={totalSqft}
                    totalAdjustedCost={totalAdjustedCost}
                    setTotalAdjustedCost={setTotalAdjustedCost}
                  />,
                  <hr style={{ marginTop: '20px' }} />,
                  <CostImprovementNetIncome
                    totalAdjustedCostValue={values.totalAdjustedCostValue}
                    totalAdjustedPPSF={values.totalAdjustedPPSF}
                    totalSqft={totalSqft}
                    totalAdjustedCost={totalAdjustedCost}
                    setTotalAdjustedCost={setTotalAdjustedCost}
                    comparisonBasis={comparisonBasis}
                    unit={unit}
                    bed={bed}
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
