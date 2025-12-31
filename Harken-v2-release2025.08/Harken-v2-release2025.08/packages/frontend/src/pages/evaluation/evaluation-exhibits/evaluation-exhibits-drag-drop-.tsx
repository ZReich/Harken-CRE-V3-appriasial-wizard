import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '@/components/icons';
import EditableExhibitName from './editable-exhibit-name';

const EvaluationDragAndDropRow = ({ row, deleteListingItem, onUpdate, evaluationId }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // const handleDownload = () => {
  //   const link = document.createElement('a');
  //   link.href = import.meta.env.VITE_S3_URL + row.dir;
  //   link.target = '_blank';
  //   link.download = row.filename;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };
  const handleDownload = async () => {
    const url = import.meta.env.VITE_S3_URL + row.dir;

    // Fetch the file as a Blob
    const response = await fetch(url);
    const blob = await response.blob();

    // Create a temporary URL for the Blob
    const blobURL = window.URL.createObjectURL(blob);

    // Create an anchor element and trigger download
    const link = document.createElement('a');
    link.href = blobURL;
    link.setAttribute('download', row.filename); // Set the download attribute with filename
    document.body.appendChild(link);
    link.click();

    // Clean up by removing the link and revoking the Blob URL
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobURL);
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableCell className="text-customBlue font-medium">
        <Icons.ArrowRightAltIcon className="text-limeGreen" />
      </TableCell>
      <TableCell>
        <EditableExhibitName 
          initialValue={row.filename} 
          rowId={row.id}
          evaluationId={evaluationId}
          onUpdate={onUpdate}
        />
      </TableCell>
      <TableCell className="text-customBlue">
        <a
          href={`${import.meta.env.VITE_S3_URL}${row.dir}`}
          target="_blank"
          style={{ textDecoration: 'none' }}
          rel="noopener noreferrer"
          download={row.filename}
          className="cursor-pointer"
        >
          {row.dir}
        </a>
      </TableCell>
      <TableCell>
        <span>
          <Icons.DeleteIcon
            className="text-red-500 cursor-pointer"
            onClick={() => deleteListingItem(row)}
          />
        </span>
        <span>
          <Icons.CloudDownloadIcon
            onClick={handleDownload}
            className="text-limeGreen cursor-pointer"
          />
        </span>
      </TableCell>
    </TableRow>
  );
};

export default EvaluationDragAndDropRow;
