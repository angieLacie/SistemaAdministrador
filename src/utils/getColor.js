import { initializeColorMap } from '@/utils/colorInit';
let initialized = false;
export const getColor = (category, shadeOrVar, format = 'hex', opacity = 1) => {
  if (typeof window === 'undefined') return '';
  if (!initialized || !window.colorMap) {
    initializeColorMap();
    initialized = true;
  }
  if (category === 'bootstrapVars') {
    const entry = window.colorMap?.bootstrapVars?.[shadeOrVar];
    if (!entry) return '';
    return format === 'rgba' ? entry.rgba(opacity) : entry[format];
  }
  const entry = window.colorMap?.[category]?.[shadeOrVar];
  if (!entry) return '';
  return format === 'rgba' ? entry.rgba(opacity) : entry[format];
};