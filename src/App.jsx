import { useState, useEffect } from 'react';
    import { Routes, Route } from 'react-router-dom';
    import { DndProvider } from 'react-dnd';
    import { HTML5Backend } from 'react-dnd-html5-backend';
    import AuthPage from './pages/AuthPage';
    import DashboardPage from './pages/DashboardPage';
    import QuestionnaireEditor from './components/QuestionnaireEditor';

    function App() {
      const [user, setUser] = useState(null);

      return (
        <DndProvider backend={HTML5Backend}>
          <Routes>
            <Route path="/" element={<AuthPage setUser={setUser} />} />
            <Route path="/dashboard" element={<DashboardPage user={user} />} />
            <Route path="/editor/:id" element={<QuestionnaireEditor />} />
          </Routes>
        </DndProvider>
      );
    }

    export default App;
