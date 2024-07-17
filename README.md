### 프로젝트 개요


- 프로젝트 명 : 타워 디펜스 2인 멀티플레이 온라인 게임

- 소개

       - 내용 : 타워로 몬스터를 잡는 온라인 멀티 게임

       - 제작 기간 : 2024.07.12 ~ 2024.07.18




### 프로젝트 설계 및 구현




- 회원가입 로그인 기능

    - [x]  회원가입 (API)

    - [x]  로그인 (API)




- 유저 별 게임 데이터 관리

    - [x]  모든 게임 데이터 파일 




- 이벤트 구현

    - [x]  커넥션 성공 이벤트

    - [x]  상태 동기화 이벤트

        - [x]  기지 체력

        - [x]  유저 골드

        - [x]  타워 5게

        - [x]  몬스터 젠

        - [x]  유저 점수

    - [x]  게임 시작 이벤트

    - [x]  게임 종료 이벤트

    - [x]  타워 추가 이벤트

    - [x]  타워 공격 이벤트

    - [x]  몬스터 젠 이벤트

    - [x]  기지 체력 감소 이벤트

    - [x]  유저 별 최고 기록 확인 이벤트










### API 명세서 / ERD / 패킷 명세서 / 와이어 프레임




- [링크]










### BackEnd Skills




![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

![javascript](https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

![node.js](https://img.shields.io/badge/node.js-5FA04E?style=for-the-badge&logo=node.js&logoColor=white)

![.env](https://img.shields.io/badge/.env-ECD53F?style=for-the-badge&logo=.env&logoColor=black)

![amazonrds](https://img.shields.io/badge/amazonrds-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white)

![amazonec2](https://img.shields.io/badge/amazonec2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white)

![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)

![prettier](https://img.shields.io/badge/prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)

![git](https://img.shields.io/badge/git-F05032?style=for-the-badge&logo=git&logoColor=white)

![github](https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white)










### 폴더 구조




```markdown




node_modules/

prisma/

└── schema.prisma

proto/

└── game.proto

server_src/

├── handlers/

│ ├── game.handler.js

│ ├── gameSyncHandler.js

│ ├── matchMakingHandler.js

│ ├── monster.handler.js

│ └── tower.handler.js

├── init/

│ └── socket.js

├── models/

│ ├── playData.model.js

│ ├── monster.model.js

│ ├── tower.model.js

├── utils/

│ ├── prisma/

│ └── index.js

├── app.js

└── constants.js




client/

├── images/

│ ├── base.png

│ ├── bg.webp

│ ├── favicon.ico

│ ├── logo.png

│ ├── monster1.png

│ ├── monster2.png

│ ├── monster3.png

│ ├── monster4.png

│ ├── monster5.png

│ ├── monster6.png

│ ├── monster111.png

│ ├── path.png

│ └── tower.png

├── sounds/

│ ├── attacked.wav

│ ├── bgm.mp3

│ ├── lose.wav

│ └── win.wav

├── src/

│ ├── base.js

│ ├── multi_game.js

│ ├── multi_game2.js

│ ├── monster.js

│ └── tower.js

├── constants.js

├── index.html

├── login.html

├── login2.html

└── register.html




.env

.gitignore

.prettierrc

package-lock.json

package.json

README.md




```










### 게임 방법




- 회원가입 및 로그인




- 게임 시작 

    - 멀티플레이 상대는 로그인 2를 통해 로그인 

    - 대결하기 버튼을 통해 대결 대기열에 대기

    - 매칭이 완료되면 게임 시작 

    - 게임 시작후 초기 데이터들 설정




- 게임 종료

    - 기지의 체력이 0이 되면 게임이 종료

    - 상대의 점수와 비교 했을 때 높은 점수인 유저가 승리




- 기지 




- 타워

    - 초기 타워

     - 게임 시작 시 초기 타워 3개가 랜덤하게 배치
     

- 타워 구입

    - 골드를 소모해 타워를 구입

    - 구입한 타워도 랜덤하게 배치

    - 구입한 타워 동기화 

    - 구입 비용 : 500골드



- 몬스터
    - 몬스터 10마리 처치할 때마다 몬스터 체력이 10씩 증가 & 몬스터 스폰 주기 0.5초씩 줄어듦



- 점수

    - 몬스터를 처치할 때마다 100점을 획득

    - 점수 1000점당 500골드 증가

    - 게임이 끝날 때 마다 해당 게임의 점수를 기록

    - 최고 기록을 통해 사용자의 최고 점수 확인 가능

    - 상대의 점수와 비교 했을 때 높은 점수인 유저가 승리
