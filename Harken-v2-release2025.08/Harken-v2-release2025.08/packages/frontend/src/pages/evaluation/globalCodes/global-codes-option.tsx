import { useMemo } from 'react';
import { useGet } from '@/hook/useGet';

type Option = {
  label: string;
  value: string;
};

const useGlobalCodeOptions = () => {
  const { data: globalCodeData } = useGet<any>({
    queryKey: 'global-codes',
    endPoint: `globalCodes`,
    config: { refetchOnWindowFocus: false },
  });

  const getOptionsByType = (type: string): Option[] => {
    const category = globalCodeData?.data?.data?.find(
      (item: any) => item.type === type
    );
    if (!category) return [];
    return category.options.map((option: any) => ({
      label: option.name,
      value: option.code,
    }));
  };

  const UtilitiesOptions = useMemo(
    () => getOptionsByType('utilities'),
    [globalCodeData]
  );
  const ApproachTypeOptions = useMemo(
    () => getOptionsByType('approaches'),
    [globalCodeData]
  );
  const TopographyOptions = useMemo(
    () => getOptionsByType('topographies'),
    [globalCodeData]
  );
  const LotshapeOptions = useMemo(
    () => getOptionsByType('lot_shape'),
    [globalCodeData]
  );
  const FrontageOptions = useMemo(
    () => getOptionsByType('frontages'),
    [globalCodeData]
  );
  const ConditionOptions = useMemo(
    () => getOptionsByType('condition'),
    [globalCodeData]
  );
  const MultiFamilyOption = useMemo(
    () => getOptionsByType('multi_family'),
    [globalCodeData]
  );
  const ResidentialOption = useMemo(
    () => getOptionsByType('residential'),
    [globalCodeData]
  );
  const HospitalityOption = useMemo(
    () => getOptionsByType('hospitality'),
    [globalCodeData]
  );
  const OfficeOption = useMemo(
    () => getOptionsByType('office'),
    [globalCodeData]
  );
  const RetailOption = useMemo(
    () => getOptionsByType('retail'),
    [globalCodeData]
  );
  const IndustrialOption = useMemo(
    () => getOptionsByType('industrial'),
    [globalCodeData]
  );
  const SpecialPurposeOption = useMemo(
    () => getOptionsByType('special'),
    [globalCodeData]
  );

  const AppraisalTypeOptions = useMemo(
    () => getOptionsByType('property_types'),
    [globalCodeData]
  );
  const propertyOptions = useMemo(
    () => getOptionsByType('property_types'),
    [globalCodeData]
  );
  const propertyTypes = useMemo(
    () => getOptionsByType('property_types'),
    [globalCodeData]
  );
  const AppraisalPropertyRightsOption = useMemo(
    () => getOptionsByType('property_rights'),
    [globalCodeData]
  );
  const AppraisalPropertyClassOptions = useMemo(
    () => getOptionsByType('property_class'),
    [globalCodeData]
  );
  const AppraisalfoundationTypeOptions = useMemo(
    () => getOptionsByType('foundation'),
    [globalCodeData]
  );
  const AppraisalParkingTypeOptions = useMemo(
    () => getOptionsByType('parking'),
    [globalCodeData]
  );
  const AppraisalADAOptions = useMemo(
    () => getOptionsByType('ada_compliance'),
    [globalCodeData]
  );
  const AppraisalBasementTypeOptions = useMemo(
    () => getOptionsByType('basement'),
    [globalCodeData]
  );
  const AppraisalConstructionTypeOptions = useMemo(
    () => getOptionsByType('structure_construction_type'),
    [globalCodeData]
  );
  const AppraisalExteriorTypeOptions = useMemo(
    () => getOptionsByType('exterior'),
    [globalCodeData]
  );
  const AppraisalRoofTypeOptions = useMemo(
    () => getOptionsByType('roof'),
    [globalCodeData]
  );
  const AppraisalPlumbingTypeOptions = useMemo(
    () => getOptionsByType('plumbing'),
    [globalCodeData]
  );
  const AppraisalWindowsTypeOptions = useMemo(
    () => getOptionsByType('windows'),
    [globalCodeData]
  );
  const AppraisalMostLikelyOwnerUserOptions = useMemo(
    () => getOptionsByType('most_likely_owner_user'),
    [globalCodeData]
  );
  const landTypeOptions = useMemo(
    () => getOptionsByType('land_type'),
    [globalCodeData]
  );
  const HeatingCoolingOptions = useMemo(
    () => getOptionsByType('heating_cooling'),
    [globalCodeData]
  );
  const ElectricalOptions = useMemo(
    () => getOptionsByType('electrical'),
    [globalCodeData]
  );
  const AllSubPropertyJson = useMemo(
    () => [
      ...MultiFamilyOption,
      ...ResidentialOption,
      ...HospitalityOption,
      ...OfficeOption,
      ...RetailOption,
      ...IndustrialOption,
      ...SpecialPurposeOption,
    ],
    [
      MultiFamilyOption,
      ResidentialOption,
      HospitalityOption,
      OfficeOption,
      RetailOption,
      IndustrialOption,
      SpecialPurposeOption,
    ]
  );

  return {
    ApproachTypeOptions,
    AppraisalTypeOptions,
    propertyOptions,
    propertyTypes,
    MultiFamilyOption,
    ResidentialOption,
    HospitalityOption,
    OfficeOption,
    RetailOption,
    IndustrialOption,
    SpecialPurposeOption,
    AllSubPropertyJson,
    FrontageOptions,
    ConditionOptions,
    LotshapeOptions,
    TopographyOptions,
    UtilitiesOptions,
    AppraisalPropertyRightsOption,
    AppraisalPropertyClassOptions,
    AppraisalfoundationTypeOptions,
    AppraisalParkingTypeOptions,
    AppraisalADAOptions,
    AppraisalBasementTypeOptions,
    AppraisalConstructionTypeOptions,
    AppraisalExteriorTypeOptions,
    AppraisalRoofTypeOptions,
    AppraisalPlumbingTypeOptions,
    AppraisalWindowsTypeOptions,
    AppraisalMostLikelyOwnerUserOptions,
    landTypeOptions,
    HeatingCoolingOptions,
    ElectricalOptions,
  };
};

export default useGlobalCodeOptions;
