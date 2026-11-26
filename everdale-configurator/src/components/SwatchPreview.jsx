import React from 'react';

/**
 * Generates visually accurate CSS swatch backgrounds for wood grain, veined stone,
 * mineral quartz/granite, brushed metallic hardware, and satin painted lacquer.
 */
export function getSwatchBackgroundStyle(option, category = 'cabinet') {
  if (!option) return { backgroundColor: '#e5e2dc' };

  if (category === 'wood' || option.finishType === 'wood' || option.woodKey) {
    const isWalnut = option.id === 'walnut' || option.id === 'warm-walnut' || option.woodKey === 'walnut';
    if (isWalnut) {
      return {
        backgroundColor: '#5d402d',
        backgroundImage:
          'repeating-linear-gradient(92deg, rgba(38,23,14,0.38) 0px, rgba(38,23,14,0.38) 2px, transparent 2px, transparent 6px, rgba(122,86,62,0.28) 6px, rgba(122,86,62,0.28) 9px), linear-gradient(135deg, #6d4c37 0%, #4b3222 100%)',
      };
    }
    return {
      backgroundColor: '#b9956b',
      backgroundImage:
        'repeating-linear-gradient(88deg, rgba(132,98,62,0.28) 0px, rgba(132,98,62,0.28) 1.5px, transparent 1.5px, transparent 5px, rgba(212,178,136,0.28) 5px, rgba(212,178,136,0.28) 8px), linear-gradient(135deg, #c7a67d 0%, #a47e54 100%)',
    };
  }

  if (category === 'hardware' || option.metalness !== undefined) {
    if (option.id === 'matte-black') {
      return {
        background: 'linear-gradient(140deg, #33363a 0%, #1c1e21 60%, #2a2c30 100%)',
      };
    }
    const base = option.hex || '#b08b4f';
    return {
      backgroundColor: base,
      backgroundImage: `repeating-linear-gradient(115deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 1px, transparent 1px, transparent 3px), linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 45%, rgba(0,0,0,0.22) 100%)`,
    };
  }

  if (category === 'countertop' || option.textureType) {
    switch (option.textureType) {
      case 'carrara':
        return {
          backgroundColor: '#efeeea',
          backgroundImage:
            'linear-gradient(128deg, transparent 22%, rgba(125,132,140,0.34) 24%, transparent 27%), linear-gradient(142deg, transparent 56%, rgba(140,145,152,0.26) 58%, transparent 61%), radial-gradient(circle at 30% 40%, rgba(190,192,196,0.22), transparent 60%)',
        };
      case 'calacatta-gold':
        return {
          backgroundColor: '#f3efe6',
          backgroundImage:
            'linear-gradient(125deg, transparent 25%, rgba(176,141,86,0.38) 27%, transparent 30%), linear-gradient(145deg, transparent 60%, rgba(145,138,128,0.26) 62%, transparent 65%)',
        };
      case 'quartz':
        return {
          backgroundColor: '#d9dad8',
          backgroundImage:
            'radial-gradient(rgba(105,110,112,0.45) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.75) 1px, transparent 1px)',
          backgroundSize: '8px 8px, 11px 11px',
          backgroundPosition: '0 0, 4px 4px',
        };
      case 'black-granite':
        return {
          backgroundColor: '#27292c',
          backgroundImage:
            'radial-gradient(rgba(145,152,158,0.35) 1px, transparent 1px), radial-gradient(rgba(85,90,94,0.45) 1px, transparent 1px)',
          backgroundSize: '7px 7px, 10px 10px',
          backgroundPosition: '0 0, 3px 5px',
        };
      default:
        return {
          background: 'linear-gradient(135deg, #f8f7f4 0%, #eceae4 100%)',
        };
    }
  }

  return {
    backgroundColor: option.hex || option.swatchHex || '#899281',
    backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.14) 0%, rgba(0,0,0,0.06) 100%)',
  };
}
