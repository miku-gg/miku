import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { GuidanceQuery } from '../services/text/lib/queryValidation.mjs';
import modelServerSettingsStore from '../services/text/lib/modelServerSettingsStore.mjs';
import { RPModelPermission } from '../services/text/data/rpModelTypes.mjs';

const userUsageMap: Record<string, { count: number; lastReset: number }> = {};

function decodeJWT(token: string) {
  try {
    return jwt.decode(token) as Record<string, any> | null;
  } catch {
    return null;
  }
}

const verifyJWT = async (
  headers: Record<string, any>,
  permissionType?: 'tts' | 'smart' | 'tester',
): Promise<boolean> => {
  return new Promise((resolve) => {
    const authCookie = headers.cookie?.split(';').find((cookie: string) => cookie.includes('Authentication'));
    const bearerToken = authCookie?.split('=')[1] || '';

    if (bearerToken) {
      jwt.verify(bearerToken, process.env.JWT_SECRET || '', (err: unknown, decodedData: any) => {
        if (err || (decodedData.exp || 0) < Date.now() / 1000) {
          resolve(false);
        } else {
          if (permissionType === 'tts') {
            resolve(!!decodedData.tts);
          } else if (permissionType === 'smart') {
            resolve(!!decodedData.smart);
          } else if (permissionType === 'tester') {
            resolve(!!decodedData.tester);
          } else {
            resolve(true);
          }
        }
      });
    } else {
      resolve(false);
    }
  });
};

// const USAGE_RATE_LIMIT = 30;
// const USAGE_RESET_INTERVAL = 3600000; // 1 HOUR
const USAGE_RATE_LIMIT = 500;
const USAGE_RESET_INTERVAL = 6 * 60 * 60 * 1000; // 6 HOURS

const jwtPermissionMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST') {
    if (req.path === '/text') {
      const query = req.body as GuidanceQuery;
      const model = modelServerSettingsStore.getRPModels().find((m) => m.id === query.model);
      if (model?.permission === RPModelPermission.PREMIUM) {
        const permission = await verifyJWT(req.headers, 'smart');

        if (!permission) {
          return res.status(401).send('Unauthorized: Token expired or missing');
        } else {
          return next();
        }
      }
      if (model?.permission === RPModelPermission.TESTER) {
        const permission = await verifyJWT(req.headers, 'tester');

        if (!permission) {
          return res.status(401).send('Unauthorized: Token expired or missing');
        } else {
          return next();
        }
      }
    } else if (req.path === '/audio') {
      const permission = await verifyJWT(req.headers, 'tts');
      if (!permission) {
        return res.status(401).send('Unauthorized: Token expired or missing');
      } else {
        return next();
      }
    } else if (req.path === '/assistant') {
      const permission = await verifyJWT(req.headers, 'smart');
      if (!permission) {
        return res.status(401).send('Unauthorized: Token expired or missing');
      } else {
        const authCookie = req.headers.cookie?.split(';').find((c) => c.includes('Authentication'));
        const bearerToken = authCookie?.split('=')[1] || '';
        const decoded = decodeJWT(bearerToken);

        if (decoded?.sub) {
          const now = Date.now();
          const usage = userUsageMap[decoded.sub] || { count: 0, lastReset: now };
          if (now - usage.lastReset > USAGE_RESET_INTERVAL) {
            usage.count = 0;
            usage.lastReset = now;
          }
          usage.count += 1;
          if (usage.count > USAGE_RATE_LIMIT) {
            return res.status(401).send('You have reached your quota limit. Please wait 6 hours.');
          }
          userUsageMap[decoded.sub] = usage;
        }
        return next();
      }
    } else if (req.path?.startsWith('/translate')) {
      const permission = await verifyJWT(req.headers, 'tester');
      if (!permission) {
        return res.status(401).send('Unauthorized: Token expired or missing');
      } else {
        return next();
      }
    }
    // if (!(await verifyJWT(req.headers))) {
    //   return res.status(401).send("Unauthorized: Token expired or missing");
    // }
    return next();
  } else {
    return next();
  }
};

export default jwtPermissionMiddleware;
