import { Flex, Space, theme } from 'antd'
import { experienceDeck } from '../../data/site'
import { SectionHeading } from '../common/SectionHeading'
import { SectionShell } from '../common/SectionShell'
import { ExperienceCard } from './ExperienceCard'

interface ExperienceShowcaseProps {
  accent: string
}

export const ExperienceShowcase = ({ accent }: ExperienceShowcaseProps) => {
  const { token } = theme.useToken()

  return (
    <SectionShell motionKey="showcase">
      <Flex vertical gap="large" style={{ width: '100%' }}>
        <SectionHeading title="Delivery tapestries" accent={accent} />
        <Space direction="vertical" size={token.marginXXL} style={{ width: '100%' }}>
          {experienceDeck.map((experience, index) => (
            <ExperienceCard
              key={experience.title}
              accent={accent}
              entry={experience}
              reverse={index % 2 !== 0}
            />
          ))}
        </Space>
      </Flex>
    </SectionShell>
  )
}
