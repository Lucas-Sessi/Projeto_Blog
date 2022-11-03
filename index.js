const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const Posts = require('./posts.js');


app.listen(5000,function(){
  console.log('Server Rodando');
})

app.engine('html',require('ejs').renderFile);
app.set('view engine','html');
app.use('/public',express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'/views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended:true
}))


// CONECTANDO o MongoDB (Banco de dados)

mongoose.connect('mongodb+srv://root:uA0g7l9QZ76ONoYn@cluster0.sbilvxf.mongodb.net/dankicode?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology:true}).then(function (){
  console.log('Conectado com Sucesso');
}).catch(function(err){
  console.log(err.message);
})


//rota principal

app.get('/',(req,res)=>{
  if(req.query.busca == null){
    Posts.find({}).sort({ _id: -1 }).exec(function(err, posts){
      //console.log(posts[0]);

      posts = posts.map(function(val){
        return {
          titulo: val.titulo,
          imagem: val.imagem,
          categoria: val.categoria,
          conteudo: val.conteudo,
          descricaoCurta: val.conteudo.substr(0,100),
          slug: val.slug
        }
      })
      res.render('home',{posts:posts});
  })
  }else{
    Posts.find({titulo: {$regex: req.query.busca,$options:"i"}},function(err,posts){
      //console.log(posts);
      res.render('busca',{posts:posts,contagem:posts.length});
    })

  }
})

app.get('/:slug',(req,res)=>{
  //res.send(req.params.slug);
  Posts.findOneAndUpdate({slug: req.params.slug}, {$inc : {views: 1}}, {new: true},function(err,resposta){
    //console.log(resposta);

    Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){

      // console.log(posts[0]);
      if(resposta != null){
       postsTop = postsTop.map(function(val){

               return {
                   titulo: val.titulo,
                   conteudo: val.conteudo,
                   descricaoCurta: val.conteudo.substr(0,100),
                   imagem: val.imagem,
                   slug: val.slug,
                   categoria: val.categoria,
                   views: val.views
               }
       })
      }else{
        res.redirect('/');
      }
      
    res.render('single',{noticia:resposta,postsTop:postsTop});
  })


})
})
