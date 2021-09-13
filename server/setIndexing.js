const redisClient = require("./config/RedisConnection")

/**
 * @author Ryan
 * @description 역 인덱싱 만들기
 */
async function setIndexing() {
  //색인 정보를 담는 Map 클래스
  const map = new Map()

  //카운드 정보를 담는 Map 클래스
  const map_count = new Map()

  const data = await new Promise((resolve, reject) => {
    redisClient.ZRANGE("hospital", 0, -1, "withscores", (err, data) => {
      if (data) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })

  /**
   * data 변수 형태는 ['병원이름', 'score', '병원이름', 'score']
   *
   * 병원 이름과 score 값을 나누기 위해 사용된다.
   */
  const key_list = []
  const value_list = []

  for (let index = 0; index < data.length; index++) {
    const element = data[index]

    //짝수
    if (index % 2 == 0) {
      value_list.push(element)
    }
    //홀수
    else {
      key_list.push(element)
    }
  }

  value_list.forEach((data, index) => {
    const hospital_name = data // 병원 이름

    // Map 클래스에 네 글자 키가 있다면
    if (
      map.has(
        hospital_name.charAt(0) +
          hospital_name.charAt(1) +
          hospital_name.charAt(2) +
          hospital_name.charAt(3)
      )
    ) {
      //기존에 저장해 놓은 데이터를 조회한다.
      const lists = map.get(
        hospital_name.charAt(0) +
          hospital_name.charAt(1) +
          hospital_name.charAt(2) +
          hospital_name.charAt(3)
      )

      //새로운 인덱스 정보를 뒤에 이어서 저장한다.
      lists.push(key_list[index])

      //인덱스 정보를 업데이트 해준다.
      map.set(
        hospital_name.charAt(0) +
          hospital_name.charAt(1) +
          hospital_name.charAt(2) +
          hospital_name.charAt(3),
        lists
      )
    }
    // Map 클래스에 네 글자 키가 없다면
    else {
      const list = []

      //새로운 인덱스를 추가한다.
      list.push(key_list[index])
      map.set(
        hospital_name.charAt(0) +
          hospital_name.charAt(1) +
          hospital_name.charAt(2) +
          hospital_name.charAt(3),
        list
      )
    }

    // Map 클래스에 세 글자 키가 있다면
    if (
      map.has(
        hospital_name.charAt(0) +
          hospital_name.charAt(1) +
          hospital_name.charAt(2)
      )
    ) {
      //기존에 저장해 놓은 데이터를 조회한다.
      const lists = map.get(
        hospital_name.charAt(0) +
          hospital_name.charAt(1) +
          hospital_name.charAt(2)
      )

      //새로운 인덱스 정보를 뒤에 이어서 저장한다.
      lists.push(key_list[index])

      //인덱스 정보를 업데이트 해준다.
      map.set(
        hospital_name.charAt(0) +
          hospital_name.charAt(1) +
          hospital_name.charAt(2),
        lists
      )
    }
    // Map 클래스에 세 글자 키가 없다면
    else {
      const list = []

      //새로운 인덱스를 추가한다.
      list.push(key_list[index])
      map.set(
        hospital_name.charAt(0) +
          hospital_name.charAt(1) +
          hospital_name.charAt(2),
        list
      )
    }

    // Map 클래스에 두 글자 키가 있다면
    if (map.has(hospital_name.charAt(0) + hospital_name.charAt(1))) {
      //기존에 저장해 놓은 데이터를 조회한다.
      const lists = map.get(hospital_name.charAt(0) + hospital_name.charAt(1))

      //새로운 인덱스 정보를 뒤에 이어서 저장한다.
      lists.push(key_list[index])

      //인덱스 정보를 업데이트 해준다.
      map.set(hospital_name.charAt(0) + hospital_name.charAt(1), lists)
    }
    // Map 클래스에 두 글자 키가 없다면
    else {
      const list = []

      //새로운 인덱스를 추가한다.
      list.push(key_list[index])
      map.set(hospital_name.charAt(0) + hospital_name.charAt(1), list)
    }

    //Map 클래스에 첫 글자 키가 있다면
    if (map.has(hospital_name.charAt(0))) {
      //기존에 저장해 놓은 데이터를 조회한다.
      const lists = map.get(hospital_name.charAt(0))

      //새로운 인덱스 정보를 뒤에 이어서 저장한다.
      lists.push(key_list[index])

      //인덱스 정보를 업데이트 해준다.
      map.set(hospital_name.charAt(0), lists)
    }
    // Map 클래스에 첫 글자 키가 없다면
    else {
      const list = []

      //새로운 인덱스를 추가한다.
      list.push(key_list[index])
      map.set(hospital_name.charAt(0), list)
    }
  })

  //map 클래스 정보를 Object 형태로 변환
  const obj = Object.fromEntries(map)

  /**
   * 정리한 데이터를 Redis 서버에 인덱싱 파일을 생성한다.
   */
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const element = obj[key] // 요소 값을 찾는다

      const start = element[0] //zrange 시작
      let end //zrange 끝

      /**
       * 실제 데이터를 담고 있는 파일에는 범위 값(0, 1, 2, 3)을 알고 있다.
       * 그렇기 때문에 시작 지점과 끝 지점을 통해 범위 검색이 가능하다.
       *
       * 만약 병원 정보가 한개가 있다면 시작 지점과 끝 지점이 동일해야 병원을 조회할 수 있다.
       */

      // 배열에 마지막 값이 없다면, 시작 지점 값을 마지막 지점 값으로 설정한다.
      if (element[element.length - 1] == undefined) {
        end = start
      }
      // 그렇지 않다면 끝지점 인덱스 값을 설정한다.
      else {
        end = element[element.length - 1]
      }

      //Redis hset 자료구조에 key: value 형태로 데이터를 저장할 때 value에 해당하는 정보이다.
      //인덱스 = 시작 지점 | 끝 지점
      const indexs = start + "|" + end

      redisClient.hset("hospital_index", key, indexs, function (err, reply) {
        if (err) {
          console.log("실패 : ", err)
          return
        } else {
          console.log("성공 : ", reply)
        }
      })
    }
  }
}

setIndexing()
