import { topographyOptions, lotshapeOptions, frontageOptions, conditionOptions, utilitiesOptions } from '@/pages/comps/create-comp/SelectOption';
import { AmenitisResidentialComp } from '@/pages/residential/enum/ResidentialEnum';
import {
    BasementOptions, ExteriorOptions, RoofOptions, ElectricalOptions, PlumbingOptions, HeatingCoolingOptions, WindowOptions, BedroomOptions,
    BarthroomOptions, GarageOptions, FencingOptions, FireplaceOptions
} from '@/pages/residential/create-comp/SelectOption';

export const getValueOrTypeMyOwnTopoGraphy = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = topographyOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
};

export const getValueOrTypeMyOwnLotShape = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = lotshapeOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
};

export const getValueOrTypeMyOwnFrontage = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = frontageOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyOwnCondition = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = conditionOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyOwnBasement = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = BasementOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyUtiliesSelect = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = utilitiesOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyExterior = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = ExteriorOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyRoof = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = RoofOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyElectrical = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = ElectricalOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyPlumbing = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = PlumbingOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyHeating_Cooling = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = HeatingCoolingOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyWindows = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = WindowOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyBedRoom = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = BedroomOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyBathroom = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = BarthroomOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyGarage = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = GarageOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyFencing = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = FencingOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}

export const getValueOrTypeMyFirePlace = (value: any) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    const foundOption = FireplaceOptions.find((option) => option.value === value);
    return foundOption
        ? foundOption.value
        : AmenitisResidentialComp.TYPE_MY_OWN;
}