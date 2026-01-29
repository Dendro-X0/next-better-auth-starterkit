import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { TrustedDevice } from "@/lib/types/user"
import { Monitor, Smartphone, Tablet, Trash2 } from "lucide-react"

interface TrustedDevicesProps {
  devices: TrustedDevice[]
}

export function TrustedDevices({ devices }: TrustedDevicesProps) {
  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("Mobile")) return <Smartphone className="h-4 w-4" />
    if (userAgent.includes("Tablet")) return <Tablet className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  const formatLastUsed = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trusted Devices</CardTitle>
        <CardDescription>Manage devices that are trusted for two-factor authentication</CardDescription>
      </CardHeader>
      <CardContent>
        {devices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No trusted devices found</p>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getDeviceIcon(device.userAgent)}
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-sm text-muted-foreground">Last used {formatLastUsed(device.lastUsed)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Trusted</Badge>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
