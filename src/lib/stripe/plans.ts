export const PLANS = {
  free: {
    name: 'Free',
    description: 'Basic draft intelligence',
    features: [
      'Big Board & prospect profiles',
      'Stat Matrix with basic stats',
      'Compare Engine',
      'Solo mock draft (1 round)',
      'Lottery Simulator',
    ],
  },
  pro: {
    name: 'Pro',
    priceMonthly: 12,
    priceYearly: 80,
    stripePriceIdMonthly: 'price_1TJMuwRs8ygHxhFydPZoU6wX',
    stripePriceIdAnnual: 'price_1TJMvoRs8ygHxhFyBmpW9fnN',
    description: 'Full scouting suite',
    features: [
      'Everything in Free',
      'Advanced analytics & percentiles',
      'Film Terminal with video library',
      'Comp Galaxy 3D visualization',
      'Multiplayer mock drafts (7 rounds)',
      'Custom draft boards',
      'Scouts community (create reports)',
      'Dynasty Bridge (trade calculator, devy)',
      'Export & sharing',
    ],
  },
} as const
