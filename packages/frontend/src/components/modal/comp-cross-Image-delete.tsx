import { ReactNode } from 'react';
const CompDeleteModalCrossImage = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="fixed z-50 inset-0 overflow-auto bg-black bg-opacity-40 flex justify-center items-center w-full">
        <div className="w-7/12 modal-content mx-auto gap-x-6 gap-y-4 border border-gray-300 flex-wrap shadow-lg relative bg-white rounded-md xl:w-3/12 overflow-hidden inline-flex px-7 py-4">
          {children}
        </div>
      </div>
    </>
  );
};
export default CompDeleteModalCrossImage;
