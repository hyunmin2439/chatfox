const chatMessages = document.querySelector(".chat-messages");
const chatInput = document.querySelector(".chat-input input");
const userMessages = [];
const astrologerMessages = [];
let userName = ''
let myDateTime = ''

function start() {
  userName = document.getElementById('name').value;
  let date = document.getElementById('date').value;
  let hour = document.getElementById('hour').value;

  if (userName === '') {
      alert('이름을 입력해주세요.');
      return;
  }

  if (date === '') {
      alert('생년월일을 입력해주세요.');
      return;
  }

  myDateTime = date + ' ' + hour + '시';

  console.log(myDateTime);

  document.getElementById('intro').style.display = "none";
  document.getElementById('chat').style.display = "block";
  document.getElementById('toss-ad').style.display = "block";
}

function spinner() {
  const div = document.createElement("div");

  div.id = "loader";
  div.classList.add("loader");
  div.innerHTML = `<i class="fa fa-spinner fa-spin"></i>`;

  chatMessages.appendChild(div)
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessage(message, sender, name) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(sender);
  div.innerHTML = `
    <div class="chat-profile">
      <img src="profile.png" class="chat-profile-img" />
      <p class="meta">${name} <span>${message.time}</span></p>
    </div>
    <p class="text">${message.text}</p>
  `;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const message = chatInput.value;
  if (message) {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newMessage = {
      text: message,
      time: time,
    };

    // user message 추가
    userMessages.push(message);

    addMessage(newMessage, "user", userName);
    chatInput.value = "";

    spinner();

    getFortune(message);
  }
}

function appenAstrologerMessage(message) {
  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  // Example usage of addMessage function
  const astrologerMessage = {
    text: message,
    time: time,
  };
  addMessage(astrologerMessage, "astrologer", "여우술사");
}

async function getFortune(message) {
  try {
      const response = await fetch('https://eo22vs8q9f.execute-api.ap-northeast-2.amazonaws.com/prod/fortuneTell', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            myDateTime: myDateTime,
            userMessages : userMessages,
            astrologerMessages : astrologerMessages,
          })
      });
      const data = await response.json();

       // spinner 제거
      const child = document.getElementById('loader');
      chatMessages.removeChild(child);

      // 답변 메세지 저장 및 화면 표기
      astrologerMessages.push(data.assistant)
      appenAstrologerMessage(data.assistant)
      return data;
  } catch (error) {
      console.log(error);

      // spinner 제거
      const child = document.getElementById('loader');
      chatMessages.removeChild(child);
  }
}

// event 연결
document
  .querySelector(".chat-input button")
  .addEventListener("click", sendMessage);

// Enter Event
chatInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

appenAstrologerMessage("안녕하세요. 무엇을 도와드릴까요?");