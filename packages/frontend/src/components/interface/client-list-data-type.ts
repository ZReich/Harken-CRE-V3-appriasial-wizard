export interface ClientListDataType{
    data:{
        data:{
            clients:[
            {
                account_id:number;
                city:string;
                company:string;
                email_address:string;
                first_name:string;
                id:number | string;
                last_name:string;
                last_updated:string;
                phone_number:string;
                place_id:string;
                shared:number;
                state:string;
                street_address:string;
                title:string;
                user_id:number;
                zipcode:string;
            }
        ]}
    }
}

export interface ClientListAllDataType{
    data:{
        data:[
            {
                account_id:number;
                city:string;
                company:string;
                email_address:string;
                first_name:string;
                id:number | string;
                last_name:string;
                last_updated:string;
                phone_number:string;
                place_id:string;
                shared:number;
                state:string;
                street_address:string;
                title:string;
                user_id:number;
                zipcode:string;
            }
        ]
    }
}