import axios from 'axios'

export const getJudge0LanguageId = (language) =>{
    const languageMap = {
        "JAVASCRIPT":63, 
        "PYTHON":71,
        "JAVA":62,
        "CPP":54, //  (GCC 9.2.0)
    }

    return languageMap[language.toUpperCase()];
}

export const getLanguageName = (language_id) => {
    const languageMap = {
        63: "JAVASCRIPT",
        71: "PYTHON",
        62: "JAVA",
        54: "CPP", //  (GCC 9.2.0)
    }

    return languageMap[language_id];
}


export const submitBatch = async (submissions) => {
    const url = process.env.JUDGE0_API_URL;

    const {data} = await axios.post(`${url}/submissions/batch?base64_encoded=false`, {submissions})

    return data;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const pollBatchResult = async (token) => {
    const url = process.env.JUDGE0_API_URL;

    let data;
    let isAllDone = false;
    let i = 1;

    while(!isAllDone) {
        data = await axios.get(`${url}/submissions/batch`, {
            params:{
                tokens: token.join(","),
                base64_encoded:false
            }
        })
        
        const result = data.data.submissions
        isAllDone = result.every((result) => result.status.id >= 3)
        
        await sleep(1000*(i*=1.25)); 
    }
    
    return data.data.submissions;
}