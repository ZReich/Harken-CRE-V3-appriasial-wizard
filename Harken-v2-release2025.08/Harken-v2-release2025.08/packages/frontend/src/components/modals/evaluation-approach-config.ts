import { ApproachEnum, ApproachLabelEnum } from './evaluation-setup-enums';

export const getApproachOptions = (activeType: string | null) => {
  return [
    {
      key: ApproachEnum.SALES,
      label: ApproachLabelEnum.SALES,
    },
    {
      key: ApproachEnum.COST,
      label: ApproachLabelEnum.COST,
      hide: activeType === 'land_only',
    },
    {
      key: ApproachEnum.INCOME,
      label: ApproachLabelEnum.INCOME,
    },
    {
      key: ApproachEnum.MULTI_FAMILY,
      label: ApproachLabelEnum.MULTI_FAMILY,
      hide: activeType === 'land_only',
    },
    {
      key: ApproachEnum.CAP,
      label: ApproachLabelEnum.CAP,
      hide: activeType === 'land_only',
    },
    {
      key: ApproachEnum.LEASE,
      label: ApproachLabelEnum.LEASE,
    },
  ];
};

export const createEmptyScenario = () => ({
  name: '',
  [ApproachEnum.SALES]: 0,
  [ApproachEnum.COST]: 0,
  [ApproachEnum.INCOME]: 0,
  [ApproachEnum.MULTI_FAMILY]: 0,
  [ApproachEnum.CAP]: 0,
  [ApproachEnum.LEASE]: 0,
});
import {
  ImageOrientation,
  PageType,
  UniqueValueKeys,
} from '@/pages/appraisal/overview/OverviewEnum';

export interface TableDataItem {
  id: number;
  description: string;
  orientation: ImageOrientation;
  page: PageType;
  uniqueValue: UniqueValueKeys;
}

export const getTableData = (): TableDataItem[] => [
  {
    id: 1,
    description: 'Sub. Property',
    orientation: ImageOrientation.HORIZONTAL,
    page: PageType.COVER,
    uniqueValue: UniqueValueKeys.COVER,
  },
  {
    id: 2,
    description: 'Sub. Property 2',
    orientation: ImageOrientation.VERTICAL,
    page: PageType.TABLE_OF_CONTENTS,
    uniqueValue: UniqueValueKeys.TABLE_OF_CONTENTS,
  },
  {
    id: 3,
    description: 'Sub. Property 3',
    orientation: ImageOrientation.VERTICAL,
    page: PageType.EXECUTIVE_SUMMARY,
    uniqueValue: UniqueValueKeys.EXECUTIVE_SUMMARY,
  },
  {
    id: 4,
    description: 'Sub. Property 4',
    orientation: ImageOrientation.HORIZONTAL,
    page: PageType.PROPERTY_SUMMARY,
    uniqueValue: UniqueValueKeys.PROPERTY_SUMMARY_TOP,
  },
  {
    id: 5,
    description: 'Sub. Property 5',
    orientation: ImageOrientation.HORIZONTAL,
    page: PageType.PROPERTY_SUMMARY,
    uniqueValue: UniqueValueKeys.PROPERTY_SUMMARY_BOTTOM,
  },
  {
    id: 6,
    description: 'Sub. Property 6',
    orientation: ImageOrientation.HORIZONTAL,
    page: PageType.PROPERTY_DETAILS,
    uniqueValue: UniqueValueKeys.SUB_PROPERTY_1,
  },
  {
    id: 7,
    description: 'Sub. Property 7',
    orientation: ImageOrientation.HORIZONTAL,
    page: PageType.PROPERTY_DETAILS,
    uniqueValue: UniqueValueKeys.SUB_PROPERTY_2,
  },
  {
    id: 8,
    description: 'Sub. Property 8',
    orientation: ImageOrientation.HORIZONTAL,
    page: PageType.PROPERTY_DETAILS,
    uniqueValue: UniqueValueKeys.SUB_PROPERTY_3,
  },
];

export const filterTableData = (
  tableData: TableDataItem[],
  activeType: string | null,
  hasCostApproach: boolean
): TableDataItem[] => {
  return tableData.filter((row) => {
    // Case 1: land_only active
    if (activeType === 'land_only') {
      return [1, 2, 3].includes(row.id);
    }
    // Case 2: Based on cost approach
    return hasCostApproach ? row.id <= 8 : row.id <= 5;
  });
};
