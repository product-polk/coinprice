export const formatNumber = (num: number): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (num >= 1e9) {
    return `${formatter.format(num / 1e9)}B`;
  }
  if (num >= 1e6) {
    return `${formatter.format(num / 1e6)}M`;
  }
  if (num >= 1e3) {
    return `${formatter.format(num / 1e3)}K`;
  }
  return formatter.format(num);
}; 