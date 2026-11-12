import { vercelHandler } from '../../backend/dist/vercel.js';

export const config = { api: { bodyParser: false } };

export default vercelHandler;
