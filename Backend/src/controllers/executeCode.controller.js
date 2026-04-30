import { db } from "../libs/db.js";
import { getLanguageName, pollBatchResult, submitBatch } from "../libs/judge0.lib.js";
import { AsyncHandler } from "../utils/api-async-handler.js";
import { ApiError } from "../utils/api-error-handle.js";
import { ApiResponse } from "../utils/api-response.js";

const executeCode = AsyncHandler(async (req, res) => {
    const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;

    const userId = req.user.id;

    if (!(Array.isArray(stdin) && Array.isArray(expected_outputs) && stdin.length === expected_outputs.length && stdin.length > 0)) {
        throw new ApiError(400, "stdin and expected_outputs must be arrays of the same length and not empty.");
    }

    if (!language_id) {
        throw new ApiError(400, `Language ${language} is not supported.`);
    }

    const problem = await db.problem.findUnique({
        where: { id: problemId },
        select: {
            id: true,
            difficulty: true,
            title: true
        }
    })


    if(!problem) {
        throw new ApiError(404, "Problem not found.")
    }


    const submissions = stdin.map((input) => ({
        source_code,
        language_id,
        stdin: input,
    }))

    const submissionResult = await submitBatch(submissions);

    const token = submissionResult.map((res) => (res.token));
    const result = await pollBatchResult(token);

    let allPassed = true;

    const detailedResults = result.map((res, i) => {
        const stdout = res.stdout?.trim()
        const expected_output = expected_outputs[i]?.trim()
        const passed = stdout === expected_output

        // console.log(`Testcase ${i + 1}: ${passed ? "Passed" : "Failed"} input: ${stdin[i]} expected_output: ${expected_output} stdout: ${stdout}`);

        if (!passed) {
            allPassed = false;
        }

        return {
            tastcase: i + 1,
            passed: passed,
            stdout: stdout,
            expected: expected_output,
            stderr: result.stderr || null,
            compile_output: result.compile_output || null,
            status: res.status.description,
            memory: res.memory ? `${res.memory} KB` : undefined,
            time: res.time ? `${res.time} s` : undefined,
        };
    })

    // store submission summary in database

    const submission = await db.submission.create({
        data: {
            userId,
            problemId,
            source_code: source_code,
            language: getLanguageName(language_id),
            stdin: stdin.join("\n"),
            stdout: JSON.stringify(detailedResults.map((res) => res.stdout)),
            stderr: detailedResults.some((r) => r.std) ? JSON.stringify(detailedResults.map((res) => res.stderr)) : null,
            compileOutput: detailedResults.some((r) => r.compile_output) ? JSON.stringify(detailedResults.map((res) => res.compile_output)) : null,
            status: allPassed ? "Accepted" : "Wrong Answer",
            memory: detailedResults.some((r) => r.memory) ? JSON.stringify(detailedResults.map((res) => res.memory)) : null,
            time: detailedResults.some((r) => r.time) ? JSON.stringify(detailedResults.map((res) => res.time)) : null,
        }
    })

    if (allPassed) {
        await db.problemSolved.upsert({
            where: {
                userId_problemId: {
                    userId,
                    problemId
                }
            },
            update: {},
            create: {
                userId,
                problemId,
                difficulty: problem?.difficulty
            }
        })
    }

    const tastCaseResults = detailedResults.map((res) => {
        return {
            submissionId: submission.id,
            testCase: res.tastcase,
            passed: res.passed,
            stdout: res.stdout,
            expected: res.expected,
            stderr: res.stderr,
            compileOutput: res.compile_output,
            status: res.status,
            memory: res.memory,
            time: res.time,
        }
    })

    await db.testCaseResult.createMany({
        data: tastCaseResults
    })

    const submissionWithTestCase = await db.submission.findUnique({
        where: {
            id: submission.id
        },
        include: {
            testCases: true,
        }
    })

    return res.status(200).json(new ApiResponse(200, submissionWithTestCase, "Code executed successfully"))
}
)

const runCode = AsyncHandler(async (req, res) => {
    const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;

    if (!(Array.isArray(stdin) && Array.isArray(expected_outputs) && stdin.length === expected_outputs.length && stdin.length > 0)) {
        throw new ApiError(400, "stdin and expected_outputs must be arrays of the same length and not empty.");
    }

    const submissions = stdin.map((input) => ({
        source_code,
        language_id,
        stdin: input,
    }))

    const submissionResult = await submitBatch(submissions);

    const token = submissionResult.map((res) => (res.token));
    const result = await pollBatchResult(token);

    console.log("result", result);


    return res.status(200).json(new ApiResponse(200, result, "Code executed successfully."))
})


export { executeCode, runCode };

