import io from 'socket.io-client';
import * as actions from './actions';

export function handleMessages(socket, store) {
  socket.on('request-saved', data => {
    store.dispatch(actions.addNewRequest(data));
  });
  
  socket.on('response-saved', data => {
    store.dispatch(actions.addNewResponse(data));
  });

}
 
export default function (apiRoot, store) {
  const socket = io.connect(apiRoot);
  handleMessages(socket, store);
}
