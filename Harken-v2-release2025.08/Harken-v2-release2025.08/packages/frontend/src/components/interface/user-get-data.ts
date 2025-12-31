export interface UserGetDataType{
    status: any;
    transactions: any;
    significant_in_pdf: boolean;
    account_id: any;
    comp_adjustment_mode: any;
// data:{
    data:{
        data:{
            user:{
                account_id:number;
                affiliations:string;
                approved_by_admin:string;
                background:string;
                buildout_id:null | number;
                comp_adjustment_mode:string;
                created:string;
                created_by:string;
                education:string;
                email_address:string;
                first_name:string;
                id:number;
                last_login_at:string;
                last_name:string;
                last_updated:string;
                opt_in_token:any;
                paid_through_date:any;
                password:string;
                phone_number:string;
                position:string;
                profile_image_url:string;
                qualification:string;
                responsibility:string;
                role:number;
                signature_image_url:string;
                significant_in_pdf:number;
                status:string;
                users_transactions:
                    [{
                        category:string;
                        date_created:string;
                        id:number;
                        name:string;
                        sf:number;
                        type:string;
                        user_id:number;
                    }]
                
            }
        }
    }
// }

}