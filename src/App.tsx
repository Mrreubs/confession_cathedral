import { useConfessions } from './hooks/useConfessions';
import ConfessionForm from './components/ConfessionForm';
import ConfessionFeed from './components/ConfessionFeed';
import './App.css';

function App() {
  const { confessions, addConfession } = useConfessions();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Confession Cathedral</h1>
        <p className="app-subtitle">Drop your truth.</p>
      </header>
      <main className="app-main">
        <ConfessionForm onAddConfession={addConfession} />
        <ConfessionFeed confessions={confessions} />
      </main>
    </div>
  );
}

export default App;
