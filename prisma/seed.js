const bcrypt = require("bcryptjs");
const prisma = require("../configs/prisma");

const hashedPassword = bcrypt.hashSync("123456", 10);

const userData = [
  {
    username: "yui",
    password: hashedPassword,
    email: "yui@gmail.com",
    profileImage: "https://www.svgrepo.com/show/420349/avatar-dead-monster.svg",
  },
  {
    username: "Free",
    password: hashedPassword,
    email: "free@gmail.com",
    profileImage: "https://www.svgrepo.com/show/420316/indian-man-sikh.svg",
  },
  {
    username: "Bob",
    password: hashedPassword,
    email: "Bob@gmail.com",
    profileImage: "https://www.svgrepo.com/show/420361/avatar-man-muslim.svg",
  },
];

console.log("DB_SEED =", userData);

async function run() {
    await prisma.user.createMany({
        data : userData
    })
}

run()