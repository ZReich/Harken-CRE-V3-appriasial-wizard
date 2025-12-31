import React from 'react';
import '../assets/TextEditor.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  onSave: () => void;
  onSnippet: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EditorModal: React.FC<ModalProps> = ({ isOpen, onClose, selectedText,onSnippet, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay-textEditor">
      <div className="modal-content-textEditor">
        <h3 className="text-center mb-5 label-font">Save a Text as Snippet</h3>
        <div className="row">
          <div className="col-12 col-md-8">
            <div className="row mb-3">
              <div className="col-6">
                <label className="p-3 label-font">Snippet Name</label>
              </div>
              <div className="col-6">
                <input
                  className="input-bor-style form-control"
                  type="text"
                  onChange={onSnippet}
                  style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-2 p-4 label-font">Snippet</div>
              <div className="col-10">
                <textarea
                  className="input-bor-style form-control"
                  value={selectedText}
                  readOnly
                  style={{ height: "60px", width: "100%" }}
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-12 d-flex justify-content-end mb-2" style={{marginTop:"20px"}}>
                <button
                  className="btn btn-secondary me-2"
                  onClick={onClose}
                >
                  Close
                </button>
                <button
                style={{marginLeft:"20px"}}
                  className="btn btn-primary"
                  onClick={onSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorModal;
