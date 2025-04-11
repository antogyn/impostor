import { createSignal, onCleanup, Show } from 'solid-js';

interface ToastProps {
  message: string;
  duration?: number;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export default function Toast(props: ToastProps) {
  const [isVisible, setIsVisible] = createSignal(true);
  
  const duration = props.duration || 3000;
  const type = props.type || 'success';
  
  const bgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };
  
  // Auto-hide the toast after duration
  const timer = setTimeout(() => {
    setIsVisible(false);
    if (props.onClose) props.onClose();
  }, duration);
  
  // Clean up timer when component unmounts
  onCleanup(() => clearTimeout(timer));
  
  return (
    <Show when={isVisible()}>
      <div class={`fixed bottom-4 right-4 px-4 py-2 rounded-md text-white shadow-md ${bgColor()} transition-opacity duration-300`}>
        {props.message}
      </div>
    </Show>
  );
}

// Helper function to show a toast message
let activeToast: (() => void) | null = null;

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000) {
  // If there's an active toast, close it
  if (activeToast) {
    activeToast();
  }
  
  // Create a container for the toast if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Clear the container
  toastContainer.innerHTML = '';
  
  // Create a div for the toast
  const toastDiv = document.createElement('div');
  toastDiv.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md text-white shadow-md bg-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-500 transition-opacity duration-300`;
  toastDiv.textContent = message;
  
  // Add the toast to the container
  toastContainer.appendChild(toastDiv);
  
  // Set up the removal function
  activeToast = () => {
    if (toastDiv.parentNode) {
      toastDiv.parentNode.removeChild(toastDiv);
    }
    activeToast = null;
  };
  
  // Auto-remove after duration
  setTimeout(activeToast, duration);
  
  return activeToast;
}
