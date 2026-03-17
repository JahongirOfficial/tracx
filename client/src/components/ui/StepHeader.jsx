/**
 * StepHeader — minimalist step indicator.
 * Just thin colored segments + small labels. No circles, no numbers.
 */
const StepHeader = ({ steps, current }) => (
  <div className="mb-6">
    {/* Segment bars */}
    <div className="flex gap-1 mb-2">
      {steps.map((_, i) => (
        <div
          key={i}
          className={[
            'h-0.5 flex-1 rounded-full transition-colors duration-300',
            i <= current
              ? 'bg-primary-600 dark:bg-primary-500'
              : 'bg-slate-200 dark:bg-slate-700',
          ].join(' ')}
        />
      ))}
    </div>

    {/* Labels row */}
    <div className="flex">
      {steps.map((label, i) => (
        <div key={i} className="flex-1">
          <span className={[
            'text-[11px] font-semibold transition-colors duration-200',
            i === current
              ? 'text-primary-600 dark:text-primary-400'
              : i < current
              ? 'text-slate-400 dark:text-slate-500'
              : 'text-slate-300 dark:text-slate-600',
          ].join(' ')}>
            {i + 1}. {label}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default StepHeader;
