
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Não foi possível encontrar o elemento raiz 'root'.");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Erro ao montar a aplicação:", error);
  const errorContent = document.getElementById('error-content');
  const errorDisplay = document.getElementById('error-display');
  if (errorContent && errorDisplay) {
    errorDisplay.style.display = 'block';
    errorContent.textContent = String(error);
  }
}
