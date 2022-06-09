
const Sauce = require('../models/sauce');
const fs = require('fs');

const inputRegexp = new RegExp(/^[a-z0-9\séèçêëàù'\-,":{}]{1,200}$/i)

//création d'une nouvelle sauce
exports.createSauce = (req, res, next) =>{
    //on test les entrées du formulaire avec le regexp
    const valideInput = inputRegexp.test(req.body.sauce)
    if(!valideInput){
        return res.status(400).json({message: 'certains caractères spéciaux ne sont pas autorisés'})
    }else{
      
    //on récupère le contenu de la requête
    const sauceObject = JSON.parse(req.body.sauce)
        //on créé un nouvel ojet selon le model sauce
        const sauce = new Sauce({
            userId : sauceObject.userId,
            name: sauceObject.name,
            manufacturer: sauceObject.manufacturer,
            description: sauceObject.description,
            mainPepper: sauceObject.mainPepper,
            heat: sauceObject.heat,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            likes: 0,
            dislikes: 0,
            usersLiked: [],
            usersDisliked: []
        });
        //on enregistre le nouvel objet dans la bdd 
        sauce.save()
        .then(() => res.status(201).json({ message: "Sauce ajoutée"}))
        .catch(error => res.status(400).json({ error })); 
    } 
};

//like et dislike des sauces
exports.likeSauce = (req, res, next)=>{
    const userId = req.body.userId;
    const like = req.body.like;
    //on trouve la sauce qui a le même id que celui de la requête
    Sauce.findOne({_id: req.params.id}) 
        .then(sauce=>{
            let usersLiked = sauce.usersLiked;
            let usersDisliked = sauce.usersDisliked;

            switch(like){
                //quand on like: like = 1
                case 1:
                  if(usersDisliked.includes(userId)){
                       console.log( 'Vous avez déjà un avis sur cette sauce')
                    }else{ 
                    usersLiked.push(userId);
                    const sauceLiked = {
                        usersLiked: usersLiked,
                        likes: usersLiked.length
                    }
                    Sauce.updateOne({_id: req.params.id}, {...sauceLiked, _id: req.params.id })
                    .then(()=> res.status(200).json({message: "Sauce likée"}))
                    .catch(error=> res.status(400).json({error: error}));
                }
                    break;
                    //quand on dislike: like = -1
                case -1:
                     if(usersLiked.includes(userId)){
                        console.log('Vous avez déjà un avis sur cette sauce')
                    }else{ 
                    usersDisliked.push(userId);
                    const sauceDisliked = {
                        usersDisliked: usersDisliked,
                        dislikes: usersDisliked.length
                    }
                    Sauce.updateOne({_id: req.params.id}, {...sauceDisliked, _id: req.params.id })
                    .then(()=> res.status(200).json({message: "Sauce dislikée"}))
                    .catch(error=> res.status(400).json({error}));
                }
                    break;
                    //quand in a deja liké ou disliké la sauce: like = 0
                case 0:
                    usersLiked = usersLiked.filter(p=> p !== userId)
                    usersDisliked = usersDisliked.filter(p=> p !== userId)
                    Sauce.updateOne({_id: req.params.id},{usersLiked, usersDisliked, likes: usersLiked.length, dislikes: usersDisliked.length})
                        .then(()=> res.status(200).json({message: "Votre avis sur cette sauce a été supprimé"}))
                        .catch(error=>res.status(400).json({error}))
                    break;
                default:
                    console.log('default');

           };
        })
        .catch(error=> res.status(404).json({error: error})) 
};
 //récupérer la totalité des sauces
exports.getAllSauce = (req, res, next) =>{
    Sauce.find()
    .then((sauces)=> res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error: error }));
};
//récupérer une seule sauce en fonction de l'id de la requête
exports.getOneSauce = (req, res, next)=>{
    Sauce.findOne({ _id: req.params.id})
    .then((sauce)=> res.status(200).json(sauce))
    .catch(error => res.status(404).json({error: error}));
};

//mise à jour d'une sauce
exports.modifySauce = (req, res, next) =>{
    //1er cas: l'image est modifiée
    if(req.file){
     //on test les entrées du formulaire avec le regexp   
    const valideInput = inputRegexp.test(req.body.sauce)
        if(!valideInput){
            return res.status(400).json({message: 'certains caractères spéciaux ne sont pas autorisés'})
        }else{
        let sauceObject = JSON.parse(req.body.sauce)
        
            Sauce.findOne({ _id: req.params.id})
            .then(sauce =>{
                //on supprime l'ancienne image
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, ()=> {console.log('ancienne image supprimée')}) 
                //on créé une nouvelle sauce avec les nouvelles données de la requête
                sauceObject = {
                    ...sauceObject,
                    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
                }
    
                Sauce.updateOne({_id: req.params.id}, {...sauceObject})
                .then(() => res.status(200).json({ message: 'Objet modifié !'}))
                .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(400).json({error}))
        }
    //2ème cas: l'image n'est pas modifiée            
    }else{
        //on test les entrées du formulaire avec le regexp
        const valideName = inputRegexp.test(req.body.name)
        const valideManufacurer = inputRegexp.test(req.body.manufacturer)
        const validedescription = inputRegexp.test(req.body.description)
        const valideMainpepper = inputRegexp.test(req.body.mainPepper)
        const valideHeat = inputRegexp.test(req.body.heat)
       
        if(!valideName || !valideManufacurer || !validedescription || !valideMainpepper || !valideHeat){
            return res.status(400).json({message: 'certains caractères spéciaux ne sont pas autorisés'})
        }else{
        Sauce.updateOne({_id: req.params.id}, {...req.body})
            .then(() => res.status(200).json({ message: 'Objet modifié !'}))
            .catch(error => res.status(400).json({ error }));
        }
    }
};

 //suppression d'une sauce
exports.deleteSauce = (req, res, next) =>{
    //on trouve la sauce concernée
    Sauce.findOne({_id: req.params.id})
        .then((sauce)=> {
            //on vérifie que la sauce existe
            if(!sauce){
                return res.status(404).json({error: new Error('Objet non trouvé')})
            }
            //on vérifie que le user est bien celui qui a créé la sauce
            if(sauce.userId !== req.auth.userId){
                return res.status(401).json({error: new Error ('Requête non authentifiée')})
            }else{
                //on supprime le fichier de l'image et ensuite on supprime la sauce de la bdd
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, ()=> { 
                Sauce.deleteOne({_id: req.params.id})
                    .then(()=> res.status(200).json({ message: 'Sauce supprimée'}))
                    .catch(error => res.status(400).json({error}))
                })
            }
        })
        .catch(error => res.status(500).json({error}));
}