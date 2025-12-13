import { removeEmptyRows } from "./remove-empty";

describe('removeEmptyRows', () => {

  it('should remove rows where all specified keys are empty', () => {
    const data = [
      { name: '', email: '' },
      { name: 'John', email: '' },
      { name: '', email: 'john@test.com' },
    ];

    const result = removeEmptyRows(data, ['name', 'email']);

    expect(result.length).toBe(2);
    expect(result).toEqual([
      { name: 'John', email: '' },
      { name: '', email: 'john@test.com' },
    ]);
  });

  it('should keep row if at least one key has a value', () => {
    const data = [
      { skill: '', level: '' },
      { skill: 'Angular', level: '' },
    ];

    const result = removeEmptyRows(data, ['skill', 'level']);

    expect(result).toEqual([
      { skill: 'Angular', level: '' },
    ]);
  });

  it('should remove rows with null or undefined values', () => {
    const data = [
      { name: null, email: undefined },
      { name: 'Alice', email: null },
    ];

    const result = removeEmptyRows(data, ['name', 'email']);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Alice');
  });

  it('should trim string values before checking', () => {
    const data = [
      { name: '   ', email: '   ' },
      { name: ' Bob ', email: '   ' },
    ];

    const result = removeEmptyRows(data, ['name', 'email']);

    expect(result.length).toBe(1);
    expect(result[0].name).toBe(' Bob ');
  });

  it('should return empty array if input array is empty', () => {
    const result = removeEmptyRows([], ['name', 'email']);
    expect(result).toEqual([]);
  });

  it('should return empty array if all rows are empty', () => {
    const data = [
      { a: '', b: '' },
      { a: null, b: undefined },
    ];

    const result = removeEmptyRows(data, ['a', 'b']);
    expect(result).toEqual([]);
  });

  it('should work with non-string values', () => {
    const data = [
      { count: 0 },
      { count: 5 },
    ];

    const result = removeEmptyRows(data, ['count']);

    expect(result).toEqual([
      { count: 0 },
      { count: 5 },
    ]);
  });
});
