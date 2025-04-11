import { JSX, splitProps } from 'solid-js';

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, [
    'children',
    'class',
    'variant',
    'size',
    'isLoading',
    'fullWidth',
    'disabled',
  ]);

  const variant = () => local.variant || 'primary';
  const size = () => local.size || 'md';
  const isDisabled = () => local.disabled || local.isLoading;

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
  };
  
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  };
  
  const disabledClasses = 'opacity-60';
  const fullWidthClasses = 'w-full';

  const classes = [
    baseClasses,
    variantClasses[variant()],
    sizeClasses[size()],
    isDisabled() ? disabledClasses : '',
    local.fullWidth ? fullWidthClasses : '',
    local.class || '',
  ].join(' ');

  return (
    <button
      {...others}
      class={classes}
      disabled={isDisabled()}
    >
      {local.isLoading ? (
        <>
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : local.children}
    </button>
  );
}
