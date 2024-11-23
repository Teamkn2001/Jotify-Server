const createError = require("../utils/createError")
const jwt = require('jsonwebtoken')
const prisma = require('../configs/prisma')

module.exports = async(req, res, next) => {
    
    try {
        const authorization = req.headers.authorization

        if( !authorization || !authorization.startsWith('Bearer ')){
            createError(401, "Unauthorized-1")
        }

        const token = authorization.split(' ')[1]

        const payload = jwt.verify(token, process.env.JWT_SECRET)

        const findUser = await prisma.user.findUnique({
            where : {
                id : payload.id
            }
        })
        if(!findUser){
            createError(401, "Unauthorized-2")
        }

        req.user = findUser
   
        next()
    } catch (error) {
        next(error)
    }
}