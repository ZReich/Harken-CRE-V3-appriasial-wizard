import { FormikErrors } from "formik";

export interface UploadPhotoPagesResponse{
    data:{
        data:Data[],
        message:string,
        statusCode:number
    }
}
export interface Data{
    appraisal_id:number,
    caption:string,
    date_created:{val:string},
    id:number,
    image_url:string,
    last_updated:string,
    order:number
}
export interface UploadPhotoData{
    // appraisal_id:string,
    photos_taken_by:string,
    photo_date:string,
    // photos:any,
}
export interface Photo {
    image_url: string;
    caption: string | FormikErrors<string>;
    order: number;
  }