/**
 * Universal Formatter for Multi-Currency & Internationalization
 */

export function formatCurrency(
  amountPaise: number, 
  currencyCode: string = 'INR', 
  locale: string = 'en-IN'
): string {
  const amount = amountPaise / 100;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch (err) {
    // Fallback if locale/currency is invalid
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

export function formatDate(
  date: string | Date, 
  timezone: string = 'Asia/Kolkata', 
  locale: string = 'en-IN',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      dateStyle: 'medium',
      timeStyle: 'short',
      ...options
    }).format(d);
  } catch (err) {
    return d.toLocaleString();
  }
}

/**
 * Get native currency symbol
 */
export function getCurrencySymbol(currencyCode: string, locale: string = 'en-IN'): string {
  try {
    return (0).toLocaleString(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/\d/g, '').trim();
  } catch (err) {
    return currencyCode;
  }
}
