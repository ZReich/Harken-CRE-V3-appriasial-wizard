
export const setPriceSquareFootResidential = (values: any, building_size: any) => {
 

    let priceSquareFoot = 0;
    let  sale_price_res : any = parseFloat((values.sale_price as string)?.replace(/[$,]/g, ''));
    
    if (values.sale_price == "") {
        sale_price_res = 0;
    }
    if (building_size == "") {
        building_size = 1;
    }

    priceSquareFoot = (parseFloat(sale_price_res) / parseFloat(building_size));
    return priceSquareFoot;
};
