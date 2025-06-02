import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared/CustomSelect";

interface TimePickerProps {
  value: string;
  onChange: (newValue: string) => void;
}

const TimePickerComponent: React.FC<TimePickerProps> = ({ value, onChange }) => {
  // 시간을 시, 분으로 분리
  const parseTimeValue = (timeString: string): { hour: string; minute: string } => {
    // 빈 값이거나 유효하지 않은 형식이면 기본값 사용
    if (!timeString || timeString === "9999" || timeString.length !== 4) {
      return { hour: "00", minute: "00" };
    }
    return {
      hour: timeString.slice(0, 2),
      minute: timeString.slice(2, 4)
    };
  };

  const { hour, minute } = parseTimeValue(typeof value === 'string' ? value : '');

  // 시간이나 분이 변경될 때 전체 값 업데이트
  const handleTimeChange = (type: string, newValue: string) => {
    const currentTime = parseTimeValue(value);
    const updatedTime = {
      ...currentTime,
      [type]: newValue
    };
    onChange(`${updatedTime.hour}${updatedTime.minute}`);
  };

  // 시간(0-23)과 분(0-59) 옵션 생성
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );
  
  const minutes = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  return (
    <div className="flex items-center gap-2">
      <Select
        value={hour}
        onValueChange={(newHour) => handleTimeChange("hour", newHour)}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="시" />
        </SelectTrigger>
        <SelectContent style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {hours.map((h) => (
            <SelectItem key={`hour-${h}`} value={h}>{h}시</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <span className="mx-1">:</span>
      
      <Select
        value={minute}
        onValueChange={(newMinute) => handleTimeChange("minute", newMinute)}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="분" />
        </SelectTrigger>
        <SelectContent style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {minutes.map((m) => (
            <SelectItem key={`minute-${m}`} value={m}>{m}분</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimePickerComponent;