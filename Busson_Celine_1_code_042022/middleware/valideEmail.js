const validator = require("validator");

module.exports =(req, res, next)=>{
    const emailValidation = validator.isEmail(req.body.email)
    if(!emailValidation){
        return res.status(400).json({message: 'Email non valide'})
    }else{
        next()
    }
}