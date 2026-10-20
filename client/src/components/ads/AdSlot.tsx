import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

export interface AdSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle';
  className?: string;
}

/**
 * Isolated, policy-compliant Google AdSense advertising component.
 * Disabled by default per Google Publisher Policies.
 * Never placed inside private investigation timelines, command copy areas, or auth flows.
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  slotId,
  format = 'horizontal',
  className = ''
}) => {
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    api.getHealth()
      .then(health => {
        if (health.monetization.ads_enabled && health.monetization.adsense_client_id_configured) {
          setAdsEnabled(true);
        }
      })
      .catch(() => {
        setAdsEnabled(false);
      });
  }, []);

  // When disabled or unconfigured, render nothing
  if (!adsEnabled || !clientId) {
    return null;
  }

  return (
    <aside 
      className={`my-8 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center ${className}`}
      aria-label="Advertisement"
    >
      <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-2">
        Advertisement
      </div>
      <div className="min-h-[90px] flex items-center justify-center bg-white border border-dashed border-slate-200 rounded">
        {/* Real AdSense tag injected only when approved publisher credentials exist */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={format === 'horizontal' ? 'horizontal' : 'auto'}
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
};
