import React from 'react';
import { CHANNELS } from '../config/productConfig';

export default function ChannelTabs({ activeTab, onChangeTab }) {
  return (
    <div className="channel-bar" role="tablist" aria-label="Purchase availability channels">
      <div className="channel-segmented">
        {CHANNELS.map((ch) => {
          const isActive = activeTab === ch.id;
          return (
            <button
              key={ch.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`channel-tab ${isActive ? 'active' : ''}`}
              onClick={() => onChangeTab(ch.id)}
            >
              {ch.id === 'in-stock' && <span className="channel-dot" />}
              <span>{ch.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
