import { JSX, Show } from 'solid-js';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: JSX.Element;
}

export default function Modal(props: ModalProps) {
  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">{props.title}</h2>
            <button 
              onClick={props.onClose}
              class="text-gray-500 hover:text-gray-700 text-xl"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div>
            {props.children}
          </div>
        </div>
      </div>
    </Show>
  );
}
