import { db } from "../libs/db.js";
import { AsyncHandler } from "../utils/api-async-handler.js";
import { ApiError } from "../utils/api-error-handle.js";
import { ApiResponse } from "../utils/api-response.js";


const getAllPlaylistDetails = AsyncHandler(async (req, res) => {
    const { userId } = req.user.id

    const playlists = await db.playlist.findMany({
        where: {
            userId
        }
    })

    return res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched successfully."))
})

const getPlayListDetails = AsyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(400, "Please provide playlist id.")
    }

    const playlist = await db.playlist.findUnique({
        where: {
            id: playlistId,
            userId: req.user.id
        },
        include: {
            problems: {
                select: {
                    problem:{
                        select:{
                            id: true,
                            title: true,
                            description: true,
                            difficulty: true,
                            tags:true,
                            createdAt:true,
                            updatedAt:true
                        }
                    }
                }
            }
        }
    })

    if (!playlist) {
        throw new ApiError(400, "Playlist not found.")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully."))
})

const createPlaylist = AsyncHandler(async (req, res) => {
    const { name, description, profile } = req.body

    const userId = req.user.id

    if (!(name && description)) {
        throw new ApiError(400, "Please provide all the required fields")
    }

    const existedPlaylist = await db.playlist.findFirst({
        where: {
            name,
            userId
        }
    })

    if (existedPlaylist) {
        throw new ApiError(409, "Playlist already exists.")
    }

    const playlist = await db.playlist.create({
        data: {
            name,
            description,
            profile,
            userId
        }
    })

    const playlistCreated = await db.playlist.findUnique({
        where: {
            id: playlist.id
        }
    })

    return res.status(200).json(new ApiResponse(200, playlistCreated, "Playlist created sucessfully."))
})

const addProblemToPlaylist = AsyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { problems } = req.body

    if (!(Array.isArray(problems) && problems.length > 0)) {
        throw new ApiError(402, "Please enter problem to add to playlist.")
    }

    const playlist = await db.playlist.findUnique({
        where: { id: playlistId }
    })

    if (!playlist) {
        throw new ApiError(402, "Playlist not found in db.")
    }

    const problemInPlaylists = await db.problemInPlaylist.createMany({
        data: problems.map((problemId) => ({
            playlistId,
            problemId
        }))
    })

    return res.status(200).json(new ApiResponse(200, problemInPlaylists, "Problems added to playlist."))
})

const deletePlaylist = AsyncHandler(async (req, res) => {
    const { playlistId } = req.params

    const deletedPlaylist = await db.playlist.delete({
        where: {
            id: playlistId
        }
    })

    return res.status(200).json(new ApiResponse(200, deletedPlaylist, "Playlist deleted sucessfully."))
})

const removeProblemFromPlaylist = AsyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { problems } = req.body

    if (!(Array.isArray(problems) && problems.length > 0)) {
        throw new ApiError(402, "Please enter problem to remove from playlist.")
    }

    const deletedProblems = await db.problemInPlaylist.deleteMany({
        where: {
            playlistId,
            problemId: {
                in: problems
            }
        }
    })

    return res.status(200).json(new ApiResponse(200, deletedProblems, "Problems removed from playlist."))

})


export {
    addProblemToPlaylist, createPlaylist, deletePlaylist, getAllPlaylistDetails,
    getPlayListDetails, removeProblemFromPlaylist
};
