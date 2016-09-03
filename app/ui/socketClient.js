import io from 'socket.io-client';

// TODO: Make this configurable (same as api middleware)
const API_ROOT = 'http://localhost:3000';
 
export default function (store) {
  const socket = io.connect(API_ROOT);
 
  socket.on('request-saved', data => {
    console.log('Request saved:');
    console.log(data);
  });
 
  socket.on('response-saved', data => {
    console.log('Response saved:');
    console.log(data);
  });
}
