/**
 * Formats number input to handle various edge cases like multiple decimal points,
 * leading zeros, and sign handling.
 */
export const formatNumberInput = (inputValue: string): string => {
  // Remove any non-numeric characters except decimal point, minus sign, and plus sign
  let formattedValue = inputValue.replace(/[^0-9.+-]/g, '');

  // Handle multiple decimal points - keep only the first one
  const decimalCount = (formattedValue.match(/\./g) || []).length;
  if (decimalCount > 1) {
    const firstDecimalIndex = formattedValue.indexOf('.');
    // Keep everything up to and including the first decimal point
    const beforeFirstDecimal = formattedValue.substring(0, firstDecimalIndex + 1);
    // Remove all decimal points from the rest
    const afterFirstDecimal = formattedValue.substring(firstDecimalIndex + 1).replace(/\./g, '');
    formattedValue = beforeFirstDecimal + afterFirstDecimal;
  }

  // Handle plus and minus signs
  if (formattedValue.includes('+') || formattedValue.includes('-')) {
    // If there's a plus sign, remove all signs (make positive)
    if (formattedValue.includes('+')) {
      formattedValue = formattedValue.replace(/[+-]/g, '');
    } else {
      // Handle minus signs - keep only one at the beginning
      const minusCount = (formattedValue.match(/-/g) || []).length;
      if (minusCount > 1) {
        formattedValue = '-' + formattedValue.replace(/-/g, '');
      }
      // If minus is not at the beginning, move it there
      if (formattedValue.includes('-') && !formattedValue.startsWith('-')) {
        formattedValue = '-' + formattedValue.replace(/-/g, '');
      }
    }
  }

  // Add leading zero if number starts with decimal point
  if (formattedValue.startsWith('.')) {
    formattedValue = '0' + formattedValue;
  }

  // Handle negative numbers with decimal point at start
  if (formattedValue.startsWith('-.')) {
    formattedValue = '-0' + formattedValue.substring(1);
  }

  // Remove leading zeros (but keep one zero before decimal point)
  if (formattedValue.length > 1) {
    // Handle negative numbers
    const isNegative = formattedValue.startsWith('-');
    const numberPart = isNegative ? formattedValue.substring(1) : formattedValue;

    // Remove leading zeros, but keep at least one digit
    let cleanedNumber = numberPart.replace(/^0+(?=\d)/, '');

    // If we removed everything, keep one zero
    if (cleanedNumber === '' || cleanedNumber === '.') {
      cleanedNumber = '0' + cleanedNumber;
    }

    // Reconstruct with sign
    formattedValue = isNegative ? '-' + cleanedNumber : cleanedNumber;
  }

  return formattedValue;
};
