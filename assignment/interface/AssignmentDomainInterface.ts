import {
    createAssignment,
    generateGradeDraft,
    getFeedbackDetail,
    listAssignmentSubmissions,
    listClassAssignments,
    listMyAssignments,
    listMyFeedback,
    releaseGrade,
    saveGradeReview,
    submitAssignmentFromChat,
} from "../services/assignmentService";

export interface AssignmentDomainInterface {
    createAssignment: typeof createAssignment;
    listMyAssignments: typeof listMyAssignments;
    listClassAssignments: typeof listClassAssignments;
    submitAssignmentFromChat: typeof submitAssignmentFromChat;
    listAssignmentSubmissions: typeof listAssignmentSubmissions;
    generateGradeDraft: typeof generateGradeDraft;
    saveGradeReview: typeof saveGradeReview;
    releaseGrade: typeof releaseGrade;
    listMyFeedback: typeof listMyFeedback;
    getFeedbackDetail: typeof getFeedbackDetail;
}

export const createAssignmentDomainInterface =
    (): AssignmentDomainInterface => ({
        createAssignment,
        listMyAssignments,
        listClassAssignments,
        submitAssignmentFromChat,
        listAssignmentSubmissions,
        generateGradeDraft,
        saveGradeReview,
        releaseGrade,
        listMyFeedback,
        getFeedbackDetail,
    });

export const assignmentDomainInterface = createAssignmentDomainInterface();
