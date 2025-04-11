import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import Home from "./components/Home";
import Room from "./components/Room";
import JoinRoom from "./components/JoinRoom";
import LanguageSelector from "./components/LanguageSelector";
import { gameState } from "./store";
import { I18nContext, createI18nProvider } from "./i18n/index";

const App: Component = () => {
  const [roomIdFromUrl, setRoomIdFromUrl] = createSignal<string | null>(null);

  // Check for roomId in URL when component mounts
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("roomId");
    if (roomId) {
      setRoomIdFromUrl(roomId);
    }
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

        <Show when={!gameState.room && !roomIdFromUrl()}>
          <Home />
        </Show>

        <Show when={!gameState.room && roomIdFromUrl()}>
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

        <Show when={gameState.room}>
          <Room />
        </Show>
      </div>
    </I18nContext.Provider>
  );
};

export default App;
