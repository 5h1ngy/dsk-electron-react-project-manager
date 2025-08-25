import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Select, Card, Row, Col, DatePicker, Empty, Spin } from 'antd';
import { 
  BarChartOutlined, 
  PieChartOutlined, 
  LineChartOutlined, 
  CalendarOutlined 
} from '@ant-design/icons';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { RootState, AppDispatch } from '../../store';
import { fetchProjects } from '../../store/slices/projectsSlice';
import { fetchTasks, TaskStatus, TaskPriority } from '../../store/slices/tasksSlice';
import PageHeader from '../../components/common/PageHeader';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const { RangePicker } = DatePicker;

const StatisticsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { projects, loading: projectsLoading } = useSelector((state: RootState) => state.projects);
  const { tasks, loading: tasksLoading } = useSelector((state: RootState) => state.tasks);
  
  const [selectedProject, setSelectedProject] = useState<number | 'all'>('all');
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    startOfMonth(subMonths(new Date(), 3)),
    endOfMonth(new Date())
  ]);
  
  // Load data when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchProjects(user.id));
      
      // Fetch tasks for all projects if 'all' is selected
      if (selectedProject === 'all') {
        // We'll need to fetch tasks for each project
        projects.forEach(project => {
          dispatch(fetchTasks(project.id));
        });
      } else if (typeof selectedProject === 'number') {
        // Fetch tasks for the selected project
        dispatch(fetchTasks(selectedProject));
      }
    }
  }, [dispatch, user, selectedProject, projects.length]);
  
  // Filter tasks based on selected project and date range
  const getFilteredTasks = () => {
    if (!tasks.length) return [];
    
    return tasks.filter(task => {
      // Filter by project
      if (selectedProject !== 'all' && task.projectId !== selectedProject) {
        return false;
      }
      
      // Filter by date range
      if (task.createdAt) {
        const taskDate = new Date(task.createdAt);
        return taskDate >= dateRange[0] && taskDate <= dateRange[1];
      }
      
      return true;
    });
  };
  
  // Calculate task statistics
  const filteredTasks = getFilteredTasks();
  
  // Tasks by status data for pie chart
  const tasksByStatusData = {
    labels: ['To Do', 'In Progress', 'Review', 'Blocked', 'Done'],
    datasets: [
      {
        data: [
          filteredTasks.filter(t => t.status === TaskStatus.TODO).length,
          filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
          filteredTasks.filter(t => t.status === TaskStatus.REVIEW).length,
          filteredTasks.filter(t => t.status === TaskStatus.BLOCKED).length,
          filteredTasks.filter(t => t.status === TaskStatus.DONE).length,
        ],
        backgroundColor: [
          '#1890ff', // Blue for TODO
          '#faad14', // Yellow for IN_PROGRESS
          '#722ed1', // Purple for REVIEW
          '#ff4d4f', // Red for BLOCKED
          '#52c41a', // Green for DONE
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Tasks by priority data for bar chart
  const tasksByPriorityData = {
    labels: ['Low', 'Medium', 'High', 'Urgent'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [
          filteredTasks.filter(t => t.priority === TaskPriority.LOW).length,
          filteredTasks.filter(t => t.priority === TaskPriority.MEDIUM).length,
          filteredTasks.filter(t => t.priority === TaskPriority.HIGH).length,
          filteredTasks.filter(t => t.priority === TaskPriority.URGENT).length,
        ],
        backgroundColor: [
          'rgba(84, 214, 44, 0.6)', // Green for LOW
          'rgba(250, 173, 20, 0.6)', // Yellow for MEDIUM
          'rgba(255, 171, 0, 0.6)',  // Orange for HIGH
          'rgba(255, 77, 79, 0.6)',  // Red for URGENT
        ],
        borderColor: [
          'rgb(84, 214, 44)',
          'rgb(250, 173, 20)',
          'rgb(255, 171, 0)',
          'rgb(255, 77, 79)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Tasks completion trend data for line chart
  const getTaskCompletionTrendData = () => {
    // Create an array of months within the date range
    const months = [];
    let currentDate = new Date(dateRange[0]);
    
    while (currentDate <= dateRange[1]) {
      months.push(format(currentDate, 'MMM yyyy'));
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    
    // Count completed tasks for each month
    const completedTasksByMonth = months.map(month => {
      const [monthName, yearStr] = month.split(' ');
      const year = parseInt(yearStr);
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthName);
      
      return filteredTasks.filter(task => {
        if (task.status === TaskStatus.DONE && task.updatedAt) {
          const completionDate = new Date(task.updatedAt);
          return completionDate.getMonth() === monthIndex && completionDate.getFullYear() === year;
        }
        return false;
      }).length;
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Completed Tasks',
          data: completedTasksByMonth,
          borderColor: 'rgb(82, 196, 26)',
          backgroundColor: 'rgba(82, 196, 26, 0.5)',
          tension: 0.2,
        },
      ],
    };
  };
  
  // Tasks creation trend data for line chart
  const getTaskCreationTrendData = () => {
    // Create an array of months within the date range
    const months = [];
    let currentDate = new Date(dateRange[0]);
    
    while (currentDate <= dateRange[1]) {
      months.push(format(currentDate, 'MMM yyyy'));
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    
    // Count created tasks for each month
    const createdTasksByMonth = months.map(month => {
      const [monthName, yearStr] = month.split(' ');
      const year = parseInt(yearStr);
      const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(monthName);
      
      return filteredTasks.filter(task => {
        if (task.createdAt) {
          const creationDate = new Date(task.createdAt);
          return creationDate.getMonth() === monthIndex && creationDate.getFullYear() === year;
        }
        return false;
      }).length;
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Created Tasks',
          data: createdTasksByMonth,
          borderColor: 'rgb(24, 144, 255)',
          backgroundColor: 'rgba(24, 144, 255, 0.5)',
          tension: 0.2,
        },
      ],
    };
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };
  
  // Handle project selection change
  const handleProjectChange = (value: number | 'all') => {
    setSelectedProject(value);
  };
  
  // Handle date range change
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange([
        dates[0].toDate(),
        dates[1].toDate()
      ]);
    }
  };
  
  // Loading state
  const isLoading = projectsLoading || tasksLoading;
  
  // Statistics cards data
  const getStatisticsCards = () => {
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === TaskStatus.DONE).length;
    const inProgressTasks = filteredTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
    const urgentTasks = filteredTasks.filter(t => t.priority === TaskPriority.URGENT).length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return [
      {
        title: 'Total Tasks',
        value: totalTasks,
        icon: <BarChartOutlined />,
        color: '#1890ff',
      },
      {
        title: 'Completed Tasks',
        value: completedTasks,
        icon: <PieChartOutlined />,
        color: '#52c41a',
      },
      {
        title: 'Completion Rate',
        value: `${completionRate}%`,
        icon: <LineChartOutlined />,
        color: '#722ed1',
      },
      {
        title: 'Urgent Tasks',
        value: urgentTasks,
        icon: <CalendarOutlined />,
        color: '#ff4d4f',
      },
    ];
  };
  
  return (
    <PageContainer>
      <PageHeader 
        title="Statistics" 
        description="Track your progress and analyze your workflow"
      />
      
      <FilterContainer>
        <FilterGroup>
          <FilterLabel>Project:</FilterLabel>
          <StyledSelect
            value={selectedProject}
            onChange={handleProjectChange}
            loading={projectsLoading}
            style={{ width: 200 }}
          >
            <Select.Option value="all">All Projects</Select.Option>
            {projects.map(project => (
              <Select.Option key={project.id} value={project.id}>
                {project.name}
              </Select.Option>
            ))}
          </StyledSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Date Range:</FilterLabel>
          <RangePicker
            value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
            onChange={handleDateRangeChange}
          />
        </FilterGroup>
      </FilterContainer>
      
      {isLoading ? (
        <LoadingContainer>
          <Spin size="large" />
        </LoadingContainer>
      ) : (
        <>
          {filteredTasks.length === 0 ? (
            <EmptyContainer>
              <Empty 
                description="No data available for the selected filters" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </EmptyContainer>
          ) : (
            <>
              <StatsCardsContainer>
                <Row gutter={[16, 16]}>
                  {getStatisticsCards().map((stat, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                      <StatCard>
                        <StatIcon color={stat.color}>
                          {stat.icon}
                        </StatIcon>
                        <StatContent>
                          <StatValue>{stat.value}</StatValue>
                          <StatTitle>{stat.title}</StatTitle>
                        </StatContent>
                      </StatCard>
                    </Col>
                  ))}
                </Row>
              </StatsCardsContainer>
              
              <ChartsContainer>
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={12}>
                    <ChartCard title="Tasks by Status">
                      <ChartWrapper>
                        <Pie data={tasksByStatusData} options={chartOptions} />
                      </ChartWrapper>
                    </ChartCard>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <ChartCard title="Tasks by Priority">
                      <ChartWrapper>
                        <Bar data={tasksByPriorityData} options={chartOptions} />
                      </ChartWrapper>
                    </ChartCard>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <ChartCard title="Task Completion Trend">
                      <ChartWrapper>
                        <Line data={getTaskCompletionTrendData()} options={chartOptions} />
                      </ChartWrapper>
                    </ChartCard>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <ChartCard title="Task Creation Trend">
                      <ChartWrapper>
                        <Line data={getTaskCreationTrendData()} options={chartOptions} />
                      </ChartWrapper>
                    </ChartCard>
                  </Col>
                </Row>
              </ChartsContainer>
            </>
          )}
        </>
      )}
    </PageContainer>
  );
};

const PageContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FilterLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StyledSelect = styled(Select)`
  .ant-select-selector {
    border-color: ${({ theme }) => theme.colors.border.medium} !important;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`;

const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const StatsCardsContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatCard = styled(Card)`
  display: flex;
  align-items: center;
  height: 100%;
  
  .ant-card-body {
    display: flex;
    align-items: center;
    padding: ${({ theme }) => theme.spacing.md};
    width: 100%;
  }
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ color }) => `${color}20`};
  color: ${({ color }) => color};
  font-size: 24px;
  margin-right: ${({ theme }) => theme.spacing.md};
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ChartsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ChartCard = styled(Card)`
  height: 100%;
  
  .ant-card-head {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.weak};
  }
  
  .ant-card-head-title {
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: 600;
  }
  
  .ant-card-body {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const ChartWrapper = styled.div`
  height: 300px;
  position: relative;
`;

// Make sure to import dayjs for DatePicker
import dayjs from 'dayjs';

export default StatisticsPage;
