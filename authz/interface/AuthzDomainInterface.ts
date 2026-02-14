import {
    getAdminUserAccess,
    getMyAuthorization,
    searchUserByEmail,
    upsertAdminUserAccess,
} from "../services/authzService";
import { isForbiddenError } from "../services/authzErrors";

export interface AuthzDomainInterface {
    getMyAuthorization: typeof getMyAuthorization;
    searchUserByEmail: typeof searchUserByEmail;
    getAdminUserAccess: typeof getAdminUserAccess;
    upsertAdminUserAccess: typeof upsertAdminUserAccess;
    isForbiddenError: typeof isForbiddenError;
}

export const createAuthzDomainInterface = (): AuthzDomainInterface => ({
    getMyAuthorization,
    searchUserByEmail,
    getAdminUserAccess,
    upsertAdminUserAccess,
    isForbiddenError,
});

export const authzDomainInterface = createAuthzDomainInterface();
