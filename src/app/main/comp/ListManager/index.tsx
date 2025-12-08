import React, { useState, useMemo, useEffect } from "react";
import ExcelJS from 'exceljs';

// 공통 컴포넌트
import TitleWrap from "@/components/shared/TitleWrap";
import { Label } from "@/components/ui/label";
import { CustomInput } from "@/components/shared/CustomInput";
import { CustomCheckbox } from "@/components/shared/CustomCheckbox";
import CustomAlert,{CustomAlertRequest} from "@/components/shared/layout/CustomAlert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/CustomSelect";
import {
  CommonRadio,
  CommonRadioItem,
} from "@/components/shared/CommonRadio";
import SenderList from './SenderList';
import { useAuthStore, useMainStore, useTabStore } from '@/store';
import { CallingListInsertDataType
  , CallingListInsertRequest
} from '@/features/listManager/types/listManagerIndex';
import { useApiForCallingListInsert } from '@/features/listManager/hooks/useApiForCallingListInsert';
import { useApiForBlacklistInsert } from '@/features/listManager/hooks/useApiForBlacklistInsert';
import { useApiForBlacklistDelete } from '@/features/listManager/hooks/useApiForBlacklistDelete';

// 데이터그리드
import DataGrid, { Column, CellClickArgs } from "react-data-grid";

// 모달
import FileFormat,{FormatRowData, FormatRow, initData} from './FileFormat';
import LoadingModal from './LoadingModal';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import logoutFunction from "@/components/common/logoutFunction";
import { isNumber } from "lodash";


// 인터페이스
interface FileRow {
  id: number;
  fileName: string;
  campaignId: string;
  fileSize: string;
  deletable: string;
  listFlag: string;
  targetType: string;
}

interface SendRow {
  id: string;    
  fileId: number;
  CSKE: string;
  CSK2: string;
  CSK3: string;
  CSNA: string;
  TNO1: string;
  TNO2: string;
  TNO3: string;
  TNO4: string;
  TNO5: string;
  CSC1: string;
  CSC2: string;
  CSC3: string;
  CSC4: string;
  CSC5: string;
  CSC6: string;
  EMPLOYEEID: string;
  TKDA: string;
}

// 발신 리스트 추가 요청 데이터 타입
const callListInsertDataType: CallingListInsertDataType = {
  customer_key: '',
  sequence_number: 0,
  customer_name: '',
  phone_number1: '',
  phone_number2: '',
  phone_number3: '',
  phone_number4: '',
  phone_number5: '',
  reserved_time: '',
  token_data: ''
};

// 발신 리스트 추가 요청 
const callListInsertData: CallingListInsertRequest = {
  campaign_id: 0,
  list_flag: 'I',
  calling_list: [] as CallingListInsertDataType[]
};

const progressListData: ProgressRow =
  {
    id: 1,
    datetime: "10:54:28",
    message: "현재 작업을 진행하겠습니다. [ 1 ]",
  }
;

const errorMessage: CustomAlertRequest = {
  isOpen: false,
  message: '',
  title: '캠페인',
  type: '1',
  onClose: () => {},
  onCancel: () => {},
};

interface ProgressRow {
  id: number;
  datetime: string;
  message: string;
}

const ListManager: React.FC = () => {
  const router = useRouter();
  const { campaigns
    ,listManagerFileFormatRows,setListManagerFileFormatRows
    ,listManagerDelimiter,setListManagerDelimiter
    , listManagerCampaignId, setListManagerCampaignId
    , listManagerFileFormat, setListManagerFileFormat } = useMainStore();
  const { activeTabId, openedTabs } = useTabStore();
  const [_callListInsertData, setCallListInsertData] = useState<CallingListInsertRequest>(callListInsertData);
  const [deleteData, setDeleteData] = useState(true);  // 기존 캠페인 데이터 삭제.
  const [campaignIdDisabled,setCampaignIdDisabled] = useState<boolean>(false);
  const [alertState, setAlertState] = useState<CustomAlertRequest>(errorMessage);
  const [headerColumnData,setHeaderColumnData] = useState<FormatRow[]>([]);
  const [originaldataYn, setOriginaldataYn] = useState<boolean>(false);
  const [listFlag, setListFlag] = useState<string>('I');
  const [workFileIndex, setWorkFileIndex ] = useState<number>(-1);
  const [listTotalCount, setListTotalCount] = useState<number>(0);
  const [listSuccessCount,setListSuccessCount] = useState<number>(0);
  const [deleteDisableYn, setDeleteDisableYn] = useState<boolean>(false);
  const [workTargetDisableYn, setWorkTargetDisableYn ] = useState<boolean>(false);
  const [processMessage, setProcessMessage] = useState<string>(''); // 프로세스 메시지
  // 아이디 생성용 카운터
  const [nextId, setNextId] = useState(1);
  
  // 모달 상태
  const [isFileFormatOpen, setIsFileFormatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 파일 관련 상태
  const [targetType, setTargetType] = useState<"general" | "blacklist">("general");
  const [uploadedFiles, setUploadedFiles] = useState<FileRow[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  
  // 그리드 선택 상태
  const [selectedSendRow, setSelectedSendRow] = useState<SendRow | null>(null);
  const [selectedProgressRow, setSelectedProgressRow] = useState<ProgressRow | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileRow | null>(null);

  //캠페인 발신번호 추가 api 호출
  const { mutate: fetchCallingListInsert } = useApiForCallingListInsert({
    onSuccess: (data) => {   
      if( workFileIndex < uploadedFiles.length-1 ){
        setWorkFileIndex(prevIndex => prevIndex + 1);
        setListTotalCount(listTotalCount+data.request_count);
        setListSuccessCount(listSuccessCount+data.result_count);
      }else{
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        if( data.result_code === 0){
          const newProgressListData = { ...progressListData
            , id: progressList.length+1
            , datetime: hours + ':' + minutes + ':' + seconds
            , message: '서버에 리스트 파일 등록 완료: 총 ' + (listTotalCount+data.request_count) + '건, 성공 ' + (listSuccessCount+data.result_count) + '건'
          };
          setProgressList(prev => [newProgressListData, ...prev]);
        }else{
          const newProgressListData = { ...progressListData
            , id: progressList.length+1
            , datetime: hours + ':' + minutes + ':' + seconds
            , message: '서버에 리스트 파일 등록 오류 : ' + data.result_msg
          };
          setProgressList(prev => [newProgressListData, ...prev]);
        }
        setUploadedFiles([]);
        setSendList([]);
        setWorkFileIndex(-1);
      }
    }
    , onError: (data) => {  
      if (data.message.split('||')[0] === '5') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야 합니다.',
          type: '2',
          onClose: () => goLogin(),
        });
      } else {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const newProgressListData = { ...progressListData
          , id: progressList.length+1
          , datetime: hours + ':' + minutes + ':' + seconds
          , message: '파일 전송 중 오류 : ' + data.message
        };
        setProgressList(prev => [newProgressListData, ...prev]);
      } 
    }
  });
  const goLogin = () => {
    logoutFunction();
    router.push('/login');
  };
  
  // 블랙리스트 추가 api 호출
  const { mutate: fetchBlacklistInsert } = useApiForBlacklistInsert({
    onSuccess: (data) => {   
      if( workFileIndex < uploadedFiles.length-1 ){
        setWorkFileIndex(prevIndex => prevIndex + 1);
        setListTotalCount(listTotalCount+data.request_count);
        setListSuccessCount(listSuccessCount+data.result_count);
      }else{
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        if( data.result_code === 0){
          const newProgressListData = { ...progressListData
            , id: progressList.length+1
            , datetime: hours + ':' + minutes + ':' + seconds
            , message: '서버에 리스트 파일 등록 완료: 총 ' + (listTotalCount+data.request_count||1) + '건, 성공 ' + (listSuccessCount+data.result_code||1) + '건'
          };
          setProgressList(prev => [newProgressListData, ...prev]);
        }else{
          const newProgressListData = { ...progressListData
            , id: progressList.length+1
            , datetime: hours + ':' + minutes + ':' + seconds
            , message: '서버에 리스트 파일 등록 오류 : ' + data.result_msg
          };
          setProgressList(prev => [newProgressListData, ...prev]);
        }
        setUploadedFiles([]);
        setSendList([]);
        setWorkFileIndex(-1);
      }
    }
    , onError: (data) => {
      if (data.message.split('||')[0] === '5') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야 합니다.',
          type: '2',
          onClose: () => goLogin(),
        });
      } else {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const newProgressListData = { ...progressListData
          , id: progressList.length+1
          , datetime: hours + ':' + minutes + ':' + seconds
          , message: '파일 전송 중 오류 : ' + data.message
        };
        setProgressList(prev => [newProgressListData, ...prev]);
      }
    }
  });

  // 블랙리스트 업로드 취소 api 호출
  const { mutate: fetchBlacklistDelete } = useApiForBlacklistDelete({
    onSuccess: (data) => {   
      if( workFileIndex < uploadedFiles.length-1 ){
        setWorkFileIndex(prevIndex => prevIndex + 1);
      }else{
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        if( data.result_code === 0){
          const newProgressListData = { ...progressListData
            , id: progressList.length+1
            , datetime: hours + ':' + minutes + ':' + seconds
            , message: '서버에 리스트 파일 등록 완료'
          };
          setProgressList(prev => [newProgressListData, ...prev]);
        }else{
          const newProgressListData = { ...progressListData
            , id: progressList.length+1
            , datetime: hours + ':' + minutes + ':' + seconds
            , message: '서버에 리스트 파일 등록 오류 : ' + data.result_msg
          };
          setProgressList(prev => [newProgressListData, ...prev]);
        }
        setUploadedFiles([]);
        setSendList([]);
        setWorkFileIndex(-1);
      }
    }
    , onError: (data) => {    
      if (data.message.split('||')[0] === '5') {
        setAlertState({
          ...errorMessage,
          isOpen: true,
          message: 'API 연결 세션이 만료되었습니다. 로그인을 다시 하셔야 합니다.',
          type: '2',
          onClose: () => goLogin(),
        });
      } else {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const newProgressListData = { ...progressListData
          , id: progressList.length+1
          , datetime: hours + ':' + minutes + ':' + seconds
          , message: '파일 전송 중 오류 : ' + data.message
        };
        setProgressList(prev => [newProgressListData, ...prev]);
      }
    }
  });

  const [progressList, setProgressList] = useState<ProgressRow[]>([]);

  // 모달 핸들러
  const handleFileFormatOpen = () => {    
    // setUploadedFiles([]);
    // setSendList([]);
    setIsFileFormatOpen(true);
  } 
  const handleFileFormatClose = () => setIsFileFormatOpen(false);

  const [sendColumns, setSendColumns] = useState<Column<SendRow>[]>([]);
  const [sendList, setSendList] = useState<SendRow[]>([]);
  const [fileSendList, setFileSendList] = useState<SendRow[]>([]);
  
  //파일포맷설정 확인 이벤트.
  const handleFileFormatConfirm = (data:FormatRowData) => {
    setIsFileFormatOpen(false);
    setListManagerDelimiter(data.delimiter);
    setOriginaldataYn(data.originDataSaveYn);
    // setHeaderColumnData(data.datalist);
    setListManagerFileFormatRows(data.datalist);
    // const tempList: Column<SendRow>[] = data.datalist.map((tempData) => ({
    //   key: tempData.field,
    //   name: tempData.name
    // }));  
    // setSendColumns(tempList);
  };

  // 파일 관련 핸들러
  const handleTargetTypeChange = (value: string) => {
    setTargetType(value as "general" | "blacklist");
    const checkYn = campaigns.find(data=>data.campaign_id === _callListInsertData.campaign_id)?.start_flag === 4 
    || campaigns.find(data=>data.campaign_id === _callListInsertData.campaign_id)?.start_flag === 2;
    if( checkYn ){
      setListFlag('A');
      setCallListInsertData({
        ..._callListInsertData,
        list_flag: 'A'
      });
    }else{
      setListFlag('I');
      setCallListInsertData({
        ..._callListInsertData,
        list_flag: 'I'
      });
    }
  };
  
  const isNumber = (value: any): boolean => {
    if (value === null || value === '' || value === undefined) return false;
    return !isNaN(value) && !isNaN(parseFloat(value));
  }
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {   
    setCampaignIdDisabled(true);
    setWorkTargetDisableYn(true);
    setDeleteDisableYn(true);
    const files = e.target.files;
    if (files && files.length > 0) {
      try{
        // setIsLoading(true);
        const file = files[0];
        if( listManagerFileFormat === 'excel' && file.name.indexOf('.xls') === -1 ){              
          setAlertState({
            ...errorMessage,
            isOpen: true,
            message: "파일 포맷 형식과 다른 형식의 파일입니다. 파일 또는 포맷 형식을 확인해 주세요.",
            type: '2',
            onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
          });
        }else if( listManagerFileFormat === 'txt' && file.name.indexOf('.xls') > -1 ){    
          setAlertState({
            ...errorMessage,
            isOpen: true,
              message: "파일 또는 포맷 형식이 올바르지 않습니다. 작업 대상 지정을 다시 해 주십시오.",
            type: '2',
            onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
          });
        }else{          
          const newFileData: FileRow = {
            id: nextId,
            fileName: file.name,
            campaignId: listManagerCampaignId,
            fileSize: (file.size / 1024).toFixed(2) + " KB",
            deletable: 'Yes',
            listFlag: listFlag,
            targetType: targetType
          };
          setUploadedFiles((prev) => [...prev, newFileData]);
          setSelectedFileName(file.name);
          
          const now = new Date();
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          const newProgressListData = { ...progressListData
            , id: progressList.length+1
            , datetime: hours + ':' + minutes + ':' + seconds
            , message: '현재 로드된 파일 개수 : ' + (uploadedFiles.length+1)
          };
          setProgressList(prev => [newProgressListData, ...prev]);
          
          const reader = new FileReader();
          if( listManagerFileFormat === 'excel' && file.name.indexOf('.xls') > -1 ){
            reader.onload = async (event) => {
              const fileContent = event.target?.result;
              
              if (fileContent) {

                /*
                const workbook = XLSX.read(fileContent, { type: 'array' });
        
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
        
                const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); 
                */

                 // ExcelJS Workbook 생성
                const workbook = new ExcelJS.Workbook();

                // ArrayBuffer 로딩
                await workbook.xlsx.load(fileContent as ArrayBuffer);

                // 첫 번째 시트 가져오기
                const worksheet = workbook.worksheets[0];

                // Excel 데이터를 2차원 배열로 변환
                const data: any[][] = [];

                worksheet.eachRow((row, rowNumber) => {
                  // ExcelJS의 row.values는 1-based index이므로 0번째 요소 제거

                  const rowValuesRaw = row.values;
  
                  // row.values가 배열인지 확인 후 slice
                  if (Array.isArray(rowValuesRaw)) {
                    const rowValues = rowValuesRaw.slice(1); // 0번째 요소 제거
                    data.push(rowValues);
                  }
                });
                if( data.length > 0 ){
                  let index = 0;
                  const tempSendList: SendRow[] = [];
                  for(let i=1; i< data.length;i++){
                    const row = data[i] as unknown[];
                    index = index+1;

                    const tempData: SendRow = {
                      id: nextId+'::'+index,
                      fileId: nextId,
                      CSKE: '',
                      CSK2: '',
                      CSK3: '',
                      CSNA: '',
                      TNO1: '',
                      TNO2: '',
                      TNO3: '',
                      TNO4: '',
                      TNO5: '',
                      CSC1: '',
                      CSC2: '',
                      CSC3: '',
                      CSC4: '',
                      CSC5: '',
                      CSC6: '',
                      EMPLOYEEID: '',
                      TKDA: '',
                    };
                    if( row.length > 0){
                      let _length = row.length;
                      if( _length > sendColumns.length){
                        _length = sendColumns.length;
                      }
                      // for (let j = 0; j < _length; j++) {
                      //   const key = sendColumns[j].key as keyof SendRow;
                      //   if (key in tempData) {
                      //     if (typeof key === 'string' && key in tempData) {
                      //       if (typeof key === 'string' && key in tempData) {
                      //         (tempData as any)[key] = row[j] as string || '';
                      //       }
                      //     }
                      //   }
                      // }

                      for (let j = 0; j < _length; j++) {
                        const key = sendColumns[j].key as keyof SendRow;

                        // tempData에 key가 없으면 건너뛰기
                        if (!(key in tempData)) continue;

                        const value = row[j];

                        // CSKE 필드가 숫자가 아닐 경우 → 경고 후 중단
                        if (key === 'CSKE' && !isNumber(value)) {
                          //  업로드된 마지막 파일 삭제
                          setUploadedFiles((prev) => prev.slice(0, -1));                          
                          setAlertState({
                            ...errorMessage,
                            isOpen: true,
                            message: "파일 포맷 형식과 다른 형식의 파일입니다. 파일 또는 포맷 형식을 확인해 주세요.",
                            type: '2',
                            onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
                          });
                          return; // 함수 중단
                        }

                        // 정상적인 경우 데이터 세팅
                        (tempData as any)[key] = (value ?? '') as string;
                      }

                      tempSendList.push(tempData);
                    }
                    
                  }
                  setSendList(prev => [...prev, ...tempSendList]);
                }

              }

            };
            reader.readAsArrayBuffer(file);
          }else if( listManagerFileFormat === 'txt' && file.name.indexOf('.xls') == -1 ){
            reader.onload = (event) => {
              const fileContent = event.target?.result;       
              // console.log("File content:", fileContent);
              if( fileContent != null && fileContent !== '' ){
                let tempdata = [];
                if( (fileContent+'').indexOf('\r\n') > -1){
                  tempdata = (fileContent+'').split('\r\n');
                }else{
                  tempdata = (fileContent+'').split('\n');
                }
                let index = 0;
                let tempSendList: SendRow[] = [];
                for( let i=0;i<tempdata.length;i++){
                  // const row = tempdata[i].split(delimiter) as unknown[];
                  index = index+1;

                  const tempData: SendRow = {
                    id: nextId+'::'+index,
                    fileId: nextId,
                    CSKE: '',
                    CSK2: '',
                    CSK3: '',
                    CSNA: '',
                    TNO1: '',
                    TNO2: '',
                    TNO3: '',
                    TNO4: '',
                    TNO5: '',
                    CSC1: '',
                    CSC2: '',
                    CSC3: '',
                    CSC4: '',
                    CSC5: '',
                    CSC6: '',
                    EMPLOYEEID: '',
                    TKDA: '',
                  };
                  //길이체크인 경우 
                  if( listManagerDelimiter === '' ){
                    for(let k=0;k<headerColumnData.length;k++){
                      const key = headerColumnData[k].field as keyof SendRow;
                      // if (key in tempData) {
                      //   if (typeof key === 'string' && key in tempData) {
                      //     if (typeof key === 'string' && key in tempData) {
                      //       (tempData as any)[key] = tempdata[i].substring(headerColumnData[k].start-1, headerColumnData[k].start + headerColumnData[k].length -1) as string || '';
                      //     }
                      //   }
                      // }
                      if (key in tempData) {
                        // Calculate the byte length of the extracted substring
                        const extractedSubstring = tempdata[i].substring(headerColumnData[k].start - 1, headerColumnData[k].start + headerColumnData[k].length - 1);
                        
                        if (typeof key === 'string' && key in tempData) {
                          const byteLength = getByteLength(extractedSubstring);
                          
                          // Ensure that the extracted substring fits within the specified byte length
                          if (byteLength <= headerColumnData[k].length) {
                            (tempData as any)[key] = extractedSubstring || '';  // If it's within the byte size limit, assign it
                          } else {
                            // Handle case where the byte length exceeds the specified limit, truncating if necessary
                            (tempData as any)[key] = extractedSubstring.slice(0, headerColumnData[k].length);
                          }
                        }
                      }
                    }
                    tempSendList.push(tempData);                  
                    
                    //구분자인 경우
                  }else{ 
                    const row = tempdata[i].split(listManagerDelimiter) as unknown[];
                    if( tempdata[i].indexOf(listManagerDelimiter) === -1 ){    
                      setProcessMessage('파일 전송 중 오류: 리스트 파일을 확인하세요.');
                      setAlertState({
                        ...errorMessage,
                        isOpen: true,
                        message: "파일 또는 포맷 형식이 올바르지 않습니다. 작업 대상 지정을 다시 해 주십시오.",
                        type: '2',
                        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
                      });
                      tempSendList = [];
                      setUploadedFiles((prev) => prev.slice(0, -1));   
                      break;
                    }else if( tempdata[i].split(listManagerDelimiter).length != sendColumns.length ){
                      setProcessMessage('파일 전송 중 오류: 리스트 파일을 확인하세요.');
                      setAlertState({
                        ...errorMessage,
                        isOpen: true,
                        message: "파일 또는 포맷 형식이 올바르지 않습니다. 작업 대상 지정을 다시 해 주십시오.",
                        type: '2',
                        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
                      });
                      tempSendList = [];
                      setUploadedFiles((prev) => prev.slice(0, -1));
                      break;
                    }else if( row.length > 0){
                      let _length = row.length;
                      if( _length > sendColumns.length){
                        _length = sendColumns.length;
                      }
                      for (let j = 0; j < _length; j++) {
                        const key = sendColumns[j].key as keyof SendRow;
                        if (key in tempData) {
                          if (typeof key === 'string' && key in tempData) {
                            if (typeof key === 'string' && key in tempData) {
                              (tempData as any)[key] = row[j] as string || '';
                            }
                          }
                        }
                      }
                      tempSendList.push(tempData);
                    }
                  }
                }
                setSendList(prev => [...prev, ...tempSendList]);
              }
              // Now, you can process fileContent here
            };
            reader.readAsText(file);
          }else{          
            setAlertState({
              ...errorMessage,
              isOpen: true,
              message: "파일 포맷 형식과 다른 형식의 파일입니다. 파일 또는 포맷 형식을 확인해 주세요.",
              type: '2',
              onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
            });
          }
          
          // Handle file reading errors
          reader.onerror = (error) => {
            // console.error("Error reading file:", error);
          };
        }
      } catch (e) {
        // console.error("Error processing file:", e);
  
      }finally{
        setNextId(nextId + 1);
        setIsLoading(false);
      }
    }// 파일 업로드 후 input 값 초기화
    e.target.value = '';
  };
  
  const getByteLength = (str: string) => {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);
    return encoded.length;
  }
 
  // 새 작업대상 핸들러
  const handleNewTarget = () => {
    setSelectedFileName("");
    setTargetType("general");
    setSelectedFile(null);
    // setUploadedFiles([]);
    // setSendList([]);
    setCampaignIdDisabled(false);
  };

  // 엑셀다운로드 핸들러
  const handleExcelDownload = async () => {
    const data = [
      { 고객키: "1", 이름: "홍길동", 전화번호: "01031141714", 토큰: "연체고객1" },
      { 고객키: "2", 이름: "김철수", 전화번호: "0234584260", 토큰: "연체고객2" },
    ];

    // 워크북 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // 헤더 정의
    const headers = ["고객키(CSKE)", "고객이름(CSNA)", "고객전화번호(TNO1)", "토큰데이타(TKDA)"];
    worksheet.addRow(headers);

    // 데이터 추가
    data.forEach(item => {
      worksheet.addRow([item.고객키, item.이름, item.전화번호, item.토큰]);
    });

    // 모든 셀 텍스트 서식 적용 (maxRows, maxCols 설정)
    const maxRows = 10000;
    const maxCols = 20;

    for (let r = 1; r <= maxRows; r++) {
      for (let c = 1; c <= maxCols; c++) {
        const cell = worksheet.getCell(r, c);
        if (!cell.value) cell.value = '';
        cell.numFmt = '@'; // 텍스트 형식
      }
    }

    // 컬럼 너비 설정 (단위: 문자 수)
    const colWidths = [
      20, // 고객키
      20, // 고객이름
      20, // 전화번호
      20, // 토큰
    ];
    colWidths.forEach((wch, index) => {
      worksheet.getColumn(index + 1).width = wch;
    });

    // 엑셀 파일 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'ListManager_OBListTemplate.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // 메모리 해제
  };
  /*
  const handleExcelDownload = () => {
    const data = [
      { 고객키: "1", 이름: "홍길동", 전화번호: "01031141714", 토큰: "연체고객1" },
      { 고객키: "2", 이름: "김철수", 전화번호: "0234584260", 토큰: "연체고객2" },
    ];

    // 워크북 생성 및 시트 추가
    const workbook = XLSX.utils.book_new();

    // 헤더 정의
    const headers = ["고객키(CSKE)", "고객이름(CSNA)", "고객전화번호(TNO1)", "토큰데이타(TKDA)"];

    // 데이터 객체 배열을 2차원 배열로 변환 (헤더 아래에 값들)
    const rows = data.map(item => [String(item.고객키), String(item.이름), String(item.전화번호), String(item.토큰)]);

    // 시트 생성 (헤더 + 데이터)
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // 박소연 부장님 요청으로 모든 셀 텍스트로 서식 지정(늘리거나 줄이려면 maxRows, maxCols 값 수정) 2025.10.30 - lab09
    // 확장된 범위 설정 (10000행까지 미리 텍스트 서식 적용)
    const maxRows = 10000;
    const maxCols = 20; // 컬럼 개수 (고객키, 이름, 전화번호, 토큰) = 4, 임시로 20개  -> 동적으로 변경할건지?
    
    // 모든 셀에 텍스트 서식 적용 (데이터 영역 + 빈 영역)
    for (let R = 0; R < maxRows; ++R) {
      for (let C = 0; C < maxCols; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { t: 's', v: '' };
        }
        
        // 텍스트 서식 지정 (@는 텍스트 형식)
        worksheet[cellAddress].z = '@';
      }
    }
    
    // 워크시트 범위 재설정
    worksheet['!ref'] = `A1:${XLSX.utils.encode_col(maxCols - 1)}${maxRows}`;

    // 컬럼 너비 설정 (단위: 문자 수)
    worksheet['!cols'] = [
      { wch: 20 },  // 고객키
      { wch: 20 },  // 고객이름
      { wch: 20 },  // 전화번호
      { wch: 20 },  // 토큰
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 엑셀 파일 다운로드
    XLSX.writeFile(workbook, 'ListManager_OBListTemplate.xlsx');
  };
  */

  // txt다운로드 핸들러
  const handleTxtDownload = () => {
    const data = [
      { 고객키: "1", 이름: "홍길동", 전화번호: "01031141714", 토큰: "연체고객1" },
      { 고객키: "2", 이름: "김철수", 전화번호: "0234584260", 토큰: "연체고객2" },
    ];

    // 헤더와 데이터 구성 (쉼표 구분자 사용)
    const headers = ["고객키(CSKE)", "고객이름(CSNA)", "고객전화번호(TNO1)", "토큰데이타(TKDA)"];
    const rows = data.map(item => [item.고객키, item.이름, item.전화번호, item.토큰].join(","));

    // const textContent = [headers.join(","), ...rows].join("\n");
    const textContent = [...rows].join("\n");

    // Blob 생성
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });

    // 다운로드 링크 생성 및 실행
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ListManager_OBListTemplate.txt";
    document.body.appendChild(link);
    link.click();

    // 정리
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // 작업대상 올리기
  const triggerFileInput = () => {
    if( sendColumns.length === 0 ){
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "파일 포맷이 설정되어 있지 않습니다. 파일 포맷을 설정해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }else if( listManagerCampaignId === '0' ||  listManagerCampaignId === ''){
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "캠페인을 선택해야 합니다.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    }else{
      const fileInput = document.getElementById("fileInput") as HTMLInputElement;
      if (fileInput){
        if( listManagerFileFormat === 'excel'){
          fileInput.accept = ".xlsx, .xls";
        }else{
          fileInput.accept = ".txt";
        }
        fileInput.click();
      } 
    }
  };

  // 삭제 핸들러
  const handleDeleteFile = () => {
    if (selectedFile) {
      setUploadedFiles(prev => prev.filter(file => file.id !== selectedFile.id));
      setSendList(prev => prev.filter(data => data.fileId !== selectedFile.id));
      setSelectedFile(null);
      setSelectedFileName("");
      
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const newProgressListData = { ...progressListData
        , id: progressList.length+1
        , datetime: hours + ':' + minutes + ':' + seconds
        , message: '현재 로드된 파일 개수 : ' + (uploadedFiles.length-1)
      };
      setProgressList(prev => [newProgressListData, ...prev]);
      
    }
  };

  // 행 클릭 핸들러
  const handleProgressRowClick = ({ row }: CellClickArgs<ProgressRow>) => {
    setSelectedProgressRow(row);
  };

  const handleFileRowClick = ({ row }: CellClickArgs<FileRow>) => {
    setSelectedFile(row);
    setSelectedFileName(row.fileName);
    // setTargetType(row.campaignId.startsWith('G') ? 'general' : 'blacklist');
    setFileSendList(sendList.filter(data=>data.fileId === row.id));
  };

  // rowClass 함수들
  const getFileRowClass = (row: FileRow) => {
    return selectedFile?.id === row.id ? 'bg-[#FFFAEE]' : '';
  };
  
  const getProgressRowClass = (row: ProgressRow) => {
    return selectedProgressRow?.id === row.id ? 'bg-[#FFFAEE]' : '';
  };

  // 데이터그리드 컬럼 정의
  const columns = useMemo<Column<FileRow>[]>(() => [
    { key: "fileName", name: "파일 이름" },
    { key: "campaignId", name: "캠페인 아이디" },
    { key: "fileSize", name: "파일 크기" },
    {
      key: "deletable",
      name: "삭제 여부",
      formatter: ({ row }: { row: FileRow }) => (
        <CustomInput
          type="text"
          value={'Yes'}
        />
      ),
    },
  ], []);

  const progressColumns = useMemo<Column<ProgressRow>[]>(() => [
    { key: "datetime", name: "시간" },
    { key: "message", name: "처리 내용" },
  ], []);

  // selectedRows 메모이제이션
  const selectedFileRows = useMemo<Set<number>>(() => 
    selectedFile ? new Set([selectedFile.id]) : new Set()
  , [selectedFile]);

  const selectedSendRows = useMemo(() => 
    selectedSendRow ? new Set([selectedSendRow.id]) : new Set()
  , [selectedSendRow]);

  const selectedProgressRows = useMemo(() => 
    selectedProgressRow ? new Set([selectedProgressRow.id]) : new Set()
  , [selectedProgressRow]);

  // 작업시작 버튼 클릭 시
  const handleWorkStart = () => {
    setListTotalCount(0);
    setListSuccessCount(0);
    if( targetType === 'blacklist' && listFlag === 'L' && _callListInsertData.campaign_id > 0 ){      
      const callingListInsertData: CallingListInsertRequest = {
        ..._callListInsertData
        , campaign_id: _callListInsertData.campaign_id
        , list_flag: 'L'
      };
      fetchBlacklistInsert(callingListInsertData);
    }else if (uploadedFiles.length === 0) {
      // 작업대상이 선택되지 않은 경우 경고 알림창 표시
      // showAlert('작업 지정 대상을 선택해주세요.');
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "발신 목록이 없습니다.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    } else if ( _callListInsertData.campaign_id === 0) {
      setAlertState({
        ...errorMessage,
        isOpen: true,
        message: "대상 캠페인을 선택해 주세요.",
        type: '2',
        onClose: () => setAlertState((prev) => ({ ...prev, isOpen: false }))
      });
    } else {
      // 작업대상이 선택된 경우 로딩 창 표시
      //setIsLoading(true);
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const newProgressListData = { ...progressListData
        , id: progressList.length+1
        , datetime: hours + ':' + minutes + ':' + seconds
        , message: '서버에 리스트 파일 등록 시작'
      };
      setProgressList(prev => [newProgressListData, ...prev]);

      setWorkFileIndex(0);

    }
  };

  //select data change
  const handleSelectChange = (value: string, type: string) => {
    if( type === 'campaignId' ){
      setListManagerCampaignId(value);
      const checkYn = campaigns.find(data=>data.campaign_id === Number(value))?.start_flag === 4 
      || campaigns.find(data=>data.campaign_id === Number(value))?.start_flag === 2;
      if( checkYn ){
        setListFlag('A');
      }else{
        setListFlag('I');
      }
      if( !workTargetDisableYn ){
        setDeleteDisableYn(checkYn);
      }
      setCallListInsertData({
        ..._callListInsertData,
        campaign_id: Number(value)
      });
    }  
    if( type === 'listFlag'){
      setListFlag(value);
      setCallListInsertData({
        ..._callListInsertData,
        list_flag: value
      });
    }
  }

  //checkbox checked change
  const handleCheckbox = (checked:boolean, type:string) => {
    if( type === 'deleteData' ){  //체크 I 안하면 A
      setDeleteData(checked);
      if( checked ){
        setListFlag('I');
        setCallListInsertData({
          ..._callListInsertData,
          list_flag: 'I'
        });
      }else{
        setListFlag('A');
        setCallListInsertData({
          ..._callListInsertData,
          list_flag: 'A'
        });
      }
    }  
  }

  useEffect(() => {
    if ( sendList.length > 0 ) {
      const fileIndexRow = uploadedFiles[uploadedFiles.length-1];
      setSelectedFile(fileIndexRow);
      setSelectedFileName(fileIndexRow.fileName);

      setFileSendList(sendList.filter(data=>data.fileId === fileIndexRow.id));
    }else{
      setFileSendList([]);
    }
  }, [sendList]);
   
  useEffect(() => {
    if (activeTabId === 7 && campaigns.length > 0) {
      // setListManagerFileFormatRows([]);
      const tempData = openedTabs.filter(tab => tab.id === 7);
      if( tempData.length > 0 && tempData[0].campaignId && tempData[0].campaignName) {
        const _campaignId = Number(tempData[0].campaignId);
        setListManagerCampaignId(_campaignId+'');
        const checkYn = campaigns.find(data=>data.campaign_id === _campaignId)?.start_flag === 4 
        || campaigns.find(data=>data.campaign_id === _campaignId)?.start_flag === 2;
        if( checkYn ){
          setListFlag('A');
        }else{
          setListFlag('I');
        }
        if( !workTargetDisableYn ){
          setDeleteDisableYn(checkYn);
        }
        setCallListInsertData({
          ..._callListInsertData,
          campaign_id: _campaignId
        });
        setCampaignIdDisabled(true);
      }else{
        setListManagerCampaignId('0');
        setCallListInsertData({
          ..._callListInsertData,
          campaign_id: 0
        });
        setCampaignIdDisabled(false);
      }
    }
  }, [activeTabId, openedTabs, campaigns]);
   
  useEffect(() => {
    if (workFileIndex > -1) {
      
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 0~11이므로 +1
      const date = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const formatted = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

      const newProgressListData = { ...progressListData
        , id: progressList.length+1
        , datetime: hours + ':' + minutes + ':' + seconds
        , message: (workFileIndex+1)+'번 파일 리스트 등록 시작'
      };
      setProgressList(prev => [newProgressListData, ...prev]);

      const dataList:CallingListInsertDataType[] = [];
      let sequenceIndex = 1;
      for( let j=0;j<sendList.length;j++){
        if( uploadedFiles[workFileIndex].id === sendList[j].fileId ){
          dataList.push({
            customer_key: sendList[j].CSKE+''
            , sequence_number: sequenceIndex++,
            customer_name: sendList[j].CSNA+'',
            phone_number1: sendList[j].TNO1+'',
            phone_number2: sendList[j].TNO2+'',
            phone_number3: sendList[j].TNO3+'',
            phone_number4: sendList[j].TNO4+'',
            phone_number5: sendList[j].TNO5+'',
            reserved_time: '',
            token_data: sendList[j].TKDA+''
          });
        }
      }
      const callingListInsertData: CallingListInsertRequest = {
        ..._callListInsertData
        , campaign_id: Number(uploadedFiles[workFileIndex].campaignId)
        , list_flag: uploadedFiles[workFileIndex].listFlag+''
        , calling_list: dataList
      };

      if( uploadedFiles[workFileIndex].listFlag === 'T'){
        fetchBlacklistDelete(Number(uploadedFiles[workFileIndex].campaignId));
      }else if( uploadedFiles[workFileIndex].targetType === 'general' ){
        fetchCallingListInsert(callingListInsertData);
      }else{
        fetchBlacklistInsert(callingListInsertData);
      }
    }
  }, [workFileIndex]);

  useEffect(() => {
    if( listManagerFileFormat === ''){
      setListManagerFileFormat('excel');
    }
  }, [listManagerFileFormat]);
   
  useEffect(() => {
    if ( listManagerFileFormatRows.length === 0 ) {
      setListManagerFileFormatRows(initData);
      setListManagerDelimiter(',');
      setSendColumns([]);
    }else if ( listManagerFileFormatRows.length > 0 ) {
      setHeaderColumnData(listManagerFileFormatRows);
      const tempList: Column<SendRow>[] = listManagerFileFormatRows.map((tempData) => ({
        key: tempData.field,
        name: tempData.name
      }));  
      setSendColumns(tempList);
    }
  }, [listManagerFileFormatRows]); 
   
  useEffect(() => {
    if( processMessage !== ''){
      setProcessMessage('');
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const newProgressListData = { ...progressListData
        , id: progressList.length+1
        , datetime: hours + ':' + minutes + ':' + seconds
        , message: processMessage
      };       
      setProgressList(prev => [newProgressListData, ...prev]);
    }
  }, [processMessage]);
   
  return (
    <div className="flex flex-col gap-5 limit-width">
      <div className="flex gap-5">
        {/* 작업대상목록 */}
        <div className="w-1/2 flex-1 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <TitleWrap
              title="작업 대상 목록"
              className="border-b border-gray-300 pb-1"
              buttons={[
                { label: "파일 포맷 설정", onClick: handleFileFormatOpen },
                { label: "작업 시작" , onClick: handleWorkStart},
              ]}
            />
            <div className="h-[200px] grid-custom-wrap">
              <div className="grid-top-subject h-[26px]">
                Loading File(s)
              </div>
              <DataGrid<FileRow>
                columns={columns}
                rows={uploadedFiles}
                className="grid-custom cursor-pointer h-custom-important"
                rowHeight={30}
                headerRowHeight={30}
                rowClass={getFileRowClass}
                rowKeyGetter={(row) => row.id}
                onCellClick={handleFileRowClick}
                selectedRows={selectedFileRows}
              />
            </div>
          </div>
        </div>

        {/* 작업대상 내역 */}
        <div className="w-1/2 flex-1 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <TitleWrap
              title="작업 대상 내역" // 이 부분은 이미 정상이나, 일관성을 위해 명시
              className="border-b border-gray-300 pb-1"
              buttons={[
                { label: "xls 다운로드", onClick: handleExcelDownload },
                { label: "txt 다운로드", onClick: handleTxtDownload },
                { label: "새 작업대상", onClick: handleNewTarget},
                { label: "작업 대상 올리기", onClick: triggerFileInput },
                { label: "작업 대상 삭제" ,  onClick: handleDeleteFile, disabled: !selectedFile},
              ]}
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Label className="w-[100px] min-w-[100px]">대상 캠페인</Label>
                <Select value={listManagerCampaignId} 
                onValueChange={(value) => handleSelectChange(value, 'campaignId')}
                defaultValue="0" disabled={campaignIdDisabled}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="대상 캠페인" />
                  </SelectTrigger>
                  <SelectContent  style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <SelectItem key='0' value='0'>- 선택 -</SelectItem>
                    {campaigns.map(option => (
                      <SelectItem key={option.campaign_id} value={option.campaign_id.toString()}>
                        [{option.campaign_id}]{option.campaign_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CustomInput
                  className="w-full"
                  value={selectedFileName}
                  disabled
                />
              </div>
              <div className="flex items-center gap-1 h-[26px]">
                <Label className="w-[100px] min-w-[100px]">파일 형식</Label>
                <CommonRadio
                  defaultValue="auto"
                  className="flex gap-8"
                  value={listManagerFileFormat}
                  onValueChange={(value) => setListManagerFileFormat(value)}
                >
                  <div className="flex items-center space-x-2">
                    <CommonRadioItem value="excel" id="excel" />
                    <Label htmlFor="excel">EXCEL</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CommonRadioItem value="txt" id="txt" />
                    <Label htmlFor="txt">TXT</Label>
                  </div>
                </CommonRadio>
              </div>
              <div className="flex items-center gap-1 h-[26px]">
                <Label className="w-[100px] min-w-[100px]">작업 대상 구분</Label>
                <CommonRadio
                  defaultValue="general"
                  className="flex gap-8 w-[200px] min-w-[200px]"
                  onValueChange={handleTargetTypeChange}
                  disabled={workTargetDisableYn}
                >
                  <div className="flex items-center space-x-2">
                    <CommonRadioItem value="general" id="general" />
                    <Label htmlFor="general">일반</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CommonRadioItem value="blacklist" id="blacklist" />
                    <Label htmlFor="blacklist">블랙리스트</Label>
                  </div>
                </CommonRadio>

                {targetType === "general" ? (
                  <div className="flex gap-2">
                    <CustomCheckbox id="deleteData" checked={deleteData}
                      onCheckedChange={(checked) => handleCheckbox(checked === true, 'deleteData')} 
                      disabled={deleteDisableYn}/>
                    <Label htmlFor="deleteData" className="text-sm">
                      기존 캠페인 데이터 삭제
                    </Label>
                  </div>
                ) : (
                  <Select value={_callListInsertData.list_flag} 
                  onValueChange={(value) => handleSelectChange(value, 'listFlag')}
                  defaultValue="I"
                  disabled={workTargetDisableYn}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Insert: 기존 리스트 삭제 후 등록" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">Insert : 기존 리스트 삭제 후 등록</SelectItem>
                      <SelectItem value="D">Delete : 특정 리스트 삭제</SelectItem>
                      <SelectItem value="A">Append : 발신 리스트 추가</SelectItem>
                      <SelectItem value="L">블랙리스트 전체 삭제</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        <SenderList headerData={sendColumns} _sendList={fileSendList} totalCount={sendList.length} />
        <div className="w-1/2">
          <div className="h-[300px] grid-custom-wrap mt-[28px]">
            <div className="grid-top-subject h-[26px]">
              Progress Status
            </div>
            <DataGrid<ProgressRow>
              columns={progressColumns}
              rows={progressList}
              className="grid-custom cursor-pointer h-custom-important"
              rowHeight={30}
              headerRowHeight={30}
              rowKeyGetter={(row) => row.id}
              rowClass={getProgressRowClass}
              onCellClick={handleProgressRowClick}
              selectedRows={selectedProgressRow ? new Set([selectedProgressRow.id]) : new Set()}
            />
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        id="fileInput"
        className="hidden"
        onChange={handleFileUpload}
      />

       {/* 파일포맷모달 */}
       <FileFormat 
        isOpen={isFileFormatOpen}
        _formatRows={listManagerFileFormatRows}
        _listManagerDelimiter={listManagerDelimiter}
        onConfirm={handleFileFormatConfirm}
        onClose={handleFileFormatClose}
      />

      {/* 얼럿 창 */}
      <CustomAlert
        message={alertState.message}
        title={alertState.title}
        type={alertState.type}
        isOpen={alertState.isOpen}
        onClose={() => {
          alertState.onClose()
        }}
        onCancel={() => setAlertState((prev) => ({ ...prev, isOpen: false }))}/>
      
      {/* 로딩 모달 */}
       <LoadingModal 
       isLoading={isLoading} 
       onClose={() => setIsLoading(false)} 
       totalCount={100} 
       completedCount={50} 
       outboundProgress={75} 
       />
    </div>
  );
};

export default ListManager;