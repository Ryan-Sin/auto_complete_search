import { useState, useEffect } from "react"
import "./App.css"
import axios from "axios"

interface Hospital {
  hospital_name: string // 병원 이름
  address: string // 주소
  coordinate: number // 현재 위치 기준으로 거리 값
}

interface Coordinate {
  latitude: number // 위도
  longitude: number // 경도
}

export default function App() {
  const [hospital, setHospital] = useState<Hospital[]>([])
  const [coordinate, setCoordinate] = useState<Coordinate>()

  //하버사인 공식을 이용하여 최단거리 구함
  const computeDistance = (
    startLat: any,
    starLlng: any,
    destLat: any,
    destLng: any
  ) => {
    const R = 6371e3 // 지구의 반지름 (meter)

    // 좌표를 라디안 단위로 변환
    const ladian1 = (startLat * Math.PI) / 180
    const ladian2 = (destLat * Math.PI) / 180
    const lan = ((destLat - startLat) * Math.PI) / 180
    const long = ((destLng - starLlng) * Math.PI) / 180
    const a =
      Math.sin(lan / 2) * Math.sin(lan / 2) +
      Math.cos(ladian1) *
        Math.cos(ladian2) *
        Math.sin(long / 2) *
        Math.sin(long / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const d = R * c // meter

    return d
  }

  /**
   * @author Ryan
   * @description 사용자가 입력한 값을 받아오는 함수
   *
   * @param value 사용자가 입력한 값
   */
  const onInputValue = async (value: string) => {
    try {
      const { data } = await axios.get(
        `http://localhost:4000/search?texts=${value}`
      )

      const hospital = data.data
        .map((data: any, i: number) => {
          const element = data.split("|")

          const latitude = element[2] // 위도
          const longitude = element[3] // 경도

          //현재 내 위치와 병원 위치의 거리를 구하는 함수
          const position = computeDistance(
            coordinate?.latitude,
            coordinate?.longitude,
            latitude,
            longitude
          )

          return {
            hospital_name: element[0],
            address: element[1],
            coordinate: Math.floor(position) / 1000,
          }
        })
        .sort((a: any, b: any) => a.coordinate - b.coordinate) //오름차 순 정렬

      setHospital(hospital) //서버에서 받은 값 최신값으로 변경
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * @author Ryan
   * @description 사용자 위치 정보 조회
   */
  const getLocation = async () => {
    await axios.get("https://geolocation-db.com/json/").then((result) => {
      const { latitude, longitude } = result.data

      setCoordinate({
        latitude,
        longitude,
      })
    })
    return new Promise((resolve, reject) => {
      /**
       * 브라우저 위치 권한 체크
       * 허용 했다면 브라우저 위치 기반으로 좌표 값을 조회
       */
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(
            setCoordinate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            })
          )
        },
        async (error) => {
          /**
           * 기본 값이거나 차단했다면 위치 정보 조회가 가능한 API 요청
           */
          if (error) {
            await axios
              .get("https://geolocation-db.com/json/")
              .then((result) => {
                const { latitude, longitude } = result.data
                resolve(
                  setCoordinate({
                    latitude,
                    longitude,
                  })
                )
              })
          }
        },
        {
          enableHighAccuracy: false,
          maximumAge: 0,
          timeout: Infinity,
        }
      )
    })
  }

  /**
   * @author Ryan
   * @description 페이지 랜더링 시 위치 좌표 값 조회
   */
  useEffect(() => {
    getLocation()
  }, [])

  return (
    <div className="Container">
      <SearchBar results={hospital} onInputValue={onInputValue} />
    </div>
  )
}

/**
 * @author Ryan
 * @description 사용자가 검색할 수 있는 검색 바
 *
 * @param results 병원 정보
 * @param onInputValue 입력 값을 받는 함수
 *
 * @returns <SearchBar/>
 */
const SearchBar = ({
  results,
  onInputValue,
}: {
  results: Hospital[]
  onInputValue: Function
}) => {
  const renderResults = results.map((data: Hospital, index: number) => {
    return (
      <SearchPreview
        key={index}
        hospital_name={data.hospital_name}
        address={data.address}
        coordinate={data.coordinate}
      />
    )
  })

  return (
    <div className="auto">
      <input
        className="search-bar"
        placeholder="Search"
        onChange={(e) => onInputValue(e.target.value)}
      />

      {results.length > 0 ? (
        <div className="search-results">{renderResults}</div>
      ) : null}
    </div>
  )
}

/**
 * @author Ryan
 * @description 검색 내용을 나타내는 View
 *
 * @param hospital_name 병원 이름
 * @param address 병원 주소
 * @param coordinate 거리 값
 *
 * @returns <SearchPreview/>
 */
const SearchPreview = ({
  hospital_name,
  address,
  coordinate,
}: {
  hospital_name: string
  address: string
  coordinate: number
}) => {
  return (
    <div>
      <div className="first">
        <p className="name">{hospital_name}</p>
        <p className="sub-header">
          <span>
            {address}
            <span style={{ color: "green" }}>{coordinate + "km"}</span>
          </span>
        </p>
      </div>
    </div>
  )
}
