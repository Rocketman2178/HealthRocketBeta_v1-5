import { Routes, Route } from 'react-router-dom';
import { CoreDashboard } from './components/dashboard/CoreDashboard';
import { ChallengePage } from './components/dashboard/challenge/ChallengePage';
import { ChatPage } from './components/chat/ChatPage';
import Settings from './components/stripe/Settings';

export function AppRoutes() {

  return (
    <>
      <Routes>
        <Route path="/" element={<CoreDashboard />} />
        <Route path="/challenge/:challengeId" element={<ChallengePage />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path='/settings' element={<Settings/>}/>
      </Routes>
    </>
  );
}