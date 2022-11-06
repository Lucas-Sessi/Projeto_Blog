const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const Posts = require('./posts.js');
const fileupload = require('express-fileupload');
const fs = require('fs');

var session = require('express-session');


app.engine('html',require('ejs').renderFile);
app.set('view engine','html');
app.use('/public',express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'/views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended:true
}))

// CONFIGURAÇÕES DO EXPRESS-SESSION

app.use(session({
  secret: 'keyboard cat',
  cookie: { maxAge: 60000 },
  resave : false , 
  saveUninitialized : true , 
}));

  //CONFIGURAÇÕES DO EXPRESS FILEUPLOAD

app.use(fileupload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'temp')
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
      
    res.render('single',{noticiaPrincipal:resposta,postsTop:postsTop});
  })


})
})


// FORMULARIO

var usuarios = [
  {
    login: 'lucas',
    senha: '123456'
  }
]

app.post('/admin/login', function(req,res){
  usuarios.map(function(val){
    if(val.login == req.body.nome && val.senha == req.body.senha){
      req.session.login = 'Lucas';
    }
  })
  res.redirect('/admin/login');
})


// ROTA DO PORTAL DE GESTÃO DO BLOG (DESENVOLVIDA COM O EXPRESS-SESSION)

app.get('/admin/login',function(req,res){
  if(req.session.login == null){
    res.render('admin-login',{});
  }else{
    Posts.find({}).sort({ _id: -1 }).exec(function(err, posts){
      //console.log(posts[0]);

      posts = posts.map(function(val){
        return {
          id: val._id,
          titulo: val.titulo,
          imagem: val.imagem,
          categoria: val.categoria,
          conteudo: val.conteudo,
          descricaoCurta: val.conteudo.substr(0,100),
          slug: val.slug
        }
      })
      res.render('admin-panel',{posts:posts});
  })
  }
})

//ROTA DE CADASTRO DE NOTICIAS DO BLOG

app.post('/admin/cadastro', (req,res)=>{
  //console.log(req.body);

  //UPLOAD DE ARQUIVOS (EXPRESS FILEUPLOAD)
  //console.log(req.files);

  //UPLOAD DE ARQUIVOS DENTRO DA VARIÁVEL REQ.FILES.

  let formato = req.files.arquivo.name.split('.');
  var imagem = "";
  
  if(formato[formato.length - 1] == 'jpg'){
    imagem = new Date().getTime()+'.jpg';
    req.files.arquivo.mv(__dirname+'/public/images/'+ imagem);
  }else{
    //para não sobrecarregar
    fs.unlinkSync(req.files.arquivo.tempFilePath);
  }


  //INSERINDO NO BANCO DE DADOS
  Posts.create({
    titulo: req.body.titulo_noticia,
    imagem: '/public/images/'+imagem,
    categoria: "Nenhum",
    conteudo: req.body.noticia,
    slug: req.body.slug,
    views: 0,
    author: "Admin"
  })
    res.redirect('/admin/login');

})

// DELETANDO ARQUIVOS COM BASE NO ID

app.get('/admin/deletar/:id',function(req,res){
  Posts.deleteOne({_id:req.params.id}).then(function(){
    res.redirect('/admin/login');
  })
  
})


app.listen(process.env.PORT || 5000,function(){
  console.log('Server Rodando');
})