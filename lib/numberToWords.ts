// Utility to convert numerical amounts to Indian Rupee Words format

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  let str = '';
  if (num >= 100) {
    str += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    str += ones[num] + ' ';
  }
  return str.trim();
}

export function convertAmountToWords(amount: number): string {
  if (isNaN(amount) || amount === 0) {
    return 'Zero Only';
  }

  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  let words = '';

  if (rupees === 0) {
    words = 'Zero';
  } else {
    const crore = Math.floor(rupees / 10000000);
    let rem = rupees % 10000000;

    const lakh = Math.floor(rem / 100000);
    rem %= 100000;

    const thousand = Math.floor(rem / 1000);
    rem %= 1000;

    if (crore > 0) {
      words += convertLessThanThousand(crore) + ' Crore ';
    }
    if (lakh > 0) {
      words += convertLessThanThousand(lakh) + ' Lakh ';
    }
    if (thousand > 0) {
      words += convertLessThanThousand(thousand) + ' Thousand ';
    }
    if (rem > 0) {
      words += convertLessThanThousand(rem) + ' ';
    }
  }

  words = words.trim();

  let result = `Rupees ${words}`;

  if (paise > 0) {
    result += ` and ${convertLessThanThousand(paise)} Paise`;
  }

  result += ' Only';
  return result;
}
