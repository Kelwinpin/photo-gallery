import { formatCoordinate } from "./fomatCoords";

describe('formatCoordinate', () => {
  it('formats a positive coordinate with 6 decimal places', () => {
    const coord = 12.3456789;
    const result = formatCoordinate(coord);
    expect(result).toBe('12.345679°');
  });

  it('formats a negative coordinate with 6 decimal places', () => {
    const coord = -12.3456789;
    const result = formatCoordinate(coord);
    expect(result).toBe('12.345679°');
  });

  it('formats an integer coordinate correctly', () => {
    const coord = 45;
    const result = formatCoordinate(coord);
    expect(result).toBe('45.000000°');
  });

  it('formats a coordinate with few decimals correctly', () => {
    const coord = 30.12;
    const result = formatCoordinate(coord);
    expect(result).toBe('30.120000°');
  });

  it('formats a very small coordinate correctly', () => {
    const coord = 0.0000012345;
    const result = formatCoordinate(coord);
    expect(result).toBe('0.000001°');
  });

  it('formats zero coordinate correctly', () => {
    const coord = 0;
    const result = formatCoordinate(coord);
    expect(result).toBe('0.000000°');
  });

  it('formats negative zero coordinate correctly', () => {
    const coord = -0;
    const result = formatCoordinate(coord);
    expect(result).toBe('0.000000°');
  });

  it('ensures number is positive after applying Math.abs', () => {
    const coord = -90.123456;
    const result = formatCoordinate(coord);
    expect(result).toBe('90.123456°');
  });

  it('returns a string ending with the degree symbol', () => {
    const coord = 180;
    const result = formatCoordinate(coord);
    expect(result.endsWith('°')).toBe(true);
  });
});