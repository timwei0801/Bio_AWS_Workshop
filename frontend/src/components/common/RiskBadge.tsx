import { useTranslation } from 'react-i18next';
import { classifyRisk } from '../../constants/risk';

interface RiskBadgeProps {
  score: number;
  /** Show numeric percentage next to the tier label. */
  showPercent?: boolean;
  size?: 'xs' | 'sm';
}

export function RiskBadge({ score, showPercent = false, size = 'sm' }: RiskBadgeProps) {
  const { t } = useTranslation();
  const tier = classifyRisk(score);
  const sizeClass = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  return (
    <span className={`${sizeClass} font-semibold rounded-full ${tier.chipClass}`}>
      {t(tier.labelKey)}{showPercent ? ` ${(score * 100).toFixed(0)}%` : ''}
    </span>
  );
}
