export interface UpdateProfileUserType {
    data:{
        statusCode: number;
        data:{
            map(arg0: (url: any) => { image_url: any; caption: string; }): unknown;
            id: any;
            url:string
        };
        message:string
    }

}