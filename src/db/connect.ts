import mongoose from 'mongoose';
import {
  CONNECTED_DATABASE_ERROR,
  CONNECTED_DATABASE_MONGO,
  CONNECTED_DATABASE_SUCCESS,
} from '../constants/Message';

mongoose.Promise = Promise;

// Connect to cluster in mongo atlas
mongoose.connect(
  'mongodb+srv://admin:admin123@cluster0.uifxm.mongodb.net/?retryWrites=true&w=majority',
  (err: Error) => {
    if (err) throw err;
    console.log(CONNECTED_DATABASE_MONGO);
  }
);

const conn = mongoose.connection;

// Conection error
conn.on('error', () => console.error.bind(console, CONNECTED_DATABASE_ERROR));

// Open connection
conn.once('open', () => console.info(CONNECTED_DATABASE_SUCCESS));

export default mongoose;
