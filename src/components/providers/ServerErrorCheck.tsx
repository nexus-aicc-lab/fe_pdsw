


import { useErrorAlertStore } from "@/store/errorAlertStore";

// 0529 현재 200, undefined, 프론트오류를 제외한 모든 에러는 Alert 후 로그아웃 (로그인페이지로 강제이동) 처리
const ServerErrorCheck = (requestContent: string, dataMessage: string, routerCheck? : boolean) => {
  
  // 함수라서 컴포넌트 렌더링이 불가능하므로 공용 에러 store 사용
  const openAlert = useErrorAlertStore.getState().openAlert;

  // 기본으로 출력될 메시지
  let errorMessage = requestContent + ' 요청이 실패하였습니다. \nPDS 서버 시스템에 확인하여 주십시오.';
  const errorTitle = '알림';
  
  
  if(dataMessage.split('||')[0] === 'undefined'){
    // 정의되지 않은 에러
    console.log('###### ServerErrorCheck undefined Error : ', dataMessage, 'requestContent: ', requestContent);
    routerCheck = false;
  }
  else if (dataMessage.split('||')[0] === '5') {
    // 세션 만료 에러
    console.log('###### ServerErrorCheck session Error : ', dataMessage, 'requestContent: ', requestContent);
    errorMessage = 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야합니다.';
    routerCheck = true;
  }
  else if (dataMessage.split('||')[0] === '200') {
    // 200으로 정의된 에러
    console.log('###### ServerErrorCheck 200 Error : ', dataMessage, 'requestContent: ', requestContent);
    routerCheck = false;
  }
  else if (dataMessage.includes("Cannot read properties of undefined") ||
           dataMessage.includes("Cannot read properties of null") ) {
    // api 결과는 성공이지만 데이터 가공이 undefined 또는 null인 경우
    routerCheck = false;        
    console.log('###### ServerErrorCheck data Error : ', dataMessage, 'requestContent: ', requestContent);
    errorMessage = `${requestContent} 데이터 결과 오류입니다. \nPDS 관리자에게 문의하세요.`;
  }else{
    // 그 외의 에러
    console.log('###### ServerErrorCheck else Error - dataMessage: ', dataMessage, 'requestContent: ', requestContent);
    errorMessage = 'PDS 서버 시스템과 연결할 수 없습니다. \n서버 동작 상태를 확인하여 주십시오. 프로그램을 종료합니다.'
    routerCheck = true;
  }

  // routerCheck ==> 로그인 페이지 보낼지 여부 변수 (나중에 필요할 경우 let 으로 변경)
  if(routerCheck === undefined) {
    routerCheck = false;
  }


  return openAlert({
    title: errorTitle,
    message: errorMessage,
    type: "1",
    routerYn: routerCheck,
  });
  
  
  
};

export default ServerErrorCheck;