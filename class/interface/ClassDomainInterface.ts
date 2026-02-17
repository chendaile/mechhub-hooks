import {
    assignTeacherToClass,
    createClass,
    createInviteCode,
    deleteClass,
    getMyClassContext,
    joinClassByInviteCode,
    listClassMembers,
    listInviteCodes,
    removeStudentFromClass,
    revokeInviteCode,
} from "../services/classManagementService";
import {
    createGroupThread,
    deleteClassThread,
    getClassThreadMessages,
    listClassThreads,
    postClassMessage,
    renameClassThread,
    shareGradeResultToClass,
    sharePrivateChatToClass,
} from "../services/classThreadService";
import { isClassForbiddenError as isClassForbiddenErrorPredicate } from "../services/classErrors";

export interface ClassDomainInterface {
    getMyClassContext: typeof getMyClassContext;
    listClassMembers: typeof listClassMembers;
    listInviteCodes: typeof listInviteCodes;
    listClassThreads: typeof listClassThreads;
    getClassThreadMessages: typeof getClassThreadMessages;
    createClass: typeof createClass;
    assignTeacherToClass: typeof assignTeacherToClass;
    deleteClass: typeof deleteClass;
    createInviteCode: typeof createInviteCode;
    revokeInviteCode: typeof revokeInviteCode;
    joinClassByInviteCode: typeof joinClassByInviteCode;
    removeStudentFromClass: typeof removeStudentFromClass;
    createGroupThread: typeof createGroupThread;
    renameClassThread: typeof renameClassThread;
    deleteClassThread: typeof deleteClassThread;
    postClassMessage: typeof postClassMessage;
    sharePrivateChatToClass: typeof sharePrivateChatToClass;
    shareGradeResultToClass: typeof shareGradeResultToClass;
    isClassForbiddenError: typeof isClassForbiddenErrorPredicate;
}

export const createClassDomainInterface = (): ClassDomainInterface => ({
    getMyClassContext,
    listClassMembers,
    listInviteCodes,
    listClassThreads,
    getClassThreadMessages,
    createClass,
    assignTeacherToClass,
    deleteClass,
    createInviteCode,
    revokeInviteCode,
    joinClassByInviteCode,
    removeStudentFromClass,
    createGroupThread,
    renameClassThread,
    deleteClassThread,
    postClassMessage,
    sharePrivateChatToClass,
    shareGradeResultToClass,
    isClassForbiddenError: isClassForbiddenErrorPredicate,
});

export const classDomainInterface = createClassDomainInterface();
export const isClassForbiddenError = classDomainInterface.isClassForbiddenError;
