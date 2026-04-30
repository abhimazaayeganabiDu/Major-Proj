import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";



export const useExecutionStore = create((set) => ({
    isExecuting: false,
    isRunning: false,
    submission: null,
    runResult: null,

    runCode: async (source_code, language_id, stdin, problemId) => {
        try {
            set({ isRunning: true });
            const res = await axiosInstance.post("executeCode/run-code", { source_code, language_id, stdin, problemId });
            
            set({ runResult: res.data.data });

            toast.success(res.data.message);
        } catch (error) {
            console.log("Error running code", error);
            toast.error("Error running code");
        }
        finally {
            set({ isRunning: false });
        }
    },

    executeCode: async (source_code, language_id, stdin, expected_outputs, problemId) => {
        try {
            set({ isExecuting: true });
            console.log("Submission:", JSON.stringify({
                source_code,
                language_id,
                stdin,
                expected_outputs,
                problemId
            }));
            const res = await axiosInstance.post("executeCode/execute-code", { source_code, language_id, stdin, expected_outputs, problemId });

            set({ submission: res.data.data });

            toast.success(res.data.message);
        } catch (error) {
            console.log("Error executing code", error);
            toast.error("Error executing code");
        }
        finally {
            set({ isExecuting: false });
        }
    }
}))