import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  Users, 
  Camera,
  Flag,
  BarChart3,
  Settings,
  Search,
  MoreHorizontal,
  Ban,
  CheckCircle,
  AlertTriangle,
  Eye,
  Trash2,
  Edit,
  TrendingUp,
  MapPin,
  Heart,
  MessageCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for admin dashboard
  const stats = [
    { title: 'Total Users', value: '12,548', change: '+12%', icon: Users, color: 'text-blue-600' },
    { title: 'Active Trips', value: '3,247', change: '+8%', icon: Camera, color: 'text-green-600' },
    { title: 'Reports', value: '23', change: '-15%', icon: Flag, color: 'text-red-600' },
    { title: 'Revenue', value: '$45,210', change: '+22%', icon: TrendingUp, color: 'text-purple-600' }
  ];

  const pendingReports = [
    {
      id: '1',
      type: 'Inappropriate Content',
      reportedBy: 'Sarah Johnson',
      targetUser: 'John Smith',
      content: 'Trip: "Party in Ibiza" - Contains inappropriate images',
      status: 'pending',
      createdAt: '2024-01-16',
      severity: 'high'
    },
    {
      id: '2',
      type: 'Spam',
      reportedBy: 'Mike Wilson',
      targetUser: 'Travel Bot',
      content: 'User posting multiple duplicate trip posts',
      status: 'pending',
      createdAt: '2024-01-16',
      severity: 'medium'
    },
    {
      id: '3',
      type: 'Fake Profile',
      reportedBy: 'Emma Davis',
      targetUser: 'Adventure Seeker',
      content: 'Profile using stolen photos from another traveler',
      status: 'pending',
      createdAt: '2024-01-15',
      severity: 'high'
    }
  ];

  const recentUsers = [
    {
      id: '1',
      name: 'Alex Martinez',
      email: 'alex@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      joinDate: '2024-01-15',
      tripsCount: 12,
      role: 'user'
    },
    {
      id: '2',
      name: 'Maria Rodriguez',
      email: 'maria@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      joinDate: '2024-01-14',
      tripsCount: 8,
      role: 'user'
    },
    {
      id: '3',
      name: 'David Kim',
      email: 'david@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'suspended',
      joinDate: '2024-01-13',
      tripsCount: 25,
      role: 'user'
    }
  ];

  const recentTrips = [
    {
      id: '1',
      title: 'Sunset in Santorini',
      author: 'Emma Wilson',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=100&h=100&fit=crop',
      status: 'approved',
      likes: 124,
      comments: 23,
      reports: 0,
      createdAt: '2024-01-16'
    },
    {
      id: '2',
      title: 'Tokyo Street Food Adventure',
      author: 'Marcus Chen',
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=100&h=100&fit=crop',
      status: 'pending',
      likes: 89,
      comments: 15,
      reports: 1,
      createdAt: '2024-01-16'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage users, content, and platform settings</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change} from last month</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-100`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Pending Reports</span>
                    <Badge variant="destructive">{pendingReports.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingReports.slice(0, 3).map((report) => (
                    <div key={report.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900">{report.type}</p>
                          <Badge className={getSeverityColor(report.severity)}>
                            {report.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{report.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Reported by {report.reportedBy} • {report.createdAt}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Reports
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm">New user registered: Alex Martinez</p>
                      <span className="text-xs text-gray-500">2 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm">Trip approved: "Sunset in Santorini"</p>
                      <span className="text-xs text-gray-500">15 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      <p className="text-sm">Report received: Inappropriate content</p>
                      <span className="text-xs text-gray-500">1 hour ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-sm">User suspended: John Smith</p>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>User Management</span>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input placeholder="Search users..." className="pl-10 w-64" />
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                              {user.status}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {user.tripsCount} trips • Joined {user.joinDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trips Tab */}
          <TabsContent value="trips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trip Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTrips.map((trip) => (
                    <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={trip.image}
                          alt={trip.title}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{trip.title}</p>
                          <p className="text-sm text-gray-600">by {trip.author}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Heart className="h-4 w-4 text-red-500" />
                              <span className="text-sm">{trip.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{trip.comments}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Flag className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{trip.reports}</span>
                            </div>
                            <Badge variant={trip.status === 'approved' ? 'default' : 'secondary'}>
                              {trip.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Content Reports</span>
                  <Badge variant="destructive">{pendingReports.length} Pending</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingReports.map((report) => (
                    <div key={report.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium">{report.type}</p>
                            <p className="text-sm text-gray-600">
                              Target: {report.targetUser} • Reported by: {report.reportedBy}
                            </p>
                          </div>
                        </div>
                        <Badge className={getSeverityColor(report.severity)}>
                          {report.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{report.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Reported on {report.createdAt}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button variant="outline" size="sm">
                            Dismiss
                          </Button>
                          <Button variant="destructive" size="sm">
                            Take Action
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
