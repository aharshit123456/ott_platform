import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { WhamProvider } from './wham/WhamContext';
import Landing from './wham/pages/Landing';
import AppShell from './wham/components/AppShell';
import Discover from './wham/pages/Discover';
import WorkDetail from './wham/pages/WorkDetail';
import Person from './wham/pages/Person';
import Lists from './wham/pages/Lists';
import Inbox from './wham/pages/Inbox';
import Thread from './wham/pages/Thread';

// The classic OTT app is deprecated and only loaded when someone visits /legacy.
const LegacyApp = lazy(() => import('./legacy/LegacyApp'));

const LegacyWatchRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/legacy/watch/${id}`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <WhamProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<AppShell />}>
              <Route path="/discover" element={<Discover />} />
              <Route path="/work/:id" element={<WorkDetail />} />
              <Route path="/people/:id" element={<Person />} />
              <Route path="/lists" element={<Lists />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/inbox/:id" element={<Thread />} />
            </Route>

            <Route path="/legacy/*" element={<Suspense fallback={null}><LegacyApp /></Suspense>} />
            {/* Old classic URLs */}
            <Route path="/watch/:id" element={<LegacyWatchRedirect />} />
            <Route path="/pull-list" element={<Navigate to="/legacy/pull-list" replace />} />
            <Route path="/profile" element={<Navigate to="/legacy/profile" replace />} />
            <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
            <Route path="/signup" element={<Navigate to="/?auth=signup" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </WhamProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
