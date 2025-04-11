import { createSignal, onMount, onCleanup } from 'solid-js';
import { Html5Qrcode } from 'html5-qrcode';
import Button from './Button';

interface QRScannerProps {
  onScan: (value: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner(props: QRScannerProps) {
  const [isStarted, setIsStarted] = createSignal(false);
  const [error, setError] = createSignal('');
  let scanner: Html5Qrcode | null = null;
  const scannerContainerId = 'qr-scanner-container';

  onMount(() => {
    scanner = new Html5Qrcode(scannerContainerId);
  });

  onCleanup(() => {
    if (scanner && isStarted()) {
      scanner.stop().catch(err => console.error('Error stopping scanner:', err));
    }
  });

  const startScanner = async () => {
    if (!scanner) return;
    
    setError('');
    setIsStarted(true);
    
    try {
      await scanner.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // On successful scan
          props.onScan(decodedText);
          if (scanner) {
            scanner.stop().catch(err => console.error('Error stopping scanner:', err));
          }
        },
        (errorMessage) => {
          // Ignore errors during scanning as they're usually just frames without QR codes
          console.log(errorMessage);
        }
      );
    } catch (err) {
      setIsStarted(false);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      if (props.onError) {
        props.onError(errorMessage);
      }
    }
  };

  return (
    <div class="flex flex-col items-center">
      <div 
        id={scannerContainerId} 
        class="w-full h-64 bg-gray-100 rounded-md overflow-hidden"
      ></div>
      
      {error() && (
        <p class="mt-2 text-sm text-red-600">{error()}</p>
      )}
      
      {!isStarted() && (
        <Button
          onClick={startScanner}
          variant="primary"
          class="mt-4"
          fullWidth
        >
          Start Camera
        </Button>
      )}
      
      <p class="mt-2 text-sm text-gray-600 text-center">
        Position the QR code within the frame to scan
      </p>
    </div>
  );
}
