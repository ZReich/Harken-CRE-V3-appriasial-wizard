import { Box, Button } from '@mui/material';
import crossImage from '../../../../images/cross.png';
import TextEditor from '@/components/styles/text-editor';
const LeaseApproachAdjustmentModal = ({
  open,
  setOpen,
  adjustmentData,
  handleSave,
  editorText,
}: any) => {
  const closeNav = () => {
    setOpen(false);
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
              ADJUSTMENT NOTES
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
              {/* <TinyMceTextEditor
                editorData={editorData}
                editorContent={
                  // adjustmentNote ? adjustmentNote?.adjustment_note : ''
                  adjustmentData?.adjustment_note
                    ? adjustmentData?.adjustment_note
                    : ''
                }
              /> */}

              <TextEditor
                editorData={editorData}
                editorContent={
                  // adjustmentNote ? adjustmentNote?.adjustment_note : ''
                  adjustmentData?.adjustment_note
                    ? adjustmentData?.adjustment_note
                    : ''
                }
                value={adjustmentData?.adjustment_note} // Ensure the 'value' prop is provided
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
export default LeaseApproachAdjustmentModal;
