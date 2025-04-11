import { For } from 'solid-js';
import { useI18n } from '../i18n/index.ts';

export default function LanguageSelector() {
  const { locale, setLocale, availableLanguages } = useI18n();
  
  return (
    <div class="flex items-center space-x-2">
      <For each={Object.entries(availableLanguages)}>
        {([code, name]) => (
          <button
            class={`px-2 py-1 text-sm rounded ${locale() === code ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setLocale(code)}
            aria-label={`Switch language to ${name}`}
          >
            {name}
          </button>
        )}
      </For>
    </div>
  );
}
