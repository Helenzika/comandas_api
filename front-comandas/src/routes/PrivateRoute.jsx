///helen de oliveira
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  // MUDAMOS AQUI DE FALSE PARA TRUE 👇
  const isAuthenticated = true; 

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}