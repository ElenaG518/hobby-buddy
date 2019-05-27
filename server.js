const express = require('express');
const morgan = require('morgan');
const passport = require('passport');

const { localStrategy, jwtStrategy } = require('./middleware/strategies');
const connectDB = require('./config/db');
const usersRouter = require('./routes/api/users');
const authRouter = require('./routes/api/auth');
const profileRouter = require('./routes/api/profile');
const postsRouter = require('./routes/api/posts');

const app = express();

// connect to db
connectDB();

app.use(morgan('common'));
// app.use(cors());
// app.use(express.static('public'));

// passport
passport.use(localStrategy);
passport.use(jwtStrategy);

// Init Middleware
app.use(express.json({ extended: false })); //in lieu of bodyParser.json, express now has it's own parser.  YAAYY!

app.get('/', (req, res) => res.send('API Running'));

// define routes
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/posts', postsRouter);

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
