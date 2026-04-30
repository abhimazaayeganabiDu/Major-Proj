import { db } from "../libs/db.js";
import { AsyncHandler } from "../utils/api-async-handler.js";
import { ApiError } from "../utils/api-error-handle.js"
import { ApiResponse } from "../utils/api-response.js"


const getAllSubmission = AsyncHandler(async (req, res) => {
    const submissions = await db.submission.findMany({
        where: {
            userId: req.user.id
        },
        select: {
            id: true,
            problemId: true,
            problem: {
                select: {
                    title: true,
                }
            },
            language: true,
            status: true,
            memory: true,
            time: true,
            createdAt: true,
            updatedAt: true,
        }
    })

    if (!submissions) {
        throw new ApiError(404, "No submissions found")
    }

    return res.status(200).json(
        new ApiResponse(200, submissions, "All submission fetched sucessfully.")
    )

})

const getAllSubmissionByProblemId = AsyncHandler(async (req, res) => {
    const { problemId } = req.params
    const userId = req.user.id

    const problem = await db.problem.findUnique({
        where: {
            id: problemId
        },
        select: {
            id: true,
            title: true
        }
    })

    if (!problem) {
        throw new ApiError(404, "Problem not found")
    }

    const submission = await db.submission.findMany({
        where: {
            problemId,
            userId
        }
    })

    if (!submission) {
        throw new ApiError(404, "Submission not found")
    }

    return res.status(200).json(new ApiResponse(200, submission, "Submission fetched successfully"))
})

const getSubmissionById = AsyncHandler(async (req, res) => {
    const { submissionId } = req.params

    const submission = await db.submission.findUnique({
        where: {
            id: submissionId
        },
        select: {
            id: true,
            problemId: true,
            problem: {
                select: {
                    title: true,
                }
            },
            source_code: true,
            language: true,
            status: true,
            memory: true,
            time: true,
            createdAt: true,
            updatedAt: true,
            user: {
                select: {
                    username: true,
                }
            }
        }
    })

    if (!submission) {
        throw new ApiError(404, "Submission not found")
    }

    return res.status(200).json(new ApiResponse(200, submission, "Submission fetched successfully"))
})

const getSubmissionCountById = AsyncHandler(async (req, res) => {
    const { problemId } = req.params

    const submissionCount = await db.submission.count({
        where: {
            problemId: problemId,
        }
    })

    if (!submissionCount) {
        throw new ApiError(404, "Submission not found")
    }

    return res.status(200).json(new ApiResponse(200, { count: submissionCount }, "Submission count fetched successfully"))
})

export {
    getAllSubmission,
    getAllSubmissionByProblemId,
    getSubmissionById,
    getSubmissionCountById
}