import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Accept any Wix webhook events and log for processing
  const event = req.body;
  console.info('Wix webhook event:', event);
  // TODO: validate signature if provided
  res.status(200).json({ received: true });
}
