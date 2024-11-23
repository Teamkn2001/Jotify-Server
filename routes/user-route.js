const express = require('express')
const userController = require('../controllers/user-controller')
const upload = require('../middlewares/upload')
const userRoute = express.Router()

userRoute.get('/:userId', userController.getAllDoc)
userRoute.get('/:userId/filter', userController.getFilteredDoc)

// edit profile
userRoute.get('/profile', userController.getProfile) // dont seem to be use???
userRoute.patch('/profile/resetPassword/:userId', userController.resetPassword)
userRoute.patch('/profile/editProfile/:userId',upload.single('image'), userController.editProfile)

// create edit doc
userRoute.post('/createDocument/:userId', userController.createDoc)
userRoute.get('/getDocument/:docId', userController.getDoc)
userRoute.patch('/document/updateDocument/:documentId', upload.single('image'), userController.updateDoc)
userRoute.patch('/document/updateTitle/:documentId', userController.updateTitle)
userRoute.delete('/document/deleteDocument/:documentId', userController.deleteDoc)

// permission 
userRoute.post('/document/addOwnerPermission', userController.addOwnerPermission)
userRoute.post('/document/givePermission/:documentId', userController.givePermission)
userRoute.get('/document/getAllUserPermission/:documentId', userController.getAllUserPermission)
userRoute.delete('/document/deletePermission/:permissionId', userController.deletePermission)
// version 
userRoute.post('/document/saveBackupVersion/:documentId', userController.saveBackupVersion)
userRoute.get('/document/getVersionDoc/:documentId', userController.getVersionDoc)

module.exports = userRoute