import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import MDEditor from '@uiw/react-md-editor';
import { Button, Dropdown, Input, message } from 'antd';
import { 
  SaveOutlined, 
  DownloadOutlined, 
  EllipsisOutlined, 
  FullscreenOutlined,
  FullscreenExitOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { updateNote } from '../../store/slices/notesSlice';
import { formatDistanceToNow } from 'date-fns';

interface NoteEditorProps {
  note: {
    id: number;
    title: string;
    content: string;
    updatedAt?: string;
  };
  onChange: (content: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onChange }) => {
  const dispatch = useDispatch();
  const [content, setContent] = useState(note.content || '');
  const [isEditing, setIsEditing] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    note.updatedAt ? new Date(note.updatedAt) : null
  );
  
  // Reset content when note changes
  useEffect(() => {
    setContent(note.content || '');
    setTitle(note.title);
    setLastSaved(note.updatedAt ? new Date(note.updatedAt) : null);
  }, [note]);
  
  // Set up auto-save
  useEffect(() => {
    // Clear previous timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // Set up new timer for auto-save
    const timer = setTimeout(() => {
      saveNote();
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    setAutoSaveTimer(timer);
    
    // Clean up timer when component unmounts
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [content]);
  
  const saveNote = () => {
    // Only save if content changed
    if (content !== note.content) {
      onChange(content);
      setLastSaved(new Date());
    }
  };
  
  const handleContentChange = (value?: string) => {
    if (value !== undefined) {
      setContent(value);
    }
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    // Save before switching to preview mode
    if (isEditing) {
      saveNote();
    }
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const saveTitle = () => {
    if (title.trim() !== note.title) {
      dispatch(updateNote({
        id: note.id,
        title: title.trim()
      }));
      message.success('Title updated');
    }
    setIsTitleEditing(false);
  };
  
  const downloadMarkdown = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${title || 'note'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <EditorContainer isFullscreen={isFullscreen}>
      <EditorHeader>
        {isTitleEditing ? (
          <TitleEditContainer>
            <Input
              value={title}
              onChange={handleTitleChange}
              onBlur={saveTitle}
              onPressEnter={saveTitle}
              autoFocus
            />
            <Button 
              type="primary" 
              size="small" 
              onClick={saveTitle}
            >
              Save
            </Button>
          </TitleEditContainer>
        ) : (
          <NoteTitleContainer onClick={() => setIsTitleEditing(true)}>
            <NoteTitle>{title}</NoteTitle>
            <EditOutlined />
          </NoteTitleContainer>
        )}
        
        <EditorActions>
          {lastSaved && (
            <LastSaved>
              Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
            </LastSaved>
          )}
          
          <ActionButton
            onClick={toggleEditMode}
            title={isEditing ? 'Preview' : 'Edit'}
          >
            {isEditing ? <EyeOutlined /> : <EditOutlined />}
          </ActionButton>
          
          <ActionButton 
            onClick={saveNote} 
            title="Save"
          >
            <SaveOutlined />
          </ActionButton>
          
          <ActionButton 
            onClick={toggleFullscreen} 
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          </ActionButton>
          
          <Dropdown
            menu={{
              items: [
                {
                  key: 'download',
                  label: 'Download as Markdown',
                  icon: <DownloadOutlined />,
                  onClick: downloadMarkdown
                }
              ]
            }}
            trigger={['click']}
          >
            <ActionButton title="More Actions">
              <EllipsisOutlined />
            </ActionButton>
          </Dropdown>
        </EditorActions>
      </EditorHeader>
      
      <EditorContent>
        <StyledMDEditor
          value={content}
          onChange={handleContentChange}
          preview={isEditing ? 'live' : 'preview'}
          height={isFullscreen ? 'calc(100vh - 60px)' : '100%'}
          visibleDragbar={false}
        />
      </EditorContent>
    </EditorContainer>
  );
};

const EditorContainer = styled.div<{ isFullscreen: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  ${({ isFullscreen }) => isFullscreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background-color: ${({ theme }) => theme.colors.background.primary};
  `}
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.weak};
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const NoteTitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    
    svg {
      opacity: 1;
    }
  }
  
  svg {
    opacity: 0;
    transition: opacity 0.2s ease;
  }
`;

const NoteTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TitleEditContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  flex: 1;
  max-width: 500px;
`;

const EditorActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LastSaved = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-right: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

const EditorContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

const StyledMDEditor = styled(MDEditor)`
  height: 100% !important;
  
  .w-md-editor-toolbar {
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border-color: ${({ theme }) => theme.colors.border.weak};
  }
  
  .w-md-editor-content {
    background-color: ${({ theme }) => theme.colors.background.primary};
    height: calc(100% - 40px) !important;
  }
  
  .w-md-editor-text {
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  .wmde-markdown {
    background-color: ${({ theme }) => theme.colors.background.primary};
  }
`;

export default NoteEditor;
