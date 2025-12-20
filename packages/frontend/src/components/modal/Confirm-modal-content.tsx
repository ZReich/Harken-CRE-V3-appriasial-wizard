

import React from 'react';

interface ConfirmationModalContentProps {
  close: () => void;
}

const ConfirmationModalContent: React.FC<ConfirmationModalContentProps> = ({ close }) => {
  return (
    <div className='pb-3 w-96'>
      <h3 className='text-center text-blue-500'>CONFIRM</h3>
      <p className='text-center'>Are you sure you want to continue?</p>
      <div className='flex justify-center pb-2'>
        <button
          className="rounded mt-4 py-2 text-white bg-blue-500 hover:bg-green-500 text-white px-3 border-none"
          onClick={close}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModalContent;



