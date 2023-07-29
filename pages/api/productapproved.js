import sgMail from '@sendgrid/mail'
import { NextApiRequest, NextApiResponse } from 'next';

sgMail.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_APIKEY);

export default async (req = NextApiRequest, res = NextApiResponse) => {
  const { email, name, product } = req.body
  const msg = {
    to: email,
    from: {
      email: 'aitropy.io@gmail.com',
      name: 'AITropy',
    },
    templateId: 'd-54e6f34ff2c946b78a0648c8f8e1ec32',
    dynamic_template_data: {
      url: 'https://aitropy.io',
      support_email: 'aitropy.io@gmail.com',
      main_url: 'https://aitropy.io',
      email,
      name,
      product
    }
  };

  try {
    await sgMail.send(msg);
    res.json({ message: `Email has been sent` })
  } catch (error) {
    res.status(500).json({ error: 'Error sending email' })
  }
}