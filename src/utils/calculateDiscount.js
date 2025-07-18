export function calculateDiscount(price, discountPercentage) {
  if (discountPercentage < 0 || discountPercentage > 100) {
    throw new Error("Discount percentage must be between 0 and 100");
  }
  const discountedPrice = price - (price * discountPercentage / 100);
  return parseFloat(discountedPrice.toFixed(2));
}
