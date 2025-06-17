export const formatCoordinate = (coord: number): string => {
    return `${Math.abs(coord).toFixed(6)}°`;
};