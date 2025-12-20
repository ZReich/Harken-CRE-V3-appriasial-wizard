import { Box, Button, Typography } from '@mui/material';
import crossImage from '../../../images/cross.png';
import TextEditor from '@/components/styles/text-editor';
import { useState, useEffect } from 'react';

const EvaluationLeaseApproachAdjustmentNotesModal = ({
  open,
  setOpen,
  adjustmentData,
  handleSave,
  editorText,
  indexType,
  values
}: any) => {
  const adjustment=values?.tableData?.find((_ele:any,index:any)=>index===indexType);
  const adjustmentNote=adjustment?.adjustment_note;
  const html =adjustmentNote ;
const tempDiv:any = document.createElement('div');
tempDiv.innerHTML = html;

const textLength = tempDiv.textContent.length;
  const [tempContent, setTempContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');

  useEffect(() => {
    if (open) {
      const content = adjustmentData?.adjustment_note?.slice(0, 250) || '';
      setOriginalContent(content);
      setTempContent(content);
    }
  }, [open, adjustmentData]);

  const closeNav = () => {
    setTempContent(originalContent);
    editorText(originalContent);
    setOpen(false);
  };

  const editorData = (event: any) => {
    setTempContent(event);
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
              EXPLAIN ADJUSTMENT
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
              <label className="text-customGray text-xs">
                Notes (Maximum 250 characters)
              </label>

              <TextEditor
                editorData={editorData}
                editorContent={tempContent}
                value={tempContent}
              />
              <Typography variant="caption" color={tempContent.length > 250 ? 'error' : 'textSecondary'}>
                {textLength}/250 characters
              </Typography>
              <div className="flex justify-end">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setOriginalContent(tempContent);
                    handleSave();
                    setOpen(false);
                  }}
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
export default EvaluationLeaseApproachAdjustmentNotesModal;
