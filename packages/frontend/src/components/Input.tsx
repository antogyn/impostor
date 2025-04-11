import { JSX, splitProps } from 'solid-js';

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export default function Input(props: InputProps) {
  const [local, others] = splitProps(props, [
    'class',
    'label',
    'error',
    'fullWidth',
  ]);

  const baseClasses = 'rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-500';
  const fullWidthClasses = 'w-full';

  const classes = [
    baseClasses,
    local.error ? errorClasses : '',
    local.fullWidth ? fullWidthClasses : '',
    local.class || '',
  ].join(' ');

  return (
    <div class="flex flex-col space-y-1">
      {local.label && (
        <label class="text-sm font-medium text-gray-700">
          {local.label}
        </label>
      )}
      <input
        {...others}
        class={classes}
      />
      {local.error && (
        <p class="text-sm text-red-600">{local.error}</p>
      )}
    </div>
  );
}
