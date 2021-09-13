# Redis를 활용한 병원 자동완성 검색 프로젝트

## 기술 스택(Technology Stack)

```
- Front-End
    - React + TypeScript
    - Axios(HTTP)

- Back-End
    - Node.js + Express
    - Redis
    - Csv File Parsing
```

## 개발환경 설정(Development Environment Setting)

```
- Integration

  - 모듈 설치(Modules Install)
    $ yarn install

- Front-End

  - 모듈 설치(Modules Install)
    $ cd client
    $ yarn install

- Back-End

  - 서버 설치(Server Install)

    1. 각 운영체제 Docker 및 Docker Compose 설치
        공식 홈페이지 https://docs.docker.com/compose/install/

    2. 컨네이터 생성
        $ docker-compose -f ./redis_docker.yml

        컨테이너가 성공적으로 생성이 됐다면 " control + c " 를 통해 환경에서 벗어난다.

    3. Redis 서버 실행
        $ docker start redis

        시작 명령어: docker start redis
        재시작 명령어: docker restart redis
        종료 명령어: docker stop redis

    4. Docker 환경 접속
        $ docker exec -it 컨테이너 이름 bash

        ex) docker exec -it redis bash

    5. Redis 콘솔환경 접속
        $ redis-cli --raw

  - 모듈 설치(Modules Install)

    $ cd server
    $ yarn install

  - CSV File Redis 서버에 설정(Data Setting)

    $ cd server
    $ node addDataToRedisSortedSet.js

    redis 콘솔 환경 접속 후 hospital key 확인

    콘솔환경 접속: $ redis-cli --raw
    키 확인 명령어: keys *

  - 색인 파일 생성

    $ cd server
    $ node setIndexing.js

    redis 콘솔 환경 접속 후 hospital_index key 확인

    콘솔환경 접속: $ redis-cli --raw
    키 확인 명령어: keys *
```

## 프로젝트 시작(Start The Project)

```
  - Front-End
    $ yarn client

  - Back-End
    $ yarn server

  - Front & Back Start
    $ yarn start

```
