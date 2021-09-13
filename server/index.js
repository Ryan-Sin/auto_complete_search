const express = require("express")
const cors = require("cors")

const redisClient = require("./config/RedisConnection")

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    optionsSuccessStatus: 200,
  })
)

/**
 * @author Ryan
 * @description 연결확인
 */
app.get("/", async (req, res) => {
  res.json({ result: true })
})

/**
 * @author Ryan
 * @description 사용자가 입력했을 때 마다 자동 완성 겁색 기능을 제공하기 위해 사용
 *
 * @param {String} texts 사용자가 입력한 검색어
 */
app.get("/search", async (req, res) => {
  const { texts } = req.query

  /**
   * 사용자가 입력한 글자 수를 체크한다.
   * 글자가 2글자 이상이면 두 글자 범위에 색인 인덱스를 검색한다.
   * 글자 수가 1글자 수라면 한글자를 검색한다,
   *
   * 만약 그렇지 않다면 해당 포함된 글자 수를 체크한다.
   */
  let text
  let data
  let check1 = false
  if (texts.charAt(3) !== "") {
    check1 = true
    text = texts.charAt(0) + texts.charAt(1) + texts.charAt(2) + texts.charAt(3)
  } else if (texts.charAt(2) !== "") {
    text = texts.charAt(0) + texts.charAt(1) + texts.charAt(2)
  } else if (texts.charAt(1) !== "") {
    text = texts.charAt(0) + texts.charAt(1)
  } else {
    text = texts.charAt(0)
  }

  try {
    const range = await new Promise((resolve, reject) => {
      redisClient.HGET("hospital_index", text, function (err, data) {
        if (data) {
          resolve(data)
        } else {
          reject(err)
        }
      })
    })

    const start_end = range.split("|")

    data = await new Promise((resolve, reject) => {
      redisClient.ZRANGEBYSCORE(
        "hospital",
        Number(start_end[0]),
        Number(start_end[1]),
        "limit",
        0,
        10,
        (err, data) => {
          if (data) {
            resolve(data)
          } else {
            reject(err)
          }
        }
      )
    })
  } catch (error) {
    if (error == null) {
      data = []
    }
  }
  //글자가 세글자 이상이라면
  if (check1) {
    //사용자가 입력한 글자 수 만큼 글자를 자른다.
    text = texts.substr(0, texts.length)

    //실제 데이터에서도 사용자가 입력한 글자수 만큼 자른다. 그 후 사용자가 입력한 글자와 동일한 데이터를 추출한다.
    const filterData = data.filter(
      (element) => element.substr(0, texts.length) == text
    )
    data = filterData
  }

  res.json({ result: true, data })
})

app.listen(4000, () => console.log(`auto-complete-search start`))
