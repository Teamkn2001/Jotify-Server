const prisma = require('../configs/prisma')

module.exports = async( req, res, next) => {
    try {
        const { documentId } = req.params
        const user = req.user 

        const AllPermissionsById = await prisma.permission.findMany({
            where : {
                documentId : +documentId
            }
        })

        // ♥ is this userId have some permission in this doc?
        //  if none can not watch sent them back might be error case

        // ♥ what is Permission type this userId have ?
        const findPermissionType = AllPermissionsById.find( el => el.userId === user.id)
        // if Owner get set req.Ownership = OWNER
        // if Editor get set req.Ownership = EDITOR
        // if VIEWER get set req.Ownership = VIEWER
       
        next()
    } catch (error) {
        next(error)
    }
}