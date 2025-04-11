import { createSignal, onMount } from 'solid-js';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
}

export default function QRCode(props: QRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = createSignal('');
  const size = props.size || 256;

  onMount(() => {
    generateQRCode();
  });

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCodeLib.toDataURL(props.value, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  return (
    <div class="flex flex-col items-center">
      {qrDataUrl() ? (
        <img 
          src={qrDataUrl()} 
          alt="QR Code" 
          width={size} 
          height={size} 
          class="border border-gray-200 rounded-md"
        />
      ) : (
        <div 
          class="flex items-center justify-center border border-gray-200 rounded-md"
          style={{ width: `${size}px`, height: `${size}px` }}
        >
          <p>Generating QR code...</p>
        </div>
      )}
      <p class="mt-2 text-sm text-gray-600 text-center">
        Scan this QR code to join the room
      </p>
    </div>
  );
}
