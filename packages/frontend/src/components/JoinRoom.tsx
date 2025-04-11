import { createSignal, Show } from 'solid-js';
import Button from './Button.tsx';
import Input from './Input.tsx';
import { joinRoom, isJoiningRoom, gameState } from '../store.ts';
import Modal from './Modal.tsx';
import QRScanner from './QRScanner.tsx';
import { showToast } from './Toast.tsx';
import { useI18n } from '../i18n/index.ts';

interface JoinRoomProps {
  onBack: () => void;
  initialRoomId?: string;
}

export default function JoinRoom(props: JoinRoomProps) {
  const [roomId, setRoomId] = createSignal(props.initialRoomId || '');
  const [playerName, setPlayerName] = createSignal('');
  const [error, setError] = createSignal('');
  const [showScannerModal, setShowScannerModal] = createSignal(false);
  const { t } = useI18n();
  
  const handleQRScan = (value: string) => {
    setShowScannerModal(false);
    
    // Extract roomId from URL if it's a URL
    try {
      const url = new URL(value);
      const roomIdParam = url.searchParams.get('roomId');
      if (roomIdParam) {
        setRoomId(roomIdParam);
        showToast(t('joinRoom.roomIdScanned'), 'success');
        return;
      }
    } catch (e) {
      // Not a URL, try to use the value directly
    }
    
    // If not a URL or no roomId param, use the value as is
    setRoomId(value);
    showToast(t('joinRoom.roomIdScanned'), 'success');
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!roomId().trim()) {
      setError(t('joinRoom.roomIdRequired'));
      return;
    }
    
    if (!playerName().trim()) {
      setError(t('joinRoom.nameRequired'));
      return;
    }
    
    setError('');
    const success = await joinRoom(roomId().trim(), playerName().trim());
    
    if (!success) {
      setError(gameState.error || t('joinRoom.failedToJoin'));
    }
  };

  return (
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-900">{t('joinRoom.title')}</h2>
      
      <form onSubmit={handleSubmit} class="space-y-4">
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="block text-sm font-medium text-gray-700">{t('joinRoom.roomId')}</label>
            <Button
              type="button"
              onClick={() => setShowScannerModal(true)}
              variant="secondary"
              size="sm"
              disabled={isJoiningRoom()}
            >
              {t('joinRoom.scanQrCode')}
            </Button>
          </div>
          <Input
            value={roomId()}
            onInput={(e) => setRoomId(e.currentTarget.value)}
            placeholder={t('joinRoom.enterRoomId')}
            fullWidth
            disabled={isJoiningRoom()}
            required
          />
        </div>
        
        <Input
          label={t('joinRoom.yourName')}
          value={playerName()}
          onInput={(e) => setPlayerName(e.currentTarget.value)}
          placeholder={t('joinRoom.enterYourName')}
          fullWidth
          error={error()}
          disabled={isJoiningRoom()}
          maxLength={20}
          required
        />
        
        <div class="flex space-x-3">
          <Button
            type="button"
            onClick={props.onBack}
            variant="secondary"
            disabled={isJoiningRoom()}
          >
            {t('common.back')}
          </Button>
          
          <Button
            type="submit"
            isLoading={isJoiningRoom()}
            fullWidth
          >
            {t('joinRoom.joinRoom')}
          </Button>
        </div>
      </form>
      
      <Modal
        isOpen={showScannerModal()}
        onClose={() => setShowScannerModal(false)}
        title={t('qrScanner.title')}
      >
        <QRScanner 
          onScan={handleQRScan}
          onError={(error) => setError(error)}
        />
      </Modal>
    </div>
  );
}
