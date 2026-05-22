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
        <p className="app-subtitle">Say what you need to say. No one will know it was you.</p>
        <p className="app-intro">
          A clean, anonymous space where people post confessions and the whole vibe says:
          this is safe, no one will know it was you. Drop a secret, a regret, a thought
          you've never told anyone. No names. No accounts. No judgement. Just the truth — and
          then it belongs to the wall.
        </p>
      </header>
      <main className="app-main">
        <ConfessionForm onAddConfession={addConfession} />
        <ConfessionFeed confessions={confessions} />
      </main>
    </div>
  );
}

export default App;
