import { createSignal } from 'solid-js';
import Button from './Button.tsx';
import CreateRoom from './CreateRoom.tsx';
import JoinRoom from './JoinRoom.tsx';
import { useI18n } from '../i18n/index.ts';

export default function Home() {
  const [view, setView] = createSignal<'menu' | 'create' | 'join'>('menu');
  const { t } = useI18n();

  return (
    <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 class="text-3xl font-bold text-center text-gray-900 mb-6">{t('home.title')}</h1>
        
        {view() === 'menu' && (
          <div class="space-y-4">
            <Button 
              onClick={() => setView('create')} 
              fullWidth
            >
              {t('home.createRoom')}
            </Button>
            <Button 
              onClick={() => setView('join')} 
              variant="secondary" 
              fullWidth
            >
              {t('home.joinRoom')}
            </Button>
          </div>
        )}
        
        {view() === 'create' && (
          <CreateRoom onBack={() => setView('menu')} />
        )}
        
        {view() === 'join' && (
          <JoinRoom onBack={() => setView('menu')} />
        )}
      </div>
    </div>
  );
}
