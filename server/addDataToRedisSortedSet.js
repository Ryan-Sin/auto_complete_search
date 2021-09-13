const fs = require("fs")
const parse = require("csv-parse/lib/sync")
const redisClient = require("./config/RedisConnection")

/**
 *
 * @author Ryan
 * @description CSV 파일 Redis Sorted Set 방식 데이터 저장
 */
function addDataToRedisSortedSet() {
  //동기 방식으로 파일 정보 읽기
  const csv = fs.readFileSync("./hospital_info.csv", "utf8")

  const records = parse(csv.toString())

  /**
   * Redis 실제 데이터 파일 만들기
   */
  for (let index = 0; index < records.length; index++) {
    const element = records[index] // 요소

    const hospital_name = element[1] // 병원이름
    const address = element[10] // 병원 주소
    const latitude = element[28] // 위도
    const longitude = element[27] // 경도

    const data =
      hospital_name + " | " + address + " | " + latitude + " | " + longitude

    //Index, Score, Data, Callback
    redisClient.ZADD("hospital", index, data, function (err, reply) {
      if (err) {
        console.log("실패 : ", err)
        return
      } else {
        console.log("성공 : ", reply)
      }
    })
  }
}

addDataToRedisSortedSet()
