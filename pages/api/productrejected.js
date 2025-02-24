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
    templateId: 'd-08ced92a22d943d0810241dd30cf1a70',
    dynamic_template_data: {
      url: 'https://aitropy.vercel.app',
      support_email: 'aitropy.io@gmail.com',
      main_url: 'https://aitropy.vercel.app',
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