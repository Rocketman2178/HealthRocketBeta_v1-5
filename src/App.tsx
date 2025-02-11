import { BrowserRouter } from 'react-router-dom';
import { SupabaseProvider } from './contexts/SupabaseContext'; 
import { CosmoProvider } from './contexts/CosmoContext';
import AppContent from './components/common/AppContent';

function App() {
  return (
    <BrowserRouter>
      <SupabaseProvider>
        <CosmoProvider>
          <AppContent />
        </CosmoProvider>
      </SupabaseProvider>
    </BrowserRouter>
  );
}

export default App;