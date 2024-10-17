const prisma = require("../configs/prisma");
const createError = require("../utils/createError");
const cloudinary = require("../configs/cloudinary");
const fs = require("fs/promises");
const bcrypt = require("bcryptjs");
const path = require("path");

const userController = {};

userController.getAllDoc = async (req, res, next) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    const isUserExist = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
    });
    if (!isUserExist) {
      createError(401, "Unauthorized");
    }

    const allDocuments = await prisma.document.findMany({
      where: {
        userId: +userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ allDocuments });
  } catch (error) {
    console.log(error);
  }
};

userController.getFilteredDoc = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const searchTitle = req.query.searchTitle;

    console.log(userId);
    console.log(searchTitle);

    const isUserExist = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
    });
    if (!isUserExist) {
      createError(400, "user not found");
    }

    const allFilteredDocs = await prisma.document.findMany({
      where: {
        title: {
          contains: searchTitle,
          // mode: 'insensitive'
        },
      },
    });

    res.json({ allFilteredDocs });
  } catch (error) {
    next(error);
  }
};
userController.getProfile = async (req, res, next) => {
  try {
    const allDocuments = await prisma.document.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ document: allDocuments });
  } catch (error) {
    console.log(error);
  }
};

userController.editProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;

    // console.log("userId =",userId)
    // console.log("file image =",req.file)
    // console.log("username =" ,username )

    if (!(username.trim() || profileImage.trim())) {
      createError(400, "no username or password");
    }

    const haveFile = !!req.file;
    let uploadResult = {};
    if (haveFile) {
      uploadResult = await cloudinary.uploader.upload(req.file.path, {
        overwrite: true,
        public_id: path.parse(req.file.path).name,
      });
      fs.unlink(req.file.path);
    }

    const data = {
      username: username,
      profileImage: uploadResult.secure_url,
    };
    console.log(data);

    const updateProfile = await prisma.user.update({
      where: {
        id: +userId,
      },
      data: data,
    });

    res.json({ msg: "update successful" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

userController.resetPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    console.log("new Pass=", newPassword);
    console.log("userId=", userId);

    const user = await prisma.user.findFirst({
      where: {
        id: +userId,
      },
    });
    console.log(user.password);

    const checkNotSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );
    if (checkNotSamePassword) {
      createError(400, "new password must not be the same");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    console.log("hashedPassword", hashedNewPassword);

    const resetPassword = await prisma.user.update({
      where: {
        id: +userId,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    res.json({ msg: "reset success", resetPassword });
  } catch (error) {
    next(error);
  }
};

// ----- document part -----------------
userController.createDoc = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // sent user id form front and compare !! but lazy now

    console.log(userId);

    if (!userId) {
      createError(401, "not receive userId");
    }

    const isUserExist = await prisma.user.findUnique({
      where: {
        id: +userId,
      },
    });

    if (!isUserExist) {
      createError(401, "user not found");
    }

    const pageData = await prisma.document.create({
      data: {
        userId: +userId,
      },
    });

    res.json({ msg: "create success", pageData });
  } catch (error) {
    next(error);
  }
};
userController.getDoc = async (req, res) => {
  try {
  } catch (error) {}
};
userController.updateDoc = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { content } = req.body;

    console.log(documentId);
    console.log(content);
    // console.log(req.body)

    const idDocExist = await prisma.document.findUnique({
      where: {
        id: +documentId,
      },
    });
    if (!idDocExist) {
      createError(400, "document  not found");
    }

    const updateContent = await prisma.document.update({
      where: {
        id: +documentId,
      },
      data: {
        content: content,
      },
    });

    res.json({ mes: "updated success" });
  } catch (error) {
    next(error);
  }
};

userController.updateTitle = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { title } = req.body;

    console.log(req.body);
    console.log(documentId);
    console.log(title);

    if (!documentId || !title) {
      createError(400, "required documentID and title!!");
    }

    // validate
    // use prisma later to check is exist

    const updateTitle = await prisma.document.update({
      where: {
        id: +documentId,
      },
      data: {
        title: title,
      },
    });

    res.json({ msg: "update title successful" });
  } catch (error) {
    next(error);
  }
};

userController.deleteDoc = async (req, res) => {
  try {
    const { documentId } = req.params;
    console.log(documentId);

    if (!documentId) {
      createError(400, "require documentId");
    }
    const isDocumentExist = await prisma.document.findFirst({
      where: {
        id: +documentId,
      },
    });
    if (!isDocumentExist) {
      createError(400, "document not found");
    }

    console.log("pretest");

    const deleteDocument = await prisma.document.delete({
      where: {
        id: +documentId,
      },
    });
    console.log("post test");

    res.json({ msg: "delete successful", deleteDocument });
  } catch (error) {}
};

// --------- Permission part ------------------
userController.addOwnerPermission = async (req, res, next) => {
  try {
    // console.log("first")
    const { userId, documentId } = req.body;

    const data = {
      userId: +userId,
      documentId: +documentId,
      permission: "OWNER",
    };

    // console.log(data)

    const setOwner = await prisma.permission.create({
      data: data,
    });

    res.json({ msg: "come to owner per" });
  } catch (error) {
    next(error);
  }
};

userController.givePermission = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { identity, permission } = req.body;
    console.log("documentId =", documentId);
    console.log("permission =", identity, permission);
    const userOwner = req.user;

    // cannot give to the user that not exist
    const isUserExist = await prisma.user.findFirst({
      where: {
        email: identity,
      },
    });
    if (!isUserExist) {
     createError(400, "user is not exist");
    }
    // the owner can not change their status to Editor Viewer
    if(identity == userOwner.email){
      createError(400, "you are the Owner of document")
    }

    // cannot give permission who already set must change instead
    const findUserByEmail = await prisma.user.findFirst({
      where : {
        email : identity
      }
    })
    console.log(findUserByEmail)

    const isUserHasDuplicatePermission = await prisma.permission.findFirst({
      where : {
        userId : +findUserByEmail.id
      }
    })
    // console.log("isUserHasDuplicatePermission",isUserHasDuplicatePermission)
    if(isUserHasDuplicatePermission){
      createError(400, "user already has permission")
    }

    const data = {
      documentId : +documentId,
      userId : +findUserByEmail.id,
      permission : permission
    }

    // console.log(data)
    const givePermission = await prisma.permission.create({
      data,
    })

    res.json({ msg: `gave permission to ${identity}`, data : givePermission });
  } catch (error) {
    next(error);
  }
};

userController.getAllUserPermission = async (req, res, next) => {
  try {
    const { documentId } = req.params
    console.log(documentId)

    // validate
    // check isexist document??

    const getAllUserPermission = await prisma.permission.findMany({
      where : {
        documentId : +documentId
      },
      // include select all user data that appear in permission
      include : {
        user : true
      }
    })

    res.json({ getAllUserPermission })
  } catch (error) {
    next(error)
  }
}
userController.deletePermission = async (req, res, next) => {
  try {
    const { permissionId } = req.params
    console.log(permissionId)

    // validate
    const deletePermission = await prisma.permission.delete({
      where : {
        id : +permissionId
      }
    })

    res.json({ msg : "remove success"})
  } catch (error) {
    next(error)
  }
}
// --------Rollback save part -----------------
userController.saveBackupVersion = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { content } = req.body;

    const data = {
      documentId: +documentId,
      content,
    };

    const createBackUp = await prisma.version.create({
      data: data,
    });

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

userController.getVersionDoc = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    console.log(documentId);
    // validate

    const saveBackup = await prisma.version.findMany({
      where: {
        documentId: +documentId,
      },
      orderBy : {
        id : 'desc'
      }
    });

    res.json({ saveBackup });
  } catch (error) {
    next(error);
  }
};

module.exports = userController;
