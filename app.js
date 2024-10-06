const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const db = require('./config/database'); 
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require("cors");
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const flash = require('connect-flash');
const app = express();
const passport = require("passport");
const http  = require('http')
const server = http.createServer(app);
// const LocalStrategy = require("passport-local").Strategy;
const errorHandler = require('./middlewares/errorHandler');
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/userViews')]);
app.set('view engine', 'ejs');

app.use(session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,

}));

app.use(
  cors({
    credentials: true,
    origin: '*',
    optionsSuccessStatus: 200,
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash())


app.use(passport.initialize());


const adminRouter = require('./routes/adminRoute');
const usersRouter = require('./routes/userRoute');
const cartRouter = require('./routes/cartRoute');
// const homeRouter  = require('./routes/homeRoute')


require('./config/passport')(passport);
//passport -1


app.use('/admin', adminRouter);
app.use('/', usersRouter);
app.use('/cart',cartRouter)
app.get('/keep-alive', (_req: Request, res: Response) => {
    res.status(200).send('Server is alive!');
})


app.use(errorHandler);





app.use('*',(req,res,next)=>{
  res.render('errorHandler')
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});





server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind); // Replace 'debug' with 'console.log'
}

