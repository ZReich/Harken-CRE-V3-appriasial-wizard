import * as Yup from 'yup';

export const EvalutionPhotoPagesSchema = Yup.object().shape({
    photos_taken_by: Yup.string().required('This field is required.'),
    photo_date: Yup.string().required('This field is required.'),
    photos: Yup.array().of(Yup.object().shape({
        caption: Yup.string().required('This field is required.'),
      })),
  });
  