import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tree, Input, Button, Dropdown, Modal, message } from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  PlusOutlined,
  SearchOutlined,
  EllipsisOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';

import { RootState, RootDispatch, rootActions } from '@renderer/store';

import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import NoteEditor from '../../components/notes/NoteEditor';
import { TitleContainer, ActionButton, ActionButtons, ContentContainer, CreateNoteButton, EditorContainer, EmptyEditor, EmptyEditorText, ErrorMessage, PageContainer, SidebarContainer, SidebarHeader, TreeContainer } from './Notes.style';

const { DirectoryTree } = Tree;
const { Search } = Input;
const { confirm } = Modal;

const NotesPage: React.FC = () => {
  const dispatch = useDispatch<RootDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    folders,
    notes,
    currentNote,
    loadingFolders,
    error
  } = useSelector((state: RootState) => state.notes);

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [newFolderModalVisible, setNewFolderModalVisible] = useState(false);
  const [newNoteModalVisible, setNewNoteModalVisible] = useState(false);
  const [parentFolderId, setParentFolderId] = useState<number | null>(null);
  const [folderName, setFolderName] = useState('');
  const [noteName, setNoteName] = useState('');

  // Fetch folders and notes when component mounts
  useEffect(() => {
    if (user) {
      dispatch(rootActions.notesActions.fetchFolders(user.id));
      dispatch(rootActions.notesActions.fetchNotes(user.id));
    }
  }, [dispatch, user]);

  // Build tree data from folders and notes
  const buildTreeData = () => {
    const folderNodes = folders.map(folder => ({
      key: `folder-${folder.id}`,
      title: folder.name,
      icon: <FolderOutlined />,
      isLeaf: false,
      children: notes
        .filter(note => note.folderId === folder.id)
        .filter(note => searchTerm ? note.title.toLowerCase().includes(searchTerm.toLowerCase()) : true)
        .map(note => ({
          key: `note-${note.id}`,
          title: note.title,
          icon: <FileOutlined />,
          isLeaf: true,
        }))
    }));

    // Add root notes (notes without a folder)
    const rootNotes = notes
      .filter(note => !note.folderId)
      .filter(note => searchTerm ? note.title.toLowerCase().includes(searchTerm.toLowerCase()) : true)
      .map(note => ({
        key: `note-${note.id}`,
        title: note.title,
        icon: <FileOutlined />,
        isLeaf: true,
      }));

    return [...folderNodes, ...rootNotes];
  };

  // Handle tree selection
  const handleSelect = (selectedKeys: React.Key[], info: any) => {
    setSelectedKeys(selectedKeys);

    if (selectedKeys.length === 0) return;

    const key = selectedKeys[0] as string;

    if (key.startsWith('note-')) {
      const noteId = parseInt(key.replace('note-', ''));
      const note = notes.find(n => n.id === noteId);
      if (note) {
        dispatch(rootActions.notesActions.setCurrentNote(note));
      }
    } else {
      // If a folder is selected, deselect the current note
      dispatch(rootActions.notesActions.setCurrentNote(null));
    }
  };

  // Handle new folder creation
  const handleNewFolder = () => {
    setFolderName('');
    setParentFolderId(null);
    setNewFolderModalVisible(true);
  };

  // Handle new note creation
  const handleNewNote = (folderId: number | null = null) => {
    setNoteName('');
    setParentFolderId(folderId);
    setNewNoteModalVisible(true);
  };

  // Create folder
  const createNewFolder = async () => {
    if (!folderName.trim()) {
      message.error('Folder name cannot be empty');
      return;
    }

    try {
      await dispatch(rootActions.notesActions.createFolder({
        name: folderName,
        userId: user?.id || 0,
        parentId: parentFolderId
      })).unwrap();

      message.success('Folder created successfully');
      setNewFolderModalVisible(false);

      if (user) {
        dispatch(rootActions.notesActions.fetchFolders(user.id));
      }
    } catch (error) {
      message.error('Failed to create folder');
    }
  };

  // Create note
  const createNewNote = async () => {
    if (!noteName.trim()) {
      message.error('Note title cannot be empty');
      return;
    }

    try {
      await dispatch(rootActions.notesActions.createNote({
        title: noteName,
        content: '',
        userId: user?.id || 0,
        folderId: parentFolderId
      })).unwrap();

      message.success('Note created successfully');
      setNewNoteModalVisible(false);

      if (user) {
        dispatch(rootActions.notesActions.fetchNotes(user.id));
      }
    } catch (error) {
      message.error('Failed to create note');
    }
  };

  // Delete item (folder or note)
  const handleDelete = (key: string) => {
    const isFolder = key.startsWith('folder-');
    const id = parseInt(key.replace(isFolder ? 'folder-' : 'note-', ''));

    const title = isFolder ? 'Delete Folder' : 'Delete Note';
    const content = isFolder
      ? 'Are you sure you want to delete this folder? All notes inside will also be deleted.'
      : 'Are you sure you want to delete this note?';

    confirm({
      title,
      content,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          if (isFolder) {
            await dispatch(rootActions.notesActions.deleteFolder(id)).unwrap();
          } else {
            await dispatch(rootActions.notesActions.deleteNote(id)).unwrap();
            if (currentNote && currentNote.id === id) {
              dispatch(rootActions.notesActions.setCurrentNote(null));
            }
          }

          message.success(`${isFolder ? 'Folder' : 'Note'} deleted successfully`);

          if (user) {
            if (isFolder) {
              dispatch(rootActions.notesActions.fetchFolders(user.id));
            }
            dispatch(rootActions.notesActions.fetchNotes(user.id));
          }
        } catch (error) {
          message.error(`Failed to delete ${isFolder ? 'folder' : 'note'}`);
        }
      }
    });
  };

  // Rename item (folder or note)
  const handleRename = (key: string) => {
    const isFolder = key.startsWith('folder-');
    const id = parseInt(key.replace(isFolder ? 'folder-' : 'note-', ''));

    const item = isFolder
      ? folders.find(f => f.id === id)
      : notes.find(n => n.id === id);

    if (!item) return;

    Modal.confirm({
      title: `Rename ${isFolder ? 'Folder' : 'Note'}`,
      content: (
        <Input
          placeholder={`Enter new ${isFolder ? 'folder' : 'note'} name`}
          defaultValue={item.name || item.title}
          autoFocus
          onChange={(e) => {
            (Modal.confirm as any).update({
              okButtonProps: {
                disabled: !e.target.value.trim()
              }
            });
          }}
          onPressEnter={(e) => {
            const target = e.target as HTMLInputElement;
            if (target.value.trim()) {
              Modal.confirm.destroy();
              updateName(isFolder, id, target.value);
            }
          }}
        />
      ),
      onOk: (close) => {
        const input = document.querySelector('.ant-modal-content input') as HTMLInputElement;
        if (input && input.value.trim()) {
          updateName(isFolder, id, input.value);
        }
        close();
      }
    });
  };

  // Update name function
  const updateName = async (isFolder: boolean, id: number, newName: string) => {
    try {
      if (isFolder) {
        await dispatch(rootActions.notesActions.updateFolder({
          id,
          name: newName
        })).unwrap();
      } else {
        await dispatch(rootActions.notesActions.updateNote({
          id,
          title: newName
        })).unwrap();
      }

      message.success(`${isFolder ? 'Folder' : 'Note'} renamed successfully`);

      if (user) {
        if (isFolder) {
          dispatch(rootActions.notesActions.fetchFolders(user.id));
        }
        dispatch(rootActions.notesActions.fetchNotes(user.id));
      }
    } catch (error) {
      message.error(`Failed to rename ${isFolder ? 'folder' : 'note'}`);
    }
  };

  // Context menu for tree items
  const getContextMenu = (key: string) => {
    return [
      {
        key: 'rename',
        label: 'Rename',
        icon: <EditOutlined />,
        onClick: () => handleRename(key)
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDelete(key)
      }
    ];
  };

  // Custom title render to add context menu
  const titleRender = (nodeData: any) => {
    const key = nodeData.key as string;
    const isFolder = key.startsWith('folder-');

    return (
      <TitleContainer>
        <span>{nodeData.title}</span>
        <Dropdown
          menu={{
            items: getContextMenu(key),
            onClick: ({ domEvent }) => domEvent.stopPropagation()
          }}
          trigger={['click']}
        >
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <EllipsisOutlined />
          </ActionButton>
        </Dropdown>

        {isFolder && (
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              const folderId = parseInt(key.replace('folder-', ''));
              handleNewNote(folderId);
            }}
          >
            <PlusOutlined />
          </ActionButton>
        )}
      </TitleContainer>
    );
  };

  // Render content based on loading state
  const renderContent = () => {
    if (loadingFolders && !folders.length) {
      return <Loader text="Loading notes..." />;
    }

    if (error) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }

    if (!folders.length && !notes.length) {
      return (
        <EmptyState
          title="No notes found"
          description="Create your first note or folder to get started."
          actionLabel="Create Note"
          actionIcon={<PlusOutlined />}
          onAction={() => handleNewNote()}
        />
      );
    }

    return (
      <ContentContainer>
        <SidebarContainer>
          <SidebarHeader>
            <Search
              placeholder="Search notes..."
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
            <ActionButtons>
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={handleNewFolder}
                title="New Folder"
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleNewNote()}
              >
                New Note
              </Button>
            </ActionButtons>
          </SidebarHeader>

          <TreeContainer>
            <DirectoryTree
              showIcon
              defaultExpandAll
              expandedKeys={expandedKeys}
              onExpand={setExpandedKeys}
              selectedKeys={selectedKeys}
              onSelect={handleSelect}
              treeData={buildTreeData()}
              titleRender={titleRender}
            />
          </TreeContainer>
        </SidebarContainer>

        <EditorContainer>
          {currentNote ? (
            <NoteEditor
              note={currentNote}
              onChange={(content) => {
                dispatch(rootActions.notesActions.updateNote({
                  id: currentNote.id,
                  content
                }));
              }}
            />
          ) : (
            <EmptyEditor>
              <EmptyEditorText>
                Select a note to edit or
                <CreateNoteButton onClick={() => handleNewNote()}>
                  create a new note
                </CreateNoteButton>
              </EmptyEditorText>
            </EmptyEditor>
          )}
        </EditorContainer>
      </ContentContainer>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Notes"
        description="Organize your thoughts and ideas in one place"
      />

      {renderContent()}

      {/* New Folder Modal */}
      <Modal
        title="Create New Folder"
        open={newFolderModalVisible}
        onCancel={() => setNewFolderModalVisible(false)}
        onOk={createNewFolder}
        okButtonProps={{ disabled: !folderName.trim() }}
      >
        <Input
          placeholder="Enter folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          autoFocus
        />
      </Modal>

      {/* New Note Modal */}
      <Modal
        title="Create New Note"
        open={newNoteModalVisible}
        onCancel={() => setNewNoteModalVisible(false)}
        onOk={createNewNote}
        okButtonProps={{ disabled: !noteName.trim() }}
      >
        <Input
          placeholder="Enter note title"
          value={noteName}
          onChange={(e) => setNoteName(e.target.value)}
          autoFocus
        />
      </Modal>
    </PageContainer>
  );
};

export default NotesPage;
