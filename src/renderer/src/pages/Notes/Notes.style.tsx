import styled from 'styled-components';

export const PageContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const ContentContainer = styled.div`
  display: flex;
  height: calc(100% - 80px);
  margin-top: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border.weak};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`;

export const SidebarContainer = styled.div`
  width: 280px;
  min-width: 280px;
  border-right: 1px solid ${({ theme }) => theme.colors.border.weak};
  display: flex;
  flex-direction: column;
`;

export const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.weak};
`;

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const TreeContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
  
  /* Style the antd tree */
  .ant-tree {
    background: transparent;
  }
  
  .ant-tree-treenode {
    padding: 4px 0;
  }
  
  .ant-tree-node-content-wrapper {
    padding: 0 4px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
  
  .ant-tree-node-selected {
    background-color: ${({ theme }) => `${theme.colors.accent.primary}20`} !important;
  }
`;

export const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
  
  > span {
    flex: 1;
  }
`;

export const ActionButton = styled.button`
  background: transparent;
  border: none;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-radius: 50%;
  opacity: 0.6;
  
  &:hover {
    opacity: 1;
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

export const EditorContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const EmptyEditor = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.background.secondary};
`;

export const EmptyEditorText = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-align: center;
`;

export const CreateNoteButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.accent.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-left: ${({ theme }) => theme.spacing.xs};
  
  &:hover {
    text-decoration: underline;
  }
`;

export const ErrorMessage = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => `${theme.colors.status.error}20`};
  color: ${({ theme }) => theme.colors.status.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
`;
