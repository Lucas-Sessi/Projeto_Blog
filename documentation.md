Este é um projeto para fins educacionais;

O intuito desse projeto é praticar com as habilidades adquiridas em NodeJS

Os seguintes passos da aplicação foram:

1 - para iniciar a aplicação e o server:
 -> utilizar o seguinte comando no terminal: npm init
 -> configurar o arquivo json

2 - baixar/instalar os módulos npm:
 -> npm install express
 -> npm install ejs
 -> npm install nodemon
 -> npm install body-parser

3 - configurar o ambiente (servidor):
  importar os modulos:
   -> express (const express)
   -> path (const path)
   -> body-parser (bodyParser)

4 - salvar a função express em uma constante:
  -> const app = express();

5 - configurar o servidor com o express:
  -> app.listen(5000,function(){
    console.log('Servidor Rodando!')
    })

6 - configurar o ambiente com ejs e diretórios:
  -> app.engine('html',require('ejs').renderFile);
  -> app.set('view engine','html');
  -> app.use('/public',express.static(path.join(_dirname,'public')));
  -> app.use('views',path.join(_dirname,'/views'));

7 - configurar o body-parser:
  -> app.use(bodyParser.json());
  -> app.use(bodyParser.urlencoded({
    extended:true
  }))

8 - criar a ROTA principal:
  -> app.get('/',(req,res)=>{
    res.render('index',{});
  })