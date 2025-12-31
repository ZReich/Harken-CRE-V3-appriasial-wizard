import { Grid, TextField } from '@mui/material';
import CommonSellerBuyier from '@/components/elements/button/seller-buyier-button';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMutate, RequestType } from '@/hook/useMutate';


const CreateSec = ({ id2, cond,passId}: any) => {
    const navigate = useNavigate();
    const [section, setSection] = useState('');
    const [orders, setOrder] = useState(1);

    const mutation = useMutate<any, any>({
        queryKey: 'create-section',
        endPoint: 'template/save-section',
        requestType: RequestType.POST,
    });


    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        const data = {
            "template_id": id2 === undefined ? Number(passId) : Number(id2),
            "parent_id": null,
            "title": section,
            "order": orders,
        };

        try {
            const response = await mutation.mutateAsync(data);
            const title = response?.data?.data?.title;
            setOrder(orders + 1);

            const template_id = response?.data?.data?.template_id;
            const section_id = response?.data?.data?.id;
            if (cond !== 'main-screen') {
                navigate(`/template/${template_id}/${section_id}`, {
                    state: {title}
                  });
            }
        } catch (error) {
            console.log("error", error);
        }

    };

    return (
        <div className="pb-3 w-96">
            <form onSubmit={handleSubmit} className='px-7'>
                <Grid container spacing={3}>
                    <Grid item xs={12}>

                        <TextField
                            fullWidth
                            label="Section Name"
                            required
                            variant="outlined"
                            margin="normal"
                            onChange={(e) => setSection(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 0,
                                    borderTop: 'none',
                                    borderRight: 'none',
                                    borderLeft: 'none',
                                    '&:hover fieldset': {
                                        borderColor: 'none',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'primary.main',
                                        borderBottomWidth: '2px',
                                    },
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderTop: 'none',
                                    borderRight: 'none',
                                    borderLeft: 'none',
                                },
                            }}
                        />
                    </Grid>
                </Grid>

                <Grid container className="mt-[25px] mb-[15px]">
                    <Grid item xs={12}>
                        <CommonSellerBuyier
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{ fontSize: '14px' }}
                        >
                            SAVE
                        </CommonSellerBuyier>
                    </Grid>
                </Grid>
            </form>
        </div>
    );
};

export default CreateSec;
