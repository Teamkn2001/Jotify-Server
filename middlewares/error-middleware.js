module.exports = (err, req, res , next) => {
    console.log(err.message)
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({ msg : err.message})
}