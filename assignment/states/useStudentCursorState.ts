import { useEffect, useState } from "react";
import type { AssignmentStudentSubmission } from "../types";

export const useStudentCursorState = (
    students: AssignmentStudentSubmission[],
) => {
    const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

    useEffect(() => {
        setCurrentStudentIndex((previousIndex) => {
            if (students.length === 0) {
                return 0;
            }

            return Math.min(previousIndex, students.length - 1);
        });
    }, [students.length]);

    const handlePrevStudent = () => {
        setCurrentStudentIndex((previousIndex) =>
            Math.max(previousIndex - 1, 0),
        );
    };

    const handleNextStudent = () => {
        if (students.length === 0) {
            return;
        }

        setCurrentStudentIndex((previousIndex) =>
            Math.min(previousIndex + 1, students.length - 1),
        );
    };

    return {
        state: {
            currentStudentIndex,
            currentStudent: students[currentStudentIndex],
        },
        actions: {
            setCurrentStudentIndex,
            handlePrevStudent,
            handleNextStudent,
        },
    };
};
