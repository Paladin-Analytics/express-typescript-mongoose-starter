import { config } from 'dotenv';
config();

import routes from './routes';
import './common/db';

const port = process.env.PORT || 3000;

routes.listen(port, () => {
    console.log(`server is listening on ${port}`);
});
