import express from "express";
import { addProblemToPlaylist, createPlaylist, deletePlaylist, getAllPlaylistDetails, getPlayListDetails, removeProblemFromPlaylist } from "../controllers/playlist.controller.js";
import { checkLogin } from "../middleware/login.middleware.js";


const app = express.Router()

app.use(checkLogin)

app.get("/", getAllPlaylistDetails);
app.post("/create-playlist", createPlaylist);
app.post("/:playlistId/add-problem", addProblemToPlaylist);
app.delete("/:playlistId/remove-problem", removeProblemFromPlaylist)
app.get("/:playlistId", getPlayListDetails);
app.delete("/:playlistId", deletePlaylist);


export default app;