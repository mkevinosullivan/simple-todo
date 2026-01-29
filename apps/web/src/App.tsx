import type React from 'react';

import { TaskProvider } from './context/TaskContext.js';
import { TaskListView } from './views/TaskListView.js';

import './styles/global.css';

const App: React.FC = () => {
  return (
    <TaskProvider>
      <TaskListView />
    </TaskProvider>
  );
};

export default App;
