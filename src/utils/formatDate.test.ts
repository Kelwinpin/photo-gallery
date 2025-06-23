import { formatDate } from "./fomatDate";

describe('formatDate', () => {
  it('formats a date in pt-BR locale with leading zeros', () => {
    const date = new Date('2023-05-15T14:30:00');
    const result = formatDate(date);
    expect(result).toBe('15/05/2023, 14:30');
  });

  it('formats a date with single-digit day and month correctly', () => {
    const date = new Date('2023-01-07T09:05:00');
    const result = formatDate(date);
    expect(result).toBe('07/01/2023, 09:05');
  });

  it('formats a date with different time correctly', () => {
    const date = new Date('2021-12-31T23:59:59');
    const result = formatDate(date);
    expect(result).toBe('31/12/2021, 23:59');
  });

  it('formats midnight correctly', () => {
    const date = new Date('2022-06-15T00:00:00');
    const result = formatDate(date);
    expect(result).toBe('15/06/2022, 00:00');
  });

  it('formats a date that includes AM correctly', () => {
    const date = new Date('2023-03-10T08:15:00');
    const result = formatDate(date);
    expect(result).toBe('10/03/2023, 08:15');
  });

  it('formats a date that includes PM correctly', () => {
    const date = new Date('2023-03-10T16:45:00');
    const result = formatDate(date);
    expect(result).toBe('10/03/2023, 16:45');
  });

  it('returns the same format for a minimal valid date', () => {
    const date = new Date(0);
    const result = formatDate(date);
    expect(result).toContain('/');
  });
});