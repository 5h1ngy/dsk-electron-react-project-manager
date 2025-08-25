import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Tag } from '../../store/slices/projectsSlice';
import { TagOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';

interface TagSelectorProps {
  selectedTags: number[];
  onChange: (selectedTagIds: number[]) => void;
  maxVisible?: number;
}

const TagSelector: React.FC<TagSelectorProps> = ({ 
  selectedTags,
  onChange,
  maxVisible = 10
}) => {
  // In a real app, we would have a dedicated slice for tags
  // For now, we'll extract tags from projects
  const { projects } = useSelector((state: RootState) => state.projects);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Extract unique tags from projects
  useEffect(() => {
    const tagMap = new Map<number, Tag>();
    
    projects.forEach(project => {
      project.tags.forEach(tag => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });
    
    setTags(Array.from(tagMap.values()));
  }, [projects]);
  
  const handleTagClick = (tagId: number) => {
    const isSelected = selectedTags.includes(tagId);
    
    if (isSelected) {
      onChange(selectedTags.filter(id => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };
  
  const visibleTags = isExpanded ? tags : tags.slice(0, maxVisible);
  const hasMoreTags = tags.length > maxVisible;
  
  return (
    <TagsContainer>
      {visibleTags.length === 0 ? (
        <NoTagsMessage>No tags available</NoTagsMessage>
      ) : (
        <>
          {visibleTags.map(tag => (
            <TagChip
              key={tag.id}
              selected={selectedTags.includes(tag.id)}
              color={tag.color}
              onClick={() => handleTagClick(tag.id)}
            >
              <TagOutlined />
              <TagName>{tag.name}</TagName>
              {selectedTags.includes(tag.id) && (
                <CloseIcon>
                  <CloseOutlined />
                </CloseIcon>
              )}
            </TagChip>
          ))}
          
          {hasMoreTags && (
            <ExpandButton onClick={() => setIsExpanded(!isExpanded)}>
              <PlusOutlined />
              {isExpanded ? 'Show Less' : `${tags.length - maxVisible} More`}
            </ExpandButton>
          )}
        </>
      )}
    </TagsContainer>
  );
};

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NoTagsMessage = styled.div`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-style: italic;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const TagChip = styled.div<{ selected: boolean; color: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0 ${({ theme }) => theme.spacing.sm};
  height: 28px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: ${({ selected, color, theme }) => 
    selected ? `${color}30` : theme.colors.background.tertiary};
  border: 1px solid ${({ selected, color, theme }) => 
    selected ? color : theme.colors.border.light};
  color: ${({ selected, color, theme }) => 
    selected ? color : theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  user-select: none;
  
  &:hover {
    background-color: ${({ color }) => `${color}20`};
    border-color: ${({ color }) => color};
    color: ${({ color }) => color};
  }
`;

const TagName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  white-space: nowrap;
`;

const CloseIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  margin-left: ${({ theme }) => theme.spacing.xs};
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: 0 ${({ theme }) => theme.spacing.sm};
  height: 28px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.border.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.fast};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
    border-color: ${({ theme }) => theme.colors.accent.primary};
    color: ${({ theme }) => theme.colors.accent.primary};
  }
`;

export default TagSelector;
