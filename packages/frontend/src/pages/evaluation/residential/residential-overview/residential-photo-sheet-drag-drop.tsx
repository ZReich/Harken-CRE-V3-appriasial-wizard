import { Icons } from '@/components/icons';
import { Table, TableBody, TableCell, TableRow } from '@mui/material';
import * as React from 'react';
import { List, arrayMove } from 'react-movable';

const PhotoSheetDragDrop: React.FC = () => {
  const [photos, setPhotos] = React.useState([
    { order: 1, image_url: '/path/to/image1.jpg' },
    { order: 2, image_url: '/path/to/image2.jpg' },
    { order: 3, image_url: '/path/to/image3.jpg' },
  ]);

  return (
    <Table>
      <List
        values={photos}
        onChange={({ oldIndex, newIndex }) =>
          setPhotos(arrayMove(photos, oldIndex, newIndex))
        }
        renderList={({ children, props }) => (
          <TableBody {...props}>{children}</TableBody>
        )}
        renderItem={({ value: row, props }) => (
          <TableRow
            {...props}
            key={row.order}
            sx={{
              '&:last-child td, &:last-child th': {
                border: 0,
              },
            }}
          >
            <TableCell component="th" scope="row">
              <img
                src={row.image_url}
                alt="Photo"
                className="w-28 h-28 object-cover"
              />
            </TableCell>
            <TableCell align="center">
              <input
                type="text"
                className="py-2.5 px-5 rounded border border-solid border-[#e9e9e9]"
              />
            </TableCell>
            <TableCell align="right">
              <Icons.VisibleIcon className="cursor-pointer text-[#0DA1C7]" />
              <Icons.DeleteIcon className="cursor-pointer ms-1 text-[#ff0000]" />
            </TableCell>
          </TableRow>
        )}
      />
    </Table>
  );
};

export default PhotoSheetDragDrop;
