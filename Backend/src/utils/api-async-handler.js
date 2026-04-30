const  AsyncHandler = (passedFunction) => {
    return async (req, res, next) => {
        try {
            await passedFunction(req, res, next)
        } catch (error) {
            next(error)
        }
    }
}

export {AsyncHandler};