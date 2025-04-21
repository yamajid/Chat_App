import Login from './components/login';
import Register from './components/register';
import Dashboard from './components/dashboard';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth status when component mounts
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
    setIsLoading(false);
  }, []); // Empty dependency array to run only once

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <Navigate to="/profile" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/profile" replace />
            ) : (
              <Login onLogin={() => setIsAuthenticated(true)} />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? (
              <Navigate to="/profile" replace />
            ) : (
              <Register onRegister={() => setIsAuthenticated(true)} />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? (
              <Dashboard onLogout={() => setIsAuthenticated(false)}/>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="*" 
          element={
            isAuthenticated ? (
              <Navigate to="/profile" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;