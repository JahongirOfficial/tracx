import { useNavigate } from 'react-router-dom';
import { Home, Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

/* ─── Component ────────────────────────────────────────────────── */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-5 relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/10 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl"
      />

      <div className="relative text-center max-w-sm">
        {/* Large gradient 404 */}
        <div className="mb-6">
          <h1
            className="text-[120px] sm:text-[160px] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </h1>
        </div>

        {/* Animated icon */}
        <div className="relative mb-6">
          {/* Outer pulsing ring */}
          <div
            aria-hidden="true"
            className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl bg-primary-500/20 animate-ping"
            style={{ animationDuration: '2s' }}
          />
          <div className="relative w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/40 border border-primary-200/60 dark:border-primary-700/40 flex items-center justify-center shadow-lg">
            <Compass
              size={36}
              className="text-primary-600 dark:text-primary-400"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Sahifa topilmadi
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Siz qidirayotgan sahifa mavjud emas yoki ko'chirilgan.
          Bosh sahifaga qaytib, yana urinib ko'ring.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/')} icon={Home} size="lg">
            Bosh sahifa
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            icon={ArrowLeft}
            size="lg"
          >
            Orqaga
          </Button>
        </div>

        {/* Bottom hint */}
        <p className="mt-8 text-xs text-slate-400 dark:text-slate-600">
          Xato davom etsa, administrator bilan bog'laning.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
