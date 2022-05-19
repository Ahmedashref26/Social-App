const io = require('socket.io')(8900, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const getUser = (userId) => users.find((user) => user.userId === userId);

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on('connection', (socket) => {
  console.log(`a user connected.`);
  //take userId and socketId from user
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit('getUsers', users);
  });

  //send and get messages
  socket.on('sendMessage', (msg) => {
    const user = getUser(msg.receiverId);
    io.to(user.socketId).emit('getMessage', msg);
  });

  socket.on('sendNotification', ({ sender, receiver, desc, type }) => {
    console.log('notifi received');
    const user = getUser(receiver);
    console.log('recever', user.socketId);
    io.to(user.socketId).emit('getNotification', {
      id: Date.now(),
      msg:
        type === 'comment'
          ? `${sender} ${type} on your post: ${desc}`
          : `${sender} ${type} your post: ${desc}`,
    });
  });

  //when disconnect
  socket.on('disconnect', () => {
    console.log('a user disconnected!');
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});
