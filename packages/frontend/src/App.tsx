import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import Home from "./components/Home.tsx";
import Room from "./components/Room.tsx";
import JoinRoom from "./components/JoinRoom.tsx";
import LanguageSelector from "./components/LanguageSelector.tsx";
import { gameState, loadSession, clearSession, attemptReconnection, initConnectionMonitoring } from "./store.ts";
import { I18nContext, createI18nProvider } from "./i18n/index.ts";
import { showToast } from "./components/Toast.tsx";

const App: Component = () => {
  const [roomIdFromUrl, setRoomIdFromUrl] = createSignal<string | null>(null);
  const [isReconnecting, setIsReconnecting] = createSignal(false);

  // Handle reconnection and URL parameters when component mounts
  onMount(async () => {
    // If not already in a room
    if (!gameState.room) {
      // First check for roomId in URL
      const urlParams = new URLSearchParams(window.location.search);
      const roomIdParam = urlParams.get("roomId");
      
      const session = loadSession();

      if (roomIdParam && session?.roomId !== roomIdParam) {
        // URL parameter takes precedence - clear any existing session
        clearSession();
        setRoomIdFromUrl(roomIdParam);
      } else {
        // No URL parameter, try to reconnect from saved session
        const session = loadSession();
        
        if (session) {
          // We have a saved session, attempt to reconnect
          setIsReconnecting(true);
          
          const success = await attemptReconnection(
            session.roomId,
            session.playerId,
            session.playerName
          );
          
          if (success) {
            showToast("Reconnected to game", "success");
          } else {
            showToast("Previous session expired", "error");
          }
          
          setIsReconnecting(false);
        }
      }
    }
    
    // Initialize connection monitoring to handle "zombie state" scenarios
    initConnectionMonitoring();
  });

  // Log game state changes for debugging
  createEffect(() => {
    console.log("Game state updated:", gameState);
  });

  // Create the i18n provider
  const { contextValue } = createI18nProvider();

  return (
    <I18nContext.Provider value={contextValue}>
      <div class="min-h-screen bg-gray-50">
        <div class="absolute top-4 right-4 z-10">
          <LanguageSelector />
        </div>

        <Show when={isReconnecting()}>
          <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
              <h1 class="text-xl font-bold text-gray-900 mb-4">Reconnecting...</h1>
              <p class="text-gray-600 mb-2">Attempting to reconnect to your previous game session.</p>
              <p class="text-gray-500 text-sm">If you were disconnected for a while, you may rejoin as a new player.</p>
              <div class="mt-4">
                <div class="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          </div>
        </Show>

        <Show when={!isReconnecting() && !gameState.room && !roomIdFromUrl()}>
          <Home />
        </Show>

        <Show when={!isReconnecting() && !gameState.room && roomIdFromUrl()}>
          <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
            <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
              <h1 class="text-3xl font-bold text-center text-gray-900 mb-6">
                Impostor Game
              </h1>
              <JoinRoom
                onBack={() => {
                  setRoomIdFromUrl(null);
                  // Clear the URL parameter without refreshing the page
                  window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname
                  );
                }}
                initialRoomId={roomIdFromUrl() || ""}
              />
            </div>
          </div>
        </Show>

        <Show when={!isReconnecting() && gameState.room}>
          <Room />
        </Show>
      </div>
    </I18nContext.Provider>
  );
};

export default App;
