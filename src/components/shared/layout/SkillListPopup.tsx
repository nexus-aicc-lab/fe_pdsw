import React, { useEffect, useState} from 'react';
import { useCampainManagerStore, useMainStore } from '@/store';
import CustomAlert from '@/components/shared/layout/CustomAlert';
import DataGrid, { SelectColumn } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

interface Skill {
    skill_id: number;
    skill_name: string;
    tenant_id: number;
}

export interface SkillListPopupProps {
    param: number[];
    tenantId: number;
    isOpen?: boolean;
    type: string;
    onConfirm: (param: string) => void;
    onCancel?: () => void;
}

const SkillListPopup = ({ 
    param, 
    tenantId,
    type, 
    isOpen = true,
    onConfirm,
    onCancel
}: SkillListPopupProps) => {
    const { skills } = useCampainManagerStore();
    // tenantName 가져와야 되는데 store 는?
    const { tenants } = useMainStore();

    const [selectedSkills, setSelectedSkills] = useState<Set<number>>(new Set(param));
    const [ rows, setRows ] = useState<Skill[]>([]);
    useEffect(() => {
        if(param !== null){
            setSelectedSkills(new Set(param));
        }
    }, [param]);
    

    useEffect(() => {
      if(tenantId !== null){
        // skill_id가 0인 항목 제외
        setRows( skills.filter((skill) => 
            skill.tenant_id === tenantId && skill.skill_id !== 0
        ));
      }
    }, [tenantId, skills]);
    // tenantId와 skills의 의존성 추가
    
    const handleConfirm = () => {
        onConfirm(Array.from(selectedSkills).sort().join(','));
    };

    const handleSelectedRowsChange = (newSelection: Set<number>) => {
        // 혹시 모를 0값이 포함되는 것을 방지
        const filteredSelection = new Set(
            Array.from(newSelection).filter(id => id !== 0)
        );
        setSelectedSkills(filteredSelection);
    };

    const columns = [
        SelectColumn,
        {
            key: 'skill_id',
            name: '아이디',
            frozen: true,
            width: 157,
            minWidth: 100
        },
        {
            key: 'skill_name',
            name: '이름',
            frozen: true,
            width: 280,
            minWidth: 100
        }
    ];

    const rowClass = (row: Skill) => {
        return selectedSkills.has(row.skill_id) ? 'selected-row' : '';
    };
    
    const tenantName =
    tenants.find((tenant) => tenant.tenant_id === tenantId)?.tenant_name ?? `ID ${tenantId}`;  

    const gridContent = (
        <div className="grid-custom-wrap w-full">
          {rows.length === 0 ? (
            <div className="text-center py-4 text-sm text-gray-500">
             해당 테넌트에 부여된 스킬이 없습니다
            </div>
          ) : (
            <DataGrid
              columns={columns}
              rows={rows}
              className="grid-custom w-full"
              rowKeyGetter={(row) => row.skill_id}
              selectedRows={selectedSkills}
              onSelectedRowsChange={handleSelectedRowsChange}
              rowClass={rowClass}
              rowHeight={36}
            />
          )}
        </div>
      );
      

    return (
        <CustomAlert
            isOpen={isOpen}
            title="캠페인 스킬 선택"
            message={gridContent}
            onClose={handleConfirm}
            onCancel={onCancel}
            type={type}
            width={'max-w-[510px]'}
        />
    );
};

export default SkillListPopup;