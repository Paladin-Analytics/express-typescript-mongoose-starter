import { jwtKey } from '../config/jwt';
import { scopes } from '../config/permissions';
import * as jwt from "jsonwebtoken";

import { Request } from 'express';

import { UnauthorizedError } from '../common/errors';

export async function expressAuthentication(
    request: Request,
    securityName: string,
    scopes?: string[]
  ): Promise<unknown> {

    if (securityName === "jwt") {
    const tokenStr = request.headers["authorization"] as string;
    const token = tokenStr.split(' ').length >= 2 ? tokenStr.split(' ')[1] : '';
  
      return new Promise((resolve, reject) => {
        if (!token) {
          reject(new Error("No token provided"));
        }
        jwt.verify(token, <string>jwtKey, {
            algorithms: ['HS256'],
            
        }, function (err: unknown, user: unknown){
            console.log(`USER = ${JSON.stringify(user)}`);

            const decoded = user as { scopes: string[] };
            if (err) {
                const authErr = new UnauthorizedError('Invalid JWT token');
                reject(authErr);
            } else {
                // Check if JWT contains all required scopes
                if (scopes) {
                    for (const scope of scopes) {
                        if (!decoded.scopes.includes(scope)) {
                            reject(new Error("JWT does not contain required scope."));
                        }
                    }
                }
                // Check if the token is blacklisted
            }
            resolve(decoded);
        });
    });
  }
}