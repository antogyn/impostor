import { createSignal, For, Show } from 'solid-js';
import Button from './Button';
import { 
  gameState, 
  isHost, 
  leaveRoom, 
  isLeavingRoom, 
  startGame, 
  isStartingGame,
  kickPlayer,
  isKickingPlayer
} from '../store';
import { showToast } from './Toast';
import Modal from './Modal';
import QRCode from './QRCode';
import { useI18n } from '../i18n';

export default function Lobby() {
  const [kickingPlayerId, setKickingPlayerId] = createSignal<string | null>(null);
  const [showPlayerCountError, setShowPlayerCountError] = createSignal(false);
  const [showQRModal, setShowQRModal] = createSignal(false);
  const { t } = useI18n();

  const copyRoomId = async () => {
    if (!gameState.room) return;
    
    try {
      await navigator.clipboard.writeText(gameState.room.id);
      showToast(t('lobby.idCopied'), 'success');
    } catch (err) {
      console.error('Failed to copy room ID:', err);
      showToast(t('lobby.failedToCopyId'), 'error');
    }
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
  };

  const handleStartGame = async () => {
    console.log("handleStartGame");
    const playerCount = gameState.room?.players.length || 0;
    if (playerCount < 3) {
      console.log('Not enough players, showing error message');
      setShowPlayerCountError(true);
      return;
    }
    await startGame();
  };

  const handleKickPlayer = async (playerId: string) => {
    setKickingPlayerId(playerId);
    await kickPlayer(playerId);
    setKickingPlayerId(null);
  };

  const getShareUrl = () => {
    if (!gameState.room) return '';
    return `${window.location.origin}?roomId=${gameState.room.id}`;
  };

  const copyShareUrl = async () => {
    const url = getShareUrl();
    if (!url) return;
    
    try {
      await navigator.clipboard.writeText(url);
      showToast(t('lobby.urlCopied'), 'success');
    } catch (err) {
      console.error('Failed to copy share URL:', err);
      showToast(t('lobby.failedToCopyUrl'), 'error');
    }
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">{t('lobby.title')}</h1>
        <p class="text-center text-gray-600 mb-6">{t('lobby.gameNumber', { number: gameState.room?.gameCount || 1 })}</p>
        
        <Show when={gameState.error}>
          <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {gameState.error}
          </div>
        </Show>
        
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-lg font-semibold text-gray-900">{t('lobby.roomId')}</h2>
            <div class="flex space-x-2">
              <Button 
                onClick={() => setShowQRModal(true)} 
                variant="secondary" 
                size="sm"
              >
                {t('lobby.qrCode')}
              </Button>
              <Button 
                onClick={copyShareUrl} 
                variant="secondary" 
                size="sm"
              >
                {t('lobby.shareUrl')}
              </Button>
              <Button 
                onClick={copyRoomId} 
                variant="secondary" 
                size="sm"
              >
                {t('lobby.copyId')}
              </Button>
            </div>
          </div>
          <div class="p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
            {gameState.room?.id}
          </div>
        </div>
        
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">{t('lobby.players')}</h2>
          <ul class="divide-y divide-gray-200 border border-gray-200 rounded-md">
            <For each={gameState.room?.players}>
              {(player) => (
                <li class="flex justify-between items-center p-3">
                  <div class="flex items-center">
                    <span class="font-medium">{player.name}</span>
                    {player.isHost && (
                      <span class="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {t('lobby.host')}
                      </span>
                    )}
                    {player.id === gameState.playerId && (
                      <span class="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                        {t('lobby.you')}
                      </span>
                    )}
                  </div>
                  
                  <Show when={isHost() && player.id !== gameState.playerId}>
                    <Button
                      onClick={() => handleKickPlayer(player.id)}
                      variant="danger"
                      size="sm"
                      isLoading={isKickingPlayer() && kickingPlayerId() === player.id}
                    >
                      {t('lobby.kick')}
                    </Button>
                  </Show>
                </li>
              )}
            </For>
          </ul>
        </div>
        
        <div class="flex space-x-3">
          <Button
            onClick={handleLeaveRoom}
            variant="secondary"
            isLoading={isLeavingRoom()}
          >
            {t('lobby.leaveRoom')}
          </Button>
          
          <Show when={isHost()}>
            <Button
              onClick={handleStartGame}
              isLoading={isStartingGame()}
              variant="primary"
              fullWidth
            >
              {t('lobby.startGame')}
            </Button>
          </Show>
        </div>
        
        <Show when={isHost() && showPlayerCountError()}>
          <p class="mt-2 text-sm text-red-600 text-center font-medium">
            {t('lobby.notEnoughPlayers')}
          </p>
        </Show>
      </div>
      
      <Modal
        isOpen={showQRModal()}
        onClose={() => setShowQRModal(false)}
        title={t('lobby.roomQrCode')}
      >
        <QRCode 
          value={getShareUrl()} 
          size={250}
        />
      </Modal>
    </div>
  );
}
