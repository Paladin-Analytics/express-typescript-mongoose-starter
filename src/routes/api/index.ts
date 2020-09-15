import Me from './me';
import Workspace from './workspace';

// Controllers
import { CreateAuthenticatedRouter } from '../../middleware/auth.middleware';

const router = CreateAuthenticatedRouter();

router.use('/me', Me);
router.use('/workspace', Workspace);

export default router;
