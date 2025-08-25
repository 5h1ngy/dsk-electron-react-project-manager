import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  ArrowUpOutlined,
  ArrowDownOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Modal } from 'antd';
import { RootState } from '../../store';
import { updateTaskColumns } from '../../store/slices/tasksSlice';
import { Button, Input } from '../ui';

interface BoardColumnSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ColumnItem {
  id: string;
  name: string;
}

export const BoardColumnSettings: React.FC<BoardColumnSettingsProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const taskColumns = useSelector((state: RootState) => state.tasks.columns || []);
  
  const [columns, setColumns] = useState<ColumnItem[]>(() => {
    // Usa le colonne esistenti o crea quelle predefinite se non esistono
    if (taskColumns && taskColumns.length > 0) {
      return taskColumns.map(col => ({ id: col.id, name: col.title }));
    }
    
    return [
      { id: 'todo', name: 'Da fare' },
      { id: 'inProgress', name: 'In corso' },
      { id: 'review', name: 'In revisione' },
      { id: 'done', name: 'Completati' }
    ];
  });
  
  const [newColumnName, setNewColumnName] = useState('');
  
  // Genera un ID univoco per la nuova colonna
  const generateColumnId = (name: string) => {
    const baseId = name.toLowerCase().replace(/\s+/g, '_');
    const timestamp = Date.now().toString(36);
    return `${baseId}_${timestamp}`;
  };
  
  // Aggiungi una nuova colonna
  const handleAddColumn = () => {
    if (!newColumnName.trim()) return;
    
    const newColumn = {
      id: generateColumnId(newColumnName),
      name: newColumnName.trim()
    };
    
    setColumns([...columns, newColumn]);
    setNewColumnName('');
  };
  
  // Rimuovi una colonna
  const handleDeleteColumn = (index: number) => {
    if (columns.length <= 1) {
      // Deve esserci almeno una colonna
      return;
    }
    
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    setColumns(newColumns);
  };
  
  // Aggiorna il nome della colonna
  const handleUpdateColumnName = (index: number, newName: string) => {
    if (!newName.trim()) return;
    
    const newColumns = [...columns];
    newColumns[index].name = newName.trim();
    setColumns(newColumns);
  };
  
  // Sposta una colonna su o giù
  const handleMoveColumn = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= columns.length) return;
    
    const newColumns = [...columns];
    const [movedColumn] = newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, movedColumn);
    setColumns(newColumns);
  };
  
  // Salva le modifiche alle colonne
  const handleSaveColumns = () => {
    dispatch(updateTaskColumns(columns));
    onClose();
  };
  
  return (
    <Modal
      title="Gestione Colonne della Taskboard"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" variant="secondary" size="small" onClick={onClose}>
          <CloseOutlined /> Annulla
        </Button>,
        <Button 
          key="save" 
          variant="primary" 
          size="small" 
          onClick={handleSaveColumns}
        >
          <SaveOutlined /> Salva
        </Button>
      ]}
      width={500}
    >
      <SettingsContainer>
        <ColumnsList>
          {columns.map((column, index) => (
            <ColumnItem key={column.id}>
              <ColumnContent>
                <Input
                  value={column.name}
                  onChange={(e) => handleUpdateColumnName(index, e.target.value)}
                  size="small"
                  placeholder="Nome colonna"
                />
                <ActionButtons>
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => handleMoveColumn(index, index - 1)}
                    disabled={index === 0}
                    title="Sposta su"
                  >
                    <ArrowUpOutlined />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => handleMoveColumn(index, index + 1)}
                    disabled={index === columns.length - 1}
                    title="Sposta giù"
                  >
                    <ArrowDownOutlined />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="small"
                    onClick={() => handleDeleteColumn(index)}
                    disabled={columns.length <= 1}
                    title="Elimina colonna"
                  >
                    <DeleteOutlined />
                  </Button>
                </ActionButtons>
              </ColumnContent>
            </ColumnItem>
          ))}
        </ColumnsList>
        
        <AddColumnForm>
          <Input 
            placeholder="Nome nuova colonna"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            size="small"
          />
          <Button 
            variant="primary" 
            size="small"
            onClick={handleAddColumn}
            disabled={!newColumnName.trim()}
          >
            <PlusOutlined /> Aggiungi
          </Button>
        </AddColumnForm>
        
        <InfoText>
          Le modifiche non saranno salvate finché non clicchi "Salva".
          La rimozione di una colonna comporterà lo spostamento delle attività in essa contenute nella prima colonna disponibile.
        </InfoText>
      </SettingsContainer>
    </Modal>
  );
};

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const ColumnsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 300px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.xs} 0;
`;

const ColumnItem = styled.div`
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  padding: ${({ theme }) => theme.spacing.sm};
`;

const ColumnContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-left: auto;
`;

const AddColumnForm = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const InfoText = styled.p`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: ${({ theme }) => theme.spacing.sm} 0 0;
`;

export default BoardColumnSettings;
