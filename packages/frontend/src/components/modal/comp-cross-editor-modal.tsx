import { ReactNode } from 'react';
const CompDeleteModalCrossEditor = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="fixed z-50 inset-0 overflow-auto bg-black bg-opacity-40 flex justify-center items-center w-full">
        <div className="pt-[50px] modal-content mx-auto gap-3 p-0 border border-gray-300 flex-wrap shadow-lg overflow-hidden h-fit relative bg-white rounded-md w-3/4 inline-flex px-7 py-3">
          {children}
        </div>
      </div>
    </>
  );
};
export default CompDeleteModalCrossEditor;
