
interface YourCustomModalProps {
  title: any;
  description: any;
  onConfirm: any;
  onCancel: any;
}

export const YourCustomModal = ({
  title,
  description,
  onConfirm,
  onCancel,
}: YourCustomModalProps) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <p className="mb-6">{description}</p>
      <div className="flex justify-end space-x-3">
        <button onClick={onCancel} className="text-gray-600">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Leave
        </button>
      </div>
    </div>
  </div>
);
