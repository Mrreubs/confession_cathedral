import { useState, useRef, useEffect, type FormEvent } from 'react';
import './ConfessionForm.css';

const MAX_CHARS = 280;

const affirmations = [
  'It\'s out there now. You can breathe.',
  'The wall is listening. Always.',
  'Your truth belongs here.',
  'That took courage. Thank you.',
  'It\'s safe here. You are safe.',
];

interface ConfessionFormProps {
  onAddConfession: (text: string) => boolean;
}

export default function ConfessionForm({ onAddConfession }: ConfessionFormProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [acknowledged, setAcknowledged] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_CHARS - text.length;

  function handleInput(value: string) {
    const clamped = value.length > MAX_CHARS ? value.slice(0, MAX_CHARS) : value;
    setText(clamped);
    if (error) setError('');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const ok = onAddConfession(text);
    if (!ok) {
      setError('Confession cannot be empty.');
      return;
    }

    setError('');
    setText('');
    setAcknowledged(affirmations[Math.floor(Math.random() * affirmations.length)]);
    textareaRef.current?.focus();
  }

  useEffect(() => {
    if (!acknowledged) return;
    const timer = setTimeout(() => setAcknowledged(''), 4000);
    return () => clearTimeout(timer);
  }, [acknowledged]);

  return (
    <form className="confession-form" onSubmit={handleSubmit}>
      <div className="textarea-wrapper">
        <label htmlFor="confession-input" className="sr-only">
          Your confession
        </label>
        <textarea
          id="confession-input"
          ref={textareaRef}
          className="confession-textarea"
          placeholder="Drop your truth..."
          maxLength={MAX_CHARS}
          value={text}
          onChange={(e) => handleInput(e.target.value)}
          rows={4}
        />
        <span
          className={`char-counter ${remaining <= 0 ? 'over' : ''}`}
          aria-live="polite"
          aria-label={`${remaining} characters remaining`}
        >
          {remaining}
        </span>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button
        type="submit"
        className="submit-btn"
        disabled={text.trim().length === 0}
      >
        Confess
      </button>
      {acknowledged && (
        <p className="acknowledgment" role="status" key={acknowledged}>
          {acknowledged}
        </p>
      )}
    </form>
  );
}
