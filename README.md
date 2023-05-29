# nest.js로 간단한 SNS API 구축해보기

**요약**

- nest.js를 활용해 api를 만들어보며 기존에 쓰던 framework와 **비교 학습**

**역할**

- 1인 개인 프로젝트

**기간**

- 2022.11

**목적**

- 그동안 주로 **aws lambda** 기반의 서비스를 간편하게 작성할 수 있는 [corgi](https://www.npmjs.com/package/vingle-corgi?activeTab=readme) 프레임워크를 사용
- 익숙한 프레임워크에서 벗어나 범용적으로 사용되는 nest.js와 비교해보며 새로운 지식과 프로그래밍 관점 학습
- 각 프레임워크들이 가지고 있는 목적과 **프로그래밍 철학을 비교**하며 배워 내 것으로 익히고자 함


**세부 기능**

- provider, module, controller 의 기본적인 프레임워크 구조에 맞춰 SNS에 필요한 REST API 구현
- **postgresSQL, typeorm** 이용해 기본적인 CRUD 기능 구현
- **Docker** 파일 작성 후 이미지 생성, 컨테이너 빌드

**사용 기술**

- language: Typescript
- database: PostgresSQL
- backend: node.js, nest.js, Docker, typeorm