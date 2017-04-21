// Modules ====================================================================
// créé une application Express
var express = require('express');
var app = express();
//--------------------------------
// lie l'application à mongodb
var mongojs = require('mongojs');
// lie la base de donnée todolist
var db = mongojs('todolist', ['todolist']);
//--------------------------------
var bodyParser = require('body-parser');

// Lecture des fichiers à l'emplacement du dossier : /public
// => HTML, CSS et JS
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

// récupère le contenu de la base de donnée ====================================
app.get('/todolist', function(req, res){
  console.log('I received a GET request');
  db.todolist.find(function(err, docs){
    console.log(docs);
    res.json(docs);
  });
});

// envoi une donnée vers la base ==============================================
app.post('/todolist', function(req, res){
  console.log(req.body);
  db.todolist.insert(req.body, function(err, doc){
    res.json(doc);
  });
});

//supprime une donnée de la base ==============================================
app.delete('/todolist/:id', function (req, res){
  var id = req.params.id;
  console.log(id);
  //suppression de la base de donnée :
  db.todolist.remove({_id: mongojs.ObjectId(id)}, function(err, doc){
    res.json(doc);
  });
});

//modifie une donnée dans la base ==============================================
app.put('/todolist', function(req, res){
  // id et name sont récupérés dans le body et non pas en param de l'URL pour éviter les bugs de caractères
  var id = req.body._id;
  console.log('I will PUT something ...');
  console.log(req.body);
  db.todolist.findAndModify({query: {_id: mongojs.ObjectId(id)},
  update: {$set: {name: req.body.name, completed: req.body.completed}},
  new: true}, function(err, doc){
    res.json(doc);
  });
});

// modification de la base déclenchée avec allchecked
app.put('/todolist/check', function(req, res){
  var check = req.body.action;
  db.todolist.update({}, {$set: {completed: check}}, { multi: true });
})

// localhost:3001
app.listen(3001);
console.log('Server is running on port 3001');
