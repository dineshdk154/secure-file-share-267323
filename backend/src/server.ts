import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { AppDb } from './db';
import { ShareRepository } from './features/acceptance/share.repository';
import { ShareService } from './features/acceptance/share.service';
import { createShareRouter } from './features/acceptance/share.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

const db = new AppDb();
const repo = new ShareRepository(db);
const service = new ShareService(repo);

app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

app.use('/api', createShareRouter(service));

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${port}`);
});
