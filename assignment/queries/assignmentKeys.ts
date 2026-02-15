const resolveViewerUserId = (viewerUserId?: string | null) =>
    viewerUserId?.trim() || "__anonymous__";

export const assignmentKeys = {
    all: (viewerUserId?: string | null) =>
        ["assignment", resolveViewerUserId(viewerUserId)] as const,
    myAssignments: (
        viewerUserId: string | null | undefined,
        classId: string | null | undefined,
    ) =>
        [
            ...assignmentKeys.all(viewerUserId),
            "my-assignments",
            classId?.trim() || "__all_classes__",
        ] as const,
    classAssignments: (
        viewerUserId: string | null | undefined,
        classId: string,
    ) => [...assignmentKeys.all(viewerUserId), "class-assignments", classId] as const,
    dashboard: (
        viewerUserId: string | null | undefined,
        classId: string,
    ) => [...assignmentKeys.all(viewerUserId), "dashboard", classId] as const,
    assignmentSubmissions: (
        viewerUserId: string | null | undefined,
        assignmentId: string,
    ) =>
        [
            ...assignmentKeys.all(viewerUserId),
            "assignment-submissions",
            assignmentId,
        ] as const,
    myFeedback: (
        viewerUserId: string | null | undefined,
        classId: string | null | undefined,
    ) =>
        [
            ...assignmentKeys.all(viewerUserId),
            "my-feedback",
            classId?.trim() || "__all_classes__",
        ] as const,
    feedbackDetail: (
        viewerUserId: string | null | undefined,
        submissionId: string,
    ) => [...assignmentKeys.all(viewerUserId), "feedback-detail", submissionId] as const,
};
