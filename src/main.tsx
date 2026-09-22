import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion } from 'framer-motion';

import { App } from './App';
import { AppProvider } from './lib/app-context';
import './styles/index.css';

const root = document.getElementById('root');
if (!root) throw new Error('#root is missing from index.html');

/** Animation features arrive in their own chunk after first paint. `strict`
 *  makes any accidental `motion.*` usage fail loudly instead of silently
 *  pulling the full bundle back in. */
const loadFeatures = () => import('framer-motion').then((mod) => mod.domAnimation);

createRoot(root).render(
  <StrictMode>
    <LazyMotion features={loadFeatures} strict>
      <AppProvider>
        <App />
      </AppProvider>
    </LazyMotion>
  </StrictMode>,
);
