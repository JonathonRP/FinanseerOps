import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({path: path.resolve(process.cwd(), '.env.local')});
export const admin = {
  email: process.env.BUXFER_EMAIL,
  role: 'admin',
};
