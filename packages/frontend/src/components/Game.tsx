import { For, Show, createSignal } from 'solid-js';
import Button from './Button';
import { gameState, getCurrentPlayer, leaveRoom, isLeavingRoom, startGame, isStartingGame, isHost } from '../store';
import { showToast } from './Toast';
import Modal from './Modal';
import QRCode from './QRCode';
import { useI18n } from '../i18n';

export default function Game() {
  const [showQRModal, setShowQRModal] = createSignal(false);
  const { t } = useI18n();
  
  const handleLeaveRoom = async () => {
    await leaveRoom();
  };

  const handleRestartGame = async () => {
    await startGame();
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

  const currentPlayer = () => getCurrentPlayer();
  const hasRole = () => currentPlayer()?.isImpostor !== undefined;
  const isImpostor = () => currentPlayer()?.isImpostor || false;

  return (
    <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">{t('game.title')}</h1>
        <p class="text-center text-gray-600 mb-6">{t('game.gameNumber', { number: gameState.room?.gameCount || 1 })}</p>
        
        <Show when={gameState.error}>
          <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {gameState.error}
          </div>
        </Show>
        
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-lg font-semibold text-gray-900">{t('game.roomId')}</h2>
            <div class="flex space-x-2">
              <Button 
                onClick={() => setShowQRModal(true)} 
                variant="secondary" 
                size="sm"
              >
                {t('game.qrCode')}
              </Button>
              <Button 
                onClick={copyShareUrl} 
                variant="secondary" 
                size="sm"
              >
                {t('game.shareUrl')}
              </Button>
              <Button 
                onClick={copyRoomId} 
                variant="secondary" 
                size="sm"
              >
                {t('game.copyId')}
              </Button>
            </div>
          </div>
          <div class="p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
            {gameState.room?.id}
          </div>
        </div>
        
        <div class="mb-6 p-4 border border-gray-200 rounded-md">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">{t('game.yourRole')}</h2>
          
          <Show when={!hasRole()}>
            <div class="p-4 bg-yellow-100 rounded-md text-center">
              <p class="text-xl font-bold mb-2">
                {t('game.waitingForNextGame')}
              </p>
              <p class="text-sm">
                {t('game.waitingMessage')}
              </p>
            </div>
          </Show>
          
          <Show when={hasRole()}>
            <div class={`p-4 rounded-md text-center ${isImpostor() ? 'bg-red-100' : 'bg-green-100'}`}>
              <p class="text-xl font-bold mb-2">
                {isImpostor() ? t('game.youAreImpostor') : t('game.youAreCrewmate')}
              </p>
              <p class="text-sm mb-2">
                {isImpostor() 
                  ? t('game.impostorDescription') 
                  : t('game.crewmateDescription')}
              </p>
              
              {/* Display word for crewmates */}
              <Show when={!isImpostor() && gameState.room?.word}>
                <div class="mt-4 p-3 bg-white rounded border border-green-200">
                  <p class="text-sm font-medium text-gray-500">{t('game.theWordIs')}</p>
                  <p class="text-xl font-bold text-gray-900">{gameState.room?.word}</p>
                </div>
              </Show>
            </div>
          </Show>
        </div>
        
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">{t('game.players')}</h2>
          <ul class="divide-y divide-gray-200 border border-gray-200 rounded-md">
            <For each={gameState.room?.players}>
              {(player) => (
                <li class="flex justify-between items-center p-3">
                  <div class="flex items-center">
                    <span class="font-medium">{player.name}</span>
                    {player.isHost && (
                      <span class="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {t('game.host')}
                      </span>
                    )}
                    {player.id === gameState.playerId && (
                      <span class="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                        {t('game.you')}
                      </span>
                    )}
                  </div>
                </li>
              )}
            </For>
          </ul>
        </div>
        
        <div class="flex flex-col space-y-4">
          <Show when={isHost()}>
            <Button
              onClick={handleRestartGame}
              isLoading={isStartingGame()}
              variant="primary"
              fullWidth
            >
              {t('game.restartGame')}
            </Button>
          </Show>
          
          <Button
            onClick={handleLeaveRoom}
            variant="secondary"
            isLoading={isLeavingRoom()}
          >
            {t('game.leaveGame')}
          </Button>
        </div>
      </div>
      
      <Modal
        isOpen={showQRModal()}
        onClose={() => setShowQRModal(false)}
        title={t('game.roomQrCode')}
      >
        <QRCode 
          value={getShareUrl()} 
          size={250}
        />
      </Modal>
    </div>
  );
}
