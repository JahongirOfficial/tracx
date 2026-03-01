import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { CheckCircle } from 'lucide-react';

const Payment = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-success-600" />
        </div>
        <h1 className="text-xl font-bold mb-2">To'lov</h1>
        <p className="text-slate-500 mb-6">To'lov sahifasi tez orada qo'shiladi</p>
        <Button onClick={() => navigate('/dashboard')}>Dashboardga qaytish</Button>
      </div>
    </div>
  );
};

export default Payment;
