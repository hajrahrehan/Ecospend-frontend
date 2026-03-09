export function FormatNumber(number) {
  if (typeof number !== "number") {
    return number;
  }

  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function containsOnlyNumbers(inputString) {
  const numericPattern = /^[0-9]+$/;
  return numericPattern.test(inputString);
}
