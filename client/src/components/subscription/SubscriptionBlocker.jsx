/**
 * SubscriptionBlocker — full-page blocker shown when subscription has expired.
 *
 * Design:
 *   - Animated lock icon with a pulsing ring behind it.
 *   - Heading + description.
 *   - Two plan comparison cards (Basic / Pro) side by side.
 *   - Primary CTA "Obunani yangilash" button.
 *   - Full dark mode support.
 *
 * No props — reads translations from uiStore.
 */

import { Lock, Zap, Check, Star, Building2 } from 'lucide-react';
import Button from '../ui/Button';
import useUiStore from '../../stores/uiStore';

/* Plan comparison data */
const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    icon: Building2,
    price: "30 000 so'm",
    period: 'mashina/oy',
    color: 'blue',
    features: [
      "Cheksiz reyslar",
      "Haydovchi paneli",
      "Moliyaviy hisobotlar",
      "Moy kuzatuvi",
    ],
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Star,
    price: "50 000 so'm",
    period: 'oy',
    color: 'purple',
    features: [
      "Basic imkoniyatlari",
      "Cheksiz mashina/haydovchi",
      "Kengaytirilgan tahlillar",
      "Ustuvor qo'llab-quvvatlash",
    ],
    highlight: true,
  },
];

/* Color config for plan cards */
const planColors = {
  blue: {
    badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/40',
    icon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    check: 'text-blue-500',
    border: 'border-slate-200 dark:border-slate-700',
  },
  purple: {
    badge: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/40',
    icon: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    check: 'text-purple-500',
    border: 'border-primary-500 dark:border-primary-500',
  },
};

const SubscriptionBlocker = () => {
  const { t } = useUiStore();

  return (
    <div
      className={[
        'min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center',
        'px-4 py-12 text-center',
      ].join(' ')}
    >
      {/* ── Animated lock icon ── */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Outer pulse ring */}
        <span
          aria-hidden="true"
          className={[
            'absolute w-28 h-28 rounded-full',
            'bg-red-100 dark:bg-red-900/20',
            'animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]',
          ].join(' ')}
        />
        {/* Middle ring */}
        <span
          aria-hidden="true"
          className={[
            'absolute w-20 h-20 rounded-full',
            'bg-red-200/60 dark:bg-red-900/30',
          ].join(' ')}
        />
        {/* Lock icon circle */}
        <div
          className={[
            'relative w-16 h-16 rounded-2xl',
            'bg-gradient-to-br from-red-500 to-red-600',
            'flex items-center justify-center',
            'shadow-[0_8px_32px_-4px_rgba(239,68,68,0.5)]',
          ].join(' ')}
        >
          <Lock size={28} className="text-white" />
        </div>
      </div>

      {/* ── Heading ── */}
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
        {t('subscription.expired')}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-sm leading-relaxed">
        {t('subscription.expiredDesc')}
      </p>

      {/* ── Plan cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-8">
        {PLANS.map((plan) => {
          const colors = planColors[plan.color];
          const PlanIcon = plan.icon;
          return (
            <div
              key={plan.id}
              className={[
                'relative rounded-2xl border-2 p-5 text-left',
                'bg-white dark:bg-slate-900',
                colors.border,
                plan.highlight
                  ? 'shadow-[0_8px_32px_-4px_rgba(37,99,235,0.2)]'
                  : 'shadow-card',
                'transition-transform duration-200 hover:-translate-y-0.5',
              ].join(' ')}
            >
              {/* Recommended badge */}
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={[
                      'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold',
                      'bg-primary-600 text-white shadow-sm',
                    ].join(' ')}
                  >
                    <Zap size={10} />
                    Tavsiya etiladi
                  </span>
                </div>
              )}

              {/* Plan icon + name */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className={['w-9 h-9 rounded-xl flex items-center justify-center', colors.icon].join(' ')}>
                  <PlanIcon size={18} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</p>
                  <span className={['inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5', colors.badge].join(' ')}>
                    {plan.name}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">/ {plan.period}</span>
              </div>

              {/* Feature list */}
              <ul className="flex flex-col gap-2">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2">
                    <Check size={14} className={['mt-0.5 shrink-0', colors.check].join(' ')} />
                    <span className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── CTA button ── */}
      <Button size="lg" pill className="px-8">
        {t('subscription.upgrade')}
      </Button>

      {/* Support note */}
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
        Savollaringiz bormi? Biz bilan bog'laning.
      </p>
    </div>
  );
};

export default SubscriptionBlocker;
