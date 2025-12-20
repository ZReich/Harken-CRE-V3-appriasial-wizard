import TextEditor from '@/components/styles/text-editor';
import { Box, Button } from '@mui/material';
import crossImage from '../../../../images/cross.png';
const ResidentialSubjectPropertyAdjustmentNoteModal = ({
  setNoteModalOpen,
  open,
  editorText,
  handleSave,
  salesNote,
}: any) => {
  const closeNav = () => {
    editorText(salesNote); // Reset to the saved value on close
    setNoteModalOpen(false);
  };

  const editorData = (event: any) => {
    editorText(event);
  };

  return (
    <>
      <Box
        className={`element overlay z-50 backdrop-brightness-75 pb-10 pt-[104px] justify-end flex top-0 right-0 fixed overflow-x-hidden min-h-full transition-width duration-500 ${open ? 'open' : ''}`}
      >
        <Box className="overlay-content rounded-lg max-w-[1030px] w-full relative flex flex-col bg-white shadow-zinc-900">
          <Box className="rounded relative justify-between flex items-center p-4 bg-[#E7F6FA]">
            <Box className="text-customDeeperSkyBlue font-bold text-base">
              NOTES
            </Box>

            <Box
              onClick={closeNav}
              className="cursor-pointer flex items-center"
            >
              <img
                src={crossImage}
                alt="crossImage"
                className="h-[14px] w-[22px] px-1"
              />
            </Box>
          </Box>

          {open && (
            <div className="p-4">
              <TextEditor
                editorData={editorData}
                editorContent={salesNote ? salesNote : ''}
              />
              <div className="flex justify-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  className="bg-[#0DA1C7] mt-4"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </Box>
      </Box>
    </>
  );
};
export default ResidentialSubjectPropertyAdjustmentNoteModal;
