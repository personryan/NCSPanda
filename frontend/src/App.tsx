import { useEffect, useState } from 'react';

type HealthResponse = {
  status: string;
  timestamp: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as HealthResponse;
        setHealth(data);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>NCSPanda Frontend</h1>
      <p>This is a minimal test page.</p>

      <section style={{ marginTop: '1.5rem' }}>
        <h2>Backend Health</h2>
        {!health && !error && <p>Checking backend…</p>}
        {health && (
          <pre>{JSON.stringify(health, null, 2)}</pre>
        )}
        {error && (
          <p style={{ color: 'red' }}>Error: {error}</p>
        )}
      </section>
    </main>
  );
}

export default App;