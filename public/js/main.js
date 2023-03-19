const URL = "http://localhost:3000";
const socket = io();

const chatMessages = document.querySelector('.chat-messages');
const userList = document.querySelectorAll('.contact .name');

const {username} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

var yourUser;  //người sẽ nhắn tin
var myUser;   //client - người đang nhìn thấy giao diện nhắn tin
var myMessages; 
//hãy hiểu rằng myUser chính là người gửi - bản thân, yourUser là người bản thân nhắn

//danh sách user, sau này sẽ lấy từ db
var users = [{
    name: "Bao",
    id: "A"
  },{
    name: "rogers",
    id: "B"
  },{
    name: "stark",
    id: "C"
  },{
    name: "thor",
    id: "D"
  },{
    name: "banner",
    id: "E"
  }
];

//xác định user nào là client (kiểm tra xem tên của user có trùng với tên đc gửi qua URL ko)
myUser = users.find(function(user){
    return user.name === username;
})

//gửi tín hiệu cho server là client đang kết nối
socket.emit("user connected",myUser)

//lắng nghe phản hồi của server và thông báo client đã kết nối
socket.on("user connected", function(data){
  myUser = data.user;
  myMessages = data.result;
  var html = data.user.name + " with ID " + data.user.id + " connected";
  // document.getElementById("announce").innerText ="";
  document.getElementById("announce").innerText = html;
  setChat(myUser);
  myMessages.forEach(function(message){
    makeOutputMess(message);
    // console.log(message)
  })
})

//lập list những người sẽ chọn để nhắn tin, chưa update loại myUser ra khỏi list này
users.forEach(function(user){
  //mặc định người có id = 1 sẽ là người đc chọn nhắn tin (cần thay đổi thành người đầu tiên trong list)
  if (myUser === user) {return; }
  var html=`<div class="nav-link contact" data-bs-target="#tabContent${user.id}" type="button" role="tab" data-bs-toggle="pill" aria-controls="${user.id}" onclick="selectedUser(this)">
      <div class="pic ${user.name}">
    </div>
  </div>`;
  document.querySelector(".nav-pills.nav").innerHTML += html;
});

//xác định người mà mình sẽ nhắn
// yourUser = users[document.querySelector(".nav-link.active").getAttribute('aria-controls')];

//hiển thị nội dung chat giữa bản thân và người đc chọn
function setChat(myUser){
  document.querySelector(".tab-content.chat").innerHTML="";
  var myName = myUser.name;
  users.forEach(function(user){
    const div = document.createElement('div');
    div.setAttribute('id', 'tabContent' + user.id)
    div.classList.add('tab-pane','fade','chat');
    var txt = `
           <div class="contact bar" >
    <div class="pic ${user.name}">
    </div>
    <div class="name">${user.name}</div>
    <div class="seen">Today at 12:56</div>
  </div>
  <div class="messages" id="chat${user.name}">
  </div>
  <div class="input">
    <i class="fas fa-camera">
    </i><i class="far fa-laugh-beam">
    </i><input placeholder="Type your message here!" type="text" id="input${user.id}"/>
    <button style="border: none;" id="send${user.id}" onclick="sendMessage('${user.id}');"> <i class="fas fa-paper-plane" ></i> </button>
    <i class="fas fa-microphone">
    </i>
  </div>
  
    `;
    div.innerHTML += txt;
    document.querySelector(".tab-content.chat").appendChild(div);
  } )
}

// myMessages.forEach(function(message){
//   console.log(message)
//   makeOutputMess(message);
// })


//sự kiện đc thực hiện khi nhấn gửi tin nhắn 
function sendMessage(yourID){
  // alert("nani");
  var message = document.querySelector("#input"+yourID).value; //lấy nội dung tin nhắn

  //gửi thông tin tin nhắn cho server 
  socket.emit("send message", {
    "sender": myUser.id,
    "receiver": yourUser.id,
    "content": message,
  });
    document.querySelector("#input"+yourID).value = "";
    document.querySelector("#input"+yourID).focus();
}



function selectedUser(self){
  var id = self.getAttribute('aria-controls');
  yourUser =  users.find(function(user){
    return user.id === id;
  })
  // alert("you has connected to" + yourUser.name + "with ID "+ yourUser.id)
}


socket.on("receive message",function(message){
  makeOutputMess(message)
})

function makeOutputMess(message){
  const div = document.createElement('div');
  console.log(message)
  div.classList.add('message');

  div.setAttribute("data-bs-toggle","tooltip");
  div.setAttribute("title",message.time);
  div.innerText=message.content;
  
  const tooltip = document.createElement('span');
  tooltip.classList.add('toolTip');
  tooltip.innerText=message.time;

  div.appendChild(tooltip);

  if (message.sender == myUser.id){
    
    div.classList.add('me');
    document.querySelector(`#tabContent${message.receiver} > .messages`).appendChild(div);
    var chat = document.querySelector(`#tabContent${message.receiver} > .messages`)
    chat.scrollTop = chat.scrollHeight;
  }
  else {
    document.querySelector(`#tabContent${message.sender} > .messages`).appendChild(div);
    var chat = document.querySelector(`#tabContent${message.receiver} > .messages`)
    chat.scrollTop = chat.scrollHeight;
  }
}

// const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
// const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))



// var document.querySelector(".nav-link.contact.active")



// document.querySelectorAll("form").forEach(function(form, idx){
//   form.addEventListener('submit',function(e){
//     var yourID = idx;
//     e.preventDefault();
//     var message = document.getElementById("input"+yourID).value;
//       io.emit("send_message", {
//         "sender": myName.name,
//         "receiver": otherPersonName,
//         "message": message
//       });
  
//       const div = document.createElement('div');
//       div.classList.add('message','me');
//       div.innerText=message.value;
//       document.querySelector(`#tabContent${yourID} > .messages`).appendChild(div);
//       document.getElementById("input"+yourID).value = "";
//       document.getElementById("input"+yourID).focus();
    
//       return false;
//   })
// })



// <div class="time">Today at 11:41</div>
// <div class="message me">Hey, man! What's up, Mr ${user.name}? 👋</div>
// <div class="message ${user.name}">Kid, where'd you come from? </div>
// <div class="message me">Field trip! 🤣</div>
// <div class="message me">Uh, what is this guy's problem, Mr. ${user.name}? 🤔</div>
// <div class="message ${user.name}">Uh, he's from space, he came here to steal a necklace from a wizard.</div>
// <div class="message ${user.name}">
//   <div class="typing typing-1">
//   </div>
//   <div class="typing typing-2">
//   </div>
//   <div class="typing typing-3">
//   </div>
// </div>