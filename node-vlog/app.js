var createError = require('http-errors')
var session = require('express-session')
var flash = require('express-flash')
var express = require('express')
var logger = require('morgan')
var path = require('path')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var db = require('./database')
var app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(logger('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(

    session({
        secret: '123@123abc',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 60000 },
    }),
)
app.use(flash())

app.get('/', function (req, res, next) {
    var sql = "SELECT * FROM usuarios"; // Consulta para buscar os dados no banco
    db.query(sql, function (err, storedData) {
        if (err) throw err;
        res.render('index', { title: 'User Form', storedData: storedData });
    });
});

app.post('/user_form', function (req, res, next) {
    var id = req.body.id
    var name = req.body.nome
    var email = req.body.email
    var message = req.body.mensagem
    var sql = `INSERT INTO usuarios (nome, email, mensagem, criado_em) VALUES
("${name}", "${email}", "${message}", NOW())`
    db.query(sql, function (err, result) {
        if (err) throw err
        console.log('Registro atualizado')
        req.flash('success', 'Dado armazenado!')
        res.redirect('/')
    })
})

app.post('/delete_data', function (req, res, next) {
    var dataId = req.body.dataId;

    // Recuperar o ID do dado excluído (pode ser usado para outros fins, se necessário)
    console.log('ID do dado excluído:', dataId);

    // Depois de excluir o dado, o próximo ID será gerado automaticamente se estiver usando auto-incremento
    var sqlDelete = `DELETE FROM usuarios WHERE id = ${dataId}`;
    db.query(sqlDelete, function (err, result) {
        if (err) throw err;
        console.log('Registro excluído');
        req.flash('success', 'Dado excluído!');
        res.redirect('/');
    });
});

app.use(function (req, res, next) {
    next(createError(404))
})
app.use(function (err, req, res, next) {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}
    res.status(err.status || 500)
    res.render('error')

})
app.listen(5555, function () {
    console.log('Servidor está rodando na porta : 5555')
})
module.exports = app