import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Select, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { rootActions } from '@renderer/store';
import { TaskFilter, TaskPriority, TaskStatus } from '@renderer/store/tasks/types';

interface TaskFilterBarProps {
  filters: TaskFilter;
  onFilterChange: (filters: TaskFilter) => void;
}

const TaskFilterBar: React.FC<TaskFilterBarProps> = ({ filters, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [selectedStatuses, setSelectedStatuses] = useState<TaskStatus[]>(filters.status || []);
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>(filters.priority || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);

  // Initialize from filters when component mounts
  useEffect(() => {
    setSearchTerm(filters.searchTerm || '');
    setSelectedStatuses(filters.status || []);
    setSelectedPriorities(filters.priority || []);
    setSelectedTags(filters.tags || []);
  }, [filters]);

  // Apply filters when search term changes with a small delay
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange({
        ...filters,
        searchTerm
      });
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, filters, onFilterChange]);

  // Apply filters when dropdowns change
  const handleStatusChange = (values: TaskStatus[]) => {
    setSelectedStatuses(values);
    onFilterChange({
      ...filters,
      status: values
    });
  };

  const handlePriorityChange = (values: TaskPriority[]) => {
    setSelectedPriorities(values);
    onFilterChange({
      ...filters,
      priority: values
    });
  };

  const handleTagChange = (values: string[]) => {
    setSelectedTags(values);
    onFilterChange({
      ...filters,
      tags: values
    });
  };

  return (
    <FilterBarContainer>
      <SearchContainer>
        <StyledInput
          prefix={<SearchOutlined />}
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
        />
      </SearchContainer>
      
      <FilterDropdowns>
        <FilterGroup>
          <FilterLabel>Status:</FilterLabel>
          <StyledSelect
            mode="multiple"
            placeholder="All statuses"
            value={selectedStatuses}
            onChange={handleStatusChange}
            options={[
              { value: TaskStatus.TODO, label: 'To Do' },
              { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
              { value: TaskStatus.REVIEW, label: 'Review' },
              { value: TaskStatus.BLOCKED, label: 'Blocked' },
              { value: TaskStatus.DONE, label: 'Done' }
            ]}
            maxTagCount={2}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Priority:</FilterLabel>
          <StyledSelect
            mode="multiple"
            placeholder="All priorities"
            value={selectedPriorities}
            onChange={handlePriorityChange}
            options={[
              { value: TaskPriority.LOW, label: 'Low' },
              { value: TaskPriority.MEDIUM, label: 'Medium' },
              { value: TaskPriority.HIGH, label: 'High' },
              { value: TaskPriority.URGENT, label: 'Urgent' }
            ]}
            maxTagCount={2}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Tags:</FilterLabel>
          <StyledSelect
            mode="tags"
            placeholder="All tags"
            value={selectedTags}
            onChange={handleTagChange}
            maxTagCount={2}
          />
        </FilterGroup>
      </FilterDropdowns>
    </FilterBarContainer>
  );
};

const FilterBarContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  min-width: 200px;
`;

const StyledInput = styled(Input)`
  width: 100%;

  input {
    height: 36px;
    background-color: ${({ theme }) => theme.colors.background.primary};
    border-color: ${({ theme }) => theme.colors.border.medium};
  }
`;

const FilterDropdowns = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 2;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 180px;
  flex: 1;
`;

const FilterLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`;

const StyledSelect = styled(Select)`
  flex: 1;
  min-width: 150px;
  .ant-select-selector {
    background-color: ${({ theme }) => theme.colors.background.primary} !important;
    border-color: ${({ theme }) => theme.colors.border.medium} !important;
    height: 36px !important;
  }
`;

export default TaskFilterBar;
