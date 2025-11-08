import { Button, Card, Typography } from 'antd'

const repoUrl = 'https://github.com/dsk-labs/dsk-electron-react-project-manager'

export const CallToAction = () => (
  <section className="section">
    <Card className="cta-card" bordered={false}>
      <Typography.Title level={3}>Ready to explore the code?</Typography.Title>
      <Typography.Paragraph type="secondary">
        Clone the repository, run the seed scripts, and you will have a fully offline workspace in
        minutes. Contributions are welcome!
      </Typography.Paragraph>
      <Button type="primary" size="large" href={repoUrl} target="_blank">
        Star on GitHub
      </Button>
    </Card>
  </section>
)
