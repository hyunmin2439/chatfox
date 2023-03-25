require('dotenv').config(); // env 파일 불러오기
const serverless = require('serverless-http')
const { Configuration, OpenAIApi } = require("openai")
const express = require('express')
const cors = require('cors')
const app = express()

console.log(process.env.OPENAI_API_KEY)

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

// CORS 이슈 해결
const corsOptions = {
    origin: 'https://chatfox.pages.dev',
    credential: true
}
app.use(cors(corsOptions));

// post 요청 받을 수 있게 만듬
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// POST route
app.post('/fortuneTell', async function (req, res) {
    const { myDateTime, userMessages, astrologerMessages } = req.body

    let todayDateTime = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    const messages = [
        {role: "system", content: "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 여우술사입니다. 당신은 사람의 인생을 매우 정확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."},
        {role: "user", content: "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 여우술사입니다. 당신은 사람의 인생을 매우 정확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다."},
        {role: "assistant", content: "안녕하세요, 여우술사입니다. 어떤 질문이 있으신가요? 당신의 운세와 인생을 살펴볼 수 있도록 최선을 다해 도와드리겠습니다."},
        {role: "user", content: `저의 생년월일과 태어난 시간은 ${myDateTime}입니다. 그리고 오늘은 ${todayDateTime}입니다.`},
        {role: "assistant", content: `당신의 생년월일과 태어난 시간은 ${myDateTime}인 것을 확인하였습니다. 운세에 대해서 어떤 것이든 물어보세요!`},
    ]

    while( userMessages.length != 0 ) {
        messages.push(
            JSON.parse( '{"role": "user", "content": "' + String(userMessages.shift()).replace(/\n/g, "") + '"}' ) // 문자 깨짐 방지용
        )
    }

    while( astrologerMessages.length != 0 ) {
        messages.push(
            JSON.parse( '{"role": "assistant", "content": "' + String(astrologerMessages.shift()).replace(/\n/g, "") + '"}' )
        )
    }

    // 재시도 3번
    const maxRetries = 3;
    let retries = 0;
    let completion
    while (retries < maxRetries) {
      try {
        completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: messages
        });
        break;
      } catch (error) {
          retries++;
          console.log(error);
          console.log(`Error fetching data, retrying (${retries}/${maxRetries})...`);
      }
    }

    const fortune = completion.data.choices[0].message['content']

    res.json({"assistant": fortune})
})

module.exports.handler = serverless(app)
// app.listen(3000)