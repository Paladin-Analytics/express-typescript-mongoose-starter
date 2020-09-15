import Me from './me';

// Controllers
import { CreateAuthenticatedRouter } from '../../middleware/auth.middleware';

const router = CreateAuthenticatedRouter();

router.use('/me', Me);

export default router;
