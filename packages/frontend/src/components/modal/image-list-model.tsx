import { ReactNode } from 'react';
const ImageListModal = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <div className="fixed z-50 inset-0 overflow-auto bg-black bg-opacity-40 flex justify-center items-center w-full">
                <div className="modal-content mx-auto p-0 border border-gray-300 shadow-lg relative bg-white rounded-md w-4/5">
                    {children}
                </div>
            </div>
        </>
    )
}
export default ImageListModal;