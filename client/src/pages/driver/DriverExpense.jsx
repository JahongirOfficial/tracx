/**
 * DriverExpense — redirects the driver to their home page.
 * Expense form is handled directly from DriverHome / DriverFlight via
 * the ExpenseForm modal component.
 */
import { Navigate } from 'react-router-dom';

const DriverExpense = () => <Navigate to="/driver" replace />;

export default DriverExpense;
