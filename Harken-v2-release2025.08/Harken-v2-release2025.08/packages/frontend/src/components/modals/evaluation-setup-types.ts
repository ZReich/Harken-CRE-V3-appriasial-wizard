import { ApproachEnum } from "./evaluation-setup-enums";

export interface ScenarioItem {
  name: string;
  [ApproachEnum.SALES]: number;
  [ApproachEnum.COST]: number;
  [ApproachEnum.INCOME]: number;
  [ApproachEnum.MULTI_FAMILY]: number;
  [ApproachEnum.CAP]: number;
  [ApproachEnum.LEASE]: number;
}