import { AsyncHandler } from "../utils/api-async-handler.js";
import { db } from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResult, submitBatch } from "../libs/judge0.lib.js";
import { ApiError } from "../utils/api-error-handle.js";
import { ApiResponse } from "../utils/api-response.js";

const createProblem = AsyncHandler(async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    example,
    constraints,
    testcases,
    codeSnippets,
    referenceSolution,
  } = req.body;

  const isAlreadyProblem = await db.problem.findUnique({
    where: { title }
  })

  if (isAlreadyProblem) {
    throw new ApiError(409, "Problem already exists with title.")
  }

  for (const [language, solutionCode] of Object.entries(referenceSolution)) {
    const languageId = getJudge0LanguageId(language);

    if (!languageId) {
      throw new ApiError(400, `Language ${language} is not supported.`);
    }

    const submissions = testcases.map(({ input, output }) => ({
      source_code: solutionCode,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }));

    const submissionResult = await submitBatch(submissions);
    const tokens = submissionResult.map((res) => res.token);
    const result = await pollBatchResult(tokens);

    for (let i = 0; i < result.length; i++) {
      if (result[i].status.id != 3) {

        throw new ApiError(
          400,
          `Testcase ${i + 1} failed for language ${language} with ${result[i].status.description}`
        );
      }
    }

    const newProblem = await db.problem.create({
      data: {
        userId: req.user.id,
        title,
        description,
        difficulty,
        tags,
        example,
        constraints,
        testcases,
        codeSnippets,
        referenceSolution,
      },
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          newProblem,
          "New problem created and tested sucessfully."
        )
      );
  }
});

const getAllProblems = AsyncHandler(async (req, res) => {
  const allProblems = await db.problem.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      difficulty: true,
      tags: true,
      userId: true,
      createdAt: true,
      updatedAt: true
    }
  })

  if (!allProblems) {
    throw new ApiError(404, "No problem found.")
  }

  return res.status(200).json(new ApiResponse(200, allProblems, "All problem fetched sucessfully."))
})

const getProblemByID = AsyncHandler(async (req, res) => {
  const { id } = req.params

  const problem = await db.problem.findUnique({
    where: { id }
  })

  if (!problem) {
    throw new ApiError(404, "No problem found.")
  }

  return res.status(200).json(new ApiResponse(200, problem, "Problem fetched sucessfully."))
})

const updateProblem = AsyncHandler(async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    example,
    constraints,
    testcases,
    codeSnippets,
    referenceSolution,
  } = req.body;

  const id = req.params.id;

  if (!(id || title)) {
    throw new ApiError(404, "Id or title not found.")
  }

  const problem = await db.problem.findUnique({
    where: {
      id
    },
    select: {
      title: true,
      userId: true
    }
  })

  if (!problem) {
    throw new ApiError(404, "Problem not found.")
  }

  if (req.user.id !== problem.userId) {
    throw new ApiError(401, "Unauthorized, You Cannot create this Problem.")
  }


  for (const [language, solutionCode] of Object.entries(referenceSolution)) {
    const languageId = getJudge0LanguageId(language)

    if (!languageId) {
      throw new ApiError(409, `Language ${language} is not supported.`);
    }

    const submissions = testcases.map(({ input, output }) => ({
      source_code: solutionCode,
      language_id: languageId,
      stdin: input,
      expected_output: output,
    }))

    const submissionResult = await submitBatch(submissions)
    const token = submissionResult.map((res) => (res.token))
    const result = await pollBatchResult(token)

    for (let i = 0; i < result.length; i++) {
      if (result[i].status.id != 3) {

        throw new ApiError(
          400,
          `Testcase ${i + 1} failed for language ${language} with ${result[i].status.description}`
        );
      }
    }
  }

  const updatedProblem = await db.problem.update({
    where: { id },
    data: {
      userId: req.user.id,
      title,
      description,
      difficulty,
      tags,
      example,
      constraints,
      testcases,
      codeSnippets,
      referenceSolution,
    }
  })

  return res.status(200).json(new ApiResponse(200, updatedProblem, "Problem updated sucessfully."))
})

const deleteProblem = AsyncHandler(async (req, res) => {
  const { id } = req.params

  const problem = await db.problem.findUnique({ where: { id } });

  if (!problem) {
    throw new ApiError(404, "Problem not found.")
  }

  const deletedProblem = await db.problem.delete({ where: { id } })

  return res.status(200).json(new ApiResponse(200, deletedProblem, "Problem deleted sucessfully."))
})

const getAllProblemSolvedByUser = AsyncHandler(async (req, res) => {
  const userId = req.user.id

  const problems = await db.problemSolved.findMany({
    where: { userId },
    select: {
      id: true,
      problemId: true,
      userId: true,
      problem: {
        select: {
          title: true,
          description: true,
          difficulty: true,
          tags: true,
        }
      },
      createdAt: true,
      updatedAt: true
    }
  })

  if (!problems || problems.length === 0) {
    throw new ApiError(404, "No problem solved by user.")
  };

  return res.status(200).json(new ApiResponse(200, problems, "All problem solved by user fetched sucessfully."))

})


// Method - 2       to get all problems solved by user

// const getAllProblemSolvedByUser = async (req, res) => {
//   try {
//     const problems = await db.problem.findMany({
//       where:{
//         problemSolved:{
//           some:{
//             userId:req.user.id
//           }
//         }
//       },
//       include:{
//         problemSolved:{
//           where:{
//             userId:req.user.id
//           }
//         }
//       }
//     })

//     res.status(200).json({
//       success:true,
//       message:"Problems fetched successfully",
//       problems
//     })
//   } catch (error) {
//     console.error("Error fetching problems :" , error);
//     res.status(500).json({error:"Failed to fetch problems"})
//   }
// };

export { createProblem, getAllProblems, getProblemByID, updateProblem, deleteProblem, getAllProblemSolvedByUser };
