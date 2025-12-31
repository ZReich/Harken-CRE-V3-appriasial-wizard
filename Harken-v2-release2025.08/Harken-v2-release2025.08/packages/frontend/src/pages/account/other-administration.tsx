import { Paper,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useGet } from '@/hook/useGet';
import { useParams } from 'react-router-dom';


interface RowData {
    created_by: string;
    email_address: string;
    status: string;
}

const OtherAdministratorTable: React.FC = () => {
    const { id } = useParams();
;
    const { data} = useGet<any>({
        queryKey: `accounts/get-other-admins/:account_id`,
        endPoint: `accounts/get-other-admins/${id}`,
        config: { enabled: true, refetchOnWindowFocus: false },
    });
 
    const dataMap: RowData[] = data?.data?.data || [];

    return (
        <>
            <div className="flex pt-7 pb-7 px-9">
                <Typography
                    variant="h4"
                    component="h4"
                    className="text-xl font-bold"
                >
                    Other Administrators
                </Typography>
            </div>

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="caption table">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                Name
                            </TableCell>
                            <TableCell>
                                Email
                            </TableCell>
                            <TableCell>
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dataMap.map((row,index) => (
                            <TableRow key={index}>
                                <TableCell>{row.created_by}</TableCell>
                                <TableCell>{row.email_address}</TableCell>
                                <TableCell>{row.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default OtherAdministratorTable;
