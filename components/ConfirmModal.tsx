import { Button } from "./Button";

interface ConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  deleting?: boolean;
  message?: string;
}

export const ConfirmModal = ({ onConfirm, onCancel, deleting, message }: ConfirmModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <p className="text-gray-900 text-base">
          {message ?? "Are you sure you want to delete this streak?"}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            onClick={onCancel}
            disabled={Boolean(deleting)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={Boolean(deleting)}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
