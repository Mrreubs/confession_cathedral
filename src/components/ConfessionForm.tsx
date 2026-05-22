import { useState, useRef, type FormEvent } from 'react';
import './ConfessionForm.css';

const MAX_CHARS = 280;

interface ConfessionFormProps {
  onAddConfession: (text: string) => boolean;
}

export default function ConfessionForm({ onAddConfession }: ConfessionFormProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_CHARS - text.length;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const ok = onAddConfession(text);
    if (!ok) {
      setError('Confession cannot be empty.');
      return;
    }

    setError('');
    setText('');
    textareaRef.current?.focus();
  }

  return (
    <form className="confession-form" onSubmit={handleSubmit}>
      <div className="textarea-wrapper">
        <textarea
          ref={textareaRef}
          className="confession-textarea"
          placeholder="Drop your truth..."
          maxLength={MAX_CHARS + 20}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError('');
          }}
          rows={4}
        />
        <span
          className={`char-counter ${remaining <= 0 ? 'over' : ''}`}
        >
          {remaining}
        </span>
      </div>
      {error && <p className="form-error">{error}</p>}
      <button
        type="submit"
        className="submit-btn"
        disabled={text.trim().length === 0}
      >
        Confess
      </button>
    </form>
  );
}
