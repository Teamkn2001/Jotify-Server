require('dotenv').config()

const prisma = require('../configs/prisma')

async function run() {
    await prisma.$executeRawUnsafe('DROP database Jotify_db')
    await prisma.$executeRawUnsafe('create database Jotify_db')
}

run()