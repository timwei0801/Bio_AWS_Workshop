import { useTranslation } from 'react-i18next';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-2 p-4 text-red-400">
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 text-sm bg-red-900/40 hover:bg-red-900/60 text-red-200 rounded ring-1 ring-red-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
