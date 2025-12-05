# 설치
> 1. Node.js 설치 LTS 버전으로
> 2. cmd 에서 'npm -v' 로 버전 확인
> 3. npm create svelte@latest my-app 으로 프로젝트 생성
> 4. npm run dev 로 프로젝트 수행
> 5. package.json 으로 해당 프로젝트 구성요소 확인.
> 6. bootstrap 설치
    => npm install bootstrap
> 7. moment 설치
    => npm install moment    
> 8. npm install qs
    => npm install qs  
> 9. 마크다운
    => npm install marked    
> 10. 프론트엔드 빌드 => sveltkit의 빌드와 배포 방법에 대해서 추가로 study 필요.
    =>  npm run build

# 1. package.json 파일
> node.js 프로젝트의 의존성을 정의한다.

# 2. package-lock.json 파일
> 의존성 파일이다.

# 3. 기타 파일
> .gitignore => git 으로 관리 하지 않을 파일을 지정한다.
> .npmrc => npm 설정 파일로 프로젝트별 npm 설정을관리하다.

# 4. svelte.config
> ?? 스벨트 내부 설정 파일이란다.

# 5. vite.config.js
> 플러그인 설정 파일이다.

# 6. .svelte-kit 풀더
> 스크립트의 컴파일된 결과물이 저장된다.

# 7. node_modules 폴더
> npm install 명령어를 실행할때 자동으로 생성되며 프로젝트에서 사용되는 모든 패키지가 이곳에 설치된다.

# 8. static 폴더
> 프로젝트의 정적 파일들을 담고 있다.

# 9. src 폴더
> 스벨트kit의 실제 코드가 작성되는 곳이다.
> lib 공용 컴포너트
> routes 개별 컴포너트
> static 공용 자원

# 10. routes 폴더
> 라우팅 기능을 담당한다.

# 11. app.html 파일
> 전체 페이지 구조가 정의 됩니다. 기본적인 html 구조를 설정하는 곳이다.