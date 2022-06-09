const validator = require('validator');

module.exports=(req, res, next)=>{
    const passwordValidation = validator.isStrongPassword(req.body.password)
    if(!passwordValidation){
        console.log('Votre mot de passe doit contenir au moins 8 caractères dont une minuscule, une majuscule, un chiffre et un symbole')
        return res.status(400).json({message: 'Votre mot de passe doit contenir au moins 8 caractères dont une minuscule, une majuscule, un chiffre et un symbole'})
    }else{
        next()
    }
}