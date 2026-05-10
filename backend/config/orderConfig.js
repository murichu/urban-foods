const parsedDeliveryFee = Number(process.env.DELIVERY_FEE);

export const DELIVERY_FEE = Number.isFinite(parsedDeliveryFee)
  ? parsedDeliveryFee
  : 0;
