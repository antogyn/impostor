import { createSignal } from 'solid-js';
import Button from './Button.tsx';
import Input from './Input.tsx';
import { createRoom, isCreatingRoom, gameState } from '../store.ts';
import { useI18n } from '../i18n/index.ts';

interface CreateRoomProps {
  onBack: () => void;
}

export default function CreateRoom(props: CreateRoomProps) {
  const [playerName, setPlayerName] = createSignal('');
  const [language, setLanguage] = createSignal<'en' | 'fr'>('en');
  const [error, setError] = createSignal('');
  const { t } = useI18n();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!playerName().trim()) {
      setError(t('createRoom.nameRequired'));
      return;
    }
    
    setError('');
    const roomId = await createRoom(playerName().trim(), language());
    
    if (!roomId) {
      setError(gameState.error || t('createRoom.failedToCreate'));
    }
  };

  return (
    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-900">{t('createRoom.title')}</h2>
      
      <form onSubmit={handleSubmit} class="space-y-4">
        <Input
          label={t('createRoom.yourName')}
          value={playerName()}
          onInput={(e) => setPlayerName(e.currentTarget.value)}
          placeholder={t('createRoom.enterYourName')}
          fullWidth
          error={error()}
          disabled={isCreatingRoom()}
          maxLength={20}
          required
        />
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700">
            {t('createRoom.gameLanguage')}
          </label>
          <div class="flex space-x-4">
            <label class="inline-flex items-center">
              <input
                type="radio"
                class="form-radio"
                name="language"
                value="en"
                checked={language() === 'en'}
                onChange={() => setLanguage('en')}
                disabled={isCreatingRoom()}
              />
              <span class="ml-2">English</span>
            </label>
            <label class="inline-flex items-center">
              <input
                type="radio"
                class="form-radio"
                name="language"
                value="fr"
                checked={language() === 'fr'}
                onChange={() => setLanguage('fr')}
                disabled={isCreatingRoom()}
              />
              <span class="ml-2">Français</span>
            </label>
          </div>
        </div>
        
        <div class="flex space-x-3">
          <Button
            type="button"
            onClick={props.onBack}
            variant="secondary"
            disabled={isCreatingRoom()}
          >
            {t('common.back')}
          </Button>
          
          <Button
            type="submit"
            isLoading={isCreatingRoom()}
            fullWidth
          >
            {t('createRoom.createRoom')}
          </Button>
        </div>
      </form>
    </div>
  );
}
