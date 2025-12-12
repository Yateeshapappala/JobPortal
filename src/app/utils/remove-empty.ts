export function removeEmptyRows(arr: any[], keys: string[]) {
  return arr.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      return (
        value !== null && value !== undefined && value.toString().trim() !== ''
      );
    })
  );
}
