import { For, Show, createSignal } from "solid-js";
import Button from "./Button.tsx";
import {
  gameState,
  getCurrentPlayer,
  leaveRoom,
  isLeavingRoom,
  startGame,
  isStartingGame,
  isHost,
  kickPlayer,
  isKickingPlayer,
} from "../store.ts";
import { showToast } from "./Toast.tsx";
import Modal from "./Modal.tsx";
import QRCode from "./QRCode.tsx";
import { useI18n } from "../i18n/index.ts";

export default function Room() {
  const [showQRModal, setShowQRModal] = createSignal(false);
  const [kickingPlayerId, setKickingPlayerId] = createSignal<string | null>(
    null
  );
  const [showPlayerCountError, setShowPlayerCountError] = createSignal(false);
  const { t } = useI18n();

  const isWaiting = () => gameState.room?.status === "waiting";
  const isPlaying = () => gameState.room?.status === "playing";

  const handleLeaveRoom = async () => {
    await leaveRoom();
  };

  const handleStartGame = async () => {
    await startGame();
  };

  const handleKickPlayer = async (playerId: string) => {
    setKickingPlayerId(playerId);
    await kickPlayer(playerId);
    setKickingPlayerId(null);
  };

  const getShareUrl = () => {
    if (!gameState.room) return "";
    return `${window.location.origin}?roomId=${gameState.room.id}`;
  };

  const copyShareUrl = async () => {
    const url = getShareUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      showToast(t("room.urlCopied"), "success");
    } catch (err) {
      console.error("Failed to copy share URL:", err);
      showToast(t("room.failedToCopyUrl"), "error");
    }
  };

  const copyRoomId = async () => {
    if (!gameState.room) return;

    try {
      await navigator.clipboard.writeText(gameState.room.id);
      showToast(t("room.idCopied"), "success");
    } catch (err) {
      console.error("Failed to copy room ID:", err);
      showToast(t("room.failedToCopyId"), "error");
    }
  };

  const currentPlayer = () => getCurrentPlayer();
  const hasRole = () => currentPlayer()?.isPlaying;
  const isImpostor = () => currentPlayer()?.isImpostor || false;

  const getStartingPlayer = () => {
    if (!gameState.room?.startingPlayerId) return null;
    return gameState.room.players.find(
      (p) => p.id === gameState.room?.startingPlayerId
    );
  };

  return (
    <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center text-gray-900 mb-2">
          {t(isWaiting() ? "room.lobbyTitle" : "room.gameTitle")}
        </h1>
        <p class="text-center text-gray-600 mb-6">
          {t("room.gameNumber", { number: gameState.room?.gameCount || 1 })}
        </p>

        <Show when={gameState.error}>
          <div class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {gameState.error}
          </div>
        </Show>

        {/* Room ID Section */}
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-lg font-semibold text-gray-900">
              {t("room.roomId")}
            </h2>
            <div class="flex space-x-2">
              <Button
                onClick={() => setShowQRModal(true)}
                variant="secondary"
                size="sm"
              >
                {t("room.qrCode")}
              </Button>
              <Button onClick={copyShareUrl} variant="secondary" size="sm">
                {t("room.shareUrl")}
              </Button>
              <Button onClick={copyRoomId} variant="secondary" size="sm">
                {t("room.copyId")}
              </Button>
            </div>
          </div>
          <div class="p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
            {gameState.room?.id}
          </div>
        </div>

        {/* Role Information - Only shown during game */}
        <Show when={isPlaying()}>
          <div class="mb-6 p-4 border border-gray-200 rounded-md">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">
              {t("room.yourRole")}
            </h2>

            {/* Starting Player */}
            <Show when={gameState.room?.startingPlayerId}>
              <div class="mb-4 p-3 bg-blue-50 rounded-md text-center">
                <p class="text-sm font-medium text-gray-700">
                  {t("room.startingPlayer")}
                </p>
                <p class="text-lg font-bold text-gray-900">
                  {getStartingPlayer()?.name}
                  {getStartingPlayer()?.id === gameState.playerId
                    ? ` (${t("room.you")})`
                    : ""}
                </p>
              </div>
            </Show>

            <Show when={!hasRole()}>
              <div class="p-4 bg-yellow-100 rounded-md text-center">
                <p class="text-xl font-bold mb-2">
                  {t("room.waitingForNextGame")}
                </p>
                <p class="text-sm mb-2">{t("room.waitingMessage")}</p>
                <Show when={isHost()}>
                  <div class="mt-3 p-2 bg-white rounded-md border border-yellow-200">
                    <p class="text-sm text-gray-700">
                      As the host, you can restart the game to include all players.
                    </p>
                  </div>
                </Show>
              </div>
            </Show>

            <Show when={hasRole()}>
              <div
                class={`p-4 rounded-md text-center ${
                  isImpostor() ? "bg-red-100" : "bg-green-100"
                }`}
              >
                <p class="text-xl font-bold mb-2">
                  {isImpostor()
                    ? t("room.youAreImpostor")
                    : t("room.youAreCrewmate")}
                </p>
                <p class="text-sm mb-2">
                  {isImpostor()
                    ? t("room.impostorDescription")
                    : t("room.crewmateDescription")}
                </p>

                {/* Display word for crewmates */}
                <Show when={!isImpostor() && gameState.room?.word}>
                  <div class="mt-4 p-3 bg-white rounded border border-green-200">
                    <p class="text-sm font-medium text-gray-500">
                      {t("room.theWordIs")}
                    </p>
                    <p class="text-xl font-bold text-gray-900">
                      {gameState.room?.word}
                    </p>
                  </div>
                </Show>
              </div>
            </Show>
          </div>
        </Show>

        {/* Players List */}
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">
            {t("room.players")}
          </h2>
          <ul class="divide-y divide-gray-200 border border-gray-200 rounded-md">
            <For each={gameState.room?.players}>
              {(player) => (
                <li class="flex justify-between items-center p-3">
                  <div class="flex items-center">
                    <span class="font-medium">{player.name}</span>
                    {player.isHost && (
                      <span class="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {t("room.host")}
                      </span>
                    )}
                    {player.id === gameState.playerId && (
                      <span class="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                        {t("room.you")}
                      </span>
                    )}
                  </div>

                  <div class="flex items-center">
                    {/* Player status indicator - only shown during game */}
                    <Show when={isPlaying()}>
                      <span class={`mr-3 flex items-center ${player.isPlaying ? 'text-green-600' : 'text-amber-600'}`}>
                        {player.isPlaying ? (
                          <span title={t("room.playerActive")} class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-xs ml-1">{t("room.playing")}</span>
                          </span>
                        ) : (
                          <span title={t("room.playerWaiting")} class="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-xs ml-1">{t("room.waiting")}</span>
                          </span>
                        )}
                      </span>
                    </Show>
                    
                    <Show when={isHost() && player.id !== gameState.playerId}>
                      <Button
                        onClick={() => handleKickPlayer(player.id)}
                        variant="danger"
                        size="sm"
                        isLoading={
                          isKickingPlayer() && kickingPlayerId() === player.id
                        }
                      >
                        {t("room.kick")}
                      </Button>
                    </Show>
                  </div>
                </li>
              )}
            </For>
          </ul>
        </div>

        {/* Action Buttons */}
        <div class={isWaiting() ? "flex space-x-3" : "flex flex-col space-y-4"}>
          <Show when={isHost()}>
            <Button
              onClick={handleStartGame}
              isLoading={isStartingGame()}
              variant="primary"
              fullWidth
            >
              {t(isWaiting() ? "room.startGame" : "room.restartGame")}
            </Button>
          </Show>

          <Button
            onClick={handleLeaveRoom}
            variant="secondary"
            isLoading={isLeavingRoom()}
          >
            {t(isWaiting() ? "room.leaveRoom" : "room.leaveGame")}
          </Button>
        </div>

        {/* Player Count Error - Only shown in lobby */}
        <Show when={isWaiting() && isHost() && showPlayerCountError()}>
          <p class="mt-2 text-sm text-red-600 text-center font-medium">
            {t("room.notEnoughPlayers")}
          </p>
        </Show>
      </div>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal()}
        onClose={() => setShowQRModal(false)}
        title={t("room.roomQrCode")}
      >
        <QRCode value={getShareUrl()} size={250} />
      </Modal>
    </div>
  );
}
