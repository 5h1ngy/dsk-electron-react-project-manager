import { Avatar, Space, Typography } from "antd"
import type { JSX } from "react"

interface UserIdentityProps {
  displayName: string
  username: string
}

const colors = ["#9254de", "#fa8c16", "#13c2c2", "#f759ab"]

const getInitials = (name: string): string => {
  const parts = name.trim().split(" ")
  if (parts.length === 1) {
    return parts[0]?.[0]?.toUpperCase() ?? ""
  }
  return `${parts[0]?.[0] ?? ""}${parts[parts.length - 1]?.[0] ?? ""}`.toUpperCase()
}

const pickColor = (text: string): string => {
  const sum = [...text].reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0)
  return colors[sum % colors.length]
}

export const UserIdentity = ({ displayName, username }: UserIdentityProps): JSX.Element => (
  <Space direction="vertical" size={0}>
    <Space align="center" size={8}>
      <Avatar style={{ backgroundColor: pickColor(displayName), color: "#fff" }}>
        {getInitials(displayName)}
      </Avatar>
      <Typography.Text strong>{displayName}</Typography.Text>
    </Space>
    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
      {username}
    </Typography.Text>
  </Space>
)

UserIdentity.displayName = "UserIdentity"
