export function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

export function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}
