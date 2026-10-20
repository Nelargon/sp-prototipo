'use client';
import { useEffect } from 'react';
import { startAnalytics, setAnalyticsConsent } from './track';

// Apagado por defecto. SP elige proveedor y valida privacidad antes del build.
// La CMP puede emitir sp:analytics-consent con detail: { granted: true|false }.
// No se carga GA4 antes de ese consentimiento; no se confunde con el del lead.
export default function Analytics() {
  useEffect(() => {
    const consent = (event) => setAnalyticsConsent(event.detail?.granted === true);
    window.addEventListener('sp:analytics-consent', consent);
    startAnalytics();
    return () => window.removeEventListener('sp:analytics-consent', consent);
  }, []);
  return null;
}
