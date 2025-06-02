// C:\nproject\fe_pdsw\src\lib\error_message.ts

export const getCampaignErrorMessage = (returnCode: number) => {
    if (returnCode === -1) {
        return 'DataBase 데이터 처리 중 문제가 발생 하였습니다.';
    } else if (returnCode === -3) {
        return '상담사과 고객이 통화 중이라 캠페인 통계가 완료되지 않았습니다. \n잠시만 기다려주세요.';
    } else if (returnCode === -10) {
        return '에러사항에 대해서 관리자에게 문의 하세요.';
    } else if (returnCode === -15) {
        return '업무 외 시간으로 캠페인을 시작 할 수 없습니다. 캠페인 시작을 원하시면 발신 업무 시간을 변경 하십시오.';
    } else if (returnCode === -16) {
        return '상담사과 고객이 통화 중이라 캠페인 통계가 완료되지 않았습니다. \n잠시만 기다려주세요.';
    } else if (returnCode === -7770) {
        return '리스트 파일이 존재 하지 않습니다.';
    } else if (returnCode === -7771) {
        return '발신 할 레코드가 존재 하지 않습니다.';
    } else if (returnCode === -7772) {
        return '발신 순서가 없습니다.';
    } else if (returnCode === -7773) {
        return '캠페인 시작/종료 날짜를 확인해 주시기 바랍니다.';
    } else if (returnCode === -7774) {
        return '응대할 상담사가 없으므로 시작이 취소되었습니다.';
    } else if (returnCode === -7775) {
        return '발신 할 트렁크가 없습니다.';
    } else if (returnCode === -7776) {
        return '캠페인에 할당된 상담사가 없습니다.';
    } else if (returnCode === -7777) {
        return 'CIDS가 작동중 인지 확인 하세요.에러사항에 대해서 관리자에게 문의 하세요.';
    } else if (returnCode === -7778) {
        return '발신할 채널이 할당이 되어 있지 않습니다.';
    } else if (returnCode === -8000) {
        return '캠페인이 상태 변경 중이므로, 캠페인을 시작할 수 없습니다.';
    } else if (returnCode === -8001) {
        return '무한콜백 캠페인에서만 발생. UserOption Data(limit)가 있다.';
    } else if (returnCode === -10001) {
        return '캠페인 데이터 저장 공간이 남아 있지 않습니다. 관리자에게 문의 하세요.';
    }
};

// C:\nproject\fe_pdsw\src\lib\error_message.ts

export const getCampaignErrorMessage2 = (returnCode: number): string => {
    if (returnCode === -1) {
        return 'DataBase 데이터 처리 중 문제가 발생 하였습니다.';
    } else if (returnCode === -3) {
        return '상담사와 고객이 통화 중이라 캠페인 통계가 완료되지 않았습니다. \n잠시만 기다려주세요.';
    } else if (returnCode === -10) {
        return '에러 사항에 대해서 관리자에게 문의 하세요.';
    } else if (returnCode === -15) {
        return '업무 외 시간으로 캠페인을 시작 할 수 없습니다. 캠페인 시작을 원하시면 발신 업무 시간을 변경 하십시오.';
    } else if (returnCode === -16) {
        return '상담사과 고객이 통화 중이라 캠페인 통계가 완료되지 않았습니다. \n잠시만 기다려주세요.';
    } else if (returnCode === -7770) {
        return '리스트 파일이 존재 하지 않습니다.';
    } else if (returnCode === -7771) {
        return '발신 할 레코드가 존재 하지 않습니다.';
    } else if (returnCode === -7772) {
        return '발신 순서가 없습니다.';
    } else if (returnCode === -7773) {
        return '캠페인 시작/종료 날짜를 확인해 주시기 바랍니다.';
    } else if (returnCode === -7774) {
        return '응대할 상담사가 없으므로 시작이 취소되었습니다.';
    } else if (returnCode === -7775) {
        return '발신 할 트렁크가 없습니다.';
    } else if (returnCode === -7776) {
        return '캠페인에 할당된 상담사가 없습니다.';
    } else if (returnCode === -7777) {
        return 'CIDS가 작동중 인지 확인 하세요.에러사항에 대해서 관리자에게 문의 하세요.';
    } else if (returnCode === -7778) {
        return '발신할 채널이 할당이 되어 있지 않습니다.';
    } else if (returnCode === -8000) {
        return '캠페인이 상태 변경 중이므로, 캠페인을 시작할 수 없습니다.';
    } else if (returnCode === -8001) {
        return '무한콜백 캠페인에서만 발생. UserOption Data(limit)가 있다.';
    } else if (returnCode === -10001) {
        return '캠페인 데이터 저장공간이 남아 있지 않습니다. 관리자에게 문의 하세요.';
    }
    
    // 기본 에러 메시지 추가
    return `알 수 없는 오류가 발생했습니다. (코드: ${returnCode})`;
};