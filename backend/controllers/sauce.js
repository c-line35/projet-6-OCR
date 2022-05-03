const express = require('express');
const{json} = require('express/lib/response');
const Sauce = require('../models/sauce');
const fs = require('fs');



exports.createSauce = (req, res, next) =>{
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
    .then(() => res.status(201).json({ message: "Sauce ajoutée"}))
    .catch(error => res.status(400).json({ error }));
};
exports.likeSauce = (req, res, next)=>{
    const userId = req.body.userId;
    const like = req.body.like;
    Sauce.findOne({_id: req.params.id}) 
        .then(sauce=>{
            let usersLiked = sauce.usersLiked;
            let usersDisliked = sauce.usersDisliked;
            console.log(like)
            switch(like){
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

exports.getAllSauce = (req, res, next) =>{
    Sauce.find()
    .then((sauces)=> res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error: error }));
};

exports.getOneSauce = (req, res, next)=>{
    Sauce.findOne({ _id: req.params.id})
    .then((sauce)=> res.status(200).json(sauce))
    .catch(error => res.status(404).json({error: error}));
};

exports.modifySauce = (req, res, next) =>{
    if(req.file){
        const userId = req.body.userId;
        Sauce.findOne({ _id: req.params.id, userId})
        .then(sauce =>{
            res.status(200)
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, ()=> {console.log('ancienne image supprimée')})
        })
        .catch(error=> res.status(404).json({error}));
    }
    const sauceObject = req.file ?
       {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`   
    }:{...req.body};
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
}; 

exports.deleteSauce = (req, res, next) =>{
    Sauce.findOne({ _id: req.params.id})
    .then(sauce =>{
    const filename = sauce.imageUrl.split('/images/')[1];
       fs.unlink(`images/${filename}`, ()=> { 
            Sauce.deleteOne({_id: req.params.id})
                .then(()=> res.status(200).json({message: 'Sauce supprimée'}))
                .catch(error => res.status(400).json({error}))
        });
    })
    .catch(error => res.status(500).json({error}));
}